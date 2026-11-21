import React, { useRef, useEffect } from 'react';
import { useTabVisible } from './useAlive';
import { usePrefReducedMotion } from './useInViewOnce';

/**
 * <LightTrails /> — the replacement for the old particle/network background.
 * A restrained, elegant field of thin flowing cyan/teal light trails that
 * drift slowly and organically across a soft atmospheric gradient. Fixed
 * full-screen, pointer-events:none, behind all content (z-index 0). Pauses
 * when the tab is hidden or reduced motion is requested. No particles, no
 * connecting nodes, no cursor coupling — just calm luminous paths that feel
 * like medical data flowing through an intelligent environment.
 */
const TRAILS = [
  { yf: 0.16, amp: 60,  freq: 0.0042, speed:  0.018, phase: 0.0, color: '16,162,162', op: 0.14, w: 1.2 },
  { yf: 0.33, amp: 95,  freq: 0.0030, speed: -0.014, phase: 1.2, color: '0,212,255',  op: 0.10, w: 1.0 },
  { yf: 0.51, amp: 72,  freq: 0.0038, speed:  0.022, phase: 2.4, color: '16,162,162', op: 0.12, w: 1.3 },
  { yf: 0.69, amp: 112, freq: 0.0026, speed: -0.016, phase: 3.6, color: '20,184,166', op: 0.09, w: 1.0 },
  { yf: 0.86, amp: 80,  freq: 0.0034, speed:  0.020, phase: 4.8, color: '0,212,255',  op: 0.11, w: 1.2 },
];

const BG_GRADIENT =
  'radial-gradient(60% 50% at 18% 28%, rgba(16,162,162,0.055), transparent 70%),' +
  'radial-gradient(50% 42% at 82% 72%, rgba(0,212,255,0.045), transparent 70%),' +
  'radial-gradient(40% 30% at 50% 50%, rgba(20,184,166,0.03), transparent 70%)';

export default function LightTrails() {
  const reduce = usePrefReducedMotion();
  const tabVis = useTabVisible();
  const canvasRef = useRef(null);

  useEffect(() => {
    if (reduce) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf = null, w = 0, h = 0, dpr = 1;
    const trails = TRAILS.map((t) => ({ ...t, ph: t.phase }));

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const t of trails) {
        t.ph += t.speed;
        const baseY = h * t.yf;
        ctx.beginPath();
        for (let x = 0; x <= w; x += 10) {
          const y = baseY + Math.sin(x * t.freq + t.ph) * t.amp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        const grad = ctx.createLinearGradient(0, 0, w, 0);
        grad.addColorStop(0, `rgba(${t.color},0)`);
        grad.addColorStop(0.5, `rgba(${t.color},${t.op})`);
        grad.addColorStop(1, `rgba(${t.color},0)`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = t.w;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `rgba(${t.color},0.45)`;
        ctx.stroke();
      }
      raf = requestAnimationFrame(draw);
    };

    const start = () => {
      resize();
      if (raf == null) raf = requestAnimationFrame(draw);
    };
    const stop = () => {
      if (raf != null) { cancelAnimationFrame(raf); raf = null; }
    };

    window.addEventListener('resize', resize);
    if (tabVis) start();
    const onVis = () => { if (document.hidden) stop(); else start(); };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      stop();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [reduce, tabVis]);

  if (reduce) {
    return (
      <div
        aria-hidden="true"
        style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: BG_GRADIENT }}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: BG_GRADIENT }}
    >
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
    </div>
  );
}