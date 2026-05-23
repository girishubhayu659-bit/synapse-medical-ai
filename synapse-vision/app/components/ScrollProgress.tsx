"use client";

import { useEffect, useState } from 'react';

const SECTIONS = [
  { id: 'hero', label: 'Hero' },
  { id: 'features', label: 'Features' },
  { id: 'workspace', label: 'Workspace' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'about', label: 'About' },
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
        const el = document.getElementById(s.id) ?? (s.id === 'hero' ? document.querySelector('section') : null);
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return rect.top <= 120 && rect.bottom >= 120;
      });
      if (current) setActiveSection(current.id);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="fixed left-6 top-1/2 -translate-y-1/2 z-[200] hidden lg:flex flex-col items-center gap-0">
      {/* Track line */}
      <div className="relative w-[1px] h-40 bg-white/[0.06]">
        <div
          className="absolute top-0 left-0 w-full bg-cyan-400 transition-all duration-100"
          style={{ height: `${progress * 100}%` }}
        />
        {/* Glowing dot */}
        <div
          className="absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)] transition-all duration-100"
          style={{ top: `${progress * 100}%`, transform: 'translate(-50%, -50%)' }}
        />
      </div>
    </div>
  );
}