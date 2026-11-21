import React from 'react';
import { useInViewOnce, usePrefReducedMotion } from '@/components/living-network/useInViewOnce';

/**
 * <StethoscopePulse /> — concentric themed pulse rings that expand once
 * behind its children when the wrapper scrolls into view. Decorative
 * (aria-hidden rings, pointer-events:none). Reduced motion renders none.
 */
export default function StethoscopePulse({ children, className = '' }) {
  const reduce = usePrefReducedMotion();
  const [ref, entered] = useInViewOnce({ threshold: 0.4 });

  return (
    <div ref={ref} className={`stp relative ${className}`}>
      {!reduce && entered && (
        <>
          <span className="stp-ring stp-ring--1" aria-hidden="true" />
          <span className="stp-ring stp-ring--2" aria-hidden="true" />
        </>
      )}
      <div className="relative" style={{ zIndex: 2 }}>{children}</div>
    </div>
  );
}