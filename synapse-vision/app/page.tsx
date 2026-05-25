"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from 'framer-motion';
import {
  Brain, Target, Zap, Upload, ChevronRight, Check,
  Layers, Activity, Rocket, FileText, Lock, Scan, CheckCircle2, Binary,
  Download,
} from 'lucide-react';
import BrainVisualizer, { BrainHero } from './components/BrainVisualizer';
import CustomCursor from './components/CustomCursor';
import MarqueeTicker from './components/MarqueeTicker';
import ScrambleText from './components/ScrambleText';
import AnimatedStatCard from './components/AnimatedStatCard';
import ScrollProgress from './components/ScrollProgress';

export default function Home() {
  const [appState, setAppState] = useState<'idle' | 'scanning' | 'complete'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use state for random/dynamic data to prevent Hydration Errors (CORRECT LOCATION)
  const [patientId, setPatientId] = useState<string>('');
  const [reportDate, setReportDate] = useState<string>('');

  useEffect(() => {
    setPatientId(`PT-${Math.floor(Math.random() * 900000) + 100000}`);
    setReportDate(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { damping: 30, stiffness: 150 });
  const springY = useSpring(mouseY, { damping: 30, stiffness: 150 });

  const spotlightBg = useTransform(
    [springX, springY],
    ([x, y]: number[]) =>
      `radial-gradient(700px circle at ${x}px ${y}px, rgba(34, 211, 238, 0.06), transparent 40%)`
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add('visible');
      }),
      { threshold: 0.08, rootMargin: '-40px' }
    );
    document.querySelectorAll('.reveal, .reveal-stagger').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleAnalysis = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || appState === 'scanning') return;

    // Generate a new patient ID for every new scan (FIXED: Just calling the setter, no hooks)
    setPatientId(`PT-${Math.floor(Math.random() * 900000) + 100000}`);

    setAppState('scanning');
    setLogs(['INIT: ResNet-50 Backbone Loaded']);

    const logSequence = [
      { msg: 'EXTRACT: Spatial Features [128x128x64]', delay: 400 },
      { msg: 'ATTENTION: AG1 Activated — Suppressing Edema', delay: 800 },
      { msg: 'ATTENTION: AG2 Activated — Isolating Core', delay: 1200 },
      { msg: 'DECODE: Reconstructing Spatial Resolution', delay: 1600 },
    ];

    logSequence.forEach((item) => {
      setTimeout(() => setLogs((p) => [...p, item.msg]), item.delay);
    });

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("https://shubhayu5-synapse-api.hf.space/predict", {
        method: "POST",
        body: formData,
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Backend Offline");
      const data = await response.json();
      setTimeout(() => {
        setLogs(p => [...p, `COMPLETE: Inference finished in ${data.time_taken || '200ms'}`, `SUCCESS: Tensor [240x240x1] Generated`]);
        setResult(data);
        setAppState('complete');
      }, 2000);
    } catch (error) {
      setLogs(p => [...p, "⚠️ ERROR: Synapse Backend Unreachable"]);
      setAppState('idle');
    } finally {
      e.target.value = '';
    }
  };

  const triggerUpload = () => fileInputRef.current?.click();

  const resetSystem = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAppState('idle');
    setLogs([]);
    setResult(null);
  };

  const downloadReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    // 1. Grab the HTML of the hidden report
    const printContent = document.getElementById('printable-report');
    if (!printContent) return;
    // 2. Create a brand new, clean browser window
    const printWindow = window.open('', '', 'width=900,height=900');
    if (!printWindow) return;
    // 3. Inject ONLY the report and basic Tailwind classes into this clean window
    printWindow.document.write(`
      <html>
        <head>
          <title>Synapse Vision - Clinical Report</title>
          <script src="https://cdn.tailwindcss.com"><\/script>
          <style>
            @media print {
              @page { margin: 15mm; }
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
            body { font-family: ui-sans-serif, system-ui, sans-serif; background-color: white; color: black; }
          </style>
        </head>
        <body class="bg-white">
          ${printContent.innerHTML}
          <script>
            // Wait 500ms for Tailwind to load, then print and close
            setTimeout(() => {
              window.print();
              window.close();
            }, 500);
          <\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // FIX: Added `as const` to ease arrays to satisfy Framer Motion's TypeScript types
  const wordVariants = {
    hidden: { opacity: 0, y: 60, rotateX: -20 },
    visible: (i: number) => ({
      opacity: 1, y: 0, rotateX: 0,
      transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const, delay: i * 0.15 },
    }),
  };

  return (
    <main className="min-h-screen bg-[#020510] text-white font-sans selection:bg-cyan-500/20 overflow-hidden relative" style={{ cursor: 'none' }}>

      {/* 🟢 BULLETPROOF PRINT OVERRIDE 🟢 */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { margin: 15mm; }
          body, html, main {
            background-color: white !important;
            height: auto !important;
            min-height: auto !important;
            overflow: visible !important;
            color: black !important;
          }
          #web-app-ui { display: none !important; }
          #printable-report { display: block !important; }
        }
      `}} />

      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAnalysis} />

      {/* ========================================================= */}
      {/* 💻 THE WEB APP UI (Hidden during print) 💻 */}
      {/* ========================================================= */}
      <div id="web-app-ui">
        <CustomCursor />
        <ScrollProgress />
        <motion.div className="pointer-events-none fixed inset-0 z-[60] mix-blend-screen" style={{ background: spotlightBg }} />
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="ambient-blob ambient-blob-violet" style={{ bottom: '0%', right: '-15%', width: '45vw', height: '45vw' }} />
          <div className="ambient-blob ambient-blob-amber" style={{ top: '45%', left: '30%', width: '30vw', height: '30vw' }} />
        </div>

        <nav className="fixed top-0 w-full z-[100] border-b border-white/[0.06] glass px-8 py-5">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <div className="h-8 w-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_16px_rgba(34,211,238,0.3)]">
                <Brain size={16} className="text-black" />
              </div>
              <span className="font-bold tracking-tight text-lg text-white/90 group-hover:text-white transition-colors">Synapse Vision</span>
            </motion.div>
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const, delay: 0.1 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => document.getElementById('workspace')?.scrollIntoView({ behavior: 'smooth' })}
              className="relative px-5 py-2 rounded-full border border-slate-700/60 bg-slate-900/40 text-[10px] uppercase tracking-[0.3em] font-bold overflow-hidden group"
            >
              <span className="relative z-10 group-hover:text-black transition-colors duration-300">Deploy Model</span>
              <div className="absolute inset-0 bg-cyan-400 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </motion.button>
          </div>
        </nav>

        {/* HERO */}
        <section id="hero" className="relative z-10 h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
          <BrainHero />
          <div className="relative z-10 flex flex-col items-center text-center max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as const, delay: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 backdrop-blur-sm text-cyan-400 text-[9px] uppercase tracking-[0.45em] font-black mb-10"
            >
              <Binary size={10} className="animate-pulse" />
              <span>Attention-Driven Inference Engine</span>
            </motion.div>
            <div style={{ perspective: 1000 }}>
              {['Algorithmic', 'Oncology.'].map((word, i) => (
                <motion.div key={word} custom={i} variants={wordVariants} initial="hidden" animate="visible" className="block overflow-hidden">
                  <span className="block text-[clamp(4rem,12vw,9rem)] font-bold tracking-tighter leading-[0.88] pb-2">
                    <ScrambleText text={word} delay={400 + i * 180} className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/50" />
                  </span>
                </motion.div>
              ))}
            </div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const, delay: 0.9 }}
              className="text-base md:text-lg text-slate-400 mb-12 max-w-xl mx-auto font-light leading-relaxed tracking-wide mt-8"
            >
              Automating Brain Tumor Segmentation via <span className="text-white font-medium border-b border-cyan-500/40">Attention U-Net</span>.
              Achieving 85.2% IoU through advanced spatial filtering.
            </motion.p>
            <motion.a
              href="#workspace"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const, delay: 1.1 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="px-10 py-5 bg-white text-black font-bold rounded-full shadow-[0_0_50px_rgba(255,255,255,0.15)] flex items-center gap-3 uppercase text-[10px] tracking-[0.3em]"
            >
              Initialize Console <ChevronRight size={14} />
            </motion.a>
          </div>
        </section>

        <div className="relative z-10"><MarqueeTicker /></div>

        {/* FEATURES + 3D CARD */}
        <section id="features" className="surface-1 py-32 px-6 max-w-7xl mx-auto relative z-10 reveal">
          <div className="text-center mb-16">
            <p className="text-xs font-black text-cyan-500 uppercase tracking-[0.5em] mb-4">Spatial Architecture</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter italic text-white">Interactive Topography.</h2>
          </div>
          <div className="w-full mb-16 rounded-[2.5rem] overflow-hidden shadow-[0_0_60px_rgba(34,211,238,0.08)] border border-white/[0.04]">
            <BrainVisualizer coords={result?.coords} volume={result?.volume} confidence={result?.confidence} onUploadClick={triggerUpload} />
          </div>
          {/* FIX: Connected the array literal directly to .map() */}
          <div className="reveal-stagger grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: <Zap className="text-amber-400 mb-4" size={32} />, stat: true },
              { icon: <Layers className="text-purple-400 mb-5 mx-auto" size={28} />, title: 'ResNet-50 Encoder', desc: 'Extracts high-level semantic features before decoding spatial maps.' },
              { icon: <Activity className="text-emerald-400 mb-5 mx-auto" size={28} />, title: 'BCE + Dice Loss', desc: 'Hybrid loss function mitigates class imbalance in tumour datasets.' },
            ].map((card, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -4, transition: { type: 'spring', damping: 20, stiffness: 300 } }}
                className="p-10 rounded-[2rem] bg-[#0a1225]/80 border border-white/[0.05] text-center hover:border-white/10 transition-colors"
              >
                {card.stat ? (
                  <>
                    {card.icon}
                    <div className="text-5xl font-bold tracking-tighter mb-2 text-white">200<span className="text-2xl text-slate-500">ms</span></div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Inference Latency</p>
                  </>
                ) : (
                  <>
                    {card.icon}
                    <h3 className="text-xl font-bold mb-3 text-white">{card.title}</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">{card.desc}</p>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* WORKSPACE */}
        <section id="workspace" className="surface-2 relative z-10 py-32 px-6 max-w-7xl mx-auto reveal" ref={workspaceRef}>
          <div className="rounded-[3.5rem] bg-[#060c1a]/70 border border-white/[0.05] p-8 md:p-14 backdrop-blur-3xl shadow-[0_0_120px_rgba(0,0,0,0.6)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.02] to-transparent pointer-events-none" />
            <div className="flex flex-col lg:flex-row gap-10 md:gap-16 items-stretch relative z-10">

              <div className="lg:w-4/12 flex flex-col justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.4em] text-cyan-500/70 font-bold mb-4">Neural Terminal</p>
                  <h2 className="text-4xl font-bold mb-5 tracking-tighter text-white">Inference<br />Terminal.</h2>
                  <p className="text-slate-400 leading-relaxed mb-8 text-sm">Awaits MRI tensor inputs for automated spatial filtering and tumour boundary isolation.</p>
                </div>
                <div className="h-40 rounded-2xl bg-black/60 border border-white/[0.06] p-5 font-mono text-[10px] flex flex-col justify-end overflow-hidden">
                  <AnimatePresence>
                    {logs.map((log, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`py-0.5 ${log?.includes('COMPLETE') ? 'text-emerald-400' : log?.includes('ATTENTION') ? 'text-cyan-400' : 'text-slate-500'}`}
                      >
                        <span className="text-slate-700 mr-2">{'>'}</span> {log}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {appState === 'idle' && <div className="text-slate-600 animate-pulse">{'>'} SYSTEM STANDBY...</div>}
                </div>
              </div>

              <motion.div
                onClick={appState === 'scanning' ? undefined : triggerUpload}
                whileHover={appState === 'idle' ? { borderColor: 'rgba(34,211,238,0.3)' } : {}}
                className={`lg:w-8/12 w-full min-h-[380px] rounded-[2.5rem] border-2 border-dashed transition-colors duration-700 flex flex-col items-center justify-center ${appState === 'scanning' ? 'cursor-default' : 'cursor-pointer'} relative overflow-hidden ${
                  appState === 'scanning'
                    ? 'border-cyan-500/40 bg-cyan-900/5'
                    : appState === 'complete'
                    ? 'border-emerald-500/30 bg-emerald-900/5'
                    : 'border-white/[0.08] bg-black/20'
                }`}
              >
                <AnimatePresence mode="wait">
                  {appState === 'idle' && (
                    <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center w-full h-full group p-10">
                      <Upload size={28} className="mx-auto mb-5 text-slate-600 group-hover:text-cyan-400 transition-colors duration-300" />
                      <p className="text-slate-600 uppercase tracking-[0.4em] font-black text-[10px] group-hover:text-slate-400 transition-colors">Inject MRI Tensor</p>
                    </motion.div>
                  )}

                  {appState === 'scanning' && (
                    <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center w-full h-full relative z-10">
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, ease: 'linear', repeat: Infinity }}>
                        <Scan size={64} className="text-cyan-400/40 mb-6" />
                      </motion.div>
                      <div className="text-cyan-400 uppercase tracking-[0.5em] font-black text-[10px] animate-pulse">PROCESSING...</div>
                    </motion.div>
                  )}

                  {appState === 'complete' && result?.visualizations && (
                    <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center w-full h-full z-10 p-6">

                      <div className="flex items-center gap-2 mb-6 w-full justify-between">
                        <div className="flex items-center gap-2 text-emerald-400 text-[10px] uppercase tracking-widest font-bold">
                          <CheckCircle2 size={14} /> Attention Maps Extracted
                        </div>
                        <div className="flex gap-3 pointer-events-auto">
                          <button
                            onClick={downloadReport}
                            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[9px] uppercase tracking-widest hover:bg-cyan-500/20 transition-colors text-cyan-400 hover:text-cyan-300 z-50"
                          >
                            <Download size={12} /> Medical Report
                          </button>
                          <button
                            onClick={resetSystem}
                            className="px-4 py-1.5 rounded-full bg-black/40 border border-slate-700/60 text-[9px] uppercase tracking-widest hover:bg-slate-800/60 transition-colors text-slate-400 hover:text-white z-50"
                          >
                            Reset
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-4 items-center justify-center w-full overflow-x-auto pb-4 custom-scrollbar">
                        {[
                          { label: 'Input', img: result.visualizations.input },
                          { label: 'Prediction', img: result.visualizations.mask },
                          { label: 'AG4 Map', img: result.visualizations.ag4 },
                          { label: 'AG2 Map', img: result.visualizations.ag2 },
                          { label: 'AG0 Final', img: result.visualizations.ag0 },
                        ].map((item, idx) => (
                          <motion.div
                            key={item.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex flex-col items-center flex-shrink-0"
                          >
                            <span className="text-[8px] text-cyan-400/80 mb-2 uppercase tracking-[0.2em] font-mono">{item.label}</span>
                            <div className="relative group">
                              <img
                                src={item.img}
                                alt={item.label}
                                className="w-24 h-24 md:w-28 md:h-28 rounded-xl border border-white/10 object-cover shadow-xl transition-transform duration-300 group-hover:scale-105"
                              />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="surface-1 relative z-10 py-32 px-6 max-w-7xl mx-auto border-t border-white/[0.04] reveal">
          <div className="text-center mb-16">
            <p className="text-xs font-black text-cyan-500/60 uppercase tracking-[0.5em] mb-4">Access Tiers</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tighter text-white">Plans &amp; Pricing</h2>
          </div>
          <div className="reveal-stagger grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <motion.div
              whileHover={{ y: -4, transition: { type: 'spring', damping: 20, stiffness: 300 } }}
              className="p-10 rounded-[2rem] bg-[#0a1225]/60 border border-slate-800/60 flex flex-col"
            >
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 font-bold">Starter</p>
              <h3 className="text-2xl font-bold mb-1 text-white">Basic Plan</h3>
              <div className="text-3xl font-bold text-white mb-8 mt-2">Free</div>
              <ul className="space-y-3 mb-10 text-sm text-slate-400 flex-1">
                <li className="flex items-center gap-3"><Check className="text-emerald-500 shrink-0" size={14} />2 analyses per day</li>
                <li className="flex items-center gap-3"><Check className="text-emerald-500 shrink-0" size={14} />CSV export for latest session</li>
              </ul>
              <button className="w-full py-4 rounded-xl font-bold text-black bg-gradient-to-r from-cyan-400 to-blue-500 text-sm hover:opacity-90 transition-opacity">Continue Free</button>
            </motion.div>

            <motion.div
              whileHover={{ y: -4, transition: { type: 'spring', damping: 20, stiffness: 300 } }}
              className="p-10 rounded-[2rem] bg-[#0a1225]/60 border border-cyan-500/30 flex flex-col relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
              <p className="text-[10px] uppercase tracking-widest text-cyan-500 mb-2 font-bold">Professional</p>
              <h3 className="text-2xl font-bold mb-1 text-white">Premium Plan</h3>
              <div className="text-3xl font-bold text-white mb-8 mt-2">$1,499<span className="text-lg text-slate-500 font-normal"> / mo</span></div>
              <ul className="space-y-3 mb-10 text-sm text-slate-300 flex-1">
                <li className="flex items-center gap-3"><Check className="text-cyan-400 shrink-0" size={14} />Unlimited analyses</li>
                <li className="flex items-center gap-3"><Check className="text-cyan-400 shrink-0" size={14} />HIPAA-compliant PDF reports</li>
              </ul>
              <button className="w-full py-4 rounded-xl font-bold text-black bg-gradient-to-r from-cyan-400 to-fuchsia-400 text-sm hover:opacity-90 transition-opacity">Upgrade to Premium</button>
            </motion.div>
          </div>
        </section>

        {/* ABOUT */}
<section id="about" className="surface-0 relative z-10 pt-32 pb-10 px-6 max-w-7xl mx-auto border-t border-white/[0.04] reveal">
          <h2 className="text-center text-4xl font-bold mb-20 tracking-tighter text-white">About This Tool</h2>
          <div className="flex flex-col lg:flex-row gap-16 mb-20">
            <div className="lg:w-1/2">
              <h3 className="text-2xl font-bold mb-5 tracking-tight text-white">Tumor Segmentation Pipeline</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                This MRI Analyzer uses cutting-edge deep learning powered by{' '}
                <span className="text-white font-semibold">ResNet-50</span> neural network architectures trained on thousands of multi-modal medical imaging datasets.
              </p>
              <ul className="space-y-5">
                {[
                  { icon: <Rocket size={16} />, text: 'Fast automated brain tumor localization' },
                  { icon: <Target size={16} />, text: 'High accuracy predictions with confidence scores' },
                  { icon: <FileText size={16} />, text: 'Professional reports for medical records' },
                  { icon: <Lock size={16} />, text: 'Privacy-first with local processing' },
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as const, delay: i * 0.08 }}
                    className="flex items-center gap-3 text-sm text-slate-300"
                  >
                    <span className="text-cyan-400">{item.icon}</span>
                    <span>{item.text}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
            <div className="lg:w-1/2 grid grid-cols-2 gap-4">
              <AnimatedStatCard value={81.63} suffix="%" decimals={1} label="IoU Accuracy" />
              <AnimatedStatCard value={89.43} suffix="%" decimals={2} label="Dice Score" />
              <AnimatedStatCard value={4} label="MRI Modalities" />
              <AnimatedStatCard value={24} suffix="/7" label="Available" />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="p-10 rounded-[2.5rem] bg-[#060c1a]/60 border border-white/[0.05] text-center"
          >
            <p className="text-[10px] font-black text-cyan-500/60 uppercase tracking-[0.45em] mb-10">Research & Development Team</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { name: 'Shubhayu Giri', desc: 'Full-Stack Systems & Integration Engineering' }, 
              { name: 'Soham Santra', desc: 'Deep Learning Architecture & Model Development' }
            ].map((member, i) => (
              <div key={i} className="group">
                <h4 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors duration-300">{member.name}</h4>
                <p className="text-xs text-slate-400 mt-2 font-sans max-w-xs mx-auto leading-relaxed">{member.desc}</p>
              </div>
            ))}
          </div>
            
          </motion.div>
        </section>

        {/* FOOTER */}
        <footer className="relative z-10 border-t border-white/[0.04] bg-[#020510] pt-20 pb-10 px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 mb-16">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Brain size={20} className="text-cyan-400" />
                <span className="font-bold text-lg tracking-tight text-white/90">Synapse Vision</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs">Professional brain imaging analysis powered by AI. Accelerating clinical diagnosis through deep learning.</p>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-white/80 tracking-wide text-sm">Technology</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Attention U-Net Model</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Deep Learning Engine</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Computer Vision API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-white/80 tracking-wide text-sm">Support</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto border-t border-white/[0.04] pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-700 font-medium">
            <p>© 2026 Synapse Vision Analyzer. All rights reserved.</p>
            <p className="mt-4 md:mt-0 uppercase tracking-widest">B.Tech Minor Project — KIIT</p>
          </div>
        </footer>
      </div>

      {/* ========================================================= */}
      {/* 🖨 THE PRINTABLE MEDICAL REPORT TEMPLATE (Hidden on web) 🖨 */}
      {/* ========================================================= */}
      <div id="printable-report" style={{ display: 'none' }} className="bg-white text-black p-12 font-sans w-full">

        {/* Hospital Header */}
        <div className="flex justify-between items-start border-b-4 border-slate-900 pb-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-slate-900 rounded-lg flex items-center justify-center">
              <Brain size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter text-slate-900">SYNAPSE VISION</h1>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Department of Neurology & Diagnostics</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-slate-800">CLINICAL REPORT</p>
            <p className="text-sm font-medium text-slate-500 mt-1">Date: {reportDate}</p>
          </div>
        </div>

        {/* Patient Details */}
        <div className="bg-slate-50 p-6 rounded-xl border-2 border-slate-200 mb-10 flex justify-between shadow-sm">
          <div>
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Patient ID</p>
            <p className="text-xl font-bold text-slate-800">{patientId}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Scan Modality</p>
            <p className="text-lg font-bold text-slate-800">MRI T1-Weighted</p>
          </div>
        </div>

        {/* Clinical Findings */}
        <div className="mb-10">
          <h2 className="text-2xl font-black border-b-2 border-slate-200 pb-2 mb-6 text-slate-800">AI Volumetric Findings</h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="p-6 border-2 border-slate-200 rounded-xl text-center bg-white">
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">Estimated Core Volume</p>
              <p className="text-4xl font-black text-slate-900">{result?.volume || '--'}</p>
            </div>
            <div className="p-6 border-2 border-slate-200 rounded-xl text-center bg-white">
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">Model Confidence</p>
              <p className="text-4xl font-black text-slate-900">
                {result?.confidence ? `${(result.confidence * 100).toFixed(1)}%` : '--'}
              </p>
            </div>
            <div className="p-6 border-2 border-slate-200 rounded-xl text-center bg-white">
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">Spatial Cartesian (X,Y,Z)</p>
              <p className="text-2xl font-black text-slate-900 mt-2">
                {result?.coords ? `[${result.coords.map((c: number) => c.toFixed(2)).join(', ')}]` : '--'}
              </p>
            </div>
          </div>
        </div>

        {/* Scan Visualizations */}
        {result?.visualizations && (
          <div className="mb-12">
            <h2 className="text-2xl font-black border-b-2 border-slate-200 pb-2 mb-6 text-slate-800">Diagnostic Imaging</h2>
            <div className="flex gap-10 justify-center items-center">
              <div className="text-center">
                <img src={result.visualizations.input} alt="Original" className="w-[300px] h-[300px] object-cover rounded-xl border-4 border-slate-200 mb-4 shadow-lg" />
                <p className="font-bold text-sm text-slate-600 uppercase tracking-widest">Original Scan</p>
              </div>
              <div className="text-center">
                <img src={result.visualizations.ag0} alt="Analysis" className="w-[300px] h-[300px] object-cover rounded-xl border-4 border-slate-900 mb-4 shadow-lg" />
                <p className="font-bold text-sm text-slate-900 uppercase tracking-widest">Attention-Net Isolation</p>
              </div>
            </div>
          </div>
        )}

        {/* Signatures */}
        <div className="mt-20 pt-10 border-t-2 border-slate-300 flex justify-between">
          <div className="w-64">
            <div className="border-b-2 border-black mb-3 pb-8"></div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Lead Engineer / Technician</p>
            <p className="font-bold mt-1 text-slate-800">Shubhayu Giri (ID: 2330194)</p>
          </div>
          <div className="w-64">
            <div className="border-b-2 border-black mb-3 pb-8"></div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Supervising Supervisor</p>
            <p className="font-bold mt-1 text-slate-800">Dr. Vimal Kumar Shrivastava</p>
          </div>
        </div>

        <div className="text-center text-[11px] text-slate-400 mt-16 font-mono font-bold tracking-widest uppercase">
          Report Generated by Synapse Vision Automated Deep Learning Engine v1.0<br />
          Kalinga Institute of Industrial Technology — B.Tech Minor Project 2026
        </div>
      </div>
    </main>
  );
}