/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Compass, 
  Clock, 
  Layers, 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  HelpCircle, 
  Mic, 
  RotateCcw,
  ArrowRight,
  PlusCircle,
  Lightbulb,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Roadmap, Module } from '../types';

interface RoadmapViewProps {
  currentRoadmap: Roadmap | null;
  onGenerateRoadmap: (career: string, difficulty: string) => Promise<void>;
  onToggleModuleStatus: (moduleId: string, newStatus: 'not_started' | 'in_progress' | 'completed') => void;
  onQuickAction: (tab: string, prefillData: string) => void;
  preferredLanguage: string;
}

const CAREER_SUGGESTIONS = [
  'Full-Stack Software Developer',
  'Data Scientist & Analytics Engineer',
  'Applied Machine Learning / AI Engineer',
  'Cybersecurity Analyst & Ethical Hacker',
  'Cloud Systems Architect',
  'Product Manager',
  'UI/UX Product Designer'
];

export default function RoadmapView({
  currentRoadmap,
  onGenerateRoadmap,
  onToggleModuleStatus,
  onQuickAction,
  preferredLanguage
}: RoadmapViewProps) {
  const [selectedCareer, setSelectedCareer] = useState('');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [generationSteps, setGenerationSteps] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const career = selectedCareer.trim();
    if (!career) return;

    setIsGenerating(true);
    setErrorMsg(null);
    setGenerationSteps('Analyzing career requirements...');
    
    // Simulate beautiful progressive advisor messages
    const timers = [
      setTimeout(() => setGenerationSteps('Structuring sequential study modules...'), 1200),
      setTimeout(() => setGenerationSteps('Adding core topic breakdowns and topic clusters...'), 2400),
      setTimeout(() => setGenerationSteps('Weaving ethical wisdom & Dharma perspectives into technical domains...'), 3600),
    ];

    try {
      await onGenerateRoadmap(career, difficulty);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to connect to AI study planner. Please try again.');
    } finally {
      timers.forEach(t => clearTimeout(t));
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6" id="roadmap-container">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-800">Your AI Learning Roadmap</h2>
          <p className="text-xs sm:text-sm text-slate-400">Step-by-step career path optimized by AI for technical & ethical mastery</p>
        </div>
        {currentRoadmap && (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="text-xs font-semibold bg-white hover:bg-slate-50 text-slate-600 px-3 py-2 rounded-xl flex items-center gap-1.5 border border-slate-200 shadow-2xs transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-indigo-500" />
            Reset & New Roadmap
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isGenerating ? (
          /* Generate Loading State */
          <motion.div
            key="generating"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white rounded-3xl p-12 border border-slate-200 shadow-xs text-center max-w-xl mx-auto space-y-6"
            id="loading-roadmap-state"
          >
            <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-100 animate-pulse" />
              <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
                <Compass className="w-8 h-8 animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-800 font-display">Crafting Your Path</h3>
              <p className="text-sm font-mono text-indigo-600 bg-indigo-50 py-1.5 px-4 rounded-full inline-block font-semibold">
                {generationSteps}
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Our AI Agent is tailoring a specific engineering sequence combined with crucial societal, ethical, and practical reflections (Dharma).
              </p>
            </div>
          </motion.div>
        ) : !currentRoadmap ? (
          /* Input Selection Form */
          <motion.div
            key="selection-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs max-w-2xl mx-auto"
            id="roadmap-setup-card"
          >
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-slate-800 text-lg">Define Career Vision</h3>
                <p className="text-xs text-slate-400">Input your objective to generate a highly structured modular timeline</p>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs sm:text-sm flex gap-3 items-center shadow-2xs animate-fade-in">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
                <p className="font-semibold">{errorMsg}</p>
              </div>
            )}

            <form onSubmit={handleGenerate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Target Career Goal</label>
                <div className="relative">
                  <input
                    type="text"
                    value={selectedCareer}
                    onChange={(e) => setSelectedCareer(e.target.value)}
                    placeholder="e.g., Senior Full-Stack Cloud Engineer"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm focus:outline-hidden transition-all font-medium text-slate-800"
                    required
                  />
                </div>
                
                {/* Suggestions Pills */}
                <div className="space-y-1.5 mt-2">
                  <span className="text-[10px] text-slate-400 font-semibold block">Quick Suggestions:</span>
                  <div className="flex flex-wrap gap-2">
                    {CAREER_SUGGESTIONS.map((career) => (
                      <button
                        key={career}
                        type="button"
                        onClick={() => setSelectedCareer(career)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-all text-left cursor-pointer ${
                          selectedCareer === career 
                            ? 'bg-indigo-600 border-indigo-600 text-white font-semibold shadow-xs' 
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {career}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Experience level */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block">Current Experience Level</label>
                <div className="grid grid-cols-3 gap-3">
                  {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setDifficulty(level)}
                      className={`py-3 rounded-xl border text-xs font-bold transition-all uppercase tracking-wider cursor-pointer ${
                        difficulty === level
                          ? 'bg-slate-900 border-slate-900 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={!selectedCareer.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl text-sm font-bold tracking-wide uppercase transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Generate Personalized Learning Roadmap
                <Sparkles className="w-4 h-4 text-indigo-300" />
              </button>
            </form>
          </motion.div>
        ) : (
          /* Loaded Roadmap Details & Timeline */
          <motion.div
            key="timeline"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            id="roadmap-timeline-view"
          >
            {/* Left Column: Summary and Badges */}
            <div className="space-y-6 lg:col-span-1">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-display font-bold text-slate-800 text-lg leading-tight">{currentRoadmap.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{currentRoadmap.description}</p>
                
                <div className="border-t border-slate-100 pt-4 space-y-3 font-mono text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Target Career:</span>
                    <span className="font-bold text-slate-800 text-right">{currentRoadmap.careerGoal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Est. Duration:</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {currentRoadmap.duration}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current Level:</span>
                    <span className="font-bold text-slate-800 uppercase tracking-wide">{currentRoadmap.difficulty}</span>
                  </div>
                </div>
              </div>

              {/* Wisdom Spotlight */}
              <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 text-white space-y-3 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <Lightbulb className="w-32 h-32 text-indigo-400" />
                </div>
                <div className="flex gap-2 items-center text-indigo-400 font-semibold text-xs uppercase tracking-wider font-display">
                  <Sparkles className="w-4 h-4" />
                  Dharma Learning Philosophy
                </div>
                <h4 className="font-display font-semibold text-slate-100 text-sm md:text-base leading-snug">
                  Why include "Ethical Wisdom"?
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  In modern tech, code impacts billions. AI algorithms reinforce bias, databases store sensitive identities, and networks consume immense power. Developing tech without Dharma (responsibility and societal ethics) causes collective harm. Each module prompts you to integrate moral integrity directly with technical craft.
                </p>
              </div>
            </div>

            {/* Right Column: Interactive Modules Timeline */}
            <div className="lg:col-span-2 space-y-6">
              <h3 className="font-display font-bold text-lg text-slate-800 flex items-center gap-2 px-1">
                <Layers className="w-5 h-5 text-indigo-500" />
                Sequential Roadmap Modules ({currentRoadmap.modules.length})
              </h3>

              <div className="space-y-6 relative pl-4 sm:pl-6 border-l-2 border-slate-200">
                {currentRoadmap.modules.map((mod, idx) => {
                  const isActive = activeModuleId === mod.id;
                  const isCompleted = mod.status === 'completed';
                  const isInProgress = mod.status === 'in_progress';

                  return (
                    <div key={mod.id} className="relative pb-2" id={`timeline-node-${mod.id}`}>
                      {/* Interactive Timeline Node Bullet */}
                      <button
                        onClick={() => {
                          const nextStatus = isCompleted 
                            ? 'not_started' 
                            : isInProgress 
                              ? 'completed' 
                              : 'in_progress';
                          onToggleModuleStatus(mod.id, nextStatus);
                        }}
                        className={`absolute -left-10 sm:-left-12 top-2.5 w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer border-2 bg-white ${
                          isCompleted
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                            : isInProgress
                              ? 'border-amber-500 text-amber-500 animate-pulse'
                              : 'border-slate-300 text-slate-400'
                        }`}
                        title="Click to toggle status (Not Started -> In Progress -> Completed)"
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <span className="text-[10px] font-bold font-mono">{idx + 1}</span>
                        )}
                      </button>

                      {/* Timeline Node Card */}
                      <div className={`bg-white rounded-3xl border transition-all overflow-hidden ${
                        isActive 
                          ? 'border-indigo-500 shadow-md ring-1 ring-indigo-500/10' 
                          : 'border-slate-200 hover:border-slate-300 shadow-2xs'
                      }`}>
                        {/* Card Header */}
                        <div 
                          onClick={() => setActiveModuleId(isActive ? null : mod.id)}
                          className="p-5 flex justify-between items-start gap-4 cursor-pointer select-none"
                        >
                          <div className="space-y-1.5 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-xs text-slate-400 font-semibold">MODULE {idx + 1}</span>
                              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg ${
                                isCompleted
                                  ? 'bg-indigo-100 text-indigo-800'
                                  : isInProgress
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-slate-100 text-slate-600'
                              }`}>
                                {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Not Started'}
                              </span>
                              <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                                <Clock className="w-3 h-3" /> {mod.duration}
                              </span>
                            </div>
                            <h4 className="font-display font-bold text-slate-800 md:text-lg">{mod.title}</h4>
                          </div>
                          
                          {/* Chevron toggler placeholder */}
                          <div className="text-xs font-semibold text-slate-400 mt-1">
                            {isActive ? 'Collapse' : 'Expand Details'}
                          </div>
                        </div>

                        {/* Collapsible Details Content */}
                        {isActive && (
                          <div className="px-5 pb-5 pt-1 border-t border-slate-100 bg-slate-50/50 space-y-5">
                            {/* Target Role & Level */}
                            {mod.targetRole && (
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-wide text-indigo-600 block">Target Role Alignment</span>
                                <p className="text-xs font-semibold text-indigo-950 bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100/40 flex items-center gap-2">
                                  <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                  {mod.targetRole}
                                </p>
                              </div>
                            )}

                            {/* Module Description */}
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400 block">Overview</span>
                              <p className="text-xs text-slate-600 leading-relaxed">{mod.description}</p>
                            </div>

                            {/* Core Topics breakdown */}
                            <div className="space-y-1.5">
                              <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400 block">Topics Checklist</span>
                              <div className="flex flex-wrap gap-1.5">
                                {mod.topics.map((topic) => (
                                  <span key={topic} className="bg-white border border-slate-200 hover:border-slate-300 transition-colors text-slate-700 text-xs px-2.5 py-1 rounded-lg font-mono font-medium shadow-3xs flex items-center gap-1">
                                    <BookOpen className="w-3 h-3 text-slate-400" />
                                    {topic}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Suitable YouTube recommended videos */}
                            {mod.youtubeVideos && mod.youtubeVideos.length > 0 && (
                              <div className="space-y-2">
                                <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400 block">Recommended Videos</span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {mod.youtubeVideos.map((video, vIdx) => (
                                    <a
                                      key={vIdx}
                                      href={video.url}
                                      target="_blank"
                                      referrerPolicy="no-referrer"
                                      rel="noopener noreferrer"
                                      className="p-3 bg-white border border-slate-200 hover:border-indigo-400 rounded-xl shadow-3xs flex flex-col justify-between hover:shadow-xs transition-all text-left"
                                    >
                                      <div className="flex items-start gap-2">
                                        <div className="p-1.5 bg-red-50 text-red-600 rounded-lg shrink-0 mt-0.5">
                                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                            <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.002 3.002 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                          </svg>
                                        </div>
                                        <div>
                                          <h5 className="text-xs font-bold text-slate-700 line-clamp-2 leading-snug">{video.title}</h5>
                                          <span className="text-[10px] font-mono text-slate-400 mt-1 block">Duration: {video.duration}</span>
                                        </div>
                                      </div>
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* LeetCode Practice Problems */}
                            {mod.leetcodeProblems && mod.leetcodeProblems.length > 0 && (
                              <div className="space-y-2">
                                <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400 block">Practice Problems (LeetCode)</span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {mod.leetcodeProblems.map((prob, pIdx) => (
                                    <a
                                      key={pIdx}
                                      href={prob.url}
                                      target="_blank"
                                      referrerPolicy="no-referrer"
                                      rel="noopener noreferrer"
                                      className="p-3 bg-white border border-slate-200 hover:border-amber-400 rounded-xl shadow-3xs flex items-center justify-between hover:shadow-xs transition-all text-left"
                                    >
                                      <div className="flex items-center gap-2 overflow-hidden">
                                        <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg shrink-0">
                                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                            <path d="M13.483 0a1.374 1.374 0 0 0-.961.414l-9.777 9.778a1.38 1.38 0 0 0-.414.96c0 .376.156.714.414.968l6.235 6.235a1.372 1.372 0 0 0 .96.415c.376 0 .717-.156.975-.414l9.778-9.777a1.378 1.378 0 0 0 .414-.961 1.373 1.373 0 0 0-.414-.96l-6.235-6.235A1.37 1.37 0 0 0 13.483 0zm.01 2.215l5.228 5.23-8.818 8.82-5.23-5.23 8.82-8.82zM1.38 13.483a1.376 1.376 0 0 0-.961.414 1.373 1.373 0 0 0-.414.96c0 .376.156.717.414.975l6.235 6.235c.25.25.599.414.968.414a1.37 1.37 0 0 0 .96-.414l9.777-9.778c.258-.258.414-.599.414-.968a1.378 1.378 0 0 0-.414-.96l-5.23-5.23a1.374 1.374 0 0 0-.96-.415 1.37 1.37 0 0 0-.96.414l-8.82 8.82-1.02-1.02 8.82-8.82a1.37 1.37 0 0 0-.96-.414z"/>
                                          </svg>
                                        </div>
                                        <div className="overflow-hidden">
                                          <h5 className="text-xs font-bold text-slate-700 truncate">{prob.title}</h5>
                                          <span className="text-[9px] font-mono text-slate-400">LeetCode Practice</span>
                                        </div>
                                      </div>
                                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                        prob.difficulty === 'Easy' 
                                          ? 'bg-emerald-100 text-emerald-800' 
                                          : prob.difficulty === 'Medium' 
                                            ? 'bg-amber-100 text-amber-800' 
                                            : 'bg-rose-100 text-rose-800'
                                      }`}>
                                        {prob.difficulty}
                                      </span>
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Curated Content */}
                            {mod.curatedContent && mod.curatedContent.length > 0 && (
                              <div className="space-y-2">
                                <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400 block">Frequently Asked Interview Prep</span>
                                <div className="space-y-2">
                                  {mod.curatedContent.map((item, qIdx) => (
                                    <div key={qIdx} className="bg-slate-100/60 p-3 rounded-xl border border-slate-200/40 text-xs text-slate-700 flex gap-2.5 items-start">
                                      <span className="font-bold text-indigo-600 font-mono shrink-0">Q{qIdx + 1}:</span>
                                      <p className="font-medium leading-relaxed">{item}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Where & Why Used in Company */}
                            {mod.industryUseCases && mod.industryUseCases.length > 0 && (
                              <div className="space-y-2">
                                <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400 block">Industry Use-Cases & Decoupling</span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {mod.industryUseCases.map((usecase, uIdx) => (
                                    <div key={uIdx} className="p-3.5 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/40 text-white rounded-2xl space-y-1.5 shadow-2xs">
                                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-400 uppercase tracking-wider font-mono">
                                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        {usecase.company} Production
                                      </div>
                                      <h5 className="text-xs font-semibold text-slate-100 leading-snug">{usecase.useCase}</h5>
                                      <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                                        <strong className="text-emerald-300 font-mono">Why:</strong> {usecase.justification}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Wisdom Tip Box */}
                            <div className="bg-indigo-50/70 border border-indigo-100/50 rounded-2xl p-4 space-y-1.5">
                              <div className="flex items-center gap-1.5 text-indigo-700 font-semibold text-xs uppercase tracking-wider font-display">
                                <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                                Dharma Wisdom Reflection
                              </div>
                              <p className="text-xs text-slate-600 leading-relaxed italic">
                                "{mod.ethicalWisdom}"
                              </p>
                            </div>

                            {/* Actions bar */}
                            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100">
                              <div className="flex flex-wrap gap-2">
                                <button
                                  onClick={() => onQuickAction('dharma', mod.topics[0] || mod.title)}
                                  className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                                >
                                  <Lightbulb className="w-3.5 h-3.5 text-indigo-500" />
                                  Dharma Explain Concepts
                                </button>
                                <button
                                  onClick={() => onQuickAction('podcast', mod.topics[0] || mod.title)}
                                  className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                                >
                                  <Mic className="w-3.5 h-3.5 text-indigo-500" />
                                  Generate Podcast
                                </button>
                              </div>

                              {/* Completed trigger button */}
                              <button
                                onClick={() => {
                                  onToggleModuleStatus(mod.id, isCompleted ? 'in_progress' : 'completed');
                                }}
                                className={`text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
                                  isCompleted
                                    ? 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white font-semibold'
                                }`}
                              >
                                {isCompleted ? 'Mark as In Progress' : 'Mark Module Completed'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50" id="reset-confirm-modal">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-xl space-y-4"
            >
              <div className="flex gap-3 items-start">
                <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
                  <RotateCcw className="w-6 h-6 text-red-600 animate-spin" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-slate-800 text-lg">Reset Roadmap?</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">
                    Are you sure you want to regenerate and replace your current roadmap? Your completion statuses and study records will be reset.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  id="btn-cancel-reset"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowResetConfirm(false);
                    if (currentRoadmap) {
                      setSelectedCareer(currentRoadmap.careerGoal);
                    }
                    onGenerateRoadmap('', ''); // Clear in parent
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  id="btn-confirm-reset"
                >
                  Reset Path
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
