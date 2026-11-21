import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLanguage } from '@/lib/i18n';
import { useCart } from '@/lib/CartContext';
import { useFlyToCart } from '@/lib/flyToCart';
import { useMutation, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ShoppingCart, X, Trash2, Package, ChevronRight, CheckCircle2, Loader2, Tag, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import PaymentMethodSelector from '@/components/marketplace/PaymentMethodSelector';
import { toast } from 'sonner';
import PayPalButtons from '@/components/payment/PayPalButtons';
import { useNavigate } from '@/lib/router-compat';
import { formatPriceJOD } from '@/lib/currency';



export default function CartDrawer({ open, onClose }) {
  const { lang, isRTL } = useLanguage();
  const navigate = useNavigate();
  const { items, removeFromCart, updateQty, clearCart, total, byRetailer } = useCart();
  const [checkoutStep, setCheckoutStep] = useState('cart'); // cart | checkout | success
  const [form, setForm] = useState({ customer_name: '', customer_phone: '', customer_email: '', delivery_address: '', city: '', notes: '' });
  const [payment, setPayment] = useState('cash_on_delivery');
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null); // { code, discount_type, discount_value }
  const [promoLoading, setPromoLoading] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const { flyToCart, flyFromCart } = useFlyToCart();
  const imgRefs = useRef({});
  const payBlockRef = useRef(null);
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const retailerIds = useMemo(() => Object.keys(byRetailer), [byRetailer]);

  const { data: retailers = [] } = useQuery({
    queryKey: ['cart-retailers', retailerIds],
    queryFn: async () => Promise.all(retailerIds.map(id => base44.entities.Retailer.get(id).catch(() => null))),
    enabled: retailerIds.length > 0,
  });

  const deliveryFee = retailers.reduce((sum, r) => sum + (r && r.delivery_fee_enabled ? (r.delivery_fee || 0) : 0), 0);

  const orderMutation = useMutation({
    mutationFn: async (data) => {
      const res = await base44.functions.invoke('createMarketplaceOrder', data);
      if (res.data?.error) throw new Error(res.data.error);
      return res.data;
    },
    onSuccess: () => {
      setCheckoutStep('success');
      clearCart();
    },
  });

  const discount = appliedPromo
    ? appliedPromo.discount_type === 'percentage'
      ? total * (appliedPromo.discount_value / 100)
      : Math.min(appliedPromo.discount_value, total)
    : 0;
  const finalTotal = Math.max(0, total - discount) + deliveryFee;

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    try {
      const allCodes = await base44.entities.PromoCode.filter({ code: promoCode.trim().toUpperCase() });
      const code = allCodes.find(c => c.is_active && (!c.expires_at || new Date(c.expires_at) >= new Date()) && (c.max_uses === 0 || c.uses_count < c.max_uses));
      if (!code) {
        toast.error(isRTL ? 'الكود غير صالح أو منتهي' : 'Invalid or expired promo code');
        return;
      }
      if (code.min_order_amount > 0 && total < code.min_order_amount) {
        toast.error(isRTL ? `الحد الأدنى للطلب ${formatPriceJOD(code.min_order_amount, lang)}` : `Minimum order is ${formatPriceJOD(code.min_order_amount, lang)}`);
        return;
      }
      setAppliedPromo(code);
      toast.success(isRTL ? 'تم تطبيق الكود بنجاح!' : 'Promo code applied!');
    } catch {
      toast.error(isRTL ? 'فشل التحقق من الكود' : 'Failed to validate code');
    } finally {
      setPromoLoading(false);
    }
  };

  // For cash-on-delivery, prices and totals are recomputed server-side by the
  // createMarketplaceOrder backend function — only cart item ids/quantities and
  // delivery details are sent. (PayPal checkout uses PayPalButtons instead.)
  const buildOrderPayload = () => ({
    customer_name: form.customer_name,
    customer_phone: form.customer_phone,
    customer_email: form.customer_email,
    delivery_address: form.delivery_address,
    city: form.city,
    notes: form.notes,
    items: items.map(i => ({ product_id: i.product.id, quantity: i.quantity })),
    promoCode: appliedPromo?.code || '',
  });

  const isDeliveryFormValid = form.customer_name && form.customer_phone && form.delivery_address;

  const handlePlaceOrder = () => {
    if (!isDeliveryFormValid) {
      toast.error(isRTL ? 'يرجى إكمال بيانات التوصيل' : 'Please fill in delivery details');
      return;
    }
    orderMutation.mutate(buildOrderPayload());
  };

  const retailerKeys = Object.keys(byRetailer);

  // Bring the payment options into view as soon as PayPal is chosen: they sit at
  // the end of the scrollable checkout area, so the buyer should not have to
  // hunt for them after switching the payment method.
  useEffect(() => {
    if (checkoutStep !== 'checkout' || payment !== 'paypal') return;
    const id = setTimeout(() => payBlockRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
    return () => clearTimeout(id);
  }, [checkoutStep, payment]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-[999]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: isRTL ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: isRTL ? '-100%' : '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className={`fixed top-0 ${isRTL ? 'left-0' : 'right-0'} h-full w-full max-w-md bg-background z-[1000] shadow-2xl flex flex-col`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-teal-100">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-teal-600" />
                <h2 className="font-bold text-lg text-foreground">
                  {checkoutStep === 'cart'     ? (isRTL ? 'سلة التسوق' : 'Your Cart') :
                   checkoutStep === 'checkout' ? (isRTL ? 'تأكيد الطلب'  : 'Checkout') :
                   (isRTL ? 'تم الطلب' : 'Order Placed')}
                </h2>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">

                {/* CART VIEW */}
                {checkoutStep === 'cart' && (
                  <motion.div key="cart" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 space-y-5">
                    {items.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
                        <ShoppingCart className="w-12 h-12 opacity-20" />
                        <p className="text-sm">{isRTL ? 'سلتك فارغة' : 'Your cart is empty'}</p>
                        <Button variant="outline" onClick={() => { onClose(); window.location.href = '/marketplace'; }} className="rounded-full border-teal-200 text-teal-600">
                          {isRTL ? 'تسوق الآن' : 'Start Shopping'}
                        </Button>
                      </div>
                    ) : (
                      <>
                        {/* Items grouped by retailer */}
                        {retailerKeys.map(rid => {
                          const group = byRetailer[rid];
                          const gName = lang === 'ar' ? group.retailer_name_ar : group.retailer_name_en;
                          return (
                            <div key={rid}>
                              <div className="flex items-center gap-2 mb-2">
                                <Package className="w-4 h-4 text-teal-500" />
                                <span className="text-xs font-semibold text-teal-700">{gName}</span>
                              </div>
                              <div className="space-y-2">
                                {group.items.map(({ product, quantity }) => {
                                  const pName = lang === 'ar' ? product.name_ar : product.name_en;
                                  return (
                                    <div key={product.id} className="flex items-center gap-3 bg-card rounded-xl p-3 border border-teal-100">
                                      <img ref={el => { if (el) imgRefs.current[product.id] = el; }} src={product.image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=60&q=80'} alt="" decoding="async"
                                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate">{pName}</p>
                                        <p className="text-xs text-teal-700 font-semibold">{formatPriceJOD(product.price, lang)}</p>
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        <button onClick={() => { flyFromCart(imgRefs.current[product.id]); requestAnimationFrame(() => quantity === 1 ? removeFromCart(product.id) : updateQty(product.id, quantity - 1)); }}
                                          className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-bold hover:bg-teal-200">−</button>
                                        <span className="w-5 text-center text-sm font-bold">{quantity}</span>
                                        <button onClick={() => { flyToCart(imgRefs.current[product.id]); requestAnimationFrame(() => updateQty(product.id, quantity + 1)); }}
                                          className="w-6 h-6 rounded-full bg-teal-500 text-white flex items-center justify-center text-sm font-bold hover:bg-teal-600">+</button>
                                      </div>
                                      <button onClick={() => removeFromCart(product.id)} className="text-muted-foreground hover:text-red-500 transition">
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}

                        {/* Multi-retailer notice */}
                        {retailerKeys.length > 1 && (
                          <div className="bg-teal-50 border border-teal-100 rounded-xl p-3 text-xs text-teal-700 flex items-start gap-2">
                            <Package className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span>
                              {isRTL
                                ? `طلبك يشمل ${retailerKeys.length} متاجر — سيتم شحن جميع المنتجات معاً في طلب واحد`
                                : `Your order includes ${retailerKeys.length} stores — all items will be shipped together in one order`}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </motion.div>
                )}

                {/* CHECKOUT VIEW */}
                {checkoutStep === 'checkout' && (
                  <motion.div key="checkout" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 space-y-5">
                    <div className="space-y-3">
                      <h3 className="font-semibold text-sm">{isRTL ? 'بيانات التوصيل' : 'Delivery Details'}</h3>
                      {[
                        { k: 'customer_name',   labelEn: 'Full Name',        labelAr: 'الاسم الكامل',      type: 'text',  required: true  },
                        { k: 'customer_phone',  labelEn: 'Phone',            labelAr: 'رقم الهاتف',        type: 'tel',   required: true  },
                        { k: 'customer_email',  labelEn: 'Email (optional)', labelAr: 'البريد (اختياري)',  type: 'email', required: false },
                        { k: 'delivery_address',labelEn: 'Delivery Address', labelAr: 'عنوان التوصيل',     type: 'text',  required: true  },
                        { k: 'city',            labelEn: 'City',             labelAr: 'المدينة',           type: 'text',  required: false },
                      ].map(f => (
                        <div key={f.k}>
                          <Label className="text-xs text-muted-foreground mb-1">{isRTL ? f.labelAr : f.labelEn}{f.required && ' *'}</Label>
                          <Input type={f.type} value={form[f.k]} onChange={e => update(f.k, e.target.value)}
                            className="h-10 rounded-xl border-teal-100 text-sm" />
                        </div>
                      ))}
                    </div>

                    {/* Promo Code */}
                    <div>
                      <h3 className="font-semibold text-sm mb-2">{isRTL ? 'كود الخصم' : 'Promo Code'}</h3>
                      {appliedPromo ? (
                        <div className="flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-xl px-3 py-2.5">
                          <CheckCheck className="w-4 h-4 text-teal-600 flex-shrink-0" />
                          <span className="font-mono font-bold text-teal-700 text-sm flex-1">{appliedPromo.code}</span>
                          <span className="text-xs text-teal-600 font-semibold">
                            -{appliedPromo.discount_type === 'percentage' ? `${appliedPromo.discount_value}%` : formatPriceJOD(appliedPromo.discount_value, lang)}
                          </span>
                          <button onClick={() => { setAppliedPromo(null); setPromoCode(''); }} className="text-muted-foreground hover:text-red-500 transition-colors">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input value={promoCode} onChange={e => setPromoCode(e.target.value.toUpperCase())}
                              onKeyDown={e => e.key === 'Enter' && handleApplyPromo()}
                              placeholder={isRTL ? 'أدخل كود الخصم' : 'Enter promo code'}
                              className="h-10 rounded-xl border-teal-100 text-sm font-mono pl-9" />
                          </div>
                          <Button onClick={handleApplyPromo} disabled={promoLoading || !promoCode.trim()}
                            className="h-10 px-4 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm flex-shrink-0">
                            {promoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isRTL ? 'تطبيق' : 'Apply')}
                          </Button>
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="font-semibold text-sm mb-2">{isRTL ? 'طريقة الدفع' : 'Payment Method'}</h3>
                      <PaymentMethodSelector value={payment} onChange={setPayment} />
                    </div>

                    {/* Order summary */}
                    <div className="bg-teal-50 rounded-xl p-4 space-y-2 text-sm">
                      <div className="flex justify-between text-muted-foreground">
                        <span>{isRTL ? 'المجموع الفرعي' : 'Subtotal'}</span>
                        <span>{formatPriceJOD(total, lang)}</span>
                      </div>
                      {appliedPromo && discount > 0 && (
                        <div className="flex justify-between text-teal-600 font-medium">
                          <span>{isRTL ? 'الخصم' : 'Discount'} ({appliedPromo.code})</span>
                          <span>-{formatPriceJOD(discount, lang)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-muted-foreground">
                        <span>{isRTL ? 'رسوم التوصيل' : 'Delivery'}</span>
                        <span>{deliveryFee > 0 ? formatPriceJOD(deliveryFee, lang) : (isRTL ? 'مجاني' : 'Free')}</span>
                      </div>
                      <div className="flex justify-between font-bold text-teal-700 border-t border-teal-200 pt-2">
                        <span>{isRTL ? 'الإجمالي' : 'Total'}</span>
                        <span>{formatPriceJOD(finalTotal, lang)}</span>
                      </div>
                    </div>

                    {/* Payment lives inside the scrollable area (not the fixed
                        footer) so the card form and its Pay button can always be
                        reached by scrolling, on mobile too. */}
                    {payment === 'paypal' && (
                      <div className="pt-1 scroll-mt-4" ref={payBlockRef}>
                        {isDeliveryFormValid ? (
                          <PayPalButtons
                            context={{
                              type: 'marketplace_order',
                              items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
                              promoCode: appliedPromo?.code || '',
                            }}
                            record={{
                              customer_name: form.customer_name,
                              customer_phone: form.customer_phone,
                              customer_email: form.customer_email,
                              delivery_address: form.delivery_address,
                              city: form.city,
                              notes: appliedPromo ? `Promo: ${appliedPromo.code}` : (form.notes || ''),
                            }}
                            source="/marketplace"
                            onSuccess={(orderRecord) => {
                              clearCart();
                              onClose();
                              navigate(`/thank-you?id=${orderRecord?.id || ''}&type=marketplace_order`);
                            }}
                          />
                        ) : (
                          <p className="text-xs text-muted-foreground text-center">
                            {isRTL ? 'أكمل بيانات التوصيل أعلاه لعرض خيارات الدفع' : 'Complete the delivery details above to see the payment options'}
                          </p>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* SUCCESS VIEW */}
                {checkoutStep === 'success' && (
                  <motion.div key="success" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center justify-center py-16 px-6 text-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-teal-50 border-4 border-teal-200 flex items-center justify-center">
                      <CheckCircle2 className="w-10 h-10 text-teal-500" />
                    </div>
                    <h2 className="text-xl font-bold">{isRTL ? 'تم تأكيد طلبك!' : 'Order Confirmed!'}</h2>
                    <p className="text-sm text-muted-foreground max-w-xs">
                      {isRTL
                        ? 'شكراً لطلبك! سيتم توصيل جميع المنتجات من مختلف المتاجر دفعة واحدة إلى عنوانك.'
                        : 'Thank you! All products from the different stores will be shipped together to your address.'}
                    </p>
                    <Button onClick={onClose} className="bg-teal-500 hover:bg-teal-600 text-white rounded-full px-6">
                      {isRTL ? 'مواصلة التسوق' : 'Continue Shopping'}
                    </Button>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* Footer Actions */}
            {checkoutStep === 'cart' && items.length > 0 && (
              <div className="p-4 border-t border-teal-100 space-y-2">
                <div className="flex justify-between items-center text-sm mb-3">
                  <span className="text-muted-foreground">{isRTL ? 'الإجمالي' : 'Total'}</span>
                  <span className="text-xl font-bold text-teal-700">{formatPriceJOD(total, lang)}</span>
                </div>
                {confirmClear ? (
                  <div className="flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 p-2.5">
                    <Trash2 className="w-4 h-4 text-teal-600 flex-shrink-0 ms-1" />
                    <span className="text-sm text-teal-700 font-medium flex-1">
                      {isRTL ? 'حذف كل المنتجات؟' : 'Delete all products?'}
                    </span>
                    <Button onClick={() => { clearCart(); setConfirmClear(false); toast.success(isRTL ? 'تم إفراغ السلة' : 'Cart cleared'); }}
                      className="h-9 px-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-xs font-semibold">
                      {isRTL ? 'نعم' : 'Yes'}
                    </Button>
                    <Button variant="outline" onClick={() => setConfirmClear(false)}
                      className="h-9 px-3 rounded-lg border-teal-200 text-teal-700 text-xs font-semibold">
                      {isRTL ? 'إلغاء' : 'Cancel'}
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" onClick={() => setConfirmClear(true)}
                    className="w-full rounded-xl border-teal-200 text-teal-700 hover:bg-teal-50 h-11 font-semibold gap-2">
                    <Trash2 className="w-4 h-4" />
                    {isRTL ? 'حذف كل المنتجات' : 'Delete All Products'}
                  </Button>
                )}
                <Button onClick={() => setCheckoutStep('checkout')}
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white rounded-xl h-12 font-semibold gap-2">
                  {isRTL ? 'إتمام الطلب' : 'Proceed to Checkout'}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {checkoutStep === 'checkout' && (
              <div className="p-4 border-t border-teal-100 flex items-center gap-3">
                <Button variant="outline" onClick={() => setCheckoutStep('cart')}
                  className={payment === 'paypal'
                    ? 'w-full rounded-xl border-teal-200 text-teal-700 h-11'
                    : 'flex-1 rounded-xl border-teal-200 text-teal-700 h-11'}>
                  {isRTL ? 'رجوع' : 'Back'}
                </Button>
                {payment !== 'paypal' && (
                  <Button onClick={handlePlaceOrder} disabled={orderMutation.isPending}
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-11 font-semibold">
                    {orderMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : (isRTL ? 'تأكيد الطلب' : 'Place Order')}
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}