import React from 'react';
import { Link } from '@/lib/router-compat';
import { useLanguage } from '@/lib/i18n';
import { Star, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { usePrefReducedMotion } from '@/components/living-network/useInViewOnce';
import { formatPrice } from '@/lib/currency';

export default function PackageCard({ pkg, index = 0, onCompare, compareSelected }) {
  const { t, lang } = useLanguage();
  const reduce = usePrefReducedMotion();
  const title = lang === 'ar' ? pkg.title_ar : pkg.title_en;
  const desc = lang === 'ar' ? pkg.description_ar : pkg.description_en;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateX: -6 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      whileHover={{ y: -4 }}
      viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
      transition={{ delay: index * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
      className="bg-card rounded-2xl overflow-hidden shadow-sm card-border-light border border-teal-500/5 group"
    >
      <div className="relative h-40 overflow-hidden">
        <img
          src={pkg.image_url || 'https://via.placeholder.com/400x200'}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {!reduce && (
          <motion.div className="absolute inset-0 origin-bottom bg-teal-500/25" aria-hidden
            initial={{ scaleY: 1 }} whileInView={{ scaleY: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.55, delay: index * 0.1 + 0.15, ease: [0.22, 1, 0.36, 1] }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="text-white font-semibold text-lg">{title}</h3>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">{desc}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-medium">{pkg.rating || 4.5}</span>
          </div>
          <span className="text-lg font-bold text-teal-700">{formatPrice(pkg.price, lang)}</span>
        </div>

        <div className="flex gap-2">
          <Link to={`/packages/${pkg.id}`} className="flex-1">
            <Button className="w-full bg-teal-500 hover:bg-teal-600 text-white rounded-full text-sm h-9">
              {t('bookNow')}
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={(e) => { e.preventDefault(); onCompare && onCompare(pkg); }}
            className={`border-teal-200 rounded-full text-sm h-9 px-4 transition-colors ${
              compareSelected ? 'bg-teal-500 text-white border-teal-500' : 'text-teal-600 hover:bg-teal-50'
            }`}>
            {compareSelected ? '✓' : t('compare')}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}