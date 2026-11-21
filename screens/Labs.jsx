import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n';
import { Search, FlaskConical, MapPin, Phone, Star, Shield, Clock, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Link } from '@/lib/router-compat';
import SectionScan from '@/components/reveal/SectionScan';
import { useScrollReveal } from '@/lib/useScrollReveal';

export default function Labs() {
  const { isRTL, lang } = useLanguage();
  const [search, setSearch] = useState('');
  const gridRef = useScrollReveal();

  const { data: labs = [], isLoading } = useQuery({
    queryKey: ['labs'],
    queryFn: () => base44.entities.Lab.list('-rating', 50),
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return labs;
    const q = search.toLowerCase();
    return labs.filter(l =>
      l.name_en?.toLowerCase().includes(q) ||
      l.name_ar?.includes(q) ||
      l.city?.toLowerCase().includes(q) ||
      l.services?.some(s => s.toLowerCase().includes(q))
    );
  }, [labs, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      <SectionScan />
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          {isRTL ? 'المختبرات الطبية' : 'Medical Labs'}
        </h1>
        <p className="text-muted-foreground text-sm">
          {isRTL ? 'ابحث عن أفضل المختبرات للتحاليل والفحوصات' : 'Find the best labs for tests and diagnostics'}
        </p>
      </motion.div>

      {/* Search */}
      <div className="sticky top-16 z-30 bg-background/80 backdrop-blur-xl -mx-4 px-4 md:-mx-6 md:px-6 py-4 border-b border-teal-500/10 mb-6">
        <div className="relative max-w-xl">
          <Search className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'} w-4 h-4 text-muted-foreground`} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={isRTL ? 'ابحث عن مختبر أو خدمة...' : 'Search labs or services...'}
            className={`w-full h-10 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} bg-white rounded-xl border border-teal-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
          />
        </div>
      </div>

      {/* Lab CTA Banner */}
      <div className="mb-6 bg-gradient-to-r from-violet-500 to-purple-700 rounded-2xl p-5 text-white flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FlaskConical className="w-8 h-8 text-violet-200 flex-shrink-0" />
          <div>
            <h3 className="font-bold">{isRTL ? 'هل لديك مختبر؟' : 'Do you run a lab?'}</h3>
            <p className="text-violet-100 text-sm">{isRTL ? 'سجّل مختبرك واستقبل طلبات الفحوصات من المرضى' : 'Register your lab and receive test requests from patients'}</p>
          </div>
        </div>
        <Link to="/lab-console">
          <Button className="bg-white text-violet-700 hover:bg-violet-50 rounded-xl px-6 h-10 font-semibold flex-shrink-0">
            {isRTL ? 'سجّل الآن' : 'Register Lab'}
          </Button>
        </Link>
      </div>

      {/* Grid */}
      <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card rounded-2xl h-48 animate-pulse border border-teal-500/5" />
          ))
        ) : filtered.length === 0 ? (
          <div className="col-span-full text-center py-16 text-muted-foreground">
            <FlaskConical className="w-12 h-12 mx-auto opacity-20 mb-3" />
            <p>{isRTL ? 'لا توجد مختبرات مسجلة بعد' : 'No labs registered yet'}</p>
          </div>
        ) : (
          filtered.map((lab, i) => (
            <motion.div key={lab.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to={`/labs/${lab.id}`}>
                <div className="bg-card border border-teal-100 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
                  <div className="h-36 bg-gradient-to-br from-violet-100 to-purple-50 relative overflow-hidden">
                    {lab.photo_url ? (
                      <img src={lab.photo_url} alt={lang === 'ar' ? lab.name_ar : lab.name_en} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FlaskConical className="w-16 h-16 text-violet-300" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-1">
                          <h3 className="font-bold text-foreground text-sm">{lang === 'ar' ? lab.name_ar : lab.name_en}</h3>
                          {lab.verified && <Shield className="w-3.5 h-3.5 text-teal-500" />}
                        </div>
                        {lab.city && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />{lab.city}
                          </p>
                        )}
                      </div>
                      {lab.rating && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-semibold">{lab.rating}</span>
                        </div>
                      )}
                    </div>
                    {lab.services?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {lab.services.slice(0, 3).map((s, idx) => (
                          <span key={idx} className="text-[10px] bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full border border-violet-100">{s}</span>
                        ))}
                        {lab.services.length > 3 && (
                          <span className="text-[10px] text-muted-foreground">+{lab.services.length - 3}</span>
                        )}
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        {lab.home_visit && (
                          <span className="flex items-center gap-1 text-teal-600 font-medium">
                            <Home className="w-3 h-3" />
                            {isRTL ? 'زيارة منزلية' : 'Home Visit'}
                          </span>
                        )}
                        {lab.working_hours && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />{lab.working_hours}
                          </span>
                        )}
                      </div>
                      {lab.consultation_fee && (
                        <span className="font-semibold text-teal-600">{isRTL ? `من ${lab.consultation_fee} د.أ` : `From ${lab.consultation_fee} JOD`}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}