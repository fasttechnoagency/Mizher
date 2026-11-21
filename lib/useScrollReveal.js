import { useLayoutEffect, useRef } from 'react';

/**
 * useScrollReveal — reveals a container when it scrolls into view.
 *
 * Fail-open: the hiding (data-reveal="pending") is applied synchronously in
 * a layout effect BEFORE first paint, so there is no flash of hidden-then-
 * shown content. If JS never runs, the attribute is never set and the content
 * stays fully visible (no CSS rule matches). Under prefers-reduced-motion or
 * if IntersectionObserver is unavailable, the container is marked "in"
 * immediately (visible, no movement). Reveals once; scrolling back does not
 * re-hide.
 *
 * Pass { soft: true } for cart-sensitive grids (Marketplace): opacity-only,
 * no transform, so product-card geometry stays stationary for Fly-to-Cart.
 */
export function useScrollReveal({ soft = false } = {}) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (soft) el.setAttribute('data-reveal-soft', '');

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || typeof IntersectionObserver === 'undefined') {
      el.setAttribute('data-reveal', 'in');
      return;
    }

    el.setAttribute('data-reveal', 'pending');

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          el.setAttribute('data-reveal', 'in');
          io.disconnect();
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
    io.observe(el);

    return () => io.disconnect();
  }, [soft]);

  return ref;
}