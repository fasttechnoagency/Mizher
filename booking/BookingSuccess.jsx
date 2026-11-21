import React, { useEffect, useRef } from 'react';
import { Link } from '@/lib/router-compat';
import { useLanguage } from '@/lib/i18n';
import { CheckCircle2, Calendar, Clock, Stethoscope, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export default function BookingSuccess({ doctor, form }) {
  const { isRTL, lang, t } = useLanguage();
  const doctorName = lang === 'ar' ? doctor?.name_ar : doctor?.name_en;
  const specialty  = lang === 'ar' ? doctor?.specialty_ar : doctor?.specialty_en;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center text-center py-6"
    >
      {/* Success Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="w-24 h-24 rounded-full bg-teal-50 border-4 border-teal-200 flex items-center justify-center mb-6"
      >
        <CheckCircle2 className="w-12 h-12 text-teal-500" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="space-y-2 mb-8"
      >
        <h2 className="text-2xl font-bold text-foreground">
          {t('appointmentConfirmed')}
        </h2>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
          {`${t('appointmentConfirmed')} — ${form.patient_email || ''}`}
        </p>
      </motion.div>

      {/* Confirmation Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="w-full bg-card rounded-2xl border border-teal-100 shadow-sm overflow-hidden mb-6"
      >
        {/* Doctor banner */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-400 p-4 flex items-center gap-3">
          <img src={doctor?.photo_url} alt="" className="w-12 h-12 rounded-xl object-cover border-2 border-white/30" />
          <div className="text-start">
            <p className="font-semibold text-white">{doctorName}</p>
            <p className="text-teal-100 text-xs">{specialty}</p>
          </div>
        </div>

        {/* Details */}
        <div className="divide-y divide-teal-50">
          {[
            { icon: Calendar, labelKey: 'date', value: form.date ? format(new Date(form.date), 'EEEE, dd MMMM yyyy') : '—' },
            { icon: Clock, labelKey: 'time', value: form.time || '—' },
            { icon: Stethoscope, labelKey: 'patient', value: form.patient_name || '—' },
          ].map((row, i) => {
            const Icon = row.icon;
            return (
              <div key={i} className="flex items-center gap-3 px-4 py-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-teal-600" />
                </div>
                <span className="text-muted-foreground">{t(row.labelKey)}</span>
                <span className="ms-auto font-medium text-foreground">{row.value}</span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col sm:flex-row gap-3 w-full"
      >
        <Link to="/" className="flex-1">
          <Button variant="outline" className="w-full rounded-xl border-teal-200 text-teal-700 h-11 gap-2">
            <Home className="w-4 h-4" />
            {t('backHome')}
          </Button>
        </Link>
        <Link to="/doctors" className="flex-1">
          <Button className="w-full bg-teal-500 hover:bg-teal-600 text-white rounded-xl h-11 gap-2">
            <Stethoscope className="w-4 h-4" />
            {t('bookAnother')}
          </Button>
        </Link>
      </motion.div>
    </motion.div>
  );
}