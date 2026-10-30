import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { isAudioMuted, toggleAudioMute, subscribeToMute, playClickSound } from '../utils/audio';

export default function SoundToggle({ className = "" }) {
  const [muted, setMuted] = useState(() => isAudioMuted());

  useEffect(() => {
    const unsub = subscribeToMute((m) => setMuted(m));
    return unsub;
  }, []);

  const handleClick = () => {
    toggleAudioMute();
    playClickSound(700);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title={muted ? "Unmute sound effects" : "Mute sound effects"}
      aria-label={muted ? "Unmute sound effects" : "Mute sound effects"}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-black neo-btn transition-colors cursor-pointer select-none ${
        muted ? 'bg-[#faf7f2] text-neutral-600 hover:bg-white' : 'bg-neo-yellow text-black hover:bg-neo-pink hover:text-white'
      } ${className}`}
    >
      {muted ? (
        <>
          <VolumeX className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="text-[10px] sm:text-xs">SFX: OFF</span>
        </>
      ) : (
        <>
          <Volume2 className="w-3.5 h-3.5 flex-shrink-0 text-black" />
          <span className="text-[10px] sm:text-xs">SFX: ON</span>
          <span className="flex items-end gap-0.5 h-2.5 ml-0.5">
            <span className="w-0.5 bg-black h-2.5 animate-pulse"></span>
            <span className="w-0.5 bg-black h-1.5 animate-pulse" style={{ animationDelay: '0.15s' }}></span>
            <span className="w-0.5 bg-black h-2 animate-pulse" style={{ animationDelay: '0.3s' }}></span>
          </span>
        </>
      )}
    </button>
  );
}
