import React, { useState, useRef } from 'react';
import { useLanguage } from '@/lib/i18n';
import { useCart } from '@/lib/CartContext';
import { useFlyToCart } from '@/lib/flyToCart';
import { Star, ShieldCheck, ShoppingCart, Plus, Minus, Check, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Link } from '@/lib/router-compat';
import { formatPriceJOD } from '@/lib/currency';

export default function RetailerProductCard({ product, index = 0 }) {
  const { lang, isRTL } = useLanguage();
  const { addToCart, items, updateQty, removeFromCart } = useCart();
  const { flyToCart, flyFromCart } = useFlyToCart();
  const imgRef = useRef(null);
  const [added, setAdded] = useState(false);

  const name     = lang === 'ar' ? product.name_ar     : product.name_en;
  const desc     = lang === 'ar' ? product.description_ar : product.description_en;
  const retailer = lang === 'ar' ? product.retailer_name_ar : product.retailer_name_en;

  const cartItem = items.find(i => i.product.id === product.id);
  const inCart   = !!cartItem;

  const handleAdd = (e) => {
    e.preventDefault();
    flyToCart(imgRef.current, { from: e.currentTarget });
    requestAnimationFrame(() => {
      addToCart(product);
      setAdded(true);
      toast.success(isRTL ? `تمت الإضافة: ${name}` : `Added: ${name}`);
      setTimeout(() => setAdded(false), 2000);
    });
  };

  const discount = product.original_price && product.original_price > product.price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="bg-card rounded-2xl overflow-hidden border border-teal-500/10 shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col"
    >
      {/* Image — links to product page */}
      <Link to={`/products/${product.id}`} className="relative aspect-square overflow-hidden bg-teal-50/50 block">
        <img
          ref={imgRef}
          src={product.image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&q=80'}
          alt={name}
          decoding="async"
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
        />
        {discount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            -{discount}%
          </div>
        )}
        {product.doctor_recommended && (
          <div className="absolute top-2 right-2 bg-teal-500 text-white text-[10px] rounded-full p-1">
            <ShieldCheck className="w-3 h-3" />
          </div>
        )}
        {product.requires_prescription && (
          <Badge className="absolute bottom-2 left-2 bg-orange-500/90 text-white border-0 text-[10px]">
            Rx
          </Badge>
        )}
      </Link>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        {/* Retailer */}
        <div className="flex items-center gap-1 text-[10px] text-teal-600 font-medium">
          <Package className="w-3 h-3" />
          <span className="truncate">{retailer}</span>
        </div>

        <Link to={`/products/${product.id}`} className="hover:text-teal-600 transition-colors">
          <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">{name}</h3>
        </Link>

        {desc && <p className="text-[11px] text-muted-foreground line-clamp-2">{desc}</p>}

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-muted/40'}`} />
            ))}
            <span className="text-[10px] text-muted-foreground">({product.reviews_count || 0})</span>
          </div>
        )}

        {/* Price + Cart */}
        <div className="flex items-center justify-between mt-auto pt-1">
          <div>
            <span className="text-base font-bold text-teal-700">{formatPriceJOD(product.price, lang)}</span>
            {product.original_price > product.price && (
              <span className="text-[10px] text-muted-foreground line-through ms-1">{formatPriceJOD(product.original_price, lang)}</span>
            )}
          </div>

          <AnimatePresence mode="wait">
            {inCart ? (
              <motion.div
                key="qty"
                initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
                className="flex items-center gap-1"
              >
                <button onClick={(e) => { e.preventDefault(); flyFromCart(imgRef.current, { from: e.currentTarget }); requestAnimationFrame(() => cartItem.quantity === 1 ? removeFromCart(product.id) : updateQty(product.id, cartItem.quantity - 1)); }}
                  className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center hover:bg-teal-200 transition">
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-sm font-bold text-foreground w-5 text-center">{cartItem.quantity}</span>
                <button onClick={(e) => { e.preventDefault(); flyToCart(imgRef.current, { from: e.currentTarget }); requestAnimationFrame(() => updateQty(product.id, cartItem.quantity + 1)); }}
                  className="w-6 h-6 rounded-full bg-teal-500 text-white flex items-center justify-center hover:bg-teal-600 transition">
                  <Plus className="w-3 h-3" />
                </button>
              </motion.div>
            ) : (
              <motion.button
                key="add"
                initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
                onClick={handleAdd}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  added ? 'bg-emerald-500 text-white' : 'bg-teal-500 text-white hover:bg-teal-600'
                }`}
              >
                {added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-3.5 h-3.5" />}
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {product.stock_quantity !== undefined && product.stock_quantity < 10 && product.stock_quantity > 0 && (
          <p className="text-[10px] text-orange-500 font-medium">
            {isRTL ? `باقي ${product.stock_quantity} فقط` : `Only ${product.stock_quantity} left`}
          </p>
        )}
        {product.stock_quantity === 0 && (
          <p className="text-[10px] text-red-500 font-medium">{isRTL ? 'نفذ المخزون' : 'Out of stock'}</p>
        )}
      </div>
    </motion.div>
  );
}