"use client";

export default function MarqueeTicker() {
  const itemsTop = [
    'ATTENTION U-NET v2.4',
    '85.2% MEAN IoU',
    'ResNet-50 ENCODER',
    'BCE + DICE LOSS HYBRID',
    '240×240 HIGH-RES TENSOR',
    '0.91 DICE COEFFICIENT',
    '200ms REAL-TIME INFERENCE',
    '4 MODALITY MRI FUSION',
    'HIPAA DIAGNOSTIC GRADE',
    'DEEP SPATIAL SEGMENTATION',
  ];

  const itemsBottom = [
    'AUTOMATED ONCOLOGY',
    'UNET ARCHITECTURE',
    'NEURAL BOUNDARY DETECT',
    'SPATIAL FEATURE EXTRACTOR',
    'CLINICAL PDF GENERATION',
    'BRAIN TUMOR SEGMENTATION',
    'MULTI-MODAL DATASET',
    'GRADIENT ATTENTION GATES',
  ];

  const repeatedTop = [...itemsTop, ...itemsTop, ...itemsTop];
  const repeatedBottom = [...itemsBottom, ...itemsBottom, ...itemsBottom];

  return (
    <div className="relative w-full overflow-hidden border-y border-white/[0.08] bg-[#040916]/80 py-5 select-none space-y-3 backdrop-blur-md">
      {/* Top Track - Moving Left */}
      <div className="flex w-max animate-marquee">
        {repeatedTop.map((item, i) => (
          <span key={`top-${i}`} className="flex items-center gap-6 px-6 whitespace-nowrap group">
            <span className="text-[11px] font-mono font-bold uppercase tracking-[0.4em] text-slate-400 group-hover:text-cyan-400 group-hover:shadow-[0_0_12px_rgba(34,211,238,0.5)] transition-all duration-300">
              {item}
            </span>
            <span className="text-cyan-400/40 text-xs animate-pulse">❖</span>
          </span>
        ))}
      </div>

      {/* Bottom Track - Moving Right */}
      <div className="flex w-max animate-marquee-reverse opacity-70">
        {repeatedBottom.map((item, i) => (
          <span key={`bot-${i}`} className="flex items-center gap-6 px-6 whitespace-nowrap group">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.35em] text-slate-500 group-hover:text-fuchsia-400 transition-all duration-300">
              {item}
            </span>
            <span className="text-fuchsia-400/40 text-xs">◈</span>
          </span>
        ))}
      </div>

      {/* Edge Glow & Fades */}
      <div className="absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-[#020510] to-transparent pointer-events-none z-10" />
      <div className="absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-[#020510] to-transparent pointer-events-none z-10" />
    </div>
  );
}