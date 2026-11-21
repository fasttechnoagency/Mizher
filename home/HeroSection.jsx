import React, { useState, useRef, useEffect } from 'react';
import { Link } from '@/lib/router-compat';
import { useLanguage } from '@/lib/i18n';
import { Stethoscope, Plane, ShoppingBag, Building2, Shield, ChevronRight, ChevronLeft, FlaskConical, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import PromoBanner from '@/components/home/PromoBanner';
import HeroMedicalBackdrop from '@/components/home/HeroMedicalBackdrop';
import SocialFeedSlider from '@/components/home/SocialFeedSlider';
import MedicalSearchBar from '@/components/home/MedicalSearchBar';
import LivingHeroLogo from '@/components/home/LivingHeroLogo';
import ServiceCard from '@/components/living-network/ServiceCard';
import TitleSheen from '@/components/living-network/TitleSheen';
import TitleECG from '@/components/reveal/TitleECG';
import { useInViewOnce, usePrefReducedMotion } from '@/components/living-network/useInViewOnce';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const SERVICES = [
{ key: 'marketplace', path: '/marketplace', Icon: ShoppingBag, en: 'Health Marketplace', ar: 'المتجر الصحي', desc_en: 'Devices & supplements', desc_ar: 'أجهزة ومكملات', color: 'from-emerald-500 to-teal-600' },
{ key: 'doctors', path: '/doctors', Icon: Stethoscope, en: 'Find a Doctor', ar: 'ابحث عن طبيب', desc_en: 'Book specialists instantly', desc_ar: 'احجز متخصصين فوراً', color: 'from-teal-500 to-teal-600' },
{ key: 'hospitals', path: '/hospitals', Icon: Building2, en: 'Hospitals', ar: 'المستشفيات', desc_en: 'Top certified hospitals', desc_ar: 'أفضل المستشفيات المعتمدة', color: 'from-cyan-500 to-teal-500' },
{ key: 'packages', path: '/packages', Icon: Plane, en: 'Medical Tourism', ar: 'السياحة العلاجية', desc_en: 'All-inclusive packages', desc_ar: 'باقات شاملة', color: 'from-teal-600 to-emerald-600' },
{ key: 'labs', path: '/labs', Icon: FlaskConical, en: 'Labs', ar: 'المختبرات', desc_en: 'Blood & lab tests', desc_ar: 'تحاليل مخبرية', color: 'from-violet-500 to-purple-600' },
{ key: 'iq', path: '/tests', Icon: Brain, en: 'IQ Tests', ar: 'فحوصات الذكاء', desc_en: 'Cognitive assessments', desc_ar: 'تقييمات معرفية', color: 'from-pink-500 to-rose-600' }];

const GLOW = {
  marketplace: '#10b981',
  doctors: '#14b8a6',
  hospitals: '#06b6d4',
  packages: '#0d9488',
  labs: '#8b5cf6',
  iq: '#ec4899',
};

const STATS = [
{ v: '500+', en: 'Verified Doctors', ar: 'طبيب معتمد' },
{ v: '50+', en: 'Partner Hospitals', ar: 'مستشفى شريك' },
{ v: '98%', en: 'Patient Satisfaction', ar: 'رضا المرضى' },
{ v: '24/7', en: 'Online Support', ar: 'دعم على مدار الساعة' }];

export default function HeroSection() {
  const { t, lang, isRTL } = useLanguage();
  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  // ── Living Medical Network: services activation orchestration ──
  const reduce = usePrefReducedMotion();
  const [servicesRef, servicesEntered] = useInViewOnce({ threshold: 0.25 });
  const [networkActive, setNetworkActive] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const refs = useRef({ icons: [], cards: [] });
  if (refs.current.icons.length === 0) {
    refs.current.icons = SERVICES.map(() => React.createRef());
    refs.current.cards = SERVICES.map(() => React.createRef());
  }
  const subtitleRef = useRef(null);
  const servicesContentRef = useRef(null);
  useEffect(() => {
    if (servicesEntered) {
      const tm = setTimeout(() => setNetworkActive(true), 900);
      return () => clearTimeout(tm);
    }
  }, [servicesEntered]);

  const { data: doctors = [] } = useQuery({
    queryKey: ['doctors-suggest'],
    queryFn: () => base44.entities.Doctor.list('-rating', 50)
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products-suggest'],
    queryFn: () => base44.entities.RetailerProduct.list('-rating', 30)
  });

  const { data: hospitals = [] } = useQuery({
    queryKey: ['hospitals-suggest'],
    queryFn: () => base44.entities.Hospital.list('-rating', 30)
  });

  return (
    <div>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden min-h-[40vh] flex items-center">
        {/* Background image */}
        <div className="absolute inset-0">
          <img src="/__l5e/assets-v1/f1c06ab1-a456-4fd7-ac9a-30b4f19f7241/cf1e03232_WhatsAppImage2026-06-14at14700PM.jpg"
            alt="" className="w-full h-full object-cover object-center" />
        </div>
        <HeroMedicalBackdrop />

        <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-8 w-full">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            {/* Logo + Headline side by side */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="flex items-center justify-center gap-4 md:gap-6">
              <LivingHeroLogo isRTL={isRTL} />
            </motion.div>

            {/* Search */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-xl mx-auto">
              <MedicalSearchBar doctors={doctors} products={products} hospitals={hospitals} isRTL={isRTL} />

              {/* Badge */}
              <div className="flex justify-center mt-4">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
                  <Shield className="w-4 h-4 text-teal-300" />
                  <span className="text-xs font-medium text-white/90">
                    {isRTL ? 'منصة صحية موثوقة في الأردن' : "Jordan's Trusted Healthcare Platform"}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR (legacy, hidden) ── */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 -mt-2 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {STATS.map((s, i) =>
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i + 0.5 }}
          className="bg-card border border-teal-100 rounded-2xl p-4 text-center shadow-sm hidden">
              <p className="text-2xl font-bold text-teal-600">{s.v}</p>
              <p className="text-xs text-muted-foreground mt-1">{isRTL ? s.ar : s.en}</p>
            </motion.div>
          )}
        </div>
      </section>

      <SocialFeedSlider />

      {/* ── SERVICES GRID ── */}
      <section ref={servicesRef} className="max-w-7xl mx-auto px-4 md:px-6 py-10">
        <div ref={servicesContentRef} className="relative">
          <div className="text-center mb-8 relative">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              {isRTL ? 'خدماتنا الصحية' : 'Our Health Services'}
            </h2>
            <TitleECG width={132} align="center" />
            <TitleSheen reduce={reduce} width={132} />
            <p ref={subtitleRef} className="text-muted-foreground mt-2 text-sm max-w-lg mx-auto">
              {isRTL ? 'منظومة صحية متكاملة تحت سقف واحد' : 'A complete healthcare ecosystem under one roof'}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {SERVICES.map((s, i) => (
              <ServiceCard
                key={s.key}
                s={s}
                i={i}
                isRTL={isRTL}
                Chevron={Chevron}
                activate={networkActive}
                activateDelay={i * 150 + 600}
                glowColor={GLOW[s.key]}
                iconRef={refs.current.icons[i]}
                reduce={reduce}
                onHover={setHoveredIdx}
                onLeave={() => setHoveredIdx(null)}
              />
            ))}
          </div>
        </div>
      </section>

      <PromoBanner />

      {/* ── TRUST STRIP ── */}
      <section className="bg-gradient-to-r from-teal-500 to-teal-700 py-10 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-white">
          <div>
            <h3 className="text-xl md:text-2xl font-bold mb-1">
              {isRTL ? 'هل أنت طبيب أو مزود خدمة صحية؟' : 'Are you a doctor or healthcare provider?'}
            </h3>
            <p className="text-white/75 text-sm">
              {isRTL ? 'انضم لمجتمع مزهر الطبي واستقبل المرضى وادر عيادتك بسهولة' : 'Join Mizher Medical Hub and grow your practice with ease'}
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <Link to="/doctor-console">
              <Button className="bg-white text-teal-700 hover:bg-teal-50 rounded-xl h-11 px-6 font-semibold">
                {isRTL ? 'سجّل كطبيب' : 'Register as Doctor'}
              </Button>
            </Link>
            <Link to="/hospital-console">
              <Button variant="outline" className="border-white/40 text-white hover:bg-white/10 rounded-xl h-11 px-6 font-semibold">
                {isRTL ? 'سجّل مستشفى' : 'Register Hospital'}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>);
}