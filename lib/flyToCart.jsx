import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAnimationControls } from 'framer-motion';

/**
 * FlyToCart — a premium, GPU-only "fly-to-cart" / "fly-from-cart" motion layer.
 *
 * flyToCart(imageEl, { from })   — orb materializes over the product image,
 *   flies along a curved arc to the cart icon, and is absorbed (cart pulse +
 *   badge pop). Used for add-to-cart and every "+" button.
 * flyFromCart(imageEl, { from }) — reverse: orb leaves the cart icon, flies
 *   back to the product image, and dissolves with a soft ripple. Used for
 *   every "−" button.
 *
 * Only transform & opacity are animated (will-change set). The real cart
 * state updates instantly and is never touched — this is purely visual.
 * Each click launches its own independent orb (max 5 in flight; oldest is
 * dropped). prefers-reduced-motion skips the flight and only fires the dock
 * pulse + badge update.
 */

const FlyToCartContext = createContext(null);
const RIM = '#E8FBF7';
const MEDICAL_ICON_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="#E8FBF7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ' +
  'style="position:absolute;inset:0;margin:auto;width:42%;height:42%;display:block">' +
  '<path d="M12 7v10M7 12h10"/></svg>';

const activeOrbs = [];

function readPrimaryCh() {
  if (typeof window === 'undefined') return '180 82% 35%';
  try {
    const ch = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
    if (ch) return ch;
  } catch { /* ignore */ }
  return '180 82% 35%';
}

function isMobile() {
  return typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
}
function isRtl() {
  return typeof document !== 'undefined' &&
    (document.dir === 'rtl' || getComputedStyle(document.documentElement).direction === 'rtl');
}
function reducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
function center(rect) {
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}
function onScreen(rect) {
  return rect && rect.width > 0 && rect.height > 0 &&
    rect.bottom > 0 && rect.top < window.innerHeight &&
    rect.right > 0 && rect.left < window.innerWidth;
}

function resolveTarget() {
  const header = document.getElementById('cart-target');
  if (header) {
    const r = header.getBoundingClientRect();
    if (onScreen(r)) return center(r);
  }
  const mobile = document.getElementById('cart-target-mobile');
  if (mobile) {
    const r = mobile.getBoundingClientRect();
    if (onScreen(r)) return center(r);
  }
  const page = document.getElementById('cart-page-btn');
  if (page) {
    const r = page.getBoundingClientRect();
    if (onScreen(r)) return center(r);
  }
  return { x: isRtl() ? 40 : window.innerWidth - 40, y: 44 };
}

/** Quadratic-Bezier arc, control point raised ~30% of the distance. */
function sampleArc(start, end, liftRatio = 0.3) {
  const mx = (start.x + end.x) / 2;
  const my = (start.y + end.y) / 2;
  const dist = Math.hypot(end.x - start.x, end.y - start.y);
  const lift = Math.max(80, dist * liftRatio);
  const cx = mx;
  const cy = my - lift;
  const N = 24;
  const pts = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const it = 1 - t;
    pts.push({
      x: it * it * start.x + 2 * it * t * cx + t * t * end.x,
      y: it * it * start.y + 2 * it * t * cy + t * t * end.y,
      t,
    });
  }
  return pts;
}

function emitRing(x, y, size, color, dur, scaleTo) {
  const ring = document.createElement('div');
  ring.style.cssText =
    `position:fixed;left:${x - size / 2}px;top:${y - size / 2}px;width:${size}px;height:${size}px;` +
    `border-radius:9999px;border:2px solid ${color};pointer-events:none;z-index:9998;` +
    `will-change:transform,opacity;transform:scale(1);opacity:0.55;`;
  document.body.appendChild(ring);
  if (ring.animate) {
    const a = ring.animate(
      [{ transform: 'scale(1)', opacity: 0.55 }, { transform: `scale(${scaleTo})`, opacity: 0 }],
      { duration: dur, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
    );
    a.onfinish = () => ring.remove();
  } else {
    setTimeout(() => ring.remove(), dur + 40);
  }
}

/** CSS cubic-bezier easing used by the flight, sampled for the particle trail. */
function makeBezierEasing(x1, y1, x2, y2) {
  const cxAt = (t) => 3 * (1 - t) * (1 - t) * t * x1 + 3 * (1 - t) * t * t * x2 + t * t * t;
  const cyAt = (t) => 3 * (1 - t) * (1 - t) * t * y1 + 3 * (1 - t) * t * t * y2 + t * t * t;
  const dxAt = (t) => 3 * (1 - t) * (1 - t) * x1 + 6 * (1 - t) * t * (x2 - x1) + 3 * t * t * (1 - x2);
  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const d = dxAt(t);
      if (Math.abs(d) < 1e-6) break;
      t -= (cxAt(t) - x) / d;
    }
    return cyAt(t);
  };
}

/** Emits one small, softly glowing blue orb that drifts outward and fades. */
function emitParticle(portal, x, y, teal) {
  const size = 9 + Math.random() * 5;
  const angle = Math.random() * Math.PI * 2;
  const drift = 6 + Math.random() * 9;
  const dx = Math.cos(angle) * drift;
  const dy = Math.sin(angle) * drift;
  const el = document.createElement('div');
  el.style.cssText =
    `position:absolute;left:${x - size / 2}px;top:${y - size / 2}px;width:${size}px;height:${size}px;` +
    `border-radius:9999px;pointer-events:none;will-change:transform,opacity;` +
    `background:radial-gradient(circle, #ffffff 0%, ${teal(0.95)} 38%, ${teal(0.25)} 100%);` +
    `box-shadow:0 0 8px ${teal(0.85)}, 0 0 16px ${teal(0.45)}, 0 0 24px ${teal(0.2)};opacity:0;`;
  portal.insertBefore(el, portal.firstChild);
  const a = el.animate(
    [
      { transform: 'translate(0, 0) scale(1)', opacity: 0.9, offset: 0 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.2)`, opacity: 0, offset: 1 },
    ],
    { duration: 680, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' }
  );
  a.onfinish = () => el.remove();
}

function pressFeedback(from, teal) {
  if (!from || !from.getBoundingClientRect) return;
  const r = from.getBoundingClientRect();
  emitRing(r.left + r.width / 2, r.top + r.height / 2, Math.max(r.width, r.height), teal(0.6), 460, 2);
}

function buildOrb(sourceImg, size, teal) {
  const portal = document.createElement('div');
  portal.style.cssText = 'position:fixed;inset:0;z-index:9999;pointer-events:none;';

  // outer — owns the flight translate (GPU only, transform).
  const outer = document.createElement('div');
  outer.style.cssText =
    `position:absolute;top:0;left:0;width:${size}px;height:${size}px;` +
    `will-change:transform;transform:translate3d(0,0,0);`;

  // inner — owns scale-in + shrink + opacity (GPU only, transform/opacity).
  const inner = document.createElement('div');
  inner.className = 'ftc-wrapper';
  inner.style.cssText =
    `position:absolute;inset:0;border-radius:9999px;` +
    `will-change:transform,opacity;transform:scale(0.6);opacity:0;`;

  // Light sweep — thin conic highlight rotating around the ring.
  const sweep = document.createElement('div');
  sweep.style.cssText =
    `position:absolute;inset:-3px;border-radius:9999px;` +
    `background:conic-gradient(from 0deg, transparent 0deg, ${teal(0.9)} 55deg, transparent 150deg);` +
    `opacity:0.85;animation:ftc-spin 1.2s linear infinite;`;

  const orb = document.createElement('div');
  orb.style.cssText =
    `position:absolute;inset:0;border-radius:9999px;overflow:hidden;background:#fff;` +
    `box-shadow:0 0 0 2px ${teal(1)}, 0 0 18px ${teal(0.45)}, 0 0 40px ${teal(0.2)};`;

  if (sourceImg && sourceImg.src) {
    const img = document.createElement('img');
    img.decoding = 'async';
    img.src = sourceImg.currentSrc || sourceImg.src;
    img.style.cssText = 'width:100%;height:100%;object-fit:contain;';
    orb.appendChild(img);
  } else {
    orb.style.background = `radial-gradient(circle at 30% 30%, ${teal(1)}, #0a3a3a)`;
    orb.innerHTML = MEDICAL_ICON_SVG;
  }

  // Glass highlight — soft radial white from the top-left.
  const glass = document.createElement('div');
  glass.style.cssText =
    `position:absolute;inset:0;border-radius:9999px;pointer-events:none;` +
    `background:radial-gradient(circle at 28% 22%, ${RIM}2e, transparent 55%);`;
  orb.appendChild(glass);

  inner.appendChild(sweep);
  inner.appendChild(orb);
  outer.appendChild(inner);
  portal.appendChild(outer);
  return { portal, outer, inner };
}

function trackOrb(portal) {
  activeOrbs.push(portal);
  while (activeOrbs.length > 5) {
    const old = activeOrbs.shift();
    try { old.remove(); } catch { /* ignore */ }
  }
}
function untrackOrb(portal) {
  const i = activeOrbs.indexOf(portal);
  if (i !== -1) activeOrbs.splice(i, 1);
}

function fadeAtCart(cartCenter, teal) {
  const size = isMobile() ? 56 : 72;
  const { portal, outer, inner } = buildOrb(null, size, teal);
  document.body.appendChild(portal);
  outer.style.transform = `translate3d(${cartCenter.x - size / 2}px, ${cartCenter.y - size / 2}px, 0)`;
  inner.style.transform = 'scale(0.35)';
  inner.style.opacity = '0';
  const a = inner.animate(
    [
      { transform: 'scale(0.35)', opacity: 0, offset: 0 },
      { transform: 'scale(0.35)', opacity: 1, offset: 0.4 },
      { transform: 'scale(0.2)', opacity: 0, offset: 1 },
    ],
    { duration: 320, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' }
  );
  a.onfinish = () => portal.remove();
}

function runFlight(direction, sourceImg, opts = {}) {
  const reverse = direction === 'from';
  const from = opts.from || sourceImg;
  const ch = readPrimaryCh();
  const teal = (a) => `hsl(${ch} / ${a})`;

  pressFeedback(from, teal);

  const cartCenter = resolveTarget();

  if (reducedMotion() || !sourceImg) {
    window.dispatchEvent(new CustomEvent(reverse ? 'flytocart:release' : 'flytocart:land'));
    return;
  }

  const imgRect = sourceImg.getBoundingClientRect();
  const imgCenter = center(imgRect);

  if (reverse && !onScreen(imgRect)) {
    window.dispatchEvent(new CustomEvent('flytocart:release'));
    fadeAtCart(cartCenter, teal);
    return;
  }
  if (!reverse && !onScreen(imgRect)) {
    window.dispatchEvent(new CustomEvent('flytocart:land'));
    return;
  }

  const start = reverse ? cartCenter : imgCenter;
  const end = reverse ? imgCenter : cartCenter;

  if (reverse) window.dispatchEvent(new CustomEvent('flytocart:release'));

  const size = isMobile() ? 56 : 72;
  const { portal, outer, inner } = buildOrb(sourceImg, size, teal);
  trackOrb(portal);
  document.body.appendChild(portal);

  const path = sampleArc(start, end, 0.3);
  const appearMs = 180;
  const flightMs = isMobile() ? 600 : 750;
  const landMs = 220;
  const total = flightMs + landMs;
  const flightEase = 'cubic-bezier(0.22, 1, 0.36, 1)';
  const landEase = 'cubic-bezier(0.4, 0, 0.2, 1)';
  const easeFn = makeBezierEasing(0.22, 1, 0.36, 1);

  // Arc control point — sampled at 60fps to emit the particle trail.
  const mx = (start.x + end.x) / 2;
  const my = (start.y + end.y) / 2;
  const dist = Math.hypot(end.x - start.x, end.y - start.y);
  const ctrl = { x: mx, y: my - Math.max(80, dist * 0.3) };

  // Place the orb at the start; the scale-in AND the flight both start at 0ms.
  outer.style.transform = `translate3d(${start.x - size / 2}px, ${start.y - size / 2}px, 0)`;
  inner.style.transform = reverse ? 'scale(0.35)' : 'scale(0.6)';
  inner.style.opacity = '0';

  if (!reverse) emitRing(start.x, start.y, size, teal(0.6), 460, 1.9);

  // Flight translate — starts immediately (overlaps the scale-in), GPU only.
  const flightKf = path.map((p) => ({
    transform: `translate3d(${p.x - size / 2}px, ${p.y - size / 2}px, 0)`,
    offset: p.t,
  }));
  const flight = outer.animate(flightKf, { duration: flightMs, easing: flightEase, fill: 'forwards' });

  // Scale + opacity — appear → shrink → land, one continuous GPU animation.
  const scaleKf = reverse
    ? [
        { transform: 'scale(0.35)', opacity: 0, offset: 0, easing: flightEase },
        { transform: 'scale(0.35)', opacity: 1, offset: appearMs / total, easing: flightEase },
        { transform: 'scale(1)', opacity: 1, offset: flightMs / total, easing: landEase },
        { transform: 'scale(1.08)', opacity: 0, offset: 1 },
      ]
    : [
        { transform: 'scale(0.6)', opacity: 0, offset: 0, easing: flightEase },
        { transform: 'scale(1)', opacity: 1, offset: appearMs / total, easing: flightEase },
        { transform: 'scale(0.35)', opacity: 1, offset: flightMs / total, easing: landEase },
        { transform: 'scale(0)', opacity: 0, offset: 1 },
      ];
  const scaleAnim = inner.animate(scaleKf, { duration: total, fill: 'forwards' });

  // 60fps glowing particle trail — small blue orbs emitted along the path.
  let raf = 0;
  const t0 = performance.now();
  let lastEmit = 0;
  const trailLoop = (now) => {
    const p = Math.min(1, (now - t0) / flightMs);
    const e = easeFn(p);
    const bx = (1 - e) * (1 - e) * start.x + 2 * (1 - e) * e * ctrl.x + e * e * end.x;
    const by = (1 - e) * (1 - e) * start.y + 2 * (1 - e) * e * ctrl.y + e * e * end.y;
    if (now - lastEmit > 14) { emitParticle(portal, bx, by, teal); lastEmit = now; }
    if (p < 1) raf = requestAnimationFrame(trailLoop);
  };
  raf = requestAnimationFrame(trailLoop);

  // Arrival at flightMs — dispatch dock event / reverse landing ring.
  flight.onfinish = () => {
    if (raf) cancelAnimationFrame(raf);
    if (reverse) {
      emitRing(end.x, end.y, size, teal(0.5), 420, 1.8);
    } else {
      window.dispatchEvent(new CustomEvent('flytocart:land'));
    }
  };

  // Cleanup once the landing scale finishes.
  scaleAnim.onfinish = () => {
    untrackOrb(portal);
    portal.remove();
  };
}

export function FlyToCartProvider({ children }) {
  return (
    <FlyToCartContext.Provider value={runFlight}>
      {children}
    </FlyToCartContext.Provider>
  );
}

export function useFlyToCart() {
  const run = useContext(FlyToCartContext);
  const noop = (ev) => {
    if (typeof window !== 'undefined') {
      setTimeout(() => window.dispatchEvent(new CustomEvent(ev)), 60);
    }
  };
  return {
    flyToCart: (img, opts) => (run ? run('to', img, opts) : noop('flytocart:land')),
    flyFromCart: (img, opts) => (run ? run('from', img, opts) : noop('flytocart:release')),
  };
}

/**
 * useCartDockPulse — attaches to the header cart icon. On `flytocart:land` it
 * spring-scales the icon out (1 → 1.15 → 1) with a glow ripple + particle
 * burst; on `flytocart:release` it does an inward pulse (1 → 0.9 → 1) with a
 * glow ripple. Returns controls + pulse/release keys + the particle list.
 */
export function useCartDockPulse() {
  const controls = useAnimationControls();
  const [pulseKey, setPulseKey] = useState(0);
  const [releaseKey, setReleaseKey] = useState(0);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    let id = 0;
    const onLand = () => {
      controls.start({ scale: [1, 1.15, 1], transition: { duration: 0.5, ease: 'easeOut' } });
      setPulseKey((k) => k + 1);
      const burst = Array.from({ length: 7 }, (_, i) => {
        const angle = (Math.PI * 2 * i) / 7 + Math.random() * 0.4;
        const dist = 18 + Math.random() * 10;
        id += 1;
        return { id, x: Math.cos(angle) * dist, y: Math.sin(angle) * dist };
      });
      setParticles((prev) => [...prev, ...burst]);
      const ids = new Set(burst.map((b) => b.id));
      setTimeout(() => setParticles((prev) => prev.filter((p) => !ids.has(p.id))), 450);
    };
    const onRelease = () => {
      controls.start({ scale: [1, 0.9, 1], transition: { duration: 0.4, ease: 'easeOut' } });
      setReleaseKey((k) => k + 1);
    };
    window.addEventListener('flytocart:land', onLand);
    window.addEventListener('flytocart:release', onRelease);
    return () => {
      window.removeEventListener('flytocart:land', onLand);
      window.removeEventListener('flytocart:release', onRelease);
    };
  }, [controls]);

  return { controls, pulseKey, releaseKey, particles };
}