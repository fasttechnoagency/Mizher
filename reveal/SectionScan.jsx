import React, { useRef, useEffect, useState } from 'react';

/**
 * SectionScan — "Medical Holographic Assembly" scroll-reveal accent.
 *
 * When its parent section scrolls into view, three synchronized decorative
 * layers play once, then the overlays are removed:
 *   1. A clearly luminous scan beam (crisp light core + restrained soft halo)
 *      that TRAVELS across the section's top boundary.
 *   2. A soft ambient "assembly" sweep that travels across the section behind
 *      the content (visible only in whitespace).
 *   3. A brief top edge glow that fades.
 *
 * Purely additive:
 *  - pointer-events:none + aria-hidden → never intercepts input or focus.
 *  - the overlays only animate their OWN transform/opacity, never any
 *    content element's, so they cannot conflict with existing framer-motion
 *    entrances, the search-bar animation, or Fly-to-Cart geometry.
 *  - clipped to the section so the traveling beam causes no horizontal overflow.
 *  - fails open: renders nothing under prefers-reduced-motion or if
 *    IntersectionObserver is unavailable; content is always visible.
 *
 * The parent is set to position:relative only while active (position:relative
 * does not create a scroll container, so sticky filter bars keep sticking to
 * the viewport) and restored afterward.
 */
export default function SectionScan() {
  const ref = useRef(null);
  const [play, setPlay] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const el = ref.current?.parentElement;
    if (!el) return;

    const prevPosition = el.style.position;
    if (!prevPosition || prevPosition === 'static') el.style.position = 'relative';

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || typeof IntersectionObserver === 'undefined') {
      setDone(true);
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { setPlay(true); io.disconnect(); }
      });
    }, { threshold: 0, rootMargin: '0px 0px -12% 0px' });
    io.observe(el);

    return () => {
      io.disconnect();
      el.style.position = prevPosition || '';
    };
  }, []);

  useEffect(() => {
    if (!play || done) return;
    const id = window.setTimeout(() => setDone(true), 1000);
    return () => window.clearTimeout(id);
  }, [play, done]);

  if (done) return null;
  return (
    <>
      <span ref={ref} className="hs-clip-top" aria-hidden="true">
        <span className={`hs-scan${play ? ' hs-scan--play' : ''}`} />
      </span>
      <span className="hs-clip" aria-hidden="true">
        <span className={`hs-edge${play ? ' hs-edge--play' : ''}`} />
        <span className={`hs-sweep${play ? ' hs-sweep--play' : ''}`} />
      </span>
    </>
  );
}