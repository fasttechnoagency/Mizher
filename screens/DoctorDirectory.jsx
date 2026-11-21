import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n';
import { Search, SlidersHorizontal, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DoctorCard from '@/components/ui/DoctorCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@/lib/router-compat';
import SectionScan from '@/components/reveal/SectionScan';
import { useScrollReveal } from '@/lib/useScrollReveal';

const SPECIALTIES = [
  { en: 'All', ar: 'الكل', value: 'all' },
  { en: 'Dermatology', ar: 'جلدية', value: 'dermatology' },
  { en: 'Cardiology', ar: 'قلب', value: 'cardiology' },
  { en: 'Orthopedics', ar: 'عظام', value: 'orthopedics' },
  { en: 'Aesthetic', ar: 'تجميل', value: 'aesthetic' },
  { en: 'General', ar: 'عام', value: 'general' },
  { en: 'Dental', ar: 'أسنان', value: 'dental' },
  { en: 'Eye Care', ar: 'عيون', value: 'eye_care' },
];

export default function DoctorDirectory() {
  const { t, lang, isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [specialty, setSpecialty] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [priceSort, setPriceSort] = useState('none');
  const [suggestOpen, setSuggestOpen] = useState(false);
  const searchRef = useRef(null);
  const gridRef = useScrollReveal();

  const { data: doctors = [], isLoading } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => base44.entities.Doctor.list('-rating', 50),
  });

  const suggestions = useMemo(() => [...new Set(doctors.flatMap(d => [
    d.name_en, d.name_ar, d.specialty_en, d.specialty_ar, d.location_en, d.location_ar,
  ].filter(Boolean)))], [doctors]);

  const searchSuggestions = searchQuery.trim().length > 0
    ? suggestions.filter(s => s.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 7)
    : [];

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSuggestOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = useMemo(() => {
    let result = [...doctors];
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(d => 
        d.name_en?.toLowerCase().includes(q) || 
        d.name_ar?.includes(q) ||
        d.specialty_en?.toLowerCase().includes(q) ||
        d.specialty_ar?.includes(q)
      );
    }
    
    if (specialty !== 'all') {
      result = result.filter(d => 
        d.specialty_en?.toLowerCase().includes(specialty) ||
        d.specialties?.some(s => s.toLowerCase().includes(specialty))
      );
    }
    
    if (genderFilter !== 'all') {
      result = result.filter(d => d.gender === genderFilter);
    }
    
    if (priceSort === 'low') {
      result.sort((a, b) => (a.consultation_fee || 0) - (b.consultation_fee || 0));
    } else if (priceSort === 'high') {
      result.sort((a, b) => (b.consultation_fee || 0) - (a.consultation_fee || 0));
    }
    
    return result;
  }, [doctors, searchQuery, specialty, genderFilter, priceSort]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      <SectionScan />
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          {isRTL ? 'دليل الأطباء' : 'Doctor Directory'}
        </h1>
        <p className="text-muted-foreground text-sm">
          {isRTL ? 'ابحث عن أفضل الأطباء في الأردن' : 'Find the best doctors in Jordan'}
        </p>
      </motion.div>

      {/* Search & Filters */}
      <div className="sticky top-16 z-30 bg-background/80 backdrop-blur-xl -mx-4 px-4 md:-mx-6 md:px-6 py-4 border-b border-teal-500/10">
        <div className="flex flex-col md:flex-row gap-3">
        <div ref={searchRef} className="relative flex-1">
          <Search className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'} w-4 h-4 text-muted-foreground pointer-events-none`} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setSuggestOpen(true); }}
            onFocus={() => setSuggestOpen(true)}
            placeholder={t('searchDoctors')}
            className={`w-full h-10 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} bg-white rounded-xl border border-teal-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
            autoComplete="off"
          />
          <AnimatePresence>
            {suggestOpen && searchSuggestions.length > 0 && (
              <motion.ul initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}
                className="absolute top-full mt-1 left-0 right-0 bg-white border border-teal-100 rounded-xl shadow-xl z-50 overflow-hidden">
                {searchSuggestions.map((s, i) => (
                  <li key={i} onMouseDown={() => { setSearchQuery(s); setSuggestOpen(false); }}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm cursor-pointer text-foreground hover:bg-teal-50 hover:text-teal-700 transition-colors">
                    <Search className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
            <Select value={specialty} onValueChange={setSpecialty}>
              <SelectTrigger className="w-32 h-10 rounded-xl border-teal-100 text-sm bg-white">
                <SelectValue placeholder={t('specialty')} />
              </SelectTrigger>
              <SelectContent>
                {SPECIALTIES.map(s => (
                  <SelectItem key={s.value} value={s.value}>
                    {lang === 'ar' ? s.ar : s.en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={genderFilter} onValueChange={setGenderFilter}>
              <SelectTrigger className="w-28 h-10 rounded-xl border-teal-100 text-sm bg-white">
                <SelectValue placeholder={t('gender')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all')}</SelectItem>
                <SelectItem value="male">{t('male')}</SelectItem>
                <SelectItem value="female">{t('female')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priceSort} onValueChange={setPriceSort}>
              <SelectTrigger className="w-28 h-10 rounded-xl border-teal-100 text-sm bg-white">
                <SelectValue placeholder={t('price')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('price')}</SelectItem>
                <SelectItem value="low">{isRTL ? 'الأقل' : 'Low first'}</SelectItem>
                <SelectItem value="high">{isRTL ? 'الأعلى' : 'High first'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Doctor CTA Banner */}
      <div className="mt-6 mb-4 bg-gradient-to-r from-teal-500 to-teal-700 rounded-2xl p-5 text-white flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Stethoscope className="w-8 h-8 text-teal-200 flex-shrink-0" />
          <div>
            <h3 className="font-bold">{isRTL ? 'هل أنت طبيب؟' : 'Are you a doctor?'}</h3>
            <p className="text-teal-100 text-sm">{isRTL ? 'أنشئ ملفك الطبي واستقبل حجوزات مباشرة من المرضى' : 'Create your profile and receive bookings directly from patients'}</p>
          </div>
        </div>
        <Link to="/doctor-console">
          <Button className="bg-white text-teal-700 hover:bg-teal-50 rounded-xl px-6 h-10 font-semibold flex-shrink-0">
            {isRTL ? 'سجّل الآن' : 'Join as Doctor'}
          </Button>
        </Link>
      </div>

      {/* Results */}
      <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card rounded-2xl h-32 animate-pulse border border-teal-500/5" />
          ))
        ) : filtered.length === 0 ? (
          <div className="col-span-full text-center py-16 text-muted-foreground">
            {isRTL ? 'لم يتم العثور على أطباء' : 'No doctors found'}
          </div>
        ) : (
          filtered.map((doctor, i) => (
            <DoctorCard key={doctor.id} doctor={doctor} index={i} />
          ))
        )}
      </div>
    </div>
  );
}