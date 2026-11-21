import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getProviderSession } from '@/lib/useProviderSession';
import { useLanguage } from '@/lib/i18n';
import { Save, Loader2, MapPin, Phone, FileText, Store, Truck, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const RETAILER_TYPES = [
  { value: 'pharmacy',         labelEn: 'Pharmacy',         labelAr: 'صيدلية'      },
  { value: 'medical_store',    labelEn: 'Medical Store',    labelAr: 'متجر طبي'    },
  { value: 'supplement_store', labelEn: 'Supplement Store', labelAr: 'متجر مكملات' },
  { value: 'general',          labelEn: 'General',          labelAr: 'متجر عام'    },
];

export default function StoreSettingsTab({ retailer, onUpdated }) {
  const { isRTL } = useLanguage();
  const qc = useQueryClient();
  const [form, setForm] = useState({ ...retailer });
  const [uploading, setUploading] = useState(false);
  const sf = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const isDirty = JSON.stringify(form) !== JSON.stringify(retailer);

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    sf('logo_url', file_url);
    setUploading(false);
  };

  const mutation = useMutation({
    mutationFn: (data) => {
      const session = getProviderSession();
      return base44.functions.invoke('updateRetailerProfile', {
        retailer_id: retailer.id,
        credential_id: session?.credentialId,
        session_token: session?.sessionToken,
        ...data,
      }).then(res => res.data);
    },
    onSuccess: (updated) => {
      qc.invalidateQueries(['my-retailer']);
      onUpdated(updated);
      toast.success(isRTL ? 'تم حفظ معلومات المتجر' : 'Store info saved');
    },
    onError: () => toast.error(isRTL ? 'فشل الحفظ' : 'Failed to save'),
  });

  const deleteRequestMutation = useMutation({
    mutationFn: () => {
      const session = getProviderSession();
      return base44.functions.invoke('updateRetailerProfile', {
        retailer_id: retailer.id,
        credential_id: session?.credentialId,
        session_token: session?.sessionToken,
        deletion_requested: true,
      }).then(res => res.data);
    },
    onSuccess: (updated) => {
      qc.invalidateQueries(['my-retailer']);
      onUpdated(updated);
      toast.success(isRTL ? 'تم إرسال طلب الحذف، متجرك الآن قيد المراجعة' : 'Deletion request submitted — your store is now under review');
    },
    onError: () => toast.error(isRTL ? 'فشل إرسال الطلب' : 'Failed to submit request'),
  });

  const handleRequestDeletion = () => {
    const msg = isRTL
      ? 'هل أنت متأكد أنك تريد حذف ملف المتجر؟ سيصبح قيد المراجعة، ولن يتم حذفه فعلياً إلا من قبل الإدارة.'
      : 'Are you sure you want to delete your store profile? It will be placed under review and can only be deleted by an admin.';
    if (window.confirm(msg)) deleteRequestMutation.mutate();
  };

  const fields = [
    { k: 'name_en',        lEn: 'Store Name (English)', lAr: 'اسم المتجر (إنجليزي)', required: true  },
    { k: 'name_ar',        lEn: 'Store Name (Arabic)',  lAr: 'اسم المتجر (عربي)',    required: true, rtlInput: true },
    { k: 'phone',          lEn: 'Phone Number',         lAr: 'رقم الهاتف',           icon: Phone     },
    { k: 'license_number', lEn: 'License Number',       lAr: 'رقم الرخصة',           icon: FileText  },
    { k: 'address_en',     lEn: 'Address (English)',    lAr: 'العنوان (إنجليزي)',    icon: MapPin    },
    { k: 'address_ar',     lEn: 'Address (Arabic)',     lAr: 'العنوان (عربي)',       icon: MapPin, rtlInput: true },
    { k: 'city',           lEn: 'City',                 lAr: 'المدينة'                               },
  ];

  return (
    <div className="space-y-5">
      <div className="bg-card rounded-2xl border border-teal-100 p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Store className="w-4 h-4 text-teal-500" />
          <h3 className="font-semibold text-sm">{isRTL ? 'معلومات المتجر الأساسية' : 'Basic Store Information'}</h3>
        </div>

        {/* Logo */}
        <div className="flex gap-3 items-start">
          <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-teal-200 flex-shrink-0 overflow-hidden bg-teal-50 flex items-center justify-center">
            {form.logo_url ? <img src={form.logo_url} alt="" className="w-full h-full object-cover" /> : <Store className="w-5 h-5 text-teal-300" />}
          </div>
          <div className="flex-1 space-y-1">
            <Label className="text-xs">{isRTL ? 'شعار المتجر' : 'Store Logo'}</Label>
            <label className={`flex items-center justify-center gap-2 w-full border-2 border-dashed rounded-xl py-2 cursor-pointer text-sm transition-colors ${uploading ? 'border-teal-300 bg-teal-50 text-teal-600' : 'border-teal-100 hover:border-teal-400 hover:bg-teal-50 text-gray-400 hover:text-teal-600'}`}>
              {uploading ? <><Loader2 className="w-4 h-4 animate-spin" />{isRTL ? 'جاري الرفع...' : 'Uploading...'}</> : <>{isRTL ? 'رفع شعار' : 'Upload Logo'}</>}
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploading} />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map(f => (
            <div key={f.k} className="space-y-1">
              <Label className="text-sm">{isRTL ? f.lAr : f.lEn}{f.required && ' *'}</Label>
              <Input
                value={form[f.k] || ''}
                onChange={e => sf(f.k, e.target.value)}
                className="h-10 rounded-xl border-teal-100"
                dir={f.rtlInput ? 'rtl' : undefined}
              />
            </div>
          ))}

          <div className="space-y-1">
            <Label className="text-sm">{isRTL ? 'نوع المتجر' : 'Store Type'}</Label>
            <Select value={form.type} onValueChange={v => sf('type', v)}>
              <SelectTrigger className="h-10 rounded-xl border-teal-100"><SelectValue /></SelectTrigger>
              <SelectContent>
                {RETAILER_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{isRTL ? t.labelAr : t.labelEn}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-sm">{isRTL ? 'وصف المتجر (إنجليزي)' : 'Store Description (English)'}</Label>
          <Input value={form.description_en || ''} onChange={e => sf('description_en', e.target.value)} className="h-10 rounded-xl border-teal-100" />
        </div>
        <div className="space-y-1">
          <Label className="text-sm">{isRTL ? 'وصف المتجر (عربي)' : 'Store Description (Arabic)'}</Label>
          <Input value={form.description_ar || ''} onChange={e => sf('description_ar', e.target.value)} className="h-10 rounded-xl border-teal-100" dir="rtl" />
        </div>

        <Button
          onClick={() => mutation.mutate(form)}
          disabled={mutation.isPending || !isDirty}
          className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl h-10 gap-2 disabled:opacity-50"
        >
          {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
        </Button>
      </div>

      {/* Delivery Fee */}
      <div className="bg-card rounded-2xl border border-teal-100 p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Truck className="w-4 h-4 text-teal-500" />
          <h3 className="font-semibold text-sm">{isRTL ? 'رسوم التوصيل' : 'Delivery Fee'}</h3>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{isRTL ? 'تفعيل رسوم التوصيل' : 'Enable Delivery Fee'}</p>
            <p className="text-xs text-muted-foreground">{isRTL ? 'إذا تم إيقافها، لن يتم إضافة رسوم توصيل لطلبات متجرك' : 'When off, no delivery fee is charged for your store on orders'}</p>
          </div>
          <Switch checked={!!form.delivery_fee_enabled} onCheckedChange={v => sf('delivery_fee_enabled', v)} />
        </div>

        {form.delivery_fee_enabled && (
          <div className="space-y-1">
            <Label className="text-sm">{isRTL ? 'قيمة رسوم التوصيل (د.أ)' : 'Delivery Fee Amount (JOD)'}</Label>
            <Input
              type="number"
              min="0"
              step="0.1"
              value={form.delivery_fee ?? ''}
              onChange={e => sf('delivery_fee', parseFloat(e.target.value) || 0)}
              className="h-10 rounded-xl border-teal-100"
            />
          </div>
        )}

        <Button
          onClick={() => mutation.mutate(form)}
          disabled={mutation.isPending || !isDirty}
          className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl h-10 gap-2 disabled:opacity-50"
        >
          {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
        </Button>
      </div>

      {!retailer.deletion_requested && (
        <Button onClick={handleRequestDeletion} disabled={deleteRequestMutation.isPending}
          variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50 rounded-xl h-10 gap-2">
          {deleteRequestMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          {isRTL ? 'طلب حذف ملف المتجر' : 'Request Profile Deletion'}
        </Button>
      )}

      {/* Status info */}
      <div className={`rounded-2xl border p-4 text-sm ${
        retailer.deletion_requested ? 'bg-red-50 border-red-200 text-red-700' :
        retailer.status === 'approved' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
        retailer.status === 'suspended' ? 'bg-red-50 border-red-200 text-red-700' :
        'bg-amber-50 border-amber-200 text-amber-700'
      }`}>
        <p className="font-semibold mb-1">
          {retailer.deletion_requested ? (isRTL ? '🗑️ تم إرسال طلب حذف الملف، وهو قيد مراجعة الإدارة' : '🗑️ Deletion requested — pending admin review') :
           retailer.status === 'approved' ? (isRTL ? '✅ متجرك معتمد ومرئي للعملاء' : '✅ Your store is approved and visible to customers') :
           retailer.status === 'suspended' ? (isRTL ? '🚫 متجرك موقوف — تواصل مع الدعم' : '🚫 Your store is suspended — contact support') :
           (isRTL ? '⏳ طلبك قيد المراجعة خلال 24 ساعة' : '⏳ Your registration is under review — within 24 hours')}
        </p>
        {retailer.status === 'pending' && !retailer.deletion_requested && (
          <p className="text-xs opacity-80">
            {isRTL ? 'يمكنك إضافة منتجاتك الآن وستظهر للعملاء بعد الاعتماد' : 'You can add products now and they will appear once approved'}
          </p>
        )}
      </div>
    </div>
  );
}