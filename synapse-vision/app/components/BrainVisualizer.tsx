"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, useGLTF } from '@react-three/drei';
import { Maximize2, Minimize2, Activity, Upload } from 'lucide-react'; 
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

function TumorCore({ visible, position }: { visible: boolean, position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 3) * 0.05);
  });
  if (!visible) return null;
  return (
    <Sphere ref={ref} args={[0.3, 32, 32]} position={position}>
      <meshStandardMaterial color="#ff0000" emissive="#dc2626" emissiveIntensity={2} toneMapped={false} />
    </Sphere>
  );
}

function AttentionMap({ visible, position }: { visible: boolean, position: [number, number, number] }) {
  if (!visible) return null;
  return (
    <Sphere args={[0.5, 32, 32]} position={position}>
      <meshStandardMaterial color="#22d3ee" emissive="#06b6d4" emissiveIntensity={2} transparent opacity={0.4} wireframe />
    </Sphere>
  );
}

function BrainMesh({ opacity = 0.3 }: { opacity?: number }) {
  const { scene } = useGLTF('/brain_model/scene.gltf');
  scene.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      (child as THREE.Mesh).material = new THREE.MeshStandardMaterial({
        color: '#0ea5e9',
        emissive: '#0284c7',
        emissiveIntensity: 1.8,
        wireframe: true,
        transparent: true,
        opacity,
      });
    }
  });
  return <primitive object={scene} scale={[2.5, 2.5, 2.5]} position={[0, 0, 0]} />;
}

function BrainStructure({ visible, opacity = 0.3 }: { visible: boolean; opacity?: number }) {
  if (!visible) return null;
  return <BrainMesh opacity={opacity} />;
}

export function BrainHero() {
  return (
    <div className="absolute inset-0 z-0" style={{ cursor: 'default' }}>
      <div className="absolute inset-0" style={{ left: '25%' }}>
        <Canvas
          camera={{ position: [0, 0, 3.8], fov: 55 }}
          gl={{ alpha: true, antialias: true }}
          style={{ background: 'transparent', width: '100%', height: '100%' }}
        >
          <ambientLight intensity={0.7} />
          <pointLight position={[5, 5, 5]} intensity={2} color="#22d3ee" />
          <pointLight position={[-3, -3, -3]} intensity={0.5} color="#818cf8" />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.6}
            minPolarAngle={Math.PI / 2.4}
            maxPolarAngle={Math.PI / 1.7}
          />
          <BrainMesh opacity={0.6} />
        </Canvas>
      </div>

      <div className="absolute inset-y-0 left-0 w-[55%] bg-gradient-to-r from-[#020510] via-[#020510]/90 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#020510] to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#020510]/70 to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#020510] to-transparent pointer-events-none" />
    </div>
  );
}

interface BrainVisualizerProps {
  coords?: number[];
  volume?: string;
  confidence?: number;
  onUploadClick?: () => void;
}

export default function BrainVisualizer({ coords, volume, confidence, onUploadClick }: BrainVisualizerProps) {
  const [showBrain, setShowBrain] = useState(true);
  const [showTumor, setShowTumor] = useState(false);
  const [showAttention, setShowAttention] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-show the tumor layers when new coords arrive from backend
  useEffect(() => {
    if (coords) {
      setShowTumor(true);
      setShowAttention(true);
    }
  }, [coords]);

  useEffect(() => {
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) setIsFullscreen(false);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const tumorPos: [number, number, number] = coords && coords.length === 3 
    ? [coords[0], coords[1], coords[2]] 
    : [0.7, 0.3, 0.6];

  return (
    <div
      ref={containerRef}
      style={{ cursor: 'default' }}
      className={`relative w-full overflow-hidden border border-white/10 bg-[#020617] transition-all duration-700 ${
        isFullscreen ? 'h-screen rounded-none' : 'h-[550px] rounded-[3rem]'
      }`}
    >
      <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.8} />
        <BrainStructure visible={showBrain} />
        {/* THE FIX IS HERE: Added 'key' props so React forces the ball to stay at the new coordinates */}
        <TumorCore key={`tumor-${tumorPos.join(',')}`} visible={showTumor} position={tumorPos} />
        <AttentionMap key={`map-${tumorPos.join(',')}`} visible={showAttention} position={tumorPos} />
      </Canvas>

      <div className="absolute top-8 left-8 flex flex-col gap-2 pointer-events-none z-50">
        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-cyan-500 bg-cyan-500/5 px-4 py-2 rounded-lg border border-cyan-500/10 w-max">
          <Activity size={14} className="animate-pulse" />
          <span>Diagnostic Active</span>
        </div>
        <div className="text-[9px] font-mono text-slate-500 ml-1">
          COORDS: {coords ? `[${coords.map(c => c.toFixed(2)).join(', ')}]` : '[-0.01, 0.30, 0.07]'} <br /> 
          VOL: <span className="text-white">{volume || '232.5cc'}</span> <br/>
          CONF: <span className="text-cyan-400">{confidence ? (confidence * 100).toFixed(1) : '94.0'}%</span>
        </div>
        
        <button 
          onClick={(e) => { e.stopPropagation(); if (onUploadClick) onUploadClick(); }}
          className="mt-3 pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-black/60 border border-white/10 hover:bg-white/10 hover:text-white transition-colors text-[9px] uppercase tracking-widest text-slate-300 w-max backdrop-blur-md"
        >
          <Upload size={12} />
          Upload Scan
        </button>
      </div>

      <div className="absolute top-8 right-8 z-[60]">
        <button onClick={toggleFullscreen} style={{ cursor: 'pointer' }}
          className="p-3 bg-black/60 hover:bg-cyan-500 hover:text-black backdrop-blur-md rounded-xl border border-white/10 transition-all text-white">
          {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>
      </div>

      <AnimatePresence>
        {isFullscreen && (
          <motion.div key="controls"
            initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-8 bg-black/90 backdrop-blur-2xl px-10 py-5 rounded-full border border-white/10 z-[60] shadow-2xl"
          >
            <label style={{ cursor: 'pointer' }} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
              <input type="checkbox" checked={showBrain} onChange={(e) => setShowBrain(e.target.checked)} className="w-4 h-4 accent-cyan-500" />
              Structure
            </label>
            <label style={{ cursor: 'pointer' }} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-400 transition-colors">
              <input type="checkbox" checked={showTumor} onChange={(e) => setShowTumor(e.target.checked)} className="w-4 h-4 accent-red-500" />
              Anomaly
            </label>
            <label style={{ cursor: 'pointer' }} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-cyan-400 transition-colors">
              <input type="checkbox" checked={showAttention} onChange={(e) => setShowAttention(e.target.checked)} className="w-4 h-4 accent-cyan-500" />
              Map
            </label>
          </motion.div>
        )}
      </AnimatePresence>

      {!isFullscreen && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[9px] uppercase tracking-[0.35em] text-slate-600 font-bold pointer-events-none whitespace-nowrap">
          Fullscreen to explore layers
        </div>
      )}
    </div>
  );
}

useGLTF.preload('/brain_model/scene.gltf');