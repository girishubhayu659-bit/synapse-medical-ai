"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function LaserScanner() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[15] overflow-hidden">
      {/* Sci-Fi Vertical Scanning Laser Line */}
      <motion.div
        initial={{ y: '-10%' }}
        animate={{ y: ['0%', '1000%', '0%'] }}
        transition={{ duration: 18, ease: 'linear', repeat: Infinity }}
        className="w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-40 shadow-[0_0_15px_rgba(34,211,238,0.8)] relative"
      >
        <div className="absolute inset-x-0 -top-6 h-12 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent" />
      </motion.div>

      {/* Sci-Fi Corner HUD Brackets */}
      <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-cyan-500/30 pointer-events-none" />
      <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-cyan-500/30 pointer-events-none" />
      <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-cyan-500/30 pointer-events-none" />
      <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-cyan-500/30 pointer-events-none" />
    </div>
  );
}
