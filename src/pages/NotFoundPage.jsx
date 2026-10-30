import React, { useEffect } from 'react';
import { Home, Terminal, Ghost } from 'lucide-react';

const DEFAULT_TITLE = 'Raiyan Imon — WordPress & Headless React Developer';

// Neo-brutalist 404 page for unknown routes. Fun, on-brand, and gives the
// visitor real exits (home, CLI) instead of a silent redirect.
export default function NotFoundPage({ onNavigate, onOpenTerminal }) {
  useEffect(() => {
    document.title = '404 — Page Not Found | Raiyan Imon';
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, []);

  return (
    <section className="py-14 sm:py-20 min-h-[70vh] flex items-center">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-3xl mx-auto text-center">

          {/* Error Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-neo-pink text-white neo-badge text-xs sm:text-sm font-black uppercase tracking-widest mb-6 sm:mb-8">
            <Ghost className="w-4 h-4" />
            <span>Error 404 // Route Not Found</span>
          </div>

          {/* Giant 404 */}
          <h1 className="font-black tracking-tighter leading-none mb-4 sm:mb-6 select-none" aria-label="404 — page not found">
            <span className="inline-block text-6xl sm:text-8xl md:text-9xl text-[#121316] transform -rotate-3">4</span>
            <span className="inline-block text-6xl sm:text-8xl md:text-9xl text-transparent bg-clip-text bg-neo-cyan [-webkit-text-stroke:3px_#121316] transform rotate-2 mx-1 sm:mx-2">0</span>
            <span className="inline-block text-6xl sm:text-8xl md:text-9xl text-neo-yellow transform rotate-6" style={{ WebkitTextStroke: '3px #121316' }}>4</span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-neutral-600 font-medium leading-relaxed mb-6 sm:mb-8 max-w-xl mx-auto">
            This route returned a <strong className="text-[#121316] font-bold">404</strong> — even a
            headless stack with 95+ PageSpeed can't hydrate a page that doesn't exist.
          </p>

          {/* Fake Terminal Readout */}
          <div className="bg-[#0d0e12] border-2 border-neutral-700 neo-box-sm text-left p-3.5 sm:p-4 font-mono text-[11px] sm:text-xs mb-8 sm:mb-10 max-w-md mx-auto overflow-x-auto">
            <p><span className="text-neo-pink">raiyan@imon:~$</span> <span className="text-neutral-300">curl -I https://raiyan.dev/this-page</span></p>
            <p className="text-neo-yellow">HTTP/2 404 — Not Found <span className="text-neutral-500">(served in 0.04ms)</span></p>
            <p className="text-emerald-400">tip: press Ctrl + K to talk to the CLI instead</p>
          </div>

          {/* Exit Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-center gap-3">
            <button
              onClick={() => onNavigate('home')}
              className="bg-neo-pink text-white px-6 h-12 text-sm sm:text-base font-extrabold neo-btn hover:bg-rose-500 inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </button>

            {onOpenTerminal && (
              <button
                onClick={onOpenTerminal}
                className="bg-[#121316] text-neo-lime px-6 h-12 text-sm sm:text-base font-mono font-black neo-btn inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <Terminal className="w-4 h-4" />
                <span>Open CLI</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
