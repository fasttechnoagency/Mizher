import React, { useState } from 'react';
import { useParams, Link, useNavigate } from '@/lib/router-compat';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n';
import {
  Star, Shield, MapPin, Phone, Globe, ArrowLeft, ArrowRight,
  Building2, CalendarDays, ChevronRight, ChevronLeft,
  Loader2, CheckCircle2, X, ExternalLink
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice } from '@/lib/currency';

const TYPES = [
  { value: 'private',    en: 'Private Hospital',  ar: 'مستشفى خاص'   },
  { value: 'public',     en: 'Public Hospital',   ar: 'مستشفى حكومي'  },
  { value: 'specialist', en: 'Specialist Center', ar: 'مركز متخصص'   },
  { value: 'clinic',     en: 'Clinic',            ar: 'عيادة'         },
];

const SERVICE_TYPES = [
  { value: 'consultation', en: 'Consultation',    ar: 'استشارة'      },
  { value: 'checkup',      en: 'General Checkup', ar: 'فحص عام'      },
  { value: 'surgery',      en: 'Surgery',         ar: 'عملية جراحية' },
  { value: 'lab_test',     en: 'Lab Test',        ar: 'تحليل مخبري'  },
  { value: 'imaging',      en: 'Imaging / X-Ray', ar: 'أشعة / تصوير' },
  { value: 'emergency',    en: 'Emergency',       ar: 'طوارئ'        },
];

const PAYMENT_METHODS = [
  { value: 'visa',             en: 'Visa',               ar: 'فيزا'             },
  { value: 'mastercard',       en: 'Mastercard',          ar: 'ماستركارد'        },
  { value: 'jordanian_wallet', en: 'JoMoPay / eFawateercom', ar: 'محفظة أردنية' },
  { value: 'cash_on_delivery', en: 'Pay at Hospital',    ar: 'الدفع في المستشفى'},
];

const TIME_SLOTS = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','12:00','13:00','13:30','14:00','14:30','15:00','15:30','16:00','17:00'];

const STEPS = [
  { en: 'Service',  ar: 'الخدمة'  },
  { en: 'Schedule', ar: 'الموعد'  },
  { en: 'Details',  ar: 'البيانات'},
  { en: 'Payment',  ar: 'الدفع'   },
];

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
function formatDate(d) { return d.toISOString().split('T')[0]; }

function BookingModal({ hospital, isRTL, lang, onClose }) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    service_type: '',
    specialty: '',
    service: '',
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

  const bookingMutation = useMutation({
    mutationFn: (data) => base44.entities.HospitalBooking.create(data),
    onSuccess: () => setDone(true),
  });

  const canAdvance = () => {
    if (step === 0) return !!form.service_type;
    if (step === 1) return !!form.date && !!form.time;
    if (step === 2) return !!form.patient_name && !!form.patient_phone;
    return true;
  };

  const handleConfirm = () => {
    bookingMutation.mutate({
      hospital_id: hospital.id,
      hospital_name_en: hospital.name_en,
      hospital_name_ar: hospital.name_ar,
      service_type: form.service_type,
      department: form.specialty || form.service || form.department,
      date: form.date,
      time: form.time,
      patient_name: form.patient_name,
      patient_email: form.patient_email,
      patient_phone: form.patient_phone,
      notes: form.notes,
      total_amount: hospital?.consultation_fee || 15,
      payment_method: paymentMethod,
      status: 'pending',
    });
  };

  const NextArrow = isRTL ? ChevronLeft : ChevronRight;
  const PrevArrow = isRTL ? ChevronRight : ChevronLeft;

  if (done) {
    return (
      <div className="text-center py-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>
        <h3 className="text-xl font-bold mb-2">{isRTL ? 'تم تأكيد حجزك!' : 'Booking Confirmed!'}</h3>
        <p className="text-muted-foreground text-sm mb-5">
          {isRTL ? 'سيتواصل معك الفريق قريباً لتأكيد الموعد' : 'The team will contact you shortly to confirm your appointment'}
        </p>
        <div className="bg-teal-50 rounded-xl p-4 space-y-2 text-sm text-start mb-5">
          <div className="flex justify-between"><span className="text-muted-foreground">{isRTL ? 'الخدمة' : 'Service'}</span><span className="font-medium">{SERVICE_TYPES.find(s => s.value === form.service_type)?.[lang === 'ar' ? 'ar' : 'en']}</span></div>
          {(form.specialty || form.service) && <div className="flex justify-between"><span className="text-muted-foreground">{isRTL ? 'التخصص / الخدمة' : 'Specialty / Service'}</span><span className="font-medium">{form.specialty || form.service}</span></div>}
          <div className="flex justify-between"><span className="text-muted-foreground">{isRTL ? 'التاريخ' : 'Date'}</span><span className="font-medium">{form.date} {form.time}</span></div>
        </div>
        <Button onClick={onClose} className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl px-8 h-10">{isRTL ? 'إغلاق' : 'Close'}</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Step indicators */}
      <div className="flex items-center justify-between px-1">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-1 flex-1 last:flex-none">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 transition-all ${
              i < step ? 'bg-teal-500 text-white' : i === step ? 'bg-teal-600 text-white ring-4 ring-teal-500/20' : 'bg-muted text-muted-foreground'
            }`}>{i < step ? '✓' : i + 1}</div>
            <span className={`text-[10px] hidden sm:block ${i === step ? 'text-teal-600 font-semibold' : 'text-muted-foreground'}`}>
              {lang === 'ar' ? s.ar : s.en}
            </span>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-1 ${i < step ? 'bg-teal-500' : 'bg-muted'}`} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}
          className="bg-muted/30 rounded-2xl p-4 min-h-[260px]">

          {/* Step 0: Service + Specialty/Service */}
          {step === 0 && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm">{isRTL ? 'اختر نوع الخدمة' : 'Select Service Type'}</h3>
              <div className="grid grid-cols-2 gap-2">
                {SERVICE_TYPES.map(s => (
                  <button key={s.value} onClick={() => sf('service_type', s.value)}
                    className={`p-2.5 rounded-xl border-2 text-xs font-medium text-start transition-all ${form.service_type === s.value ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-border hover:border-teal-300 bg-card'}`}>
                    {lang === 'ar' ? s.ar : s.en}
                  </button>
                ))}
              </div>

              {/* Specialty picker (from hospital specialties) */}
              {hospital.specialties?.length > 0 && (
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">{isRTL ? 'القسم / التخصص' : 'Department / Specialty'}</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {hospital.specialties.map(sp => (
                      <button key={sp} onClick={() => sf('specialty', form.specialty === sp ? '' : sp)}
                        className={`text-xs px-3 py-1.5 rounded-full border-2 transition-all ${form.specialty === sp ? 'border-teal-500 bg-teal-50 text-teal-700 font-semibold' : 'border-border bg-card hover:border-teal-300'}`}>
                        {sp}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Service picker (from hospital services) */}
              {hospital.services?.length > 0 && (
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">{isRTL ? 'الخدمة المطلوبة' : 'Specific Service'}</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {hospital.services.map(sv => (
                      <button key={sv} onClick={() => sf('service', form.service === sv ? '' : sv)}
                        className={`text-xs px-3 py-1.5 rounded-full border-2 transition-all ${form.service === sv ? 'border-cyan-500 bg-cyan-50 text-cyan-700 font-semibold' : 'border-border bg-card hover:border-cyan-300'}`}>
                        {sv}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 1: Schedule */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm">{isRTL ? 'اختر التاريخ والوقت' : 'Choose Date & Time'}</h3>
              <div>
                <Label className="text-xs mb-2 block">{isRTL ? 'التاريخ' : 'Date'}</Label>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {getDayList().map(d => {
                    const ds = formatDate(d);
                    const sel = form.date === ds;
                    return (
                      <button key={ds} onClick={() => sf('date', ds)}
                        className={`flex-shrink-0 flex flex-col items-center p-2 rounded-xl border-2 w-12 transition-all ${sel ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-border bg-card hover:border-teal-300'}`}>
                        <span className="text-[9px] font-medium">{d.toLocaleDateString(lang === 'ar' ? 'ar' : 'en', { weekday: 'short' })}</span>
                        <span className="text-base font-bold leading-tight">{d.getDate()}</span>
                        <span className="text-[8px] text-muted-foreground">{d.toLocaleDateString(lang === 'ar' ? 'ar' : 'en', { month: 'short' })}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              {form.date && (
                <div>
                  <Label className="text-xs mb-2 block">{isRTL ? 'الوقت' : 'Time'}</Label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {TIME_SLOTS.map(t => (
                      <button key={t} onClick={() => sf('time', t)}
                        className={`py-1.5 rounded-lg text-xs font-medium border-2 transition-all ${form.time === t ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-border bg-card hover:border-teal-300'}`}>
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
              <h3 className="font-bold text-sm">{isRTL ? 'بيانات المريض' : 'Patient Information'}</h3>
              {[
                { k: 'patient_name',  lEn: 'Full Name *',      lAr: 'الاسم الكامل *',    type: 'text'  },
                { k: 'patient_phone', lEn: 'Phone Number *',   lAr: 'رقم الهاتف *',      type: 'tel'   },
                { k: 'patient_email', lEn: 'Email',            lAr: 'البريد الإلكتروني', type: 'email' },
              ].map(f => (
                <div key={f.k} className="space-y-1">
                  <Label className="text-xs">{isRTL ? f.lAr : f.lEn}</Label>
                  <Input type={f.type} value={form[f.k]} onChange={e => sf(f.k, e.target.value)} className="h-9 rounded-xl border-teal-100 text-sm" />
                </div>
              ))}
              <div className="space-y-1">
                <Label className="text-xs">{isRTL ? 'ملاحظات' : 'Notes'}</Label>
                <textarea value={form.notes} onChange={e => sf('notes', e.target.value)} rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-teal-100 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-background"
                  placeholder={isRTL ? 'أي تفاصيل مهمة...' : 'Any important details...'} />
              </div>
            </div>
          )}

          {/* Step 3: Payment & Confirm */}
          {step === 3 && (
            <div className="space-y-3">
              <h3 className="font-bold text-sm">{isRTL ? 'تأكيد الحجز والدفع' : 'Confirm & Pay'}</h3>
              <div className="bg-teal-50 rounded-xl p-3 space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">{isRTL ? 'الخدمة' : 'Service'}</span><span className="font-medium">{SERVICE_TYPES.find(s => s.value === form.service_type)?.[lang === 'ar' ? 'ar' : 'en']}</span></div>
                {form.specialty && <div className="flex justify-between"><span className="text-muted-foreground">{isRTL ? 'التخصص' : 'Specialty'}</span><span className="font-medium">{form.specialty}</span></div>}
                {form.service && <div className="flex justify-between"><span className="text-muted-foreground">{isRTL ? 'الخدمة المحددة' : 'Specific Service'}</span><span className="font-medium">{form.service}</span></div>}
                <div className="flex justify-between"><span className="text-muted-foreground">{isRTL ? 'التاريخ والوقت' : 'Date & Time'}</span><span className="font-medium">{form.date} {form.time}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{isRTL ? 'المريض' : 'Patient'}</span><span className="font-medium">{form.patient_name}</span></div>
                <div className="border-t border-teal-200 pt-2 flex justify-between font-bold text-teal-700">
                  <span>{isRTL ? 'الإجمالي' : 'Total'}</span>
                  <span>{formatPrice(hospital?.consultation_fee || 15, lang)}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">{isRTL ? 'طريقة الدفع' : 'Payment Method'}</Label>
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_METHODS.map(p => (
                    <button key={p.value} onClick={() => setPaymentMethod(p.value)}
                      className={`p-2.5 rounded-xl border-2 text-xs font-medium transition-all ${paymentMethod === p.value ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-border bg-card hover:border-teal-300'}`}>
                      {lang === 'ar' ? p.ar : p.en}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-2">
        {step > 0 && (
          <Button variant="outline" onClick={() => setStep(s => s - 1)} className="flex-1 rounded-xl border-teal-200 text-teal-700 h-10 gap-1 text-sm">
            <PrevArrow className="w-4 h-4" />{isRTL ? 'السابق' : 'Previous'}
          </Button>
        )}
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep(s => s + 1)} disabled={!canAdvance()}
            className="flex-1 bg-teal-500 hover:bg-teal-600 text-white rounded-xl h-10 gap-1 text-sm disabled:opacity-50">
            {isRTL ? 'التالي' : 'Next'}<NextArrow className="w-4 h-4" />
          </Button>
        ) : (
          <Button onClick={handleConfirm} disabled={bookingMutation.isPending}
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-10 font-semibold text-sm">
            {bookingMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : (isRTL ? 'تأكيد الحجز' : 'Confirm Booking')}
          </Button>
        )}
      </div>
    </div>
  );
}

export default function HospitalProfile() {
  const { id } = useParams();
  const { lang, isRTL } = useLanguage();
  const navigate = useNavigate();
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;
  const [showBooking, setShowBooking] = useState(false);

  const { data: hospital, isLoading } = useQuery({
    queryKey: ['hospital', id],
    queryFn: async () => {
      const all = await base44.entities.Hospital.list();
      return all.find(h => h.id === id);
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-teal-50 rounded-2xl" />
          <div className="h-8 bg-teal-50 rounded w-1/3" />
          <div className="h-4 bg-teal-50 rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">{isRTL ? 'لم يتم العثور على المستشفى' : 'Hospital not found'}</p>
        <Link to="/hospitals">
          <Button variant="outline" className="mt-4">{isRTL ? 'رجوع' : 'Go Back'}</Button>
        </Link>
      </div>
    );
  }

  const name = lang === 'ar' ? hospital.name_ar : hospital.name_en;
  const desc = lang === 'ar' ? hospital.description_ar : hospital.description_en;
  const address = lang === 'ar' ? hospital.address_ar : hospital.address_en;
  const typeLabel = TYPES.find(t => t.value === hospital.type)?.[lang === 'ar' ? 'ar' : 'en'];

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 pb-32">
      <Link to="/hospitals" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-teal-600 mb-6">
        <BackArrow className="w-4 h-4" />
        {isRTL ? 'العودة للمستشفيات' : 'Back to Hospitals'}
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Header Card */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <div className="relative h-56 md:h-72 bg-teal-50">
            <img
              src={hospital.photo_url || `https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&q=80`}
              alt={name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            {hospital.verified && (
              <div className="absolute top-4 end-4 bg-teal-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />{isRTL ? 'موثّق' : 'Verified'}
              </div>
            )}
            {hospital.featured && (
              <div className="absolute top-4 start-4 bg-amber-400 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                {isRTL ? 'مميز' : 'Featured'}
              </div>
            )}
          </div>

          <div className="px-6 py-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-foreground">{name}</h1>
                  {hospital.verified && <Shield className="w-5 h-5 text-teal-500" />}
                </div>
                {typeLabel && (
                  <Badge className="bg-teal-50 text-teal-700 border-teal-100 rounded-full mb-3">{typeLabel}</Badge>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {hospital.city && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-teal-500" />
                      {hospital.city}{address ? `, ${address}` : ''}
                    </span>
                  )}
                  {hospital.phone && (
                    <a href={`tel:${hospital.phone}`} className="flex items-center gap-1.5 hover:text-teal-600">
                      <Phone className="w-4 h-4 text-teal-500" />{hospital.phone}
                    </a>
                  )}
                  {hospital.website && (
                    <a href={hospital.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-teal-600">
                      <Globe className="w-4 h-4 text-teal-500" />{isRTL ? 'الموقع الإلكتروني' : 'Website'}
                    </a>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                {hospital.rating && (
                  <div className="flex items-center gap-1.5 text-amber-500">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`w-4 h-4 ${s <= Math.round(hospital.rating) ? 'fill-current' : 'fill-gray-200 text-gray-200'}`} />
                    ))}
                    <span className="text-sm font-semibold text-foreground ms-1">{hospital.rating}</span>
                  </div>
                )}
                {hospital.consultation_fee && (
                  <p className="text-teal-600 font-bold text-lg">{formatPrice(hospital.consultation_fee, lang)}</p>
                )}
              </div>
            </div>

            {/* Social Links */}
            {(hospital.instagram_url || hospital.facebook_url) && (
              <div className="flex items-center gap-3 mt-4">
                {hospital.instagram_url && (
                  <a href={hospital.instagram_url} target="_blank" rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center hover:opacity-80 transition-opacity">
                    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="24" height="24" rx="6" fill="url(#igGradH)"/>
                      <defs><radialGradient id="igGradH" cx="30%" cy="107%" r="150%"><stop offset="0%" stopColor="#fdf497"/><stop offset="5%" stopColor="#fdf497"/><stop offset="45%" stopColor="#fd5949"/><stop offset="60%" stopColor="#d6249f"/><stop offset="90%" stopColor="#285AEB"/></radialGradient></defs>
                      <path d="M12 7.5A4.5 4.5 0 1 0 16.5 12 4.5 4.5 0 0 0 12 7.5Zm0 7.5a3 3 0 1 1 3-3 3 3 0 0 1-3 3Zm4.5-8.25a1.125 1.125 0 1 0 1.125 1.125A1.125 1.125 0 0 0 16.5 6.75Zm3 1.125A4.458 4.458 0 0 0 15.188 3.75h-6.376A4.458 4.458 0 0 0 4.5 8.063v5.874a4.458 4.458 0 0 0 4.312 4.313h5.376A4.458 4.458 0 0 0 18.5 13.937V8.063Zm-1.5 5.812a2.962 2.962 0 0 1-2.875 2.875H9.875A2.962 2.962 0 0 1 7 13.875V8.063a2.962 2.962 0 0 1 2.875-2.876h4.25A2.962 2.962 0 0 1 17 8.063Z" fill="white"/>
                    </svg>
                  </a>
                )}
                {hospital.facebook_url && (
                  <a href={hospital.facebook_url} target="_blank" rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center hover:opacity-80 transition-opacity">
                    <svg className="w-10 h-10" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <rect width="24" height="24" rx="6" fill="#1877F2"/>
                      <path d="M16.5 12H14v8h-3v-8H9V9.5h2V8c0-2 1-3.5 3.5-3.5H17V7h-1.5c-.8 0-1 .4-1 1v1.5H17L16.5 12Z" fill="white"/>
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {desc && (
          <div className="bg-card rounded-2xl p-6 shadow-sm border border-teal-500/5">
            <h2 className="text-lg font-bold text-foreground mb-3">{isRTL ? 'نبذة عن المستشفى' : 'About'}</h2>
            <p className="text-muted-foreground leading-relaxed">{desc}</p>
          </div>
        )}

        {/* Specialties */}
        {hospital.specialties?.length > 0 && (
          <div className="bg-card rounded-2xl p-6 shadow-sm border border-teal-500/5">
            <h2 className="text-lg font-bold text-foreground mb-3">{isRTL ? 'التخصصات والأقسام' : 'Specialties & Departments'}</h2>
            <div className="flex flex-wrap gap-2">
              {hospital.specialties.map((s, i) => (
                <Badge key={i} variant="secondary" className="bg-teal-50 text-teal-700 border-teal-100 rounded-full px-4 py-1">{s}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Services */}
        {hospital.services?.length > 0 && (
          <div className="bg-card rounded-2xl p-6 shadow-sm border border-teal-500/5">
            <h2 className="text-lg font-bold text-foreground mb-3">{isRTL ? 'الخدمات المتاحة' : 'Services Offered'}</h2>
            <div className="flex flex-wrap gap-2">
              {hospital.services.map((s, i) => (
                <span key={i} className="bg-cyan-50 text-cyan-700 border border-cyan-100 rounded-full px-4 py-1 text-sm font-medium">{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Google Maps Location */}
        {hospital.maps_code && (() => {
          const getEmbedUrl = (link) => {
            if (!link) return null;
            if (link.includes('/maps/embed')) return link;
            const coordMatch = link.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
            if (coordMatch) return `https://maps.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&z=16&output=embed`;
            const placeMatch = link.match(/\/place\/([^/@?]+)/);
            if (placeMatch) return `https://maps.google.com/maps?q=${encodeURIComponent(decodeURIComponent(placeMatch[1].replace(/\+/g, ' ')))}&output=embed`;
            return `https://maps.google.com/maps?q=${encodeURIComponent((hospital.address_en || hospital.name_en) + ' ' + (hospital.city || '') + ' Jordan')}&output=embed`;
          };
          return (
            <div className="bg-card rounded-2xl overflow-hidden shadow-sm border border-teal-500/5">
              <div className="p-4 flex items-center justify-between border-b border-teal-50">
                <h2 className="font-bold text-foreground">{isRTL ? 'الموقع على الخريطة' : 'Location on Map'}</h2>
                <a href={hospital.maps_code} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-teal-600 hover:underline">
                  <ExternalLink className="w-3.5 h-3.5" />
                  {isRTL ? 'فتح في خرائط جوجل' : 'Open in Google Maps'}
                </a>
              </div>
              <div className="h-64">
                <iframe src={getEmbedUrl(hospital.maps_code)} width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade" title={name} />
              </div>
            </div>
          );
        })()}

        {/* Insurance */}
        {hospital.insurance_accepted?.length > 0 && (
          <div className="bg-card rounded-2xl p-6 shadow-sm border border-teal-500/5">
            <h2 className="text-lg font-bold text-foreground mb-3">{isRTL ? 'التأمين المقبول' : 'Accepted Insurance'}</h2>
            <div className="flex flex-wrap gap-2">
              {hospital.insurance_accepted.map((ins, i) => (
                <span key={i} className="bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-4 py-1 text-sm font-medium">{ins}</span>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Floating Book Bar */}
      <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-auto md:w-[520px] md:mx-auto z-40">
        <AnimatePresence>
          {showBooking ? (
            <motion.div
              key="booking-panel"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
            >
              <div className="h-1.5 bg-teal-500" />
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-bold text-sm">{isRTL ? 'حجز موعد في' : 'Book at'} {lang === 'ar' ? hospital.name_ar : hospital.name_en}</p>
                    {hospital.consultation_fee && (
                      <p className="text-xs text-teal-600 font-medium">{isRTL ? 'الرسوم:' : 'Fee:'} {formatPrice(hospital.consultation_fee, lang)}</p>
                    )}
                  </div>
                  <button onClick={() => setShowBooking(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <BookingModal hospital={hospital} isRTL={isRTL} lang={lang} onClose={() => setShowBooking(false)} />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="book-btn"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
            >
              <div className="h-1.5 bg-teal-500" />
              <div className="p-3">
                <Button
                  onClick={() => setShowBooking(true)}
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white rounded-xl h-11 font-semibold gap-2"
                >
                  <CalendarDays className="w-4 h-4" />
                  {isRTL ? 'احجز موعداً' : 'Book an Appointment'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}