import React from 'react';
import { usePrefReducedMotion } from '@/components/living-network/useInViewOnce';

/**
 * <LivingHeroLogo /> — the cosmic animation for the LARGE circular logo and
 * the adjacent "Mizher Medical Hub" wordmark on the login/landing hero.
 * Preserves the exact logo asset (same src, w-32/md:w-44, rounded-full,
 * opacity-80) and the exact h1 typography/structure. Only adds decorative,
 * non-interactive layers:
 *   - a soft cyan/turquoise energy glow pulsing around the circle,
 *   - a luminous highlight traveling around the perimeter,
 *   - a delicate tilted orbital arc with a slow traveling dot,
 *   - a restrained light sweep across the illustration (clipped to circle),
 *   - a coordinated glow on the wordmark + a traveling cyan sheen on "Mizher".
 * Renders a fragment so the wrapper + h1 stay direct flex children of the
 * existing motion.div (preserving gap, layout, entrance animation).
 * All decorative layers are pointer-events:none. Reduced motion → static.
 */
const HERO_LOGO_SRC =
  '/__l5e/assets-v1/75d0d643-55ff-4038-a12b-f88ab08137d4/a8208842a_ChatGPT_Image_Jun_10__2026__10_15_00_AM.png';

// circle perimeter (r=48) and orbital ellipse (rx=44 ry=40) in a 100x100 box
const PERIMETER_PATH = 'M 50,2 A 48,48 0 1,1 50,98 A 48,48 0 1,1 50,2';
const ORBIT_PATH = 'M 6,50 A 44,40 0 1,1 94,50 A 44,40 0 1,1 6,50';

export default function LivingHeroLogo({ isRTL }) {
  const reduce = usePrefReducedMotion();

  return (
    <>
      {/* ── Circular medical logo: energy core ── */}
      <span className="hero-logo relative inline-flex items-center justify-center w-32 h-32 md:w-44 md:h-44 rounded-full flex-shrink-0">
        <img
          src={HERO_LOGO_SRC}
          alt="Mizher Clinic Logo"
          className="w-full h-full object-contain rounded-full opacity-80"
        />
        {!reduce && (
          <>
            {/* perimeter highlight + tilted orbital arc */}
            <svg className="hero-logo__fx" viewBox="0 0 100 100" aria-hidden="true">
              <circle cx="50" cy="50" r="48" fill="none"
                stroke="rgba(0,212,255,0.18)" strokeWidth="0.4" />
              <circle r="1.6" fill="rgba(0,212,255,1)"
                style={{ filter: 'drop-shadow(0 0 4px rgba(0,212,255,0.9))' }}>
                <animateMotion dur="6s" repeatCount="indefinite" path={PERIMETER_PATH} />
              </circle>
              <g transform="rotate(24 50 50)">
                <ellipse cx="50" cy="50" rx="44" ry="40" fill="none"
                  stroke="rgba(16,162,162,0.18)" strokeWidth="0.4" />
                <circle r="1.2" fill="rgba(16,162,162,0.95)"
                  style={{ filter: 'drop-shadow(0 0 3px rgba(16,162,162,0.85))' }}>
                  <animateMotion dur="11s" begin="3s" repeatCount="indefinite" path={ORBIT_PATH} />
                </circle>
              </g>
            </svg>
          </>
        )}
      </span>

      {/* ── Wordmark: exact original typography preserved ── */}
      <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight tracking-tight text-center">
        {isRTL ? (
          <>
            <span className="hero-word--lead relative block text-teal-300 text-4xl md:text-6xl">مجتمع</span>
            <span className="hero-word--second block text-white text-2xl md:text-4xl">مزهر الطبي</span>
            <span className="block text-white/70 text-xl md:text-3xl font-semibold mt-1">
              رعاية صحية ذكية
            </span>
          </>
        ) : (
          <>
            <span className="hero-word--lead relative block text-teal-300 text-4xl md:text-6xl">Mizher</span>
            <span className="hero-word--second block text-white text-2xl md:text-4xl">Medical Hub</span>
          </>
        )}
      </h1>
    </>
  );
}