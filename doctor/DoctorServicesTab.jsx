import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getProviderSession } from '@/lib/useProviderSession';
import { useLanguage } from '@/lib/i18n';
import { Save, Loader2, MessageSquare, Phone, Video, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const SERVICES = [
  {
    key: 'message',
    icon: MessageSquare,
    color: 'text-blue-500 bg-blue-50',
    en: 'Text Message Consultation',
    ar: 'استشارة نصية',
    descEn: 'Patients send written questions; you reply at your convenience.',
    descAr: 'يرسل المرضى أسئلة نصية وترد في وقتك المناسب.',
    feeKey: 'fee_message',
    activeKey: 'active_message',
  },
  {
    key: 'voice',
    icon: Phone,
    color: 'text-emerald-500 bg-emerald-50',
    en: 'Voice Call Consultation',
    ar: 'استشارة صوتية',
    descEn: 'Real-time audio call with the patient.',
    descAr: 'مكالمة صوتية مباشرة مع المريض.',
    feeKey: 'fee_voice',
    activeKey: 'active_voice',
  },
  {
    key: 'video',
    icon: Video,
    color: 'text-violet-500 bg-violet-50',
    en: 'Video Call Consultation',
    ar: 'استشارة بالفيديو',
    descEn: 'Face-to-face video consultation.',
    descAr: 'استشارة بالفيديو وجهاً لوجه.',
    feeKey: 'fee_video',
    activeKey: 'active_video',
  },
];

export default function DoctorServicesTab({ doctor, onUpdated }) {
  const { isRTL } = useLanguage();
  const qc = useQueryClient();

  // Build service config from doctor fields; prices are entered by the doctor
  const [config, setConfig] = useState({
    active_message: doctor.active_message !== false,
    active_voice:   doctor.active_voice   !== false,
    active_video:   doctor.active_video   !== false,
    fee_message:    doctor.fee_message    ?? '',
    fee_voice:      doctor.fee_voice      ?? '',
    fee_video:      doctor.fee_video      ?? '',
  });

  const set = (k, v) => setConfig(prev => ({ ...prev, [k]: v }));

  const mutation = useMutation({
    mutationFn: (data) => base44.functions.invoke('updateDoctorServices', { doctor_id: doctor.id, credential_id: getProviderSession()?.credentialId, session_token: getProviderSession()?.sessionToken, ...data }),
    onSuccess: (res) => {
      qc.invalidateQueries(['my-doctor']);
      onUpdated(res.data);
      toast.success(isRTL ? 'تم حفظ إعدادات الخدمات' : 'Services settings saved');
    },
    onError: (err) => {
      toast.error(isRTL ? 'فشل الحفظ' : 'Failed to save settings');
    },
  });

  return (
    <div className="space-y-5">
      {/* Services */}
      <div className="space-y-3">
        {SERVICES.map(svc => {
          const Icon = svc.icon;
          const isActive = config[svc.activeKey];
          return (
            <div key={svc.key} className={`bg-card rounded-2xl border transition-all ${isActive ? 'border-teal-200' : 'border-border opacity-70'} p-5`}>
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${svc.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-sm">{isRTL ? svc.ar : svc.en}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{isRTL ? svc.descAr : svc.descEn}</p>
                    </div>
                    <button onClick={() => set(svc.activeKey, !isActive)} className="flex-shrink-0 ml-3">
                      {isActive
                        ? <ToggleRight className="w-7 h-7 text-teal-500" />
                        : <ToggleLeft className="w-7 h-7 text-muted-foreground" />
                      }
                    </button>
                  </div>

                  {isActive && (
                    <div className="mt-4 flex items-center gap-3">
                      <Label className="text-xs text-muted-foreground whitespace-nowrap">
                        {isRTL ? 'سعر هذه الخدمة (دينار):' : 'Price for this service (JOD):'}
                      </Label>
                      <Input
                        type="number"
                        placeholder={isRTL ? 'أدخل السعر' : 'Enter price'}
                        value={config[svc.feeKey]}
                        onChange={e => set(svc.feeKey, e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                        className="h-9 w-28 rounded-xl border-teal-100 text-center font-bold text-teal-700 text-sm"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Save */}
      <Button onClick={() => mutation.mutate(config)} disabled={mutation.isPending}
        className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl h-10 gap-2">
        {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {isRTL ? 'حفظ إعدادات الخدمات' : 'Save Services Settings'}
      </Button>
    </div>
  );
}