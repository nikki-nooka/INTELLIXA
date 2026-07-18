/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Sparkles, Terminal } from 'lucide-react';

interface IntroAnimationViewProps {
  onComplete: () => void;
}

const BOOT_STAGES = [
  'Initializing Neural Learning Core...',
  'Compiling Career Blueprint Vectors...',
  'Structuring Epic Concept Explainer...',
  'Orchestrating Dharma Ethics Engine...',
  'Synchronizing Synthesizers...',
  'System Active. Welcome to Intellexa'
];

export default function IntroAnimationView({ onComplete }: IntroAnimationViewProps) {
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Stage updates
    const stageInterval = setInterval(() => {
      setStageIndex((prev) => {
        if (prev < BOOT_STAGES.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 450);

    // Smooth continuous progress bar loader
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => {
            onComplete();
          }, 350);
          return 100;
        }
        return prev + 2;
      });
    }, 40);

    return () => {
      clearInterval(stageInterval);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-[#070b19] flex flex-col items-center justify-center text-slate-100 z-50 overflow-hidden font-sans select-none" id="intro-animation-screen">
      
      {/* Background cyber grid effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-600/15 rounded-full filter blur-[100px] pointer-events-none" />

      <div className="relative flex flex-col items-center text-center max-w-sm w-full px-6 space-y-8">
        
        {/* Pulsating emblem with orbit rings */}
        <div className="relative">
          {/* Animated pulsing orbit rings */}
          <motion.div
            animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full bg-indigo-500/20 filter blur-md -m-4"
          />
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0.4, 0.1] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: 0.3 }}
            className="absolute inset-0 rounded-full bg-purple-500/15 filter blur-lg -m-8"
          />

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative w-20 h-20 rounded-3xl bg-indigo-600 text-white flex items-center justify-center font-bold font-display shadow-2xl shadow-indigo-500/40 border border-indigo-400/30"
          >
            <BookOpen className="w-10 h-10 text-indigo-100 animate-pulse" />
          </motion.div>
        </div>

        {/* Text Title with spacing */}
        <div className="space-y-2">
          <motion.h1
            initial={{ opacity: 0, letterSpacing: '0.2em', y: 10 }}
            animate={{ opacity: 1, letterSpacing: '0.4em', y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-2xl sm:text-3xl font-display font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-indigo-100"
          >
            INTELLEXA
          </motion.h1>
          
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-[0.2em]"
          >
            Sovereign Educational System
          </motion.span>
        </div>

        {/* Console Loader Status Stage */}
        <div className="w-full space-y-4 pt-4">
          
          {/* Simulated progress numeric percentage */}
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
            <span className="flex items-center gap-1.5 font-bold">
              <Terminal className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
              STATUS: BOOT_STAGE
            </span>
            <span className="text-indigo-400 font-extrabold">{progress}%</span>
          </div>

          {/* Progress bar track */}
          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden p-[2px] border border-slate-800/80">
            <motion.div
              style={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
            />
          </div>

          {/* Stage description string text */}
          <AnimatePresence mode="wait">
            <motion.p
              key={stageIndex}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="text-xs font-mono text-indigo-300/80 font-semibold"
            >
              {BOOT_STAGES[stageIndex]}
            </motion.p>
          </AnimatePresence>

        </div>

      </div>

    </div>
  );
}
