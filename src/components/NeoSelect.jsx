import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { playClickSound, playPopSound } from '../utils/audio';

// Neo-brutalist custom dropdown (accessible listbox replacing native <select>).
// Keyboard: Enter/Space/ArrowDown opens, arrows navigate, Enter selects, Escape/Tab closes.
export default function NeoSelect({ value, onChange, options, placeholder = 'Select an option', name }) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const rootRef = useRef(null);
  const listRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value) || null;

  const close = () => setOpen(false);

  // Close when clicking anywhere outside
  useEffect(() => {
    if (!open) return undefined;
    const handleClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) close();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Keep the highlighted option visible while arrow-navigating
  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.children[highlighted];
    if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
  }, [open, highlighted]);

  const commit = (option) => {
    playPopSound(650);
    if (onChange) onChange(option.value);
    close();
  };

  const handleKeyDown = (e) => {
    if (!open) {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
        e.preventDefault();
        playClickSound(700);
        setHighlighted(Math.max(0, options.findIndex((opt) => opt.value === value)));
        setOpen(true);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((h) => Math.min(options.length - 1, h + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((h) => Math.max(0, h - 1));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (options[highlighted]) commit(options[highlighted]);
    } else if (e.key === 'Tab') {
      close();
    }
  };

  return (
    <div ref={rootRef} className="relative">
      {/* Hidden native select keeps the value available to form autofill/devtools and is a11y-safe */}
      {name && <input type="hidden" name={name} value={value} readOnly />}

      <button
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          playClickSound(700);
          setOpen((o) => !o);
        }}
        onKeyDown={handleKeyDown}
        className={`w-full px-3.5 py-2.5 bg-[#faf7f2] border-2 border-[#121316] text-[#121316] font-bold text-base sm:text-sm text-left flex items-center justify-between gap-2 cursor-pointer focus:outline-none focus:bg-white focus:shadow-[2px_2px_0px_#121316] transition-all ${
          open ? 'bg-white shadow-[2px_2px_0px_#121316]' : ''
        }`}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : value || placeholder}</span>
        <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 bg-white border-2 border-[#121316] shadow-[4px_4px_0px_#121316] max-h-56 overflow-y-auto no-scrollbar animate-fadeIn"
        >
          {options.map((option, i) => {
            const isSelected = option.value === value;
            return (
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setHighlighted(i)}
                onClick={() => commit(option)}
                className={`px-3.5 py-2.5 cursor-pointer border-b-2 border-[#121316]/10 last:border-b-0 flex items-center justify-between gap-2 transition-colors ${
                  i === highlighted ? 'bg-neo-yellow' : 'bg-white'
                }`}
              >
                <div className="min-w-0">
                  <div className="text-sm font-black text-[#121316] truncate">{option.label}</div>
                  {option.hint && (
                    <div className="text-[11px] font-semibold text-neutral-500 truncate">{option.hint}</div>
                  )}
                </div>
                {isSelected && <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}