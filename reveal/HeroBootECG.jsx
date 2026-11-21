import React from 'react';
import { motion } from 'framer-motion';
import { usePrefReducedMotion } from '@/components/living-network/useInViewOnce';

/**
 * <HeroBootECG /> — a one-time "power-on" ECG that draws a flatline then
 * spikes into a heartbeat across the hero on first load, reinforcing the
 * diagnostic-monitor identity. Decorative overlay (aria-hidden,
 * pointer-events:none), sits behind content. Reduced motion renders none.
 */
const PATH =
  'M0,30 L160,30 L172,30 L178,8 L184,52 L190,30 L240,30 L252,30 L258,12 L264,48 L270,30 L340,30 L352,30 L358,6 L364,54 L370,30 L420,30 L432,30 L438,14 L444,46 L450,30 L520,30';

export default function HeroBootECG() {
  const reduce = usePrefReducedMotion();
  if (reduce) return null;

  return (
    <div className="boot-ecg" aria-hidden="true">
      <svg viewBox="0 0 520 60" fill="none" preserveAspectRatio="none" width="100%" height="60">
        <motion.path
          d={PATH}
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: 'drop-shadow(0 0 6px hsl(var(--primary) / 0.8))' }}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0, 0.9, 0.7] }}
          transition={{ duration: 2.4, delay: 0.2, ease: 'easeInOut' }}
        />
      </svg>
    </div>
  );
}