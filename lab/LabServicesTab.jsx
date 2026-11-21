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

const COMMON_SERVICES = [
  'CBC', 'Blood Sugar', 'Lipid Panel', 'Liver Function', 'Kidney Function',
  'Thyroid (TSH)', 'Urine Analysis', 'COVID-19 PCR', 'Vitamin D', 'HbA1c',
  'Pregnancy Test', 'Culture & Sensitivity', 'Blood Type', 'Iron Studies',
  'PSA', 'INR / PT', 'CRP', 'Ferritin',
];

export default function LabServicesTab({ lab, onUpdated }) {
  const { isRTL } = useLanguage();
  const qc = useQueryClient();
  const [services, setServices] = useState(lab.services || []);
  const [input, setInput] = useState('');

  const isDirty = JSON.stringify(services) !== JSON.stringify(lab.services || []);

  const mutation = useMutation({
    mutationFn: () => {
      const session = getProviderSession();
      return base44.functions.invoke('updateLabProfile', {
        lab_id: lab.id,
        credential_id: session?.credentialId,
        session_token: session?.sessionToken,
        services,
      }).then(res => res.data);
    },
    onSuccess: (updated) => {
      qc.invalidateQueries(['my-lab']);
      onUpdated(updated);
      toast.success(isRTL ? 'تم حفظ الخدمات' : 'Services saved');
    },
    onError: () => toast.error(isRTL ? 'فشل الحفظ' : 'Failed to save'),
  });

  const add = (s) => {
    const val = (s || input).trim();
    if (val && !services.includes(val)) setServices(prev => [...prev, val]);
    if (!s) setInput('');
  };

  const remove = (s) => setServices(prev => prev.filter(x => x !== s));

  return (
    <div className="space-y-5">
      <div className="bg-card rounded-2xl border border-violet-100 p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-sm">{isRTL ? 'الخدمات والفحوصات' : 'Services & Lab Tests'}</h3>
        </div>

        {/* Custom input */}
        <div>
          <Label className="text-sm mb-1 block">{isRTL ? 'أضف فحصاً مخصصاً' : 'Add Custom Test'}</Label>
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && add()}
              placeholder={isRTL ? 'اسم الفحص...' : 'Test name...'}
              className="h-10 rounded-xl border-violet-100 flex-1"
            />
            <Button onClick={() => add()} className="bg-violet-500 hover:bg-violet-600 text-white rounded-xl h-10 px-4">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Quick-add chips */}
        <div>
          <Label className="text-sm mb-2 block">{isRTL ? 'اختر من القائمة الشائعة' : 'Quick-add common tests'}</Label>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_SERVICES.map(s => (
              <button key={s} onClick={() => add(s)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  services.includes(s)
                    ? 'bg-violet-100 border-violet-300 text-violet-700 font-medium'
                    : 'border-gray-200 hover:border-violet-200 hover:bg-violet-50 text-muted-foreground'
                }`}>
                {services.includes(s) ? '✓ ' : '+ '}{s}
              </button>
            ))}
          </div>
        </div>

        {/* Current services */}
        {services.length > 0 && (
          <div>
            <Label className="text-sm mb-2 block">{isRTL ? `الخدمات الحالية (${services.length})` : `Current Services (${services.length})`}</Label>
            <div className="flex flex-wrap gap-1.5">
              {services.map(s => (
                <span key={s} className="inline-flex items-center gap-1 bg-violet-100 text-violet-700 text-xs px-3 py-1.5 rounded-full font-medium">
                  {s}
                  <button onClick={() => remove(s)} className="hover:text-red-500 transition-colors ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <Button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || !isDirty}
          className="bg-violet-500 hover:bg-violet-600 text-white rounded-xl h-10 gap-2 disabled:opacity-50"
        >
          {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isRTL ? 'حفظ الخدمات' : 'Save Services'}
        </Button>
      </div>
    </div>
  );
}