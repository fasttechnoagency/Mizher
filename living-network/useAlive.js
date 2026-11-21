import { useState, useEffect, useCallback } from 'react';
import { usePrefReducedMotion } from './useInViewOnce';

/** Tab visibility (pauses ambient when the tab is hidden). */
export function useTabVisible() {
  const [vis, setVis] = useState(true);
  useEffect(() => {
    const on = () => setVis(!document.hidden);
    document.addEventListener('visibilitychange', on);
    return () => document.removeEventListener('visibilitychange', on);
  }, []);
  return vis;
}

/** Continuous in-view (not once). */
export function useInView(threshold = 0) {
  const [el, setEl] = useState(null);
  const [inView, setInView] = useState(false);
  const ref = useCallback((node) => setEl(node), []);
  useEffect(() => {
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [el, threshold]);
  return [ref, inView];
}

/**
 * Returns [ref, active, reduce]. `active` is true only while the element is
 * on-screen, the tab is visible, and the user has not requested reduced
 * motion — i.e. ambient loops should run. Uses a callback ref so it works
 * for elements that mount late.
 */
export function useAmbientActive(threshold = 0) {
  const [ref, inView] = useInView(threshold);
  const tabVis = useTabVisible();
  const reduce = usePrefReducedMotion();
  return [ref, inView && tabVis && !reduce, reduce];
}