import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n';
import { ChevronLeft, ChevronRight, Loader2, Building2, Star, MapPin, CheckCircle2, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Link, useParams } from '@/lib/router-compat';
import PayPalButtons from '@/components/payment/PayPalButtons';
import { formatPrice } from '@/lib/currency';


const SERVICE_TYPES = [
  { value: 'consultation', en: 'Consultation',  ar: 'استشارة'    },
  { value: 'checkup',      en: 'General Checkup',ar: 'فحص عام'   },
  { value: 'surgery',      en: 'Surgery',        ar: 'عملية جراحية'},
  { value: 'lab_test',     en: 'Lab Test',       ar: 'تحليل مخبري' },
  { value: 'imaging',      en: 'Imaging / X-Ray',ar: 'أشعة / تصوير'},
  { value: 'emergency',    en: 'Emergency',      ar: 'طوارئ'      },
];

const PAYMENT_METHODS = [
  { value: 'visa',               en: 'Visa',              ar: 'فيزا'         },
  { value: 'mastercard',         en: 'Mastercard',        ar: 'ماستركارد'    },
  { value: 'jordanian_wallet',   en: 'JoMoPay / eFawateercom', ar: 'محفظة أردنية' },
  { value: 'cash_on_delivery',   en: 'Pay at Hospital',   ar: 'الدفع في المستشفى' },
];

const TIME_SLOTS = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','12:00','13:00','13:30','14:00','14:30','15:00','15:30','16:00','17:00'];

function getDayList() {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }
  return days;
}

function formatDate(d) {
  return d.toISOString().split('T')[0];
}

const STEPS = [
  { en: 'Service', ar: 'الخدمة' },
  { en: 'Schedule', ar: 'الموعد' },
  { en: 'Details', ar: 'البيانات' },
  { en: 'Payment', ar: 'الدفع' },
];

export default function HospitalBooking() {
  const { isRTL, lang } = useLanguage();
  const { id: routeHospitalId } = useParams();
  const hospitalId = (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('hospital')) || routeHospitalId;
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    service_type: 'consultation',
    department: '',
    date: '',
    time: '',
    patient_name: '',
    patient_email: '',
    patient_phone: '',
    notes: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('visa');
  const sf = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const { data: hospital, isLoading } = useQuery({
    queryKey: ['hospital', hospitalId],
    queryFn: () => base44.entities.Hospital.filter({ id: hospitalId }).then(r => r[0]),
    enabled: !!hospitalId,
  });

  const canAdvance = () => {
    if (step === 0) return !!form.service_type;
    if (step === 1) return !!form.date && !!form.time;
    if (step === 2) return !!form.patient_name && !!form.patient_phone;
    return true;
  };

  const NextArrow = isRTL ? ChevronLeft : ChevronRight;
  const PrevArrow = isRTL ? ChevronRight : ChevronLeft;

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
    </div>
  );

  if (!hospital) return (
    <div className="text-center py-20 text-muted-foreground">
      {isRTL ? 'المستشفى غير موجود' : 'Hospital not found'}
    </div>
  );

  if (done) {
    return (
      <div className="max-w-xl mx-auto px-4 py-10">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{isRTL ? 'تم تأكيد حجزك!' : 'Booking Confirmed!'}</h2>
          <p className="text-muted-foreground text-sm mb-6">
            {isRTL ? `سيتواصل معك فريق ${lang === 'ar' ? hospital.name_ar : hospital.name_en} قريباً لتأكيد الموعد` : `The team at ${hospital.name_en} will contact you shortly to confirm`}
          </p>
          <div className="bg-card rounded-2xl border border-teal-100 p-5 text-start mb-6 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">{isRTL ? 'المستشفى' : 'Hospital'}</span><span className="font-medium">{lang === 'ar' ? hospital.name_ar : hospital.name_en}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">{isRTL ? 'الخدمة' : 'Service'}</span><span className="font-medium">{SERVICE_TYPES.find(s => s.value === form.service_type)?.[lang === 'ar' ? 'ar' : 'en']}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">{isRTL ? 'التاريخ' : 'Date'}</span><span className="font-medium">{form.date}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">{isRTL ? 'الوقت' : 'Time'}</span><span className="font-medium">{form.time}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">{isRTL ? 'المريض' : 'Patient'}</span><span className="font-medium">{form.patient_name}</span></div>
          </div>
          <Link to="/hospitals">
            <Button className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl px-8 h-11">
              {isRTL ? 'العودة إلى المستشفيات' : 'Back to Hospitals'}
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Hospital mini header */}
        <div className="flex items-center gap-3 mb-6 bg-card rounded-2xl border border-teal-100 p-4">
          <img src={hospital.photo_url || 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=80&q=80'}
            alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
          <div>
            <h2 className="font-bold text-base">{lang === 'ar' ? hospital.name_ar : hospital.name_en}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              {hospital.city && <span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{hospital.city}</span>}
              {hospital.rating && <span className="text-xs text-amber-500 flex items-center gap-1"><Star className="w-3 h-3 fill-current" />{hospital.rating}</span>}
            </div>
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-between mb-6 px-2">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-1.5 flex-1 last:flex-none">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                i < step ? 'bg-teal-500 text-white' : i === step ? 'bg-teal-600 text-white ring-4 ring-teal-500/20' : 'bg-muted text-muted-foreground'
              }`}>{i < step ? '✓' : i + 1}</div>
              <span className={`text-[11px] hidden sm:block ${i === step ? 'text-teal-600 font-semibold' : 'text-muted-foreground'}`}>
                {lang === 'ar' ? s.ar : s.en}
              </span>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-teal-500' : 'bg-muted'}`} />}
            </div>
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: isRTL ? -24 : 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRTL ? 24 : -24 }}
            transition={{ duration: 0.25 }}
            className="bg-card rounded-2xl p-5 border border-teal-500/8 min-h-[320px] mb-5"
          >
            {/* Step 0: Service */}
            {step === 0 && (
              <div className="space-y-4">
                <h3 className="font-bold">{isRTL ? 'اختر نوع الخدمة' : 'Select Service Type'}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {SERVICE_TYPES.map(s => (
                    <button key={s.value} onClick={() => sf('service_type', s.value)}
                      className={`p-3 rounded-xl border-2 text-sm font-medium text-start transition-all ${form.service_type === s.value ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-teal-100 hover:border-teal-300'}`}>
                      {lang === 'ar' ? s.ar : s.en}
                    </button>
                  ))}
                </div>
                {hospital.specialties?.length > 0 && (
                  <div className="space-y-1">
                    <Label className="text-sm">{isRTL ? 'القسم / التخصص (اختياري)' : 'Department / Specialty (optional)'}</Label>
                    <Select value={form.department} onValueChange={v => sf('department', v)}>
                      <SelectTrigger className="h-10 rounded-xl border-teal-100"><SelectValue placeholder={isRTL ? 'اختر القسم' : 'Select department'} /></SelectTrigger>
                      <SelectContent>
                        {hospital.specialties.map(sp => <SelectItem key={sp} value={sp}>{sp}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}

            {/* Step 1: Schedule */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="font-bold">{isRTL ? 'اختر التاريخ والوقت' : 'Choose Date & Time'}</h3>
                <div>
                  <Label className="text-sm mb-2 block">{isRTL ? 'التاريخ' : 'Date'}</Label>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {getDayList().map(d => {
                      const ds = formatDate(d);
                      const isSelected = form.date === ds;
                      return (
                        <button key={ds} onClick={() => sf('date', ds)}
                          className={`flex-shrink-0 flex flex-col items-center p-2.5 rounded-xl border-2 w-14 transition-all ${isSelected ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-teal-100 hover:border-teal-300'}`}>
                          <span className="text-[10px] font-medium">{d.toLocaleDateString(lang === 'ar' ? 'ar' : 'en', { weekday: 'short' })}</span>
                          <span className="text-lg font-bold leading-tight">{d.getDate()}</span>
                          <span className="text-[9px] text-muted-foreground">{d.toLocaleDateString(lang === 'ar' ? 'ar' : 'en', { month: 'short' })}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                {form.date && (
                  <div>
                    <Label className="text-sm mb-2 block">{isRTL ? 'الوقت' : 'Time'}</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {TIME_SLOTS.map(t => (
                        <button key={t} onClick={() => sf('time', t)}
                          className={`py-2 rounded-xl text-xs font-medium border-2 transition-all ${form.time === t ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-teal-100 hover:border-teal-300'}`}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Patient details */}
            {step === 2 && (
              <div className="space-y-3">
                <h3 className="font-bold">{isRTL ? 'بيانات المريض' : 'Patient Information'}</h3>
                {[
                  { k: 'patient_name',  lEn: 'Full Name *',     lAr: 'الاسم الكامل *',   type: 'text'  },
                  { k: 'patient_phone', lEn: 'Phone Number *',  lAr: 'رقم الهاتف *',     type: 'tel'   },
                  { k: 'patient_email', lEn: 'Email',           lAr: 'البريد الإلكتروني',type: 'email' },
                ].map(f => (
                  <div key={f.k} className="space-y-1">
                    <Label className="text-sm">{isRTL ? f.lAr : f.lEn}</Label>
                    <Input type={f.type} value={form[f.k]} onChange={e => sf(f.k, e.target.value)} className="h-10 rounded-xl border-teal-100" />
                  </div>
                ))}
                <div className="space-y-1">
                  <Label className="text-sm">{isRTL ? 'ملاحظات إضافية' : 'Additional Notes'}</Label>
                  <textarea value={form.notes} onChange={e => sf('notes', e.target.value)}
                    rows={3} className="w-full px-3 py-2 rounded-xl border border-teal-100 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-background"
                    placeholder={isRTL ? 'اذكر أي تفاصيل طبية مهمة...' : 'Any important medical details...'} />
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="font-bold">{isRTL ? 'تأكيد الحجز والدفع' : 'Confirm & Pay'}</h3>
                <div className="bg-teal-50 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">{isRTL ? 'المستشفى' : 'Hospital'}</span><span className="font-medium">{lang === 'ar' ? hospital.name_ar : hospital.name_en}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">{isRTL ? 'الخدمة' : 'Service'}</span><span className="font-medium">{SERVICE_TYPES.find(s => s.value === form.service_type)?.[lang === 'ar' ? 'ar' : 'en']}</span></div>
                  {form.department && <div className="flex justify-between"><span className="text-muted-foreground">{isRTL ? 'القسم' : 'Dept.'}</span><span className="font-medium">{form.department}</span></div>}
                  <div className="flex justify-between"><span className="text-muted-foreground">{isRTL ? 'التاريخ والوقت' : 'Date & Time'}</span><span className="font-medium">{form.date} {form.time}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">{isRTL ? 'المريض' : 'Patient'}</span><span className="font-medium">{form.patient_name}</span></div>
                  <div className="border-t border-teal-200 pt-2 flex justify-between font-bold text-teal-700">
                    <span>{isRTL ? 'الإجمالي' : 'Total'}</span>
                    <span>{formatPrice(hospital?.consultation_fee || 15, lang)}</span>
                  </div>
                </div>
                <PayPalButtons
                  context={{ type: 'hospital_booking', hospital_id: hospital?.id }}
                  record={{
                    hospital_id: hospital.id,
                    hospital_name_en: hospital.name_en,
                    hospital_name_ar: hospital.name_ar,
                    service_type: form.service_type,
                    department: form.department,
                    date: form.date,
                    time: form.time,
                    patient_name: form.patient_name,
                    patient_email: form.patient_email,
                    patient_phone: form.patient_phone,
                    notes: form.notes,
                  }}
                  source="/hospitals"
                  onSuccess={() => setDone(true)}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-3">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(s => s - 1)} className="flex-1 rounded-xl border-teal-200 text-teal-700 h-12 gap-2">
              <PrevArrow className="w-4 h-4" />
              {isRTL ? 'السابق' : 'Previous'}
            </Button>
          )}
          {step < STEPS.length - 1 && (
            <Button onClick={() => setStep(s => s + 1)} disabled={!canAdvance()}
              className="flex-1 bg-teal-500 hover:bg-teal-600 text-white rounded-xl h-12 gap-2 disabled:opacity-50">
              {isRTL ? 'التالي' : 'Next'}
              <NextArrow className="w-4 h-4" />
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}