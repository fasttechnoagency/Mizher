import React from 'react';
import { motion } from 'framer-motion';
import { usePrefReducedMotion } from '@/components/living-network/useInViewOnce';

/**
 * <HeroMedicalBackdrop /> — the homepage flagship cinematic layer.
 *
 * Replaces the old flat photo+teal-overlay with a layered medical-intelligence
 * environment: deep navy atmospheric base (the real hero photo still shows as
 * faint texture beneath), slow radial cyan/turquoise glows, fine flowing
 * cyan light paths that draw themselves in on mount, a single restrained
 * entrance scan beam, and a bottom fade that hands off cleanly into the
 * services section below. Purely decorative: pointer-events:none, aria-hidden.
 * No RAF loop (SVG + CSS/Motion only), reduced-motion renders a static frame.
 */

const GLOWS = [
  { style: { top: '-12%', left: '8%', width: '46%', height: '50%' }, color: 'rgba(0,212,255,0.16)', dur: 7 },
  { style: { top: '10%', right: '4%', width: '42%', height: '46%' }, color: 'rgba(20,184,166,0.14)', dur: 8.5 },
  { style: { bottom: '-10%', left: '30%', width: '50%', height: '44%' }, color: 'rgba(16,162,162,0.12)', dur: 9.5 },
];

export default function HeroMedicalBackdrop() {
  const reduce = usePrefReducedMotion();

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Deep dark teal-blue tint over the photo for legibility (matches reference) */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(180deg, rgba(14,42,42,0.82) 0%, rgba(14,42,42,0.72) 50%, rgba(14,42,42,0.86) 100%)' }}
      />

      {/* Atmospheric radial glows (slow ambient pulse) */}
      {GLOWS.map((g, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            ...g.style,
            background: `radial-gradient(circle, ${g.color}, transparent 70%)`,
            filter: 'blur(8px)',
          }}
          animate={reduce ? {} : { opacity: [0.45, 0.85, 0.45] }}
          transition={{ duration: g.dur, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* One-time restrained entrance scan beam */}
      {!reduce && (
        <motion.div
          className="absolute inset-x-0 h-px"
          style={{
            top: 0,
            background:
              'linear-gradient(90deg, transparent, rgba(0,212,255,0.55), rgba(0,212,255,0.75), rgba(0,212,255,0.55), transparent)',
            boxShadow: '0 0 12px 2px rgba(0,212,255,0.35)',
          }}
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: ['0vh', '40vh'], opacity: [0, 0.9, 0] }}
          transition={{ duration: 1.6, delay: 0.3, ease: 'easeOut' }}
        />
      )}

      {/* Bottom handoff into the services section */}
      <div
        className="absolute bottom-0 inset-x-0 h-24"
        style={{ background: 'linear-gradient(180deg, transparent, hsl(var(--background)))' }}
      />
    </div>
  );
}