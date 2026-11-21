import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from '@/lib/router-compat';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, Loader2, XCircle, Package, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPriceJOD } from '@/lib/currency';

const ENTITY_FOR = {
  marketplace_order: 'Order',
  doctor_consultation: 'Booking',
  hospital_booking: 'HospitalBooking',
  package: 'Booking',
};

/**
 * ThankYou — shown after a verified PayPal capture for a marketplace order
 * (and reachable for any checkout type). It reads the saved record by id and
 * shows the order number, customer email, items and total. The record is only
 * displayed after the server confirmed the capture — this page never marks
 * anything paid on its own.
 */
export default function ThankYou() {
  const { isRTL, lang } = useLanguage();
  const [params] = useSearchParams();
  const id = params.get('id');
  const type = params.get('type') || 'marketplace_order';
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    if (!id) { setError(isRTL ? 'لا يوجد معرف للطلب.' : 'No order id found.'); setLoading(false); return; }
    const entity = ENTITY_FOR[type] || 'Order';
    base44.entities[entity].get(id)
      .then((r) => { if (!cancelled) { setRecord(r); setLoading(false); } })
      .catch((e) => { if (!cancelled) { setError(e.message || 'Not found'); setLoading(false); } });
    return () => { cancelled = true; };
  }, [id, type]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 flex flex-col items-center text-center">
        <Loader2 className="w-10 h-10 text-teal-500 animate-spin mb-4" />
        <p className="text-sm text-muted-foreground">{isRTL ? 'جاري تحميل تفاصيل طلبك…' : 'Loading your order…'}</p>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-10 h-10 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2">{isRTL ? 'تعذّر العثور على الطلب' : 'Order not found'}</h1>
          <p className="text-sm text-muted-foreground mb-6">{error || (isRTL ? 'لم نتمكن من العثور على هذا الطلب.' : 'We could not find this order.')}</p>
          <Link to="/"><Button variant="outline" className="rounded-xl">{isRTL ? 'العودة للرئيسية' : 'Back home'}</Button></Link>
        </motion.div>
      </div>
    );
  }

  const items = Array.isArray(record.items) ? record.items : [];
  const customerEmail = record.customer_email || record.patient_email;
  const customerName = record.customer_name || record.patient_name;
  const total = record.total_amount;
  const isOrder = type === 'marketplace_order';

  return (
    <div className="max-w-lg mx-auto px-4 py-10 text-center">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">{isRTL ? 'شكراً لك! تم تأكيد طلبك' : 'Thank you! Your order is confirmed'}</h1>
        <p className="text-sm text-muted-foreground mb-1">
          {isRTL ? 'رقم الطلب' : 'Order number'}: <strong className="text-foreground font-mono">#{record.id}</strong>
        </p>
        {customerName && (
          <p className="text-sm text-muted-foreground">{isRTL ? `شكراً لك، ${customerName}` : `Thank you, ${customerName}`}</p>
        )}
      </motion.div>

      <div className="bg-card rounded-2xl border border-teal-100 p-5 mt-6 text-start space-y-3">
        {isOrder && items.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Package className="w-4 h-4 text-teal-500" />
              {isRTL ? 'المنتجات' : 'Items'}
            </div>
            {items.map((it, i) => {
              const itName = lang === 'ar' ? (it.product_name_ar || it.product_name_en) : (it.product_name_en || it.product_name_ar);
              return (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{itName} × {it.quantity}</span>
                  <span className="text-muted-foreground">{formatPriceJOD(it.subtotal, lang)}</span>
                </div>
              );
            })}
          </div>
        )}
        {isOrder && record.delivery_address && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-teal-500" />
            <span>{record.delivery_address}{record.city ? `, ${record.city}` : ''}</span>
          </div>
        )}
        {customerEmail && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="w-4 h-4 flex-shrink-0 text-teal-500" />
            <span dir="ltr">{customerEmail}</span>
          </div>
        )}
        {typeof total === 'number' && (
          <div className="flex justify-between font-bold text-teal-700 border-t border-teal-100 pt-3">
            <span>{isRTL ? 'الإجمالي' : 'Total'}</span>
            <span>{formatPriceJOD(total, lang)}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
        {isOrder ? (
          <Link to="/marketplace"><Button className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl">{isRTL ? 'مواصلة التسوق' : 'Continue Shopping'}</Button></Link>
        ) : (
          <Link to="/"><Button className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl">{isRTL ? 'متابعة' : 'Continue'}</Button></Link>
        )}
        <Link to="/"><Button variant="outline" className="rounded-xl">{isRTL ? 'العودة للرئيسية' : 'Back home'}</Button></Link>
      </div>
    </div>
  );
}