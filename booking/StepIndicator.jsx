import React from 'react';
import { Check, Stethoscope, Calendar, User, CreditCard } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

const STEP_CONFIG = [
  { icon: Calendar,   labelKey: 'scheduleAppointment' },
  { icon: User,       labelKey: 'yourDetails'         },
  { icon: CreditCard, labelKey: 'paymentConfirm'      },
];

export default function StepIndicator({ currentStep }) {
  const { isRTL, lang, t } = useLanguage();

  return (
    <div className="flex items-center w-full mb-8">
      {STEP_CONFIG.map((s, i) => {
        const Icon = s.icon;
        const isActive = i === currentStep;
        const isDone   = i < currentStep;

        return (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                isActive ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30 scale-110' :
                isDone   ? 'bg-teal-100 text-teal-700' :
                           'bg-muted text-muted-foreground'
              }`}>
                {isDone ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <span className={`text-[10px] font-medium hidden md:block transition-colors ${
                isActive ? 'text-teal-700' : isDone ? 'text-teal-500' : 'text-muted-foreground'
              }`}>
                {t(s.labelKey)}
              </span>
            </div>
            {i < STEP_CONFIG.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-4 md:mb-6 transition-colors duration-500 ${
                i < currentStep ? 'bg-teal-400' : 'bg-muted'
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}