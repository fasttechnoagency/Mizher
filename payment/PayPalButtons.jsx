import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLanguage } from '@/lib/i18n';
import { loadPaypalSdk, createPaypalOrder, capturePaypalOrder } from '@/lib/paypalPayment';
import { Loader2, AlertCircle, Lock } from 'lucide-react';
import { toast } from 'sonner';
import CardPaymentFields from '@/components/payment/CardPaymentFields';

/**
 * PayPalButtons — the single in-page PayPal JS SDK integration used by ALL
 * checkouts (cart, doctor consultation, hospital booking, treatment package,
 * and product Buy Now).
 *
 * Apple Pay and the standard PayPal button are smart buttons; the Debit/Credit
 * Card entry is rendered inline by <CardPaymentFields> (PayPal Advanced Card
 * Fields) with a Jordan-default, editable country dropdown. Each smart button
 * is only drawn when its funding source is eligible; the card fields are only
 * drawn when CardFields is eligible — no decorative buttons ever.
 *
 * Order creation and capture are SERVER-VALIDATED and SHARED by every method:
 * createOrder calls the backend (which computes the amount from trusted
 * records), and onApprove calls the backend to capture + verify + persist the
 * internal record. The PayPal secret never reaches the browser, and no payment
 * is marked successful from a browser-side event alone.
 *
 * Props:
 *   context  – { type, doctor_id?, consultation_type?, hospital_id?, package_id?, items?, promoCode? }
 *   record   – booking/order snapshot the backend persists after a verified capture.
 *   source   – optional path to return to on failure.
 *   onSuccess(record, checkout_type) – called once after a verified capture.
 *   disabled – when true, the buttons are not rendered (e.g. incomplete form).
 */
export default function PayPalButtons({ context, record, source, onSuccess, disabled }) {
  const { isRTL, lang } = useLanguage();
  const applePayRef = useRef(null);
  const paypalRef = useRef(null);
  const [sdk, setSdk] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const capturedRef = useRef(false);

  // Keep the latest props in refs so the SDK/CardFields instances never need to
  // be re-created on a parent re-render (which would constantly re-mount them).
  const propsRef = useRef({ context, record, source, onSuccess });
  propsRef.current = { context, record, source, onSuccess };
  const rtlRef = useRef(isRTL);
  rtlRef.current = isRTL;

  // Stable, server-validated callbacks shared by the smart buttons and the
  // inline card fields. They read the latest props/RTL via refs at call time.
  const callbacks = useMemo(() => ({
    createOrder: async () => {
      const { context: ctx, record: rec, source: src } = propsRef.current;
      const res = await createPaypalOrder(ctx, rec, src);
      if (!res || !res.orderId) throw new Error(rtlRef.current ? 'تعذّر إنشاء طلب الدفع.' : 'No PayPal order id returned');
      return res.orderId;
    },
    onApprove: async (data) => {
      if (capturedRef.current) return;
      capturedRef.current = true;
      const { context: ctx, record: rec, onSuccess: onOk } = propsRef.current;
      try {
        const res = await capturePaypalOrder(data.orderID, ctx, rec);
        if (res && res.success) {
          onOk?.(res.record, res.checkout_type);
        } else {
          capturedRef.current = false;
          toast.error((res && res.error) || (rtlRef.current ? 'فشل التحقق من الدفع.' : 'Payment verification failed.'));
        }
      } catch (e) {
        capturedRef.current = false;
        toast.error(e.message || (rtlRef.current ? 'فشل التحقق من الدفع.' : 'Payment verification failed.'));
      }
    },
    onCancel: () => {
      toast(rtlRef.current ? 'تم إلغاء الدفع. لم يتم خصم أي مبلغ، ويمكنك المحاولة مرة أخرى.' : 'Payment cancelled. No amount was charged — you can try again.');
    },
    onError: (err) => {
      toast.error(err?.message || (rtlRef.current ? 'حدث خطأ أثناء الدفع. حاول مرة أخرى.' : 'Something went wrong during payment. Please try again.'));
    },
  }), []);

  // Preload the PayPal SDK on mount (and when the locale language changes).
  useEffect(() => {
    let cancelled = false;
    loadPaypalSdk(lang)
      .then((p) => { if (!cancelled) { setSdk(p); setLoading(false); } })
      .catch((e) => { if (!cancelled) { setError(e.message || 'Failed to load PayPal'); setLoading(false); } });
    return () => { cancelled = true; };
  }, [lang]);

  // Render the eligible smart buttons (Apple Pay, PayPal). The Debit/Credit
  // Card entry is handled inline by <CardPaymentFields> below.
  useEffect(() => {
    if (!sdk || disabled) return;
    const paypal = sdk;
    if (!paypal.Buttons || !paypal.FUNDING) return;
    const { createOrder, onApprove, onCancel, onError } = callbacks;
    const targets = [
      { funding: paypal.FUNDING.APPLEPAY, el: applePayRef.current, style: { layout: 'vertical', shape: 'rect', height: 48 } },
      { funding: paypal.FUNDING.PAYPAL, el: paypalRef.current, style: { layout: 'vertical', shape: 'rect', height: 48, color: 'gold' } },
    ];
    const instances = [];
    targets.forEach(({ funding, el, style }) => {
      if (!el) return;
      el.innerHTML = '';
      const btn = paypal.Buttons({ fundingSource: funding, style, createOrder, onApprove, onCancel, onError });
      if (btn.isEligible && btn.isEligible()) {
        btn.render(el).catch(() => {});
        instances.push(btn);
      }
    });
    return () => {
      instances.forEach((b) => { try { b.close && b.close(); } catch { /* ignore */ } });
    };
  }, [sdk, disabled, callbacks]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6" dir={isRTL ? 'rtl' : 'ltr'}>
        <Loader2 className="w-5 h-5 animate-spin text-teal-500 me-2" />
        <span className="text-sm text-muted-foreground">{isRTL ? 'جاري تحميل PayPal…' : 'Loading PayPal…'}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3.5 text-red-700 text-sm" dir={isRTL ? 'rtl' : 'ltr'}>
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <span>{error}</span>
      </div>
    );
  }

  if (disabled) {
    return (
      <div className="rounded-xl border border-dashed border-teal-200 bg-teal-50/50 p-4 text-center text-sm text-muted-foreground" dir={isRTL ? 'rtl' : 'ltr'}>
        {isRTL ? 'أكمل البيانات المطلوبة لتفعيل الدفع.' : 'Complete the required details to enable payment.'}
      </div>
    );
  }

  return (
    <div className="space-y-3" dir={isRTL ? 'rtl' : 'ltr'}>
      <div ref={applePayRef} className="w-full min-h-[48px]" />
      <CardPaymentFields sdk={sdk} {...callbacks} />
      <div ref={paypalRef} className="w-full min-h-[48px]" />
      <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
        <Lock className="w-3 h-3" />
        {isRTL
          ? 'ادفع بأمان عبر Apple Pay أو PayPal أو بطاقة الصراف/الائتمان.'
          : 'Pay securely via Apple Pay, PayPal, or a debit/credit card.'}
      </p>
    </div>
  );
}