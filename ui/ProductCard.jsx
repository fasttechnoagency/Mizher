import React, { useState, useRef } from 'react';
import { useNavigate } from '@/lib/router-compat';
import { useLanguage } from '@/lib/i18n';
import { useCart } from '@/lib/CartContext';
import { useFlyToCart } from '@/lib/flyToCart';
import { Star, ShieldCheck, ShoppingCart, Plus, Minus, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { usePrefReducedMotion } from '@/components/living-network/useInViewOnce';
import { formatPriceJOD } from '@/lib/currency';

export default function ProductCard({ product, index = 0 }) {
  const { t, lang, isRTL } = useLanguage();
  const navigate = useNavigate();
  const reduce = usePrefReducedMotion();
  const { addToCart, items, updateQty, removeFromCart } = useCart();
  const { flyToCart, flyFromCart } = useFlyToCart();
  const imgRef = useRef(null);
  const [added, setAdded] = useState(false);

  const name = lang === 'ar' ? product.name_ar : product.name_en;
  const desc = lang === 'ar' ? product.description_ar : product.description_en;

  const cartItem = items.find(i => i.product.id === product.id);
  const inCart = !!cartItem;

  const handleAdd = (e) => {
    e.stopPropagation();
    flyToCart(imgRef.current, { from: e.currentTarget });
    requestAnimationFrame(() => {
      addToCart(product);
      setAdded(true);
      toast.success(isRTL ? `تمت الإضافة: ${name}` : `Added: ${name}`);
      setTimeout(() => setAdded(false), 2000);
    });
  };

  const handleInc = (e) => {
    e.stopPropagation();
    flyToCart(imgRef.current, { from: e.currentTarget });
    requestAnimationFrame(() => updateQty(product.id, cartItem.quantity + 1));
  };

  const handleDec = (e) => {
    e.stopPropagation();
    flyFromCart(imgRef.current, { from: e.currentTarget });
    requestAnimationFrame(() =>
      cartItem.quantity === 1 ? removeFromCart(product.id) : updateQty(product.id, cartItem.quantity - 1)
    );
  };

  return (
    <motion.div
      onClick={() => navigate(`/products/${product.id}`)}
      initial={{ opacity: 0, y: 30, rotateX: -6 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      whileHover={{ y: -4 }}
      viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
      transition={{ delay: index * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
      className="cursor-pointer bg-card rounded-2xl overflow-hidden shadow-sm card-border-light border border-teal-500/5 group"
    >
      <div className="relative p-4 pb-0">
        {product.doctor_recommended && (
          <Badge className="absolute top-3 left-3 z-10 bg-teal-500 text-white text-[10px] gap-1 border-0">
            <ShieldCheck className="w-3 h-3" />
            {t('doctorRecommended')}
          </Badge>
        )}
        {product.local_product && (
          <div className="absolute top-3 right-3 z-10 w-6 h-4 bg-gradient-to-b from-black via-white to-green-600 rounded-sm flex items-center justify-center overflow-hidden">
            <div className="absolute left-0 top-0 w-0 h-0 border-t-[8px] border-t-red-600 border-r-[8px] border-r-transparent" />
          </div>
        )}
        <div className="relative aspect-square rounded-xl overflow-hidden bg-teal-50/50 flex items-center justify-center">
          <img
            ref={imgRef}
            src={product.image_url || 'https://via.placeholder.com/200'}
            alt={name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
          />
          {!reduce && (
            <motion.div className="absolute inset-0 origin-bottom bg-teal-500/25" aria-hidden
              initial={{ scaleY: 1 }} whileInView={{ scaleY: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.55, delay: index * 0.1 + 0.15, ease: [0.22, 1, 0.36, 1] }} />
          )}
        </div>
      </div>

      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-sm text-foreground truncate">{name}</h3>
        {desc && <p className="text-xs text-muted-foreground line-clamp-2">{desc}</p>}

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`w-3 h-3 ${i < (product.rating || 4) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            {product.rating || 4.5}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-1">
          <span className="text-lg font-bold text-teal-700">{formatPriceJOD(product.price, lang)}</span>

          <AnimatePresence mode="wait">
            {inCart ? (
              <motion.div
                key="qty"
                initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
                className="flex items-center justify-center gap-1.5 w-full sm:w-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <button onClick={handleDec}
                  className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center hover:bg-teal-200 transition">
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-sm font-bold text-foreground w-6 text-center">{cartItem.quantity}</span>
                <button onClick={handleInc}
                  className="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center hover:bg-teal-600 transition">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ) : (
              <motion.button
                key="add"
                initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
                onClick={handleAdd}
                className={`flex items-center justify-center gap-1.5 rounded-full h-10 sm:h-9 w-full sm:w-auto px-5 sm:px-4 text-sm font-semibold text-white whitespace-nowrap transition-all ${
                  added ? 'bg-emerald-500' : 'bg-teal-500 hover:bg-teal-600'
                }`}
              >
                {added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                {added ? (isRTL ? 'تمت' : 'Added') : t('addToCart')}
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {product.recommended_by && (
          <p className="text-[10px] text-muted-foreground">
            {t('recommendedBy')}: <span className="text-teal-600 font-medium">{product.recommended_by}</span>
          </p>
        )}
      </div>
    </motion.div>
  );
}