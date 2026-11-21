import React from 'react';
import { Link } from '@/lib/router-compat';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

/** PaymentCancel — PayPal redirects here if the buyer abandons checkout. */
export default function PaymentCancel() {
  const { isRTL } = useLanguage();
  let source = '/';
  try { source = sessionStorage.getItem('pp_source') || '/'; } catch { /* ignore */ }
  return (
    <div className="max-w-md mx-auto px-4 py-12 text-center">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-10 h-10 text-amber-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">{isRTL ? 'تم إلغاء الدفع' : 'Payment cancelled'}</h1>
        <p className="text-sm text-muted-foreground mb-6">
          {isRTL ? 'لم يتم خصم أي مبلغ. يمكنك المحاولة مرة أخرى في أي وقت.' : 'No amount was charged. You can try again anytime.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to={source}>
            <Button className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl">{isRTL ? 'العودة للدفع' : 'Back to pay'}</Button>
          </Link>
          <Link to="/">
            <Button variant="outline" className="rounded-xl">{isRTL ? 'العودة للرئيسية' : 'Back home'}</Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}