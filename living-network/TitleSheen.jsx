import React from 'react';
import { motion } from 'framer-motion';
import { useAmbientActive } from './useAlive';

/**
 * <TitleSheen /> — a thin underline accent beneath a section title with a
 * slow, faint light sheen moving across it (never across the letters).
 * Static under reduced motion / off-screen / hidden tab.
 */
export default function TitleSheen({ reduce, width = 132, className = '', align = 'center' }) {
  const [ref, active] = useAmbientActive(0);
  return (
    <div
      ref={ref}
      className={className}
      aria-hidden="true"
      style={{
        position: 'relative',
        height: 2,
        width,
        margin: align === 'start' ? '10px 0 0' : '10px auto 0',
        overflow: 'hidden',
        borderRadius: 9999,
        background: 'hsl(var(--primary) / 0.16)',
      }}
    >
      {active && !reduce && (
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: 56,
            background: 'linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)',
            filter: 'drop-shadow(0 0 4px hsl(var(--primary)))',
          }}
          animate={{ x: [-70, width + 14] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.4 }}
        />
      )}
    </div>
  );
}