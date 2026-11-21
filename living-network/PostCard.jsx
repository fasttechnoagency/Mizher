import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Play } from 'lucide-react';
import OutlineTrace from './OutlineTrace';
import CursorSpotlight from './CursorSpotlight';
import TiltCard from './TiltCard';
import { useAmbientActive } from './useAlive';

const EASE = [0.22, 1, 0.36, 1];

/**
 * <PostCard /> — wraps a social post card with the "Live Medical Imaging
 * Strip" motion only; design, content, sizes and link are identical to the
 * original.
 *  - Entry (once, when the row plays): fade in + 24px travel from the row's
 *    start side (90ms stagger, 600ms); a teal light traces the image outline.
 *  - Ambient (always on): a faint vertical scan sweeps each image (staggered
 *    so they never sweep together) and a faint edge light travels the image
 *    perimeter.
 *  - Reactive: a radial spotlight follows the cursor, a 3D tilt (≤4°), and a
 *    stronger outline trace on hover. No image distortion or cropping.
 * Reduced motion: final state, no loops.
 */
export default function PostCard({ post, i, profileUrl, isRTL, play, enableTrace, reduce }) {
  const imgRef = useRef(null);
  const [hover, setHover] = useState(false);
  const [everHover, setEverHover] = useState(false);
  const [ambRef, ambientActive] = useAmbientActive(0);

  const startOffset = isRTL ? 24 : -24;
  const hidden = { opacity: 0, x: startOffset };
  const shown = { opacity: 1, x: 0 };

  return (
    <motion.a
      ref={ambRef}
      href={post.url || profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={play ? shown : hidden}
      animate={play ? shown : hidden}
      transition={play ? { duration: 0.6, delay: i * 0.09, ease: EASE } : { duration: 0 }}
      onMouseEnter={() => { setHover(true); setEverHover(true); }}
      onMouseLeave={() => setHover(false)}
      className="flex-shrink-0 w-52 md:w-60 rounded-2xl overflow-hidden border border-teal-100 bg-card shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
    >
      <TiltCard reduce={reduce} className="w-full">
        <div ref={imgRef} className="relative aspect-square bg-gray-100">
          {post.image_url ? (
            <img src={post.image_url} alt={post.caption || ''} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-50 to-teal-100">
              <ExternalLink className="w-8 h-8 text-teal-300" />
            </div>
          )}
          {post.is_video && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center">
                <Play className="w-5 h-5 text-teal-700 fill-teal-700 ml-0.5" />
              </div>
            </div>
          )}

          <CursorSpotlight reduce={reduce} color="hsl(var(--primary))" size={220} opacity={0.14} />

          {ambientActive && !reduce && (
            <motion.div
              aria-hidden
              className="absolute inset-x-0 pointer-events-none"
              style={{ height: '60%', background: 'linear-gradient(180deg, transparent, hsl(var(--primary) / 0.10), transparent)' }}
              animate={{ y: ['-90%', '160%'] }}
              transition={{ duration: 6 + (i % 3) * 1.2, repeat: Infinity, ease: 'linear', repeatDelay: (i % 2) * 1.5 }}
            />
          )}

          {enableTrace && (
            <OutlineTrace targetRef={imgRef} active mode="once" drawDur={700} fadeDur={400} weight={1.5} inset={0} radiusOverride={16} reduce={reduce} />
          )}
          <OutlineTrace targetRef={imgRef} active={ambientActive} mode="ambient" weight={1} inset={0} radiusOverride={16} reduce={reduce} />
          {everHover && !reduce && (
            <OutlineTrace targetRef={imgRef} active={hover} mode="hover" drawDur={500} fadeDur={250} weight={1.2} inset={0} radiusOverride={16} color="hsl(var(--primary))" reduce={reduce} />
          )}
        </div>
        {post.caption && (
          <div className="p-3">
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{post.caption}</p>
          </div>
        )}
      </TiltCard>
    </motion.a>
  );
}