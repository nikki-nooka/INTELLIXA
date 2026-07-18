/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Copy, Check, Terminal, Cpu } from 'lucide-react';
import InteractiveSimulator from './InteractiveSimulator';

interface MarkdownRendererProps {
  text: string;
  concept?: string;
}

// Inline formatting helper function
export function parseInline(text: string): React.ReactNode[] {
  if (!text) return [];

  // Split content by inline code marks first
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      const cleanCode = part.slice(1, -1);
      return (
        <code key={i} className="bg-indigo-950/10 border border-indigo-200/50 text-indigo-700 px-1.5 py-0.5 rounded font-mono text-xs font-semibold">
          {cleanCode}
        </code>
      );
    }
    
    // Parse bold text splits
    const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
    return (
      <span key={i}>
        {boldParts.map((subPart, j) => {
          if (subPart.startsWith('**') && subPart.endsWith('**')) {
            return (
              <strong key={j} className="font-extrabold text-slate-900 bg-indigo-50/50 px-1 rounded-sm">
                {subPart.slice(2, -2)}
              </strong>
            );
          }
          // Parse italic text splits
          const italicParts = subPart.split(/(\*[^*]+\*)/g);
          return (
            <span key={j}>
              {italicParts.map((item, k) => {
                if (item.startsWith('*') && item.endsWith('*')) {
                  return <em key={k} className="italic text-slate-800">{item.slice(1, -1)}</em>;
                }
                return item;
              })}
            </span>
          );
        })}
      </span>
    );
  });
}

export default function MarkdownRenderer({ text, concept }: MarkdownRendererProps) {
  if (!text) return null;

  // Split content by triple backticks for code blocks
  const segments = text.split('```');

  return (
    <div className="space-y-3 font-sans leading-relaxed text-slate-700">
      {segments.map((segment, index) => {
        const isCodeBlock = index % 2 === 1;

        if (isCodeBlock) {
          // Parse language and code
          const lines = segment.split('\n');
          const firstLine = lines[0].trim();
          const language = /^[a-zA-Z0-9+#-]+$/.test(firstLine) ? firstLine : '';
          const code = language ? lines.slice(1).join('\n').trim() : segment.trim();

          return (
            <CodeBlockWithInteractive 
              key={index} 
              code={code} 
              language={language || 'code'} 
              concept={concept}
            />
          );
        }

        // Standard text segment: split into lines and parse structural elements
        const textLines = segment.split('\n');
        return (
          <div key={index} className="space-y-1.5">
            {textLines.map((line, lIdx) => {
              const trimmed = line.trim();

              if (!trimmed) {
                return <div key={lIdx} className="h-2" />;
              }

              // Horizontal rule
              if (trimmed === '---' || trimmed === '***') {
                return <hr key={lIdx} className="border-t border-slate-200/80 my-4" />;
              }

              // Headings
              if (trimmed.startsWith('### ')) {
                return (
                  <h4 key={lIdx} className="text-sm sm:text-base font-bold text-slate-900 mt-4 mb-2 flex items-center gap-1.5 border-b border-slate-100 pb-1 font-display">
                    {parseInline(trimmed.substring(4))}
                  </h4>
                );
              }
              if (trimmed.startsWith('## ')) {
                return (
                  <h3 key={lIdx} className="text-base sm:text-lg font-bold text-slate-900 mt-5 mb-2.5 font-display">
                    {parseInline(trimmed.substring(3))}
                  </h3>
                );
              }
              if (trimmed.startsWith('# ')) {
                return (
                  <h2 key={lIdx} className="text-lg sm:text-xl font-extrabold text-indigo-950 mt-6 mb-3 font-display">
                    {parseInline(trimmed.substring(2))}
                  </h2>
                );
              }

              // Blockquotes
              if (trimmed.startsWith('> ')) {
                return (
                  <blockquote key={lIdx} className="border-l-4 border-indigo-400 bg-indigo-50/10 px-4 py-2.5 my-3 rounded-r-xl text-slate-600 italic text-xs sm:text-sm">
                    {parseInline(trimmed.substring(2))}
                  </blockquote>
                );
              }

              // Bullet lists
              if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
                return (
                  <div key={lIdx} className="flex items-start gap-2.5 text-slate-700 py-1 pl-1 text-xs sm:text-sm">
                    <span className="text-indigo-500 font-extrabold select-none shrink-0 mt-0.5">•</span>
                    <span className="flex-1 font-medium">{parseInline(trimmed.substring(2))}</span>
                  </div>
                );
              }

              // Numbered lists
              const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
              if (numMatch) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 text-slate-700 py-1 pl-1 text-xs sm:text-sm">
                    <span className="text-indigo-600 font-bold font-mono select-none shrink-0 text-xs mt-0.5">
                      {numMatch[1]}.
                    </span>
                    <span className="flex-1 font-medium">{parseInline(numMatch[2])}</span>
                  </div>
                );
              }

              // Normal text line
              return (
                <p key={lIdx} className="text-slate-600 leading-relaxed text-xs sm:text-sm font-medium">
                  {parseInline(line)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// Subcomponent that manages code snippet display and side-by-side interactive compiler
function CodeBlockWithInteractive({ code, language, concept }: { code: string; language: string; concept?: string; key?: number | string }) {
  const [copied, setCopied] = useState(false);
  const [showInteractive, setShowInteractive] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lowercaseConcept = concept?.toLowerCase() || '';
  const eligibleSimulator = 
    lowercaseConcept.includes('recursion') || 
    lowercaseConcept.includes('factorial') || 
    lowercaseConcept.includes('fibonacci') ||
    lowercaseConcept.includes('big o') ||
    lowercaseConcept.includes('closure') ||
    lowercaseConcept.includes('asymmetric') ||
    lowercaseConcept.includes('encryption') ||
    lowercaseConcept.includes('cryptography') ||
    lowercaseConcept.includes('rest') ||
    lowercaseConcept.includes('graphql') ||
    // Simple doubt chat triggers
    lowercaseConcept.includes('chatbot') ||
    lowercaseConcept.includes('explain') ||
    lowercaseConcept.includes('doubt');

  return (
    <div className="my-4 border border-slate-200/90 rounded-2xl overflow-hidden bg-slate-950 shadow-md">
      {/* Code Header bar */}
      <div className="bg-slate-900/95 px-4 py-2.5 flex justify-between items-center border-b border-slate-850">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-slate-400" />
          <span className="text-[10px] sm:text-xs font-mono text-slate-300 font-semibold uppercase">{language}</span>
        </div>
        <div className="flex items-center gap-2">
          {eligibleSimulator && (
            <button
              onClick={() => setShowInteractive(!showInteractive)}
              className={`text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                showInteractive 
                  ? 'bg-indigo-600 text-white shadow-xs' 
                  : 'bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              {showInteractive ? 'Hide Visualizer' : 'Interactive Sandbox'}
            </button>
          )}
          <button 
            onClick={handleCopy}
            className="text-[10px] sm:text-xs font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer bg-slate-800/50 hover:bg-slate-800 px-2.5 py-1.5 rounded-lg"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Embedded interactive sandbox or raw code pre block */}
      {!showInteractive ? (
        <pre className="p-4 text-slate-100 text-xs sm:text-sm font-mono overflow-x-auto leading-relaxed select-text scrollbar-thin">
          <code>{code}</code>
        </pre>
      ) : (
        <div className="bg-slate-900 border-t border-slate-800 p-4">
          <InteractiveSimulator concept={concept || 'Recursion'} codeSnippet={code} onClose={() => setShowInteractive(false)} />
        </div>
      )}
    </div>
  );
}
