import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getProviderSession } from '@/lib/useProviderSession';
import { useLanguage } from '@/lib/i18n';
import { Save, Loader2, Plus, X, Building2, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const TYPES = [
  { value: 'private',    en: 'Private Hospital',  ar: 'مستشفى خاص'   },
  { value: 'public',     en: 'Public Hospital',   ar: 'مستشفى حكومي'  },
  { value: 'specialist', en: 'Specialist Center', ar: 'مركز متخصص'   },
  { value: 'clinic',     en: 'Clinic',            ar: 'عيادة'         },
];

export default function HospitalSettingsTab({ hospital, onUpdated }) {
  const { isRTL } = useLanguage();
  const qc = useQueryClient();
  const [form, setForm] = useState({ ...hospital });
  const [newSpec, setNewSpec] = useState('');
  const [uploading, setUploading] = useState(false);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    sf('photo_url', file_url);
    setUploading(false);
  };
  const sf = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const isDirty = JSON.stringify(form) !== JSON.stringify(hospital);

  const mutation = useMutation({
    mutationFn: (data) => {
      const session = getProviderSession();
      return base44.functions.invoke('updateHospitalProfile', {
        hospital_id: hospital.id,
        credential_id: session?.credentialId,
        session_token: session?.sessionToken,
        ...data,
      }).then(res => res.data);
    },
    onSuccess: (updated) => {
      qc.invalidateQueries(['my-hospital']);
      onUpdated(updated);
      toast.success(isRTL ? 'تم حفظ المعلومات' : 'Settings saved');
    },
    onError: () => toast.error(isRTL ? 'فشل الحفظ' : 'Failed to save'),
  });

  const deleteRequestMutation = useMutation({
    mutationFn: () => {
      const session = getProviderSession();
      return base44.functions.invoke('updateHospitalProfile', {
        hospital_id: hospital.id,
        credential_id: session?.credentialId,
        session_token: session?.sessionToken,
        deletion_requested: true,
      }).then(res => res.data);
    },
    onSuccess: (updated) => {
      qc.invalidateQueries(['my-hospital']);
      onUpdated(updated);
      toast.success(isRTL ? 'تم إرسال طلب الحذف، مستشفاك الآن قيد المراجعة' : 'Deletion request submitted — your hospital is now under review');
    },
    onError: () => toast.error(isRTL ? 'فشل إرسال الطلب' : 'Failed to submit request'),
  });

  const handleRequestDeletion = () => {
    const msg = isRTL
      ? 'هل أنت متأكد أنك تريد حذف ملف المستشفى؟ سيصبح قيد المراجعة، ولن يتم حذفه فعلياً إلا من قبل الإدارة.'
      : 'Are you sure you want to delete your hospital profile? It will be placed under review and can only be deleted by an admin.';
    if (window.confirm(msg)) deleteRequestMutation.mutate();
  };

  const addSpec = () => {
    if (!newSpec.trim()) return;
    sf('specialties', [...(form.specialties || []), newSpec.trim()]);
    setNewSpec('');
  };
  const removeSpec = (s) => sf('specialties', (form.specialties || []).filter(x => x !== s));

  const fields = [
    { k: 'name_en',            lEn: 'Name (English) *',         lAr: 'الاسم (إنجليزي) *'       },
    { k: 'name_ar',            lEn: 'Name (Arabic) *',          lAr: 'الاسم (عربي) *', rtl: true },
    { k: 'phone',              lEn: 'Phone Number',             lAr: 'رقم الهاتف'              },
    { k: 'city',               lEn: 'City',                     lAr: 'المدينة'                  },
    { k: 'address_en',         lEn: 'Address',                  lAr: 'العنوان'                  },
    { k: 'consultation_fee',   lEn: 'Consultation Fee (JOD)',   lAr: 'رسوم الاستشارة', type: 'number' },
    { k: 'photo_url',          lEn: 'Cover Photo',              lAr: 'صورة الغلاف', type: 'image' },
    { k: 'website',            lEn: 'Website URL',              lAr: 'الموقع الإلكتروني'       },
    { k: 'instagram_url',      lEn: 'Instagram URL',            lAr: 'رابط انستغرام'            },
    { k: 'facebook_url',       lEn: 'Facebook URL',             lAr: 'رابط فيسبوك'              },
    { k: 'maps_code',          lEn: 'Google Maps Link',         lAr: 'رابط خرائط جوجل'          },
  ];

  return (
    <div className="space-y-5">
      <div className="bg-card rounded-2xl border border-teal-100 p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Building2 className="w-4 h-4 text-teal-500" />
          <h3 className="font-semibold text-sm">{isRTL ? 'معلومات المستشفى' : 'Hospital Information'}</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map(f => (
            <div key={f.k} className="space-y-1">
              <Label className="text-sm">{isRTL ? f.lAr : f.lEn}</Label>
              {f.type === 'image' ? (
                <div className="space-y-2">
                  {form[f.k] && (
                    <img src={form[f.k]} alt="preview" className="w-full h-32 object-cover rounded-xl border border-teal-100" />
                  )}
                  <label className={`flex items-center justify-center gap-2 w-full border-2 border-dashed rounded-xl py-2.5 cursor-pointer text-sm transition-colors ${uploading ? 'border-teal-300 bg-teal-50 text-teal-600' : 'border-teal-100 hover:border-teal-400 hover:bg-teal-50 text-gray-400 hover:text-teal-600'}`}>
                    {uploading ? <><Loader2 className="w-4 h-4 animate-spin" />{isRTL ? 'جاري الرفع...' : 'Uploading...'}</> : <><Upload className="w-4 h-4" />{form[f.k] ? (isRTL ? 'تغيير الصورة' : 'Change Photo') : (isRTL ? 'رفع صورة' : 'Upload Photo')}</>}
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
                  </label>
                </div>
              ) : (
                <Input type={f.type || 'text'} value={form[f.k] || ''} onChange={e => sf(f.k, e.target.value)}
                  className="h-10 rounded-xl border-teal-100" dir={f.rtl ? 'rtl' : undefined} />
              )}
            </div>
          ))}
          <div className="space-y-1">
            <Label className="text-sm">{isRTL ? 'نوع المنشأة' : 'Facility Type'}</Label>
            <Select value={form.type} onValueChange={v => sf('type', v)}>
              <SelectTrigger className="h-10 rounded-xl border-teal-100"><SelectValue /></SelectTrigger>
              <SelectContent>
                {TYPES.map(t => <SelectItem key={t.value} value={t.value}>{isRTL ? t.ar : t.en}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-sm">{isRTL ? 'الوصف (إنجليزي)' : 'Description (English)'}</Label>
          <Input value={form.description_en || ''} onChange={e => sf('description_en', e.target.value)} className="h-10 rounded-xl border-teal-100" />
        </div>
        <div className="space-y-1">
          <Label className="text-sm">{isRTL ? 'الوصف (عربي)' : 'Description (Arabic)'}</Label>
          <Input value={form.description_ar || ''} onChange={e => sf('description_ar', e.target.value)} className="h-10 rounded-xl border-teal-100" dir="rtl" />
        </div>

        {/* Specialties */}
        <div className="space-y-2">
          <Label className="text-sm">{isRTL ? 'التخصصات والأقسام' : 'Specialties & Departments'}</Label>
          <div className="flex gap-2">
            <Input value={newSpec} onChange={e => setNewSpec(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSpec()}
              placeholder={isRTL ? 'أضف تخصصاً...' : 'Add specialty...'} className="h-9 rounded-xl border-teal-100 text-sm flex-1" />
            <Button onClick={addSpec} variant="outline" className="h-9 rounded-xl border-teal-200 text-teal-600 px-3"><Plus className="w-4 h-4" /></Button>
          </div>
          {form.specialties?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.specialties.map(s => (
                <span key={s} className="flex items-center gap-1 bg-teal-50 text-teal-700 text-xs px-2.5 py-1 rounded-full">
                  {s}<button onClick={() => removeSpec(s)}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          )}
        </div>

        <Button onClick={() => mutation.mutate(form)} disabled={mutation.isPending || !isDirty}
          className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl h-10 gap-2 disabled:opacity-50">
          {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
        </Button>
      </div>

      {!hospital.deletion_requested && (
        <Button onClick={handleRequestDeletion} disabled={deleteRequestMutation.isPending}
          variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50 rounded-xl h-10 gap-2">
          {deleteRequestMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          {isRTL ? 'طلب حذف ملف المستشفى' : 'Request Profile Deletion'}
        </Button>
      )}

      <div className={`rounded-2xl border p-4 text-sm ${
        hospital.deletion_requested ? 'bg-red-50 border-red-200 text-red-700' :
        hospital.status === 'approved' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
        hospital.status === 'suspended' ? 'bg-red-50 border-red-200 text-red-700' :
        'bg-amber-50 border-amber-200 text-amber-700'
      }`}>
        {hospital.deletion_requested ? (isRTL ? '🗑️ تم إرسال طلب حذف الملف، وهو قيد مراجعة الإدارة' : '🗑️ Deletion requested — pending admin review') :
         hospital.status === 'approved' ? (isRTL ? '✅ مستشفاك معتمد ومرئي للمرضى' : '✅ Your hospital is approved and visible to patients') :
         hospital.status === 'suspended' ? (isRTL ? '🚫 مستشفاك موقوف — تواصل مع الدعم' : '🚫 Your hospital is suspended — contact support') :
         (isRTL ? '⏳ طلبك قيد المراجعة — خلال 24 ساعة' : '⏳ Under review — within 24 hours')}
      </div>
    </div>
  );
}