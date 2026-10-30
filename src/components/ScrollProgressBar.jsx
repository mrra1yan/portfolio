import { useEffect, useState } from 'react';

// Fixed rainbow scroll-progress bar pinned to the very top of the viewport.
// Zero-dependency, rAF-throttled, pointer-events disabled so it never blocks clicks.
export default function ScrollProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[80] h-1.5 pointer-events-none" aria-hidden="true">
      <div
        className="h-full transition-[width] duration-100 ease-out bg-[linear-gradient(90deg,#fde047_0%,#fb7185_25%,#c084fc_50%,#38bdf8_75%,#4ade80_100%)] border-r-2 border-[#121316]"
        style={{ width: `${progress}%`, boxShadow: '1px 1px 0px 0px #121316' }}
      />
    </div>
  );
}
