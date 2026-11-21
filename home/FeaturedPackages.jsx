import React from 'react';
import { Link } from '@/lib/router-compat';
import { useLanguage } from '@/lib/i18n';
import { ChevronRight, ChevronLeft, Plane } from 'lucide-react';
import PackageCard from '@/components/ui/PackageCard';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function FeaturedPackages({ packages }) {
  const { t, isRTL } = useLanguage();
  const Arrow = isRTL ? ChevronLeft : ChevronRight;

  return (
    <section className="py-12 bg-gradient-to-br from-teal-50/60 to-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-teal-100 flex items-center justify-center">
                  <Plane className="w-4 h-4 text-teal-600" />
                </div>
                <span className="text-xs font-semibold text-teal-600 uppercase tracking-wider">
                  {isRTL ? 'سياحة علاجية' : 'Medical Tourism'}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">{t('specializedPackages')}</h2>
              <p className="text-muted-foreground text-sm mt-1">
                {isRTL ? 'باقات علاجية شاملة مصممة خصيصاً لك' : 'All-inclusive treatment packages designed for you'}
              </p>
            </div>
            <Link to="/packages">
              <Button variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50 rounded-xl gap-1 hidden md:flex">
                {isRTL ? 'كل الباقات' : 'All Packages'}
                <Arrow className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages.slice(0, 3).map((pkg, i) => (
              <PackageCard key={pkg.id} pkg={pkg} index={i} />
            ))}
          </div>

          <div className="mt-6 text-center md:hidden">
            <Link to="/packages">
              <Button variant="outline" className="border-teal-200 text-teal-700 rounded-xl gap-1">
                {isRTL ? 'عرض كل الباقات' : 'View All Packages'} <Arrow className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}