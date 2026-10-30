import React, { useState, useEffect, useRef } from 'react';
import { Terminal, X, CornerDownLeft } from 'lucide-react';
import { playTerminalBeep, playSuccessSound, playFanfareSound, playClickSound } from '../utils/audio';
import { triggerConfetti } from '../utils/confetti';
import { CONTACT_EMAIL } from '../config';

const INITIAL_OUTPUT = [
  { type: 'system', text: '[SYSTEM] RAIYAN-OS Dev Terminal [v3.2.0-release]' },
  { type: 'system', text: 'Type "help" to view available commands, or try "skills", "game", or "sudo hire-me".' },
  { type: 'hint', text: '[TIP] Use Up/Down arrows for history and Tab to autocomplete commands.' }
];

const AVAILABLE_COMMANDS = [
  'help',
  'home',
  'skills',
  'projects',
  'game',
  'sudo hire-me',
  'whoami',
  'bio',
  'contact',
  'quote',
  'date',
  'clear',
  'exit'
];

export default function RetroTerminalModal({ isOpen, onClose, onNavigate, onNavigateToSection, onPreFillContact, onOpenGame }) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState(INITIAL_OUTPUT);
  const [cmdHistory, setCmdHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          playClickSound(800);
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleCommand = (rawCmd) => {
    const cmd = rawCmd.trim();
    if (!cmd) return;

    playTerminalBeep(920);
    setCmdHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);

    const newHistory = [...history, { type: 'user', text: `$ ${cmd}` }];
    const lower = cmd.toLowerCase();

    if (lower === 'clear') {
      setHistory([]);
      setInput('');
      return;
    }

    if (lower === 'help') {
      newHistory.push({
        type: 'output',
        text: `
AVAILABLE COMMANDS:
--------------------------------------------------
  home            - Return to main portfolio landing page
  skills          - Display technical competencies & ratings
  projects        - List top full-stack WordPress & React projects
  game            - Launch the 25s Bug Hunter mini-game!
  sudo hire-me    - Unlock VIP priority booking & launch celebration
  bio             - Read Raiyan's developer journey & story
  contact         - View direct communication channels
  quote           - Get a random developer quote
  date            - Print current server/client timestamp
  whoami          - Identify the current visitor session
  clear           - Wipe the terminal buffer
  exit            - Close the terminal window
--------------------------------------------------`
      });
    } else if (lower === 'home' || lower === 'main') {
      newHistory.push({
        type: 'success',
        text: '>> Navigating to Portfolio Home...'
      });
      playSuccessSound();
      setTimeout(() => {
        onClose();
        if (onNavigate) onNavigate('home');
      }, 400);
    } else if (lower === 'skills') {
      newHistory.push({
        type: 'output',
        text: `
[SKILL INVENTORY - FULL STACK & ARCHITECTURE]
==================================================
  • WordPress Core & Theme Architecture   [98%] [██████████████████░]
  • Modern PHP 8.x / OOP / WP Hooks       [95%] [█████████████████░░]
  • React 19 / Next.js Headless Layer     [94%] [████████████████░░░]
  • Elementor Pro Dynamic Widgets         [96%] [█████████████████░░]
  • Core Web Vitals & Speed Optimization  [99%] [███████████████████]
  • Tailwind CSS v4 / Neo-Brutalism UI    [96%] [█████████████████░░]
  • MySQL, REST API, GraphQL, Redis       [91%] [████████████████░░░]
==================================================`
      });
      if (onNavigate) onNavigate('home', { scrollTo: 'skills' });
    } else if (lower === 'projects') {
      newHistory.push({
        type: 'output',
        text: `
[NOTABLE RECENT BUILDS]
1. Omnikorp Industrial  -> Headless Next.js + ACF Pro (0.38s FCP, 99 Mobile Speed)
2. Auric Commerce       -> Custom WooCommerce + High-converting checkout
3. DevMatrix Hub        -> Modular Elementor Pro dynamic system + Custom PHP
4. Veloce Speed Engine  -> Full database, asset deferral & Redis caching overhaul`
      });
      if (onNavigate) onNavigate('home', { scrollTo: 'projects' });
    } else if (lower === 'game' || lower === 'play') {
      newHistory.push({
        type: 'success',
        text: '>> Booting up Bug Hunter mini-game...'
      });
      playFanfareSound();
      setTimeout(() => {
        onClose();
        if (onOpenGame) onOpenGame();
      }, 500);
    } else if (lower === 'sudo hire-me' || lower === 'hire' || lower === 'hire-me') {
      triggerConfetti(3500);
      playFanfareSound();
      newHistory.push({
        type: 'success',
        text: `
[ACCESS GRANTED - VIP CLIENT PIPELINE ACTIVATED]
--------------------------------------------------
Permission escalated. 
Pre-filling contact form with VIP inquiry and priority scheduling!
Redirecting you to the contact section now...
--------------------------------------------------`
      });
      setTimeout(() => {
        if (onPreFillContact) {
          onPreFillContact({
            budget: '$3,500 - $8,000+ (Headless WordPress + React)',
            message: 'Hello Raiyan! I unlocked the VIP command via the CLI terminal. I have a high-priority web development project and would like to discuss next steps.'
          });
        }
        onClose();
        if (onNavigate) onNavigate('home', { scrollTo: 'contact' });
        else if (onNavigateToSection) onNavigateToSection('contact');
      }, 1200);
    } else if (lower === 'whoami') {
      newHistory.push({
        type: 'output',
        text: 'guest@raiyan.dev (Role: Visionary Client / Talent Scout / Engineer)'
      });
    } else if (lower === 'bio' || lower === 'about') {
      newHistory.push({
        type: 'output',
        text: `
Raiyan Imon is a Full-Stack WordPress & Headless Engineer based in Dhaka (GMT+6).
He specializes in writing clean, scalable PHP 8 architectures, bespoke ACF Pro blocks,
and pairing headless WordPress APIs with lightning-fast React / Next.js frontends.
4+ years of production experience, 45+ completed client builds, 95+ average PageSpeed.`
      });
    } else if (lower === 'contact') {
      newHistory.push({
        type: 'output',
        text: `
Direct Contact Channels:
  • Email: ${CONTACT_EMAIL}
  • GitHub: https://github.com/mrra1yan
  • Timezone: Asia/Dhaka (GMT+6)
  • Open Status: Accepting Q3/Q4 Project Contracts`
      });
    } else if (lower === 'date') {
      newHistory.push({
        type: 'output',
        text: new Date().toString()
      });
    } else if (lower === 'quote') {
      const quotes = [
        '"Any fool can write code that a computer can understand. Good programmers write code that humans can understand." — Martin Fowler',
        '"First, solve the problem. Then, write the code." — John Johnson',
        '"Make it work, make it right, make it fast." — Kent Beck',
        '"Simplicity is prerequisite for reliability." — Edsger W. Dijkstra',
        '"WordPress is fast when you don\'t feed it 50 bloated plugins." — Raiyan Imon'
      ];
      newHistory.push({
        type: 'output',
        text: quotes[Math.floor(Math.random() * quotes.length)]
      });
    } else if (lower === 'exit' || lower === 'quit') {
      onClose();
      return;
    } else {
      newHistory.push({
        type: 'error',
        text: `Command not found: "${cmd}". Type "help" for a list of available commands.`
      });
    }

    setHistory(newHistory);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleCommand(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length > 0) {
        const nextIdx = historyIndex + 1 < cmdHistory.length ? historyIndex + 1 : historyIndex;
        setHistoryIndex(nextIdx);
        setInput(cmdHistory[cmdHistory.length - 1 - nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInput(cmdHistory[cmdHistory.length - 1 - nextIdx]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const match = AVAILABLE_COMMANDS.find(c => c.startsWith(input.toLowerCase().trim()));
      if (match) {
        setInput(match);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-[#0c0d12] text-emerald-400 border-4 border-[#121316] shadow-[8px_8px_0px_#000] font-mono text-xs sm:text-sm flex flex-col h-[80vh] max-h-[640px] overflow-hidden">
        
        {/* Terminal Header Bar */}
        <div className="bg-[#181a20] px-4 py-2.5 border-b-2 border-[#121316] flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500 border border-black inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-amber-400 border border-black inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500 border border-black inline-block"></span>
            </div>
            <span className="font-extrabold text-xs text-neutral-300 ml-2 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-neo-yellow" />
              raiyan@imon-devbox:~ (bash)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-[10px] bg-neutral-800 text-neutral-400 px-1.5 py-0.5 border border-neutral-700">
              ESC to close
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-1 bg-rose-500 text-white border border-black hover:bg-rose-600 transition-colors cursor-pointer"
              title="Close Terminal"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Scanline CRT overlay effect */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-30 z-10"></div>

        {/* Terminal Content Buffer */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-2 text-neutral-200 z-0">
          {history.map((line, idx) => {
            if (line.type === 'user') {
              return (
                <div key={idx} className="flex items-start gap-1 font-bold text-neo-cyan">
                  <span>{line.text}</span>
                </div>
              );
            }
            if (line.type === 'system') {
              return (
                <div key={idx} className="text-neo-yellow font-bold text-[11px] sm:text-xs">
                  {line.text}
                </div>
              );
            }
            if (line.type === 'hint') {
              return (
                <div key={idx} className="text-neutral-400 italic text-[11px]">
                  {line.text}
                </div>
              );
            }
            if (line.type === 'success') {
              return (
                <div key={idx} className="text-neo-lime font-bold whitespace-pre-wrap">
                  {line.text}
                </div>
              );
            }
            if (line.type === 'error') {
              return (
                <div key={idx} className="text-rose-400 font-bold whitespace-pre-wrap">
                  {line.text}
                </div>
              );
            }
            return (
              <div key={idx} className="text-neutral-300 whitespace-pre-wrap leading-relaxed">
                {line.text}
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input Bar */}
        <div className="bg-[#12141c] p-3 sm:p-4 border-t-2 border-neutral-800 flex items-center gap-2 z-0">
          <span className="text-neo-pink font-extrabold flex-shrink-0">raiyan@dev:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type 'help' or 'sudo hire-me'..."
            className="flex-1 bg-transparent text-white font-mono text-xs sm:text-sm focus:outline-none placeholder-neutral-600"
            autoFocus
          />
          <button
            type="button"
            onClick={() => handleCommand(input)}
            className="p-1.5 bg-neo-yellow text-black font-extrabold neo-box-sm hover:bg-neo-pink hover:text-white transition-colors cursor-pointer flex-shrink-0"
            title="Execute Command"
          >
            <CornerDownLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bottom Quick Command Pills */}
        <div className="bg-[#0e1017] px-3 py-2 border-t border-neutral-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[10px] text-neutral-400 select-none">
          <span className="font-bold text-neutral-500 uppercase flex-shrink-0">Quick:</span>
          {['help', 'skills', 'projects', 'contact', 'game', 'sudo hire-me', 'clear'].map((cmd) => (
            <button
              key={cmd}
              type="button"
              onClick={() => handleCommand(cmd)}
              className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 font-mono transition-colors flex-shrink-0 cursor-pointer"
            >
              {cmd}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
