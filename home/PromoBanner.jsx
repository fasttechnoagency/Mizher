import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { Link } from '@/lib/router-compat';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const FALLBACK_BANNERS = [
  { id: 'f1', image_url: '/__l5e/assets-v1/bbc6872a-5bf0-48bc-b885-034958129d14/695960a86_WhatsAppImage2026-06-13at42418PM.jpg', path: '/marketplace', cta_en: 'Shop Now', cta_ar: 'تسوق الآن', cta_az: 'İndi Al' },
  { id: 'f2', image_url: '/__l5e/assets-v1/8a3ea4a9-9739-4a9c-a17a-7dcc1199b8c8/f324cf048_WhatsAppImage2026-06-13at42418PM1.jpg', path: '/doctors', cta_en: 'Book Now', cta_ar: 'احجز الآن', cta_az: 'İndi Sifariş Et' },
  { id: 'f3', image_url: '/__l5e/assets-v1/942201a6-07f0-4bd2-868f-7f130363f795/9267910fe_WhatsAppImage2026-06-13at42419PM1.jpg', path: '/doctors', cta_en: 'Book Now', cta_ar: 'احجز الآن', cta_az: 'İndi Sifariş Et' },
  { id: 'f4', image_url: '/__l5e/assets-v1/92ed004b-c0a7-458e-8467-fe218c4e65e3/95a3c7b75_WhatsAppImage2026-06-13at42419PM2.jpg', path: '/hospitals', cta_en: 'Book Now', cta_ar: 'احجز موعدك', cta_az: 'İndi Sifariş Et' },
  { id: 'f5', image_url: '/__l5e/assets-v1/6f6e182c-3e51-45c3-b8b1-46aa48d17b4d/68214f31e_WhatsAppImage2026-06-13at42419PM3.jpg', path: '/doctors', cta_en: 'Start Test', cta_ar: 'ابدأ الاختبار', cta_az: 'Testi Başlat' },
  { id: 'f6', image_url: '/__l5e/assets-v1/c6be93a9-4bf6-4878-8759-2a77a353fcf2/79d2abef2_WhatsAppImage2026-06-13at42419PM.jpg', path: '/packages', cta_en: 'Explore', cta_ar: 'ابدأ رحلتك', cta_az: 'Kəşf et' },
];

export default function PromoBanner() {
  const { lang, isRTL } = useLanguage();
  const [current, setCurrent] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  const { data: dbBanners = [] } = useQuery({
    queryKey: ['promo-banners'],
    queryFn: () => base44.entities.PromoBannerItem.list('sort_order', 20),
    staleTime: 30000,
  });

  const dynamicBanners = dbBanners.filter(b => b.is_active !== false && b.image_url);
  const BANNERS = dynamicBanners.length > 0 ? dynamicBanners : FALLBACK_BANNERS;

  useEffect(() => {
    if (dismissed || BANNERS.length <= 1) return;
    const timer = setInterval(() => setCurrent(i => (i + 1) % BANNERS.length), 4000);
    return () => clearInterval(timer);
  }, [dismissed, BANNERS.length]);

  useEffect(() => { setCurrent(0); }, [BANNERS.length]);

  if (dismissed) return null;

  const banner = BANNERS[current] || BANNERS[0];
  const cta = 'Learn More';
  const ChevronNext = isRTL ? ChevronLeft : ChevronRight;
  const ChevronPrev = isRTL ? ChevronRight : ChevronLeft;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 pt-4 pb-4">
      <div className="relative bg-white rounded-3xl shadow-lg overflow-hidden">
        {/* Dismiss */}
        <button onClick={() => setDismissed(true)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10">
          <X className="w-5 h-5" />
        </button>

        <div className="relative flex items-center gap-4">
          {/* Prev arrow */}
          <button onClick={() => setCurrent(i => (i - 1 + BANNERS.length) % BANNERS.length)}
            className="hidden md:flex shrink-0 items-center justify-center w-10 h-10 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors ml-4">
            <ChevronPrev className="w-5 h-5" />
          </button>

          <div className="relative flex-1 aspect-[16/7]">
            <AnimatePresence>
              <motion.div
                key={banner.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0"
              >
                <img src={banner.image_url} alt="banner" className="w-full h-full object-cover block rounded-2xl" />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Next arrow */}
          <button onClick={() => setCurrent(i => (i + 1) % BANNERS.length)}
            className="hidden md:flex shrink-0 items-center justify-center w-10 h-10 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors mr-4">
            <ChevronNext className="w-5 h-5" />
          </button>
        </div>

        {/* Bottom bar: dots + CTA */}
        <div className="flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2">
            {BANNERS.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={`rounded-full transition-all ${i === current ? 'w-2.5 h-2.5 bg-teal-600' : 'w-2.5 h-2.5 bg-teal-100'}`} />
            ))}
          </div>
          <Link to={banner.path}>
            <span className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-6 py-2.5 rounded-full flex items-center gap-1 transition-colors">
              {cta}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}