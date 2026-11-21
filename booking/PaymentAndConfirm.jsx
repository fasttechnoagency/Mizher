import React from 'react';
import { useLanguage } from '@/lib/i18n';
import { Shield, Star, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { getDoctorFee } from '@/lib/doctorFees';
import { formatPrice } from '@/lib/currency';

const CONSULT_LABEL_EN   = { message: 'Message Consultation', voice: 'Voice Call', video: 'Video Call' };
const CONSULT_LABEL_AR   = { message: 'استشارة نصية', voice: 'اتصال صوتي', video: 'مكالمة فيديو' };

export default function PaymentAndConfirm({ doctor, form }) {
  const { isRTL, lang, t } = useLanguage();
  const totalFee   = getDoctorFee(doctor, form.consultation_type);
  const doctorName = lang === 'ar' ? doctor?.name_ar : doctor?.name_en;
  const specialty  = lang === 'ar' ? doctor?.specialty_ar : doctor?.specialty_en;

  const summaryRows = [
    { labelKey: 'doctor',   value: doctorName },
    { labelKey: 'specialty', value: specialty  },
    { labelKey: 'date',     value: form.date  ? format(new Date(form.date), 'dd MMM yyyy') : '—' },
    { labelKey: 'time',     value: form.time  || '—' },
    { labelKey: 'consultationType', value: isRTL ? CONSULT_LABEL_AR[form.consultation_type] : CONSULT_LABEL_EN[form.consultation_type] },
    { labelKey: 'patient',  value: form.patient_name  || '—' },
    { labelKey: 'phoneNumber', value: form.patient_phone || '—' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">
          {t('paymentConfirm')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t('paymentConfirmDesc')}
        </p>
      </div>

      {/* Doctor mini card */}
      {doctor && (
        <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-xl border border-teal-100">
          <img src={doctor.photo_url} alt="" className="w-12 h-12 rounded-xl object-cover" />
          <div className="flex-1">
            <div className="flex items-center gap-1">
              <p className="font-semibold text-sm">{doctorName}</p>
              {doctor.verified && <Shield className="w-3.5 h-3.5 text-teal-500" />}
            </div>
            <p className="text-xs text-teal-600">{specialty}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-xs text-muted-foreground">{doctor.rating || 4.8}</span>
              {doctor.location_en && (
                <span className="text-xs text-muted-foreground flex items-center gap-0.5 ms-2">
                  <MapPin className="w-3 h-3" />
                  {lang === 'ar' ? doctor.location_ar : doctor.location_en}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Summary Table */}
      <div className="bg-muted/30 rounded-xl overflow-hidden border border-teal-100 divide-y divide-teal-50">
        {summaryRows.map((row, i) => (
          <div key={i} className="flex justify-between items-center px-4 py-2.5 text-sm">
            <span className="text-muted-foreground">{t(row.labelKey)}</span>
            <span className="font-medium text-foreground text-end max-w-[55%] truncate">{row.value}</span>
          </div>
        ))}
        <div className="flex justify-between items-center px-4 py-3 bg-teal-50 font-bold text-teal-700">
          <span>{t('totalAmount')}</span>
          <span className="text-lg">{formatPrice(totalFee, lang)}</span>
        </div>
      </div>

    </div>
  );
}