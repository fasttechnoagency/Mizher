import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n';
import { ChevronLeft, ChevronRight, ExternalLink, Play, Youtube } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PostCard from '@/components/living-network/PostCard';
import SocialTabButton from '@/components/home/SocialTabButton';
import OutlineTrace from '@/components/living-network/OutlineTrace';
import { useInViewOnce, usePrefReducedMotion } from '@/components/living-network/useInViewOnce';
import { useAmbientActive } from '@/components/living-network/useAlive';

const EASE = [0.22, 1, 0.36, 1];

function ViewMoreCard({ profileUrl, isRTL, active, reduce, cardRef }) {
  const [hover, setHover] = useState(false);
  const [ambRef, ambientActive] = useAmbientActive(0);
  const merged = (node) => { if (cardRef) cardRef.current = node; ambRef(node); };
  const targetX = isRTL ? -2 : 2;

  return (
    <a
      ref={merged}
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="relative flex-shrink-0 w-40 rounded-2xl border-2 border-dashed border-teal-200 flex flex-col items-center justify-center gap-2 text-teal-500 hover:bg-teal-50 hover:border-teal-400 transition-all p-4 text-center"
    >
      <motion.span
        initial={false}
        animate={{ x: hover && !reduce ? targetX : 0, y: hover && !reduce ? -2 : 0 }}
        transition={{ duration: 0.2, ease: EASE }}
        className="inline-flex"
      >
        <ExternalLink className="w-6 h-6" />
      </motion.span>
      <span className="text-xs font-semibold">{isRTL ? 'عرض المزيد' : 'View More'}</span>

      {/* Permanently alive dashed border: flowing dashes + orbiting light */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true" style={{ overflow: 'visible' }}>
        <rect
          x="2" y="2" width="calc(100% - 4px)" height="calc(100% - 4px)" rx="16" ry="16"
          fill="none" stroke="hsl(var(--primary))" strokeWidth="2"
          strokeDasharray="6 8"
          style={{ filter: 'drop-shadow(0 0 3px hsl(var(--primary) / 0.5))' }}
        >
          {ambientActive && !reduce && (
            <animate attributeName="stroke-dashoffset" from="0" to="-28" dur={hover ? '2.5s' : '6s'} repeatCount="indefinite" />
          )}
        </rect>
      </svg>
      <OutlineTrace targetRef={cardRef} active={active} mode="once" drawDur={900} fadeDur={400} weight={1.5} inset={0} radiusOverride={16} reduce={reduce} />
    </a>
  );
}

export default function SocialFeedSlider() {
  const { isRTL } = useLanguage();
  const reduce = usePrefReducedMotion();
  const [activeTab, setActiveTab] = useState('facebook');
  const [tabSwitched, setTabSwitched] = useState(false);
  const sliderRef = useRef(null);
  const viewMoreRef = useRef(null);
  const [sectionRef, entered] = useInViewOnce({ threshold: 0.25 });
  const [scanRef, scanActive] = useAmbientActive(0);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    if (entered) {
      const t = setTimeout(() => setPlay(true), reduce ? 0 : 300);
      return () => clearTimeout(t);
    }
  }, [entered, reduce]);

  const { data: settings } = useQuery({
    queryKey: ['app-settings-social'],
    queryFn: async () => {
      const all = await base44.entities.AppSettings.list();
      return all.find(s => s.key === 'social_feed') || null;
    },
    staleTime: 60000,
  });

  const instaPosts = settings?.instagram_posts || [];
  const fbPosts = settings?.facebook_posts || [];
  const ytPosts = settings?.youtube_posts || [];
  const instaUrl = settings?.instagram_url || 'https://www.instagram.com/mizher.jo';
  const fbUrl = settings?.facebook_url || 'https://www.facebook.com/share/18yRK3phWY/?mibextid=wwXIfr';
  const ytUrl = settings?.youtube_url || 'https://www.youtube.com';

  const postsByTab = { facebook: fbPosts, youtube: ytPosts, instagram: instaPosts };
  const urlByTab = { facebook: fbUrl, youtube: ytUrl, instagram: instaUrl };
  const posts = postsByTab[activeTab] || [];
  const profileUrl = urlByTab[activeTab];

  const scroll = (dir) => {
    const el = sliderRef.current;
    if (!el) return;
    if (reduce) { el.scrollBy({ left: dir * 240, behavior: 'auto' }); return; }
    const start = el.scrollLeft;
    const target = start + dir * 240;
    const dur = 500;
    const t0 = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 4);
    const step = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      el.scrollLeft = start + (target - start) * ease(p);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const switchTab = (tab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setTabSwitched(true);
  };

  if (!settings || (instaPosts.length === 0 && fbPosts.length === 0 && ytPosts.length === 0)) return null;

  const hasInsta = instaPosts.length > 0;
  const hasFb = fbPosts.length > 0;
  const hasYt = ytPosts.length > 0;
  const enableTrace = play && !tabSwitched && !reduce;

  return (
    <div ref={sectionRef} className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {hasFb && <SocialTabButton tab="facebook" active={activeTab} onClick={() => switchTab('facebook')} />}
          {hasYt && <SocialTabButton tab="youtube" active={activeTab} onClick={() => switchTab('youtube')} />}
          {hasInsta && <SocialTabButton tab="instagram" active={activeTab} onClick={() => switchTab('instagram')} />}
        </div>

        <div className="flex items-center gap-2">
          <a href={profileUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-teal-600 hover:underline font-medium">
            {isRTL ? 'عرض الصفحة' : 'View Profile'}
            <ExternalLink className="w-3 h-3" />
          </a>
          <button onClick={() => scroll(isRTL ? 1 : -1)} className="w-7 h-7 rounded-full border border-teal-100 flex items-center justify-center hover:bg-teal-50 transition-colors">
            <ChevronLeft className="w-4 h-4 text-teal-600" />
          </button>
          <button onClick={() => scroll(isRTL ? -1 : 1)} className="w-7 h-7 rounded-full border border-teal-100 flex items-center justify-center hover:bg-teal-50 transition-colors">
            <ChevronRight className="w-4 h-4 text-teal-600" />
          </button>
        </div>
      </div>

      {/* Slider: a single soft crossfade on tab switch (no entry replay) */}
      <div ref={scanRef} className="relative">
        {/* tab-switch scan sweep across the row */}
        <AnimatePresence>
          <motion.div
            key={activeTab}
            ref={sliderRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: EASE }}
            className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {posts.map((post, i) => (
              <PostCard key={i} post={post} i={i} profileUrl={profileUrl} isRTL={isRTL} play={play} enableTrace={enableTrace} reduce={reduce} />
            ))}
            <ViewMoreCard profileUrl={profileUrl} isRTL={isRTL} active={play} reduce={reduce} cardRef={viewMoreRef} />
          </motion.div>
        </AnimatePresence>

        {scanActive && !reduce && (
          <motion.div
            aria-hidden
            className="absolute inset-y-0 pointer-events-none"
            style={{ width: '40%', background: 'linear-gradient(90deg, transparent, hsl(var(--primary) / 0.08), transparent)' }}
            initial={{ x: '-120%' }}
            animate={{ x: '220%' }}
            transition={{ duration: 0.6, ease: EASE }}
            key={`scan-${activeTab}`}
          />
        )}
      </div>
    </div>
  );
}