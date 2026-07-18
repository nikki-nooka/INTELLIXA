/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LeetCodeProblem {
  title: string;
  url: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface YouTubeVideo {
  title: string;
  url: string;
  duration: string;
}

export interface IndustryUseCase {
  company: string;
  useCase: string;
  justification: string;
}

export interface Module {
  id: string;
  title: string;
  duration: string;
  topics: string[];
  description: string;
  status: 'not_started' | 'in_progress' | 'completed';
  ethicalWisdom: string;
  targetRole?: string;
  youtubeVideos?: YouTubeVideo[];
  leetcodeProblems?: LeetCodeProblem[];
  curatedContent?: string[];
  industryUseCases?: IndustryUseCase[];
}

export interface Roadmap {
  title: string;
  description: string;
  careerGoal: string;
  duration: string;
  difficulty: string;
  modules: Module[];
}

export interface RecommendItem {
  title: string;
  url: string;
  duration?: string;
  source?: string;
}

export interface SpeechText {
  title: string;
  text: string;
  translation: string;
}

export interface Attestation {
  title: string;
  pledge: string;
}

export interface MythologicalExample {
  epic: string;
  story: string;
  ethicalLesson: string;
}

export interface EpicProject {
  title: string;
  description: string;
  steps: string[];
  codeSnippet?: string;
}

export interface DharmaExplanation {
  answerText: string;
  realLifeProject?: EpicProject;
  asciiDiagram?: string;
  recursiveFollowUps: string[];
}

export interface ChatHistoryItem {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface ResumeChecklistItem {
  id: string;
  label: string;
  status: 'pass' | 'warn' | 'fail';
  recommendation: string;
}

export interface SuggestedChange {
  section: string;
  originalText?: string;
  suggestedText: string;
  explanation: string;
}

export interface ResumeAnalysis {
  score: number;
  checklist: ResumeChecklistItem[];
  strengths: string[];
  gaps: string[];
  suggestedChanges: SuggestedChange[];
  jobDescriptionText?: string;
  drawbacks?: string[];
  gapsWithJobDescription?: string[];
  keyInsights?: string[];
  keyFormatsToSolve?: string[];
  optimizedResumeText?: string;
}

export interface SkillLevels {
  technical: number;
  ethical: number;
  analytical: number;
  verbal: number;
}

export interface StudentAnalytics {
  completedModulesCount: number;
  totalModulesCount: number;
  quizAverage: number;
  studyHoursSpent: number;
  skillLevels: SkillLevels;
  activeStreak: number;
  overallRating: number; // 0-5 stars
}

export interface PodcastDialogueTurn {
  id: string;
  speaker: 'Alex' | 'Dharma';
  text: string;
  emotion: string;
}

export interface PodcastEpisode {
  topic: string;
  script: PodcastDialogueTurn[];
}

export interface StudentActivity {
  id: string;
  activityType: 'roadmap_progress' | 'dharma_question' | 'chatbot_chat' | 'resume_analyzer' | 'podcast_listen' | 'voice_assistant' | 'github_analyze';
  description: string;
  timestamp: string;
  skillsImpacted: (keyof SkillLevels)[];
  points: number;
}
