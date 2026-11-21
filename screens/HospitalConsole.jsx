import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n';
import { Building2, AlertCircle, Loader2, Plus, X, Save, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

import { getProviderSession, clearProviderSession } from '@/lib/useProviderSession';
import CredentialSetupStep from '@/components/provider/CredentialSetupStep';
import ProviderLandingScreen from '@/components/provider/ProviderLandingScreen';
import ProviderRegistrationPayment from '@/components/provider/ProviderRegistrationPayment';
import HospitalSidebar    from '@/components/hospital/HospitalSidebar';
import HospitalBookingsTab from '@/components/hospital/HospitalBookingsTab';
import HospitalSettingsTab from '@/components/hospital/HospitalSettingsTab';
import HospitalOverviewTab from '@/components/hospital/HospitalOverviewTab';
import HospitalServicesTab from '@/components/hospital/HospitalServicesTab';
import ProviderLoginInfoTab from '@/components/provider/ProviderLoginInfoTab';

const TYPES = [
  { value: 'private',    en: 'Private Hospital',    ar: 'مستشفى خاص'   },
  { value: 'public',     en: 'Public Hospital',     ar: 'مستشفى حكومي'  },
  { value: 'specialist', en: 'Specialist Center',   ar: 'مركز متخصص'   },
  { value: 'clinic',     en: 'Clinic',              ar: 'عيادة'         },
];

export default function HospitalConsole() {
  const { isRTL } = useLanguage();
  const qc = useQueryClient();
  const [hospital, setHospital] = useState(null);
  const [showCredentialSetup, setShowCredentialSetup] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [regForm, setRegForm] = useState({
    name_en: '', name_ar: '', type: 'private',
    phone: '', address_en: '', city: '',
    description_en: '', consultation_fee: '',
    instagram_url: '', facebook_url: '',
    specialties: [], services: [],
  });
  const [newSpecialty, setNewSpecialty] = useState('');
  const [pendingRegPayload, setPendingRegPayload] = useState(null);

  const providerSession = getProviderSession();
  const isProviderLogin = (providerSession?.type === 'hospital' || providerSession?.type === 'clinic') && !!providerSession?.id;

  const { data: myHospitals = [], isLoading } = useQuery({
    queryKey: ['my-hospital', providerSession?.id],
    queryFn: async () => {
      if (isProviderLogin) {
        const all = await base44.entities.Hospital.list();
        return all.filter(h => h.id === providerSession.id);
      }
      const user = await base44.auth.me();
      return base44.entities.Hospital.filter({ owner_user_id: user.id });
    },
  });

  useEffect(() => {
    if (myHospitals.length > 0) setHospital(myHospitals[0]);
  }, [myHospitals]);

  const { data: bookings = [] } = useQuery({
    queryKey: ['hospital-bookings', hospital?.id],
    queryFn: () => base44.entities.HospitalBooking.filter({ hospital_id: hospital.id }),
    enabled: !!hospital?.id,
  });

  // Only create the hospital profile once the registration fee payment succeeds
  const finalizeRegistrationMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      return base44.entities.Hospital.create({ ...data, owner_user_id: user.id, status: 'pending' });
    },
    onSuccess: (r) => {
      setHospital(r);
      qc.invalidateQueries(['my-hospital']);
      setShowCredentialSetup(true);
      toast.success(isRTL ? 'تم تسجيل المستشفى بنجاح!' : 'Hospital registered successfully!');
    },
    onError: (err) => {
      toast.error(err?.message || (isRTL ? 'حدث خطأ أثناء التسجيل، حاول مرة أخرى' : 'Something went wrong while registering, please try again'));
    },
  });

  const addSpecialty = () => {
    if (!newSpecialty.trim()) return;
    setRegForm(f => ({ ...f, specialties: [...(f.specialties || []), newSpecialty.trim()] }));
    setNewSpecialty('');
  };
  const removeSpecialty = (s) => setRegForm(f => ({ ...f, specialties: f.specialties.filter(x => x !== s) }));

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
    </div>
  );

  if (!hospital && isProviderLogin) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center text-muted-foreground">
        <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No hospital/clinic profile linked to this account.</p>
        <p className="text-xs mt-1">Please contact the administrator to link your record.</p>
      </div>
    </div>
  );

  // ── REGISTRATION ──
  if (!hospital && showPayment) {
    return (
      <ProviderRegistrationPayment
        providerName={pendingRegPayload?.name_en}
        isRTL={isRTL}
        pendingPayload={pendingRegPayload}
        onSuccess={(payload) => finalizeRegistrationMutation.mutate(payload)}
      />
    );
  }

  if (!hospital && !showRegister) {
    return (
      <ProviderLandingScreen
        providerType="hospital"
        icon={<Building2 className="w-8 h-8 text-white" />}
        title={isRTL ? 'لوحة تحكم المستشفى' : 'Hospital / Clinic Console'}
        subtitle={isRTL ? 'سجّل مستشفاك أو سجّل دخولك للوصول إلى لوحة التحكم' : 'Register your hospital or log in to access your dashboard'}
        onRegister={() => setShowRegister(true)}
      />
    );
  }

  if (!hospital && showRegister) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => setShowRegister(false)} className="text-sm text-muted-foreground hover:text-teal-600 mb-6 inline-block">← Back</button>
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">{isRTL ? 'سجّل مستشفاك أو مركزك الطبي' : 'Register Your Hospital or Medical Center'}</h1>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              {isRTL ? 'استقبل حجوزات مباشرة من المرضى وأدر مواعيدك بسهولة' : 'Receive patient bookings directly and manage your appointments easily'}
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-teal-100 p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { k: 'name_en', lEn: 'Hospital Name (English) *', lAr: 'اسم المستشفى (إنجليزي) *' },
                { k: 'name_ar', lEn: 'Hospital Name (Arabic) *',  lAr: 'اسم المستشفى (عربي) *', rtl: true },
                { k: 'phone',   lEn: 'Phone Number *',            lAr: 'رقم الهاتف *'           },
                { k: 'city',    lEn: 'City *',                    lAr: 'المدينة *'               },
                { k: 'address_en', lEn: 'Address',                lAr: 'العنوان'                 },
                { k: 'consultation_fee', lEn: 'Consultation Fee (JOD)', lAr: 'رسوم الاستشارة (دينار)', type: 'number' },
              ].map(f => (
                <div key={f.k} className="space-y-1">
                  <Label className="text-sm">{isRTL ? f.lAr : f.lEn}</Label>
                  <Input type={f.type || 'text'} value={regForm[f.k]}
                    onChange={e => setRegForm(r => ({ ...r, [f.k]: e.target.value }))}
                    className="h-10 rounded-xl border-teal-100" dir={f.rtl ? 'rtl' : undefined} />
                </div>
              ))}

              <div className="space-y-1">
                <Label className="text-sm">{isRTL ? 'نوع المنشأة *' : 'Facility Type *'}</Label>
                <Select value={regForm.type} onValueChange={v => setRegForm(r => ({ ...r, type: v }))}>
                  <SelectTrigger className="h-10 rounded-xl border-teal-100"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TYPES.map(t => <SelectItem key={t.value} value={t.value}>{isRTL ? t.ar : t.en}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-sm">{isRTL ? 'وصف المستشفى' : 'Hospital Description'}</Label>
              <Input value={regForm.description_en} onChange={e => setRegForm(r => ({ ...r, description_en: e.target.value }))}
                className="h-10 rounded-xl border-teal-100" placeholder={isRTL ? 'وصف مختصر...' : 'Brief description...'} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-sm">{isRTL ? 'رابط انستغرام' : 'Instagram URL'}</Label>
                <Input value={regForm.instagram_url} onChange={e => setRegForm(r => ({ ...r, instagram_url: e.target.value }))}
                  className="h-10 rounded-xl border-teal-100" placeholder="https://instagram.com/..." />
              </div>
              <div className="space-y-1">
                <Label className="text-sm">{isRTL ? 'رابط فيسبوك' : 'Facebook URL'}</Label>
                <Input value={regForm.facebook_url} onChange={e => setRegForm(r => ({ ...r, facebook_url: e.target.value }))}
                  className="h-10 rounded-xl border-teal-100" placeholder="https://facebook.com/..." />
              </div>
            </div>

            {/* Specialties */}
            <div className="space-y-2">
              <Label className="text-sm">{isRTL ? 'التخصصات والأقسام' : 'Specialties & Departments'}</Label>
              <div className="flex gap-2">
                <Input value={newSpecialty} onChange={e => setNewSpecialty(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addSpecialty()}
                  placeholder={isRTL ? 'مثال: قلب، عظام...' : 'e.g. Cardiology, Orthopedics...'}
                  className="h-9 rounded-xl border-teal-100 text-sm flex-1" />
                <Button onClick={addSpecialty} variant="outline" className="h-9 rounded-xl border-teal-200 text-teal-600 px-3">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {regForm.specialties?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {regForm.specialties.map(s => (
                    <span key={s} className="flex items-center gap-1 bg-teal-50 text-teal-700 text-xs px-2.5 py-1 rounded-full">
                      {s}
                      <button onClick={() => removeSpecialty(s)}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {isRTL ? 'سيتم مراجعة طلبك خلال 24 ساعة. يمكنك استلام الحجوزات فور الاعتماد.' : 'Your registration will be reviewed within 24 hours. Bookings start arriving once approved.'}
            </div>

            <Button onClick={() => {
              if (!regForm.name_en || !regForm.phone || !regForm.city) {
                toast.error(isRTL ? 'يرجى ملء الحقول المطلوبة' : 'Please fill required fields'); return;
              }
              setPendingRegPayload({ ...regForm, consultation_fee: parseFloat(regForm.consultation_fee) || 15 });
              setShowPayment(true);
            }}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white rounded-xl h-12 font-semibold">
              {isRTL ? 'تسجيل المستشفى' : 'Register Hospital'}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (showCredentialSetup && hospital) {
    const hType = hospital.type === 'clinic' ? 'clinic' : 'hospital';
    return (
      <CredentialSetupStep
        providerType={hType}
        providerId={hospital.id}
        providerName={hospital.name_en}
        onDone={() => setShowCredentialSetup(false)}
      />
    );
  }

  // ── CONSOLE DASHBOARD ──
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
        <HospitalSidebar hospital={hospital} activeTab={activeTab} onTabChange={setActiveTab} pendingCount={pendingCount} />
        <main className="flex-1 min-w-0">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            {activeTab === 'overview'  && <HospitalOverviewTab hospital={hospital} bookings={bookings} />}
            {activeTab === 'bookings'  && <HospitalBookingsTab hospital={hospital} bookings={bookings} />}
            {activeTab === 'services'  && <HospitalServicesTab hospital={hospital} onUpdated={setHospital} />}
            {activeTab === 'settings'  && <HospitalSettingsTab hospital={hospital} onUpdated={setHospital} />}
            {activeTab === 'login'     && <ProviderLoginInfoTab providerType={hospital.type === 'clinic' ? 'clinic' : 'hospital'} providerId={hospital.id} />}
          </motion.div>
        </main>
      </div>
    </div>
  );
}