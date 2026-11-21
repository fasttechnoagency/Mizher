import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n';
import { Stethoscope, AlertCircle, Loader2, Plus, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

import DoctorSidebar        from '@/components/doctor/DoctorSidebar';
import DirectMessages       from '@/components/messaging/DirectMessages';
import DoctorOverviewTab    from '@/components/doctor/DoctorOverviewTab';
import DoctorAppointmentsTab from '@/components/doctor/DoctorAppointmentsTab';
import DoctorVideoConsultationsTab from '@/components/doctor/DoctorVideoConsultationsTab';
import DoctorProfileTab     from '@/components/doctor/DoctorProfileTab';
import DoctorServicesTab    from '@/components/doctor/DoctorServicesTab';
import { getProviderSession, clearProviderSession } from '@/lib/useProviderSession';
import CredentialSetupStep from '@/components/provider/CredentialSetupStep';
import ProviderLandingScreen from '@/components/provider/ProviderLandingScreen';
import ProviderRegistrationPayment from '@/components/provider/ProviderRegistrationPayment';
import ProviderLoginInfoTab from '@/components/provider/ProviderLoginInfoTab';

const SPECIALTIES_LIST = ['Cardiology','Dermatology','Orthopedics','Neurology','Pediatrics','General Medicine','Dentistry','Ophthalmology','Oncology','Gynecology','Psychiatry','Aesthetic','Urology'];

export default function DoctorConsole() {
  const { isRTL } = useLanguage();
  const qc = useQueryClient();
  const [doctor, setDoctor] = useState(null);
  const [showCredentialSetup, setShowCredentialSetup] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [regForm, setRegForm] = useState({
    name_en: '', name_ar: '', specialty_en: '', specialty_ar: '',
    gender: 'male', phone: '', location_en: '', consultation_fee: '',
    experience_years: '', license_number: '', bio_en: '',
    services: [],
  });
  const [newService, setNewService] = useState('');
  const [pendingRegPayload, setPendingRegPayload] = useState(null);

  const providerSession = getProviderSession();
  const isProviderLogin = providerSession?.type === 'doctor' && !!providerSession?.id;

  const { data: myDoctors = [], isLoading } = useQuery({
    queryKey: ['my-doctor', providerSession?.id],
    queryFn: async () => {
      if (isProviderLogin) {
        const all = await base44.entities.Doctor.list();
        return all.filter(d => d.id === providerSession.id);
      }
      const user = await base44.auth.me();
      return base44.entities.Doctor.filter({ owner_user_id: user.id });
    },
  });

  useEffect(() => {
    if (myDoctors.length > 0) setDoctor(myDoctors[0]);
  }, [myDoctors]);

  // Only create the doctor profile once the registration fee payment succeeds
  const finalizeRegistrationMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      return base44.entities.Doctor.create({ ...data, owner_user_id: user.id, status: 'pending', available_today: true });
    },
    onSuccess: (r) => {
      setDoctor(r);
      qc.invalidateQueries(['my-doctor']);
      setShowCredentialSetup(true);
      toast.success(isRTL ? 'تم تسجيل ملفك الطبي بنجاح!' : 'Your doctor profile was submitted!');
    },
    onError: (err) => {
      toast.error(err?.message || (isRTL ? 'حدث خطأ أثناء التسجيل، حاول مرة أخرى' : 'Something went wrong while registering, please try again'));
    },
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['doctor-bookings', doctor?.id],
    queryFn: async () => {
      if (isProviderLogin) {
        const res = await base44.functions.invoke('getProviderBookings', { doctor_id: doctor.id, credential_id: providerSession?.credentialId, session_token: providerSession?.sessionToken });
        return res.data?.bookings || [];
      }
      return base44.entities.Booking.filter({ doctor_id: doctor.id });
    },
    enabled: !!doctor?.id,
    refetchInterval: 10000,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['doctor-messages', doctor?.id],
    queryFn: async () => {
      if (!doctor?.id) return [];
      return base44.entities.Message.filter({ doctor_id: doctor.id });
    },
    enabled: !!doctor?.id,
    refetchInterval: 10000,
  });

  const unreadMessages = messages.filter(m => !m.read && m.sender_id !== (providerSession?.id || myDoctors[0]?.owner_user_id)).length;

  useEffect(() => {
    if (!doctor?.id) return;
    const unsubscribe = base44.entities.Booking.subscribe(() => {
      qc.invalidateQueries(['doctor-bookings', doctor.id]);
    });
    return unsubscribe;
  }, [doctor?.id]);

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
    </div>
  );

  // ── REGISTRATION ──────────────────────────────────────────────────────────
  if (!doctor && isProviderLogin) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center text-muted-foreground">
        <Stethoscope className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No doctor profile linked to this account.</p>
        <p className="text-xs mt-1">Please contact the administrator to link your record.</p>
      </div>
    </div>
  );

  if (!doctor && showPayment) {
    return (
      <ProviderRegistrationPayment
        providerName={pendingRegPayload?.name_en}
        isRTL={isRTL}
        pendingPayload={pendingRegPayload}
        onSuccess={(payload) => finalizeRegistrationMutation.mutate(payload)}
      />
    );
  }

  if (!doctor && !showRegister) {
    return (
      <ProviderLandingScreen
        providerType="doctor"
        icon={<Stethoscope className="w-8 h-8 text-white" />}
        title={isRTL ? 'لوحة تحكم الطبيب' : 'Doctor Console'}
        subtitle={isRTL ? 'سجّل ملفك الطبي أو سجّل دخولك للوصول إلى لوحة التحكم' : 'Register your medical profile or log in to access your dashboard'}
        onRegister={() => setShowRegister(true)}
      />
    );
  }

  if (!doctor && showRegister) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => setShowRegister(false)} className="text-sm text-muted-foreground hover:text-teal-600 mb-6 inline-block">← Back</button>
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">{isRTL ? 'سجّل ملفك الطبي' : 'Register as a Doctor'}</h1>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              {isRTL ? 'أنشئ ملفك الطبي واستقبل المرضى ومواعيد الاستشارة مباشرةً' : 'Create your medical profile and start receiving patient appointment bookings directly'}
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-teal-100 p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { k: 'name_en',      lEn: 'Full Name (English) *', lAr: 'الاسم الكامل (إنجليزي) *' },
                { k: 'name_ar',      lEn: 'Full Name (Arabic) *',  lAr: 'الاسم الكامل (عربي) *', rtl: true },
                { k: 'phone',        lEn: 'Phone Number *',        lAr: 'رقم الهاتف *'          },
                { k: 'license_number', lEn: 'Medical License #',   lAr: 'رقم الترخيص الطبي'    },
                { k: 'location_en',  lEn: 'City / Area',           lAr: 'المدينة / المنطقة'     },
                { k: 'consultation_fee', lEn: 'Consultation Fee (JOD)', lAr: 'رسوم الاستشارة', type: 'number' },
                { k: 'experience_years', lEn: 'Years of Experience',   lAr: 'سنوات الخبرة',   type: 'number' },
              ].map(f => (
                <div key={f.k} className="space-y-1">
                  <Label className="text-sm">{isRTL ? f.lAr : f.lEn}</Label>
                  <Input type={f.type || 'text'} value={regForm[f.k]}
                    onChange={e => setRegForm(r => ({ ...r, [f.k]: e.target.value }))}
                    className="h-10 rounded-xl border-teal-100" dir={f.rtl ? 'rtl' : undefined} />
                </div>
              ))}

              <div className="space-y-1">
                <Label className="text-sm">{isRTL ? 'التخصص الرئيسي *' : 'Main Specialty *'}</Label>
                <Select value={regForm.specialty_en} onValueChange={v => setRegForm(r => ({ ...r, specialty_en: v }))}>
                  <SelectTrigger className="h-10 rounded-xl border-teal-100"><SelectValue placeholder={isRTL ? 'اختر التخصص' : 'Select specialty'} /></SelectTrigger>
                  <SelectContent>
                    {SPECIALTIES_LIST.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-sm">{isRTL ? 'الجنس *' : 'Gender *'}</Label>
                <Select value={regForm.gender} onValueChange={v => setRegForm(r => ({ ...r, gender: v }))}>
                  <SelectTrigger className="h-10 rounded-xl border-teal-100"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{isRTL ? 'ذكر' : 'Male'}</SelectItem>
                    <SelectItem value="female">{isRTL ? 'أنثى' : 'Female'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-sm">{isRTL ? 'نبذة مختصرة عنك (اختياري)' : 'Short Bio (optional)'}</Label>
              <textarea value={regForm.bio_en} onChange={e => setRegForm(r => ({ ...r, bio_en: e.target.value }))} rows={3}
                placeholder={isRTL ? 'اكتب نبذة مختصرة عن خبراتك...' : 'Brief description of your experience...'}
                className="w-full px-3 py-2 rounded-xl border border-teal-100 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-background" />
            </div>

            {/* Social Media */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-sm">{isRTL ? 'رابط إنستغرام (اختياري)' : 'Instagram URL (optional)'}</Label>
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  </span>
                  <Input value={regForm.instagram_url || ''} onChange={e => setRegForm(r => ({ ...r, instagram_url: e.target.value }))}
                    placeholder="https://instagram.com/..." className="h-10 rounded-xl border-teal-100 text-sm flex-1" />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-sm">{isRTL ? 'رابط فيسبوك (اختياري)' : 'Facebook URL (optional)'}</Label>
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-blue-600 flex-shrink-0 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </span>
                  <Input value={regForm.facebook_url || ''} onChange={e => setRegForm(r => ({ ...r, facebook_url: e.target.value }))}
                    placeholder="https://facebook.com/..." className="h-10 rounded-xl border-teal-100 text-sm flex-1" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">{isRTL ? 'الخدمات المقدمة (اختياري)' : 'Services Offered (optional)'}</Label>
              <div className="flex gap-2">
                <Input value={newService} onChange={e => setNewService(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && newService.trim()) { setRegForm(r => ({ ...r, services: [...(r.services||[]), newService.trim()] })); setNewService(''); }}}
                  placeholder={isRTL ? 'مثال: حجامة، تغذية...' : 'e.g. Cupping, Nutrition...'}
                  className="h-9 rounded-xl border-teal-100 text-sm flex-1" />
                <button type="button" onClick={() => { if (newService.trim()) { setRegForm(r => ({ ...r, services: [...(r.services||[]), newService.trim()] })); setNewService(''); }}}
                  className="h-9 w-9 flex items-center justify-center rounded-xl border border-teal-200 text-teal-600 hover:bg-teal-50">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {regForm.services?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {regForm.services.map(s => (
                    <span key={s} className="flex items-center gap-1 bg-cyan-50 text-cyan-700 text-xs px-2.5 py-1 rounded-full border border-cyan-100">
                      {s}
                      <button type="button" onClick={() => setRegForm(r => ({ ...r, services: r.services.filter(x => x !== s) }))}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {isRTL ? 'سيتم مراجعة ملفك الطبي خلال 24 ساعة. يمكنك إكمال ملفك وإضافة الأوقات المتاحة فور التسجيل.' : 'Your profile will be reviewed within 24 hours. You can complete your profile and add availability slots right away.'}
            </div>

            <Button onClick={() => {
              if (!regForm.name_en || !regForm.phone || !regForm.specialty_en) {
                toast.error(isRTL ? 'يرجى ملء الحقول المطلوبة' : 'Please fill required fields'); return;
              }
              setPendingRegPayload({
                ...regForm,
                consultation_fee: parseFloat(regForm.consultation_fee) || 25,
                experience_years: parseInt(regForm.experience_years) || 0,
              });
              setShowPayment(true);
            }}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white rounded-xl h-12 font-semibold">
              {isRTL ? 'تسجيل الملف الطبي' : 'Submit Profile'}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (showCredentialSetup && doctor) {
    return (
      <CredentialSetupStep
        providerType="doctor"
        providerId={doctor.id}
        providerName={doctor.name_en}
        onDone={() => setShowCredentialSetup(false)}
      />
    );
  }

  // ── CONSOLE DASHBOARD ─────────────────────────────────────────────────────
  const pendingCount = bookings.filter(b => b.status === 'pending').length;

  const handleLogout = () => { clearProviderSession(); window.location.href = '/login'; };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {isProviderLogin && (
        <div className="flex justify-end mb-3">
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1.5 text-red-500 border-red-200 hover:bg-red-50">
            <LogOut className="w-3.5 h-3.5" /> Logout
          </Button>
        </div>
      )}
      <div className="flex flex-col md:flex-row gap-5">
        <DoctorSidebar doctor={doctor} activeTab={activeTab} onTabChange={setActiveTab} pendingCount={pendingCount} unreadMessages={unreadMessages} />
        <main className="flex-1 min-w-0">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            {activeTab === 'overview'  && <DoctorOverviewTab doctor={doctor} bookings={bookings} />}
            {activeTab === 'bookings'  && <DoctorAppointmentsTab doctor={doctor} bookings={bookings} />}
            {activeTab === 'video'     && <DoctorVideoConsultationsTab bookings={bookings} />}
            {activeTab === 'messages'  && <div className="bg-card rounded-2xl border border-teal-100 overflow-hidden"><DirectMessages mode="doctor" doctorId={doctor?.id} /></div>}
            {activeTab === 'services'  && <DoctorServicesTab doctor={doctor} onUpdated={setDoctor} />}
            {activeTab === 'profile'   && <DoctorProfileTab doctor={doctor} onUpdated={setDoctor} />}
            {activeTab === 'login'     && <ProviderLoginInfoTab providerType="doctor" providerId={doctor.id} />}
          </motion.div>
        </main>
      </div>
    </div>
  );
}