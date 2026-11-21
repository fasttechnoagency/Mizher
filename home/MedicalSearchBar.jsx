import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { useNavigate } from '@/lib/router-compat';
import { Search, ArrowRight, ArrowLeft } from 'lucide-react';

/**
 * MedicalSearchBar — the bespoke futuristic doctors/specialties search
 * instrument on the home hero.
 *
 * Visual only: it preserves the existing search semantics (navigate to
 * /doctors?q=<query>, suggestions dropdown, empty-query no-op, RTL/LTR).
 * The medical photograph, trust badge, and surrounding hero layout are
 * untouched — this component replaces only the white search surface.
 *
 * Motion is CSS/WAAPI on transform & opacity (no heavy dependency):
 *  - Idle: a short ECG trace draws then rests; the stethoscope and DNA
 *    motifs slowly crossfade (only one secondary motif at a time).
 *  - Focus: an accessible teal ring + soft perimeter glow + ECG settle.
 *  - Typing: decoration dims, secondary motif hides, query stays dominant.
 *  - Submit (click or Enter): a clipped teal scan sweeps to the button, an
 *    ECG pulse draws, the arrow nudges — then settles. Search runs at once.
 *
 * Decorative layers are aria-hidden, pointer-events:none, and pause when
 * off-screen or under prefers-reduced-motion.
 */
const KW_EN = ['Doctors', 'Specialties', 'Clinics', 'Dentists', 'Pediatricians', 'Cardiologists', 'Dermatologists', 'Labs'];
const KW_AR = ['أطباء', 'تخصصات', 'عيادات', 'أطباء الأسنان', 'أطباء الأطفال', 'أطباء القلب', 'أطباء الجلد', 'المختبرات'];

export default function MedicalSearchBar({ doctors = [], products = [], hospitals = [], isRTL = false }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestOpen, setSuggestOpen] = useState(false);

  const rootRef = useRef(null);
  const surfaceRef = useRef(null);
  const surfaceWRef = useRef(0);
  const scanRef = useRef(null);
  const arrowRef = useRef(null);
  const ecgPulseRef = useRef(null);

  const typingTimer = useRef(null);
  const scanningRef = useRef(false);
  const reduceMotion = useRef(false);

  const [focused, setFocused] = useState(false);
  const [kwA, setKwA] = useState(isRTL ? KW_AR[0] : KW_EN[0]);
  const [kwB, setKwB] = useState('');
  const [activeSlot, setActiveSlot] = useState(0);
  const cardRef = useRef(null);
  const glowRef = useRef(null);
  const sizerRef = useRef(null);
  const [kwW, setKwW] = useState(0);

  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  // ── Suggestions (identical semantics to the previous inline search) ──
  const suggestions = [
    ...doctors.map((d) => ({ label: isRTL ? d.name_ar : d.name_en, path: `/doctors/${d.id}`, type: 'doctor' })),
    ...doctors.map((d) => ({ label: isRTL ? d.specialty_ar : d.specialty_en, path: `/doctors?q=${isRTL ? d.specialty_ar : d.specialty_en}`, type: 'specialty' })),
    ...products.map((p) => ({ label: isRTL ? p.name_ar : p.name_en, path: `/products/${p.id}`, type: 'product' })),
    ...hospitals.map((h) => ({ label: isRTL ? h.name_ar : h.name_en, path: `/hospitals/${h.id}`, type: 'hospital' })),
  ].filter((s) => s.label);

  const seen = new Set();
  const uniqueSuggestions = suggestions.filter((s) => {
    if (seen.has(s.label)) return false;
    seen.add(s.label);
    return true;
  });

  const filtered = query.trim().length > 0
    ? uniqueSuggestions.filter((s) => s.label.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : [];

  // ── Reduced-motion preference ──
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reduceMotion.current = mq.matches;
    const onChange = () => { reduceMotion.current = mq.matches; };
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  // Track the bar's own width so the JS-driven arrow nudge stays proportional
  // to the bar (not the screen) and recalculates on resize / orientation change.
  useEffect(() => {
    const el = surfaceRef.current;
    if (!el || !('ResizeObserver' in window)) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      surfaceWRef.current = el.getBoundingClientRect().width;
    };
    const ro = new ResizeObserver(() => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    });
    ro.observe(el);
    update();
    return () => {
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // ── Pause idle motion when off-screen ──
  useEffect(() => {
    const el = rootRef.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([e]) => {
      el.dataset.paused = e.isIntersecting ? 'false' : 'true';
    }, { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // ── Typing dim (direct DOM, no per-keystroke rerender) ──
  const markTyping = useCallback(() => {
    const el = rootRef.current;
    if (!el) return;
    el.dataset.typing = 'true';
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      if (rootRef.current) rootRef.current.dataset.typing = 'false';
    }, 900);
  }, []);

  // Reset typing flag when the query is cleared.
  useEffect(() => {
    if (!query && rootRef.current) rootRef.current.dataset.typing = 'false';
  }, [query]);

  // ── Rotating keyword hint (the glowing card inside the search field) ──
  // One keyword at a time rotates inside a glowing teal pill; the word
  // "Search" stays fixed. The transition is transform+opacity only (GPU),
  // the interval is cleaned up on unmount or language change, and reduced
  // motion shows a static keyword with no rotation.
  useEffect(() => {
    const keywords = isRTL ? KW_AR : KW_EN;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setKwA(keywords[0]);
    setKwB('');
    setActiveSlot(0);
    if (reduce || keywords.length < 2) return;

    let idx = 0;
    let active = 0;
    const id = window.setInterval(() => {
      idx = (idx + 1) % keywords.length;
      const next = keywords[idx];
      if (active === 0) setKwB(next); else setKwA(next);
      active = active === 0 ? 1 : 0;
      setActiveSlot(active);
      const g = glowRef.current;
      if (g) {
        g.animate(
          [{ opacity: 0 }, { opacity: 0.7, offset: 0.5 }, { opacity: 0 }],
          { duration: 560, easing: 'ease-in-out' }
        );
      }
    }, 3000);
    return () => window.clearInterval(id);
  }, [isRTL]);

  // ── Size the keyword card to fit the current word, with a smooth width
  // transition. An invisible in-flow copy (the "sizer") holds the current
  // keyword so the card has real content width; we measure it and set an
  // explicit width on the card so the width animates between words (the
  // transform/opacity-only word roll runs on top, never clipped between
  // words). Re-measured on word change and on bar resize (the keyword font
  // is cqw-based).
  const currentKw = activeSlot === 0 ? kwA : kwB;
  useLayoutEffect(() => {
    const measure = () => {
      const sizer = sizerRef.current;
      const card = cardRef.current;
      if (!sizer || !card) return;
      const sw = sizer.offsetWidth;
      if (!sw) return;
      const cs = getComputedStyle(card);
      const pad = parseFloat(cs.paddingLeft || '0') + parseFloat(cs.paddingRight || '0');
      const bor = parseFloat(cs.borderLeftWidth || '0') + parseFloat(cs.borderRightWidth || '0');
      setKwW(Math.ceil(sw + pad + bor));
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    if (sizerRef.current) ro.observe(sizerRef.current);
    return () => ro.disconnect();
  }, [currentKw, isRTL]);

  // ── Submission scan (visual only) ──
  const triggerScan = useCallback(() => {
    const el = rootRef.current;
    if (!el) return;

    // Reduced motion: brief static perimeter illumination, no sweep.
    if (reduceMotion.current) {
      el.dataset.scanning = 'true';
      window.setTimeout(() => { if (rootRef.current) rootRef.current.dataset.scanning = 'false'; }, 320);
      return;
    }

    if (scanningRef.current) return; // never stack animation layers
    scanningRef.current = true;
    el.dataset.scanning = 'true';

    const scan = scanRef.current;
    if (scan) {
      const startX = isRTL ? '220%' : '-120%';
      const endX = isRTL ? '-120%' : '220%';
      const midX = isRTL ? '120%' : '-20%';
      const anim = scan.animate(
        [
          { transform: `translateX(${startX})`, opacity: 0 },
          { transform: `translateX(${midX})`, opacity: 1, offset: 0.2 },
          { transform: `translateX(${endX})`, opacity: 0 },
        ],
        { duration: 640, easing: 'cubic-bezier(0.45, 0, 0.25, 1)' }
      );
      anim.onfinish = () => {
        scanningRef.current = false;
        if (rootRef.current) rootRef.current.dataset.scanning = 'false';
      };
    } else {
      scanningRef.current = false;
      el.dataset.scanning = 'false';
    }

    // Compact ECG pulse in the decorative zone.
    if (ecgPulseRef.current) {
      ecgPulseRef.current.animate(
        [
          { strokeDashoffset: 100, opacity: 0.95 },
          { strokeDashoffset: 0, opacity: 0.95, offset: 0.6 },
          { strokeDashoffset: 0, opacity: 0 },
        ],
        { duration: 540, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
      );
    }

    // Directional arrow nudge (scaled to the bar width) + illumination pulse.
    if (arrowRef.current) {
      const nudge = Math.max(1.5, (surfaceWRef.current || 576) * 0.005);
      arrowRef.current.animate(
        [
          { transform: 'translateX(0)', filter: 'drop-shadow(0 0 0 transparent)' },
          { transform: `translateX(${isRTL ? -nudge : nudge}px)`, filter: 'drop-shadow(0 0 4px hsl(var(--primary)/0.7))', offset: 0.5 },
          { transform: 'translateX(0)', filter: 'drop-shadow(0 0 0 transparent)' },
        ],
        { duration: 640, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }
      );
    }
  }, [isRTL]);

  // Search runs immediately; the scan is pure visual acknowledgment.
  const runSearch = useCallback(() => {
    if (!query.trim()) return; // preserve empty-query no-op behavior
    triggerScan();
    navigate(`/doctors?q=${query}`);
  }, [query, navigate, triggerScan]);

  const onKeyDown = (e) => {
    if (e.key === 'Enter') runSearch();
  };

  const typeLabel = {
    doctor: isRTL ? 'طبيب' : 'Doctor',
    specialty: isRTL ? 'تخصص' : 'Specialty',
    product: isRTL ? 'منتج' : 'Product',
    hospital: isRTL ? 'مستشفى' : 'Hospital',
  };

  // Shared ECG path (clean trace: baseline, P-bump, R-spike, S-trough, return).
  const ECG_D = 'M2 20 H 20 l 4 -2 l 5 -14 l 6 24 l 5 -10 l 4 2 H 94';

  return (
    <div
      ref={rootRef}
      className="msb"
      data-focused="false"
      data-typing="false"
      data-scanning="false"
      data-paused="false"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div ref={surfaceRef} className="msb__surface">
        {/* Perimeter focus glow (static layer, animated opacity) */}
        <div className="msb__glow" aria-hidden="true" />

        {/* Submission scan highlight (clipped by surface overflow) */}
        <div ref={scanRef} className="msb__scan" aria-hidden="true" />

        {/* Search icon */}
        <span className="msb__icon-slot" aria-hidden="true">
          <Search className="msb__icon" />
        </span>

        {/* Typing area — opaque white, query stays dominant.
            Wrapped in a relative field so the rotating-keyword hint can overlay
            it without affecting the input's layout (the hint is pointer-events:
            none and never intercepts typing). */}
        <div className="msb__field">
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSuggestOpen(true); markTyping(); }}
            onFocus={() => { setFocused(true); setSuggestOpen(true); if (rootRef.current) rootRef.current.dataset.focused = 'true'; }}
            onBlur={() => { setFocused(false); window.setTimeout(() => setSuggestOpen(false), 150); if (rootRef.current) rootRef.current.dataset.focused = 'false'; }}
            onKeyDown={onKeyDown}
            type="text"
            aria-label={isRTL ? 'ابحث عن طبيب أو تخصص' : 'Search doctors, specialties'}
            className="msb__input"
          />

          {/* Rotating-keyword hint (replaces the static placeholder). The word
              "Search" stays fixed; one keyword at a time rotates inside a
              glowing teal card. Fades out on focus/typing, returns when the
              input is cleared and unfocused. */}
          <div className={`msb__hint ${(!query && !focused) ? '' : 'msb__hint--hidden'}`} aria-hidden="true">
            <span className="msb__hint-static">{isRTL ? 'ابحث' : 'Search'}</span>
            <span ref={cardRef} className="msb__kw-card" style={kwW ? { width: `${kwW}px` } : undefined}>
              <span ref={glowRef} className="msb__kw-card-glow" />
              <span ref={sizerRef} className="msb__kw-sizer" aria-hidden="true">{currentKw}</span>
              <span className="msb__kw">
                <span className={`msb__kw-item ${activeSlot === 0 ? 'msb__kw-item--in' : 'msb__kw-item--out'}`}>{kwA}</span>
                <span className={`msb__kw-item ${activeSlot === 1 ? 'msb__kw-item--in' : 'msb__kw-item--out'}`}>{kwB}</span>
              </span>
            </span>
          </div>
        </div>

        {/* Decorative medical motif zone — separate layout region, never behind text */}
        <div className="msb__motifs" aria-hidden="true">
          <svg className="msb__ecg" viewBox="0 0 96 40" fill="none">
            <path className="msb__ecg-halo" d={ECG_D} />
            <path className="msb__ecg-core" d={ECG_D} pathLength={100} />
            <path ref={ecgPulseRef} className="msb__ecg-pulse" d={ECG_D} pathLength={100} />
          </svg>
          <svg className="msb__motif msb__motif--stetho" viewBox="0 0 48 40" fill="none">
            <path d="M15 4 V 11 C 15 19, 24 19, 24 25 M33 4 V 11 C 33 19, 24 19, 24 25 M24 25 V 30" />
            <circle cx="24" cy="34" r="5" />
          </svg>
          <svg className="msb__motif msb__motif--dna" viewBox="0 0 48 40" fill="none">
            <path d="M16 4 C 32 12, 16 28, 32 36" />
            <path d="M32 4 C 16 12, 32 28, 16 36" />
            <path d="M20 10 H 28" />
            <path d="M28 30 H 20" />
          </svg>
        </div>

        {/* Inset Search button */}
        <div className="msb__btn-slot">
          <button type="button" onClick={runSearch} className="msb__btn">
            <span>{isRTL ? 'بحث' : 'Search'}</span>
            <Arrow ref={arrowRef} className="msb__arrow" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Suggestions dropdown — unchanged behavior */}
      {suggestOpen && filtered.length > 0 && (
        <ul className="msb__suggest">
          {filtered.map((s, i) => (
            <li
              key={i}
              onMouseDown={() => { setQuery(s.label); setSuggestOpen(false); navigate(s.path); }}
              className="msb__suggest-item"
            >
              <Search className="msb__suggest-icon" />
              <span className="msb__suggest-label">{s.label}</span>
              <span className="msb__suggest-type">{typeLabel[s.type]}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}