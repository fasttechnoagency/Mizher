import React from 'react';
import { Link } from '@/lib/router-compat';
import { useLanguage } from '@/lib/i18n';
import { ChevronRight, ChevronLeft, ShoppingBag } from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function FeaturedProducts({ products }) {
  const { t, isRTL } = useLanguage();
  const Arrow = isRTL ? ChevronLeft : ChevronRight;

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-teal-100 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-teal-600" />
              </div>
              <span className="text-xs font-semibold text-teal-600 uppercase tracking-wider">
                {isRTL ? 'المتجر الصحي' : 'Health Store'}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">{t('medicalDevices')}</h2>
            <p className="text-muted-foreground text-sm mt-1">
              {isRTL ? 'أجهزة طبية ومكملات موثوقة من أفضل الصيدليات' : 'Trusted devices & supplements from top pharmacies'}
            </p>
          </div>
          <Link to="/marketplace">
            <Button variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50 rounded-xl gap-1 hidden md:flex">
              {isRTL ? 'كل المنتجات' : 'All Products'}
              <Arrow className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.slice(0, 4).map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>

        <div className="mt-6 text-center md:hidden">
          <Link to="/marketplace">
            <Button variant="outline" className="border-teal-200 text-teal-700 rounded-xl gap-1">
              {isRTL ? 'عرض كل المنتجات' : 'View All Products'} <Arrow className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}