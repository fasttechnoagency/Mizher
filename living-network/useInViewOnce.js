import { useState, useEffect, useCallback } from 'react';

/**
 * Returns [ref, entered]. `ref` is a callback ref so it works even when the
 * observed element mounts late (e.g. after async data). Fires once when the
 * element scrolls into view (IntersectionObserver, threshold ~0.25). Under
 * prefers-reduced-motion or when IO is unavailable, resolves true immediately.
 */
export function useInViewOnce({ threshold = 0.25, rootMargin = '0px 0px -10% 0px' } = {}) {
  const [el, setEl] = useState(null);
  const [entered, setEntered] = useState(false);

  const ref = useCallback((node) => setEl(node), []);

  useEffect(() => {
    if (!el || entered) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || typeof IntersectionObserver === 'undefined') {
      setEntered(true);
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          setEntered(true);
          io.disconnect();
        }
      });
    }, { threshold, rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [el, entered, threshold, rootMargin]);

  return [ref, entered];
}

/** Reactive prefers-reduced-motion flag. */
export function usePrefReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduce(mq.matches);
    const handler = () => setReduce(mq.matches);
    if (mq.addEventListener) mq.addEventListener('change', handler);
    else mq.addListener(handler);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', handler);
      else mq.removeListener(handler);
    };
  }, []);
  return reduce;
}