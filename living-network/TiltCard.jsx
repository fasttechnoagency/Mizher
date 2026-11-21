import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1];

/**
 * <TiltCard /> — wraps children with a subtle 3D tilt (max degrees) that
 * follows the cursor. No tilt under reduced motion or on touch (no move).
 * The inner motion.div only animates rotateX/rotateY (transform).
 */
export default function TiltCard({ children, max = 4, className, style, reduce }) {
  const ref = useRef(null);
  const [t, setT] = useState({ rx: 0, ry: 0 });

  const onMove = (e) => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setT({ rx: -py * max, ry: px * max });
  };
  const onLeave = () => setT({ rx: 0, ry: 0 });

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
      style={{ ...style, perspective: 900 }}
    >
      <motion.div
        animate={{ rotateX: t.rx, rotateY: t.ry }}
        transition={{ duration: 0.25, ease: EASE }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {children}
      </motion.div>
    </div>
  );
}