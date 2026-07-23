"use client";

import { useEffect, useRef, useState } from 'react';
import HolographicCard from './HolographicCard';

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function useCounter(target: number, duration = 1800, startOnMount = false) {
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(startOnMount);

  useEffect(() => {
    if (!started) return;
    let frame: number;
    let start: number | null = null;

    const tick = (now: number) => {
      if (!start) start = now;
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      setValue(target * easeOutExpo(progress));
      if (progress < 1) frame = requestAnimationFrame(tick);
      else setValue(target);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [started, target, duration]);

  return { value, start: () => setStarted(true) };
}

interface StatCardProps {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  label: string;
}

export default function AnimatedStatCard({ value, suffix = '', prefix = '', decimals = 0, label }: StatCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { value: current, start } = useCounter(value, 2000);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    if (!ref.current || triggered) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          start();
          setTriggered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [start, triggered]);

  const display = decimals > 0 ? current.toFixed(decimals) : Math.round(current).toString();

  return (
    <div ref={ref}>
      <HolographicCard className="bg-[#0a1225]/80 border border-white/[0.08] rounded-2xl p-8 flex flex-col items-center justify-center hover:border-cyan-400/40 transition-colors shadow-2xl backdrop-blur-xl">
        <div className="text-4xl md:text-5xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-indigo-300 mb-2 tabular-nums drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]">
          {prefix}{display}{suffix}
        </div>
        <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-[0.3em] text-center">
          {label}
        </div>
        {/* Hologram bottom border indicator */}
        <div className="w-12 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent mt-4 opacity-50 group-hover:w-24 transition-all duration-300" />
      </HolographicCard>
    </div>
  );
}