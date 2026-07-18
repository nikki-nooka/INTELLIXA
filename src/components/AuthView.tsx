/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Sparkles, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Compass,
  Cpu,
  Terminal,
  Activity,
  X,
  CheckCircle,
  HelpCircle,
  Globe,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthViewProps {
  onAuthSuccess: (name: string, goal: string, lang: string) => void;
  onClose?: () => void;
  initialIsLogin?: boolean;
}

interface AvatarOption {
  id: string;
  name: string;
  emoji: string;
  color: string;
  borderColor: string;
  glowColor: string;
  description: string;
  specialty: string;
  passiveAbility: string;
  stats: {
    wisdom: number;
    coding: number;
    ethics: number;
    exploration: number;
  };
}

const AVATARS: AvatarOption[] = [
  { 
    id: 'sage', 
    name: 'Cybernetic Sage', 
    emoji: '🧙‍♂️', 
    color: 'from-emerald-500/10 to-teal-500/5 text-emerald-400 border-emerald-500/20',
    borderColor: 'border-emerald-500/20',
    glowColor: 'shadow-emerald-500/5',
    description: 'Guided by moral clarity, deep-learning ethics, and Socratic logic.', 
    specialty: 'Dharma Alignment & Socratic Ethics',
    passiveAbility: 'Moral Compass (+20% clarity in explanations)',
    stats: { wisdom: 95, coding: 70, ethics: 99, exploration: 65 }
  },
  { 
    id: 'coder', 
    name: 'Quantum Coder', 
    emoji: '💻', 
    color: 'from-indigo-500/10 to-blue-500/5 text-indigo-400 border-indigo-500/20',
    borderColor: 'border-indigo-500/20',
    glowColor: 'shadow-indigo-500/5',
    description: 'Engineered for recursive algorithms, cloud design, and high scale.', 
    specialty: 'Computational Rigor & Low-Level ASM',
    passiveAbility: 'Syntax Compiler (Zero-latency visual charts)',
    stats: { wisdom: 75, coding: 98, ethics: 70, exploration: 80 }
  },
  { 
    id: 'scribe', 
    name: 'Celestial Scribe', 
    emoji: '✍️', 
    color: 'from-purple-500/10 to-pink-500/5 text-purple-400 border-purple-500/20',
    borderColor: 'border-purple-500/20',
    glowColor: 'shadow-purple-500/5',
    description: 'Translates raw academic data models into audibles and charts.', 
    specialty: 'Creative Synthesizer & Podcasting',
    passiveAbility: 'Sonic Weaver (+15% podcast playback speed)',
    stats: { wisdom: 85, coding: 80, ethics: 85, exploration: 90 }
  },
  { 
    id: 'explorer', 
    name: 'Creative Nomad', 
    emoji: '🧭', 
    color: 'from-amber-500/10 to-orange-500/5 text-amber-400 border-amber-500/20',
    borderColor: 'border-amber-500/20',
    glowColor: 'shadow-amber-500/5',
    description: 'Unstructured learning built on curiosity, trial-by-fire, and play.', 
    specialty: 'Sandbox Architect & Chaos Tester',
    passiveAbility: 'Curiosity Spark (Reveals hidden academic trivia)',
    stats: { wisdom: 80, coding: 85, ethics: 75, exploration: 98 }
  }
];

export default function AuthView({ onAuthSuccess, onClose, initialIsLogin = true }: AuthViewProps) {
  const [isLogin, setIsLogin] = useState<boolean>(initialIsLogin);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [studentName, setStudentName] = useState<string>('');
  const [careerGoal, setCareerGoal] = useState<string>('Full-Stack Software Developer');
  const [preferredLanguage, setPreferredLanguage] = useState<string>('English');
  const [selectedAvatar, setSelectedAvatar] = useState<string>('sage');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  
  // Interactive Verification States
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [honorCodeAccepted, setHonorCodeAccepted] = useState<boolean>(true);

  const activeAvatarObj = AVATARS.find(a => a.id === selectedAvatar) || AVATARS[0];

  const verificationSteps = isLogin
    ? [
        'Syncing credentials with encrypted ledger...',
        'Validating Academic sandbox parameters...',
        'Compiling customized student dashboard...'
      ]
    : [
        'Creating secure cloud student registry...',
        'Assigning digital Socratic mentor AI...',
        'Initializing interactive carrier roadmaps...'
      ];

  // Simulating beautiful, realistic auth process with intervals
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    if (!email.includes('@')) {
      errors.email = 'Please provide a valid email address.';
    }
    if (password.length < 6) {
      errors.password = 'Security keys must be at least 6 characters.';
    }
    if (!isLogin && !studentName.trim()) {
      errors.name = 'Please provide your full student handle.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setIsLoading(true);
    setLoadingStep(0);

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev >= verificationSteps.length - 1) {
          clearInterval(stepInterval);
          setTimeout(() => {
            const finalName = isLogin ? (studentName || email.split('@')[0]) : studentName;
            onAuthSuccess(finalName, careerGoal, preferredLanguage);
            setIsLoading(false);
          }, 600);
          return prev;
        }
        return prev + 1;
      });
    }, 700);
  };

  const handlePrefillDemo = (type: 'sage' | 'coder') => {
    if (type === 'sage') {
      setEmail('sage@academiai.dev');
      setPassword('WisdomCoder99!');
      setStudentName('Dharma Sage');
      setCareerGoal('Applied Machine Learning / AI Engineer');
      setPreferredLanguage('English');
      setSelectedAvatar('sage');
    } else {
      setEmail('hacker@academiai.dev');
      setPassword('MasterHacker77*');
      setStudentName('Alice Cipher');
      setCareerGoal('Cybersecurity Analyst & Ethical Hacker');
      setPreferredLanguage('English');
      setSelectedAvatar('coder');
    }
  };

  const getPasswordStrengthText = () => {
    if (!password) return { text: 'None', color: 'text-slate-400', barCount: 0 };
    let score = 0;
    if (password.length >= 6) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { text: 'Weak Security', color: 'text-rose-500', barCount: 1 };
    if (score === 2) return { text: 'Fair Protection', color: 'text-amber-500', barCount: 2 };
    if (score === 3) return { text: 'High Encryption', color: 'text-indigo-400', barCount: 3 };
    return { text: 'Quantum Strong', color: 'text-emerald-400', barCount: 4 };
  };

  const passStrength = getPasswordStrengthText();

  return (
    <div className="flex flex-col w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative" id="auth-premium-card-wrapper">
      
      {/* Top decorative glass gradient */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />

      <div className="flex flex-col md:flex-row min-h-[550px]">
        
        {/* LEFT SIDE: ARCHETYPE DETAILS AND ACADEMIAI VALUE */}
        <div className="md:w-1/2 bg-slate-950 p-8 md:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800/80 relative overflow-hidden">
          {/* Subtle atmospheric glow */}
          <div className="absolute -top-32 -left-32 w-80 h-80 bg-indigo-500/10 blur-3xl rounded-full" />
          <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-emerald-500/10 blur-3xl rounded-full" />

          {/* Logo Section */}
          <div className="flex items-center gap-3 z-10">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/90 flex items-center justify-center border border-indigo-400/20 shadow-lg shadow-indigo-500/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold font-display tracking-tight text-white leading-none">AcademiAI</h2>
              <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-widest mt-1 block">
                Socratic study system
              </span>
            </div>
          </div>

          {/* SAGE INTRO / PREVIEW STATE */}
          <div className="my-8 space-y-6 z-10">
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md uppercase">
                Active System Preview
              </span>
              <h3 className="text-xl font-black text-white leading-tight font-display">
                Unlock fully-guided, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-200 to-emerald-200">
                  interactive study roadmaps.
                </span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                Align your technical learning goals with active moral and ethical Socratic evaluations. Realize code blocks, podcasts, and automated review checklists instantly.
              </p>
            </div>

            {/* Dynamic Socratic Archetype Preview card */}
            <div className="bg-slate-900/60 border border-slate-800/80 p-4.5 rounded-2xl space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  {activeAvatarObj.emoji}
                </span>
                <div>
                  <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block">archetype preview</span>
                  <h4 className="text-xs font-bold text-slate-200">{activeAvatarObj.name}</h4>
                  <p className="text-[10px] text-indigo-400 font-mono mt-0.5">{activeAvatarObj.specialty}</p>
                </div>
              </div>

              <div className="space-y-1.5 pt-1 border-t border-slate-800/60 text-[10px]">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-500">Passive Ability:</span>
                  <span className="text-emerald-400 font-medium text-[9px]">{activeAvatarObj.passiveAbility}</span>
                </div>
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between font-mono text-slate-500 text-[9px] uppercase">
                    <span>Ethics Rating</span>
                    <span>{activeAvatarObj.stats.ethics}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${activeAvatarObj.stats.ethics}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono z-10 pt-4">
            <ShieldCheck className="w-4 h-4 text-emerald-500/80" />
            <span>Encrypted cloud connection synced.</span>
          </div>
        </div>

        {/* RIGHT SIDE: BEAUTIFUL INTERACTIVE FORM */}
        <div className="flex-1 bg-slate-900/90 p-8 md:p-10 flex flex-col justify-center relative">
          
          {/* Close button if optional onClose passed */}
          {onClose && (
            <button
              onClick={onClose}
              type="button"
              className="absolute top-6 right-6 p-1.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer z-20"
              title="Dismiss authentication"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Beautiful interactive form loader overlay */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-950/95 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-20"
              >
                <div className="relative mb-4">
                  <div className="w-14 h-14 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                  <GraduationCap className="w-6 h-6 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
                </div>
                <h4 className="text-xs font-bold font-mono tracking-widest text-indigo-400 uppercase">
                  INITIALIZING STUDENT CELL
                </h4>
                <p className="text-[11px] text-slate-400 mt-2 font-mono h-8 max-w-xs mx-auto">
                  {verificationSteps[loadingStep]}
                </p>
                <div className="flex gap-1.5 mt-4">
                  {verificationSteps.map((_, idx) => (
                    <div 
                      key={idx}
                      className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                        idx <= loadingStep ? 'bg-indigo-500' : 'bg-slate-800'
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Switcher Tab */}
          <div className="flex border-b border-slate-800 pb-4 mb-6 justify-between items-center z-10">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => { setIsLogin(true); setFormErrors({}); }}
                className={`text-xs font-bold uppercase tracking-wider pb-2 relative transition-all cursor-pointer ${
                  isLogin ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In
                {isLogin && (
                  <motion.div layoutId="premium-auth-line" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
                )}
              </button>
              <button
                type="button"
                onClick={() => { setIsLogin(false); setFormErrors({}); }}
                className={`text-xs font-bold uppercase tracking-wider pb-2 relative transition-all cursor-pointer ${
                  !isLogin ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Register
                {!isLogin && (
                  <motion.div layoutId="premium-auth-line" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
                )}
              </button>
            </div>

            {/* Quick pre-filled Demo profiles */}
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => handlePrefillDemo('sage')}
                className="px-2 py-1 bg-slate-800/80 hover:bg-slate-700 hover:text-indigo-400 border border-slate-700/80 rounded-md text-[9px] font-bold cursor-pointer transition-all flex items-center gap-1"
                title="Prefill Sage Demo"
              >
                <Zap className="w-2.5 h-2.5 text-amber-400" />
                Sage
              </button>
              <button
                type="button"
                onClick={() => handlePrefillDemo('coder')}
                className="px-2 py-1 bg-slate-800/80 hover:bg-slate-700 hover:text-emerald-400 border border-slate-700/80 rounded-md text-[9px] font-bold cursor-pointer transition-all flex items-center gap-1"
                title="Prefill Coder Demo"
              >
                <Zap className="w-2.5 h-2.5 text-emerald-400" />
                Coder
              </button>
            </div>
          </div>

          {/* Form fields */}
          <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs z-10" id="auth-form-body">
            
            {/* NAME FIELD (Register only) */}
            <AnimatePresence initial={false}>
              {!isLogin && (
                <motion.div
                  initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                  animate={{ height: 'auto', opacity: 1, marginBottom: 12 }}
                  exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                  className="space-y-1 overflow-hidden"
                >
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Student Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="e.g. Dharma Sage"
                      className={`w-full bg-slate-950 border focus:border-indigo-500 rounded-xl pl-10 pr-4 py-3 text-[11px] focus:outline-hidden text-slate-200 font-semibold transition-all ${
                        formErrors.name ? 'border-rose-500/40' : 'border-slate-800/80'
                      }`}
                    />
                  </div>
                  {formErrors.name && (
                    <span className="text-[9px] text-rose-400 font-medium block">{formErrors.name}</span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* EMAIL ADDRESS */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. student@academiai.dev"
                  required
                  className={`w-full bg-slate-950 border focus:border-indigo-500 rounded-xl pl-10 pr-4 py-3 text-[11px] focus:outline-hidden text-slate-200 font-semibold transition-all ${
                    formErrors.email ? 'border-rose-500/40' : 'border-slate-800/80'
                  }`}
                />
              </div>
              {formErrors.email && (
                <span className="text-[9px] text-rose-400 font-medium block">{formErrors.email}</span>
              )}
            </div>

            {/* SECURITY KEY (PASSWORD) */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Security Key (Password)</label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-950 border border-slate-800/80 focus:border-indigo-500 rounded-xl pl-10 pr-10 py-3 text-[11px] focus:outline-hidden text-slate-200 font-semibold transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength meter */}
              {!isLogin && password && (
                <div className="space-y-1 pt-1 text-[9px] font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Password Rating:</span>
                    <span className={passStrength.color}>{passStrength.text}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 h-1 bg-slate-950 rounded-full overflow-hidden">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-full transition-all duration-300 ${
                          step <= passStrength.barCount ? 'bg-indigo-500' : 'bg-slate-850'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SAGE ARCHETYPE CHOOSER (Register only) */}
            <AnimatePresence initial={false}>
              {!isLogin && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-1 overflow-hidden"
                >
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Choose Socratic Archetype</label>
                  <div className="grid grid-cols-4 gap-2">
                    {AVATARS.map((av) => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setSelectedAvatar(av.id)}
                        className={`p-2 border rounded-xl flex flex-col items-center gap-1 cursor-pointer transition-all ${
                          selectedAvatar === av.id 
                            ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400 shadow-lg shadow-indigo-500/5' 
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-300'
                        }`}
                      >
                        <span className="text-base">{av.emoji}</span>
                        <span className="text-[8px] font-mono font-bold uppercase truncate max-w-full block">
                          {av.name.split(' ')[1]}
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* CAREER PATH & STUDY LANGUAGE */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Study Major</label>
                <select
                  value={careerGoal}
                  onChange={(e) => setCareerGoal(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-[10px] focus:outline-hidden text-slate-300 font-semibold cursor-pointer"
                >
                  <option value="Full-Stack Software Developer">Full-Stack Dev</option>
                  <option value="Applied Machine Learning / AI Engineer">AI Engineer</option>
                  <option value="Data Scientist & Analytics Engineer">Data Scientist</option>
                  <option value="Cybersecurity Analyst & Ethical Hacker">Ethical Hacker</option>
                  <option value="UI/UX Product Designer">Product Designer</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Language</label>
                <select
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-[10px] focus:outline-hidden text-slate-300 font-semibold cursor-pointer"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Español</option>
                  <option value="Hindi">हिन्दी</option>
                  <option value="Telugu">తెలుగు</option>
                </select>
              </div>
            </div>

            {/* SUBMIT BUTTON WITH PREMIUM INTERACTIVE SHADOWS */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold py-3.5 rounded-xl uppercase tracking-wider text-[11px] transition-all shadow-lg hover:shadow-indigo-500/15 flex items-center justify-center gap-1.5 cursor-pointer mt-4"
            >
              <span>{isLogin ? 'Authenticate Profile' : 'Initialize Socratic Engine'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-indigo-200" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
