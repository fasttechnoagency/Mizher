import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n';
import { Search, MapPin, Star, Phone, Building2, Shield, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { Link } from '@/lib/router-compat';
import SectionScan from '@/components/reveal/SectionScan';
import { useScrollReveal } from '@/lib/useScrollReveal';

const TYPES = [
  { value: 'all',        en: 'All Types',   ar: 'الكل',    az: 'Bütün Növlər'  },
  { value: 'private',    en: 'Private',     ar: 'خاص',     az: 'Özəl'          },
  { value: 'public',     en: 'Public',      ar: 'حكومي',   az: 'Dövlət'        },
  { value: 'specialist', en: 'Specialist',  ar: 'متخصص',   az: 'Mütəxəssis'    },
  { value: 'clinic',     en: 'Clinic',      ar: 'عيادة',   az: 'Klinika'       },
];

const CITIES = [
  { value: 'all',   en: 'All Cities', ar: 'كل المدن', az: 'Bütün Şəhərlər' },
  { value: 'Amman', en: 'Amman',      ar: 'عمان',     az: 'Amman'           },
  { value: 'Irbid', en: 'Irbid',      ar: 'إربد',     az: 'İrbid'           },
  { value: 'Zarqa', en: 'Zarqa',      ar: 'الزرقاء',  az: 'Zarqa'           },
  { value: 'Aqaba', en: 'Aqaba',      ar: 'العقبة',   az: 'Əqəbə'           },
];

function HospitalCard({ hospital, index }) {
  const { isRTL, lang, t } = useLanguage();
  const name = lang === 'ar' ? hospital.name_ar : hospital.name_en;
  const desc = lang === 'ar' ? hospital.description_ar : hospital.description_en;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-card rounded-2xl border border-teal-500/10 overflow-hidden hover:shadow-lg hover:shadow-teal-500/5 transition-all group"
    >
      {/* Image */}
      <div className="relative h-44 bg-teal-50 overflow-hidden">
        <img
          src={hospital.photo_url || `https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600&q=80`}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        {hospital.verified && (
        <div className="absolute top-3 end-3 bg-teal-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
          <Shield className="w-3 h-3" />
          {t('verified2')}
        </div>
        )}
        {hospital.featured && (
        <div className="absolute top-3 start-3 bg-amber-400 text-white text-[10px] font-bold px-2 py-1 rounded-full">
          {t('featured')}
        </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-base text-foreground leading-tight">{name}</h3>
          {hospital.rating && (
            <div className="flex items-center gap-1 text-amber-500 flex-shrink-0">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="text-xs font-semibold">{hospital.rating}</span>
            </div>
          )}
        </div>

        {desc && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{desc}</p>}

        <div className="flex flex-wrap gap-2 mb-3">
          {hospital.city && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <MapPin className="w-3 h-3" />{hospital.city}
            </span>
          )}
          {hospital.type && (
            <Badge variant="secondary" className="text-[10px] bg-teal-50 text-teal-700 border-0">
              {TYPES.find(t => t.value === hospital.type)?.[lang === 'ar' ? 'ar' : 'en']}
            </Badge>
          )}
          {hospital.consultation_fee && (
            <span className="text-[11px] text-teal-600 font-semibold">
              {hospital.consultation_fee} {isRTL ? 'د.أ' : 'JOD'}
            </span>
          )}
        </div>

        {hospital.specialties?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {hospital.specialties.slice(0, 3).map(s => (
              <span key={s} className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-100">{s}</span>
            ))}
            {hospital.specialties.length > 3 && (
              <span className="text-[10px] text-muted-foreground">+{hospital.specialties.length - 3}</span>
            )}
          </div>
        )}

        {hospital.services?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {hospital.services.slice(0, 3).map(s => (
              <span key={s} className="text-[10px] bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-full border border-cyan-100">{s}</span>
            ))}
            {hospital.services.length > 3 && (
              <span className="text-[10px] text-muted-foreground">+{hospital.services.length - 3}</span>
            )}
          </div>
        )}

        <Link to={`/hospitals/${hospital.id}`}>
          <Button className="w-full bg-teal-500 hover:bg-teal-600 text-white rounded-xl h-9 text-sm gap-2">
            {isRTL ? 'عرض الملف' : 'View Profile'}
            <ChevronRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}

export default function Hospitals() {
  const { isRTL, lang, t } = useLanguage();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const gridRef = useScrollReveal();

  const { data: hospitals = [], isLoading } = useQuery({
    queryKey: ['hospitals'],
    queryFn: () => base44.entities.Hospital.filter({ status: 'approved' }),
  });

  const filtered = useMemo(() => {
    let r = [...hospitals];
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(h => h.name_en?.toLowerCase().includes(q) || h.name_ar?.includes(q) || h.city?.toLowerCase().includes(q));
    }
    if (typeFilter !== 'all') r = r.filter(h => h.type === typeFilter);
    if (cityFilter !== 'all') r = r.filter(h => h.city === cityFilter);
    return r.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }, [hospitals, search, typeFilter, cityFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      <SectionScan />
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {t('hospitals')}
            </h1>
            <p className="text-muted-foreground text-sm">
              {t('registerHospital')}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Search & Filters */}
      <div className="sticky top-16 z-30 bg-background/80 backdrop-blur-xl -mx-4 px-4 md:-mx-6 md:px-6 py-3 border-b border-teal-500/10 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'} w-4 h-4 text-muted-foreground`} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={t('searchHospital')}
              className={`w-full h-10 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} bg-white rounded-xl border border-teal-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
            />
          </div>
          <div className="flex gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32 h-10 rounded-xl border-teal-100 text-sm bg-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                {TYPES.map(type => <SelectItem key={type.value} value={type.value}>{lang === 'ar' ? type.ar : lang === 'az' ? type.az : type.en}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="w-32 h-10 rounded-xl border-teal-100 text-sm bg-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CITIES.map(c => <SelectItem key={c.value} value={c.value}>{lang === 'ar' ? c.ar : lang === 'az' ? c.az : c.en}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card rounded-2xl h-72 animate-pulse border border-teal-500/5" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Building2 className="w-12 h-12 opacity-20 mx-auto mb-3" />
          <p>{t('noHospitals')}</p>
        </div>
      ) : (
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((h, i) => <HospitalCard key={h.id} hospital={h} index={i} />)}
        </div>
      )}

      {/* CTA for hospitals */}
      <div className="mt-10 bg-gradient-to-r from-teal-500 to-teal-700 rounded-2xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-lg">{t('hospitalAdmin')}</h3>
          <p className="text-teal-100 text-sm mt-1">{t('registerHospital')}</p>
        </div>
        <Link to="/hospital-console">
          <Button className="bg-white text-teal-700 hover:bg-teal-50 rounded-xl px-6 h-10 font-semibold flex-shrink-0">
            {t('registerHospitalBtn')}
          </Button>
        </Link>
      </div>
    </div>
  );
}