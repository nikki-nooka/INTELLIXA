/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  ChevronRight, 
  ArrowRight,
  RefreshCw,
  HelpCircle,
  Briefcase,
  Copy,
  Check,
  Info,
  FileCode,
  ArrowDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ResumeAnalysis } from '../types';

interface ResumeViewProps {
  careerGoal: string;
  onAnalyzeComplete: (pointsAwarded: number, logDescription: string) => void;
  preferredLanguage: string;
}

const MOCK_PASTE_SAMPLE = `John Doe
johndoe@email.com | github.com/johndoe

Summary:
Motivated student looking for a junior developer role. I have completed some school projects using Python and HTML. Eager to learn and work hard.

Skills:
Python, HTML, CSS, Microsoft Word, Team Player.

Projects:
* School Calculator Project: Built a basic calculator in Python that can add, subtract, multiply, and divide.
* Personal Blog: Created a static HTML page to share my hobbies.`;

const MOCK_JOB_DESC_SAMPLE = `Senior Full-Stack Engineer (Node.js & React)
We are seeking a Senior Full-Stack Engineer to join our high-performing agile team. 

Key Responsibilities:
- Architect and maintain highly-scalable backend microservices using Node.js, Express, and TypeScript.
- Build responsive web applications with React.
- Optimize complex database queries and scale SQL databases for high throughput.
- Configure secure AWS cloud resources, containerized deployments with Docker, and automated CI/CD pipelines.
- Practice security-first coding patterns and maintain rigorous technical documentation.

Requirements:
- 3+ years of experience in full-stack production environments.
- Hands-on expertise with Docker, AWS, SQL, and Git.
- Solid understanding of software design patterns and system scalability.`;

export default function ResumeView({
  careerGoal,
  onAnalyzeComplete,
  preferredLanguage
}: ResumeViewProps) {
  const [resumeText, setResumeText] = useState('');
  const [jobDescriptionText, setJobDescriptionText] = useState('');
  const [careerTarget, setCareerTarget] = useState(careerGoal || 'Software Engineer');
  const [loading, setLoading] = useState(false);
  const [parsingFile, setParsingFile] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showOriginalInPreview, setShowOriginalInPreview] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setParsingFile(true);
    setError(null);
    try {
      const response = await fetch('/api/resume/parse-file', {
        method: 'POST',
        headers: {
          'Content-Type': file.type,
          'X-Filename': file.name
        },
        body: file
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to parse file content.');
      }
      const data = await response.json();
      if (data.text) {
        setResumeText(data.text);
      } else {
        throw new Error('No text returned from parser.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to extract text from your resume file. Please copy/paste instead.');
    } finally {
      setParsingFile(false);
    }
  };

  const handleAnalyze = async (textToScan: string) => {
    const rawText = textToScan.trim();
    if (!rawText) return;

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await fetch('/api/resume/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: rawText,
          careerTarget,
          jobDescriptionText: jobDescriptionText.trim(),
          preferredLanguage
        })
      });

      if (!response.ok) {
        throw new Error('ATS analysis failed. Please try again.');
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setAnalysis(data);

      // Trigger point achievement in parent
      onAnalyzeComplete(
        25, 
        `Completed ATS Resume Scan for target career: "${careerTarget}". Score: ${data.score}%`
      );
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to complete resume ATS scanning.');
    } finally {
      setLoading(false);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const filename = file.name.toLowerCase();
      if (filename.endsWith('.pdf') || filename.endsWith('.docx')) {
        handleFileUpload(file);
      } else if (file.type === "text/plain" || filename.endsWith(".txt") || filename.endsWith(".md")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setResumeText(event.target.result as string);
          }
        };
        reader.readAsText(file);
      } else {
        setError("Please upload a PDF, DOCX, TXT, or MD file.");
      }
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-indigo-600 border-indigo-200 bg-indigo-50/50';
    if (score >= 60) return 'text-amber-600 border-amber-200 bg-amber-50/50';
    return 'text-red-500 border-red-200 bg-red-50/50';
  };

  return (
    <div className="space-y-6" id="resume-analyzer-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">
            Career Preparedness
          </span>
          <h2 className="text-2xl font-display font-bold text-slate-800 mt-2">Resume ATS Scanner</h2>
          <p className="text-xs sm:text-sm text-slate-400">Match your qualifications against recruiters' automated keyword filters</p>
        </div>
        
        {/* Career Target Input */}
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-3xs max-w-xs w-full">
          <Briefcase className="w-4 h-4 text-indigo-500 shrink-0" />
          <input
            type="text"
            value={careerTarget}
            onChange={(e) => setCareerTarget(e.target.value)}
            placeholder="Target role..."
            className="text-xs font-semibold focus:outline-hidden text-slate-800 w-full"
            title="Edit your target career keyword filter"
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading && (
          /* Analyzing Loader Card */
          <motion.div
            key="analyzing"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-xl mx-auto space-y-6"
            id="resume-loading-card"
          >
            <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-100 animate-pulse" />
              <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
              <FileText className="w-6 h-6 text-indigo-600 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-800 font-display">Parsing Resume Credentials</h3>
              <p className="text-sm font-mono text-indigo-600 bg-indigo-50 py-1.5 px-4 rounded-full inline-block font-semibold">
                Scanning qualifications against "{careerTarget}" requirements...
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Evaluating format integrity, metric dense descriptions, strong action words, and core tech keyword matching scores.
              </p>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-5 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm flex gap-3 items-center max-w-xl mx-auto shadow-2xs"
          >
            <XCircle className="w-5 h-5 shrink-0" />
            <p className="font-semibold">{error}</p>
          </motion.div>
        )}

        {!analysis && !loading ? (
          /* Main Input Form with Dropzone */
          <motion.div
            key="input-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            id="resume-input-flow"
          >
            {/* Guidelines box */}
            <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="font-display font-bold text-slate-800">Scan Checklist Tips</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Maximize your job search by aligning your qualifications directly with target hiring parameters:
                </p>
                <ul className="space-y-3 text-xs text-slate-600">
                  <li className="flex gap-2 items-start leading-snug">
                    <CheckCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <span><strong>Quantifiable Metrics</strong>: Inject numeric success targets (e.g. "Reduced query response latency by 35%").</span>
                  </li>
                  <li className="flex gap-2 items-start leading-snug">
                    <CheckCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <span><strong>Action Verbs</strong>: Lead sentences with decisive tech action words like "Architected", "Spearheaded", or "Refactored".</span>
                  </li>
                  <li className="flex gap-2 items-start leading-snug">
                    <CheckCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <span><strong>Job Alignment</strong>: Paste the target job description to match skills, flag drawbacks, and run automated gaps analysis.</span>
                  </li>
                </ul>
              </div>
              
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Interactive Testing Sandbox</span>
                
                <button
                  type="button"
                  onClick={() => setResumeText(MOCK_PASTE_SAMPLE)}
                  className="w-full bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-800 text-slate-600 font-semibold py-2.5 rounded-xl text-xs transition-all cursor-pointer block"
                >
                  Load Sample Draft Resume
                </button>

                <button
                  type="button"
                  onClick={() => setJobDescriptionText(MOCK_JOB_DESC_SAMPLE)}
                  className="w-full bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-800 text-slate-600 font-semibold py-2.5 rounded-xl text-xs transition-all cursor-pointer block"
                >
                  Load Sample Job Description
                </button>
              </div>
            </div>

            {/* Inputs area */}
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Resume text */}
                <div 
                  className={`bg-white rounded-3xl border p-5 flex flex-col space-y-3 relative ${
                    dragActive ? 'border-indigo-500 bg-indigo-50/10' : 'border-slate-200'
                  }`}
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".pdf,.docx,.txt,.md" 
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }} 
                  />

                  {parsingFile && (
                    <div className="absolute inset-0 bg-white/95 backdrop-blur-xs rounded-3xl flex flex-col items-center justify-center text-slate-800 z-10 space-y-3 animate-fade-in border border-indigo-100">
                      <div className="w-10 h-10 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
                      <div className="text-center">
                        <span className="text-xs font-bold text-slate-800 block">Extracting Resume Text...</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Reading document and parsing structure</span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
                      <FileCode className="w-4.5 h-4.5 text-indigo-500" />
                      My Resume Text
                    </label>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[10px] text-indigo-600 hover:text-indigo-700 font-bold underline transition-colors cursor-pointer"
                    >
                      Browse files
                    </button>
                  </div>

                  <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste your full resume text here or upload a file above (PDF, Word, Text supported)..."
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-4 py-3 text-xs focus:outline-hidden transition-all text-slate-800 font-medium font-mono min-h-[300px] resize-y scrollbar-thin"
                    required
                  />

                  {resumeText.length === 0 && (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-x-5 top-11 bottom-5 bg-slate-50/80 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:bg-indigo-50/40 hover:border-indigo-300 transition-all gap-1 pointer-events-auto"
                    >
                      <Upload className="w-6 h-6 text-indigo-400 animate-pulse" />
                      <div>
                        <p className="text-xs font-bold text-slate-700">Drag & Drop file or click to upload</p>
                        <p className="text-[9px] text-slate-400 font-medium">Supports PDF, DOCX, TXT, or MD</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Job description text */}
                <div className="bg-white rounded-3xl border border-slate-200 p-5 flex flex-col space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
                      <Briefcase className="w-4.5 h-4.5 text-indigo-500" />
                      Target Job Description
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">Highly Recommended</span>
                  </div>

                  <textarea
                    value={jobDescriptionText}
                    onChange={(e) => setJobDescriptionText(e.target.value)}
                    placeholder="Paste the recruiter's job description text here... AI will analyze drawbacks, identify exact profile gaps, match key technical insights, and rewrite an optimized resume tailored for this job!"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-4 py-3 text-xs focus:outline-hidden transition-all text-slate-800 font-medium font-mono min-h-[300px] resize-y scrollbar-thin"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleAnalyze(resumeText)}
                disabled={!resumeText.trim() || loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl text-sm font-bold tracking-wide uppercase transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                Scan Resume & Align with Job Description
                <Sparkles className="w-4 h-4 text-indigo-300 animate-pulse" />
              </button>
            </div>
          </motion.div>
        ) : (
          /* Analysis Report Panel */
          analysis && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              id="resume-analysis-results"
            >
              {/* Score and Checklist Panel */}
              <div className="lg:col-span-1 space-y-6">
                {/* Score Card */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs text-center space-y-4">
                  <h3 className="font-display font-bold text-slate-800 text-sm uppercase tracking-wide">Overall Match Score</h3>
                  <div className={`w-32 h-32 rounded-full border-4 mx-auto flex flex-col items-center justify-center shadow-xs ${getScoreColor(analysis.score)}`}>
                    <span className="text-3xl font-bold font-mono leading-none">{analysis.score}%</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider mt-1">
                      {analysis.jobDescriptionText ? 'Job Match' : 'ATS Score'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                    {analysis.jobDescriptionText 
                      ? "This rating evaluates the direct skills alignment, technology matches, and experience overlap with the job description."
                      : `This rating reflects how well your keywords and formatting match typical recruiter algorithms for ${careerTarget}.`
                    }
                  </p>
                  
                  <button
                    onClick={() => setAnalysis(null)}
                    className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 px-4 rounded-xl border border-slate-200 transition-all w-full cursor-pointer flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Modify Inputs & Scan Again
                  </button>
                </div>

                {/* Criteria Checklist */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                  <h3 className="font-display font-bold text-slate-800 text-sm uppercase tracking-wide">ATS Compatibility Checklist</h3>
                  <div className="space-y-4">
                    {analysis.checklist.map((item) => (
                      <div key={item.id} className="flex gap-3 items-start border-b border-slate-50 pb-3 last:border-0 last:pb-0 text-xs leading-normal">
                        <span className="mt-0.5 shrink-0">
                          {item.status === 'pass' && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                          {item.status === 'warn' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                          {item.status === 'fail' && <XCircle className="w-4 h-4 text-red-500" />}
                        </span>
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-slate-800">{item.label}</h4>
                          <p className="text-slate-500 text-[11px] leading-relaxed">{item.recommendation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Strengths, Job Gaps, Drawbacks, Insights and Suggestions */}
              <div className="lg:col-span-2 space-y-6">
                {/* Job Alignment Drawbacks & Profile Gaps Section */}
                {analysis.jobDescriptionText && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Drawbacks */}
                    <div className="bg-rose-50/50 p-5 rounded-3xl border border-rose-100 space-y-3">
                      <h4 className="font-display font-bold text-rose-900 text-sm flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-rose-600" />
                        Drawbacks Faced in Application
                      </h4>
                      {analysis.drawbacks && analysis.drawbacks.length > 0 ? (
                        <ul className="space-y-2 text-xs text-slate-700 font-medium">
                          {analysis.drawbacks.map((item, i) => (
                            <li key={i} className="flex gap-2 items-start leading-relaxed">
                              <span className="text-rose-500 mt-0.5">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-500">No major drawbacks identified. Ready for recruiter inspection!</p>
                      )}
                    </div>

                    {/* Job Gaps */}
                    <div className="bg-amber-50/50 p-5 rounded-3xl border border-amber-100 space-y-3">
                      <h4 className="font-display font-bold text-amber-900 text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        Hiring Profile & Experience Gaps
                      </h4>
                      {analysis.gapsWithJobDescription && analysis.gapsWithJobDescription.length > 0 ? (
                        <ul className="space-y-2 text-xs text-slate-700 font-medium">
                          {analysis.gapsWithJobDescription.map((item, i) => (
                            <li key={i} className="flex gap-2 items-start leading-relaxed">
                              <span className="text-amber-500 mt-0.5">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-500">No critical gaps detected compared to requirements!</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Key Insights & Key Formats to Solve Section */}
                {analysis.jobDescriptionText && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Insights */}
                    <div className="bg-indigo-50/30 p-5 rounded-3xl border border-indigo-100/50 space-y-3">
                      <h4 className="font-display font-bold text-indigo-900 text-sm flex items-center gap-2">
                        <Info className="w-4 h-4 text-indigo-600" />
                        Recruiter Key Insights
                      </h4>
                      {analysis.keyInsights && analysis.keyInsights.length > 0 ? (
                        <ul className="space-y-2 text-xs text-slate-700 font-medium">
                          {analysis.keyInsights.map((item, i) => (
                            <li key={i} className="flex gap-2 items-start leading-relaxed">
                              <span className="text-indigo-600 mt-0.5">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-500">No key recruiter insights available.</p>
                      )}
                    </div>

                    {/* Key Formats */}
                    <div className="bg-emerald-50/30 p-5 rounded-3xl border border-emerald-100 space-y-3">
                      <h4 className="font-display font-bold text-emerald-900 text-sm flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        Formatting Formulas & Strategies
                      </h4>
                      {analysis.keyFormatsToSolve && analysis.keyFormatsToSolve.length > 0 ? (
                        <ul className="space-y-2 text-xs text-slate-700 font-medium">
                          {analysis.keyFormatsToSolve.map((item, i) => (
                            <li key={i} className="flex gap-2 items-start leading-relaxed">
                              <span className="text-emerald-600 mt-0.5">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-500">No specific format guidelines recommended.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Strengths & General Keyword Gaps */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Strengths */}
                  <div className="bg-indigo-50/20 p-5 rounded-3xl border border-indigo-100/40 space-y-3">
                    <h4 className="font-display font-bold text-indigo-950 text-sm flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-indigo-600" />
                      Strengths Identified
                    </h4>
                    <ul className="space-y-2 text-xs text-slate-700 font-medium">
                      {analysis.strengths.map((str, i) => (
                        <li key={i} className="flex gap-2 items-start leading-relaxed">
                          <span className="text-indigo-600 mt-0.5">•</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Keyword Gaps */}
                  <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-3">
                    <h4 className="font-display font-bold text-slate-800 text-sm flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-slate-600" />
                      Missing Keyword Gaps
                    </h4>
                    <ul className="space-y-2 text-xs text-slate-700 font-medium">
                      {analysis.gaps.map((gap, i) => (
                        <li key={i} className="flex gap-2 items-start leading-relaxed">
                          <span className="text-slate-500 mt-0.5">•</span>
                          <span>{gap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Interactive Auto-Optimized Resume Workspace */}
                {analysis.optimizedResumeText && (
                  <div className="bg-white p-6 rounded-3xl border border-indigo-100 shadow-md space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <h3 className="font-display font-bold text-slate-800 text-base flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-indigo-500" />
                          Tailored AI-Optimized Resume Draft
                        </h3>
                        <p className="text-xs text-slate-400">
                          This copy is dynamically written to satisfy recruiter keywords, clear the ATS, and address gaps.
                        </p>
                      </div>

                      {/* Tab toggles */}
                      <div className="flex bg-slate-100 p-1 rounded-xl self-end">
                        <button
                          type="button"
                          onClick={() => setShowOriginalInPreview(false)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                            !showOriginalInPreview ? 'bg-white text-indigo-600 shadow-3xs' : 'text-slate-500'
                          }`}
                        >
                          Optimized Resume
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowOriginalInPreview(true)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                            showOriginalInPreview ? 'bg-white text-indigo-600 shadow-3xs' : 'text-slate-500'
                          }`}
                        >
                          My Original Text
                        </button>
                      </div>
                    </div>

                    {/* Preformated code viewport */}
                    <div className="relative">
                      <pre className="bg-slate-900 text-slate-100 font-mono text-xs p-5 rounded-2xl overflow-x-auto overflow-y-auto max-h-[350px] leading-relaxed scrollbar-thin shadow-inner border border-slate-800">
                        {showOriginalInPreview ? resumeText : analysis.optimizedResumeText}
                      </pre>

                      {/* Copy button */}
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const textToCopy = showOriginalInPreview ? resumeText : analysis.optimizedResumeText;
                            if (textToCopy) {
                              navigator.clipboard.writeText(textToCopy);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            }
                          }}
                          className="bg-slate-800/80 hover:bg-slate-700 text-white font-semibold p-2.5 rounded-xl border border-slate-700 shadow-md transition-all flex items-center gap-1.5 text-xs cursor-pointer"
                          title="Copy text to clipboard"
                        >
                          {copied ? (
                            <>
                              <Check className="w-4 h-4 text-emerald-400" />
                              <span className="font-bold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              <span>Copy Text</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Apply back to draft editor CTA */}
                    {!showOriginalInPreview && (
                      <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex gap-3 items-start">
                          <ArrowDown className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5 animate-bounce" />
                          <div className="space-y-0.5">
                            <h4 className="text-xs font-bold text-indigo-950">Implement These AI Updates?</h4>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                              Inject the optimized copy directly back into your edit draft workspace to fine-tune or run another evaluation.
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (analysis.optimizedResumeText) {
                              setResumeText(analysis.optimizedResumeText);
                              setAnalysis(null);
                            }
                          }}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all shrink-0 cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
                          Apply to My Draft Editor
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* AI suggested text rewrites */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                  <h3 className="font-display font-bold text-slate-800 text-base flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-500" />
                    ATS Suggested Rewrites
                  </h3>
                  <div className="space-y-6">
                    {analysis.suggestedChanges.map((change, i) => (
                      <div key={i} className="border border-slate-100 rounded-2xl overflow-hidden shadow-3xs">
                        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
                          <span>SECTION: {change.section.toUpperCase()}</span>
                          <span className="text-indigo-600 font-semibold font-mono">Ready to copy</span>
                        </div>
                        <div className="p-4 space-y-3 text-xs sm:text-sm">
                          {change.originalText && (
                            <div className="space-y-1">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Original Text</span>
                              <p className="text-slate-500 line-through bg-slate-50 px-3 py-2 rounded-xl italic">{change.originalText}</p>
                            </div>
                          )}
                          <div className="space-y-1">
                            <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider block">Suggested Rewrite</span>
                            <p className="text-slate-800 font-semibold bg-indigo-50/30 border border-indigo-100/30 px-3 py-2.5 rounded-xl leading-relaxed font-mono">
                              {change.suggestedText}
                            </p>
                          </div>
                          <div className="space-y-1 pt-1.5 border-t border-slate-50">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Why this rewrite succeeds</span>
                            <p className="text-slate-500 text-xs leading-relaxed font-medium">{change.explanation}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  );
}
