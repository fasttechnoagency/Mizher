import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Banknote, Check } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

/**
 * PaymentMethodSelector — modern, professional payment-method picker for the
 * marketplace cart checkout. Replaces emoji radio tiles with branded icon
 * badges, a refined selected state, and a scalable check indicator.
 *
 * Purely presentational: the selected value is controlled by the parent via
 * `value` / `onChange`, and the values ('cash_on_delivery' | 'paypal') stay
 * identical so the existing checkout logic is untouched.
 */

function CashBadge() {
  return (
    <span className="payment-badge payment-badge--cash" aria-hidden="true">
      <Banknote className="w-5 h-5" strokeWidth={1.75} />
    </span>
  );
}

function CardBadge() {
  // Premium credit-card mark: a mini card with an EMV chip and contactless
  // waves, on a refined navy gradient. Conveys "credit/debit" at a glance
  // without leaning on any single card brand.
  return (
    <span className="payment-badge payment-badge--card" aria-hidden="true">
      <svg viewBox="0 0 40 30" width="36" height="27" role="img" aria-label="Credit or debit card" focusable="false">
        <defs>
          <linearGradient id="pm-card-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#1f2d3d" />
            <stop offset="1" stopColor="#0a1626" />
          </linearGradient>
          <linearGradient id="pm-chip-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f3d27a" />
            <stop offset="0.5" stopColor="#e0b15a" />
            <stop offset="1" stopColor="#caa14b" />
          </linearGradient>
        </defs>

        {/* Card body */}
        <rect x="1" y="1" width="38" height="28" rx="5" fill="url(#pm-card-grad)" stroke="#24354a" strokeWidth="0.8" />

        {/* Contactless waves (top-right) */}
        <g fill="none" stroke="#7fd1d1" strokeWidth="1.1" strokeLinecap="round" opacity="0.92">
          <path d="M30 8.5a4.2 4.2 0 0 1 0 6.2" />
          <path d="M33 6.8a6.6 6.6 0 0 1 0 9.6" />
        </g>

        {/* EMV chip */}
        <rect x="5" y="10.5" width="9" height="7" rx="1.4" fill="url(#pm-chip-grad)" />
        <g stroke="#9c7a2e" strokeWidth="0.5" opacity="0.55">
          <line x1="5" y1="14" x2="14" y2="14" />
          <line x1="9.5" y1="10.5" x2="9.5" y2="17.5" />
        </g>

        {/* Bottom accent — subtle highlight line */}
        <rect x="5" y="23" width="13" height="2" rx="1" fill="#3a5168" opacity="0.7" />
      </svg>
    </span>
  );
}

export default function PaymentMethodSelector({ value, onChange }) {
  const { isRTL, lang } = useLanguage();

  const options = [
    {
      value: 'cash_on_delivery',
      labelEn: 'Cash on Delivery',
      labelAr: 'الدفع عند الاستلام',
      descEn: 'Pay with cash when your order arrives',
      descAr: 'ادفع نقدًا عند استلام طلبك',
      Badge: CashBadge,
    },
    {
      value: 'paypal',
      labelEn: 'Buy with Credit/Debit',
      labelAr: 'الدفع ببطاقة ائتمان/صراف',
      descEn: 'Visa, Mastercard, or Apple Pay',
      descAr: 'فيزا، ماستركارد، أو Apple Pay',
      Badge: CardBadge,
    },
  ];

  return (
    <div className="space-y-2.5" dir={isRTL ? 'rtl' : 'ltr'}>
      {options.map((opt) => {
        const selected = value === opt.value;
        const { Badge } = opt;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={selected}
            className={`payment-method ${selected ? 'payment-method--active' : ''}`}
          >
            <Badge />

            <span className="payment-method__text min-w-0 flex-1">
              <span className="payment-method__title">
                {isRTL ? opt.labelAr : opt.labelEn}
              </span>
              <span className="payment-method__desc">
                {isRTL ? opt.descAr : opt.descEn}
              </span>
            </span>

            <span className="payment-method__radio" aria-hidden="true">
              <AnimatePresence>
                {selected && (
                  <motion.span
                    key="check"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 24 }}
                    className="payment-method__check"
                  >
                    <Check className="w-3 h-3" strokeWidth={3.5} />
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
          </button>
        );
      })}
    </div>
  );
}