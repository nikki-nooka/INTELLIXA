/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Search, 
  Compass, 
  Cpu, 
  Code2, 
  ArrowRight,
  Globe,
  BookOpen,
  Send,
  RefreshCw,
  User,
  Bot,
  HelpCircle,
  Camera,
  Check,
  Copy,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DharmaExplanation } from '../types';
import MarkdownRenderer from './MarkdownRenderer';

interface DharmaViewProps {
  prefillConcept: string;
  onClearPrefill: () => void;
  preferredLanguage: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  explanation?: DharmaExplanation;
  timestamp: string;
}

const POPULAR_CONCEPTS = [
  {
    title: 'Recursion',
    icon: Code2,
    tagline: 'Self-referential computational loops & the cycles of growth.',
    color: 'border-blue-100 hover:border-blue-400 text-blue-600 bg-blue-50/40'
  },
  {
    title: 'Photography',
    icon: Camera,
    tagline: 'Light capturing physics, optics, and computational raw pipelines.',
    color: 'border-amber-100 hover:border-amber-400 text-amber-600 bg-amber-50/40'
  },
  {
    title: 'Generative AI',
    icon: Cpu,
    tagline: 'Large language models & interactive agent loops recursively optimized.',
    color: 'border-emerald-100 hover:border-emerald-400 text-emerald-600 bg-emerald-50/40'
  },
  {
    title: 'Smart Contracts',
    icon: Globe,
    tagline: 'Decentralized consensus & self-enforcing trust in digital communities.',
    color: 'border-purple-100 hover:border-purple-400 text-purple-600 bg-purple-50/40'
  }
];

export default function DharmaView({
  prefillConcept,
  onClearPrefill,
  preferredLanguage
}: DharmaViewProps) {
  const [concept, setConcept] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeConcept, setActiveConcept] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefillConcept) {
      setConcept(prefillConcept);
      handleStartExploration(prefillConcept);
      onClearPrefill();
    }
  }, [prefillConcept]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleStartExploration = async (targetConcept: string) => {
    const term = targetConcept.trim();
    if (!term) return;

    setActiveConcept(term);
    setLoading(true);
    setError(null);

    // Initial message from user
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: 'user',
      text: `Explain ${term} in an epic, creative manner with real-life projects.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([userMsg]);

    try {
      const response = await fetch('/api/dharma/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          concept: term, 
          messages: [], 
          preferredLanguage 
        })
      });

      if (!response.ok) {
        throw new Error('Exploration contemplation failed. Please check network connection.');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMsg: ChatMessage = {
        id: Math.random().toString(),
        role: 'assistant',
        text: data.answerText,
        explanation: data,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while launching exploration.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (textToSend: string) => {
    const term = textToSend.trim();
    if (!term) return;

    setLoading(true);
    setError(null);

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: 'user',
      text: term,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Update messages local history
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);

    try {
      // Map to a simplified backend history schema
      const historyContext = updatedMessages.map(m => ({
        role: m.role,
        text: m.text
      }));

      const response = await fetch('/api/dharma/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept: term,
          messages: historyContext,
          preferredLanguage
        })
      });

      if (!response.ok) {
        throw new Error('Chatbot thinking failed. Please try again.');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMsg: ChatMessage = {
        id: Math.random().toString(),
        role: 'assistant',
        text: data.answerText,
        explanation: data,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred in conversation.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleReset = () => {
    setMessages([]);
    setActiveConcept(null);
    setConcept('');
    setError(null);
  };

  return (
    <div className="space-y-6" id="epic-explainer-wrapper">
      {/* Header Info */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">
            Conversational Learning Engine
          </span>
          <h2 className="text-2xl font-display font-bold text-slate-800 mt-2">Epic Concept Explainer Chatbot</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Explain topics with epic analogies, visual ASCII flows, and interactive real-world projects. Type or pick a concept to start!
          </p>
        </div>
        {activeConcept && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-500 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-100 rounded-xl transition-all font-semibold shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            New Topic
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!activeConcept ? (
          /* LANDING SEARCH SCREEN */
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Search Form */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleStartExploration(concept);
                }} 
                className="flex flex-col sm:flex-row gap-3"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-3.5 text-slate-400 w-5 h-5 pointer-events-none" />
                  <input
                    type="text"
                    value={concept}
                    onChange={(e) => setConcept(e.target.value)}
                    placeholder="Enter any concept (e.g., Recursion, Photography, Generative AI, Cryptography)..."
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-hidden transition-all text-slate-800 font-medium"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !concept.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-6 rounded-xl text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 shrink-0 flex items-center justify-center gap-1.5"
                >
                  Start Explaining
                  <Sparkles className="w-4 h-4 text-indigo-300 animate-pulse" />
                </button>
              </form>

              {/* Suggestions */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Or Select a Popular Topic</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {POPULAR_CONCEPTS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.title}
                        type="button"
                        onClick={() => {
                          setConcept(item.title);
                          handleStartExploration(item.title);
                        }}
                        disabled={loading}
                        className="p-5 rounded-3xl border text-left transition-all duration-300 flex flex-col justify-between gap-3 h-36 cursor-pointer border-indigo-100/60 text-indigo-600 bg-indigo-50/10 hover:border-indigo-300 hover:bg-indigo-50/20"
                      >
                        <div className="flex justify-between items-start w-full">
                          <span className="font-display font-bold text-slate-800">{item.title}</span>
                          <Icon className="w-5 h-5 shrink-0 text-indigo-500" />
                        </div>
                        <p className="text-xs text-slate-500 leading-snug line-clamp-2">{item.tagline}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* ACTIVE CHAT SCREEN */
          <motion.div
            key="chat-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col h-[650px] bg-slate-50 border border-slate-200 rounded-3xl overflow-hidden shadow-inner"
          >
            {/* Active Topic Banner */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Active Explainer Context:</span>
                <span className="text-sm font-bold text-indigo-600 font-display">{activeConcept}</span>
              </div>
              <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">
                Language: {preferredLanguage}
              </span>
            </div>

            {/* Chat History Viewport */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((msg, index) => {
                const isUser = msg.role === 'user';
                const isLastAssistant = !isUser && index === messages.length - 1;

                return (
                  <div key={msg.id} className={`flex gap-3 max-w-4xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}>
                    {/* Avatar Icon */}
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-xs ${
                      isUser ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-amber-400 border border-slate-800'
                    }`}>
                      {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4.5 h-4.5" />}
                    </div>

                    {/* Bubble Content */}
                    <div className="space-y-2 max-w-full">
                      <div className={`rounded-3xl p-5 border shadow-2xs ${
                        isUser 
                          ? 'bg-indigo-600 text-white border-indigo-500 rounded-tr-none' 
                          : 'bg-white text-slate-800 border-slate-200 rounded-tl-none'
                      }`}>
                        {/* Text Render */}
                        <div className="text-xs sm:text-sm leading-relaxed font-medium">
                          {isUser ? (
                            <div className="whitespace-pre-wrap">{msg.text}</div>
                          ) : (
                            <MarkdownRenderer text={msg.text} concept={activeConcept || msg.explanation?.realLifeProject?.title} />
                          )}
                        </div>

                        {/* Structured payload details inside assistant bubbles */}
                        {!isUser && msg.explanation && (
                          <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
                            
                            {/* ASCII Flowchart */}
                            {msg.explanation.asciiDiagram && (
                              <div className="space-y-1.5">
                                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Visual Flowchart</span>
                                <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl font-mono text-amber-400 text-xs overflow-x-auto whitespace-pre leading-normal">
                                  {msg.explanation.asciiDiagram}
                                </div>
                              </div>
                            )}

                            {/* Real-Life Project Showcase */}
                            {msg.explanation.realLifeProject && (
                              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs">
                                <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider font-mono">
                                  <Compass className="w-4 h-4 text-indigo-500 animate-pulse" />
                                  Real-Life Project Showcase
                                </div>
                                <h4 className="text-sm font-bold text-slate-800">
                                  {msg.explanation.realLifeProject.title}
                                </h4>
                                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                  {msg.explanation.realLifeProject.description}
                                </p>

                                {/* Interactive Steps Checkbox */}
                                <div className="space-y-2 mt-2">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">Step-By-Step Interactive Guide:</span>
                                  {msg.explanation.realLifeProject.steps.map((step, sIdx) => (
                                    <label key={sIdx} className="flex gap-2.5 items-start bg-white border border-slate-100 hover:border-slate-300 p-2.5 rounded-xl text-xs text-slate-600 cursor-pointer transition-all select-none font-medium">
                                      <input 
                                        type="checkbox" 
                                        className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 shrink-0" 
                                      />
                                      <span>{step}</span>
                                    </label>
                                  ))}
                                </div>

                                {/* Practical Code Block */}
                                {msg.explanation.realLifeProject.codeSnippet && (
                                  <div className="mt-3 border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                                    <div className="bg-slate-900 px-4 py-2 flex justify-between items-center border-b border-slate-800">
                                      <span className="text-[10px] font-mono text-slate-400">Implementation Algorithm</span>
                                      <button 
                                        onClick={() => handleCopyCode(msg.explanation?.realLifeProject?.codeSnippet || '', msg.id)}
                                        className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                                      >
                                        {copiedId === msg.id ? (
                                          <>
                                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                                            Copied!
                                          </>
                                        ) : (
                                          <>
                                            <Copy className="w-3.5 h-3.5" />
                                            Copy Code
                                          </>
                                        )}
                                      </button>
                                    </div>
                                    <pre className="p-4 bg-slate-950 text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed">
                                      <code>{msg.explanation.realLifeProject.codeSnippet}</code>
                                    </pre>
                                  </div>
                                )}
                              </div>
                            )}

                          </div>
                        )}
                      </div>

                      {/* Timestamp */}
                      <span className={`text-[10px] text-slate-400 font-mono ${isUser ? 'text-right block pr-1' : 'block pl-1'}`}>
                        {msg.timestamp}
                      </span>

                      {/* Recursive suggestions on last message */}
                      {isLastAssistant && msg.explanation?.recursiveFollowUps && msg.explanation.recursiveFollowUps.length > 0 && (
                        <div className="mt-2 space-y-2 max-w-xl">
                          <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Recursive Drilldown Questions:</span>
                          <div className="flex flex-col gap-1.5">
                            {msg.explanation.recursiveFollowUps.map((promptText, pIdx) => (
                              <button
                                key={pIdx}
                                onClick={() => handleSendMessage(promptText)}
                                disabled={loading}
                                className="text-left text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-white hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-200 rounded-xl px-4 py-2.5 transition-all flex justify-between items-center group cursor-pointer disabled:opacity-50"
                              >
                                <span>{promptText}</span>
                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Loading Indicator */}
              {loading && (
                <div className="flex gap-3 max-w-xl">
                  <div className="w-9 h-9 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center shrink-0 shadow-xs border border-slate-800">
                    <Bot className="w-4.5 h-4.5 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <div className="bg-white border border-slate-200 rounded-3xl rounded-tl-none p-5 text-slate-500 text-xs font-medium flex items-center gap-2 shadow-2xs">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-slate-400">Tutor is compiling details...</span>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs flex gap-2 items-center max-w-xl mx-auto shadow-2xs">
                  <HelpCircle className="w-4 h-4 shrink-0" />
                  <p className="font-semibold">{error}</p>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Bottom Chat Input Bar */}
            <div className="bg-white border-t border-slate-200 p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!concept.trim() || loading) return;
                  handleSendMessage(concept);
                  setConcept('');
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  placeholder="Ask a follow-up, solve recursively, or request more examples..."
                  disabled={loading}
                  className="flex-1 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-4 py-3 text-xs focus:outline-hidden text-slate-800 font-medium"
                />
                <button
                  type="submit"
                  disabled={loading || !concept.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white p-3 rounded-xl transition-all flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
