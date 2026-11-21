import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrefReducedMotion } from '@/components/living-network/useInViewOnce';

/**
 * <SocialTabButton /> — a premium medical-platform social tab chip.
 * Frosted-teal chrome houses a brand-colored icon badge; the active tab fills
 * with a brand-tinted gradient, lifts with a soft glow, and pulses an ECG
 * underline. On click: a radial ripple burst + a sweeping scan beam.
 * Reduced motion renders a clean static chip.
 */

const BRAND = {
  facebook: {
    label: 'Facebook',
    color: '#1877F2',
    soft: '#e7f0ff',
    grad: 'linear-gradient(135deg, #1877F2 0%, #0b5ed7 100%)',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  youtube: {
    label: 'YouTube',
    color: '#FF0000',
    soft: '#ffe9e9',
    grad: 'linear-gradient(135deg, #FF2D2D 0%, #cc0000 100%)',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  instagram: {
    label: 'Instagram',
    color: '#E1306C',
    soft: '#ffe7f1',
    grad: 'linear-gradient(135deg, #f09433 0%, #dc2743 50%, #bc1888 100%)',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0 5.838a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 6.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5zm4.5-7.75a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5z" />
      </svg>
    ),
  },
};

export default function SocialTabButton({ tab, active, onClick }) {
  const reduce = usePrefReducedMotion();
  const b = BRAND[tab];
  const [hover, setHover] = useState(false);
  const [bursts, setBursts] = useState([]);
  const seq = useRef(0);

  const handleClick = (e) => {
    if (reduce) { onClick(); return; }
    const id = seq.current++;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setBursts((bs) => [...bs, { id, x, y }]);
    setTimeout(() => setBursts((bs) => bs.filter((r) => r.id !== id)), 700);
    onClick();
  };

  const isActive = active === tab;

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      whileTap={reduce ? undefined : { scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 420, damping: 22 }}
      className="relative overflow-hidden select-none"
      style={{ borderRadius: 14 }}
      aria-pressed={isActive}
    >
      {/* Chrome surface */}
      <div
        className="relative flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 border transition-colors duration-300"
        style={{
          borderRadius: 14,
          background: isActive
            ? b.grad
            : hover
            ? 'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(240,248,248,0.9))'
            : 'linear-gradient(180deg, rgba(255,255,255,0.85), rgba(238,246,246,0.8))',
          borderColor: isActive ? 'transparent' : hover ? 'hsl(var(--primary) / 0.55)' : 'hsl(var(--border))',
          boxShadow: isActive
            ? `0 6px 18px -6px ${b.color}80, 0 0 0 1px ${b.color}40 inset, 0 1px 0 rgba(255,255,255,0.4) inset`
            : hover
            ? `0 4px 12px -6px hsl(var(--primary) / 0.4), 0 0 0 1px hsl(var(--primary) / 0.18) inset`
            : '0 1px 2px rgba(2,42,42,0.06), 0 0 0 1px rgba(255,255,255,0.5) inset',
        }}
      >
        {/* Icon badge */}
        <span
          className="relative flex items-center justify-center w-7 h-7 rounded-[10px] transition-transform duration-300"
          style={{
            background: isActive ? 'rgba(255,255,255,0.22)' : b.soft,
            color: isActive ? '#fff' : b.color,
            boxShadow: isActive ? `0 0 10px ${b.color}99 inset` : 'none',
          }}
        >
          <span style={{ display: 'inline-flex', transform: hover && !isActive && !reduce ? 'scale(1.12)' : 'scale(1)', transition: 'transform 260ms cubic-bezier(0.22,1,0.36,1)' }}>
            {b.icon}
          </span>
          {/* subtle halo on active */}
          {isActive && !reduce && (
            <motion.span
              aria-hidden
              className="absolute inset-0 rounded-[10px]"
              style={{ border: `1.5px solid ${b.color}` }}
              animate={{ opacity: [0.5, 0, 0.5], scale: [1, 1.35, 1] }}
              transition={{ duration: 2.4, ease: 'easeInOut', repeat: Infinity }}
            />
          )}
        </span>

        {/* Label */}
        <span
          className="text-xs font-bold tracking-tight"
          style={{ color: isActive ? '#fff' : 'hsl(var(--foreground))' }}
        >
          {b.label}
        </span>

        {/* Active ECG underline pulse */}
        <AnimatePresence>
          {isActive && !reduce && (
            <motion.svg
              key="ecg"
              className="absolute left-0 right-0 bottom-0.5 mx-auto pointer-events-none"
              width="78" height="8" viewBox="0 0 78 8" fill="none"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: [0, 0.9, 0.55], y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.5 }}
              aria-hidden
            >
              <motion.path
                d="M2,4 L24,4 L28,1 L31,7 L34,4 L52,4 L56,1 L59,7 L62,4 L76,4"
                stroke="#ffffff"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.8))' }}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: [0, 1, 1] }}
                transition={{ duration: 2.2, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.4 }}
              />
            </motion.svg>
          )}
        </AnimatePresence>
      </div>

      {/* Click: scan beam sweep */}
      {!reduce && (
        <AnimatePresence>
          {bursts.map((r) => (
            <motion.span
              key={r.id}
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `linear-gradient(90deg, transparent, ${b.color}cc, transparent)`,
                mixBlendMode: 'screen',
              }}
              initial={{ x: '-120%', opacity: 0.9 }}
              animate={{ x: '120%', opacity: 0 }}
              transition={{ duration: 0.65, ease: 'easeOut' }}
            />
          ))}
        </AnimatePresence>
      )}

      {/* Click: radial ripple */}
      {!reduce && (
        <AnimatePresence>
          {bursts.map((r) => (
            <motion.span
              key={`r-${r.id}`}
              aria-hidden
              className="absolute pointer-events-none rounded-full"
              style={{
                left: r.x,
                top: r.y,
                width: 8,
                height: 8,
                marginLeft: -4,
                marginTop: -4,
                border: `2px solid ${b.color}`,
                background: `${b.color}33`,
              }}
              initial={{ scale: 0, opacity: 0.7 }}
              animate={{ scale: 8, opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          ))}
        </AnimatePresence>
      )}
    </motion.button>
  );
}