import React from 'react';
import { motion } from 'framer-motion';
import { usePrefReducedMotion } from '@/components/living-network/useInViewOnce';

/**
 * <TitleECG /> — a themed ECG line that draws itself beneath a section heading
 * when scrolled into view, then keeps pulsing: a glowing pulse dot travels the
 * trace repeatedly, like a live patient monitor. Decorative (aria-hidden,
 * pointer-events:none). Reduced motion renders a static faint line.
 */
const PATH = 'M0,12 L40,12 L48,12 L54,4 L60,20 L66,12 L120,12 L132,12 L138,3 L144,21 L150,12 L220,12';
const LINE = '#3fa8a8';
const GLOW = 'rgba(63,168,168,0.6)';

export default function TitleECG({ className = '', width = 220, align = 'start' }) {
  const reduce = usePrefReducedMotion();
  return (
    <div
      className={`title-ecg flex ${align === 'center' ? 'justify-center' : 'justify-start'} ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 220 24"
        width={width}
        height="24"
        fill="none"
        preserveAspectRatio="none"
        style={{ overflow: 'visible' }}
      >
        <motion.path
          d={PATH}
          stroke={LINE}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: `drop-shadow(0 0 5px ${GLOW})` }}
          initial={reduce ? false : { pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 0.9 }}
          viewport={{ once: true, margin: '-15% 0px' }}
          transition={{ duration: 1.4, ease: 'easeInOut' }}
        />
        {!reduce && (
          <motion.circle
            r="2.8"
            fill={LINE}
            style={{ filter: `drop-shadow(0 0 6px ${LINE})` }}
            initial={{ cx: 0, cy: 12, opacity: 0 }}
            animate={{ cx: [0, 220], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 2.6, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.6, delay: 1.4 }}
          />
        )}
      </svg>
    </div>
  );
}