import React from 'react';
import { CreditCard, ShieldCheck } from 'lucide-react';
import PayPalButtons from '@/components/payment/PayPalButtons';

/**
 * Shown after the registration form is filled in, before the provider profile
 * is actually created. The profile record is only created once this PayPal
 * payment is captured and verified server-side (handled by the parent console
 * through onSuccess).
 *
 * Props:
 *   providerName   – display name shown in the summary
 *   isRTL          – for Arabic/English labels
 *   pendingPayload – the registration form data, submitted with the payment
 *   onSuccess      – called once, after a verified capture
 */
const REGISTRATION_FEE_USD = '1.00';

export default function ProviderRegistrationPayment({ providerName, isRTL, pendingPayload, onSuccess }) {
  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <div className="bg-card rounded-2xl border border-teal-100 p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {isRTL ? 'رسوم التسجيل' : 'Registration Fee'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isRTL ? 'رسوم تفعيل لمرة واحدة' : 'One-time activation fee'}
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-teal-50 rounded-xl p-4 space-y-2 text-sm">
          {providerName && (
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">{isRTL ? 'الجهة' : 'Provider'}</span>
              <span className="font-medium truncate">{providerName}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-teal-100 pt-2 font-bold text-teal-700">
            <span>{isRTL ? 'الإجمالي' : 'Total'}</span>
            <span>{REGISTRATION_FEE_USD} USD</span>
          </div>
        </div>

        {/* PayPal (card, PayPal balance or Apple Pay) */}
        <PayPalButtons
          context={{ type: 'provider_registration' }}
          record={pendingPayload}
          source={window.location.pathname}
          onSuccess={() => onSuccess?.(pendingPayload)}
        />

        <p className="flex items-start gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
          <span>
            {isRTL
              ? 'يتم إنشاء ملفك مباشرة بعد تأكيد الدفع، والدفع مؤمّن ومُتحقَّق منه على الخادم.'
              : 'Your profile is created as soon as the payment is confirmed. Payment is secure and verified on our server.'}
          </span>
        </p>
      </div>
    </div>
  );
}