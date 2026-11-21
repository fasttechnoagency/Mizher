import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getProviderSession } from '@/lib/useProviderSession';
import { useLanguage } from '@/lib/i18n';
import { Save, Loader2, FlaskConical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const FIELDS = [
  { k: 'name_en',          lEn: 'Lab Name (English)',      lAr: 'اسم المختبر (إنجليزي)' },
  { k: 'name_ar',          lEn: 'Lab Name (Arabic)',        lAr: 'اسم المختبر (عربي)',    rtl: true },
  { k: 'phone',            lEn: 'Phone Number',             lAr: 'رقم الهاتف'             },
  { k: 'email',            lEn: 'Email',                    lAr: 'البريد الإلكتروني'      },
  { k: 'city',             lEn: 'City',                     lAr: 'المدينة'                },
  { k: 'address_en',       lEn: 'Address (English)',         lAr: 'العنوان (إنجليزي)'     },
  { k: 'address_ar',       lEn: 'Address (Arabic)',          lAr: 'العنوان (عربي)',        rtl: true },
  { k: 'working_hours',    lEn: 'Working Hours',             lAr: 'ساعات العمل',           placeholder: 'e.g. 8am–8pm' },
  { k: 'consultation_fee', lEn: 'Starting Price (JOD)',      lAr: 'السعر الابتدائي (د.أ)', type: 'number' },
  { k: 'maps_code',        lEn: 'Google Maps Link',          lAr: 'رابط خرائط جوجل',      placeholder: 'https://maps.google.com/...' },
  { k: 'website',          lEn: 'Website',                   lAr: 'الموقع الإلكتروني'     },
  { k: 'photo_url',        lEn: 'Cover Photo URL',           lAr: 'رابط صورة الغلاف'      },
];

export default function LabInfoTab({ lab, onUpdated }) {
  const { isRTL } = useLanguage();
  const qc = useQueryClient();
  const [form, setForm] = useState({ ...lab });
  const sf = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const isDirty = JSON.stringify(form) !== JSON.stringify(lab);

  const mutation = useMutation({
    mutationFn: (data) => {
      const session = getProviderSession();
      return base44.functions.invoke('updateLabProfile', {
        lab_id: lab.id,
        credential_id: session?.credentialId,
        session_token: session?.sessionToken,
        ...data,
      }).then(res => res.data);
    },
    onSuccess: (updated) => {
      qc.invalidateQueries(['my-lab']);
      onUpdated(updated);
      toast.success(isRTL ? 'تم حفظ معلومات المختبر' : 'Lab info saved');
    },
    onError: () => toast.error(isRTL ? 'فشل الحفظ' : 'Failed to save'),
  });

  const deleteRequestMutation = useMutation({
    mutationFn: () => {
      const session = getProviderSession();
      return base44.functions.invoke('updateLabProfile', {
        lab_id: lab.id,
        credential_id: session?.credentialId,
        session_token: session?.sessionToken,
        deletion_requested: true,
      }).then(res => res.data);
    },
    onSuccess: (updated) => {
      qc.invalidateQueries(['my-lab']);
      onUpdated(updated);
      toast.success(isRTL ? 'تم إرسال طلب الحذف، مختبرك الآن قيد المراجعة' : 'Deletion request submitted — your lab is now under review');
    },
    onError: () => toast.error(isRTL ? 'فشل إرسال الطلب' : 'Failed to submit request'),
  });

  const handleRequestDeletion = () => {
    const msg = isRTL
      ? 'هل أنت متأكد أنك تريد حذف ملف المختبر؟ سيصبح قيد المراجعة، ولن يتم حذفه فعلياً إلا من قبل الإدارة.'
      : 'Are you sure you want to delete your lab profile? It will be placed under review and can only be deleted by an admin.';
    if (window.confirm(msg)) deleteRequestMutation.mutate();
  };

  return (
    <div className="space-y-5">
      <div className="bg-card rounded-2xl border border-violet-100 p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <FlaskConical className="w-4 h-4 text-violet-500" />
          <h3 className="font-semibold text-sm">{isRTL ? 'معلومات المختبر' : 'Lab Information'}</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FIELDS.map(f => (
            <div key={f.k} className="space-y-1">
              <Label className="text-sm">{isRTL ? f.lAr : f.lEn}</Label>
              <Input
                type={f.type || 'text'}
                value={form[f.k] || ''}
                onChange={e => sf(f.k, e.target.value)}
                placeholder={f.placeholder}
                className="h-10 rounded-xl border-violet-100"
                dir={f.rtl ? 'rtl' : undefined}
              />
            </div>
          ))}
        </div>

        <div className="space-y-1">
          <Label className="text-sm">{isRTL ? 'وصف المختبر (إنجليزي)' : 'Lab Description (English)'}</Label>
          <textarea value={form.description_en || ''} onChange={e => sf('description_en', e.target.value)} rows={3}
            className="w-full px-3 py-2 rounded-xl border border-violet-100 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/20 bg-background" />
        </div>
        <div className="space-y-1">
          <Label className="text-sm">{isRTL ? 'وصف المختبر (عربي)' : 'Lab Description (Arabic)'}</Label>
          <textarea value={form.description_ar || ''} onChange={e => sf('description_ar', e.target.value)} rows={3} dir="rtl"
            className="w-full px-3 py-2 rounded-xl border border-violet-100 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/20 bg-background" />
        </div>

        <div className="flex items-center gap-3">
          <input type="checkbox" id="home_visit_edit" checked={!!form.home_visit}
            onChange={e => sf('home_visit', e.target.checked)}
            className="w-4 h-4 accent-violet-600 rounded" />
          <Label htmlFor="home_visit_edit" className="text-sm cursor-pointer">
            {isRTL ? 'نوفر خدمة أخذ العينات في المنزل' : 'We offer home sample collection'}
          </Label>
        </div>

        <Button onClick={() => mutation.mutate({ ...form, consultation_fee: parseFloat(form.consultation_fee) || undefined })}
          disabled={mutation.isPending || !isDirty}
          className="bg-violet-500 hover:bg-violet-600 text-white rounded-xl h-10 gap-2 disabled:opacity-50">
          {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
        </Button>
      </div>

      {!lab.deletion_requested && (
        <Button onClick={handleRequestDeletion} disabled={deleteRequestMutation.isPending}
          variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50 rounded-xl h-10 gap-2">
          {deleteRequestMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          {isRTL ? 'طلب حذف ملف المختبر' : 'Request Profile Deletion'}
        </Button>
      )}

      <div className={`rounded-2xl border p-4 text-sm ${
        lab.deletion_requested ? 'bg-red-50 border-red-200 text-red-700' :
        lab.status === 'approved' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
        lab.status === 'suspended' ? 'bg-red-50 border-red-200 text-red-700' :
        'bg-amber-50 border-amber-200 text-amber-700'
      }`}>
        {lab.deletion_requested ? (isRTL ? '🗑️ تم إرسال طلب حذف الملف، وهو قيد مراجعة الإدارة' : '🗑️ Deletion requested — pending admin review') :
         lab.status === 'approved' ? (isRTL ? '✅ مختبرك معتمد ومرئي للمرضى' : '✅ Your lab is approved and visible to patients') :
         lab.status === 'suspended' ? (isRTL ? '🚫 مختبرك موقوف — تواصل مع الدعم' : '🚫 Your lab is suspended — contact support') :
         (isRTL ? '⏳ طلبك قيد المراجعة — خلال 24 ساعة' : '⏳ Under review — within 24 hours')}
      </div>
    </div>
  );
}