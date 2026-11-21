import React from 'react';
import CardPaymentAction from '@/components/payment/CardPaymentAction';
import useHostedCardButton from '@/components/payment/useHostedCardButton';

export default function HostedCardPayment(props) {
  const { isRTL } = props;
  const { hostRef, status, error, opened, retry } = useHostedCardButton(props);

  return (
    <div className="space-y-2" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardPaymentAction isRTL={isRTL} overlayRef={hostRef} open={opened} disabled={status !== 'ready'} />
      {status === 'loading' && (
        <p role="status" className="text-center text-xs text-muted-foreground">
          {isRTL ? 'جارٍ تجهيز الدفع بالبطاقة…' : 'Preparing card checkout…'}
        </p>
      )}
      {status === 'unavailable' && (
        <p role="status" className="text-sm text-muted-foreground">
          {isRTL ? 'الدفع المباشر بالبطاقة غير متاح لهذه الجلسة. اختر وسيلة الدفع الأخرى أدناه.' : 'Direct card payment is unavailable for this session. Choose the other payment option below.'}
        </p>
      )}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {status === 'failed' && (
        <button type="button" onClick={retry} className="min-h-11 rounded-lg px-3 text-sm font-semibold text-primary underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {isRTL ? 'إعادة المحاولة' : 'Try again'}
        </button>
      )}
    </div>
  );
}