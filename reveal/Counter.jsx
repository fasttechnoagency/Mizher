import React, { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { usePrefReducedMotion } from '@/components/living-network/useInViewOnce';

/**
 * <Counter /> — animates a number from 0 to `value` once when it enters the
 * viewport. Respects reduced-motion (renders the final value). Handles
 * integers and one-decimal floats. Used on existing displayed statistics
 * (never invents values).
 */
export default function Counter({ value, suffix = '', duration = 1.4, className = '' }) {
  const reduce = usePrefReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-15% 0px' });
  const [display, setDisplay] = useState(reduce ? value : 0);

  useEffect(() => {
    if (!inView || reduce) { setDisplay(value); return; }
    let raf;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / (duration * 1000));
      const e = 1 - Math.pow(1 - p, 3);
      setDisplay(value * e);
      if (p < 1) raf = requestAnimationFrame(tick);
      else setDisplay(value);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration, reduce]);

  const text = Number.isInteger(value) ? Math.round(display).toString() : display.toFixed(1);
  return <span ref={ref} className={className}>{text}{suffix}</span>;
}