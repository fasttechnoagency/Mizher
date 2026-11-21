import React, { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * A search input that shows filtered suggestions as the user types.
 * Props:
 *  - value, onChange(val): controlled input
 *  - suggestions: string[]  — the full list to filter from
 *  - onSelect(val): called when user clicks or keyboard-selects a suggestion
 *  - placeholder, className, inputClassName
 *  - isRTL
 */
export default function SearchWithSuggestions({
  value,
  onChange,
  suggestions = [],
  onSelect,
  placeholder = 'Search...',
  className = '',
  inputClassName = '',
  isRTL = false,
  onKeyDown,
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const wrapperRef = useRef(null);

  const filtered = value.trim().length > 0
    ? suggestions.filter(s => s.toLowerCase().includes(value.toLowerCase())).slice(0, 7)
    : [];

  useEffect(() => {
    setActive(-1);
  }, [value]);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleKeyDown = (e) => {
    if (filtered.length > 0 && open) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive(i => Math.min(i + 1, filtered.length - 1)); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); setActive(i => Math.max(i - 1, -1)); return; }
      if (e.key === 'Enter' && active >= 0) { e.preventDefault(); handleSelect(filtered[active]); return; }
      if (e.key === 'Escape') { setOpen(false); return; }
    }
    onKeyDown && onKeyDown(e);
  };

  const handleSelect = (val) => {
    onChange(val);
    setOpen(false);
    onSelect && onSelect(val);
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <Search className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'} w-4 h-4 text-muted-foreground pointer-events-none`} />
      <input
        type="text"
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={inputClassName}
        autoComplete="off"
      />
      <AnimatePresence>
        {open && filtered.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-1 left-0 right-0 bg-white border border-teal-100 rounded-xl shadow-xl z-50 overflow-hidden"
          >
            {filtered.map((s, i) => (
              <li
                key={i}
                onMouseDown={() => handleSelect(s)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm cursor-pointer transition-colors ${i === active ? 'bg-teal-50 text-teal-700' : 'text-foreground hover:bg-teal-50 hover:text-teal-700'}`}
              >
                <Search className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                {s}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}