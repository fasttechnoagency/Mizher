import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { usePrefReducedMotion } from './useInViewOnce';

/**
 * <ECGWave /> — a decorative, abstract ECG-inspired line motif that scrolls
 * horizontally forever like a live monitor trace, with edge fades and a soft
 * cyan-green glow. Purely ornamental (aria-hidden, pointer-events:none) — NOT
 * a real patient reading. Reduced motion renders the line statically.
 */
const VB_W = 320, H = 48, MID = 24;
const BEAT_W = 80;          // one heartbeat pattern width — seamless loop distance
const TOTAL_W = VB_W + BEAT_W * 2;
const STEPS = 240;
const LINE = 'rgba(135,199,207,0.85)'; // muted light cyan-green
const GLOW = 'rgba(135,199,207,0.55)';

// A single heartbeat segment (relative coords, 0..BEAT_W)
const SEG = [
  [0, 0], [14, 0], [17, -2], [19, 6], [21, -12], [23, 14], [25, 0],
  [40, 0], [44, 0], [47, -3], [49, 7], [51, 0], [BEAT_W, 0],
];

export default function ECGWave({ className = '' }) {
  const reduce = usePrefReducedMotion();

  const path = useMemo(() => {
    const pts = [];
    for (let b = 0; b * BEAT_W <= TOTAL_W; b++) {
      for (const [dx, dy] of SEG) {
        const x = b * BEAT_W + dx;
        const y = MID + dy;
        pts.push(`${pts.length === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`);
      }
    }
    return pts.join(' ');
  }, []);

  return (
    <svg
      className={className}
      viewBox={`0 0 ${VB_W} ${H}`}
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <linearGradient id="ecg-fade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="14%" stopColor="white" stopOpacity="1" />
          <stop offset="86%" stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <mask id="ecg-mask"><rect x="0" y="0" width={VB_W} height={H} fill="url(#ecg-fade)" /></mask>
      </defs>

      <g mask="url(#ecg-mask)">
        <motion.g
          initial={false}
          animate={reduce ? {} : { x: [0, -BEAT_W] }}
          transition={reduce ? { duration: 0 } : { duration: 2.4, ease: 'linear', repeat: Infinity }}
        >
          <path
            d={path}
            stroke={LINE}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: `drop-shadow(0 0 6px ${GLOW})` }}
          />
          <motion.circle
            r="3"
            fill={LINE}
            style={{ filter: `drop-shadow(0 0 8px ${LINE})` }}
            initial={{ cx: VB_W, cy: MID, opacity: 0 }}
            animate={reduce ? {} : { cx: [VB_W, VB_W - BEAT_W], opacity: [0, 1, 1, 0] }}
            transition={reduce ? { duration: 0 } : { duration: 2.4, ease: 'linear', repeat: Infinity }}
          />
        </motion.g>
      </g>
    </svg>
  );
}