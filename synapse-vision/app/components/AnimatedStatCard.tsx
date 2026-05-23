"use client";

import { useEffect, useRef, useState } from 'react';

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function useCounter(target: number, duration = 1600, startOnMount = false) {
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
  const { value: current, start } = useCounter(value, 1800);
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
      { threshold: 0.5 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [start, triggered]);

  const display = decimals > 0 ? current.toFixed(decimals) : Math.round(current).toString();

  return (
    <div
      ref={ref}
      className="bg-[#0a1225]/60 border border-white/[0.05] rounded-2xl p-8 flex flex-col items-center justify-center hover:border-cyan-500/20 transition-colors group"
    >
      <div className="text-4xl font-bold text-cyan-400 mb-2 tabular-nums group-hover:text-cyan-300 transition-colors">
        {prefix}{display}{suffix}
      </div>
      <div className="text-[10px] text-slate-500 uppercase tracking-widest text-center">{label}</div>
    </div>
  );
}