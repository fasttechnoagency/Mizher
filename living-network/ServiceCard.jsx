import React, { useRef, useState, useEffect } from 'react';
import { Link } from '@/lib/router-compat';
import { motion, AnimatePresence } from 'framer-motion';
import OutlineTrace from './OutlineTrace';
import { useAmbientActive } from './useAlive';

const EASE = [0.22, 1, 0.36, 1];

/**
 * <ServiceCard /> — preserves the exact resting design of a service card and
 * layers the "Live Care Network" motion:
 *  - Entry (once): icon halo bloom in its OWN color, then a light travels the
 *    card outline.
 *  - Ambient (always on): the icon floats subtly (2px, phase-offset); a faint
 *    edge light travels the card perimeter; the network branch pulses are
 *    handled by <LiveNetwork />.
 *  - Reactive: hover/focus reroutes the network (reported to the parent),
 *    icon glows strongly, a teal edge segment follows the nearest side, and
 *    the content tilts ≤4° toward the cursor. Click flashes icon→arrow, the
 *    arrow nudges forward, and the <Link> navigates immediately.
 * Reduced motion: final state, no loops/tilt. Overlays pointer-events:none.
 */
export default function ServiceCard({ s, i, isRTL, Chevron, activate, activateDelay, glowColor, iconRef, reduce, onHover, onLeave }) {
  const cardRef = useRef(null);
  const arrowRef = useRef(null);
  const [actGlow, setActGlow] = useState(false);
  const [actOutline, setActOutline] = useState(false);
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [side, setSide] = useState('top');
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [flash, setFlash] = useState(null);
  const [arrowSlide, setArrowSlide] = useState(false);
  const [ambRef, ambientActive] = useAmbientActive(0);
  const mergedIconRef = (node) => { if (iconRef) iconRef.current = node; ambRef?.(node); };

  useEffect(() => {
    if (!activate || reduce) return;
    const t1 = setTimeout(() => setActGlow(true), activateDelay);
    const t2 = setTimeout(() => { setActGlow(false); setActOutline(true); }, activateDelay + 350);
    const t3 = setTimeout(() => setActOutline(false), activateDelay + 350 + 800 + 450);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [activate, activateDelay, reduce]);

  const onMove = (e) => {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    if (!reduce) {
      const dL = px, dR = 1 - px, dT = py, dB = 1 - py;
      const m = Math.min(dL, dR, dT, dB);
      setSide(m === dT ? 'top' : m === dB ? 'bottom' : m === dL ? 'left' : 'right');
      setTilt({ rx: -(py - 0.5) * 4, ry: (px - 0.5) * 4 });
    }
  };

  const onClick = () => {
    if (reduce) return;
    const card = cardRef.current;
    const icon = iconRef?.current;
    const arrow = arrowRef.current;
    if (card && icon && arrow) {
      const cr = card.getBoundingClientRect();
      const ic = icon.getBoundingClientRect();
      const ar = arrow.getBoundingClientRect();
      setFlash({
        sx: ic.left + ic.width / 2 - cr.left,
        sy: ic.top + ic.height / 2 - cr.top,
        ex: ar.left + ar.width / 2 - cr.left,
        ey: ar.top + ar.height / 2 - cr.top,
        key: Date.now(),
      });
      setTimeout(() => setFlash(null), 260);
    }
    setArrowSlide(true);
    setTimeout(() => setArrowSlide(false), 260);
  };

  const showHover = (hover || focus) && !reduce;

  const seg = {
    top: { top: 0, left: '35%', width: '30%', height: 2 },
    bottom: { bottom: 0, left: '35%', width: '30%', height: 2 },
    left: { left: 0, top: '35%', height: '30%', width: 2 },
    right: { right: 0, top: '35%', height: '30%', width: 2 },
  }[side];
  const segScale = side === 'top' || side === 'bottom' ? 'scaleX' : 'scaleY';
  const segBg = segScale === 'scaleX'
    ? 'linear-gradient(90deg,transparent,hsl(var(--primary)),transparent)'
    : 'linear-gradient(180deg,transparent,hsl(var(--primary)),transparent)';

  return (
    <Link
      to={s.path}
      onClick={onClick}
      onMouseEnter={() => { setHover(true); onHover?.(i); }}
      onMouseLeave={() => { setHover(false); onLeave?.(); }}
      onMouseMove={onMove}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      className="block rounded-2xl outline-none"
    >
      <div ref={cardRef} className="relative bg-card border border-teal-100 rounded-2xl p-6 cursor-pointer h-full focus-within:ring-2 focus-within:ring-teal-400/30">
        <motion.div
          animate={{ rotateX: tilt.rx, rotateY: tilt.ry }}
          transition={{ duration: 0.25, ease: EASE }}
          style={{ transformStyle: 'preserve-3d', perspective: 800 }}
        >
          <div ref={mergedIconRef} className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-4 shadow-lg`}>
            <motion.div
              animate={{ y: ambientActive ? [0, -2, 0] : 0 }}
              transition={{ duration: 4 + i * 0.4, repeat: Infinity, ease: 'easeInOut' }}
              className="flex"
            >
              <s.Icon className="w-7 h-7 text-white" />
            </motion.div>

            {actGlow && !reduce && (
              <motion.div aria-hidden className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{ boxShadow: `0 0 28px 10px ${glowColor}, 0 0 14px 5px ${glowColor}` }}
                initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.35, times: [0, 0.5, 1], ease: EASE }} />
            )}

            <AnimatePresence>
              {showHover && (
                <motion.div aria-hidden className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{ boxShadow: `0 0 22px 7px ${glowColor}` }}
                  initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: EASE }} />
              )}
            </AnimatePresence>
          </div>

          <h3 className="font-bold text-foreground mb-1">{isRTL ? s.ar : s.en}</h3>
          <p className="text-xs text-muted-foreground mb-3">{isRTL ? s.desc_ar : s.desc_en}</p>
          <div className="flex items-center gap-1 text-teal-600 text-xs font-semibold">
            {isRTL ? 'استكشف' : 'Explore'}
            <motion.span ref={arrowRef} className="inline-flex"
              animate={{ x: arrowSlide ? (isRTL ? -3 : 3) : 0 }}
              transition={{ duration: 0.22, ease: EASE }}>
              <Chevron className="w-3 h-3" />
            </motion.span>
          </div>
        </motion.div>

        {/* Activation outline (once) */}
        <OutlineTrace targetRef={cardRef} active={actOutline} mode="once" drawDur={800} fadeDur={400} weight={1.5} inset={0} reduce={reduce} />
        {/* Ambient edge light (always on while visible) */}
        <OutlineTrace targetRef={cardRef} active={ambientActive} mode="ambient" weight={1} inset={0} reduce={reduce} />

        {/* Hover edge segment */}
        <AnimatePresence>
          {showHover && (
            <motion.div aria-hidden className="absolute pointer-events-none rounded-full"
              style={{ ...seg, position: 'absolute', transformOrigin: 'center', background: segBg }}
              initial={{ opacity: 0, [segScale]: 0 }}
              animate={{ opacity: 1, [segScale]: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE }} />
          )}
        </AnimatePresence>

        {/* Click flash */}
        {flash && (
          <motion.div key={flash.key} aria-hidden className="absolute pointer-events-none rounded-full"
            style={{ left: flash.sx, top: flash.sy, width: 8, height: 8, marginLeft: -4, marginTop: -4, background: 'hsl(var(--primary))', boxShadow: '0 0 10px 3px hsl(var(--primary) / 0.8)' }}
            initial={{ x: 0, y: 0, opacity: 1 }}
            animate={{ x: flash.ex - flash.sx, y: flash.ey - flash.sy, opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }} />
        )}
      </div>
    </Link>
  );
}