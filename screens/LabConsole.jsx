import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n';
import { FlaskConical, Loader2, AlertCircle, Plus, X, LogOut } from 'lucide-react';
import { getProviderSession, clearProviderSession } from '@/lib/useProviderSession';
import CredentialSetupStep from '@/components/provider/CredentialSetupStep';
import ProviderLandingScreen from '@/components/provider/ProviderLandingScreen';
import ProviderRegistrationPayment from '@/components/provider/ProviderRegistrationPayment';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import LabSidebar from '@/components/lab/LabSidebar';
import LabServicesTab from '@/components/lab/LabServicesTab';
import LabInfoTab from '@/components/lab/LabInfoTab';
import ProviderLoginInfoTab from '@/components/provider/ProviderLoginInfoTab';

const COMMON_SERVICES = ['CBC', 'Blood Sugar', 'Lipid Panel', 'Liver Function', 'Kidney Function', 'Thyroid (TSH)', 'Urine Analysis', 'COVID-19 PCR', 'Vitamin D', 'HbA1c', 'Pregnancy Test', 'Culture & Sensitivity'];

export default function LabConsole() {
  const { isRTL } = useLanguage();
  const qc = useQueryClient();
  const [lab, setLab] = useState(null);
  const [showCredentialSetup, setShowCredentialSetup] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [serviceInput, setServiceInput] = useState('');
  const [form, setForm] = useState({
    name_en: '', name_ar: '', description_en: '', description_ar: '',
    phone: '', email: '', website: '',
    city: '', address_en: '', address_ar: '',
    maps_code: '',
    working_hours: '', consultation_fee: '',
    home_visit: false,
  });
  const [services, setServices] = useState([]);
  const [pendingRegPayload, setPendingRegPayload] = useState(null);

  const providerSession = getProviderSession();
  const isProviderLogin = providerSession?.type === 'lab' && !!providerSession?.id;

  const { data: myLabs = [], isLoading } = useQuery({
    queryKey: ['my-lab', providerSession?.id],
    queryFn: async () => {
      if (isProviderLogin) {
        const all = await base44.entities.Lab.list();
        return all.filter(l => l.id === providerSession.id);
      }
      const user = await base44.auth.me();
      return base44.entities.Lab.filter({ owner_user_id: user.id });
    },
  });

  useEffect(() => {
    if (myLabs.length > 0) setLab(myLabs[0]);
  }, [myLabs]);

  // Only create the lab profile once the registration fee payment succeeds
  const finalizeRegistrationMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      return base44.entities.Lab.create({ ...data, owner_user_id: user.id, status: 'pending' });
    },
    onSuccess: (r) => {
      setLab(r);
      qc.invalidateQueries(['my-lab']);
      setShowCredentialSetup(true);
      toast.success(isRTL ? 'تم تسجيل مختبرك بنجاح!' : 'Your lab was submitted!');
    },
    onError: (err) => {
      toast.error(err?.message || (isRTL ? 'حدث خطأ أثناء التسجيل، حاول مرة أخرى' : 'Something went wrong while registering, please try again'));
    },
  });


  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
    </div>
  );

  if (!lab && isProviderLogin) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center text-muted-foreground">
        <FlaskConical className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No lab profile linked to this account.</p>
        <p className="text-xs mt-1">Please contact the administrator to link your record.</p>
      </div>
    </div>
  );

  // ── REGISTRATION ──
  if (!lab && showPayment) {
    return (
      <ProviderRegistrationPayment
        providerName={pendingRegPayload?.name_en}
        isRTL={isRTL}
        pendingPayload={pendingRegPayload}
        onSuccess={(payload) => finalizeRegistrationMutation.mutate(payload)}
      />
    );
  }

  if (!lab && !showRegister) {
    return (
      <ProviderLandingScreen
        providerType="lab"
        icon={<FlaskConical className="w-8 h-8 text-white" />}
        title={isRTL ? 'لوحة تحكم المختبر' : 'Lab Console'}
        subtitle={isRTL ? 'سجّل مختبرك أو سجّل دخولك للوصول إلى لوحة التحكم' : 'Register your lab or log in to access your dashboard'}
        onRegister={() => setShowRegister(true)}
      />
    );
  }

  if (!lab && showRegister) {
    const addService = (s) => {
      const val = s || serviceInput.trim();
      if (val && !services.includes(val)) setServices(prev => [...prev, val]);
      setServiceInput('');
    };

    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => setShowRegister(false)} className="text-sm text-muted-foreground hover:text-teal-600 mb-6 inline-block">← Back</button>
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">{isRTL ? 'سجّل مختبرك الطبي' : 'Register Your Lab'}</h1>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              {isRTL ? 'أنشئ صفحة مختبرك واستقبل طلبات الفحوصات من المرضى' : 'Create your lab profile and start receiving test requests from patients'}
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-violet-100 p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { k: 'name_en', lEn: 'Lab Name (English) *', lAr: 'اسم المختبر (إنجليزي) *' },
                { k: 'name_ar', lEn: 'Lab Name (Arabic) *', lAr: 'اسم المختبر (عربي) *', rtl: true },
                { k: 'phone', lEn: 'Phone Number *', lAr: 'رقم الهاتف *' },
                { k: 'email', lEn: 'Email', lAr: 'البريد الإلكتروني' },
                { k: 'city', lEn: 'City', lAr: 'المدينة' },
                { k: 'address_en', lEn: 'Address (English)', lAr: 'العنوان (إنجليزي)' },
                { k: 'address_ar', lEn: 'Address (Arabic)', lAr: 'العنوان (عربي)', rtl: true },
                { k: 'working_hours', lEn: 'Working Hours', lAr: 'ساعات العمل', placeholder: 'e.g. 8am-8pm' },
                { k: 'consultation_fee', lEn: 'Starting Price (JOD)', lAr: 'السعر الابتدائي (د.أ)', type: 'number' },
                { k: 'maps_code', lEn: 'Google Maps Link', lAr: 'رابط خرائط جوجل', placeholder: 'https://maps.google.com/...' },
                { k: 'website', lEn: 'Website', lAr: 'الموقع الإلكتروني' },
              ].map(f => (
                <div key={f.k} className="space-y-1">
                  <Label className="text-sm">{isRTL ? f.lAr : f.lEn}</Label>
                  <Input type={f.type || 'text'} value={form[f.k]}
                    onChange={e => setForm(r => ({ ...r, [f.k]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="h-10 rounded-xl border-violet-100" dir={f.rtl ? 'rtl' : undefined} />
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="space-y-1">
              <Label className="text-sm">{isRTL ? 'وصف المختبر (اختياري)' : 'Lab Description (optional)'}</Label>
              <textarea value={form.description_en} onChange={e => setForm(r => ({ ...r, description_en: e.target.value }))} rows={2}
                className="w-full px-3 py-2 rounded-xl border border-violet-100 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/20 bg-background" />
            </div>

            {/* Home Visit */}
            <div className="flex items-center gap-3">
              <input type="checkbox" id="home_visit" checked={form.home_visit}
                onChange={e => setForm(r => ({ ...r, home_visit: e.target.checked }))}
                className="w-4 h-4 accent-violet-600 rounded" />
              <Label htmlFor="home_visit" className="text-sm cursor-pointer">
                {isRTL ? 'نوفر خدمة أخذ العينات في المنزل' : 'We offer home sample collection'}
              </Label>
            </div>

            {/* Services */}
            <div className="space-y-2">
              <Label className="text-sm">{isRTL ? 'الخدمات والفحوصات' : 'Services & Tests'}</Label>
              <div className="flex gap-2">
                <Input value={serviceInput} onChange={e => setServiceInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addService()}
                  placeholder={isRTL ? 'أضف فحصاً...' : 'Add a test...'}
                  className="h-9 rounded-xl border-violet-100 flex-1 text-sm" />
                <Button onClick={() => addService()} size="sm" className="bg-violet-500 hover:bg-violet-600 text-white rounded-xl h-9 px-3">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {COMMON_SERVICES.map(s => (
                  <button key={s} onClick={() => addService(s)}
                    className={`text-xs px-3 py-1 rounded-full border transition-colors ${services.includes(s) ? 'bg-violet-100 border-violet-300 text-violet-700' : 'border-gray-200 hover:border-violet-200 hover:bg-violet-50 text-muted-foreground'}`}>
                    {s}
                  </button>
                ))}
              </div>
              {services.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {services.map(s => (
                    <span key={s} className="inline-flex items-center gap-1 bg-violet-100 text-violet-700 text-xs px-3 py-1 rounded-full">
                      {s}
                      <button onClick={() => setServices(prev => prev.filter(x => x !== s))}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {isRTL ? 'سيتم مراجعة ملف مختبرك خلال 24 ساعة.' : 'Your lab profile will be reviewed within 24 hours.'}
            </div>

            <Button onClick={() => {
              if (!form.name_en || !form.phone) { toast.error(isRTL ? 'يرجى ملء الحقول المطلوبة' : 'Please fill required fields'); return; }
              setPendingRegPayload({
                ...form,
                consultation_fee: parseFloat(form.consultation_fee) || undefined,
                services,
              });
              setShowPayment(true);
            }}
              className="w-full bg-violet-500 hover:bg-violet-600 text-white rounded-xl h-12 font-semibold">
              {isRTL ? 'تسجيل المختبر' : 'Submit Lab'}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (showCredentialSetup && lab) {
    return (
      <CredentialSetupStep
        providerType="lab"
        providerId={lab.id}
        providerName={lab.name_en}
        onDone={() => setShowCredentialSetup(false)}
      />
    );
  }

  // ── DASHBOARD ──
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
        <LabSidebar lab={lab} activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 min-w-0">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: isRTL ? 'الهاتف' : 'Phone', value: lab.phone },
                    { label: isRTL ? 'المدينة' : 'City', value: lab.city },
                    { label: isRTL ? 'ساعات العمل' : 'Working Hours', value: lab.working_hours },
                    { label: isRTL ? 'السعر الابتدائي' : 'Starting Price', value: lab.consultation_fee ? `${lab.consultation_fee} JOD` : null },
                  ].filter(i => i.value).map(({ label, value }) => (
                    <div key={label} className="bg-card rounded-xl border border-violet-100 p-4">
                      <p className="text-xs text-muted-foreground mb-1">{label}</p>
                      <p className="text-sm font-medium">{value}</p>
                    </div>
                  ))}
                </div>
                {lab.services?.length > 0 && (
                  <div className="bg-card rounded-xl border border-violet-100 p-4">
                    <p className="text-sm font-semibold mb-2">{isRTL ? 'الخدمات' : 'Services'} ({lab.services.length})</p>
                    <div className="flex flex-wrap gap-1.5">
                      {lab.services.map((s, i) => (
                        <span key={i} className="bg-violet-50 text-violet-700 border border-violet-100 text-xs px-3 py-1 rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'services' && <LabServicesTab lab={lab} onUpdated={setLab} />}
            {activeTab === 'edit'     && <LabInfoTab lab={lab} onUpdated={setLab} />}
            {activeTab === 'login'    && <ProviderLoginInfoTab providerType="lab" providerId={lab.id} />}
          </motion.div>
        </main>
      </div>
    </div>
  );
}