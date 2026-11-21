import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n';
import { Store, AlertCircle, Loader2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getProviderSession, clearProviderSession } from '@/lib/useProviderSession';
import CredentialSetupStep from '@/components/provider/CredentialSetupStep';
import ProviderLandingScreen from '@/components/provider/ProviderLandingScreen';
import ProviderRegistrationPayment from '@/components/provider/ProviderRegistrationPayment';
import RetailerSidebar  from '@/components/retailer/RetailerSidebar';
import ProductsTab      from '@/components/retailer/ProductsTab';
import OrdersTab        from '@/components/retailer/OrdersTab';
import StoreSettingsTab from '@/components/retailer/StoreSettingsTab';
import PromoCodesTab from '@/components/retailer/PromoCodesTab';
import LoginInfoTab from '@/components/retailer/LoginInfoTab';

const RETAILER_TYPES = [
  { value: 'pharmacy',         labelEn: 'Pharmacy',         labelAr: 'صيدلية'      },
  { value: 'medical_store',    labelEn: 'Medical Store',    labelAr: 'متجر طبي'    },
  { value: 'supplement_store', labelEn: 'Supplement Store', labelAr: 'متجر مكملات' },
  { value: 'general',          labelEn: 'General',          labelAr: 'متجر عام'    },
];

export default function RetailerConsole() {
  const { isRTL } = useLanguage();
  const qc = useQueryClient();
  const [retailer, setRetailer] = useState(null);
  const [showCredentialSetup, setShowCredentialSetup] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [activeTab, setActiveTab] = useState('products');
  const [regForm, setRegForm] = useState({
    name_en: '', name_ar: '', type: 'pharmacy',
    phone: '', address_en: '', city: '', license_number: '', description_en: '',
  });
  const [pendingRegPayload, setPendingRegPayload] = useState(null);

  const providerSession = getProviderSession();
  const isProviderLogin = providerSession?.type === 'retailer' && !!providerSession?.id;

  const { data: myRetailers = [], isLoading } = useQuery({
    queryKey: ['my-retailer', providerSession?.id],
    queryFn: async () => {
      if (isProviderLogin) {
        const all = await base44.entities.Retailer.list();
        return all.filter(r => r.id === providerSession.id);
      }
      const user = await base44.auth.me();
      return base44.entities.Retailer.filter({ owner_user_id: user.id });
    },
  });

  useEffect(() => {
    if (myRetailers.length > 0) setRetailer(myRetailers[0]);
  }, [myRetailers]);

  const { data: allOrders = [] } = useQuery({
    queryKey: ['retailer-orders', retailer?.id],
    queryFn: () => base44.entities.Order.list('-created_date', 50),
    enabled: !!retailer?.id,
    select: (all) => all.filter(o =>
      Array.isArray(o.items) && o.items.some(i => i.retailer_id === retailer?.id)
    ),
  });

  // Only create the retailer profile once the registration fee payment succeeds
  const finalizeRegistrationMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      return base44.entities.Retailer.create({ ...data, owner_user_id: user.id, status: 'pending' });
    },
    onSuccess: (r) => {
      setRetailer(r);
      qc.invalidateQueries(['my-retailer']);
      setShowCredentialSetup(true);
      toast.success(isRTL ? 'تم تسجيل متجرك بنجاح!' : 'Store registered successfully!');
    },
    onError: (err) => {
      toast.error(err?.message || (isRTL ? 'حدث خطأ أثناء التسجيل، حاول مرة أخرى' : 'Something went wrong while registering, please try again'));
    },
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  if (!retailer && isProviderLogin) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center text-muted-foreground">
        <Store className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No store profile linked to this account.</p>
        <p className="text-xs mt-1">Please contact the administrator to link your record.</p>
      </div>
    </div>
  );

  // ── REGISTRATION ──────────────────────────────────────────────────────────────
  if (!retailer && showPayment) {
    return (
      <ProviderRegistrationPayment
        providerName={pendingRegPayload?.name_en}
        isRTL={isRTL}
        pendingPayload={pendingRegPayload}
        onSuccess={(payload) => finalizeRegistrationMutation.mutate(payload)}
      />
    );
  }

  if (!retailer && !showRegister) {
    return (
      <ProviderLandingScreen
        providerType="retailer"
        icon={<Store className="w-8 h-8 text-white" />}
        title={isRTL ? 'لوحة تحكم المتجر' : 'Retailer Console'}
        subtitle={isRTL ? 'سجّل متجرك أو سجّل دخولك للوصول إلى لوحة التحكم' : 'Register your store or log in to access your dashboard'}
        onRegister={() => setShowRegister(true)}
      />
    );
  }

  if (!retailer && showRegister) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => setShowRegister(false)} className="text-sm text-muted-foreground hover:text-teal-600 mb-6 inline-block">← Back</button>
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {isRTL ? 'سجّل متجرك أو صيدليتك' : 'Register Your Store or Pharmacy'}
            </h1>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              {isRTL
                ? 'انضم إلى شبكة المتاجر الطبية واعرض منتجاتك لآلاف المرضى في الأردن'
                : 'Join the medical marketplace and showcase your products to thousands of patients across Jordan'}
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-teal-100 p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { k: 'name_en', lEn: 'Store Name (English) *', lAr: 'اسم المتجر (إنجليزي) *' },
                { k: 'name_ar', lEn: 'Store Name (Arabic) *',  lAr: 'اسم المتجر (عربي) *', rtl: true },
                { k: 'phone',           lEn: 'Phone Number *',  lAr: 'رقم الهاتف *'    },
                { k: 'license_number',  lEn: 'License Number',  lAr: 'رقم الرخصة'      },
                { k: 'address_en',      lEn: 'Address',         lAr: 'العنوان'         },
                { k: 'city',            lEn: 'City',            lAr: 'المدينة'         },
              ].map(f => (
                <div key={f.k} className="space-y-1">
                  <Label className="text-sm">{isRTL ? f.lAr : f.lEn}</Label>
                  <Input
                    value={regForm[f.k]}
                    onChange={e => setRegForm(r => ({ ...r, [f.k]: e.target.value }))}
                    className="h-10 rounded-xl border-teal-100"
                    dir={f.rtl ? 'rtl' : undefined}
                  />
                </div>
              ))}

              <div className="space-y-1">
                <Label className="text-sm">{isRTL ? 'نوع المتجر *' : 'Store Type *'}</Label>
                <Select value={regForm.type} onValueChange={v => setRegForm(r => ({ ...r, type: v }))}>
                  <SelectTrigger className="h-10 rounded-xl border-teal-100"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {RETAILER_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{isRTL ? t.labelAr : t.labelEn}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-sm">{isRTL ? 'وصف قصير (اختياري)' : 'Short Description (optional)'}</Label>
              <Input value={regForm.description_en} onChange={e => setRegForm(r => ({ ...r, description_en: e.target.value }))}
                className="h-10 rounded-xl border-teal-100" placeholder={isRTL ? 'اكتب وصفاً مختصراً...' : 'Brief description...'} />
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {isRTL ? 'سيتم مراجعة طلبك خلال 24 ساعة. يمكنك إضافة المنتجات فوراً بعد التسجيل.' : 'Your registration will be reviewed within 24 hours. You can add products immediately after signing up.'}
            </div>

            <Button
              onClick={() => {
                if (!regForm.name_en || !regForm.phone) {
                  toast.error(isRTL ? 'يرجى ملء الحقول المطلوبة' : 'Please fill required fields');
                  return;
                }
                setPendingRegPayload(regForm);
                setShowPayment(true);
              }}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white rounded-xl h-12 font-semibold"
            >
              {isRTL ? 'تسجيل المتجر' : 'Register Store'}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (showCredentialSetup && retailer) {
    return (
      <CredentialSetupStep
        providerType="retailer"
        providerId={retailer.id}
        providerName={retailer.name_en}
        onDone={() => setShowCredentialSetup(false)}
      />
    );
  }

  // ── PORTAL DASHBOARD ──────────────────────────────────────────────────────────
  const pendingOrders = allOrders.filter(o => o.status === 'pending').length;
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
        {/* Sidebar */}
        <RetailerSidebar
          retailer={retailer}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          orderCount={pendingOrders}
        />

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {activeTab === 'products'    && <ProductsTab retailer={retailer} />}
            {activeTab === 'orders'      && <OrdersTab retailer={retailer} />}
            {activeTab === 'promo-codes' && <PromoCodesTab retailer={retailer} />}
            {activeTab === 'settings'    && <StoreSettingsTab retailer={retailer} onUpdated={setRetailer} />}
            {activeTab === 'login'       && <LoginInfoTab retailer={retailer} />}
          </motion.div>
        </main>
      </div>
    </div>
  );
}