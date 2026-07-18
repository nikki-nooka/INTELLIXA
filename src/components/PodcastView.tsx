/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Mic, 
  Sparkles, 
  RotateCcw, 
  HelpCircle, 
  Radio, 
  Volume2, 
  VolumeX,
  Volume1,
  BookOpen,
  AlertCircle,
  Settings,
  Sliders
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PodcastEpisode, PodcastDialogueTurn } from '../types';

interface PodcastViewProps {
  prefillTopic: string;
  onClearPrefill: () => void;
  onActivityComplete: (points: number, desc: string) => void;
  preferredLanguage: string;
}

const PRESET_TOPICS = [
  'Responsibilities of Tech Developers',
  'Ethics of Generative AI & Data Scraping',
  'Sustainable Green Cloud Computing',
  'Why Privacy is a Fundamental Right in Code',
  'Algorithmic Fairness in Machine Learning Models'
];

function selectVoice(speaker: 'Alex' | 'Dharma', preferredLanguage: string): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  // Normalize language prefix (e.g. 'en', 'es', 'te')
  const langLower = preferredLanguage === 'Spanish' ? 'es' : preferredLanguage === 'Telugu' ? 'te' : 'en';

  // Filter voices that match the language prefix
  const langVoices = voices.filter(v => v.lang.toLowerCase().startsWith(langLower));
  if (langVoices.length === 0) {
    // Fallback to any voice that matches or first available
    const fallback = voices.find(v => v.lang.toLowerCase().startsWith('en'));
    return fallback || voices[0];
  }

  // Optimize English speaker selection
  if (langLower === 'en') {
    if (speaker === 'Alex') {
      // Alex is female / high-quality. Prefer Samantha, Zira, Karen, Hazel, Google US English, Susan, Cortana
      const femaleKeywords = ['samantha', 'zira', 'karen', 'hazel', 'susan', 'female', 'google us english', 'natural', 'en-us'];
      for (const kw of femaleKeywords) {
        const found = langVoices.find(v => v.name.toLowerCase().includes(kw));
        if (found) return found;
      }
    } else { // Dharma
      // Dharma is male / calm / deep. Prefer David, Daniel, Richard, Google US English Male, male, en-gb
      const maleKeywords = ['david', 'daniel', 'richard', 'google us english male', 'male', 'natural', 'en-gb'];
      for (const kw of maleKeywords) {
        const found = langVoices.find(v => v.name.toLowerCase().includes(kw));
        if (found) return found;
      }
    }
  }

  // Optimize Spanish speaker selection
  if (langLower === 'es') {
    if (speaker === 'Alex') {
      const femaleKeywords = ['sabina', 'helena', 'monica', 'female', 'mujer', 'es-es'];
      for (const kw of femaleKeywords) {
        const found = langVoices.find(v => v.name.toLowerCase().includes(kw));
        if (found) return found;
      }
    } else { // Dharma
      const maleKeywords = ['jorge', 'pablo', 'male', 'hombre', 'es-mx'];
      for (const kw of maleKeywords) {
        const found = langVoices.find(v => v.name.toLowerCase().includes(kw));
        if (found) return found;
      }
    }
  }

  return langVoices[0];
}

export default function PodcastView({
  prefillTopic,
  onClearPrefill,
  onActivityComplete,
  preferredLanguage
}: PodcastViewProps) {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [episode, setEpisode] = useState<PodcastEpisode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isMuted, setIsMuted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Advanced Voice Settings
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedAlexVoiceName, setSelectedAlexVoiceName] = useState<string>('');
  const [selectedDharmaVoiceName, setSelectedDharmaVoiceName] = useState<string>('');
  const [customPitch, setCustomPitch] = useState<number>(1.0);
  const [customRate, setCustomRate] = useState<number>(1.0);
  const [showVoiceSettings, setShowVoiceSettings] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        
        // Match voices to current language preferences
        const langLower = preferredLanguage === 'Spanish' ? 'es' : preferredLanguage === 'Telugu' ? 'te' : 'en';
        const langVoices = voices.filter(v => v.lang.toLowerCase().startsWith(langLower));
        const activeVoices = langVoices.length > 0 ? langVoices : voices;
        
        // Best defaults for Alex (Female)
        const alexMatch = activeVoices.find(v => {
          const name = v.name.toLowerCase();
          return name.includes('samantha') || name.includes('zira') || name.includes('karen') || name.includes('female') || name.includes('google us english') || name.includes('susan');
        }) || activeVoices[0];
        
        // Best defaults for Dharma (Male)
        const dharmaMatch = activeVoices.find(v => {
          const name = v.name.toLowerCase();
          return name.includes('david') || name.includes('daniel') || name.includes('richard') || name.includes('male') || name.includes('en-gb') || name.includes('google us english male');
        }) || activeVoices[1] || activeVoices[0];

        if (alexMatch) setSelectedAlexVoiceName(prev => prev || alexMatch.name);
        if (dharmaMatch) setSelectedDharmaVoiceName(prev => prev || dharmaMatch.name);
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
      return () => {
        if (window.speechSynthesis) {
          window.speechSynthesis.onvoiceschanged = null;
        }
      };
    }
  }, [preferredLanguage]);

  const activeTurnRef = useRef<HTMLDivElement | null>(null);
  const indexRef = useRef(activeIndex);
  indexRef.current = activeIndex;

  useEffect(() => {
    if (prefillTopic) {
      setTopic(prefillTopic);
      handleGenerate(prefillTopic);
      onClearPrefill();
    }
  }, [prefillTopic]);

  // Keep scroll in sync with active speaker turn
  useEffect(() => {
    if (activeIndex >= 0 && activeTurnRef.current) {
      activeTurnRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeIndex]);

  // Effect to handle the playing state loop
  useEffect(() => {
    let playTimer: any = null;

    if (isPlaying && episode && episode.script.length > 0) {
      const speakNextLine = () => {
        // Increment index
        const nextIdx = indexRef.current + 1;
        if (nextIdx >= episode.script.length) {
          setIsPlaying(false);
          setActiveIndex(-1);
          return;
        }

        setActiveIndex(nextIdx);
        const turn = episode.script[nextIdx];

        if (!isMuted && window.speechSynthesis) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(turn.text);
          
          // Configure language
          utterance.lang = preferredLanguage === 'Spanish' ? 'es-ES' : preferredLanguage === 'Telugu' ? 'te-IN' : 'en-US';

          // Select corresponding natural voice
          const customAlexVoice = availableVoices.find(v => v.name === selectedAlexVoiceName);
          const customDharmaVoice = availableVoices.find(v => v.name === selectedDharmaVoiceName);

          if (turn.speaker === 'Alex') {
            if (customAlexVoice) {
              utterance.voice = customAlexVoice;
            } else {
              const matchedVoice = selectVoice('Alex', preferredLanguage);
              if (matchedVoice) utterance.voice = matchedVoice;
            }
            utterance.pitch = customPitch * 1.05;
            utterance.rate = customRate * 1.02;
          } else { // Dharma
            if (customDharmaVoice) {
              utterance.voice = customDharmaVoice;
            } else {
              const matchedVoice = selectVoice('Dharma', preferredLanguage);
              if (matchedVoice) utterance.voice = matchedVoice;
            }
            utterance.pitch = customPitch * 0.95;
            utterance.rate = customRate * 0.95;
          }

          utterance.onend = () => {
            if (isPlaying) {
              // Wait 800ms between dialogue turns
              playTimer = setTimeout(speakNextLine, 800);
            }
          };
          utterance.onerror = (e) => {
            console.warn('Speech synthesis notice (normal inside restricted iframes):', e);
            if (isPlaying) {
              playTimer = setTimeout(speakNextLine, 2500); // skip after timeout
            }
          };

          window.speechSynthesis.speak(utterance);
        } else {
          // Silent mode: simulate visual progress based on text length
          const readingTime = Math.max(2500, turn.text.length * 55);
          playTimer = setTimeout(speakNextLine, readingTime);
        }
      };

      // Trigger first line
      speakNextLine();
    }

    return () => {
      if (playTimer) clearTimeout(playTimer);
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [
    isPlaying, 
    episode, 
    isMuted, 
    preferredLanguage, 
    availableVoices, 
    selectedAlexVoiceName, 
    selectedDharmaVoiceName, 
    customPitch, 
    customRate
  ]);

  const handleGenerate = async (targetTopic: string) => {
    const term = targetTopic.trim();
    if (!term) return;

    setLoading(true);
    setErrorMsg(null);
    setEpisode(null);
    setIsPlaying(false);
    setActiveIndex(-1);

    try {
      const response = await fetch('/api/podcast/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: term, preferredLanguage })
      });

      if (!response.ok) {
        throw new Error('Failed to record podcast dialog script.');
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setEpisode(data);
      // Log activity points
      onActivityComplete(30, `Generated & listened to Educational Podcast: "${data.topic}"`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error occurred during podcast script generation.');
    } finally {
      setLoading(false);
    }
  };

  const togglePlayback = () => {
    if (!episode) return;
    if (isPlaying) {
      setIsPlaying(false);
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    } else {
      setIsPlaying(true);
    }
  };

  const resetPodcast = () => {
    setIsPlaying(false);
    setActiveIndex(-1);
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  return (
    <div className="space-y-6" id="podcast-generator-container">
      {/* Title */}
      <div>
        <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">
          Auditory Education
        </span>
        <h2 className="text-2xl font-display font-bold text-slate-800 mt-2">AI Podcast Generator</h2>
        <p className="text-xs sm:text-sm text-slate-400">Generate and listen to live educational episodes featuring Alex and Dharma</p>
      </div>

      {/* Inputs Form */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6" id="podcast-setup-panel">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleGenerate(topic);
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Radio className="absolute left-4 top-3.5 text-indigo-500 w-5 h-5 pointer-events-none animate-pulse" />
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a custom study subject or topic to generate a dynamic podcast episode..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-hidden transition-all text-slate-800 font-medium"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading || !topic.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-6 rounded-xl text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 shrink-0 flex items-center justify-center gap-1.5"
          >
            {loading ? 'Recording Ep...' : 'Record Episode'}
            <Sparkles className="w-4 h-4 text-indigo-300" />
          </button>
        </form>

        {/* Preset topics list */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Suggested Hot Topics</h4>
          <div className="flex flex-wrap gap-2">
            {PRESET_TOPICS.map((pTopic) => (
              <button
                key={pTopic}
                type="button"
                onClick={() => {
                  setTopic(pTopic);
                  handleGenerate(pTopic);
                }}
                disabled={loading}
                className="bg-slate-50 hover:bg-indigo-50/50 hover:text-indigo-800 border border-slate-200 hover:border-indigo-300 transition-all text-slate-600 text-xs px-3.5 py-2 rounded-xl font-medium cursor-pointer"
              >
                {pTopic}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Content */}
      <AnimatePresence mode="wait">
        {loading && (
          /* Meditative loading animation */
          <motion.div
            key="recording"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-slate-950 text-white rounded-3xl p-12 text-center border border-slate-800 max-w-xl mx-auto space-y-6"
            id="podcast-loading-card"
          >
            <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 animate-ping" />
              <div className="absolute inset-0 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
              <Radio className="w-6 h-6 text-indigo-400 animate-pulse" />
            </div>
            <div className="space-y-2">
              <p className="text-indigo-400 font-mono text-xs uppercase tracking-widest font-bold">Studio Recording Live</p>
              <h3 className="text-lg font-display font-semibold text-slate-100">"Alex and Dharma are stepping into the recording booth..."</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                Scripting engaging hosts dialogue, writing questions & compiling ethical core responses for <span className="text-indigo-300 font-semibold">"{topic}"</span>...
              </p>
            </div>
          </motion.div>
        )}

        {errorMsg && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-5 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm flex gap-3 items-center max-w-xl mx-auto shadow-2xs"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="font-semibold">{errorMsg}</p>
          </motion.div>
        )}

        {episode && (
          /* Custom Audio player & Script list */
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            id="podcast-results-dashboard"
          >
            {/* Player controls side-bar column */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 text-white text-center space-y-6 shadow-md relative overflow-hidden">
                <span className="text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-full uppercase tracking-widest border border-indigo-500/30">
                  EPISODE ACTIVE
                </span>
                
                <div className="space-y-2">
                  <h3 className="font-display font-bold text-lg text-slate-100 leading-tight">
                    {episode.topic}
                  </h3>
                  <p className="text-xs text-slate-400">Featuring Hosts: Alex & Dharma AI</p>
                </div>

                {/* Progress Visualizer Circle */}
                <div className="relative w-28 h-28 mx-auto flex items-center justify-center bg-slate-950 rounded-full border border-slate-800">
                  <div className="absolute inset-2 rounded-full border-2 border-indigo-500/20" />
                  {isPlaying && (
                    <div className="absolute inset-4 rounded-full border border-dashed border-indigo-400 animate-spin" style={{ animationDuration: '8s' }} />
                  )}
                  <Radio className={`w-8 h-8 text-indigo-400 ${isPlaying ? 'animate-pulse' : ''}`} />
                </div>

                 {/* Main Player buttons */}
                <div className="flex justify-center items-center gap-4">
                  <button
                    onClick={resetPodcast}
                    className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all cursor-pointer"
                    title="Reset to beginning"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={togglePlayback}
                    className="p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold shadow-sm transition-all cursor-pointer"
                    title={isPlaying ? 'Pause Podcast' : 'Play Podcast'}
                  >
                    {isPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white" />}
                  </button>

                  <button
                    onClick={() => {
                      const nextMuted = !isMuted;
                      setIsMuted(nextMuted);
                      if (nextMuted && window.speechSynthesis) {
                        window.speechSynthesis.cancel();
                      }
                    }}
                    className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all cursor-pointer"
                    title={isMuted ? 'Unmute reading' : 'Mute reading'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-indigo-400" />}
                  </button>

                  <button
                    onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      showVoiceSettings 
                        ? 'bg-indigo-600 border-indigo-600 text-white' 
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                    }`}
                    title="Voice settings and configuration"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>

                {/* Voice Settings Panel */}
                <AnimatePresence>
                  {showVoiceSettings && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-slate-800 pt-4 mt-4 space-y-4 text-left overflow-hidden"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider">
                        <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Voice Customization</span>
                      </div>

                      {/* Alex Voice Selection */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Alex (Host - Female)</label>
                        <select
                          value={selectedAlexVoiceName}
                          onChange={(e) => setSelectedAlexVoiceName(e.target.value)}
                          className="w-full text-xs bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2 focus:outline-hidden focus:border-indigo-500 font-medium cursor-pointer"
                        >
                          {availableVoices.map((voice) => (
                            <option key={`alex-${voice.name}`} value={voice.name} className="bg-slate-950 text-slate-300">
                              {voice.name} ({voice.lang})
                            </option>
                          ))}
                          {availableVoices.length === 0 && (
                            <option value="">System Default Voice</option>
                          )}
                        </select>
                      </div>

                      {/* Dharma Voice Selection */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Dharma (Host - Male)</label>
                        <select
                          value={selectedDharmaVoiceName}
                          onChange={(e) => setSelectedDharmaVoiceName(e.target.value)}
                          className="w-full text-xs bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2 focus:outline-hidden focus:border-indigo-500 font-medium cursor-pointer"
                        >
                          {availableVoices.map((voice) => (
                            <option key={`dharma-${voice.name}`} value={voice.name} className="bg-slate-950 text-slate-300">
                              {voice.name} ({voice.lang})
                            </option>
                          ))}
                          {availableVoices.length === 0 && (
                            <option value="">System Default Voice</option>
                          )}
                        </select>
                      </div>

                      {/* Speed Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                          <span>Speaking Speed</span>
                          <span className="text-indigo-400 font-mono">{customRate.toFixed(1)}x</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="2.0"
                          step="0.1"
                          value={customRate}
                          onChange={(e) => setCustomRate(parseFloat(e.target.value))}
                          className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Pitch Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                          <span>Tone Pitch</span>
                          <span className="text-indigo-400 font-mono">{customPitch.toFixed(1)}x</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="1.5"
                          step="0.05"
                          value={customPitch}
                          onChange={(e) => setCustomPitch(parseFloat(e.target.value))}
                          className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Reset Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setCustomPitch(1.0);
                          setCustomRate(1.0);
                          if (availableVoices.length > 0) {
                            const langLower = preferredLanguage === 'Spanish' ? 'es' : preferredLanguage === 'Telugu' ? 'te' : 'en';
                            const langVoices = availableVoices.filter(v => v.lang.toLowerCase().startsWith(langLower));
                            const activeVoices = langVoices.length > 0 ? langVoices : availableVoices;

                            const alexMatch = activeVoices.find(v => {
                              const name = v.name.toLowerCase();
                              return name.includes('samantha') || name.includes('zira') || name.includes('karen') || name.includes('female') || name.includes('google us english') || name.includes('susan');
                            }) || activeVoices[0];

                            const dharmaMatch = activeVoices.find(v => {
                              const name = v.name.toLowerCase();
                              return name.includes('david') || name.includes('daniel') || name.includes('richard') || name.includes('male') || name.includes('en-gb') || name.includes('google us english male');
                            }) || activeVoices[1] || activeVoices[0];

                            if (alexMatch) setSelectedAlexVoiceName(alexMatch.name);
                            if (dharmaMatch) setSelectedDharmaVoiceName(dharmaMatch.name);
                          }
                        }}
                        className="w-full bg-slate-800 hover:bg-slate-750 text-slate-300 text-[10px] uppercase font-bold tracking-wider py-1.5 rounded-lg border border-slate-700 transition-colors cursor-pointer"
                      >
                        Reset Voice Preferences
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="text-xs text-slate-400 border-t border-slate-800 pt-4 leading-relaxed font-medium">
                  {isPlaying 
                    ? 'Dialogue audio broadcasting. Listening with voices.' 
                    : activeIndex >= 0 
                      ? 'Podcast paused. Resume playback to continue.' 
                      : 'Click Play to broadcast with interactive host voices.'}
                </div>
              </div>
            </div>

            {/* Script Timeline Dialogue turns */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col max-h-[500px]" id="podcast-transcript-scroll">
              <div className="px-5 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50 text-xs font-bold text-slate-600 font-display">
                <span>PODCAST TRANSCRIPT</span>
                <span className="text-indigo-600 font-mono font-semibold">{episode.script.length} segments</span>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin">
                {episode.script.map((turn, i) => {
                  const isTurnActive = activeIndex === i;
                  const isAlex = turn.speaker === 'Alex';

                  return (
                    <div
                      key={turn.id}
                      ref={isTurnActive ? activeTurnRef : null}
                      className={`p-4 rounded-xl border transition-all flex gap-3.5 leading-relaxed items-start ${
                        isTurnActive
                          ? 'border-indigo-500 bg-indigo-50/25 ring-1 ring-indigo-500/10 scale-[1.01]'
                          : 'border-slate-100 bg-white opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 select-none ${
                        isAlex ? 'bg-indigo-500 text-white' : 'bg-slate-900 text-white'
                      }`}>
                        {turn.speaker[0]}
                      </div>
                      
                      <div className="space-y-1 flex-1">
                        <div className="flex justify-between items-baseline">
                          <span className="font-bold text-xs uppercase tracking-wide text-slate-800 font-display">
                            {turn.speaker} <span className="text-[10px] text-slate-400 font-normal">({turn.emotion})</span>
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">Turn {i+1}</span>
                        </div>
                        <p className="text-slate-700 text-xs sm:text-sm font-medium leading-relaxed">"{turn.text}"</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
