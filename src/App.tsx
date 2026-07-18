/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Award, 
  Flame, 
  Bot, 
  Mic, 
  FileText, 
  Radio, 
  LogOut, 
  User, 
  GraduationCap, 
  Sparkles,
  Heart,
  Globe,
  PlusCircle,
  TrendingUp,
  LayoutDashboard,
  ShieldCheck,
  Languages,
  Github
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Modular component imports
import DashboardView from './components/DashboardView';
import RoadmapView from './components/RoadmapView';
import DharmaView from './components/DharmaView';
import ChatbotView from './components/ChatbotView';
import ResumeView from './components/ResumeView';
import VoiceView from './components/VoiceView';
import PodcastView from './components/PodcastView';
import RatingView from './components/RatingView';
import AuthView from './components/AuthView';
import LandingPageView from './components/LandingPageView';
import IntroAnimationView from './components/IntroAnimationView';
import GitHubView from './components/GitHubView';

// Schema types
import { 
  StudentAnalytics, 
  StudentActivity, 
  Roadmap, 
  ChatHistoryItem, 
  Module 
} from './types';

// Predefined initial analytics template
const INITIAL_ANALYTICS: StudentAnalytics = {
  completedModulesCount: 0,
  totalModulesCount: 5,
  quizAverage: 82,
  studyHoursSpent: 12,
  skillLevels: {
    technical: 35,
    ethical: 32,
    analytical: 30,
    verbal: 28
  },
  activeStreak: 3,
  overallRating: 3.5
};

// Seed activities for initial feel
const INITIAL_ACTIVITIES: StudentActivity[] = [
  {
    id: 'act_1',
    activityType: 'roadmap_progress',
    description: 'Initialized career pathway & created study profile',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 * 2).toISOString(), // 2 days ago
    skillsImpacted: ['technical'],
    points: 15
  },
  {
    id: 'act_2',
    activityType: 'dharma_question',
    description: 'Asked Dharma AI about "Asynchronous Programming Ethics"',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    skillsImpacted: ['ethical', 'analytical'],
    points: 10
  }
];

export default function App() {
  // Authentication states
  const [studentName, setStudentName] = useState<string>(() => localStorage.getItem('edtech_student_name') || 'Guest Student');
  const [careerGoal, setCareerGoal] = useState<string>(() => localStorage.getItem('edtech_career_goal') || 'Full-Stack Software Developer');
  const [preferredLanguage, setPreferredLanguage] = useState<string>(() => localStorage.getItem('edtech_language') || 'English');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => !!localStorage.getItem('edtech_student_name'));
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authModalIsLogin, setAuthModalIsLogin] = useState<boolean>(true);
  const [showIntro, setShowIntro] = useState<boolean>(true);

  // App running states
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
  const [analytics, setAnalytics] = useState<StudentAnalytics>(() => {
    const cached = localStorage.getItem('edtech_analytics');
    return cached ? JSON.parse(cached) : INITIAL_ANALYTICS;
  });
  const [activities, setActivities] = useState<StudentActivity[]>(() => {
    const cached = localStorage.getItem('edtech_activities');
    if (cached) {
      try {
        const parsed: StudentActivity[] = JSON.parse(cached);
        const seenIds = new Set<string>();
        const unique: StudentActivity[] = [];
        parsed.forEach((act, idx) => {
          let uniqueId = act.id;
          if (!uniqueId || seenIds.has(uniqueId)) {
            uniqueId = `act_${Date.now()}_${Math.random().toString(36).substring(2, 9)}_${idx}`;
          }
          seenIds.add(uniqueId);
          unique.push({ ...act, id: uniqueId });
        });
        return unique;
      } catch (e) {
        return INITIAL_ACTIVITIES;
      }
    }
    return INITIAL_ACTIVITIES;
  });
  const [currentRoadmap, setCurrentRoadmap] = useState<Roadmap | null>(() => {
    const cached = localStorage.getItem('edtech_roadmap');
    if (cached) {
      try {
        const parsed: Roadmap = JSON.parse(cached);
        if (parsed && Array.isArray(parsed.modules)) {
          const seenIds = new Set<string>();
          parsed.modules = parsed.modules.map((mod, idx) => {
            let uniqueId = mod.id;
            if (!uniqueId || seenIds.has(uniqueId)) {
              uniqueId = `mod_${Date.now()}_${Math.random().toString(36).substring(2, 9)}_${idx}`;
            }
            seenIds.add(uniqueId);
            return { ...mod, id: uniqueId };
          });
        }
        return parsed;
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>(() => {
    const cached = localStorage.getItem('edtech_chat_history');
    if (cached) {
      try {
        const parsed: ChatHistoryItem[] = JSON.parse(cached);
        const seenIds = new Set<string>();
        const unique: ChatHistoryItem[] = [];
        parsed.forEach((msg, idx) => {
          let uniqueId = msg.id;
          if (!uniqueId || seenIds.has(uniqueId)) {
            uniqueId = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}_${idx}_${msg.role === 'user' ? 'u' : 'm'}`;
          }
          seenIds.add(uniqueId);
          unique.push({ ...msg, id: uniqueId });
        });
        return unique;
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Prefill hooks for tab quick transfers
  const [prefillConcept, setPrefillConcept] = useState<string>('');
  const [prefillTopic, setPrefillTopic] = useState<string>('');

  // Save states on mutations
  useEffect(() => {
    if (isLoggedIn && studentName !== 'Guest Student') {
      localStorage.setItem('edtech_student_name', studentName);
      localStorage.setItem('edtech_career_goal', careerGoal);
      localStorage.setItem('edtech_language', preferredLanguage);
    } else {
      localStorage.removeItem('edtech_student_name');
    }
  }, [studentName, careerGoal, preferredLanguage, isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('edtech_analytics', JSON.stringify(analytics));
  }, [analytics]);

  useEffect(() => {
    localStorage.setItem('edtech_activities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem('edtech_roadmap', JSON.stringify(currentRoadmap));
  }, [currentRoadmap]);

  useEffect(() => {
    localStorage.setItem('edtech_chat_history', JSON.stringify(chatHistory));
  }, [chatHistory]);

  // Handle Login submission
  const handleLoginSubmit = (name: string, goal: string, lang: string) => {
    setStudentName(name.trim());
    setCareerGoal(goal.trim());
    setPreferredLanguage(lang);
    setIsLoggedIn(true);
    
    // Reset analytical milestones
    setAnalytics(INITIAL_ANALYTICS);
    setActivities(INITIAL_ACTIVITIES);
    setCurrentRoadmap(null);
    setChatHistory([]);
    setCurrentTab('dashboard');
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  // Helper to log points and activities dynamically
  const logActivityPoints = (points: number, description: string, skills: (keyof StudentAnalytics['skillLevels'])[] = ['technical'], type: StudentActivity['activityType'] = 'roadmap_progress') => {
    const randomSuffix = Math.random().toString(36).substring(2, 9);
    const newAct: StudentActivity = {
      id: `act_${Date.now()}_${randomSuffix}`,
      activityType: type,
      description,
      timestamp: new Date().toISOString(),
      skillsImpacted: skills,
      points
    };

    setActivities(prev => [newAct, ...prev]);

    setAnalytics(prev => {
      const nextSkillLevels = { ...prev.skillLevels };
      skills.forEach(skill => {
        nextSkillLevels[skill] = Math.min(100, nextSkillLevels[skill] + Math.floor(points / 3));
      });

      // Recalculate dynamic stars based on completion & hours logged
      const ratio = prev.totalModulesCount > 0 ? prev.completedModulesCount / prev.totalModulesCount : 0;
      const calculatedRating = Math.min(5.0, 3.5 + ratio * 1.0 + (nextSkillLevels.ethical / 200));

      return {
        ...prev,
        studyHoursSpent: prev.studyHoursSpent + 1,
        skillLevels: nextSkillLevels,
        overallRating: calculatedRating
      };
    });
  };

  // 1. Career Goal Roadmap Generation
  const handleGenerateRoadmap = async (career: string, difficulty: string) => {
    if (!career) {
      // Clear action triggered by child reset
      setCurrentRoadmap(null);
      return;
    }

    try {
      const response = await fetch('/api/roadmap/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ careerGoal: career, difficulty, preferredLanguage })
      });

      if (!response.ok) {
        throw new Error('Failed to query roadmap sequence. Please try again.');
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setCurrentRoadmap(data);
      setAnalytics(prev => ({
        ...prev,
        completedModulesCount: 0,
        totalModulesCount: data.modules.length,
        overallRating: 3.8
      }));

      logActivityPoints(
        20, 
        `Generated AI learning roadmap: "${data.title}" (${difficulty} level)`,
        ['analytical'],
        'roadmap_progress'
      );
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // 2. Toggle Roadmap Module Completion Checklist
  const handleToggleModuleStatus = (moduleId: string, newStatus: 'not_started' | 'in_progress' | 'completed') => {
    if (!currentRoadmap) return;

    let targetMod: Module | undefined;
    const updatedModules = currentRoadmap.modules.map((m) => {
      if (m.id === moduleId) {
        targetMod = m;
        return { ...m, status: newStatus };
      }
      return m;
    });

    setCurrentRoadmap({ ...currentRoadmap, modules: updatedModules });

    if (newStatus === 'completed' && targetMod) {
      // Award points and level up
      setAnalytics(prev => {
        const nextCompleted = Math.min(prev.totalModulesCount, prev.completedModulesCount + 1);
        const nextSkillLevels = { ...prev.skillLevels };
        nextSkillLevels.technical = Math.min(100, nextSkillLevels.technical + 8);
        nextSkillLevels.ethical = Math.min(100, nextSkillLevels.ethical + 4);
        nextSkillLevels.analytical = Math.min(100, nextSkillLevels.analytical + 6);

        // Calculate stars
        const ratio = prev.totalModulesCount > 0 ? nextCompleted / prev.totalModulesCount : 0;
        const rating = Math.min(5.0, 3.8 + ratio * 1.0 + (nextSkillLevels.ethical / 300));

        return {
          ...prev,
          completedModulesCount: nextCompleted,
          skillLevels: nextSkillLevels,
          overallRating: rating,
          activeStreak: prev.activeStreak + 1
        };
      });

      logActivityPoints(50, `Completed Module Checklist: "${targetMod.title}"`, ['technical', 'analytical', 'ethical'], 'roadmap_progress');
    } else if (newStatus === 'in_progress' && targetMod) {
      logActivityPoints(10, `Started Learning Module: "${targetMod.title}"`, ['technical'], 'roadmap_progress');
    }
  };

  // 3. AI Chatbot Doubt Solver query
  const handleSendChatMessage = async (question: string) => {
    const randomSuffix = Math.random().toString(36).substring(2, 9);
    const userMsg: ChatHistoryItem = {
      id: `chat_${Date.now()}_${randomSuffix}_u`,
      role: 'user',
      text: question,
      timestamp: new Date().toISOString()
    };

    setChatHistory(prev => [...prev, userMsg]);

    try {
      const response = await fetch('/api/chatbot/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          history: chatHistory,
          preferredLanguage
        })
      });

      if (!response.ok) {
        throw new Error('Connection failed.');
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      const modelMsg: ChatHistoryItem = {
        id: `chat_${Date.now()}_${randomSuffix}_m`,
        role: 'model',
        text: data.text,
        timestamp: new Date().toISOString()
      };

      setChatHistory(prev => [...prev, modelMsg]);
      logActivityPoints(5, `Discussed academic doubt: "${question.substring(0, 30)}..."`, ['analytical'], 'chatbot_chat');
    } catch (err: any) {
      console.error(err);
      const errMsg: ChatHistoryItem = {
        id: `chat_${Date.now()}_${randomSuffix}_e`,
        role: 'model',
        text: 'Apologies, I encountered a connection issue while querying my resources. Let\'s try re-submitting.',
        timestamp: new Date().toISOString()
      };
      setChatHistory(prev => [...prev, errMsg]);
    }
  };

  // 4. Quick Actions for Tab Redirections
  const handleQuickAction = (tab: string, prefillData: string) => {
    if (tab === 'dharma') {
      setPrefillConcept(prefillData);
    } else if (tab === 'podcast') {
      setPrefillTopic(prefillData);
    }
    setCurrentTab(tab);
  };

  // Compute overall experience points (sum of completed log points)
  const totalPointsEarned = activities.reduce((acc, curr) => acc + curr.points, 0);

  if (showIntro) {
    return <IntroAnimationView onComplete={() => setShowIntro(false)} />;
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans bg-[#fafbfc] ${isLoggedIn ? 'selection:bg-emerald-500/20 selection:text-emerald-800' : 'selection:bg-indigo-500/20 selection:text-indigo-800'}`} id="main-applet-root">
      
      {!isLoggedIn ? (
        <LandingPageView
          onSignIn={() => {
            setAuthModalIsLogin(true);
            setShowAuthModal(true);
          }}
          onJoinFree={() => {
            setAuthModalIsLogin(false);
            setShowAuthModal(true);
          }}
        />
      ) : (
        <motion.div
          key="applet"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 flex flex-col h-screen overflow-hidden"
          id="main-dashboard-applet"
        >
        {/* Top Navigation Bar */}
        <header className="bg-slate-900 border-b border-slate-800 text-white shrink-0 px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm z-20" id="header-bar">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold font-display shadow-inner">
              <GraduationCap className="w-6 h-6 text-indigo-100" />
            </div>
            <div>
              <h1 className="text-lg font-display font-bold text-slate-100 flex items-center gap-1.5 leading-none">
                Intellexa
              </h1>
              <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider block mt-0.5 font-mono">
                Wisdom-driven career guide
              </span>
            </div>
          </div>

          {/* Dynamic Badges in Header */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            {/* Points */}
            <div className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5" title="Accumulated active points">
              <Award className="w-4 h-4 text-indigo-400" />
              <span className="text-slate-300">XP:</span>
              <strong className="text-white">{totalPointsEarned} pts</strong>
            </div>

            {/* Streak */}
            <div className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5" title="Continuous study streak">
              <Flame className="w-4 h-4 text-amber-500" />
              <span className="text-slate-300">Streak:</span>
              <strong className="text-white">{analytics.activeStreak} days</strong>
            </div>

            {/* Language selection dropdown in header */}
            <div className="bg-slate-800 border border-slate-700 px-2.5 py-1.5 rounded-lg flex items-center gap-2" title="Select translation language">
              <Languages className="w-4 h-4 text-slate-400" />
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-200 focus:outline-hidden cursor-pointer"
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="Hindi">Hindi</option>
                <option value="Telugu">Telugu</option>
              </select>
            </div>

            {/* Student Profile Action */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              {!isLoggedIn ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setAuthModalIsLogin(true);
                      setShowAuthModal(true);
                    }}
                    className="px-3 py-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer border border-transparent hover:border-slate-700"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setAuthModalIsLogin(false);
                      setShowAuthModal(true);
                    }}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                    Join Free
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-indigo-950 border border-indigo-500/40 flex items-center justify-center font-bold font-display text-indigo-300 shadow-sm shadow-indigo-500/10" title={studentName}>
                    {studentName ? studentName[0].toUpperCase() : 'G'}
                  </div>
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-[10px] text-slate-300 font-bold max-w-[100px] truncate leading-none">{studentName}</span>
                    <span className="text-[8px] text-indigo-400 font-mono tracking-wide mt-0.5 max-w-[100px] truncate leading-none">{careerGoal}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                    title="Change Student Profile"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

            {/* Dashboard Workspace */}
            <div className="flex-1 flex overflow-hidden relative" id="workspace-layout">
              {/* Left Sidebar navigation */}
              <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 hidden md:flex flex-col shrink-0 py-6" id="sidebar-panel">
                <nav className="flex-1 px-4 space-y-1.5 text-sm" id="sidebar-navigation">
                  {/* Item 1: Dashboard */}
                  <button
                    onClick={() => setCurrentTab('dashboard')}
                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all font-semibold cursor-pointer ${
                      currentTab === 'dashboard'
                        ? 'bg-indigo-600/10 text-indigo-400 border-l-4 border-indigo-500 shadow-xs'
                        : 'hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </button>

                  {/* Item 2: Roadmap */}
                  <button
                    onClick={() => setCurrentTab('roadmap')}
                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all font-semibold cursor-pointer ${
                      currentTab === 'roadmap'
                        ? 'bg-indigo-600/10 text-indigo-400 border-l-4 border-indigo-500 shadow-xs'
                        : 'hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Compass className="w-4 h-4" />
                    Learning Roadmap
                  </button>

                  {/* Item 3: Dharma Explainer */}
                  <button
                    onClick={() => setCurrentTab('dharma')}
                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all font-semibold cursor-pointer ${
                      currentTab === 'dharma'
                        ? 'bg-indigo-600/10 text-indigo-400 border-l-4 border-indigo-500 shadow-xs'
                        : 'hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Epic Concept Explainer
                  </button>

                  {/* Item 4: Doubt Chatbot */}
                  <button
                    onClick={() => setCurrentTab('chatbot')}
                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all font-semibold cursor-pointer ${
                      currentTab === 'chatbot'
                        ? 'bg-indigo-600/10 text-indigo-400 border-l-4 border-indigo-500 shadow-xs'
                        : 'hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Bot className="w-4 h-4" />
                    Doubt Chatbot
                  </button>

                  {/* Item 5: Resume Scanner */}
                  <button
                    onClick={() => setCurrentTab('resume')}
                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all font-semibold cursor-pointer ${
                      currentTab === 'resume'
                        ? 'bg-indigo-600/10 text-indigo-400 border-l-4 border-indigo-500 shadow-xs'
                        : 'hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    Resume Scanner
                  </button>

                  {/* Item 6: Voice study buddy */}
                  <button
                    onClick={() => setCurrentTab('voice')}
                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all font-semibold cursor-pointer ${
                      currentTab === 'voice'
                        ? 'bg-indigo-600/10 text-indigo-400 border-l-4 border-indigo-500 shadow-xs'
                        : 'hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                    Voice study buddy
                  </button>

                  {/* Item 7: Podcasts */}
                  <button
                    onClick={() => setCurrentTab('podcast')}
                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all font-semibold cursor-pointer ${
                      currentTab === 'podcast'
                        ? 'bg-indigo-600/10 text-indigo-400 border-l-4 border-indigo-500 shadow-xs'
                        : 'hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Radio className="w-4 h-4" />
                    Podcasts Generator
                  </button>

                  {/* Item 8: Dharma evaluations */}
                  <button
                    onClick={() => setCurrentTab('rating')}
                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all font-semibold cursor-pointer ${
                      currentTab === 'rating'
                        ? 'bg-indigo-600/10 text-indigo-400 border-l-4 border-indigo-500 shadow-xs'
                        : 'hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Award className="w-4 h-4" />
                    Dharma Evaluation
                  </button>

                  {/* Item 9: GitHub Recruiter Analyzer */}
                  <button
                    onClick={() => setCurrentTab('github')}
                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all font-semibold cursor-pointer ${
                      currentTab === 'github'
                        ? 'bg-indigo-600/10 text-indigo-400 border-l-4 border-indigo-500 shadow-xs'
                        : 'hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Github className="w-4 h-4" />
                    GitHub Analyzer
                  </button>
                </nav>

                <div className="px-6 border-t border-slate-800 pt-6 font-mono text-[10px] text-slate-500 space-y-1">
                  <div>Model: gemini-3.5-flash</div>
                  <div>Status: Core System Live</div>
                </div>
              </aside>

              {/* Mobile Navigation bar/strip */}
              <div className="absolute bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex justify-around p-2 md:hidden z-10 text-[10px] text-slate-400">
                <button onClick={() => setCurrentTab('dashboard')} className={`flex flex-col items-center gap-1 cursor-pointer ${currentTab === 'dashboard' ? 'text-indigo-400' : ''}`}>
                  <LayoutDashboard className="w-4.5 h-4.5" />
                  <span>Dashboard</span>
                </button>
                <button onClick={() => setCurrentTab('roadmap')} className={`flex flex-col items-center gap-1 cursor-pointer ${currentTab === 'roadmap' ? 'text-indigo-400' : ''}`}>
                  <Compass className="w-4.5 h-4.5" />
                  <span>Roadmap</span>
                </button>
                <button onClick={() => setCurrentTab('dharma')} className={`flex flex-col items-center gap-1 cursor-pointer ${currentTab === 'dharma' ? 'text-indigo-400' : ''}`}>
                  <ShieldCheck className="w-4.5 h-4.5" />
                  <span>Explainer</span>
                </button>
                <button onClick={() => setCurrentTab('chatbot')} className={`flex flex-col items-center gap-1 cursor-pointer ${currentTab === 'chatbot' ? 'text-indigo-400' : ''}`}>
                  <Bot className="w-4.5 h-4.5" />
                  <span>Chatbot</span>
                </button>
                <button onClick={() => setCurrentTab('resume')} className={`flex flex-col items-center gap-1 cursor-pointer ${currentTab === 'resume' ? 'text-indigo-400' : ''}`}>
                  <FileText className="w-4.5 h-4.5" />
                  <span>Resume</span>
                </button>
                <button onClick={() => setCurrentTab('voice')} className={`flex flex-col items-center gap-1 cursor-pointer ${currentTab === 'voice' ? 'text-indigo-400' : ''}`}>
                  <Mic className="w-4.5 h-4.5" />
                  <span>Voice</span>
                </button>
                <button onClick={() => setCurrentTab('podcast')} className={`flex flex-col items-center gap-1 cursor-pointer ${currentTab === 'podcast' ? 'text-indigo-400' : ''}`}>
                  <Radio className="w-4.5 h-4.5" />
                  <span>Podcasts</span>
                </button>
                <button onClick={() => setCurrentTab('rating')} className={`flex flex-col items-center gap-1 cursor-pointer ${currentTab === 'rating' ? 'text-indigo-400' : ''}`}>
                  <Award className="w-4.5 h-4.5" />
                  <span>Rating</span>
                </button>
                <button onClick={() => setCurrentTab('github')} className={`flex flex-col items-center gap-1 cursor-pointer ${currentTab === 'github' ? 'text-indigo-400' : ''}`}>
                  <Github className="w-4.5 h-4.5" />
                  <span>GitHub</span>
                </button>
              </div>

              {/* Main Content Pane */}
              <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-16 md:pb-8 bg-[#fafbfc] scrollbar-thin" id="workspace-content">
                <AnimatePresence mode="wait">
                  {currentTab === 'dashboard' && (
                    <motion.div key="dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <DashboardView
                        studentName={studentName}
                        careerGoal={careerGoal}
                        analytics={analytics}
                        activities={activities}
                        onNavigate={handleQuickAction}
                      />
                    </motion.div>
                  )}

                  {currentTab === 'roadmap' && (
                    <motion.div key="road" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <RoadmapView
                        currentRoadmap={currentRoadmap}
                        onGenerateRoadmap={handleGenerateRoadmap}
                        onToggleModuleStatus={handleToggleModuleStatus}
                        onQuickAction={handleQuickAction}
                        preferredLanguage={preferredLanguage}
                      />
                    </motion.div>
                  )}

                  {currentTab === 'dharma' && (
                    <motion.div key="dharm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <DharmaView
                        prefillConcept={prefillConcept}
                        onClearPrefill={() => setPrefillConcept('')}
                        preferredLanguage={preferredLanguage}
                      />
                    </motion.div>
                  )}

                  {currentTab === 'chatbot' && (
                    <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <ChatbotView
                        chatHistory={chatHistory}
                        onSendMessage={handleSendChatMessage}
                        onClearHistory={() => setChatHistory([])}
                        preferredLanguage={preferredLanguage}
                      />
                    </motion.div>
                  )}

                  {currentTab === 'resume' && (
                    <motion.div key="res" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <ResumeView
                        careerGoal={careerGoal}
                        onAnalyzeComplete={(pts, desc) => logActivityPoints(pts, desc, ['analytical', 'verbal'], 'resume_analyzer')}
                        preferredLanguage={preferredLanguage}
                      />
                    </motion.div>
                  )}

                  {currentTab === 'voice' && (
                    <motion.div key="voic" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <VoiceView
                        onActivityComplete={(pts, desc) => logActivityPoints(pts, desc, ['verbal'], 'voice_assistant')}
                        preferredLanguage={preferredLanguage}
                      />
                    </motion.div>
                  )}

                  {currentTab === 'podcast' && (
                    <motion.div key="pod" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <PodcastView
                        prefillTopic={prefillTopic}
                        onClearPrefill={() => setPrefillTopic('')}
                        onActivityComplete={(pts, desc) => logActivityPoints(pts, desc, ['verbal', 'ethical'], 'podcast_listen')}
                        preferredLanguage={preferredLanguage}
                      />
                    </motion.div>
                  )}

                  {currentTab === 'rating' && (
                    <motion.div key="rat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <RatingView
                        analytics={analytics}
                        preferredLanguage={preferredLanguage}
                      />
                    </motion.div>
                  )}

                  {currentTab === 'github' && (
                    <motion.div key="git" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <GitHubView
                        preferredLanguage={preferredLanguage}
                        onActivityComplete={(pts, desc) => logActivityPoints(pts, desc, ['technical', 'analytical'], 'github_analyze')}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </main>
            </div>
          </motion.div>
        )}

          {/* Custom Auth Modal overlay */}
          <AnimatePresence>
            {showAuthModal && (
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="w-full max-w-4xl"
                >
                  <AuthView
                    onAuthSuccess={(name, goal, lang) => {
                      setStudentName(name);
                      setCareerGoal(goal);
                      setPreferredLanguage(lang);
                      setIsLoggedIn(true);
                      setShowAuthModal(false);
                      logActivityPoints(25, `Authenticated as ${name} - Sync Complete`, ['technical', 'analytical', 'ethical']);
                    }}
                    onClose={() => setShowAuthModal(false)}
                    initialIsLogin={authModalIsLogin}
                  />
                </motion.div>
              </div>
            )}
          </AnimatePresence>

      {/* Custom Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50" id="logout-confirm-modal">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-xl space-y-4"
            >
              <div className="flex gap-3 items-start">
                <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
                  <LogOut className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-slate-800 text-lg">Confirm Logout</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">
                    Are you sure you want to log out? Your local study plans will be cleared from this browser session.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  id="btn-cancel-logout"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowLogoutModal(false);
                    setStudentName('Guest Student');
                    setCareerGoal('Full-Stack Software Developer');
                    setIsLoggedIn(false);
                    setCurrentRoadmap(null);
                    setChatHistory([]);
                    localStorage.removeItem('edtech_student_name');
                    localStorage.removeItem('edtech_career_goal');
                    localStorage.removeItem('edtech_roadmap');
                    localStorage.removeItem('edtech_chat_history');
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  id="btn-confirm-logout"
                >
                  Log Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
