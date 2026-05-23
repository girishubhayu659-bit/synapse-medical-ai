"use client";

export default function MarqueeTicker() {
  const items = [
    'ATTENTION U-NET',
    '85.2% IoU',
    'ResNet-50 ENCODER',
    'BCE + DICE LOSS',
    '240×240 TENSOR',
    '0.91 DICE SCORE',
    '200ms LATENCY',
    '4 MRI MODALITIES',
    'HIPAA COMPLIANT',
    'DEEP LEARNING',
  ];

  const repeated = [...items, ...items, ...items];

  return (
    <div className="relative w-full overflow-hidden border-y border-white/[0.05] bg-[#060c1a]/40 py-4 select-none">
      <div className="flex w-max animate-marquee">
        {repeated.map((item, i) => (
          <span key={i} className="flex items-center gap-6 px-6 whitespace-nowrap">
            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500 hover:text-cyan-400 transition-colors duration-300">
              {item}
            </span>
            <span className="text-cyan-500/20 text-xs">◆</span>
          </span>
        ))}
      </div>

      {/* Fade edges */}
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#020510] to-transparent pointer-events-none z-10" />
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#020510] to-transparent pointer-events-none z-10" />
    </div>
  );
}