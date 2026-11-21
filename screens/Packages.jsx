import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n';
import PackageCard from '@/components/ui/PackageCard';
import PackageCompareModal from '@/components/packages/PackageCompareModal';
import { motion } from 'framer-motion';
import { GitCompareArrows, X } from 'lucide-react';
import SectionScan from '@/components/reveal/SectionScan';
import { useScrollReveal } from '@/lib/useScrollReveal';

export default function Packages() {
  const { t, isRTL } = useLanguage();
  const [compareList, setCompareList] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const gridRef = useScrollReveal();

  const handleCompareToggle = (pkg) => {
    setCompareList(prev => {
      const exists = prev.find(p => p.id === pkg.id);
      if (exists) return prev.filter(p => p.id !== pkg.id);
      if (prev.length >= 2) return [prev[1], pkg]; // replace oldest
      return [...prev, pkg];
    });
  };

  const { data: packages = [], isLoading } = useQuery({
    queryKey: ['packages'],
    queryFn: () => base44.entities.TreatmentPackage.list('-rating', 20),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      <SectionScan />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          {t('specializedPackages')}
        </h1>
        <p className="text-muted-foreground text-sm">{t('packagesDesc')}</p>
      </motion.div>

      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative rounded-2xl overflow-hidden mb-8 h-48 md:h-64"
      >
        <img
          src="/__l5e/assets-v1/50801770-9edd-4d83-875d-4d0cb1a7cf5d/cad6a7d1a_generated_8e8bc2f8.png"
          alt="Medical Tourism"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-teal-900/70 to-transparent flex items-center">
          <div className="p-8 max-w-md">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {t('jordanDestination')}
            </h2>
            <p className="text-teal-100 text-sm">{t('worldClassCare')}</p>
          </div>
        </div>
      </motion.div>

      {/* Compare Bar */}
      {compareList.length > 0 && (
        <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40 bg-teal-600 text-white rounded-2xl shadow-xl px-5 py-3 flex items-center gap-4">
          <GitCompareArrows className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">
            {compareList.length === 1
              ? t('selectOneMore')
              : t('readyToCompare')}
          </span>
          <div className="flex gap-2">
            {compareList.map(p => (
              <span key={p.id} className="text-xs bg-white/20 px-2 py-1 rounded-full max-w-[100px] truncate">
                {isRTL ? p.title_ar : p.title_en}
              </span>
            ))}
          </div>
          {compareList.length === 2 && (
            <button onClick={() => setShowCompare(true)}
              className="bg-white text-teal-600 text-sm font-semibold px-4 py-1.5 rounded-xl hover:bg-teal-50 transition-colors">
              {t('compareNow')}
            </button>
          )}
          <button onClick={() => setCompareList([])} className="p-1 hover:bg-white/20 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* Package Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card rounded-2xl h-72 animate-pulse border border-teal-500/5" />
          ))}
        </div>
      ) : packages.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          {t('noPackages')}
        </div>
      ) : (
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map((pkg, i) => (
            <PackageCard key={pkg.id} pkg={pkg} index={i}
              onCompare={handleCompareToggle}
              compareSelected={!!compareList.find(p => p.id === pkg.id)} />
          ))}
        </div>
      )}
      {showCompare && compareList.length === 2 && (
        <PackageCompareModal packages={compareList} onClose={() => setShowCompare(false)} />
      )}
    </div>
  );
}