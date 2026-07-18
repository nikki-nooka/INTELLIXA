/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Star, 
  Award, 
  ShieldCheck, 
  Zap, 
  HelpCircle, 
  Users, 
  BookOpen, 
  Map, 
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { motion } from 'motion/react';
import { StudentAnalytics, SkillLevels } from '../types';

interface RatingViewProps {
  analytics: StudentAnalytics;
  preferredLanguage: string;
}

interface BadgeConfig {
  id: string;
  title: string;
  description: string;
  reqText: string;
  icon: any;
  color: string;
  isUnlocked: boolean;
}

export default function RatingView({
  analytics,
  preferredLanguage
}: RatingViewProps) {
  // Star rating calculation
  const starsCount = Math.floor(analytics.overallRating);
  const hasHalfStar = analytics.overallRating % 1 >= 0.5;

  // Compute active badge un-locks based on student analytics
  const badgesList: BadgeConfig[] = [
    {
      id: 'badge1',
      title: 'Dharma Disciple',
      description: 'Awarded for integrating ethical responsibility directly with technical studies.',
      reqText: 'Ask a doubt or read a Dharma tip',
      icon: ShieldCheck,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      isUnlocked: true // Always unlocked once they sign up and start
    },
    {
      id: 'badge2',
      title: 'Technical Titan',
      description: 'Demonstrated extensive capability in computational sciences & system code.',
      reqText: 'Technical skill score >= 50',
      icon: Zap,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
      isUnlocked: analytics.skillLevels.technical >= 50
    },
    {
      id: 'badge3',
      title: 'Verbal Virtuoso',
      description: 'Acquired highly articulating skills via voice simulations or podcast reviews.',
      reqText: 'Verbal skill score >= 50',
      icon: Users,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
      isUnlocked: analytics.skillLevels.verbal >= 50
    },
    {
      id: 'badge4',
      title: 'Resume Ready',
      description: 'Formatted and scanned a resume targeting automated recruiter filters.',
      reqText: 'Scan your resume on ATS',
      icon: Award,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
      isUnlocked: analytics.completedModulesCount >= 1 // Unlock upon starting studies or scans
    },
    {
      id: 'badge5',
      title: 'Ethical Alchemist',
      description: 'Reaches a high state of mindful understanding regarding modern tech impacts.',
      reqText: 'Ethical skill score >= 60',
      icon: HeartIcon, // Custom or fallback
      color: 'bg-pink-50 text-pink-600 border-pink-200',
      isUnlocked: analytics.skillLevels.ethical >= 60
    },
    {
      id: 'badge6',
      title: 'Master of Balance',
      description: 'Achieved complete alignment in Technical, Ethical, Analytical, and Verbal skills.',
      reqText: 'All skill fields >= 55',
      icon: Map,
      color: 'bg-slate-900 text-white border-slate-800',
      isUnlocked: 
        analytics.skillLevels.technical >= 55 &&
        analytics.skillLevels.ethical >= 55 &&
        analytics.skillLevels.analytical >= 55 &&
        analytics.skillLevels.verbal >= 55
    }
  ];

  function HeartIcon(props: any) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    );
  }

  // Count unlocked badges
  const unlockedCount = badgesList.filter(b => b.isUnlocked).length;

  return (
    <div className="space-y-6" id="rating-module-container">
      {/* Header */}
      <div>
        <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">
          Student Assessment
        </span>
        <h2 className="text-2xl font-display font-bold text-slate-800 mt-2">Dharma AI Evaluation</h2>
        <p className="text-xs sm:text-sm text-slate-400">View your comprehensive learning score, unlock rewards, and review feedback reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="rating-dashboard-row">
        {/* Left Column: Star Rating Card & Stats */}
        <div className="lg:col-span-1 space-y-6">
          {/* Star Rating summary */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs text-center space-y-4">
            <h3 className="font-display font-bold text-slate-400 text-xs uppercase tracking-wide">AI Mentor Evaluation</h3>
            
            <div className="space-y-1">
              <div className="flex justify-center items-center gap-1 text-amber-400" id="rating-stars">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star 
                    key={idx} 
                    className={`w-6 h-6 ${idx < starsCount ? 'fill-amber-400 text-amber-400' : 'stroke-slate-300'}`} 
                  />
                ))}
              </div>
              <div className="text-3xl font-bold font-mono text-slate-800 pt-1">
                {analytics.overallRating.toFixed(1)} / 5.0
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              Your rating is computed dynamically by AI based on course progress, checklist points completed, and ethical considerations answered.
            </p>

            <div className="border-t border-slate-100 pt-4 text-xs font-semibold text-slate-600 flex justify-between">
              <span>Unlocked Badges:</span>
              <span className="text-indigo-600 font-bold">{unlockedCount} / {badgesList.length}</span>
            </div>
          </div>

          {/* Core study levels metrics list */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-display font-bold text-slate-800 text-sm uppercase tracking-wide">Skill Progress Indicators</h3>
            
            <div className="space-y-4 text-xs">
              {/* Progress Item 1 */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>Technical Code Craft</span>
                  <span className="font-mono">{analytics.skillLevels.technical}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full transition-all duration-500" style={{ width: `${analytics.skillLevels.technical}%` }} />
                </div>
              </div>

              {/* Progress Item 2 */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>Dharma Ethical Mindfulness</span>
                  <span className="font-mono">{analytics.skillLevels.ethical}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full transition-all duration-500" style={{ width: `${analytics.skillLevels.ethical}%` }} />
                </div>
              </div>

              {/* Progress Item 3 */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>Logical & Analytical Analytics</span>
                  <span className="font-mono">{analytics.skillLevels.analytical}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-600 h-full transition-all duration-500" style={{ width: `${analytics.skillLevels.analytical}%` }} />
                </div>
              </div>

              {/* Progress Item 4 */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>Articulative & Verbal Skills</span>
                  <span className="font-mono">{analytics.skillLevels.verbal}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full transition-all duration-500" style={{ width: `${analytics.skillLevels.verbal}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Badges Collection Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-display font-bold text-slate-800 text-base">Your Unlocked Achievement Badges</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {badgesList.map((badge) => {
                const Icon = badge.icon;
                return (
                  <div 
                    key={badge.id}
                    className={`p-5 rounded-2xl border flex gap-4 transition-all ${
                      badge.isUnlocked 
                        ? 'bg-white border-slate-200 opacity-100 shadow-2xs hover:shadow-xs' 
                        : 'bg-slate-50/50 border-slate-100 opacity-50 select-none'
                    }`}
                  >
                    <div className={`p-3 rounded-xl border shrink-0 flex items-center justify-center ${
                      badge.isUnlocked ? badge.color : 'bg-slate-100 border-slate-200 text-slate-400'
                    }`}>
                      <Icon className="w-6 h-6 shrink-0" />
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-slate-800">{badge.title}</h4>
                        {badge.isUnlocked ? (
                          <span className="text-[9px] font-bold bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded uppercase font-mono">
                            Earned
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold bg-slate-200 text-slate-600 px-1.5 py-0.2 rounded uppercase font-mono">
                            Locked
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 leading-relaxed font-medium">{badge.description}</p>
                      <p className="text-[10px] text-slate-400 font-semibold pt-1 border-t border-slate-50 mt-1">
                        Requirement: <em>{badge.reqText}</em>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
