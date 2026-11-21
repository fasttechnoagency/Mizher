import React from 'react';
import { useLanguage } from '@/lib/i18n';
import { User, Mail, Phone, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function PatientDetailsForm({ form, onChange }) {
  const { isRTL, t } = useLanguage();

  const fields = [
  { key: 'patient_name',  labelKey: 'fullName',     placeholder: 'Enter your full name', type: 'text',  icon: User,  required: true },
  { key: 'patient_email', labelKey: 'emailAddress', placeholder: 'you@email.com', type: 'email', icon: Mail,  required: true },
  { key: 'patient_phone', labelKey: 'phoneNumber',  placeholder: '+962 7X XXX XXXX', type: 'tel',   icon: Phone, required: true },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">
          {t('yourDetails')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t('detailsDesc')}
        </p>
      </div>

      <div className="space-y-4">
        {fields.map(f => {
          const Icon = f.icon;
          return (
            <div key={f.key} className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">
                {t(f.labelKey)}
                {f.required && <span className="text-red-500 ms-1">*</span>}
              </Label>
              <div className="relative">
                <Icon className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'} w-4 h-4 text-muted-foreground`} />
                <Input
                  type={f.type}
                  value={form[f.key] || ''}
                  onChange={e => onChange(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className={`${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} h-11 rounded-xl border-teal-100 focus-visible:ring-teal-500/30`}
                  required={f.required}
                />
              </div>
            </div>
          );
        })}

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            {t('additionalNotes')}
          </Label>
          <Textarea
            value={form.notes || ''}
            onChange={e => onChange('notes', e.target.value)}
            placeholder="..."
            className="rounded-xl border-teal-100 focus-visible:ring-teal-500/30 resize-none"
            rows={3}
          />
        </div>
      </div>

      {/* Privacy Note */}
      <div className="bg-teal-50 border border-teal-100 rounded-xl p-3 text-xs text-teal-700">
        🔒 {t('dataProtected')}
      </div>
    </div>
  );
}