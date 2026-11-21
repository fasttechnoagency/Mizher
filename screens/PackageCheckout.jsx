import React, { useState } from 'react';
import { useParams, Link } from '@/lib/router-compat';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Shield, CheckCircle2, Loader2 } from 'lucide-react';
import { formatPrice } from '@/lib/currency';
import PayPalButtons from '@/components/payment/PayPalButtons';

export default function PackageCheckout() {
  const { id } = useParams();
  const { t, isRTL, lang } = useLanguage();

  const { data: pkg, isLoading } = useQuery({
    queryKey: ['package', id],
    queryFn: () => base44.entities.TreatmentPackage.get(id),
    enabled: !!id,
  });

  const [form, setForm] = useState({ patient_name: '', patient_email: '', patient_phone: '', notes: '' });
  const [done, setDone] = useState(false);
  const updateForm = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto px-4 md:px-6 py-6 flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-6 h-6 text-teal-500 animate-spin" />
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="max-w-xl mx-auto px-4 md:px-6 py-12 text-center">
        <p className="text-muted-foreground mb-4">{t('noPackages')}</p>
        <Link to="/packages">
          <Button className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl">{t('backHome')}</Button>
        </Link>
      </div>
    );
  }

  const title = lang === 'ar' ? pkg.title_ar : pkg.title_en;
  const desc = lang === 'ar' ? pkg.description_ar : pkg.description_en;
  const inclusions = lang === 'ar' ? pkg.inclusions_ar : pkg.inclusions;
  const canPay = !!form.patient_name && !!form.patient_phone;

  if (done) {
    return (
      <div className="max-w-xl mx-auto px-4 py-10">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{isRTL ? 'تم تأكيد حجزك ودفعك!' : 'Booking & Payment Confirmed!'}</h2>
          <p className="text-muted-foreground text-sm mb-6">
            {isRTL
              ? `شكراً لك! سيتواصل معك فريقنا قريباً لإتمام باقة "${title}".`
              : `Thank you! Our team will contact you shortly to arrange your "${title}" package.`}
          </p>
          <Link to="/packages">
            <Button className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl px-8 h-11">
              {isRTL ? 'العودة إلى الباقات' : 'Back to Packages'}
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const PrevArrow = isRTL ? ChevronRight : ChevronLeft;

  return (
    <div className="max-w-xl mx-auto px-4 md:px-6 py-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Link to="/packages" className="inline-flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 mb-4">
          <PrevArrow className="w-4 h-4" />
          {t('specializedPackages')}
        </Link>

        {/* Package summary */}
        <div className="bg-card rounded-2xl overflow-hidden shadow-sm border border-teal-500/8 mb-5">
          {pkg.image_url && (
            <div className="h-40 overflow-hidden">
              <img src={pkg.image_url} alt={title} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-xl font-bold text-foreground">{title}</h1>
              <span className="text-lg font-bold text-teal-700 whitespace-nowrap">{formatPrice(pkg.price, lang)}</span>
            </div>
            {desc && <p className="text-sm text-muted-foreground">{desc}</p>}
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-medium">{pkg.rating || 4.5}</span>
              {pkg.hospital_name && <span className="text-xs text-muted-foreground ms-2">• {pkg.hospital_name}</span>}
            </div>
            {inclusions && inclusions.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {inclusions.map((item, i) => (
                  <span key={i} className="text-xs bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full border border-teal-100">
                    {item}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Patient details */}
        <div className="bg-card rounded-2xl p-5 shadow-sm border border-teal-500/8 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">{t('patientDetails')}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{t('detailsDesc')}</p>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>{t('fullName')} *</Label>
              <Input value={form.patient_name} onChange={(e) => updateForm('patient_name', e.target.value)} placeholder={t('yourName')} />
            </div>
            <div className="space-y-1.5">
              <Label>{t('phoneNumber')} *</Label>
              <Input value={form.patient_phone} onChange={(e) => updateForm('patient_phone', e.target.value)} placeholder="+962 7 ..." dir="ltr" />
            </div>
            <div className="space-y-1.5">
              <Label>{t('emailAddress')}</Label>
              <Input type="email" value={form.patient_email} onChange={(e) => updateForm('patient_email', e.target.value)} placeholder="email@example.com" dir="ltr" />
            </div>
          </div>
        </div>

        {/* PayPal payment */}
        <div className="bg-teal-50 rounded-2xl p-5 border border-teal-200 mt-5 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-foreground">{isRTL ? 'ادفع بأمان عبر PayPal' : 'Secure Payment via PayPal'}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {isRTL
                  ? 'أكمل حجزك ودفعتك بأمان عبر PayPal. يتم تأكيد الباقة بعد نجاح الدفع.'
                  : 'Complete your booking and payment securely via PayPal. Your package is confirmed once payment succeeds.'}
              </p>
            </div>
          </div>
          {canPay ? (
            <PayPalButtons
              context={{ type: 'package', package_id: pkg.id }}
              record={{
                patient_name: form.patient_name,
                patient_email: form.patient_email,
                patient_phone: form.patient_phone,
                notes: form.notes,
              }}
              source="/packages"
              onSuccess={() => setDone(true)}
            />
          ) : (
            <Button disabled className="w-full bg-teal-300 text-white rounded-xl h-12 font-semibold cursor-not-allowed">
              {isRTL ? 'أدخل الاسم ورقم الهاتف للدفع' : 'Enter name and phone to pay'}
            </Button>
          )}
          <p className="text-xs text-muted-foreground flex items-center gap-1 justify-center">
            <Shield className="w-3 h-3" />
            {t('dataProtected')}
          </p>
        </div>
      </motion.div>
    </div>
  );
}