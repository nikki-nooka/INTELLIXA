/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  Compass, 
  ShieldCheck, 
  Bot, 
  FileText, 
  Mic, 
  Radio, 
  Award, 
  ArrowRight, 
  Terminal, 
  Cpu, 
  Activity, 
  CheckCircle2, 
  Zap,
  BookOpen,
  Users,
  Clock,
  Play
} from 'lucide-react';
import { motion } from 'motion/react';

interface LandingPageViewProps {
  onSignIn: () => void;
  onJoinFree: () => void;
}

export default function LandingPageView({ onSignIn, onJoinFree }: LandingPageViewProps) {
  const [activeInteractiveTab, setActiveInteractiveTab] = useState<'roadmap' | 'sandbox' | 'podcast'>('roadmap');

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-900 flex flex-col font-sans overflow-x-hidden selection:bg-indigo-500/15 selection:text-indigo-900" id="landing-page-root">
      
      {/* 1. TOP NAV BAR */}
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between" id="landing-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold font-display shadow-lg shadow-indigo-600/10">
            <BookOpen className="w-5.5 h-5.5 text-indigo-100 animate-pulse" />
          </div>
          <div>
            <div className="text-lg font-display font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Intellexa
              <span className="bg-indigo-100 text-indigo-700 text-[9px] px-2 py-0.5 rounded-full font-mono font-bold tracking-widest uppercase border border-indigo-200">v2.0</span>
            </div>
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest block font-mono">
              Wisdom-driven career guide
            </span>
          </div>
        </div>

        {/* Action buttons styled exactly matching requested image but for light theme */}
        <div className="flex items-center gap-3">
          <button
            onClick={onSignIn}
            className="px-6 py-2.5 border border-slate-200 hover:border-indigo-500/50 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-bold font-mono tracking-wide transition-all cursor-pointer focus:outline-hidden"
            id="landing-signin-btn"
          >
            Sign In
          </button>
          
          <button
            onClick={onJoinFree}
            className="px-6 py-2.5 bg-[#4f46e5] hover:bg-[#5a52ff] active:scale-95 text-white rounded-xl text-sm font-bold font-mono tracking-wide transition-all shadow-md shadow-indigo-500/15 cursor-pointer flex items-center gap-2 border border-indigo-500/20 focus:outline-hidden"
            id="landing-joinfree-btn"
          >
            <Sparkles className="w-4 h-4 text-indigo-100" />
            Join Free
          </button>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-20 pb-16 px-6 max-w-7xl mx-auto w-full flex flex-col items-center text-center" id="landing-hero">
        {/* Dynamic ambient lights in background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/5 rounded-full filter blur-[120px] pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-emerald-500/3 rounded-full filter blur-[100px] pointer-events-none -z-10" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-xs text-indigo-700 font-mono font-semibold mb-6"
        >
          <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>Next-Generation Personalized EdTech System</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-display font-extrabold text-slate-900 tracking-tight leading-[1.1] max-w-4xl"
        >
          Master Any Career Path with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">Wisdom-Driven AI</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-base sm:text-xl text-slate-600 font-medium max-w-2xl leading-relaxed"
        >
          An immersive education ecosystem featuring dynamic syllabus generation, ethical concept debugging, real-time audio synthetic podcasts, and career-readiness scoring.
        </motion.p>

        {/* Hero Actions containing exactly the image-style action buttons with enhanced copy */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-wrap justify-center gap-4"
        >
          <button
            onClick={onJoinFree}
            className="px-8 py-4 bg-[#4f46e5] hover:bg-[#5a52ff] active:scale-95 text-white rounded-2xl text-base font-bold font-mono tracking-wide transition-all shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/30 cursor-pointer flex items-center gap-2.5 border border-indigo-400/20"
          >
            <Sparkles className="w-5 h-5 text-indigo-100" />
            Launch Dashboard Now
          </button>
          
          <button
            onClick={onSignIn}
            className="px-8 py-4 border border-slate-200 hover:border-slate-350 bg-white hover:bg-slate-50 text-slate-700 rounded-2xl text-base font-bold font-mono tracking-wide transition-all cursor-pointer flex items-center gap-2 shadow-xs"
          >
            Sign In to Profile
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </button>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-12 pt-8 border-t border-slate-200 w-full max-w-4xl flex flex-wrap justify-center items-center gap-x-12 gap-y-6 text-slate-400 font-mono text-xs font-semibold"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
            <span className="text-slate-600">GEMINI 3.5 FLASH CORES</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
            <span className="text-slate-600">ETHICAL DHARMA EVALUATOR</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
            <span className="text-slate-600">PODCAST SYNTHESIZER READY</span>
          </div>
        </motion.div>
      </section>

      {/* 3. PLATFORM CORE STATISTICS DASHBOARD */}
      <section className="bg-slate-50 border-y border-slate-200 py-12 px-6" id="landing-stats">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center p-4">
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono">14,250+</div>
            <div className="text-xs text-slate-500 mt-2 uppercase tracking-wider font-mono font-bold">Students Mentored</div>
          </div>
          <div className="text-center p-4 border-l border-slate-200">
            <div className="text-3xl sm:text-4xl font-extrabold text-indigo-600 font-mono">82,490+</div>
            <div className="text-xs text-slate-500 mt-2 uppercase tracking-wider font-mono font-bold">Syllabus Roadmaps</div>
          </div>
          <div className="text-center p-4 border-l border-slate-200">
            <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600 font-mono">250,000+</div>
            <div className="text-xs text-slate-500 mt-2 uppercase tracking-wider font-mono font-bold">Concepts Sandbox Tested</div>
          </div>
          <div className="text-center p-4 border-l border-slate-200">
            <div className="text-3xl sm:text-4xl font-extrabold text-pink-650 font-mono">4.92 / 5</div>
            <div className="text-xs text-slate-500 mt-2 uppercase tracking-wider font-mono font-bold">Approval Rating</div>
          </div>
        </div>
      </section>

      {/* 4. THE BENTO FEATURES SHOWCASE */}
      <section className="py-24 px-6 max-w-7xl mx-auto w-full" id="landing-features">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900">
            Designed for Ultimate Career Sovereignty
          </h2>
          <p className="mt-4 text-slate-500 max-w-xl mx-auto text-sm sm:text-base font-medium">
            Traditional learning is static. Intellexa dynamically crafts individual career blueprints, teaches code visually, and verifies professional maturity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Feature 1: Roadmaps */}
          <div className="p-8 bg-white border border-slate-200/80 rounded-3xl relative overflow-hidden group hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full filter blur-2xl pointer-events-none" />
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">AI Syllabus Roadmaps</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Input any target title or technologies to generate instantly structured, step-by-step custom modules with checkpoints, assignments, and tracking metrics.
            </p>
            <div className="flex items-center gap-2 text-indigo-600 text-xs font-mono font-bold">
              <span>EXPLORE ROADMAPS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Feature 2: Epic Concept Explainer & Sandbox */}
          <div className="p-8 bg-white border border-slate-200/80 rounded-3xl relative overflow-hidden group hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full filter blur-2xl pointer-events-none" />
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Epic Concept Sandbox</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Deep-dive into tech concepts with standard markdown formatting, copyable code, and inline compilers that simulate recursions, cryptographies, and REST endpoints instantly.
            </p>
            <div className="flex items-center gap-2 text-emerald-600 text-xs font-mono font-bold">
              <span>EXPLORE THE SANDBOX</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Feature 3: Doubt Chatbot */}
          <div className="p-8 bg-white border border-slate-200/80 rounded-3xl relative overflow-hidden group hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full filter blur-2xl pointer-events-none" />
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-650 flex items-center justify-center mb-6">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Real-time Doubt Companion</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Have persistent code blocks or concept questions? Chat with our smart assistant. Get beautifully formatted syntax explanations with integrated runtimes.
            </p>
            <div className="flex items-center gap-2 text-purple-650 text-xs font-mono font-bold">
              <span>CHAT WITH COMPANION</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Feature 4: Audio Podcasts Synthesizer */}
          <div className="p-8 bg-white border border-slate-200/80 rounded-3xl relative overflow-hidden group hover:border-pink-500/40 hover:shadow-lg hover:shadow-pink-500/5 transition-all duration-300 md:col-span-2">
            <div className="absolute top-0 right-0 w-48 h-48 bg-pink-500/5 rounded-full filter blur-3xl pointer-events-none" />
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div className="shrink-0 w-14 h-14 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center">
                <Radio className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">High-Fidelity Synthetic Audio Podcasts</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-4 max-w-2xl">
                  Bored of reading text? Input any topic (e.g. "Clean Architecture", "React State Hooks") and synthesize a highly engaging, fully structured audio podcast lecture. Listen in real-time with playback speed controls and live progress.
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-pink-600 text-xs font-mono font-bold">
                    <span>SYNTHESIZE SPEECH</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded border border-slate-200">STUDY ON THE GO</span>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 5: Resume Scanner */}
          <div className="p-8 bg-white border border-slate-200/80 rounded-3xl relative overflow-hidden group hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full filter blur-2xl pointer-events-none" />
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">AI Resume Critic</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Copy-paste or drag-and-drop your resume to receive rigorous analysis, targeted scoring, and actionable advice mapping you directly to your career roadmap.
            </p>
            <div className="flex items-center gap-2 text-amber-600 text-xs font-mono font-bold">
              <span>SCAN MY RESUME</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

        </div>
      </section>

      {/* 5. LIVE INTERACTIVE TEASER SNEAK-PEEK (An outstanding value-add!) */}
      <section className="py-20 px-6 bg-slate-50/50 border-t border-slate-200/85 relative" id="landing-teaser">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Col: Explainer Copy */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs text-indigo-700 font-mono font-bold uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                Interactive Preview
              </span>
              <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 leading-tight">
                Experience the Platform Interface
              </h2>
              <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
                Toggle through key sections of our visual workspace. Witness how Intellexa simplifies complex topics through beautiful interactive code sandboxes and smart guidance.
              </p>

              {/* Navigation Tabs for Sandbox Preview */}
              <div className="space-y-3 pt-4">
                <button 
                  onClick={() => setActiveInteractiveTab('roadmap')}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all cursor-pointer border text-left ${
                    activeInteractiveTab === 'roadmap' 
                      ? 'bg-white border-indigo-600 text-indigo-905 shadow-sm' 
                      : 'bg-white/40 border-slate-200/80 hover:border-slate-300 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Compass className="w-5 h-5 text-indigo-600" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-800">Dynamic Study Blueprint</h4>
                      <p className="text-xs text-slate-400">Custom modules dynamically built for you</p>
                    </div>
                  </div>
                  <ArrowRight className={`w-4 h-4 transition-transform ${activeInteractiveTab === 'roadmap' ? 'translate-x-1 text-indigo-600' : 'text-slate-400'}`} />
                </button>

                <button 
                  onClick={() => setActiveInteractiveTab('sandbox')}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all cursor-pointer border text-left ${
                    activeInteractiveTab === 'sandbox' 
                      ? 'bg-white border-emerald-600 text-emerald-905 shadow-sm' 
                      : 'bg-white/40 border-slate-200/80 hover:border-slate-300 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Cpu className="w-5 h-5 text-emerald-600" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-800">Inline Sandbox Visualizers</h4>
                      <p className="text-xs text-slate-400">Debug algorithms side-by-side</p>
                    </div>
                  </div>
                  <ArrowRight className={`w-4 h-4 transition-transform ${activeInteractiveTab === 'sandbox' ? 'translate-x-1 text-emerald-600' : 'text-slate-400'}`} />
                </button>

                <button 
                  onClick={() => setActiveInteractiveTab('podcast')}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all cursor-pointer border text-left ${
                    activeInteractiveTab === 'podcast' 
                      ? 'bg-white border-pink-600 text-pink-905 shadow-sm' 
                      : 'bg-white/40 border-slate-200/80 hover:border-slate-300 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Radio className="w-5 h-5 text-pink-600" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-800">AI Podcasts Synthesizer</h4>
                      <p className="text-xs text-slate-400">Synthetic spoken audio on any concept</p>
                    </div>
                  </div>
                  <ArrowRight className={`w-4 h-4 transition-transform ${activeInteractiveTab === 'podcast' ? 'translate-x-1 text-pink-600' : 'text-slate-400'}`} />
                </button>
              </div>
            </div>

            {/* Right Col: Live preview panel simulating actual app UI */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-xl relative min-h-[400px] overflow-hidden">
              <div className="absolute top-2 left-4 flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <div className="text-center font-mono text-xs text-slate-400 border-b border-slate-100 pb-3 mb-6">
                interactive_sandbox_view.json
              </div>

              {activeInteractiveTab === 'roadmap' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">MODULE 1</span>
                      <span className="text-[10px] text-emerald-600 font-mono font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 100 XP
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 font-display">Asymmetric Cryptography Architecture</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Understand how digital trust works through public and private key pairs.
                    </p>
                  </div>

                  <div className="bg-slate-50/40 p-4 rounded-2xl border border-slate-150/60 opacity-80">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">MODULE 2</span>
                      <span className="text-[10px] text-slate-500 font-mono font-bold">150 XP</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-600 font-display">Digital Signature Verifications</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Deep-dive into hashing functions and sign verifications on incoming packages.
                    </p>
                  </div>

                  <div className="text-center pt-2">
                    <button onClick={onJoinFree} className="px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer">
                      Create Your Custom Roadmap Now
                    </button>
                  </div>
                </div>
              )}

              {activeInteractiveTab === 'sandbox' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="bg-slate-100 px-4 py-2 flex justify-between items-center border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-[10px] font-mono text-slate-500 uppercase">recursion_factorial.js</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-600 font-semibold">interactive sandbox enabled</span>
                    </div>
                    <pre className="p-4 font-mono text-xs text-indigo-900 overflow-x-auto bg-slate-50/50">
                      {`function factorial(n) {\n  if (n <= 1) return 1; // Base case\n  return n * factorial(n - 1); // Recursive call\n}`}
                    </pre>
                  </div>

                  {/* Mock step analyzer */}
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-700">Execution Call Stack Visualizer</span>
                    </div>
                    <div className="flex flex-col gap-1.5 font-mono text-[10px] text-slate-500">
                      <div className="flex justify-between bg-white p-1.5 rounded border border-slate-150">
                        <span>factorial(3)</span>
                        <span className="text-emerald-600 font-semibold">returns 3 * factorial(2)</span>
                      </div>
                      <div className="flex justify-between bg-white p-1.5 rounded border border-slate-150">
                        <span>factorial(2)</span>
                        <span className="text-emerald-600 font-semibold">returns 2 * factorial(1)</span>
                      </div>
                      <div className="flex justify-between bg-white p-1.5 rounded border border-emerald-200 text-emerald-700 bg-emerald-50/50">
                        <span>factorial(1) [BASE CASE]</span>
                        <span className="font-bold">returns 1</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeInteractiveTab === 'podcast' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-pink-500/5 via-transparent to-transparent pointer-events-none" />
                    
                    <div className="w-16 h-16 bg-pink-50 text-pink-650 rounded-full flex items-center justify-center mx-auto mb-4 border border-pink-100">
                      <Play className="w-6 h-6 text-pink-600 fill-pink-600/10 animate-pulse" />
                    </div>

                    <h4 className="text-sm font-bold text-slate-800 font-display">EPISODE 12: Demystifying Client-Side Rendering vs Server-Side Hydrations</h4>
                    <p className="text-[10px] text-slate-500 font-mono mt-1.5">Length: 04:32 | Audio Quality: 320kbps Synthetic</p>

                    {/* Fake wave bars */}
                    <div className="flex justify-center items-center gap-1.5 my-6 h-10">
                      <span className="w-1 bg-pink-500 rounded-full animate-wave1" style={{ height: '80%' }} />
                      <span className="w-1 bg-purple-500 rounded-full animate-wave2" style={{ height: '40%' }} />
                      <span className="w-1 bg-indigo-500 rounded-full animate-wave3" style={{ height: '90%' }} />
                      <span className="w-1 bg-pink-400 rounded-full animate-wave4" style={{ height: '60%' }} />
                      <span className="w-1 bg-violet-400 rounded-full animate-wave5" style={{ height: '85%' }} />
                      <span className="w-1 bg-indigo-400 rounded-full animate-wave6" style={{ height: '30%' }} />
                      <span className="w-1 bg-pink-500 rounded-full animate-wave7" style={{ height: '70%' }} />
                    </div>

                    <button onClick={onJoinFree} className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-xs font-mono font-bold rounded-xl transition-all cursor-pointer shadow-xs border border-pink-500/20">
                      Synthesize Speech For Any Concept Now
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      </section>

      {/* 6. FINAL IMMERSIVE CALL-TO-ACTION */}
      <section className="py-24 px-6 relative text-center max-w-5xl mx-auto w-full" id="landing-cta">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#4f46e5]/5 rounded-full filter blur-[100px] pointer-events-none" />
        
        <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-slate-900">
          Begin Your Sovereign Educational Journey
        </h2>
        <p className="mt-4 text-slate-600 max-w-xl mx-auto text-sm sm:text-base font-medium">
          Get unlimited access to syllabus generators, audio synthesizers, interactive sandboxes, and ethical code grading. Sign up in under 30 seconds.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
          <button
            onClick={onJoinFree}
            className="w-full sm:w-auto px-8 py-4 bg-[#4f46e5] hover:bg-[#5a52ff] text-white rounded-2xl text-base font-bold font-mono tracking-wide transition-all shadow-lg shadow-indigo-600/10 cursor-pointer flex items-center justify-center gap-2 border border-indigo-400/20"
          >
            <Sparkles className="w-5 h-5 text-indigo-100" />
            Get Started For Free
          </button>
          
          <button
            onClick={onSignIn}
            className="w-full sm:w-auto px-8 py-4 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-2xl text-base font-bold font-mono tracking-wide transition-all cursor-pointer shadow-xs"
          >
            Already Have A Student Profile?
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white px-6 py-10 mt-auto text-center text-slate-500 font-mono text-xs">
        <p>© {new Date().getFullYear()} Intellexa. Developed for maximum career sovereignty.</p>
        <p className="mt-2 text-[10px] text-slate-400">
          Powered by Gemini 3.5 Flash Core Orchestrations. Fully compliant with Dharma guidelines.
        </p>
      </footer>

    </div>
  );
}
