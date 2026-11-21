import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { usePrefReducedMotion } from './useInViewOnce';
import { useLanguage } from '@/lib/i18n';

/**
 * <JourneySpine /> — a subtle, fixed vertical light trail on the page edge
 * that fills with scroll progress, giving the homepage a single connected
 * "medical journey" spine. Decorative only: pointer-events:none, behind the
 * navbar. Hidden on mobile (clutter) and under reduced-motion. The faint
 * track + glowing teal/cyan fill ties the light-trail background language to
 * the scroll position without obscuring any content.
 */
export default function JourneySpine() {
  const reduce = usePrefReducedMotion();
  const { isRTL } = useLanguage();
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });

  if (reduce) return null;

  return (
    <div
      aria-hidden="true"
      className="hidden md:block fixed top-0 bottom-0 pointer-events-none z-30"
      style={{ [isRTL ? 'right' : 'left']: 0, width: '2px' }}
    >
      {/* faint static track */}
      <div className="absolute inset-0 bg-teal-300/15" />
      {/* glowing progress fill */}
      <motion.div
        className="absolute inset-x-0 top-0 origin-top bg-gradient-to-b from-cyan-300 via-teal-400 to-teal-500"
        style={{ height: '100%', scaleY, boxShadow: '0 0 7px 1px rgba(0,212,255,0.35)' }}
      />
    </div>
  );
}