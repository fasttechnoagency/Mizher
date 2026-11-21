import React, { useState, useEffect } from 'react';
import { Link } from '@/lib/router-compat';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n';
import { CheckCircle2, XCircle, Loader2, ShieldCheck } from 'lucide-react';
import { capturePaypalOrder } from '@/lib/paypalPayment';
import { Button } from '@/components/ui/button';

/**
 * PaymentReturn — PayPal redirects here after the buyer approves on the
 * hosted checkout. We capture + verify the payment SERVER-SIDE before showing
 * any success state; the internal booking/order is created exactly once
 * (idempotent on repeated returns). No success is shown on return alone.
 */
export default function PaymentReturn() {
  const { isRTL } = useLanguage();
  const [state, setState] = useState('verifying'); // verifying | success | failed
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (!token) {
      setState('failed');
      setError(isRTL ? 'لا يوجد معرف طلب.' : 'No order token found.');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await capturePaypalOrder(token);
        if (cancelled) return;
        if (res.success) {
          setData(res);
          setState('success');
        } else {
          setError(res.error || (isRTL ? 'فشل التحقق من الدفع.' : 'Payment verification failed.'));
          setState('failed');
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.message || (isRTL ? 'فشل التحقق من الدفع.' : 'Payment verification failed.'));
          setState('failed');
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const sourcePath = data?.source_path || '/';
  const name = data?.record?.patient_name || data?.record?.customer_name;

  if (state === 'verifying') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 flex flex-col items-center text-center">
        <Loader2 className="w-10 h-10 text-teal-500 animate-spin mb-4" />
        <h1 className="text-xl font-bold">{isRTL ? 'جاري التحقق من الدفع…' : 'Verifying your payment…'}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isRTL ? 'يرجى الانتظار حتى نؤكد عملية الدفع مع PayPal.' : 'Please wait while we confirm your payment with PayPal.'}
        </p>
      </div>
    );
  }

  if (state === 'failed') {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2">{isRTL ? 'لم يكتمل الدفع' : 'Payment not completed'}</h1>
          <p className="text-sm text-muted-foreground mb-6">
            {error || (isRTL ? 'تعذّر تأكيد العملية.' : 'We could not confirm this transaction.')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to={sourcePath}>
              <Button className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl">{isRTL ? 'إعادة المحاولة' : 'Try again'}</Button>
            </Link>
            <Link to="/">
              <Button variant="outline" className="rounded-xl">{isRTL ? 'العودة للرئيسية' : 'Back home'}</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12 text-center">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">{isRTL ? 'تم تأكيد الدفع!' : 'Payment confirmed!'}</h1>
        <p className="text-sm text-muted-foreground mb-6">
          {isRTL ? 'تمت العملية بنجاح وتم إنشاء سجلك.' : 'Your transaction was successful and your record was created.'}
          {name ? (isRTL ? ` شكراً لك، ${name}.` : ` Thank you, ${name}.`) : ''}
        </p>
        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-6">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>{isRTL ? 'تم التحقق من الدفع بأمان عبر PayPal' : 'Verified securely via PayPal'}</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to={sourcePath}>
            <Button className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl">{isRTL ? 'متابعة' : 'Continue'}</Button>
          </Link>
          <Link to="/">
            <Button variant="outline" className="rounded-xl">{isRTL ? 'العودة للرئيسية' : 'Back home'}</Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}