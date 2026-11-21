import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getProviderSession } from '@/lib/useProviderSession';
import { useLanguage } from '@/lib/i18n';
import { Save, Loader2, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const COMMON_SPECIALTIES = [
  'Cardiology', 'Orthopedics', 'Neurology', 'Dermatology', 'Pediatrics',
  'Gynecology', 'Oncology', 'Ophthalmology', 'ENT', 'Urology',
  'Psychiatry', 'Radiology', 'Emergency', 'ICU', 'Physiotherapy',
];

const COMMON_SERVICES = [
  'Outpatient Clinic', 'Inpatient Admission', 'Emergency Room',
  'Laboratory', 'Radiology & Imaging', 'Surgery', 'ICU',
  'Physiotherapy', 'Pharmacy', 'Endoscopy',
];

export default function HospitalServicesTab({ hospital, onUpdated }) {
  const { isRTL } = useLanguage();
  const qc = useQueryClient();
  const [specialties, setSpecialties] = useState(hospital.specialties || []);
  const [services, setServices] = useState(hospital.services || []);
  const [specInput, setSpecInput] = useState('');
  const [svcInput, setSvcInput] = useState('');

  const isDirty =
    JSON.stringify(specialties) !== JSON.stringify(hospital.specialties || []) ||
    JSON.stringify(services)    !== JSON.stringify(hospital.services    || []);

  const mutation = useMutation({
    mutationFn: () => {
      const session = getProviderSession();
      return base44.functions.invoke('updateHospitalProfile', {
        hospital_id: hospital.id,
        credential_id: session?.credentialId,
        session_token: session?.sessionToken,
        specialties, services,
      }).then(res => res.data);
    },
    onSuccess: (updated) => {
      qc.invalidateQueries(['my-hospital']);
      onUpdated(updated);
      toast.success(isRTL ? 'تم حفظ الأقسام والخدمات' : 'Departments & services saved');
    },
    onError: () => toast.error(isRTL ? 'فشل الحفظ' : 'Failed to save'),
  });

  const addSpec = (s) => {
    const val = (s || specInput).trim();
    if (val && !specialties.includes(val)) setSpecialties(p => [...p, val]);
    if (!s) setSpecInput('');
  };
  const addSvc = (s) => {
    const val = (s || svcInput).trim();
    if (val && !services.includes(val)) setServices(p => [...p, val]);
    if (!s) setSvcInput('');
  };

  return (
    <div className="space-y-5">
      {/* Specialties / Departments */}
      <div className="bg-card rounded-2xl border border-teal-100 p-5 space-y-4">
        <h3 className="font-semibold text-sm">{isRTL ? 'التخصصات والأقسام الطبية' : 'Medical Specialties & Departments'}</h3>
        <div className="flex gap-2">
          <Input value={specInput} onChange={e => setSpecInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addSpec()}
            placeholder={isRTL ? 'أضف تخصصاً...' : 'Add specialty...'}
            className="h-10 rounded-xl border-teal-100 flex-1" />
          <Button onClick={() => addSpec()} className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl h-10 px-4">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_SPECIALTIES.map(s => (
            <button key={s} onClick={() => addSpec(s)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                specialties.includes(s)
                  ? 'bg-teal-100 border-teal-300 text-teal-700 font-medium'
                  : 'border-gray-200 hover:border-teal-200 hover:bg-teal-50 text-muted-foreground'
              }`}>
              {specialties.includes(s) ? '✓ ' : '+ '}{s}
            </button>
          ))}
        </div>
        {specialties.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {specialties.map(s => (
              <span key={s} className="inline-flex items-center gap-1 bg-teal-100 text-teal-700 text-xs px-3 py-1.5 rounded-full font-medium">
                {s}
                <button onClick={() => setSpecialties(p => p.filter(x => x !== s))} className="hover:text-red-500 ml-1">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Services */}
      <div className="bg-card rounded-2xl border border-teal-100 p-5 space-y-4">
        <h3 className="font-semibold text-sm">{isRTL ? 'الخدمات المتاحة' : 'Available Services'}</h3>
        <div className="flex gap-2">
          <Input value={svcInput} onChange={e => setSvcInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addSvc()}
            placeholder={isRTL ? 'أضف خدمة...' : 'Add service...'}
            className="h-10 rounded-xl border-teal-100 flex-1" />
          <Button onClick={() => addSvc()} className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl h-10 px-4">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_SERVICES.map(s => (
            <button key={s} onClick={() => addSvc(s)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                services.includes(s)
                  ? 'bg-teal-100 border-teal-300 text-teal-700 font-medium'
                  : 'border-gray-200 hover:border-teal-200 hover:bg-teal-50 text-muted-foreground'
              }`}>
              {services.includes(s) ? '✓ ' : '+ '}{s}
            </button>
          ))}
        </div>
        {services.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {services.map(s => (
              <span key={s} className="inline-flex items-center gap-1 bg-teal-100 text-teal-700 text-xs px-3 py-1.5 rounded-full font-medium">
                {s}
                <button onClick={() => setServices(p => p.filter(x => x !== s))} className="hover:text-red-500 ml-1">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || !isDirty}
        className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl h-10 gap-2 disabled:opacity-50">
        {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {isRTL ? 'حفظ الأقسام والخدمات' : 'Save Departments & Services'}
      </Button>
    </div>
  );
}