import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

import StepIndicator    from '@/components/booking/StepIndicator';
import DoctorSelector   from '@/components/booking/DoctorSelector';
import ScheduleSelector from '@/components/booking/ScheduleSelector';
import PatientDetailsForm from '@/components/booking/PatientDetailsForm';
import PaymentAndConfirm  from '@/components/booking/PaymentAndConfirm';
import BookingSuccess     from '@/components/booking/BookingSuccess';
import PayPalButtons      from '@/components/payment/PayPalButtons';
import { getDoctorFee } from '@/lib/doctorFees';
import { toast } from 'sonner';

const TOTAL_STEPS = 3;

export default function Booking() {
  const { isRTL, t, lang } = useLanguage();
  const [step, setStep]     = useState(0); // 0=Schedule, 1=Details, 2=Payment
  const [done, setDone]     = useState(false);
  const [doctor, setDoctor] = useState(null);
  const [form, setForm]     = useState({
    consultation_type: 'message',
    date: '',
    time: '',
    patient_name: '',
    patient_email: '',
    patient_phone: '',
    notes: '',
  });
  // Pre-select doctor from query string (e.g. coming from DoctorProfile)
  const urlParams = new URLSearchParams(window.location.search);
  const preDocId  = urlParams.get('doctor');
  const preType   = urlParams.get('type');

  const { data: doctors = [] } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => base44.entities.Doctor.list('-rating', 30),
  });

  useEffect(() => {
    if (preDocId && doctors.length > 0) {
      const found = doctors.find(d => d.id === preDocId);
      if (found) { setDoctor(found); }
    }
  }, [preDocId, doctors]);

  useEffect(() => {
    if (preType && ['message', 'voice', 'video'].includes(preType)) {
      setForm(f => ({ ...f, consultation_type: preType }));
    }
  }, [preType]);

  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));



  // Validation per step (step 0=Schedule, 1=Details, 2=Payment)
  const canAdvance = () => {
    if (step === 0) return !!form.date && !!form.time;
    if (step === 1) return !!form.patient_name && !!form.patient_email && !!form.patient_phone;
    return true;
  };

  const NextArrow = isRTL ? ChevronLeft : ChevronRight;
  const PrevArrow = isRTL ? ChevronRight : ChevronLeft;

  if (done) {
    return (
      <div className="max-w-xl mx-auto px-4 md:px-6 py-6">
        <BookingSuccess doctor={doctor} form={form} />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 md:px-6 py-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">
            {t('bookAppointment2')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('bookingDesc')}
          </p>
        </div>

        {/* Step Indicator */}
        <StepIndicator currentStep={step} />

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: isRTL ? -24 : 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRTL ? 24 : -24 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="bg-card rounded-2xl p-5 md:p-6 shadow-sm border border-teal-500/8 min-h-[360px]"
          >
            {step === 0 && (
              <ScheduleSelector
                doctor={doctor}
                consultType={form.consultation_type}
                date={form.date}
                time={form.time}
                onConsultTypeChange={v => updateForm('consultation_type', v)}
                onDateChange={v => updateForm('date', v)}
                onTimeChange={v => updateForm('time', v)}
              />
            )}
            {step === 1 && (
              <PatientDetailsForm
                form={form}
                onChange={updateForm}
              />
            )}
            {step === 2 && (
              <div className="space-y-5">
                <PaymentAndConfirm
                  doctor={doctor}
                  form={form}
                />
                <div className="border-t border-teal-100 pt-4">
                  <p className="text-sm font-semibold text-foreground mb-3">{t('payNow') || 'Pay Now'}</p>
                  <PayPalButtons
                    context={{ type: 'doctor_consultation', doctor_id: doctor?.id, consultation_type: form.consultation_type }}
                    record={{
                      patient_name: form.patient_name,
                      patient_email: form.patient_email,
                      patient_phone: form.patient_phone,
                      doctor_id: doctor?.id,
                      consultation_type: form.consultation_type,
                      date: form.date,
                      time: form.time,
                      notes: form.notes,
                    }}
                    source="/booking"
                    onSuccess={() => setDone(true)}
                  />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-3 mt-5">
          {step > 0 && (
            <Button
              variant="outline"
              onClick={() => setStep(s => s - 1)}
              className="flex-1 rounded-xl border-teal-200 text-teal-700 h-12 gap-2"
            >
              <PrevArrow className="w-4 h-4" />
              {t('previous')}
            </Button>
          )}

          {step < TOTAL_STEPS - 1 && (
            <Button
              onClick={() => setStep(s => s + 1)}
              disabled={!canAdvance()}
              className="flex-1 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white rounded-xl h-12 gap-2"
            >
              {t('next')}
              <NextArrow className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Step hint */}
        <p className="text-center text-xs text-muted-foreground mt-3">
          {t('stepOf')} {step + 1} {t('of')} {TOTAL_STEPS}
        </p>
        {doctor && (
          <p className="text-center text-xs text-teal-600 mt-1 font-medium">
            {t('doctor')}: {lang === 'ar' ? (doctor.name_ar || doctor.name_en) : (doctor.name_en || doctor.name_ar)}
          </p>
        )}
      </motion.div>
    </div>
  );
}