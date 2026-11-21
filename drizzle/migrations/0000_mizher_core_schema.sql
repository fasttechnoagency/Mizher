CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  phone text,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_date timestamptz NOT NULL DEFAULT now(),
  updated_date timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());

CREATE OR REPLACE FUNCTION public.touch_updated_date()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_date = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_date();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''),
    NEW.raw_user_meta_data ->> 'phone'
  )
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE VIEW public.user_accounts WITH (security_invoker = true) AS
SELECT p.id::text AS id, p.email, p.full_name, p.phone, p.created_date, p.updated_date,
  CASE WHEN EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = p.id AND r.role = 'admin') THEN 'admin' ELSE 'user' END AS role
FROM public.profiles p;
GRANT SELECT ON public.user_accounts TO authenticated;
GRANT SELECT ON public.user_accounts TO service_role;

-- ===== Application tables =====
CREATE TABLE public.app_settings (
  id text PRIMARY KEY DEFAULT replace(gen_random_uuid()::text,'-',''),
  "key" text, "instagram_url" text, "facebook_url" text, "youtube_url" text,
  "instagram_posts" jsonb, "facebook_posts" jsonb, "youtube_posts" jsonb
);
CREATE TABLE public.bookings (
  id text PRIMARY KEY DEFAULT replace(gen_random_uuid()::text,'-',''),
  "patient_name" text, "patient_email" text, "patient_phone" text, "doctor_id" text, "package_id" text,
  "booking_type" text, "consultation_type" text, "date" text, "time" text, "total_amount" double precision,
  "payment_method" text, "status" text DEFAULT 'pending', "notes" text, "video_room_url" text,
  "paypal_order_id" text, "paypal_capture_id" text
);
CREATE TABLE public.community_comments (
  id text PRIMARY KEY DEFAULT replace(gen_random_uuid()::text,'-',''),
  "post_id" text, "author_name" text, "content" text
);
CREATE TABLE public.community_posts (
  id text PRIMARY KEY DEFAULT replace(gen_random_uuid()::text,'-',''),
  "author_name" text, "author_photo" text, "author_specialty" text, "type" text DEFAULT 'doctor_post',
  "content_en" text, "content_ar" text, "image_url" text, "likes_count" double precision DEFAULT 0,
  "liked_by" jsonb, "comments_count" double precision DEFAULT 0, "shares_count" double precision DEFAULT 0,
  "category" text, "is_verified_doctor" boolean DEFAULT false
);
CREATE TABLE public.doctors (
  id text PRIMARY KEY DEFAULT replace(gen_random_uuid()::text,'-',''),
  "name_en" text, "name_ar" text, "specialty_en" text, "specialty_ar" text, "bio_en" text, "bio_ar" text,
  "photo_url" text, "gender" text, "location_en" text, "location_ar" text, "consultation_fee" double precision,
  "rating" double precision, "reviews_count" double precision, "experience_years" double precision,
  "available_today" boolean DEFAULT true, "specialties" jsonb, "services" jsonb, "insurance_accepted" jsonb,
  "verified" boolean DEFAULT false, "owner_user_id" text, "status" text DEFAULT 'pending',
  "clinic_name_en" text, "clinic_name_ar" text, "clinic_address" text, "phone" text, "license_number" text,
  "languages" jsonb, "available_slots" jsonb, "instagram_url" text, "facebook_url" text, "maps_code" text,
  "active_message" boolean DEFAULT true, "active_voice" boolean DEFAULT true, "active_video" boolean DEFAULT true,
  "fee_message" double precision, "fee_voice" double precision, "fee_video" double precision,
  "deletion_requested" boolean DEFAULT false
);
CREATE TABLE public.doctor_reviews (
  id text PRIMARY KEY DEFAULT replace(gen_random_uuid()::text,'-',''),
  "doctor_id" text, "patient_name" text, "rating" double precision, "comment" text
);
CREATE TABLE public.hospitals (
  id text PRIMARY KEY DEFAULT replace(gen_random_uuid()::text,'-',''),
  "name_en" text, "name_ar" text, "description_en" text, "description_ar" text, "photo_url" text, "city" text,
  "address_en" text, "address_ar" text, "phone" text, "email" text, "website" text, "owner_user_id" text,
  "type" text DEFAULT 'private', "specialties" jsonb, "insurance_accepted" jsonb, "services" jsonb,
  "consultation_fee" double precision, "rating" double precision, "reviews_count" double precision DEFAULT 0,
  "beds_count" double precision, "established_year" double precision, "status" text DEFAULT 'pending',
  "verified" boolean DEFAULT false, "featured" boolean DEFAULT false, "instagram_url" text, "facebook_url" text,
  "maps_code" text, "deletion_requested" boolean DEFAULT false
);
CREATE TABLE public.hospital_bookings (
  id text PRIMARY KEY DEFAULT replace(gen_random_uuid()::text,'-',''),
  "hospital_id" text, "hospital_name_en" text, "hospital_name_ar" text, "patient_name" text, "patient_email" text,
  "patient_phone" text, "department" text, "service_type" text DEFAULT 'consultation', "date" text, "time" text,
  "notes" text, "total_amount" double precision, "payment_method" text, "status" text DEFAULT 'pending',
  "paypal_order_id" text, "paypal_capture_id" text
);
CREATE TABLE public.labs (
  id text PRIMARY KEY DEFAULT replace(gen_random_uuid()::text,'-',''),
  "name_en" text, "name_ar" text, "description_en" text, "description_ar" text, "photo_url" text, "city" text,
  "address_en" text, "address_ar" text, "phone" text, "email" text, "website" text, "owner_user_id" text,
  "maps_code" text, "services" jsonb, "working_hours" text, "home_visit" boolean DEFAULT false,
  "insurance_accepted" jsonb, "rating" double precision, "reviews_count" double precision DEFAULT 0,
  "consultation_fee" double precision, "status" text DEFAULT 'pending', "verified" boolean DEFAULT false,
  "deletion_requested" boolean DEFAULT false
);
CREATE TABLE public.messages (
  id text PRIMARY KEY DEFAULT replace(gen_random_uuid()::text,'-',''),
  "conversation_id" text, "doctor_id" text, "patient_id" text, "sender_id" text, "sender_name" text,
  "sender_role" text, "content" text, "read" boolean DEFAULT false
);
CREATE TABLE public.orders (
  id text PRIMARY KEY DEFAULT replace(gen_random_uuid()::text,'-',''),
  "customer_name" text, "customer_email" text, "customer_phone" text, "delivery_address" text, "city" text,
  "items" jsonb, "subtotal" double precision, "delivery_fee" double precision DEFAULT 2,
  "total_amount" double precision, "payment_method" text, "status" text DEFAULT 'pending', "notes" text,
  "paypal_order_id" text, "paypal_capture_id" text
);
CREATE TABLE public.pending_payments (
  id text PRIMARY KEY DEFAULT replace(gen_random_uuid()::text,'-',''),
  "paypal_order_id" text, "checkout_type" text, "user_id" text, "amount" double precision,
  "currency" text DEFAULT 'JOD', "context" jsonb, "status" text DEFAULT 'pending', "claim_token" text,
  "claim_at" timestamptz, "capture_id" text, "fulfilled_record_id" text
);
CREATE TABLE public.products (
  id text PRIMARY KEY DEFAULT replace(gen_random_uuid()::text,'-',''),
  "name_en" text, "name_ar" text, "description_en" text, "description_ar" text, "image_url" text,
  "price" double precision, "category" text, "rating" double precision, "reviews_count" double precision,
  "doctor_recommended" boolean DEFAULT false, "recommended_by" text, "local_product" boolean DEFAULT false,
  "in_stock" boolean DEFAULT true
);
CREATE TABLE public.promo_banner_items (
  id text PRIMARY KEY DEFAULT replace(gen_random_uuid()::text,'-',''),
  "sort_order" double precision DEFAULT 0, "image_url" text, "path" text DEFAULT '/doctors',
  "cta_en" text DEFAULT 'Learn More', "cta_ar" text DEFAULT 'اعرف أكثر', "cta_az" text DEFAULT 'Daha çox',
  "is_active" boolean DEFAULT true
);
CREATE TABLE public.promo_codes (
  id text PRIMARY KEY DEFAULT replace(gen_random_uuid()::text,'-',''),
  "retailer_id" text, "code" text, "discount_type" text DEFAULT 'percentage', "discount_value" double precision,
  "min_order_amount" double precision DEFAULT 0, "max_uses" double precision DEFAULT 0,
  "uses_count" double precision DEFAULT 0, "expires_at" text, "is_active" boolean DEFAULT true
);
CREATE TABLE public.provider_credentials (
  id text PRIMARY KEY DEFAULT replace(gen_random_uuid()::text,'-',''),
  "provider_type" text, "provider_id" text, "provider_name" text, "username" text, "password" text,
  "redirect_path" text DEFAULT '/', "credential_status" text DEFAULT 'pending_approval',
  "session_token" text, "session_tokens" jsonb
);
CREATE TABLE public.retailers (
  id text PRIMARY KEY DEFAULT replace(gen_random_uuid()::text,'-',''),
  "name_en" text, "name_ar" text, "type" text, "owner_user_id" text, "logo_url" text, "description_en" text,
  "description_ar" text, "phone" text, "address_en" text, "address_ar" text, "city" text, "license_number" text,
  "status" text DEFAULT 'pending', "rating" double precision, "verified" boolean DEFAULT false,
  "delivery_fee_enabled" boolean DEFAULT false, "delivery_fee" double precision DEFAULT 0,
  "deletion_requested" boolean DEFAULT false
);
CREATE TABLE public.retailer_products (
  id text PRIMARY KEY DEFAULT replace(gen_random_uuid()::text,'-',''),
  "retailer_id" text, "retailer_name_en" text, "retailer_name_ar" text, "name_en" text, "name_ar" text,
  "description_en" text, "description_ar" text, "image_url" text, "price" double precision,
  "original_price" double precision, "category" text, "sku" text, "stock_quantity" double precision DEFAULT 0,
  "unit" text, "requires_prescription" boolean DEFAULT false, "doctor_recommended" boolean DEFAULT false,
  "is_active" boolean DEFAULT true, "rating" double precision, "reviews_count" double precision DEFAULT 0
);
CREATE TABLE public.treatment_packages (
  id text PRIMARY KEY DEFAULT replace(gen_random_uuid()::text,'-',''),
  "title_en" text, "title_ar" text, "description_en" text, "description_ar" text, "image_url" text,
  "price" double precision, "category" text, "duration_days" double precision, "inclusions" jsonb,
  "inclusions_ar" jsonb, "hospital_name" text, "rating" double precision, "featured" boolean DEFAULT false
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_settings, public.bookings, public.community_comments, public.community_posts, public.doctors, public.doctor_reviews, public.hospitals, public.hospital_bookings, public.labs, public.messages, public.orders, public.pending_payments, public.products, public.promo_banner_items, public.promo_codes, public.provider_credentials, public.retailers, public.retailer_products, public.treatment_packages TO authenticated;
GRANT ALL ON public.app_settings, public.bookings, public.community_comments, public.community_posts, public.doctors, public.doctor_reviews, public.hospitals, public.hospital_bookings, public.labs, public.messages, public.orders, public.pending_payments, public.products, public.promo_banner_items, public.promo_codes, public.provider_credentials, public.retailers, public.retailer_products, public.treatment_packages TO service_role;
GRANT SELECT ON public.app_settings, public.community_comments, public.community_posts, public.doctors, public.doctor_reviews, public.hospitals, public.labs, public.products, public.promo_banner_items, public.retailers, public.retailer_products, public.treatment_packages TO anon;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['app_settings','bookings','community_comments','community_posts','doctors','doctor_reviews','hospitals','hospital_bookings','labs','messages','orders','pending_payments','products','promo_banner_items','promo_codes','provider_credentials','retailers','retailer_products','treatment_packages'] LOOP
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN created_date timestamptz NOT NULL DEFAULT now(), ADD COLUMN updated_date timestamptz NOT NULL DEFAULT now(), ADD COLUMN created_by text DEFAULT (auth.jwt() ->> %L), ADD COLUMN created_by_id uuid DEFAULT auth.uid()', t, 'email');
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.touch_updated_date()', t || '_touch', t);
  END LOOP;

  FOREACH t IN ARRAY ARRAY['app_settings','community_comments','community_posts','doctors','doctor_reviews','hospitals','labs','products','promo_banner_items','retailers','retailer_products','treatment_packages'] LOOP
    EXECUTE format('CREATE POLICY "Public read" ON public.%I FOR SELECT TO anon, authenticated USING (true)', t);
  END LOOP;

  FOREACH t IN ARRAY ARRAY['app_settings','products','promo_banner_items','retailer_products','treatment_packages','promo_codes','provider_credentials'] LOOP
    EXECUTE format('CREATE POLICY "Admin insert" ON public.%I FOR INSERT TO authenticated WITH CHECK (public.is_admin())', t);
    EXECUTE format('CREATE POLICY "Admin update" ON public.%I FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin())', t);
    EXECUTE format('CREATE POLICY "Admin delete" ON public.%I FOR DELETE TO authenticated USING (public.is_admin())', t);
  END LOOP;

  FOREACH t IN ARRAY ARRAY['doctors','labs','retailers'] LOOP
    EXECUTE format('CREATE POLICY "Owner insert" ON public.%I FOR INSERT TO authenticated WITH CHECK (owner_user_id = auth.uid()::text)', t);
    EXECUTE format('CREATE POLICY "Owner or admin update" ON public.%I FOR UPDATE TO authenticated USING (owner_user_id = auth.uid()::text OR public.is_admin()) WITH CHECK (owner_user_id = auth.uid()::text OR public.is_admin())', t);
    EXECUTE format('CREATE POLICY "Admin delete" ON public.%I FOR DELETE TO authenticated USING (public.is_admin())', t);
  END LOOP;
END $$;

CREATE POLICY "Signed-in insert" ON public.hospitals FOR INSERT TO authenticated WITH CHECK (created_by_id = auth.uid());
CREATE POLICY "Owner or admin update" ON public.hospitals FOR UPDATE TO authenticated USING (owner_user_id = auth.uid()::text OR public.is_admin()) WITH CHECK (owner_user_id = auth.uid()::text OR public.is_admin());
CREATE POLICY "Admin delete" ON public.hospitals FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "Own insert" ON public.community_posts FOR INSERT TO authenticated WITH CHECK (created_by_id = auth.uid());
CREATE POLICY "Own or admin update" ON public.community_posts FOR UPDATE TO authenticated USING (created_by_id = auth.uid() OR public.is_admin()) WITH CHECK (created_by_id = auth.uid() OR public.is_admin());
CREATE POLICY "Own or admin delete" ON public.community_posts FOR DELETE TO authenticated USING (created_by_id = auth.uid() OR public.is_admin());
CREATE POLICY "Own insert" ON public.community_comments FOR INSERT TO authenticated WITH CHECK (created_by_id = auth.uid());
CREATE POLICY "Own update" ON public.community_comments FOR UPDATE TO authenticated USING (created_by_id = auth.uid()) WITH CHECK (created_by_id = auth.uid());
CREATE POLICY "Own or admin delete" ON public.community_comments FOR DELETE TO authenticated USING (created_by_id = auth.uid() OR public.is_admin());

CREATE POLICY "Own insert" ON public.doctor_reviews FOR INSERT TO authenticated WITH CHECK (created_by_id = auth.uid());
CREATE POLICY "Own update" ON public.doctor_reviews FOR UPDATE TO authenticated USING (created_by_id = auth.uid()) WITH CHECK (created_by_id = auth.uid());
CREATE POLICY "Admin delete" ON public.doctor_reviews FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "Own insert" ON public.bookings FOR INSERT TO authenticated WITH CHECK (created_by_id = auth.uid());
CREATE POLICY "Own, doctor or admin read" ON public.bookings FOR SELECT TO authenticated USING (created_by_id = auth.uid() OR doctor_id = auth.uid()::text OR public.is_admin());
CREATE POLICY "Own, doctor or admin update" ON public.bookings FOR UPDATE TO authenticated USING (created_by_id = auth.uid() OR doctor_id = auth.uid()::text OR public.is_admin()) WITH CHECK (created_by_id = auth.uid() OR doctor_id = auth.uid()::text OR public.is_admin());
CREATE POLICY "Own or admin delete" ON public.bookings FOR DELETE TO authenticated USING (created_by_id = auth.uid() OR public.is_admin());

CREATE POLICY "Own insert" ON public.hospital_bookings FOR INSERT TO authenticated WITH CHECK (created_by_id = auth.uid());
CREATE POLICY "Own or admin read" ON public.hospital_bookings FOR SELECT TO authenticated USING (created_by_id = auth.uid() OR public.is_admin());
CREATE POLICY "Own or admin update" ON public.hospital_bookings FOR UPDATE TO authenticated USING (created_by_id = auth.uid() OR public.is_admin()) WITH CHECK (created_by_id = auth.uid() OR public.is_admin());
CREATE POLICY "Admin delete" ON public.hospital_bookings FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "Own insert" ON public.orders FOR INSERT TO authenticated WITH CHECK (created_by_id = auth.uid());
CREATE POLICY "Own or admin read" ON public.orders FOR SELECT TO authenticated USING (created_by_id = auth.uid() OR public.is_admin());
CREATE POLICY "Own or admin update" ON public.orders FOR UPDATE TO authenticated USING (created_by_id = auth.uid() OR public.is_admin()) WITH CHECK (created_by_id = auth.uid() OR public.is_admin());
CREATE POLICY "Own or admin delete" ON public.orders FOR DELETE TO authenticated USING (created_by_id = auth.uid() OR public.is_admin());

CREATE POLICY "Participant insert" ON public.messages FOR INSERT TO authenticated WITH CHECK (patient_id = auth.uid()::text OR doctor_id = auth.uid()::text OR public.is_admin());
CREATE POLICY "Participant read" ON public.messages FOR SELECT TO authenticated USING (patient_id = auth.uid()::text OR doctor_id = auth.uid()::text OR public.is_admin());
CREATE POLICY "Participant update" ON public.messages FOR UPDATE TO authenticated USING (patient_id = auth.uid()::text OR doctor_id = auth.uid()::text OR public.is_admin()) WITH CHECK (patient_id = auth.uid()::text OR doctor_id = auth.uid()::text OR public.is_admin());
CREATE POLICY "Admin delete" ON public.messages FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "Own insert" ON public.pending_payments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Own or admin read" ON public.pending_payments FOR SELECT TO authenticated USING (user_id = auth.uid()::text OR public.is_admin());
CREATE POLICY "Own or admin update" ON public.pending_payments FOR UPDATE TO authenticated USING (user_id = auth.uid()::text OR public.is_admin()) WITH CHECK (user_id = auth.uid()::text OR public.is_admin());
CREATE POLICY "Admin delete" ON public.pending_payments FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "Retailer owner or admin read" ON public.promo_codes FOR SELECT TO authenticated USING (
  public.is_admin() OR EXISTS (SELECT 1 FROM public.retailers r WHERE r.id = promo_codes.retailer_id AND r.owner_user_id = auth.uid()::text)
);

CREATE POLICY "Admin read" ON public.provider_credentials FOR SELECT TO authenticated USING (public.is_admin());

ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings, public.orders, public.messages;

CREATE POLICY "Signed-in users upload files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'uploads');
CREATE POLICY "Signed-in users read files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'uploads');