import React, { useState, useEffect, useRef } from 'react';
import { 
  Sticker, 
  Trash2, 
  Plus, 
  X, 
  Zap, 
  Coffee, 
  Server, 
  Code, 
  Rocket, 
  ShieldCheck, 
  Bug, 
  Sparkles, 
  Lightbulb 
} from 'lucide-react';
import { playPopSound, playZapSound } from '../utils/audio';

const STICKER_PALETTES = [
  { id: 'speed', label: 'PageSpeed 100', icon: <Zap className="w-3.5 h-3.5 flex-shrink-0" />, bg: 'bg-neo-lime', text: 'text-black' },
  { id: 'coffee', label: 'Fueled by Coffee', icon: <Coffee className="w-3.5 h-3.5 flex-shrink-0" />, bg: 'bg-neo-yellow', text: 'text-black' },
  { id: 'php', label: 'Modern PHP 8.x', icon: <Server className="w-3.5 h-3.5 flex-shrink-0" />, bg: 'bg-neo-pink', text: 'text-white' },
  { id: 'react', label: 'React 19 Core', icon: <Code className="w-3.5 h-3.5 flex-shrink-0" />, bg: 'bg-neo-cyan', text: 'text-black' },
  { id: 'ship', label: 'Shipped & Live', icon: <Rocket className="w-3.5 h-3.5 flex-shrink-0" />, bg: 'bg-neo-orange', text: 'text-black' },
  { id: 'bloat', label: 'Zero Bloat Clean', icon: <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />, bg: 'bg-neo-purple', text: 'text-black' },
  { id: 'bugfree', label: '0 Bugs Found', icon: <Bug className="w-3.5 h-3.5 flex-shrink-0" />, bg: 'bg-emerald-400', text: 'text-black' },
  { id: 'aesthetic', label: 'Neo-Brutalist', icon: <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />, bg: 'bg-fuchsia-400', text: 'text-black' }
];

function createSticker(item, count) {
  const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1000;
  const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
  const rndX = (Math.random() - 0.5) * 300;
  const rndY = (Math.random() - 0.5) * 200;
  const rndRot = Math.round((Math.random() - 0.5) * 24);

  return {
    id: count,
    label: item.label,
    icon: item.icon,
    bg: item.bg,
    text: item.text,
    x: Math.min(windowWidth - 180, Math.max(20, windowWidth / 2 + rndX)),
    y: Math.min(windowHeight - 100, Math.max(100, windowHeight / 2 + rndY)),
    rotate: rndRot
  };
}

export default function StickerCanvas({ isOpen, onClose }) {
  const [stickers, setStickers] = useState([]);
  const [activeDraggingId, setActiveDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const counterRef = useRef(0);

  // Add a new sticker onto the screen
  const handleAddSticker = (item) => {
    playPopSound(550);
    counterRef.current += 1;
    const newSticker = createSticker(item, counterRef.current);
    setStickers(prev => [...prev, newSticker]);
  };

  const handleClearStickers = () => {
    playZapSound();
    setStickers([]);
  };

  const handleMouseDown = (e, id) => {
    e.preventDefault();
    setActiveDraggingId(id);
    const sticker = stickers.find(s => s.id === id);
    if (sticker) {
      setDragOffset({
        x: e.clientX - sticker.x,
        y: e.clientY - sticker.y
      });
    }
  };

  const handleTouchStart = (e, id) => {
    const touch = e.touches[0];
    setActiveDraggingId(id);
    const sticker = stickers.find(s => s.id === id);
    if (sticker && touch) {
      setDragOffset({
        x: touch.clientX - sticker.x,
        y: touch.clientY - sticker.y
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (activeDraggingId !== null) {
        setStickers(prev => prev.map(s => {
          if (s.id === activeDraggingId) {
            return {
              ...s,
              x: e.clientX - dragOffset.x,
              y: e.clientY - dragOffset.y
            };
          }
          return s;
        }));
      }
    };

    const handleTouchMove = (e) => {
      if (activeDraggingId !== null && e.touches[0]) {
        const touch = e.touches[0];
        setStickers(prev => prev.map(s => {
          if (s.id === activeDraggingId) {
            return {
              ...s,
              x: touch.clientX - dragOffset.x,
              y: touch.clientY - dragOffset.y
            };
          }
          return s;
        }));
      }
    };

    const handleMouseUp = () => {
      setActiveDraggingId(null);
    };

    if (activeDraggingId !== null) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [activeDraggingId, dragOffset]);

  const handleRemoveSticker = (id) => {
    playZapSound();
    setStickers(prev => prev.filter(s => s.id !== id));
  };

  return (
    <>
      {/* Placed Stickers on the Screen */}
      <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
        {stickers.map((s) => (
          <div
            key={s.id}
            onMouseDown={(e) => handleMouseDown(e, s.id)}
            onTouchStart={(e) => handleTouchStart(e, s.id)}
            onDoubleClick={() => handleRemoveSticker(s.id)}
            style={{
              transform: `translate(${s.x}px, ${s.y}px) rotate(${s.rotate}deg)`,
              touchAction: 'none'
            }}
            className={`absolute pointer-events-auto cursor-grab active:cursor-grabbing select-none px-3.5 py-2 font-black text-xs sm:text-sm neo-badge border-[3px] border-black shadow-[4px_4px_0px_#000] hover:scale-105 transition-transform ${s.bg} ${s.text} flex items-center gap-1.5 group`}
            title="Drag anywhere or double click to remove"
          >
            {s.icon}
            <span>{s.label}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveSticker(s.id);
              }}
              className="opacity-0 group-hover:opacity-100 bg-black text-white p-0.5 rounded-full hover:bg-rose-500 transition-opacity ml-1"
              title="Remove sticker"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Floating Sticker Drawer Bar */}
      {isOpen && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white neo-box p-3 sm:p-4 shadow-[6px_6px_0px_#121316] animate-slideUp max-w-[95vw] sm:max-w-2xl border-[3px] border-[#121316]">
          
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b-2 border-[#121316]">
            <div className="flex items-center gap-1.5 font-black text-xs uppercase text-[#121316]">
              <Sticker className="w-4 h-4 text-neo-pink" />
              <span>Developer Sticker Pack</span>
              <span className="text-[10px] font-bold text-neutral-600 font-mono">({stickers.length} placed)</span>
            </div>

            <div className="flex items-center gap-2">
              {stickers.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearStickers}
                  className="px-2 py-1 bg-rose-500/20 text-rose-500 text-[10px] font-extrabold border border-rose-500/40 hover:bg-rose-500 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear All</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-1 bg-black text-white hover:bg-rose-500 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {STICKER_PALETTES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleAddSticker(item)}
                className={`px-2.5 py-1 text-xs font-black neo-box-sm flex items-center gap-1.5 hover:-translate-y-0.5 active:translate-y-0.5 transition-transform cursor-pointer select-none ${item.bg} ${item.text}`}
              >
                <Plus className="w-3 h-3 stroke-[3]" />
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <p className="text-[10px] text-neutral-600 font-medium text-center mt-2 flex items-center justify-center gap-1">
            <Lightbulb className="w-3 h-3 text-amber-500 flex-shrink-0" />
            <span>Click to drop stickers, then drag them anywhere across the website!</span>
          </p>
        </div>
      )}
    </>
  );
}
