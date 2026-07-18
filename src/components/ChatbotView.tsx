/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Trash2, 
  Bot, 
  User, 
  HelpCircle, 
  Sparkles,
  RefreshCw,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatHistoryItem } from '../types';
import MarkdownRenderer from './MarkdownRenderer';

interface ChatbotViewProps {
  chatHistory: ChatHistoryItem[];
  onSendMessage: (question: string) => Promise<void>;
  onClearHistory: () => void;
  preferredLanguage: string;
}

const PRESET_DOUBTS = [
  'What is Big O Notation & how is it measured?',
  'Explain JavaScript Closures in simple terms',
  'What is the difference between REST and GraphQL?',
  'Explain how Asymmetric Encryption works',
  'What are standard HTTP status codes and headers?'
];

export default function ChatbotView({
  chatHistory,
  onSendMessage,
  onClearHistory,
  preferredLanguage
}: ChatbotViewProps) {
  const [question, setQuestion] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat to bottom when history changes
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = question.trim();
    if (!query || sending) return;

    setQuestion('');
    setSending(true);
    try {
      await onSendMessage(query);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handlePresetClick = async (preset: string) => {
    if (sending) return;
    setSending(true);
    try {
      await onSendMessage(preset);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-220px)] min-h-[550px]" id="chatbot-view-container">
      {/* Left Column: Preset doubts and help info */}
      <div className="lg:col-span-1 space-y-6 flex flex-col h-full" id="chatbot-info-sidebar">
        {/* Help Panel */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex gap-2 items-center text-indigo-600 font-semibold text-xs uppercase tracking-wider font-display">
            <Bot className="w-4 h-4" />
            AI doubt solver tutor
          </div>
          <h3 className="font-display font-bold text-slate-800">Your 24/7 Academic Mentor</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Stuck on a homework problem, coding error, or system design trade-off? Ask your AI Tutor to explain complex topics, review logic, or provide code samples.
          </p>
          <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs text-slate-500">
            <Globe className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>Answering in: <strong>{preferredLanguage}</strong></span>
          </div>
        </div>

        {/* Presets list */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex-1 overflow-y-auto space-y-3">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Common Doubt Starters</h4>
          <div className="space-y-2">
            {PRESET_DOUBTS.map((preset) => (
              <button
                key={preset}
                onClick={() => handlePresetClick(preset)}
                disabled={sending}
                className="w-full text-left bg-slate-50 hover:bg-indigo-50/80 hover:text-indigo-900 text-slate-700 p-3 rounded-xl text-xs font-medium border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer leading-relaxed block"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Active Interactive Chat Box */}
      <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col h-full overflow-hidden" id="chatbot-chat-box">
        {/* Chat Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-indigo-600 text-slate-900 flex items-center justify-center font-bold">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Chat Doubt Assistant</h4>
              <p className="text-[10px] text-slate-400">Contextual learning model active</p>
            </div>
          </div>
          {chatHistory.length > 0 && (
            <button
              onClick={onClearHistory}
              className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1.5 transition-colors cursor-pointer font-semibold"
              title="Clear entire discussion history"
            >
              <Trash2 className="w-4 h-4" />
              Clear Chat
            </button>
          )}
        </div>

        {/* Chat History Messages list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin bg-slate-50/30">
          {chatHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3 max-w-sm mx-auto text-center">
              <div className="p-4 bg-indigo-50 text-indigo-500 rounded-full">
                <Bot className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-slate-700 text-sm">Ask a Doubt</h4>
                <p className="text-xs text-slate-500 leading-relaxed mt-1">
                  Type your academic or technical question below, or select a doubt starter to begin your lesson.
                </p>
              </div>
            </div>
          ) : (
            chatHistory.map((msg) => {
              const isAI = msg.role === 'model';
              return (
                <div 
                  key={msg.id} 
                  className={`flex gap-3 max-w-[85%] ${isAI ? 'self-start' : 'self-end flex-row-reverse ml-auto'}`}
                >
                  <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${
                    isAI ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-white'
                  }`}>
                    {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div className={`p-4 rounded-2xl shadow-3xs text-xs sm:text-sm leading-relaxed ${
                    isAI ? 'bg-white border border-slate-200 text-slate-800 hover:border-slate-300 transition-all' : 'bg-slate-900 text-white'
                  }`}>
                    {isAI ? (
                      <MarkdownRenderer text={msg.text} concept={msg.text} />
                    ) : (
                      <div className="whitespace-pre-wrap font-sans">{msg.text}</div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          {sending && (
            <div className="flex gap-3 max-w-[85%] self-start" id="chat-loading-dots">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-3xs flex items-center gap-1">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Chat Input form */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-slate-100 flex gap-2 bg-white" id="chatbot-input-form">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your academic question, homework doubt, or conceptual inquiry..."
            className="flex-1 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm focus:outline-hidden font-medium text-slate-800"
            disabled={sending}
            required
          />
          <button
            type="submit"
            disabled={sending || !question.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl transition-all flex items-center justify-center cursor-pointer disabled:opacity-40 shrink-0 animate-fade-in"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
}
