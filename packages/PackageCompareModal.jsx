import React from 'react';
import { X, Check, Star, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n';
import { formatPrice } from '@/lib/currency';

export default function PackageCompareModal({ packages, onClose }) {
  const { lang, isRTL } = useLanguage();
  const [a, b] = packages;

  const title = (pkg) => lang === 'ar' ? pkg.title_ar : pkg.title_en;
  const desc  = (pkg) => lang === 'ar' ? pkg.description_ar : pkg.description_en;
  const incs  = (pkg) => (lang === 'ar' ? pkg.inclusions_ar : pkg.inclusions) || pkg.inclusions || [];

  const allInclusions = [...new Set([...incs(a), ...incs(b)])];

  const Row = ({ label, valA, valB, highlight }) => (
    <tr className={highlight ? 'bg-teal-50/50' : ''}>
      <td className="py-2.5 px-4 text-sm text-muted-foreground font-medium w-1/3">{label}</td>
      <td className="py-2.5 px-4 text-sm text-center font-semibold text-foreground">{valA}</td>
      <td className="py-2.5 px-4 text-sm text-center font-semibold text-foreground">{valB}</td>
    </tr>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-teal-100">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card rounded-t-2xl z-10">
          <h2 className="text-lg font-bold text-foreground">
            {isRTL ? 'مقارنة الباقات' : 'Compare Packages'}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Package Headers */}
        <div className="grid grid-cols-3 gap-0 border-b border-border">
          <div className="p-4" />
          {[a, b].map((pkg) => (
            <div key={pkg.id} className="p-4 text-center border-l border-border">
              <div className="h-20 rounded-xl overflow-hidden mb-3">
                <img src={pkg.image_url || 'https://via.placeholder.com/200x80'} alt={title(pkg)} className="w-full h-full object-cover" />
              </div>
              <h3 className="font-bold text-sm text-foreground leading-tight">{title(pkg)}</h3>
              {pkg.hospital_name && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                  <Building2 className="w-3 h-3" />{pkg.hospital_name}
                </p>
              )}
              <div className="flex items-center justify-center gap-1 mt-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-xs font-medium">{pkg.rating || 4.5}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <table className="w-full">
          <tbody>
            <Row label={isRTL ? 'السعر' : 'Price'} valA={formatPrice(a.price, lang)} valB={formatPrice(b.price, lang)} highlight />
            <Row label={isRTL ? 'المدة' : 'Duration'} valA={a.duration_days ? `${a.duration_days} ${isRTL ? 'يوم' : 'days'}` : '—'} valB={b.duration_days ? `${b.duration_days} ${isRTL ? 'يوم' : 'days'}` : '—'} />
            <Row label={isRTL ? 'الفئة' : 'Category'} valA={a.category || '—'} valB={b.category || '—'} highlight />
          </tbody>
        </table>

        {/* Inclusions */}
        {allInclusions.length > 0 && (
          <div className="p-4 border-t border-border">
            <p className="text-sm font-semibold text-foreground mb-3">{isRTL ? 'ما يشمله الباقة' : 'What\'s Included'}</p>
            <div className="space-y-2">
              {allInclusions.map((item, i) => (
                <div key={i} className="grid grid-cols-3 gap-2 items-center">
                  <span className="text-xs text-muted-foreground col-span-1">{item}</span>
                  {[a, b].map((pkg) => {
                    const hasIt = (incs(pkg) || []).includes(item);
                    return (
                      <div key={pkg.id} className="flex justify-center">
                        {hasIt
                          ? <Check className="w-4 h-4 text-teal-500" />
                          : <X className="w-4 h-4 text-muted-foreground/30" />}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 p-5 border-t border-border">
          {[a, b].map((pkg) => (
            <Button key={pkg.id} className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm" asChild>
              <a href={`/packages/${pkg.id}`}>{isRTL ? `احجز "${title(pkg)}"` : `Book "${title(pkg)}"`}</a>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}