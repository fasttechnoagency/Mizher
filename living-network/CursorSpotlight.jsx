import React, { useRef, useEffect, useState } from 'react';

const EASE = [0.22, 1, 0.36, 1];

/**
 * <CursorSpotlight /> — a soft radial light that follows the pointer across
 * its positioned parent. Listens on the parentElement (so the overlay itself
 * can stay pointer-events:none). Fades out when the pointer leaves.
 */
export default function CursorSpotlight({ reduce, color = 'hsl(var(--primary))', size = 240, opacity = 0.16, z = 1 }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: -9999, y: -9999, on: false });

  useEffect(() => {
    const el = ref.current?.parentElement;
    if (!el) return;
    const onMove = (e) => {
      if (reduce) return;
      const r = el.getBoundingClientRect();
      setPos({ x: e.clientX - r.left, y: e.clientY - r.top, on: true });
    };
    const onLeave = () => setPos((p) => ({ ...p, on: false }));
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [reduce]);

  if (reduce) return null;

  return (
    <div ref={ref} className="absolute inset-0 pointer-events-none" aria-hidden="true" style={{ overflow: 'hidden', borderRadius: 'inherit', zIndex: z }}>
      <div
        style={{
          position: 'absolute',
          left: pos.x - size / 2,
          top: pos.y - size / 2,
          width: size,
          height: size,
          borderRadius: '9999px',
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          opacity: pos.on ? opacity : 0,
          transition: 'opacity 300ms ease',
          mixBlendMode: 'screen',
          willChange: 'transform, opacity',
        }}
      />
    </div>
  );
}