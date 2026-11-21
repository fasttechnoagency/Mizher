import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getProviderSession } from '@/lib/useProviderSession';
import { useLanguage } from '@/lib/i18n';
import { Save, Loader2, Plus, X, ImageIcon, Stethoscope, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const SPECIALTIES_LIST = ['Cardiology','Dermatology','Orthopedics','Neurology','Pediatrics','General Medicine','Dentistry','Ophthalmology','Oncology','Gynecology','Psychiatry','Radiology','Aesthetic','Urology'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const TIMES = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00'];

export default function DoctorProfileTab({ doctor, onUpdated }) {
  const { isRTL } = useLanguage();
  const qc = useQueryClient();
  const [form, setForm] = useState({ ...doctor });
  const [newSpec, setNewSpec] = useState('');
  const [newService, setNewService] = useState('');
  const [uploading, setUploading] = useState(false);
  const sf = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const isDirty = JSON.stringify(form) !== JSON.stringify(doctor);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    sf('photo_url', file_url);
    setUploading(false);
  };

  const mutation = useMutation({
    mutationFn: (data) => base44.functions.invoke('updateDoctorServices', { doctor_id: doctor.id, credential_id: getProviderSession()?.credentialId, session_token: getProviderSession()?.sessionToken, ...data }),
    onSuccess: (res) => {
      qc.invalidateQueries(['my-doctor']);
      onUpdated(res.data);
      toast.success(isRTL ? 'تم حفظ الملف الطبي' : 'Profile saved');
    },
    onError: () => toast.error(isRTL ? 'فشل الحفظ' : 'Failed to save'),
  });

  const deleteRequestMutation = useMutation({
    mutationFn: () => base44.functions.invoke('updateDoctorServices', { doctor_id: doctor.id, credential_id: getProviderSession()?.credentialId, session_token: getProviderSession()?.sessionToken, deletion_requested: true }),
    onSuccess: (res) => {
      qc.invalidateQueries(['my-doctor']);
      onUpdated(res.data);
      toast.success(isRTL ? 'تم إرسال طلب الحذف، ملفك الآن قيد المراجعة' : 'Deletion request submitted — your profile is now under review');
    },
    onError: () => toast.error(isRTL ? 'فشل إرسال الطلب' : 'Failed to submit request'),
  });

  const handleRequestDeletion = () => {
    const msg = isRTL
      ? 'هل أنت متأكد أنك تريد حذف ملفك الطبي؟ سيصبح ملفك قيد المراجعة، ولن يتم حذفه فعلياً إلا من قبل الإدارة.'
      : 'Are you sure you want to delete your medical profile? Your profile will be placed under review and can only be deleted by an admin.';
    if (window.confirm(msg)) deleteRequestMutation.mutate();
  };

  const addSpec = () => {
    if (!newSpec.trim()) return;
    sf('specialties', [...(form.specialties || []), newSpec.trim()]);
    setNewSpec('');
  };
  const removeSpec = (s) => sf('specialties', (form.specialties || []).filter(x => x !== s));

  const addService = () => {
    if (!newService.trim()) return;
    sf('services', [...(form.services || []), newService.trim()]);
    setNewService('');
  };
  const removeService = (s) => sf('services', (form.services || []).filter(x => x !== s));

  const toggleSlot = (slot) => {
    const slots = form.available_slots || [];
    sf('available_slots', slots.includes(slot) ? slots.filter(s => s !== slot) : [...slots, slot]);
  };

  const fields = [
    { k: 'name_en',       lEn: 'Name (English) *',     lAr: 'الاسم (إنجليزي) *'    },
    { k: 'name_ar',       lEn: 'Name (Arabic) *',      lAr: 'الاسم (عربي) *', rtl: true },
    { k: 'specialty_en',  lEn: 'Specialty (English) *',lAr: 'التخصص (إنجليزي) *'   },
    { k: 'specialty_ar',  lEn: 'Specialty (Arabic)',   lAr: 'التخصص (عربي)', rtl: true },
    { k: 'location_en',   lEn: 'City / Area (EN)',     lAr: 'المدينة (EN)'         },
    { k: 'location_ar',   lEn: 'City / Area (AR)',     lAr: 'المدينة (AR)', rtl: true },
    { k: 'experience_years', lEn: 'Years of Experience',   lAr: 'سنوات الخبرة',    type: 'number' },
    { k: 'phone',         lEn: 'Phone Number',         lAr: 'رقم الهاتف'           },
    { k: 'license_number',lEn: 'Medical License #',    lAr: 'رقم الترخيص الطبي'   },
    { k: 'clinic_name_en',lEn: 'Clinic Name (EN)',     lAr: 'اسم العيادة (EN)'     },
    { k: 'clinic_address',lEn: 'Clinic Address',       lAr: 'عنوان العيادة'        },
    { k: 'maps_code',     lEn: 'Google Maps Link',    lAr: 'رابط خرائط جوجل',     placeholder: 'https://maps.google.com/...' },
  ];

  return (
    <div className="space-y-5">
      <div className="bg-card rounded-2xl border border-teal-100 p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Stethoscope className="w-4 h-4 text-teal-500" />
          <h3 className="font-semibold text-sm">{isRTL ? 'الملف الطبي' : 'Medical Profile'}</h3>
        </div>

        {/* Photo */}
        <div className="flex gap-3 items-start">
          <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-teal-200 flex-shrink-0 overflow-hidden bg-teal-50 flex items-center justify-center">
            {form.photo_url ? <img src={form.photo_url} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-5 h-5 text-teal-300" />}
          </div>
          <div className="flex-1 space-y-1">
            <Label className="text-xs">{isRTL ? 'صورة الملف الشخصي' : 'Profile Photo'}</Label>
            <label className={`flex items-center justify-center gap-2 w-full border-2 border-dashed rounded-xl py-2 cursor-pointer text-sm transition-colors ${uploading ? 'border-teal-300 bg-teal-50 text-teal-600' : 'border-teal-100 hover:border-teal-400 hover:bg-teal-50 text-gray-400 hover:text-teal-600'}`}>
              {uploading ? <><Loader2 className="w-4 h-4 animate-spin" />{isRTL ? 'جاري الرفع...' : 'Uploading...'}</> : <>{isRTL ? 'رفع صورة' : 'Upload Photo'}</>}
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map(f => (
            <div key={f.k} className="space-y-1">
              <Label className="text-sm">{isRTL ? f.lAr : f.lEn}</Label>
              <Input type={f.type || 'text'} value={form[f.k] || ''} onChange={e => sf(f.k, e.target.value)}
                placeholder={f.placeholder} className="h-10 rounded-xl border-teal-100" dir={f.rtl ? 'rtl' : undefined} />
            </div>
          ))}

          <div className="space-y-1">
            <Label className="text-sm">{isRTL ? 'الجنس' : 'Gender'}</Label>
            <Select value={form.gender || ''} onValueChange={v => sf('gender', v)}>
              <SelectTrigger className="h-10 rounded-xl border-teal-100"><SelectValue placeholder={isRTL ? 'اختر' : 'Select'} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="male">{isRTL ? 'ذكر' : 'Male'}</SelectItem>
                <SelectItem value="female">{isRTL ? 'أنثى' : 'Female'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-1">
          <Label className="text-sm">{isRTL ? 'نبذة مختصرة (إنجليزي)' : 'Bio (English)'}</Label>
          <textarea value={form.bio_en || ''} onChange={e => sf('bio_en', e.target.value)} rows={3}
            className="w-full px-3 py-2 rounded-xl border border-teal-100 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-background" />
        </div>
        <div className="space-y-1">
          <Label className="text-sm">{isRTL ? 'نبذة مختصرة (عربي)' : 'Bio (Arabic)'}</Label>
          <textarea value={form.bio_ar || ''} onChange={e => sf('bio_ar', e.target.value)} rows={3} dir="rtl"
            className="w-full px-3 py-2 rounded-xl border border-teal-100 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-background" />
        </div>

        {/* Specialties */}
        <div className="space-y-2">
          <Label className="text-sm">{isRTL ? 'التخصصات الفرعية' : 'Sub-specialties'}</Label>
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

        {/* Services */}
        <div className="space-y-2">
          <Label className="text-sm">{isRTL ? 'الخدمات المقدمة' : 'Services Offered'}</Label>
          <div className="flex gap-2">
            <Input value={newService} onChange={e => setNewService(e.target.value)} onKeyDown={e => e.key === 'Enter' && addService()}
              placeholder={isRTL ? 'أضف خدمة...' : 'Add service...'} className="h-9 rounded-xl border-teal-100 text-sm flex-1" />
            <Button onClick={addService} variant="outline" className="h-9 rounded-xl border-teal-200 text-teal-600 px-3"><Plus className="w-4 h-4" /></Button>
          </div>
          {form.services?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.services.map(s => (
                <span key={s} className="flex items-center gap-1 bg-cyan-50 text-cyan-700 text-xs px-2.5 py-1 rounded-full border border-cyan-100">
                  {s}<button onClick={() => removeService(s)}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Social Media */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">{isRTL ? 'روابط التواصل الاجتماعي' : 'Social Media Links'}</Label>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </span>
              <Input value={form.instagram_url || ''} onChange={e => sf('instagram_url', e.target.value)}
                placeholder="https://instagram.com/yourprofile" className="h-9 rounded-xl border-teal-100 text-sm flex-1" />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </span>
              <Input value={form.facebook_url || ''} onChange={e => sf('facebook_url', e.target.value)}
                placeholder="https://facebook.com/yourprofile" className="h-9 rounded-xl border-teal-100 text-sm flex-1" />
            </div>
          </div>
        </div>

        {/* Availability */}
        <div className="space-y-2">
          <Label className="text-sm">{isRTL ? 'أوقات الإتاحة' : 'Available Slots'}</Label>
          <div className="space-y-2">
            {DAYS.map(day => (
              <div key={day} className="flex items-center gap-2 flex-wrap">
                <span className="w-10 text-xs font-semibold text-muted-foreground">{day}</span>
                {TIMES.map(t => {
                  const slot = `${day} ${t}`;
                  const active = (form.available_slots || []).includes(slot);
                  return (
                    <button key={t} onClick={() => toggleSlot(slot)}
                      className={`text-[10px] px-2 py-1 rounded-lg border transition-all ${active ? 'border-teal-500 bg-teal-50 text-teal-700 font-semibold' : 'border-teal-100 text-muted-foreground hover:border-teal-300'}`}>
                      {t}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <Button onClick={() => mutation.mutate(form)} disabled={mutation.isPending || !isDirty}
          className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl h-10 gap-2 disabled:opacity-50">
          {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isRTL ? 'حفظ الملف الطبي' : 'Save Profile'}
        </Button>
      </div>

      {!doctor.deletion_requested && (
        <Button onClick={handleRequestDeletion} disabled={deleteRequestMutation.isPending}
          variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50 rounded-xl h-10 gap-2">
          {deleteRequestMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          {isRTL ? 'طلب حذف الملف الطبي' : 'Request Profile Deletion'}
        </Button>
      )}

      <div className={`rounded-2xl border p-4 text-sm ${
        doctor.deletion_requested ? 'bg-red-50 border-red-200 text-red-700' :
        doctor.status === 'approved' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
        doctor.status === 'suspended' ? 'bg-red-50 border-red-200 text-red-700' :
        'bg-amber-50 border-amber-200 text-amber-700'
      }`}>
        {doctor.deletion_requested ? (isRTL ? '🗑️ تم إرسال طلب حذف الملف، وهو قيد مراجعة الإدارة' : '🗑️ Deletion requested — pending admin review') :
         doctor.status === 'approved' ? (isRTL ? '✅ ملفك الطبي معتمد ومرئي للمرضى' : '✅ Your profile is approved and visible to patients') :
         doctor.status === 'suspended' ? (isRTL ? '🚫 ملفك موقوف — تواصل مع الدعم' : '🚫 Your profile is suspended — contact support') :
         (isRTL ? '⏳ طلبك قيد المراجعة — خلال 24 ساعة' : '⏳ Your registration is under review — within 24 hours')}
      </div>
    </div>
  );
}