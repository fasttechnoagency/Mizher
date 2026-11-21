import React from 'react';
import PaymentCardBrands from '@/components/payment/PaymentCardBrands';

export default function CardPaymentAction({ isRTL, overlayRef, onClick, open, disabled = false }) {
  const Tag = overlayRef ? 'div' : 'button';
  const label = isRTL ? 'بطاقة صراف/ائتمان' : 'Debit or Credit Card';

  return (
    <Tag
      type={overlayRef ? undefined : 'button'}
      role={overlayRef ? 'group' : undefined}
      dir={isRTL ? 'rtl' : 'ltr'}
      className={overlayRef
        ? (open ? 'payment-action-host payment-action-host--open' : 'payment-action-host')
        : 'payment-action'}
      data-disabled={disabled ? 'true' : 'false'}
      disabled={overlayRef ? undefined : disabled}
      aria-disabled={disabled}
      aria-busy={overlayRef && disabled ? true : undefined}
      aria-label={label}
      aria-expanded={overlayRef ? undefined : open}
      onClick={onClick}
    >
      <span className={overlayRef ? 'payment-action' : 'contents'} data-disabled={disabled ? 'true' : 'false'}>
        <span className="payment-action__content">
          <span className="payment-action__label">{label}</span>
          <PaymentCardBrands />
        </span>
      </span>
      {overlayRef && <div ref={overlayRef} className="payment-action__sdk" />}
    </Tag>
  );
}