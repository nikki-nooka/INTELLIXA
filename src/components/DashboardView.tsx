/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Compass, 
  Award, 
  Flame, 
  Clock, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle,
  HelpCircle,
  Sparkles,
  BookOpen,
  Github
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { motion } from 'motion/react';
import { StudentAnalytics, StudentActivity, SkillLevels } from '../types';

interface DashboardViewProps {
  studentName: string;
  careerGoal: string;
  analytics: StudentAnalytics;
  activities: StudentActivity[];
  onNavigate: (tab: string, extraData?: any) => void;
}

export default function DashboardView({
  studentName,
  careerGoal,
  analytics,
  activities,
  onNavigate
}: DashboardViewProps) {
  // Pre-formatted chart data for Weekly Study Hours
  const studyHoursData = [
    { day: 'Mon', hours: 2.4 },
    { day: 'Tue', hours: 3.1 },
    { day: 'Wed', hours: 1.8 },
    { day: 'Thu', hours: 4.2 },
    { day: 'Fri', hours: 3.5 },
    { day: 'Sat', hours: 5.0 },
    { day: 'Sun', hours: 2.1 }
  ];

  // Pre-formatted skill data for BarChart
  const skillData = [
    { name: 'Technical', score: analytics.skillLevels.technical, color: '#10b981' },
    { name: 'Ethical', score: analytics.skillLevels.ethical, color: '#3b82f6' },
    { name: 'Analytical', score: analytics.skillLevels.analytical, color: '#8b5cf6' },
    { name: 'Verbal', score: analytics.skillLevels.verbal, color: '#f59e0b' }
  ];

  // Recommendations based on selected career
  const recommendations = [
    {
      id: 'rec1',
      title: 'Analyze your Resume',
      description: `Scan your resume against your target goal: "${careerGoal || 'Software Engineer'}" to find ATS gaps.`,
      icon: TrendingUp,
      actionLabel: 'Analyze Now',
      tab: 'resume',
      bg: 'bg-emerald-50 border-emerald-100 hover:bg-emerald-100/50',
      iconColor: 'text-emerald-600',
    },
    {
      id: 'rec2',
      title: 'Explore Ethical Concept of the Day',
      description: 'Ask Dharma AI about "Algorithmic Fairness & Bias" to elevate your Ethical Mastery index.',
      icon: Sparkles,
      actionLabel: 'Ask Dharma AI',
      tab: 'dharma',
      extraData: 'Algorithmic Fairness and Bias',
      bg: 'bg-blue-50 border-blue-100 hover:bg-blue-100/50',
      iconColor: 'text-blue-600',
    },
    {
      id: 'rec3',
      title: 'Listen to Podcast',
      description: 'Dharma and Alex discuss the social responsibility of tech developers.',
      icon: BookOpen,
      actionLabel: 'Listen Now',
      tab: 'podcast',
      extraData: 'Responsibilities of Software Engineers',
      bg: 'bg-indigo-50 border-indigo-100 hover:bg-indigo-100/50',
      iconColor: 'text-indigo-600',
    },
    {
      id: 'rec4',
      title: 'Analyze GitHub Profile',
      description: 'Audit your public GitHub repositories against industry recruiter benchmarks.',
      icon: Github,
      actionLabel: 'Analyze GitHub',
      tab: 'github',
      bg: 'bg-indigo-50 border-indigo-100 hover:bg-indigo-100/50',
      iconColor: 'text-indigo-600',
    }
  ];

  return (
    <div className="space-y-6" id="dashboard-container">
      {/* Welcome Banner - Styled as a large Bento Hero Panel */}
      <div className="bg-slate-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-sm border border-slate-800" id="welcome-banner">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Compass className="w-64 h-64 text-indigo-400 rotate-12" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="bg-indigo-500/20 text-indigo-300 font-mono text-xs px-3 py-1 rounded-full uppercase tracking-wider font-semibold border border-indigo-500/30">
              Personalized Student Portal
            </span>
            <h1 className="text-3xl md:text-4xl font-display font-bold mt-4 tracking-tight">
              Greetings, {studentName || 'Student'}!
            </h1>
            <p className="text-slate-300 mt-2 text-sm md:text-base leading-relaxed">
              Your pathway to <span className="text-indigo-300 font-semibold">{careerGoal || 'your dream career'}</span> is active. Remember: Technical brilliance earns a living, but alignment with ethical responsibility (Dharma) builds a legacy.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <button 
                onClick={() => onNavigate('roadmap')} 
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                id="btn-view-roadmap"
              >
                Continue Learning Roadmap
                <ArrowRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => onNavigate('dharma')} 
                className="bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium px-5 py-2.5 rounded-xl text-sm transition-all border border-slate-700 flex items-center gap-2 cursor-pointer"
                id="btn-ask-dharma"
              >
                Ask Dharma AI
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bento Grid Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="bento-grid-stats">
        {/* Card 1: Career Target */}
        <div className="bento-card flex items-start justify-between" id="card-career-target">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-display">Target Path</span>
            <h3 className="text-base font-bold text-slate-800 tracking-tight leading-tight mt-1">{careerGoal || 'Not Set'}</h3>
            <p className="text-xs text-slate-400 mt-2">
              Modules: {analytics.completedModulesCount}/{analytics.totalModulesCount} completed
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 shrink-0">
            <Compass className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Dharma Ethics Rating */}
        <div className="bento-card flex items-start justify-between" id="card-dharma-index">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-display">Dharma Ethics Index</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-bold text-slate-800 font-mono">92%</span>
              <span className="text-xs text-indigo-600 font-semibold">+4% vs last week</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">Holistic & mindful usage index</p>
          </div>
          <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 shrink-0">
            <Award className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Active Streak */}
        <div className="bento-card flex items-start justify-between" id="card-active-streak">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-display">Study Streak</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-bold text-slate-800 font-mono">{analytics.activeStreak} Days</span>
              <span className="text-xs text-amber-600 font-semibold">Keep it up!</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">Consistent learning pays off</p>
          </div>
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-500 shrink-0">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Study Hours */}
        <div className="bento-card flex items-start justify-between" id="card-study-hours">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-display">Study Time</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-bold text-slate-800 font-mono">{analytics.studyHoursSpent} Hrs</span>
              <span className="text-xs text-indigo-600 font-semibold">Goal: 40 hrs</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">This month's accumulated hours</p>
          </div>
          <div className="p-3 rounded-2xl bg-sky-50 text-sky-600 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="charts-container">
        {/* Weekly Study Hours AreaChart */}
        <div className="bento-card space-y-4" id="weekly-hours-chart">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-slate-800">Weekly Performance Logs</h3>
              <p className="text-xs text-slate-400">Active learning hours logged over the past 7 days</p>
            </div>
            <span className="text-xs font-semibold bg-indigo-50 text-indigo-800 px-2.5 py-1 rounded-lg">Avg: 3.2 hrs/day</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={studyHoursData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorHours)" name="Hours Studied" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skill Dimensions BarChart */}
        <div className="bento-card space-y-4" id="skill-dimensions-chart">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-slate-800">Skill Dimensions</h3>
              <p className="text-xs text-slate-400">Holistic proficiency score breakdown (out of 100)</p>
            </div>
            <span className="text-xs font-semibold bg-indigo-50 text-indigo-800 px-2.5 py-1 rounded-lg font-mono">Dharma Score: {analytics.overallRating * 20}%</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="score" radius={[6, 6, 0, 0]} name="Skill Score">
                  {skillData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color === '#10b981' ? '#6366f1' : entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recommendations & Activities Block */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6" id="dashboard-extras">
        {/* Recommended Actions */}
        <div className="xl:col-span-2 space-y-4" id="rec-actions-container">
          <h3 className="font-display font-bold text-lg text-slate-800 flex items-center gap-2 px-1">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            Recommended Path Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-1 gap-4">
            {recommendations.map((rec) => {
              const Icon = rec.icon;
              return (
                <div 
                  key={rec.id} 
                  className={`p-5 rounded-3xl border transition-all flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 ${
                    rec.tab === 'resume' ? 'bg-indigo-50/50 border-indigo-100 hover:bg-indigo-100/30' :
                    rec.tab === 'dharma' ? 'bg-indigo-50/50 border-indigo-100 hover:bg-indigo-100/30' :
                    'bg-indigo-50/50 border-indigo-100 hover:bg-indigo-100/30'
                  }`}
                >
                  <div className="flex gap-4 items-start">
                    <div className="p-2.5 rounded-2xl bg-white shrink-0 shadow-2xs border border-slate-100 text-indigo-600">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm md:text-base">{rec.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{rec.description}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => onNavigate(rec.tab, rec.extraData)} 
                    className="text-xs font-semibold uppercase tracking-wider text-indigo-600 hover:text-indigo-700 bg-white px-4 py-2.5 rounded-xl border border-indigo-100 hover:border-indigo-200 shadow-2xs self-end xl:self-auto shrink-0 cursor-pointer"
                  >
                    {rec.actionLabel}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity Log Feed */}
        <div className="bento-card flex flex-col space-y-4" id="activities-feed">
          <h3 className="font-display font-bold text-slate-800 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-indigo-500" />
            Activity Logs
          </h3>
          <div className="flex-1 overflow-y-auto max-h-[340px] pr-1 space-y-4 text-sm scrollbar-thin">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <AlertCircle className="w-8 h-8 mx-auto stroke-1" />
                <p className="text-xs mt-2">No learning logs recorded yet.</p>
              </div>
            ) : (
              activities.map((act) => (
                <div key={act.id} className="relative pl-5 border-l-2 border-slate-100 group pb-1">
                  <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-slate-200 group-hover:bg-indigo-500 transition-colors border-2 border-white" />
                  <div className="flex justify-between items-start gap-2">
                    <p className="text-slate-700 leading-snug font-medium text-xs sm:text-sm">{act.description}</p>
                    <span className="text-indigo-600 font-mono text-[11px] font-bold shrink-0">+{act.points} pts</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {act.skillsImpacted.map((skill) => (
                      <span key={skill} className="text-[9px] bg-slate-100 text-slate-600 font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
