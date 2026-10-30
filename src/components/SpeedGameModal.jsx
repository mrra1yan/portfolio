import React, { useState, useEffect, useRef } from 'react';
import { 
  Gamepad2, 
  X, 
  Trophy, 
  RefreshCw, 
  Flame, 
  Copy, 
  Check, 
  ArrowRight,
  Image,
  AlertOctagon,
  Layers,
  Bug,
  Clock,
  Ticket
} from 'lucide-react';
import { playZapSound, playFanfareSound, playClickSound, playPopSound } from '../utils/audio';
import { triggerConfetti } from '../utils/confetti';

const TARGET_TYPES = [
  { id: 'image', name: '5.2MB Image', pts: 100, icon: <Image className="w-3.5 h-3.5" />, color: 'bg-neo-pink text-white' },
  { id: 'script', name: 'Render-Block JS', pts: 150, icon: <AlertOctagon className="w-3.5 h-3.5" />, color: 'bg-neo-yellow text-black' },
  { id: 'plugin', name: 'Bloated Plugin', pts: 120, icon: <Layers className="w-3.5 h-3.5" />, color: 'bg-neo-cyan text-black' },
  { id: 'bug', name: 'PHP Fatal Error', pts: 200, icon: <Bug className="w-3.5 h-3.5" />, color: 'bg-rose-500 text-white' },
  { id: 'query', name: 'Slow SQL Query', pts: 180, icon: <Clock className="w-3.5 h-3.5" />, color: 'bg-neo-lime text-black' }
];

export default function SpeedGameModal({ isOpen, onClose, onApplyDiscountCode }) {
  const [gameState, setGameState] = useState('idle'); // 'idle' | 'playing' | 'ended'
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(25);
  const [targets, setTargets] = useState([]);
  const [highScore, setHighScore] = useState(() => {
    return typeof window !== 'undefined' ? parseInt(localStorage.getItem('neo_speed_highscore') || '0', 10) : 0;
  });
  const [copiedCode, setCopiedCode] = useState(false);
  const arenaRef = useRef(null);
  const isOpenRef = useRef(isOpen);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  // Game Loop
  useEffect(() => {
    let timer = null;
    let spawnTimer = null;

    if (isOpen && gameState === 'playing') {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            clearInterval(spawnTimer);
            // Guard: if the modal was closed mid-game, don't fire the end
            // sequence (confetti/fanfare) into an unmounted overlay.
            if (isOpenRef.current) {
              setTargets([]);
              setGameState('ended');
              triggerConfetti(3000);
              playFanfareSound();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      spawnTimer = setInterval(() => {
        const type = TARGET_TYPES[Math.floor(Math.random() * TARGET_TYPES.length)];
        const newTarget = {
          id: Math.random(),
          ...type,
          x: Math.random() * 60 + 4, // 4% to 64% safe zone
          y: Math.random() * 68 + 6   // 6% to 74% safe zone
        };

        setTargets(prev => [...prev.slice(-8), newTarget]);
      }, 700);
    }

    return () => {
      clearInterval(timer);
      clearInterval(spawnTimer);
    };
  }, [isOpen, gameState]);

  const startGame = () => {
    playClickSound(800);
    setScore(0);
    setTimeLeft(25);
    setTargets([]);
    setGameState('playing');
  };

  const smashTarget = (targetId, pts) => {
    playZapSound();
    setScore(prev => {
      const next = prev + pts;
      if (next > highScore) {
        setHighScore(next);
        if (typeof window !== 'undefined') {
          localStorage.setItem('neo_speed_highscore', next.toString());
        }
      }
      return next;
    });
    setTargets(prev => prev.filter(t => t.id !== targetId));
  };

  const handleCopyVoucher = () => {
    navigator.clipboard.writeText('RAIYAN-SPEED-VIP');
    setCopiedCode(true);
    playPopSound(750);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleApplyDiscount = () => {
    playFanfareSound();
    if (onApplyDiscountCode) {
      onApplyDiscountCode('RAIYAN-SPEED-VIP (15% Off Project Code Applied from Bug Hunter Mini-Game)');
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white neo-box p-4 sm:p-6 border-4 border-[#121316] shadow-[8px_8px_0px_#121316] flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-[#121316]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-neo-yellow text-black neo-box-sm">
              <Gamepad2 className="w-5 h-5 text-black" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base text-[#121316]">Bug Hunter & Speed Smasher</h3>
              <p className="text-[10px] sm:text-xs font-bold text-neutral-600">Eliminate website bloat for secret VIP perks</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 bg-white text-[#121316] hover:bg-rose-500 hover:text-white transition-colors neo-box-sm cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Game Stats Bar */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3 text-center select-none font-mono">
          <div className="p-2 sm:p-2.5 bg-[#faf7f2] border-2 border-[#121316] neo-box-sm">
            <div className="text-[10px] font-extrabold uppercase text-neutral-600">Score</div>
            <div className="text-lg sm:text-xl font-black text-[#121316]">{score}</div>
          </div>

          <div className="p-2 sm:p-2.5 bg-[#faf7f2] border-2 border-[#121316] neo-box-sm">
            <div className="text-[10px] font-extrabold uppercase text-neutral-600">Time Left</div>
            <div className={`text-lg sm:text-xl font-black ${timeLeft <= 5 ? 'text-rose-600 animate-pulse' : 'text-[#121316]'}`}>
              {timeLeft}s
            </div>
          </div>

          <div className="p-2 sm:p-2.5 bg-[#faf7f2] border-2 border-[#121316] neo-box-sm">
            <div className="text-[10px] font-extrabold uppercase text-neutral-600">High Score</div>
            <div className="text-lg sm:text-xl font-black text-emerald-700">{highScore}</div>
          </div>
        </div>

        {/* Game Arena Canvas */}
        <div 
          ref={arenaRef}
          className="relative flex-1 min-h-[260px] sm:min-h-[340px] bg-[#0c0e17] border-[3px] border-[#121316] overflow-hidden select-none flex items-center justify-center shadow-inner"
        >
          {/* Subtle Grid Lines */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none"></div>

          {/* Idle State */}
          {gameState === 'idle' && (
            <div className="text-center p-4 max-w-md z-10">
              <div className="w-14 h-14 bg-neo-yellow text-black neo-box-sm flex items-center justify-center mx-auto mb-3">
                <Flame className="w-8 h-8 text-black" />
              </div>
              <h4 className="text-lg sm:text-xl font-black text-white mb-1.5 tracking-tight">Smash the WordPress Bugs!</h4>
              <p className="text-xs sm:text-sm text-neutral-300 font-medium mb-4 leading-relaxed">
                Click floating slow scripts, heavy images, and bugs before the 25-second timer runs out to unlock an exclusive discount code!
              </p>
              <button
                type="button"
                onClick={startGame}
                className="px-6 py-3 bg-neo-lime text-black font-black text-xs sm:text-sm neo-btn hover:bg-neo-yellow cursor-pointer shadow-[3px_3px_0px_#fff]"
              >
                START CHALLENGE (25s)
              </button>
            </div>
          )}

          {/* Playing State: Floating Targets */}
          {gameState === 'playing' && (
            <>
              {targets.map((target) => (
                <button
                  key={target.id}
                  type="button"
                  onClick={() => smashTarget(target.id, target.pts)}
                  style={{ top: `${target.y}%`, left: `${target.x}%` }}
                  className={`absolute p-2 sm:p-2.5 font-black text-xs neo-badge border-2 border-black animate-fadeIn cursor-pointer transition-transform active:scale-90 hover:scale-110 shadow-[3px_3px_0px_#000] flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 select-none z-10 ${target.color}`}
                >
                  <span className="text-sm flex-shrink-0">{target.icon}</span>
                  <span className="whitespace-nowrap">{target.name}</span>
                  <span className="text-[10px] bg-black/25 px-1 font-mono flex-shrink-0 font-bold">+{target.pts}</span>
                </button>
              ))}
            </>
          )}

          {/* Ended State: Victory & Discount Voucher */}
          {gameState === 'ended' && (
            <div className="text-center p-4 sm:p-6 max-w-lg z-10 bg-white neo-box m-3 text-[#121316]">
              <div className="w-12 h-12 bg-neo-lime text-black rounded-full neo-box-sm flex items-center justify-center mx-auto mb-2">
                <Trophy className="w-6 h-6 text-black" />
              </div>
              <h4 className="text-xl font-black text-[#121316]">Speed Master Champion!</h4>
              <p className="text-xs text-neutral-600 font-bold mb-3">
                Final Score: <span className="text-neo-pink text-sm font-black">{score} Points</span>
              </p>

              {/* Secret VIP Voucher Code */}
              <div className="p-3 bg-[#faf7f2] border-2 border-dashed border-[#121316] mb-4">
                <div className="text-[10px] font-black uppercase tracking-wider text-neutral-600 mb-1 flex items-center justify-center gap-1">
                  <Ticket className="w-3.5 h-3.5 text-neo-pink" />
                  <span>Mention this code when you message Raiyan:</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-mono font-black text-base sm:text-lg text-[#121316] bg-white px-2.5 py-1 border border-[#121316] select-all">
                    RAIYAN-SPEED-VIP
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyVoucher}
                    className="p-1.5 bg-white neo-box-sm hover:bg-neo-pink hover:text-white transition-colors cursor-pointer text-[#121316]"
                    title="Copy Discount Code"
                  >
                    {copiedCode ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 w-full">
                <button
                  type="button"
                  onClick={startGame}
                  className="flex-1 py-2.5 px-3 bg-white text-[#121316] font-extrabold text-xs sm:text-sm neo-btn hover:bg-[#faf7f2] flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 flex-shrink-0" />
                  <span>Play Again</span>
                </button>
                <button
                  type="button"
                  onClick={handleApplyDiscount}
                  className="flex-1 py-2.5 px-3 bg-neo-lime text-black font-extrabold text-xs sm:text-sm neo-btn hover:bg-neo-yellow flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer shadow-[2px_2px_0px_#000]"
                >
                  <span>Use This Code</span>
                  <ArrowRight className="w-4 h-4 flex-shrink-0" />
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
