import React from 'react';
import { motion } from 'framer-motion';
import { usePrefReducedMotion } from '@/components/living-network/useInViewOnce';

/**
 * <VitalScanReveal /> — the flagship "medical monitor develop" reveal.
 * Content is masked and reveals from the bottom upward (like an image
 * developing on a diagnostic screen), while a thin themed scan beam
 * travels up the reveal frontier and a soft top edge glow fades in.
 *
 * Props:
 *  - soft: opacity-only (no clip) for grids where geometry must stay
 *    stationary (Fly-to-Cart, sticky filters).
 *  - delay: stagger offset in seconds.
 * Reduced motion: children render plainly, fully visible.
 */
export default function VitalScanReveal({ children, className = '', soft = false, delay = 0 }) {
  const reduce = usePrefReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`vs ${className}`}>
      <motion.div
        className="vs__content"
        initial={soft ? { opacity: 0 } : { clipPath: 'inset(0 0 100% 0)', opacity: 0 }}
        whileInView={soft ? { opacity: 1 } : { clipPath: 'inset(0 0 0 0)', opacity: 1 }}
        viewport={{ once: true, margin: '-12% 0px' }}
        transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
      {!soft && (
        <motion.span
          className="vs__beam"
          aria-hidden="true"
          initial={{ bottom: '0%', opacity: 0 }}
          whileInView={{ bottom: '100%', opacity: [0, 1, 1, 0] }}
          viewport={{ once: true, margin: '-12% 0px' }}
          transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
        />
      )}
      <motion.span
        className="vs__edge"
        aria-hidden="true"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: [0, 0.8, 0] }}
        viewport={{ once: true, margin: '-12% 0px' }}
        transition={{ duration: 1.1, delay, ease: 'easeOut' }}
      />
    </div>
  );
}