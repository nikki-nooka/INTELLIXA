import React, { useState } from 'react';
import { 
  Github, 
  Search, 
  GitPullRequest, 
  GitBranch, 
  Award, 
  BookOpen, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle, 
  Code, 
  ArrowRight, 
  Clock, 
  Sparkles, 
  ChevronRight, 
  Briefcase, 
  ExternalLink,
  Target,
  Wrench,
  Globe,
  Star,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GitHubViewProps {
  preferredLanguage?: string;
  onActivityComplete?: (points: number, description: string) => void;
}

const COMPANIES = [
  { id: 'google', name: 'Google' },
  { id: 'stripe', name: 'Stripe' },
  { id: 'vercel', name: 'Vercel' },
  { id: 'meta', name: 'Meta' },
  { id: 'netflix', name: 'Netflix' },
  { id: 'amazon', name: 'Amazon' },
  { id: 'openai', name: 'OpenAI' },
  { id: 'microsoft', name: 'Microsoft' }
];

const ROLES = [
  { id: 'frontend', name: 'Frontend Engineer' },
  { id: 'backend', name: 'Backend Engineer' },
  { id: 'fullstack', name: 'Full-Stack Engineer' },
  { id: 'ai', name: 'AI Engineer' },
  { id: 'devops', name: 'DevOps / SRE' },
  { id: 'mobile', name: 'Mobile Engineer' },
  { id: 'systems', name: 'Systems Engineer' }
];

const TRANSLATIONS: Record<string, Record<string, string>> = {
  English: {
    title: "GitHub Recruiter Analyzer",
    subtitle: "Audit your open-source footprint against elite engineering standards",
    placeholder: "Enter GitHub username (e.g., torvalds)",
    analyze: "Analyze Codebase",
    analyzing: "Conducting Recruiter Audit...",
    role: "Target Role",
    company: "Target Company",
    overview: "Developer Footprint Summary",
    prActivity: "Collaborative Velocity & PRs",
    mainProject: "Primary Repository Analysis",
    strengths: "Code Strengths",
    improvements: "Architectural Debt / Improvements",
    laggingAreas: "Recruiting Gaps & Discrepancies",
    requiredConcepts: "Target Competency Framework",
    skillBridges: "Personal Skill Bridge Roadmap",
    recommendedProjects: "Custom Tailored Portfolio Projects",
    difficulty: "Difficulty",
    whyBuild: "Recruiter Justification",
    steps: "Implementation Blueprint",
    timeframe: "Suggested Timeline",
    resources: "Learning Resources",
    recentRepos: "Recent Repositories",
    followers: "Followers",
    following: "Following",
    repos: "Public Repos",
    joined: "Joined GitHub",
    mockedNotice: "Notice: Operating in offline simulation mode due to network status. Analysis generated dynamically based on active indicators."
  },
  Spanish: {
    title: "Analizador de Reclutamiento de GitHub",
    subtitle: "Audita tu huella de código abierto frente a los estándares de ingeniería de élite",
    placeholder: "Ingresa el usuario de GitHub (ej., torvalds)",
    analyze: "Analizar Código",
    analyzing: "Realizando Auditoría de Reclutamiento...",
    role: "Rol Objetivo",
    company: "Empresa Objetivo",
    overview: "Resumen de la Huella del Desarrollador",
    prActivity: "Velocidad de Colaboración y PRs",
    mainProject: "Análisis del Repositorio Principal",
    strengths: "Fortalezas del Código",
    improvements: "Deuda Arquitectónica / Mejoras",
    laggingAreas: "Brechas de Reclutamiento y Discrepancias",
    requiredConcepts: "Marco de Competencias Requeridas",
    skillBridges: "Ruta de Cierre de Brechas Personalizada",
    recommendedProjects: "Proyectos de Portafolio Recomendados a la Medida",
    difficulty: "Dificultad",
    whyBuild: "Justificación de Reclutamiento",
    steps: "Plano de Implementación",
    timeframe: "Cronograma Sugerido",
    resources: "Recursos de Aprendizaje",
    recentRepos: "Repositorios Recientes",
    followers: "Seguidores",
    following: "Siguiendo",
    repos: "Repos Públicos",
    joined: "Se unió a GitHub",
    mockedNotice: "Aviso: Operando en modo de simulación fuera de línea debido al estado de la red. Análisis generado dinámicamente basado en indicadores activos."
  }
};

export default function GitHubView({ preferredLanguage = 'English', onActivityComplete }: GitHubViewProps) {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('fullstack');
  const [company, setCompany] = useState('google');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [activeProjectIdx, setActiveProjectIdx] = useState(0);

  // Fallback translation helper
  const langKey = TRANSLATIONS[preferredLanguage] ? preferredLanguage : 'English';
  const t = TRANSLATIONS[langKey];

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const selectedRoleName = ROLES.find(r => r.id === role)?.name || role;
    const selectedCompanyName = COMPANIES.find(c => c.id === company)?.name || company;

    try {
      const response = await fetch('/api/github/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          role: selectedRoleName,
          company: selectedCompanyName,
          preferredLanguage
        })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze the specified GitHub footprint. Please try again.');
      }

      const data = await response.json();
      setResult(data);

      if (onActivityComplete) {
        onActivityComplete(
          35, 
          `Conducted professional GitHub Recruiter analysis for "${username.trim()}" against ${selectedRoleName} expectations at ${selectedCompanyName}.`
        );
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during analysis.');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff?.toLowerCase()) {
      case 'easy': return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
      case 'medium': return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
      case 'hard': return 'bg-red-500/10 text-red-500 border border-red-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6" id="github-analyzer-container">
      {/* Tab Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white border border-slate-800 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-500/20 rounded-lg text-indigo-400">
              <Github className="w-5 h-5" />
            </span>
            <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-widest">Recruiter Sandbox</span>
          </div>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white">{t.title}</h2>
          <p className="text-slate-400 text-xs leading-relaxed max-w-xl">{t.subtitle}</p>
        </div>
        <div className="hidden lg:flex items-center gap-3">
          <div className="p-3.5 bg-slate-800/50 border border-slate-700/50 rounded-2xl flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-400" />
            <div className="text-left font-mono">
              <span className="text-[10px] text-slate-500 block leading-none">AUDIT ENGINE</span>
              <span className="text-xs text-slate-300 font-bold">Dharma-V3 Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Input Selection Form Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* GitHub Username Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Github className="w-3.5 h-3.5 text-slate-500" /> Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t.placeholder}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl text-sm transition-all focus:outline-hidden"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Role Select Dropdown */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-500" /> {t.role}
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl text-sm transition-all focus:outline-hidden"
              >
                {ROLES.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            {/* Company Select Dropdown */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-slate-500" /> {t.company}
              </label>
              <select
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl text-sm transition-all focus:outline-hidden"
              >
                {COMPANIES.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full md:w-auto px-6 py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all cursor-pointer ${
                loading 
                  ? 'bg-indigo-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-500 hover:shadow-md shadow-indigo-500/10'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>{t.analyzing}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-indigo-200" />
                  <span>{t.analyze}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-red-800">Analysis Failed</h4>
              <p className="text-xs text-red-600 mt-1">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results View Container */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
            id="analysis-result-view"
          >
            {/* offline mock indicator */}
            {result.isMocked && (
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-[11px] font-medium text-amber-800 leading-none">
                  {t.mockedNotice}
                </span>
              </div>
            )}

            {/* Profile Overview Bento Box */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: GitHub Profile Badge */}
              <div className="lg:col-span-1 bg-white border border-slate-100 rounded-3xl p-6 flex flex-col justify-between shadow-xs">
                <div className="space-y-5 text-center">
                  <div className="relative inline-block mx-auto">
                    <img 
                      src={result.profile.avatarUrl} 
                      alt={result.profile.name} 
                      className="w-24 h-24 rounded-full border-4 border-indigo-100 mx-auto object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 text-white rounded-full border-2 border-white shadow-xs">
                      <Github className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-bold font-display text-slate-800">{result.profile.name}</h3>
                    <span className="text-xs text-indigo-600 font-mono">@{result.profile.username}</span>
                  </div>

                  {result.profile.bio && (
                    <p className="text-xs text-slate-500 italic max-w-sm mx-auto leading-relaxed">
                      "{result.profile.bio}"
                    </p>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-5 mt-6 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono uppercase">{t.repos}</span>
                    <strong className="text-sm text-slate-800 font-display">{result.profile.publicRepos}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono uppercase">{t.followers}</span>
                    <strong className="text-sm text-slate-800 font-display">{result.profile.followers}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono uppercase">{t.following}</span>
                    <strong className="text-sm text-slate-800 font-display">{result.profile.following}</strong>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 mt-3 text-center">
                  <span className="text-[9px] font-mono text-slate-400">
                    {t.joined}: {new Date(result.profile.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                  </span>
                </div>
              </div>

              {/* Right Column: Key Overview & PR Commentary */}
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profile Overview Card */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4 flex flex-col justify-between shadow-xs">
                  <div className="space-y-2">
                    <span className="text-[10px] text-indigo-500 font-bold font-mono tracking-wider uppercase block">{t.overview}</span>
                    <h4 className="text-base font-bold font-display text-slate-800">Recruiter Overview</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-sans">
                      {result.analysis.profileOverview}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-indigo-600 font-mono text-xs font-bold">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>Active Developer Footprint</span>
                  </div>
                </div>

                {/* PR & Collaborative Velocity Card */}
                <div className="bg-slate-900 text-white rounded-3xl p-6 space-y-4 flex flex-col justify-between border border-slate-800 shadow-md">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] text-indigo-400 font-bold font-mono tracking-wider uppercase block">{t.prActivity}</span>
                      <div className="px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg text-[10px] font-mono border border-indigo-400/20">
                        {result.profile.prsCount} Submitted PRs
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-inner">
                        <GitPullRequest className="w-6 h-6 text-indigo-200" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-mono">PULL REQUEST TOTAL</span>
                        <strong className="text-2xl font-bold font-display text-white">{result.profile.prsCount}</strong>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed pt-2">
                      {result.analysis.prAnalysis}
                    </p>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 italic">
                    PR development proves asynchronous team coordination.
                  </div>
                </div>
              </div>
            </div>

            {/* Main Project Audit Card */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] text-indigo-500 font-bold font-mono tracking-wider uppercase block">{t.mainProject}</span>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mt-1">
                  <h3 className="text-lg font-bold font-display text-slate-800 flex items-center gap-2">
                    <Code className="w-5 h-5 text-indigo-600" /> {result.analysis.mainProject.name}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {result.analysis.mainProject.techStack.map((tech: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-mono">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mt-2 italic">
                  {result.analysis.mainProject.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths List */}
                <div className="space-y-3 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-5">
                  <h4 className="text-xs font-bold font-mono uppercase text-emerald-700 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" /> {t.strengths}
                  </h4>
                  <ul className="space-y-2">
                    {result.analysis.mainProject.strengths.map((str: string, i: number) => (
                      <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                        <span className="text-emerald-500 font-bold mt-0.5">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Improvements List */}
                <div className="space-y-3 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-5">
                  <h4 className="text-xs font-bold font-mono uppercase text-indigo-700 flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-indigo-500" /> {t.improvements}
                  </h4>
                  <ul className="space-y-2">
                    {result.analysis.mainProject.improvements.map((imp: string, i: number) => (
                      <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                        <span className="text-indigo-500 font-bold mt-0.5">•</span>
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Lagging Areas & Target Concepts Bento Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Lagging Areas */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-4">
                <div>
                  <span className="text-[10px] text-red-500 font-bold font-mono tracking-wider uppercase block">Auditing Debt</span>
                  <h3 className="text-lg font-bold font-display text-slate-800 flex items-center gap-2 mt-0.5">
                    <AlertTriangle className="w-5 h-5 text-red-500" /> {t.laggingAreas}
                  </h3>
                </div>

                <div className="space-y-3">
                  {result.analysis.laggingAreas.map((lag: any, i: number) => (
                    <div key={i} className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl space-y-1">
                      <h4 className="text-xs font-bold font-sans text-red-800 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        {lag.area}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed pl-3">
                        {lag.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Target Concept Framework */}
              <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xs border border-slate-800 space-y-4">
                <div>
                  <span className="text-[10px] text-indigo-400 font-bold font-mono tracking-wider uppercase block">Job Alignment</span>
                  <h3 className="text-lg font-bold font-display text-white flex items-center gap-2 mt-0.5">
                    <Target className="w-5 h-5 text-indigo-400" /> {t.requiredConcepts}
                  </h3>
                </div>

                <div className="space-y-3">
                  {result.analysis.requiredConcepts.map((reqC: any, i: number) => (
                    <div key={i} className="p-4 bg-slate-800/40 border border-slate-800 rounded-2xl space-y-1">
                      <h4 className="text-xs font-bold font-mono text-indigo-300">
                        {reqC.concept}
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        {reqC.importance}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Skill Bridges Timeline */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-6">
              <div>
                <span className="text-[10px] text-indigo-500 font-bold font-mono tracking-wider uppercase block">Strategy Execution</span>
                <h3 className="text-lg font-bold font-display text-slate-800 flex items-center gap-2 mt-0.5">
                  <TrendingUp className="w-5 h-5 text-indigo-600" /> {t.skillBridges}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {result.analysis.skillBridges.map((bridge: any, i: number) => (
                  <div key={i} className="relative p-5 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col justify-between space-y-4">
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2 py-0.5 bg-indigo-600/10 text-indigo-600 rounded-full text-[9px] font-mono border border-indigo-600/20">
                      <Clock className="w-3 h-3" /> {bridge.timeframe}
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] text-slate-400 font-bold font-mono">STEP {i + 1}</span>
                      <h4 className="text-xs font-bold font-sans text-slate-800 leading-snug">
                        {bridge.actionItem}
                      </h4>
                    </div>

                    <div className="border-t border-slate-150 pt-3">
                      <span className="text-[9px] font-mono text-slate-400 uppercase block">{t.resources}</span>
                      <span className="text-xs text-slate-600 font-sans block mt-0.5">
                        {bridge.resourceSuggestion}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Recommended Projects Interactive Carousel */}
            <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 shadow-lg space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] text-indigo-400 font-bold font-mono tracking-wider uppercase block">{t.recommendedProjects}</span>
                  <h3 className="text-lg font-bold font-display text-white flex items-center gap-2 mt-0.5">
                    <Award className="w-5 h-5 text-indigo-400" /> Custom Build Blueprints
                  </h3>
                </div>

                {/* Tabs to switch recommended projects */}
                <div className="flex gap-2">
                  {result.analysis.recommendedProjects.map((p: any, i: number) => (
                    <button
                      key={i}
                      onClick={() => setActiveProjectIdx(i)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeProjectIdx === i
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Project {i + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Project display card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeProjectIdx}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                >
                  {/* Left Blueprint Metadata column */}
                  <div className="lg:col-span-1 space-y-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${getDifficultyColor(result.analysis.recommendedProjects[activeProjectIdx].difficulty)}`}>
                          {result.analysis.recommendedProjects[activeProjectIdx].difficulty}
                        </span>
                      </div>
                      <h4 className="text-base font-bold font-display text-white mt-1">
                        {result.analysis.recommendedProjects[activeProjectIdx].title}
                      </h4>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {result.analysis.recommendedProjects[activeProjectIdx].description}
                    </p>

                    <div className="space-y-1 pt-2">
                      <span className="text-[10px] font-mono text-slate-400 uppercase block">RECOMMENDED TECH STACK</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {result.analysis.recommendedProjects[activeProjectIdx].techStack.map((tech: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded-md text-[10px] font-mono border border-slate-700/50">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Recruiter justification & step-by-step blueprints */}
                  <div className="lg:col-span-2 space-y-5 bg-slate-800/40 p-5 rounded-2xl border border-slate-800">
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono text-indigo-300 uppercase block">{t.whyBuild}</span>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        {result.analysis.recommendedProjects[activeProjectIdx].whyBuild}
                      </p>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-slate-800/80">
                      <span className="text-[10px] font-mono text-indigo-300 uppercase block">{t.steps}</span>
                      <div className="space-y-2.5">
                        {result.analysis.recommendedProjects[activeProjectIdx].implementationSteps.map((step: string, i: number) => (
                          <div key={i} className="flex gap-3 text-xs text-slate-300">
                            <div className="w-5 h-5 rounded-md bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center font-mono text-indigo-400 font-bold shrink-0 mt-0.5">
                              {i + 1}
                            </div>
                            <p className="leading-relaxed pt-0.5 font-sans">
                              {step}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
