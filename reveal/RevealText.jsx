import React from 'react';
import { motion } from 'framer-motion';
import { usePrefReducedMotion } from '@/components/living-network/useInViewOnce';

const EASE = [0.22, 1, 0.36, 1];

/**
 * <RevealText /> — a masked heading/text reveal. The text rises from below a
 * clip (overflow-hidden) when it scrolls into view, once. Fails open on
 * reduced-motion (plain span). Used for section headings.
 */
export default function RevealText({ children, className = '', delay = 0 }) {
  const reduce = usePrefReducedMotion();
  if (reduce) return <span className={className}>{children}</span>;
  return (
    <span className="inline-block overflow-hidden align-bottom">
      <motion.span className={className}
        initial={{ y: '110%' }}
        whileInView={{ y: 0 }}
        viewport={{ once: true, margin: '-12% 0px' }}
        transition={{ duration: 0.6, delay, ease: EASE }}>
        {children}
      </motion.span>
    </span>
  );
}