import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { usePrefReducedMotion } from '@/components/living-network/useInViewOnce';

/**
 * <DNAHelix /> — a horizontal double-helix divider that continuously rotates
 * around its horizontal axis. Two interlacing sine strands scroll seamlessly
 * (infinite loop) while their opacities oscillate to convey front/back depth;
 * base-pair rungs pulse along with the rotation. Soft cyan / seafoam palette
 * over a pale surface. Decorative (aria-hidden, pointer-events:none).
 * Reduced motion renders a static frame.
 */
const VB_W = 320, H = 44, AMP = 13;
const PERIOD = 160;          // one full helix turn (px) — the seamless loop distance
const TOTAL_W = VB_W + PERIOD * 2; // extra cycles so the scroll never reveals a gap
const STEPS = 96;
const RUNG_EVERY = 6;

const STRAND_A = '#7ac7ce'; // soft cyan
const STRAND_B = '#45a29e'; // muted seafoam
const RUNG = '#b0d9dc';     // pale grey-blue

export default function DNAHelix({ className = '' }) {
  const reduce = usePrefReducedMotion();

  const { a, b, rungs } = useMemo(() => {
    const ax = [], bx = [], rg = [];
    for (let i = 0; i <= STEPS; i++) {
      const x = (i / STEPS) * TOTAL_W;
      const phase = (i / STEPS) * Math.PI * 4; // 4 turns over TOTAL_W
      const y1 = H / 2 + Math.sin(phase) * AMP;
      const y2 = H / 2 - Math.sin(phase) * AMP;
      ax.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y1.toFixed(1)}`);
      bx.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y2.toFixed(1)}`);
      if (i % RUNG_EVERY === 0 && i !== 0 && i !== STEPS) rg.push({ x, y1, y2, key: i });
    }
    return { a: ax.join(' '), b: bx.join(' '), rungs: rg };
  }, []);

  return (
    <div className={`dna-helix flex justify-center ${className}`} aria-hidden="true">
      <svg viewBox={`0 0 ${VB_W} ${H}`} width="100%" height={H} fill="none"
        preserveAspectRatio="xMidYMid meet" style={{ maxWidth: 320, overflow: 'visible' }}>
        <defs>
          <linearGradient id="dna-fade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="12%" stopColor="white" stopOpacity="1" />
            <stop offset="88%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <mask id="dna-mask"><rect x="0" y="0" width={VB_W} height={H} fill="url(#dna-fade)" /></mask>
        </defs>

        <g mask="url(#dna-mask)">
          <motion.g
            initial={false}
            animate={reduce ? {} : { x: [0, -PERIOD] }}
            transition={reduce ? { duration: 0 } : { duration: 4.2, ease: 'linear', repeat: Infinity }}
          >
            {/* base-pair rungs */}
            {rungs.map((r) => (
              <line
                key={r.key}
                x1={r.x} y1={r.y1} x2={r.x} y2={r.y2}
                stroke={RUNG}
                strokeWidth="1"
                strokeLinecap="round"
                opacity="0.75"
              />
            ))}
            {/* strand A (front) */}
            <motion.path
              d={a}
              stroke={STRAND_A}
              strokeWidth="1.6"
              strokeLinecap="round"
              style={{ filter: 'drop-shadow(0 0 4px rgba(122,199,206,0.55))' }}
              animate={reduce ? {} : { opacity: [0.95, 0.45, 0.95] }}
              transition={reduce ? { duration: 0 } : { duration: 4.2, ease: 'easeInOut', repeat: Infinity }}
            />
            {/* strand B (back) */}
            <motion.path
              d={b}
              stroke={STRAND_B}
              strokeWidth="1.6"
              strokeLinecap="round"
              style={{ filter: 'drop-shadow(0 0 4px rgba(69,162,158,0.45))' }}
              animate={reduce ? {} : { opacity: [0.45, 0.95, 0.45] }}
              transition={reduce ? { duration: 0 } : { duration: 4.2, ease: 'easeInOut', repeat: Infinity }}
            />
          </motion.g>
        </g>
      </svg>
    </div>
  );
}