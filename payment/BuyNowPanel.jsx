import React, { useState } from 'react';
import { useNavigate } from '@/lib/router-compat';
import { useLanguage } from '@/lib/i18n';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PayPalButtons from '@/components/payment/PayPalButtons';
import { formatPriceJOD } from '@/lib/currency';

/**
 * BuyNowPanel — a quick single-product checkout opened from a product page.
 * It collects the minimum delivery details required for a marketplace order,
 * then renders the same server-validated PayPal JS SDK buttons (PayPalButtons)
 * with a one-item cart. On a verified capture it redirects to the Thank You
 * page with the new order id. Price and quantity come from the product data
 * (quantity is 1); the amount is re-validated server-side.
 */
export default function BuyNowPanel({ product, open, onClose }) {
  const { isRTL, lang } = useLanguage();
  const navigate = useNavigate();
  const [form, setForm] = useState({ customer_name: '', customer_phone: '', customer_email: '', delivery_address: '', city: '' });
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const valid = !!form.customer_name && !!form.customer_phone && !!form.delivery_address;

  const name = lang === 'ar' ? product.name_ar : product.name_en;

  const handleSuccess = (record) => {
    onClose();
    navigate(`/thank-you?id=${record?.id || ''}&type=marketplace_order`);
  };

  const fields = [
    { k: 'customer_name',    lEn: 'Full Name *',       lAr: 'الاسم الكامل *',    type: 'text' },
    { k: 'customer_phone',   lEn: 'Phone *',           lAr: 'رقم الهاتف *',      type: 'tel' },
    { k: 'customer_email',   lEn: 'Email (optional)',  lAr: 'البريد (اختياري)',   type: 'email' },
    { k: 'delivery_address', lEn: 'Delivery Address *', lAr: 'عنوان التوصيل *',  type: 'text' },
    { k: 'city',             lEn: 'City (optional)',   lAr: 'المدينة (اختياري)',  type: 'text' },
  ];

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-md" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle>{isRTL ? 'اشترِ الآن' : 'Buy Now'}</DialogTitle>
          <DialogDescription>
            {name} · {formatPriceJOD(product.price, lang)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {fields.map((f) => (
            <div key={f.k} className="space-y-1">
              <Label className="text-xs text-muted-foreground">{isRTL ? f.lAr : f.lEn}</Label>
              <Input type={f.type} value={form[f.k]} onChange={(e) => update(f.k, e.target.value)} className="h-10 rounded-xl border-teal-100 text-sm" dir={f.type === 'tel' || f.type === 'email' ? 'ltr' : undefined} />
            </div>
          ))}

          <div className="pt-1">
            {valid ? (
              <PayPalButtons
                context={{ type: 'marketplace_order', items: [{ product_id: product.id, quantity: 1 }] }}
                record={{ ...form, notes: '' }}
                source={`/products/${product.id}`}
                onSuccess={handleSuccess}
              />
            ) : (
              <p className="text-sm text-muted-foreground text-center py-2">
                {isRTL ? 'أكمل بيانات التوصيل للمتابعة إلى الدفع.' : 'Complete delivery details to continue to payment.'}
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}