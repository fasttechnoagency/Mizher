import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { usePrefReducedMotion } from '@/components/living-network/useInViewOnce';

/**
 * <Parallax /> — a self-contained, restrained scroll-parallax wrapper.
 * Translates its children on Y based on the element's own progress through
 * the viewport (start/end). Transform-only (no layout shift), fails open on
 * reduced-motion (renders a plain div). Used to give section headers a
 * subtle, connected scroll-driven motion.
 */
export default function Parallax({ children, range = 28, className = '' }) {
  const reduce = usePrefReducedMotion();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [range / 2, -range / 2]);

  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}