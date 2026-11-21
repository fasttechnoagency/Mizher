export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          created_by: string | null
          created_by_id: string | null
          created_date: string
          facebook_posts: Json | null
          facebook_url: string | null
          id: string
          instagram_posts: Json | null
          instagram_url: string | null
          key: string | null
          updated_date: string
          youtube_posts: Json | null
          youtube_url: string | null
        }
        Insert: {
          created_by?: string | null
          created_by_id?: string | null
          created_date?: string
          facebook_posts?: Json | null
          facebook_url?: string | null
          id?: string
          instagram_posts?: Json | null
          instagram_url?: string | null
          key?: string | null
          updated_date?: string
          youtube_posts?: Json | null
          youtube_url?: string | null
        }
        Update: {
          created_by?: string | null
          created_by_id?: string | null
          created_date?: string
          facebook_posts?: Json | null
          facebook_url?: string | null
          id?: string
          instagram_posts?: Json | null
          instagram_url?: string | null
          key?: string | null
          updated_date?: string
          youtube_posts?: Json | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          booking_type: string | null
          consultation_type: string | null
          created_by: string | null
          created_by_id: string | null
          created_date: string
          date: string | null
          doctor_id: string | null
          id: string
          notes: string | null
          package_id: string | null
          patient_email: string | null
          patient_name: string | null
          patient_phone: string | null
          payment_method: string | null
          paypal_capture_id: string | null
          paypal_order_id: string | null
          status: string | null
          time: string | null
          total_amount: number | null
          updated_date: string
          video_room_url: string | null
        }
        Insert: {
          booking_type?: string | null
          consultation_type?: string | null
          created_by?: string | null
          created_by_id?: string | null
          created_date?: string
          date?: string | null
          doctor_id?: string | null
          id?: string
          notes?: string | null
          package_id?: string | null
          patient_email?: string | null
          patient_name?: string | null
          patient_phone?: string | null
          payment_method?: string | null
          paypal_capture_id?: string | null
          paypal_order_id?: string | null
          status?: string | null
          time?: string | null
          total_amount?: number | null
          updated_date?: string
          video_room_url?: string | null
        }
        Update: {
          booking_type?: string | null
          consultation_type?: string | null
          created_by?: string | null
          created_by_id?: string | null
          created_date?: string
          date?: string | null
          doctor_id?: string | null
          id?: string
          notes?: string | null
          package_id?: string | null
          patient_email?: string | null
          patient_name?: string | null
          patient_phone?: string | null
          payment_method?: string | null
          paypal_capture_id?: string | null
          paypal_order_id?: string | null
          status?: string | null
          time?: string | null
          total_amount?: number | null
          updated_date?: string
          video_room_url?: string | null
        }
        Relationships: []
      }
      community_comments: {
        Row: {
          author_name: string | null
          content: string | null
          created_by: string | null
          created_by_id: string | null
          created_date: string
          id: string
          post_id: string | null
          updated_date: string
        }
        Insert: {
          author_name?: string | null
          content?: string | null
          created_by?: string | null
          created_by_id?: string | null
          created_date?: string
          id?: string
          post_id?: string | null
          updated_date?: string
        }
        Update: {
          author_name?: string | null
          content?: string | null
          created_by?: string | null
          created_by_id?: string | null
          created_date?: string
          id?: string
          post_id?: string | null
          updated_date?: string
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          author_name: string | null
          author_photo: string | null
          author_specialty: string | null
          category: string | null
          comments_count: number | null
          content_ar: string | null
          content_en: string | null
          created_by: string | null
          created_by_id: string | null
          created_date: string
          id: string
          image_url: string | null
          is_verified_doctor: boolean | null
          liked_by: Json | null
          likes_count: number | null
          shares_count: number | null
          type: string | null
          updated_date: string
        }
        Insert: {
          author_name?: string | null
          author_photo?: string | null
          author_specialty?: string | null
          category?: string | null
          comments_count?: number | null
          content_ar?: string | null
          content_en?: string | null
          created_by?: string | null
          created_by_id?: string | null
          created_date?: string
          id?: string
          image_url?: string | null
          is_verified_doctor?: boolean | null
          liked_by?: Json | null
          likes_count?: number | null
          shares_count?: number | null
          type?: string | null
          updated_date?: string
        }
        Update: {
          author_name?: string | null
          author_photo?: string | null
          author_specialty?: string | null
          category?: string | null
          comments_count?: number | null
          content_ar?: string | null
          content_en?: string | null
          created_by?: string | null
          created_by_id?: string | null
          created_date?: string
          id?: string
          image_url?: string | null
          is_verified_doctor?: boolean | null
          liked_by?: Json | null
          likes_count?: number | null
          shares_count?: number | null
          type?: string | null
          updated_date?: string
        }
        Relationships: []
      }
      doctor_reviews: {
        Row: {
          comment: string | null
          created_by: string | null
          created_by_id: string | null
          created_date: string
          doctor_id: string | null
          id: string
          patient_name: string | null
          rating: number | null
          updated_date: string
        }
        Insert: {
          comment?: string | null
          created_by?: string | null
          created_by_id?: string | null
          created_date?: string
          doctor_id?: string | null
          id?: string
          patient_name?: string | null
          rating?: number | null
          updated_date?: string
        }
        Update: {
          comment?: string | null
          created_by?: string | null
          created_by_id?: string | null
          created_date?: string
          doctor_id?: string | null
          id?: string
          patient_name?: string | null
          rating?: number | null
          updated_date?: string
        }
        Relationships: []
      }
      doctors: {
        Row: {
          active_message: boolean | null
          active_video: boolean | null
          active_voice: boolean | null
          available_slots: Json | null
          available_today: boolean | null
          bio_ar: string | null
          bio_en: string | null
          clinic_address: string | null
          clinic_name_ar: string | null
          clinic_name_en: string | null
          consultation_fee: number | null
          created_by: string | null
          created_by_id: string | null
          created_date: string
          deletion_requested: boolean | null
          experience_years: number | null
          facebook_url: string | null
          fee_message: number | null
          fee_video: number | null
          fee_voice: number | null
          gender: string | null
          id: string
          instagram_url: string | null
          insurance_accepted: Json | null
          languages: Json | null
          license_number: string | null
          location_ar: string | null
          location_en: string | null
          maps_code: string | null
          name_ar: string | null
          name_en: string | null
          owner_user_id: string | null
          phone: string | null
          photo_url: string | null
          rating: number | null
          reviews_count: number | null
          services: Json | null
          specialties: Json | null
          specialty_ar: string | null
          specialty_en: string | null
          status: string | null
          updated_date: string
          verified: boolean | null
        }
        Insert: {
          active_message?: boolean | null
          active_video?: boolean | null
          active_voice?: boolean | null
          available_slots?: Json | null
          available_today?: boolean | null
          bio_ar?: string | null
          bio_en?: string | null
          clinic_address?: string | null
          clinic_name_ar?: string | null
          clinic_name_en?: string | null
          consultation_fee?: number | null
          created_by?: string | null
          created_by_id?: string | null
          created_date?: string
          deletion_requested?: boolean | null
          experience_years?: number | null
          facebook_url?: string | null
          fee_message?: number | null
          fee_video?: number | null
          fee_voice?: number | null
          gender?: string | null
          id?: string
          instagram_url?: string | null
          insurance_accepted?: Json | null
          languages?: Json | null
          license_number?: string | null
          location_ar?: string | null
          location_en?: string | null
          maps_code?: string | null
          name_ar?: string | null
          name_en?: string | null
          owner_user_id?: string | null
          phone?: string | null
          photo_url?: string | null
          rating?: number | null
          reviews_count?: number | null
          services?: Json | null
          specialties?: Json | null
          specialty_ar?: string | null
          specialty_en?: string | null
          status?: string | null
          updated_date?: string
          verified?: boolean | null
        }
        Update: {
          active_message?: boolean | null
          active_video?: boolean | null
          active_voice?: boolean | null
          available_slots?: Json | null
          available_today?: boolean | null
          bio_ar?: string | null
          bio_en?: string | null
          clinic_address?: string | null
          clinic_name_ar?: string | null
          clinic_name_en?: string | null
          consultation_fee?: number | null
          created_by?: string | null
          created_by_id?: string | null
          created_date?: string
          deletion_requested?: boolean | null
          experience_years?: number | null
          facebook_url?: string | null
          fee_message?: number | null
          fee_video?: number | null
          fee_voice?: number | null
          gender?: string | null
          id?: string
          instagram_url?: string | null
          insurance_accepted?: Json | null
          languages?: Json | null
          license_number?: string | null
          location_ar?: string | null
          location_en?: string | null
          maps_code?: string | null
          name_ar?: string | null
          name_en?: string | null
          owner_user_id?: string | null
          phone?: string | null
          photo_url?: string | null
          rating?: number | null
          reviews_count?: number | null
          services?: Json | null
          specialties?: Json | null
          specialty_ar?: string | null
          specialty_en?: string | null
          status?: string | null
          updated_date?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      hospital_bookings: {
        Row: {
          created_by: string | null
          created_by_id: string | null
          created_date: string
          date: string | null
          department: string | null
          hospital_id: string | null
          hospital_name_ar: string | null
          hospital_name_en: string | null
          id: string
          notes: string | null
          patient_email: string | null
          patient_name: string | null
          patient_phone: string | null
          payment_method: string | null
          paypal_capture_id: string | null
          paypal_order_id: string | null
          service_type: string | null
          status: string | null
          time: string | null
          total_amount: number | null
          updated_date: string
        }
        Insert: {
          created_by?: string | null
          created_by_id?: string | null
          created_date?: string
          date?: string | null
          department?: string | null
          hospital_id?: string | null
          hospital_name_ar?: string | null
          hospital_name_en?: string | null
          id?: string
          notes?: string | null
          patient_email?: string | null
          patient_name?: string | null
          patient_phone?: string | null
          payment_method?: string | null
          paypal_capture_id?: string | null
          paypal_order_id?: string | null
          service_type?: string | null
          status?: string | null
          time?: string | null
          total_amount?: number | null
          updated_date?: string
        }
        Update: {
          created_by?: string | null
          created_by_id?: string | null
          created_date?: string
          date?: string | null
          department?: string | null
          hospital_id?: string | null
          hospital_name_ar?: string | null
          hospital_name_en?: string | null
          id?: string
          notes?: string | null
          patient_email?: string | null
          patient_name?: string | null
          patient_phone?: string | null
          payment_method?: string | null
          paypal_capture_id?: string | null
          paypal_order_id?: string | null
          service_type?: string | null
          status?: string | null
          time?: string | null
          total_amount?: number | null
          updated_date?: string
        }
        Relationships: []
      }
      hospitals: {
        Row: {
          address_ar: string | null
          address_en: string | null
          beds_count: number | null
          city: string | null
          consultation_fee: number | null
          created_by: string | null
          created_by_id: string | null
          created_date: string
          deletion_requested: boolean | null
          description_ar: string | null
          description_en: string | null
          email: string | null
          established_year: number | null
          facebook_url: string | null
          featured: boolean | null
          id: string
          instagram_url: string | null
          insurance_accepted: Json | null
          maps_code: string | null
          name_ar: string | null
          name_en: string | null
          owner_user_id: string | null
          phone: string | null
          photo_url: string | null
          rating: number | null
          reviews_count: number | null
          services: Json | null
          specialties: Json | null
          status: string | null
          type: string | null
          updated_date: string
          verified: boolean | null
          website: string | null
        }
        Insert: {
          address_ar?: string | null
          address_en?: string | null
          beds_count?: number | null
          city?: string | null
          consultation_fee?: number | null
          created_by?: string | null
          created_by_id?: string | null
          created_date?: string
          deletion_requested?: boolean | null
          description_ar?: string | null
          description_en?: string | null
          email?: string | null
          established_year?: number | null
          facebook_url?: string | null
          featured?: boolean | null
          id?: string
          instagram_url?: string | null
          insurance_accepted?: Json | null
          maps_code?: string | null
          name_ar?: string | null
          name_en?: string | null
          owner_user_id?: string | null
          phone?: string | null
          photo_url?: string | null
          rating?: number | null
          reviews_count?: number | null
          services?: Json | null
          specialties?: Json | null
          status?: string | null
          type?: string | null
          updated_date?: string
          verified?: boolean | null
          website?: string | null
        }
        Update: {
          address_ar?: string | null
          address_en?: string | null
          beds_count?: number | null
          city?: string | null
          consultation_fee?: number | null
          created_by?: string | null
          created_by_id?: string | null
          created_date?: string
          deletion_requested?: boolean | null
          description_ar?: string | null
          description_en?: string | null
          email?: string | null
          established_year?: number | null
          facebook_url?: string | null
          featured?: boolean | null
          id?: string
          instagram_url?: string | null
          insurance_accepted?: Json | null
          maps_code?: string | null
          name_ar?: string | null
          name_en?: string | null
          owner_user_id?: string | null
          phone?: string | null
          photo_url?: string | null
          rating?: number | null
          reviews_count?: number | null
          services?: Json | null
          specialties?: Json | null
          status?: string | null
          type?: string | null
          updated_date?: string
          verified?: boolean | null
          website?: string | null
        }
        Relationships: []
      }
      labs: {
        Row: {
          address_ar: string | null
          address_en: string | null
          city: string | null
          consultation_fee: number | null
          created_by: string | null
          created_by_id: string | null
          created_date: string
          deletion_requested: boolean | null
          description_ar: string | null
          description_en: string | null
          email: string | null
          home_visit: boolean | null
          id: string
          insurance_accepted: Json | null
          maps_code: string | null
          name_ar: string | null
          name_en: string | null
          owner_user_id: string | null
          phone: string | null
          photo_url: string | null
          rating: number | null
          reviews_count: number | null
          services: Json | null
          status: string | null
          updated_date: string
          verified: boolean | null
          website: string | null
          working_hours: string | null
        }
        Insert: {
          address_ar?: string | null
          address_en?: string | null
          city?: string | null
          consultation_fee?: number | null
          created_by?: string | null
          created_by_id?: string | null
          created_date?: string
          deletion_requested?: boolean | null
          description_ar?: string | null
          description_en?: string | null
          email?: string | null
          home_visit?: boolean | null
          id?: string
          insurance_accepted?: Json | null
          maps_code?: string | null
          name_ar?: string | null
          name_en?: string | null
          owner_user_id?: string | null
          phone?: string | null
          photo_url?: string | null
          rating?: number | null
          reviews_count?: number | null
          services?: Json | null
          status?: string | null
          updated_date?: string
          verified?: boolean | null
          website?: string | null
          working_hours?: string | null
        }
        Update: {
          address_ar?: string | null
          address_en?: string | null
          city?: string | null
          consultation_fee?: number | null
          created_by?: string | null
          created_by_id?: string | null
          created_date?: string
          deletion_requested?: boolean | null
          description_ar?: string | null
          description_en?: string | null
          email?: string | null
          home_visit?: boolean | null
          id?: string
          insurance_accepted?: Json | null
          maps_code?: string | null
          name_ar?: string | null
          name_en?: string | null
          owner_user_id?: string | null
          phone?: string | null
          photo_url?: string | null
          rating?: number | null
          reviews_count?: number | null
          services?: Json | null
          status?: string | null
          updated_date?: string
          verified?: boolean | null
          website?: string | null
          working_hours?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string | null
          conversation_id: string | null
          created_by: string | null
          created_by_id: string | null
          created_date: string
          doctor_id: string | null
          id: string
          patient_id: string | null
          read: boolean | null
          sender_id: string | null
          sender_name: string | null
          sender_role: string | null
          updated_date: string
        }
        Insert: {
          content?: string | null
          conversation_id?: string | null
          created_by?: string | null
          created_by_id?: string | null
          created_date?: string
          doctor_id?: string | null
          id?: string
          patient_id?: string | null
          read?: boolean | null
          sender_id?: string | null
          sender_name?: string | null
          sender_role?: string | null
          updated_date?: string
        }
        Update: {
          content?: string | null
          conversation_id?: string | null
          created_by?: string | null
          created_by_id?: string | null
          created_date?: string
          doctor_id?: string | null
          id?: string
          patient_id?: string | null
          read?: boolean | null
          sender_id?: string | null
          sender_name?: string | null
          sender_role?: string | null
          updated_date?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          city: string | null
          created_by: string | null
          created_by_id: string | null
          created_date: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          delivery_address: string | null
          delivery_fee: number | null
          id: string
          items: Json | null
          notes: string | null
          payment_method: string | null
          paypal_capture_id: string | null
          paypal_order_id: string | null
          status: string | null
          subtotal: number | null
          total_amount: number | null
          updated_date: string
        }
        Insert: {
          city?: string | null
          created_by?: string | null
          created_by_id?: string | null
          created_date?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivery_address?: string | null
          delivery_fee?: number | null
          id?: string
          items?: Json | null
          notes?: string | null
          payment_method?: string | null
          paypal_capture_id?: string | null
          paypal_order_id?: string | null
          status?: string | null
          subtotal?: number | null
          total_amount?: number | null
          updated_date?: string
        }
        Update: {
          city?: string | null
          created_by?: string | null
          created_by_id?: string | null
          created_date?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivery_address?: string | null
          delivery_fee?: number | null
          id?: string
          items?: Json | null
          notes?: string | null
          payment_method?: string | null
          paypal_capture_id?: string | null
          paypal_order_id?: string | null
          status?: string | null
          subtotal?: number | null
          total_amount?: number | null
          updated_date?: string
        }
        Relationships: []
      }
      pending_payments: {
        Row: {
          amount: number | null
          capture_id: string | null
          checkout_type: string | null
          claim_at: string | null
          claim_token: string | null
          context: Json | null
          created_by: string | null
          created_by_id: string | null
          created_date: string
          currency: string | null
          fulfilled_record_id: string | null
          id: string
          paypal_order_id: string | null
          status: string | null
          updated_date: string
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          capture_id?: string | null
          checkout_type?: string | null
          claim_at?: string | null
          claim_token?: string | null
          context?: Json | null
          created_by?: string | null
          created_by_id?: string | null
          created_date?: string
          currency?: string | null
          fulfilled_record_id?: string | null
          id?: string
          paypal_order_id?: string | null
          status?: string | null
          updated_date?: string
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          capture_id?: string | null
          checkout_type?: string | null
          claim_at?: string | null
          claim_token?: string | null
          context?: Json | null
          created_by?: string | null
          created_by_id?: string | null
          created_date?: string
          currency?: string | null
          fulfilled_record_id?: string | null
          id?: string
          paypal_order_id?: string | null
          status?: string | null
          updated_date?: string
          user_id?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string | null
          created_by: string | null
          created_by_id: string | null
          created_date: string
          description_ar: string | null
          description_en: string | null
          doctor_recommended: boolean | null
          id: string
          image_url: string | null
          in_stock: boolean | null
          local_product: boolean | null
          name_ar: string | null
          name_en: string | null
          price: number | null
          rating: number | null
          recommended_by: string | null
          reviews_count: number | null
          updated_date: string
        }
        Insert: {
          category?: string | null
          created_by?: string | null
          created_by_id?: string | null
          created_date?: string
          description_ar?: string | null
          description_en?: string | null
          doctor_recommended?: boolean | null
          id?: string
          image_url?: string | null
          in_stock?: boolean | null
          local_product?: boolean | null
          name_ar?: string | null
          name_en?: string | null
          price?: number | null
          rating?: number | null
          recommended_by?: string | null
          reviews_count?: number | null
          updated_date?: string
        }
        Update: {
          category?: string | null
          created_by?: string | null
          created_by_id?: string | null
          created_date?: string
          description_ar?: string | null
          description_en?: string | null
          doctor_recommended?: boolean | null
          id?: string
          image_url?: string | null
          in_stock?: boolean | null
          local_product?: boolean | null
          name_ar?: string | null
          name_en?: string | null
          price?: number | null
          rating?: number | null
          recommended_by?: string | null
          reviews_count?: number | null
          updated_date?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_date: string
          data: Json
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_date: string
        }
        Insert: {
          created_date?: string
          data?: Json
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_date?: string
        }
        Update: {
          created_date?: string
          data?: Json
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_date?: string
        }
        Relationships: []
      }
      promo_banner_items: {
        Row: {
          created_by: string | null
          created_by_id: string | null
          created_date: string
          cta_ar: string | null
          cta_az: string | null
          cta_en: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          path: string | null
          sort_order: number | null
          updated_date: string
        }
        Insert: {
          created_by?: string | null
          created_by_id?: string | null
          created_date?: string
          cta_ar?: string | null
          cta_az?: string | null
          cta_en?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          path?: string | null
          sort_order?: number | null
          updated_date?: string
        }
        Update: {
          created_by?: string | null
          created_by_id?: string | null
          created_date?: string
          cta_ar?: string | null
          cta_az?: string | null
          cta_en?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          path?: string | null
          sort_order?: number | null
          updated_date?: string
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          code: string | null
          created_by: string | null
          created_by_id: string | null
          created_date: string
          discount_type: string | null
          discount_value: number | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          min_order_amount: number | null
          retailer_id: string | null
          updated_date: string
          uses_count: number | null
        }
        Insert: {
          code?: string | null
          created_by?: string | null
          created_by_id?: string | null
          created_date?: string
          discount_type?: string | null
          discount_value?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_order_amount?: number | null
          retailer_id?: string | null
          updated_date?: string
          uses_count?: number | null
        }
        Update: {
          code?: string | null
          created_by?: string | null
          created_by_id?: string | null
          created_date?: string
          discount_type?: string | null
          discount_value?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_order_amount?: number | null
          retailer_id?: string | null
          updated_date?: string
          uses_count?: number | null
        }
        Relationships: []
      }
      provider_credentials: {
        Row: {
          created_by: string | null
          created_by_id: string | null
          created_date: string
          credential_status: string | null
          id: string
          password: string | null
          provider_id: string | null
          provider_name: string | null
          provider_type: string | null
          redirect_path: string | null
          session_token: string | null
          session_tokens: Json | null
          updated_date: string
          username: string | null
        }
        Insert: {
          created_by?: string | null
          created_by_id?: string | null
          created_date?: string
          credential_status?: string | null
          id?: string
          password?: string | null
          provider_id?: string | null
          provider_name?: string | null
          provider_type?: string | null
          redirect_path?: string | null
          session_token?: string | null
          session_tokens?: Json | null
          updated_date?: string
          username?: string | null
        }
        Update: {
          created_by?: string | null
          created_by_id?: string | null
          created_date?: string
          credential_status?: string | null
          id?: string
          password?: string | null
          provider_id?: string | null
          provider_name?: string | null
          provider_type?: string | null
          redirect_path?: string | null
          session_token?: string | null
          session_tokens?: Json | null
          updated_date?: string
          username?: string | null
        }
        Relationships: []
      }
      retailer_products: {
        Row: {
          category: string | null
          created_by: string | null
          created_by_id: string | null
          created_date: string
          description_ar: string | null
          description_en: string | null
          doctor_recommended: boolean | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name_ar: string | null
          name_en: string | null
          original_price: number | null
          price: number | null
          rating: number | null
          requires_prescription: boolean | null
          retailer_id: string | null
          retailer_name_ar: string | null
          retailer_name_en: string | null
          reviews_count: number | null
          sku: string | null
          stock_quantity: number | null
          unit: string | null
          updated_date: string
        }
        Insert: {
          category?: string | null
          created_by?: string | null
          created_by_id?: string | null
          created_date?: string
          description_ar?: string | null
          description_en?: string | null
          doctor_recommended?: boolean | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name_ar?: string | null
          name_en?: string | null
          original_price?: number | null
          price?: number | null
          rating?: number | null
          requires_prescription?: boolean | null
          retailer_id?: string | null
          retailer_name_ar?: string | null
          retailer_name_en?: string | null
          reviews_count?: number | null
          sku?: string | null
          stock_quantity?: number | null
          unit?: string | null
          updated_date?: string
        }
        Update: {
          category?: string | null
          created_by?: string | null
          created_by_id?: string | null
          created_date?: string
          description_ar?: string | null
          description_en?: string | null
          doctor_recommended?: boolean | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name_ar?: string | null
          name_en?: string | null
          original_price?: number | null
          price?: number | null
          rating?: number | null
          requires_prescription?: boolean | null
          retailer_id?: string | null
          retailer_name_ar?: string | null
          retailer_name_en?: string | null
          reviews_count?: number | null
          sku?: string | null
          stock_quantity?: number | null
          unit?: string | null
          updated_date?: string
        }
        Relationships: []
      }
      retailers: {
        Row: {
          address_ar: string | null
          address_en: string | null
          city: string | null
          created_by: string | null
          created_by_id: string | null
          created_date: string
          deletion_requested: boolean | null
          delivery_fee: number | null
          delivery_fee_enabled: boolean | null
          description_ar: string | null
          description_en: string | null
          id: string
          license_number: string | null
          logo_url: string | null
          name_ar: string | null
          name_en: string | null
          owner_user_id: string | null
          phone: string | null
          rating: number | null
          status: string | null
          type: string | null
          updated_date: string
          verified: boolean | null
        }
        Insert: {
          address_ar?: string | null
          address_en?: string | null
          city?: string | null
          created_by?: string | null
          created_by_id?: string | null
          created_date?: string
          deletion_requested?: boolean | null
          delivery_fee?: number | null
          delivery_fee_enabled?: boolean | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          license_number?: string | null
          logo_url?: string | null
          name_ar?: string | null
          name_en?: string | null
          owner_user_id?: string | null
          phone?: string | null
          rating?: number | null
          status?: string | null
          type?: string | null
          updated_date?: string
          verified?: boolean | null
        }
        Update: {
          address_ar?: string | null
          address_en?: string | null
          city?: string | null
          created_by?: string | null
          created_by_id?: string | null
          created_date?: string
          deletion_requested?: boolean | null
          delivery_fee?: number | null
          delivery_fee_enabled?: boolean | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          license_number?: string | null
          logo_url?: string | null
          name_ar?: string | null
          name_en?: string | null
          owner_user_id?: string | null
          phone?: string | null
          rating?: number | null
          status?: string | null
          type?: string | null
          updated_date?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      treatment_packages: {
        Row: {
          category: string | null
          created_by: string | null
          created_by_id: string | null
          created_date: string
          description_ar: string | null
          description_en: string | null
          duration_days: number | null
          featured: boolean | null
          hospital_name: string | null
          id: string
          image_url: string | null
          inclusions: Json | null
          inclusions_ar: Json | null
          price: number | null
          rating: number | null
          title_ar: string | null
          title_en: string | null
          updated_date: string
        }
        Insert: {
          category?: string | null
          created_by?: string | null
          created_by_id?: string | null
          created_date?: string
          description_ar?: string | null
          description_en?: string | null
          duration_days?: number | null
          featured?: boolean | null
          hospital_name?: string | null
          id?: string
          image_url?: string | null
          inclusions?: Json | null
          inclusions_ar?: Json | null
          price?: number | null
          rating?: number | null
          title_ar?: string | null
          title_en?: string | null
          updated_date?: string
        }
        Update: {
          category?: string | null
          created_by?: string | null
          created_by_id?: string | null
          created_date?: string
          description_ar?: string | null
          description_en?: string | null
          duration_days?: number | null
          featured?: boolean | null
          hospital_name?: string | null
          id?: string
          image_url?: string | null
          inclusions?: Json | null
          inclusions_ar?: Json | null
          price?: number | null
          rating?: number | null
          title_ar?: string | null
          title_en?: string | null
          updated_date?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      user_accounts: {
        Row: {
          created_date: string | null
          email: string | null
          full_name: string | null
          id: string | null
          phone: string | null
          role: string | null
          updated_date: string | null
        }
        Insert: {
          created_date?: string | null
          email?: string | null
          full_name?: string | null
          id?: never
          phone?: string | null
          role?: never
          updated_date?: string | null
        }
        Update: {
          created_date?: string | null
          email?: string | null
          full_name?: string | null
          id?: never
          phone?: string | null
          role?: never
          updated_date?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
