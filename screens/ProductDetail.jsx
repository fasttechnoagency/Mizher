import React, { useState, useRef } from 'react';
import { useParams, Link } from '@/lib/router-compat';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n';
import { useCart } from '@/lib/CartContext';
import { useFlyToCart } from '@/lib/flyToCart';
import { motion } from 'framer-motion';
import { ShoppingCart, Star, ShieldCheck, Package, ArrowLeft, ArrowRight, Plus, Minus, Check, AlertCircle, Loader2, Store, MapPin, Phone, CheckCircle, ChevronRight, Zap } from 'lucide-react';
import CartDrawer from '@/components/marketplace/CartDrawer';
import BuyNowPanel from '@/components/payment/BuyNowPanel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { formatPriceJOD } from '@/lib/currency';

export default function ProductDetail() {
  const { id } = useParams();
  const { lang, isRTL } = useLanguage();
  const { addToCart, items, updateQty, removeFromCart } = useCart();
  const { flyToCart, flyFromCart } = useFlyToCart();
  const imgRef = useRef(null);
  const addBtnRef = useRef(null);
  const [added, setAdded] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [buyNowOpen, setBuyNowOpen] = useState(false);
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  const { data: product, isLoading } = useQuery({
    queryKey: ['retailer-product', id],
    queryFn: () => base44.entities.RetailerProduct.filter({ id }),
    select: (r) => (Array.isArray(r) ? r[0] : r),
  });

  const { data: retailer } = useQuery({
    queryKey: ['retailer', product?.retailer_id],
    queryFn: () => base44.entities.Retailer.filter({ id: product.retailer_id }),
    select: (r) => (Array.isArray(r) ? r[0] : r),
    enabled: !!product?.retailer_id,
  });

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
    </div>
  );

  if (!product) return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <p className="text-muted-foreground">{isRTL ? 'المنتج غير موجود' : 'Product not found'}</p>
      <Link to="/marketplace"><Button variant="outline" className="mt-4 rounded-xl">{isRTL ? 'العودة للمتجر' : 'Back to Marketplace'}</Button></Link>
    </div>
  );

  const name        = lang === 'ar' ? product.name_ar        : product.name_en;
  const description = lang === 'ar' ? product.description_ar : product.description_en;
  const retailerName= lang === 'ar' ? product.retailer_name_ar : product.retailer_name_en;
  const discount    = product.original_price && product.original_price > product.price
    ? Math.round((1 - product.price / product.original_price) * 100) : null;

  const cartItem = items.find(i => i.product.id === product.id);
  const inCart   = !!cartItem;

  const handleAdd = () => {
    flyToCart(imgRef.current, { from: addBtnRef.current });
    requestAnimationFrame(() => {
      addToCart(product);
      setAdded(true);
      toast.success(isRTL ? `تمت الإضافة: ${name}` : `Added: ${name}`);
      setTimeout(() => setAdded(false), 2000);
    });
  };

  const CATEGORY_LABELS = {
    supplements: { en: 'Supplements', ar: 'مكملات غذائية' },
    devices:     { en: 'Medical Devices', ar: 'أجهزة طبية' },
    care_tools:  { en: 'Care Tools', ar: 'أدوات العناية' },
    medications: { en: 'Medications', ar: 'أدوية' },
    cosmetics:   { en: 'Cosmetics', ar: 'مستحضرات تجميل' },
    baby_care:   { en: 'Baby Care', ar: 'رعاية الأطفال' },
    other:       { en: 'Other', ar: 'أخرى' },
  };
  const catLabel = CATEGORY_LABELS[product.category]?.[lang] || product.category;

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
      {/* Back */}
      <Link to="/marketplace" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-teal-600 mb-6 transition-colors">
        <BackArrow className="w-4 h-4" />
        {isRTL ? 'العودة للمتجر' : 'Back to Marketplace'}
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Image */}
        <div className="space-y-3">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-teal-50 border border-teal-100">
            <img
              ref={imgRef}
              src={product.image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80'}
              alt={name}
              decoding="async"
              className="w-full h-full object-contain"
            />
            {discount && (
              <div className="absolute top-3 left-3 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow">
                -{discount}%
              </div>
            )}
            {product.doctor_recommended && (
              <div className="absolute top-3 right-3 bg-teal-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow">
                <ShieldCheck className="w-3.5 h-3.5" />
                {isRTL ? 'موصى به طبياً' : 'Doctor Recommended'}
              </div>
            )}
            {product.requires_prescription && (
              <div className="absolute bottom-3 left-3 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                Rx {isRTL ? 'بوصفة طبية' : 'Prescription Required'}
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-5">
          {/* Category + retailer */}
          <div className="flex items-center gap-2 flex-wrap">
            {catLabel && <Badge className="bg-teal-50 text-teal-700 border-0 text-xs">{catLabel}</Badge>}
            {product.requires_prescription && <Badge className="bg-orange-100 text-orange-700 border-0 text-xs">Rx</Badge>}
            {product.local_product && <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">{isRTL ? 'منتج محلي' : 'Local Product'}</Badge>}
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">{name}</h1>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-muted/30'}`} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">{product.rating} ({product.reviews_count || 0} {isRTL ? 'تقييم' : 'reviews'})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-end gap-3">
            <span className="text-3xl font-bold text-teal-700">{formatPriceJOD(product.price, lang)}</span>
            {product.original_price > product.price && (
              <span className="text-lg text-muted-foreground line-through">{formatPriceJOD(product.original_price, lang)}</span>
            )}
            {discount && <span className="text-sm font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">{isRTL ? `وفر ${discount}%` : `Save ${discount}%`}</span>}
          </div>

          {/* Stock */}
          {product.stock_quantity !== undefined && (
            <div className={`flex items-center gap-2 text-sm font-medium ${
              product.stock_quantity === 0 ? 'text-red-500' :
              product.stock_quantity < 10 ? 'text-orange-500' : 'text-emerald-600'
            }`}>
              {product.stock_quantity === 0 ? (
                <><AlertCircle className="w-4 h-4" />{isRTL ? 'نفذ المخزون' : 'Out of Stock'}</>
              ) : product.stock_quantity < 10 ? (
                <><AlertCircle className="w-4 h-4" />{isRTL ? `باقي ${product.stock_quantity} فقط` : `Only ${product.stock_quantity} left`}</>
              ) : (
                <><CheckCircle className="w-4 h-4" />{isRTL ? 'متوفر في المخزون' : 'In Stock'}</>
              )}
            </div>
          )}

          {/* Add to cart */}
          <div className="space-y-3">
            <div className="flex gap-3">
              {inCart ? (
                <div className="flex items-center gap-3 bg-teal-50 rounded-xl px-4 py-3 border border-teal-200">
                  <button onClick={(e) => { flyFromCart(imgRef.current, { from: e.currentTarget }); requestAnimationFrame(() => cartItem.quantity === 1 ? removeFromCart(product.id) : updateQty(product.id, cartItem.quantity - 1)); }}
                    className="w-8 h-8 rounded-full bg-white text-teal-700 border border-teal-200 flex items-center justify-center hover:bg-teal-100 transition">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-lg font-bold text-teal-700 w-6 text-center">{cartItem.quantity}</span>
                  <button onClick={(e) => { flyToCart(imgRef.current, { from: e.currentTarget }); requestAnimationFrame(() => updateQty(product.id, cartItem.quantity + 1)); }}
                    className="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center hover:bg-teal-600 transition">
                    <Plus className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-teal-600 font-medium ms-1">{isRTL ? 'في السلة' : 'In Cart'}</span>
                </div>
              ) : (
                <Button ref={addBtnRef} onClick={handleAdd} disabled={product.stock_quantity === 0}
                  className={`flex-1 h-12 rounded-xl gap-2 font-semibold text-base ${added ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-teal-500 hover:bg-teal-600'} text-white`}>
                  {added ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                  {added ? (isRTL ? 'تمت الإضافة ✓' : 'Added ✓') : (isRTL ? 'أضف إلى السلة' : 'Add to Cart')}
                </Button>
              )}
            </div>
            {inCart && (
              <Button onClick={() => setCartOpen(true)}
                className="w-full h-12 rounded-xl gap-2 font-semibold text-base bg-teal-700 hover:bg-teal-800 text-white">
                <ShoppingCart className="w-5 h-5" />
                {isRTL ? 'الذهاب إلى الدفع' : 'Go to Checkout'}
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
            <Button onClick={() => setBuyNowOpen(true)} disabled={product.stock_quantity === 0}
              className="w-full h-12 rounded-xl gap-2 font-semibold text-base bg-slate-900 hover:bg-slate-800 text-white">
              <Zap className="w-5 h-5" />
              {isRTL ? 'اشترِ الآن' : 'Buy Now'}
            </Button>
          </div>
          <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
          <BuyNowPanel product={product} open={buyNowOpen} onClose={() => setBuyNowOpen(false)} />

          {/* Description */}
          {description && (
            <div className="bg-muted/40 rounded-xl p-4">
              <h3 className="text-sm font-semibold mb-2">{isRTL ? 'وصف المنتج' : 'Product Description'}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>
          )}

          {/* Product info table */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">{isRTL ? 'تفاصيل المنتج' : 'Product Details'}</h3>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {[
                { labelEn: 'SKU', labelAr: 'الرمز', value: product.sku },
                { labelEn: 'Unit', labelAr: 'الوحدة', value: product.unit },
                { labelEn: 'Category', labelAr: 'التصنيف', value: catLabel },
                { labelEn: 'Stock', labelAr: 'المخزون', value: product.stock_quantity !== undefined ? `${product.stock_quantity} units` : null },
                { labelEn: 'Prescription', labelAr: 'وصفة طبية', value: product.requires_prescription ? (isRTL ? 'مطلوبة' : 'Required') : (isRTL ? 'غير مطلوبة' : 'Not required') },
              ].filter(r => r.value !== undefined && r.value !== null && r.value !== '').map((row, i) => (
                <div key={i} className={`flex items-center px-4 py-2.5 text-sm ${i % 2 === 0 ? 'bg-muted/20' : ''}`}>
                  <span className="text-muted-foreground w-36 flex-shrink-0">{isRTL ? row.labelAr : row.labelEn}</span>
                  <span className="font-medium text-foreground">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Retailer info card */}
      {retailerName && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="mt-8 bg-card border border-teal-100 rounded-2xl p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Store className="w-4 h-4 text-teal-500" />
            {isRTL ? 'معلومات البائع' : 'Seller Information'}
          </h3>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {retailer?.logo_url ? (
                <img src={retailer.logo_url} alt={retailerName} className="w-full h-full object-cover" />
              ) : (
                <Package className="w-6 h-6 text-teal-600" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">{retailerName}</p>
              <div className="flex items-center gap-4 mt-2 flex-wrap text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-teal-500" />{isRTL ? 'بائع موثق' : 'Verified Seller'}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Doctor recommendation */}
      {product.doctor_recommended && product.recommended_by && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="mt-4 bg-teal-50 border border-teal-200 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-teal-800 text-sm">{isRTL ? 'موصى به من طبيب' : 'Doctor Recommended'}</p>
            <p className="text-xs text-teal-600 mt-0.5">{isRTL ? 'موصى به من: ' : 'Recommended by: '}<span className="font-medium">{product.recommended_by}</span></p>
          </div>
        </motion.div>
      )}
    </div>
  );
}