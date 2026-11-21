import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1];

/**
 * <OutlineTrace /> — decorative SVG rounded-rect overlay matched to a target
 * element's size + border-radius (ResizeObserver). pointer-events:none,
 * aria-hidden, never affects layout.
 *
 * mode="once": active=true → draw (~drawDur) then fade (~fadeDur), one shot.
 * mode="hover": draws once; opacity follows `active` (fade in/out on hover).
 * mode="ambient": a faint light segment continuously travels around the
 *   perimeter while `active` is true (always-on edge light). Pauses off
 *   screen / reduced motion by unmounting.
 */
export default function OutlineTrace({
  targetRef, active, mode = 'once',
  color = 'hsl(var(--primary))', weight = 1.5, inset = 0,
  radiusOverride, drawDur = 700, fadeDur = 400, glow = true, reduce = false,
}) {
  const [size, setSize] = useState(null);
  const [played, setPlayed] = useState(false);

  useEffect(() => {
    const el = targetRef?.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      let radius = radiusOverride;
      if (radius == null) {
        const cs = window.getComputedStyle(el);
        radius = parseFloat(cs.borderTopLeftRadius) || 0;
      }
      setSize({ w: r.width, h: r.height, radius });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); };
  }, [targetRef, radiusOverride]);

  if (reduce || !size) return null;
  if (mode === 'once' && (played || !active)) return null;
  if (mode === 'ambient' && !active) return null;

  const pad = inset;
  const W = size.w + pad * 2;
  const H = size.h + pad * 2;
  const R = Math.min(size.radius || 0, W / 2, H / 2);
  // rounded-rect perimeter (for the ambient moving dash)
  const len = 2 * (W - 2 * R) + 2 * (H - 2 * R) + 2 * Math.PI * R;

  const common = {
    x: weight / 2,
    y: weight / 2,
    width: W - weight,
    height: H - weight,
    rx: R,
    ry: R,
    fill: 'none',
    stroke: color,
    strokeWidth: weight,
  };

  const svgProps = {
    style: { position: 'absolute', top: -pad, left: -pad, width: W, height: H, pointerEvents: 'none', zIndex: 6, overflow: 'visible' },
    'aria-hidden': true,
  };

  if (mode === 'ambient') {
    const dash = Math.max(8, len * 0.18);
    return (
      <svg width={W} height={H} {...svgProps}>
        <motion.rect
          {...common}
          strokeDasharray={`${dash} ${len - dash}`}
          initial={{ strokeDashoffset: len }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: len / 120, repeat: Infinity, ease: 'linear' }}
          style={{ filter: glow ? `drop-shadow(0 0 4px ${color})` : 'none', opacity: 0.3 }}
        />
      </svg>
    );
  }

  const isOnce = mode === 'once';
  const initial = isOnce ? { pathLength: 0, opacity: 1 } : { pathLength: 0, opacity: 0 };
  const animate = isOnce ? { pathLength: 1, opacity: 0 } : { pathLength: 1, opacity: active ? 1 : 0 };
  const transition = isOnce
    ? {
        pathLength: { duration: drawDur / 1000, ease: EASE },
        opacity: { delay: drawDur / 1000, duration: fadeDur / 1000, ease: 'easeOut' },
      }
    : {
        pathLength: { duration: drawDur / 1000, ease: EASE },
        opacity: { duration: fadeDur / 1000, ease: 'easeOut' },
      };

  return (
    <svg width={W} height={H} {...svgProps}>
      <motion.rect
        {...common}
        initial={initial}
        animate={animate}
        transition={transition}
        onAnimationComplete={() => { if (isOnce) setPlayed(true); }}
        style={{ filter: glow ? `drop-shadow(0 0 4px ${color})` : 'none' }}
      />
    </svg>
  );
}