"use client";

import { useEffect, useState } from 'react';

const SECTIONS = [
  { id: 'hero', label: '01 // HERO' },
  { id: 'features', label: '02 // ARCHITECTURE' },
  { id: 'workspace', label: '03 // TERMINAL' },
  { id: 'pricing', label: '04 // ACCESS' },
  { id: 'about', label: '05 // RESEARCH' },
];

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? scrollTop / docHeight : 0);

      const current = SECTIONS.find((s) => {
        const el = document.getElementById(s.id);
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return rect.top <= window.innerHeight * 0.4 && rect.bottom >= window.innerHeight * 0.4;
      });
      if (current) setActiveSection(current.id);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="fixed left-8 top-1/2 -translate-y-1/2 z-[200] hidden xl:flex flex-col items-center gap-6 select-none">
      {/* HUD Tracker Vertical Line */}
      <div className="relative w-[2px] h-48 bg-white/[0.08] rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 w-full bg-gradient-to-b from-cyan-400 to-fuchsia-500 transition-all duration-150"
          style={{ height: `${progress * 100}%` }}
        />
      </div>

      {/* Interactive Section Dots */}
      <div className="flex flex-col gap-5 items-center">
        {SECTIONS.map((sec) => {
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => scrollTo(sec.id)}
              className="group relative flex items-center"
              aria-label={sec.label}
            >
              {/* Dot */}
              <div
                className={`w-2.5 h-2.5 rounded-full border transition-all duration-300 ${
                  isActive
                    ? 'bg-cyan-400 border-cyan-300 scale-125 shadow-[0_0_12px_rgba(34,211,238,1)]'
                    : 'bg-slate-800 border-white/20 group-hover:border-cyan-400/60 group-hover:scale-110'
                }`}
              />

              {/* Tooltip on Hover */}
              <span className="absolute left-6 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 bg-slate-900/90 border border-cyan-500/30 text-[9px] font-mono font-bold tracking-widest text-cyan-400 px-3 py-1 rounded-md whitespace-nowrap backdrop-blur-md shadow-xl pointer-events-none">
                {sec.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}