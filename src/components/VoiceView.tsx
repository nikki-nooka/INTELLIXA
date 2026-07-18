/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  User, 
  Bot, 
  Send,
  AlertCircle,
  HelpCircle,
  Settings,
  Sliders
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function selectVoice(preferredLanguage: string): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  // Normalize language prefix (e.g. 'en', 'es', 'te')
  const langLower = preferredLanguage === 'Spanish' ? 'es' : preferredLanguage === 'Telugu' ? 'te' : 'en';

  // Filter voices that match the language prefix
  const langVoices = voices.filter(v => v.lang.toLowerCase().startsWith(langLower));
  if (langVoices.length === 0) {
    const fallback = voices.find(v => v.lang.toLowerCase().startsWith('en'));
    return fallback || voices[0];
  }

  // Optimize English selection (prefer male/calm/deep for Dharma study buddy)
  if (langLower === 'en') {
    const maleKeywords = ['david', 'daniel', 'richard', 'google us english male', 'male', 'natural', 'en-gb'];
    for (const kw of maleKeywords) {
      const found = langVoices.find(v => v.name.toLowerCase().includes(kw));
      if (found) return found;
    }
  }

  // Optimize Spanish selection
  if (langLower === 'es') {
    const maleKeywords = ['jorge', 'pablo', 'male', 'hombre', 'es-mx'];
    for (const kw of maleKeywords) {
      const found = langVoices.find(v => v.name.toLowerCase().includes(kw));
      if (found) return found;
    }
  }

  return langVoices[0];
}

interface VoiceViewProps {
  onActivityComplete: (points: number, desc: string) => void;
  preferredLanguage: string;
}

export default function VoiceView({
  onActivityComplete,
  preferredLanguage
}: VoiceViewProps) {
  const [isListening, setIsListening] = useState(false);
  const [assistantState, setAssistantState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [speechSupported, setSpeechSupported] = useState(false);
  const [spokenInput, setSpokenInput] = useState('');
  const [assistantReply, setAssistantReply] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  // Advanced Voice Settings
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedBuddyVoiceName, setSelectedBuddyVoiceName] = useState<string>('');
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
        
        // Best default for Dharma buddy (Male/Calm)
        const buddyMatch = activeVoices.find(v => {
          const name = v.name.toLowerCase();
          return name.includes('david') || name.includes('daniel') || name.includes('richard') || name.includes('male') || name.includes('en-gb') || name.includes('google us english male');
        }) || activeVoices[0];

        if (buddyMatch) setSelectedBuddyVoiceName(prev => prev || buddyMatch.name);
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

  const recognitionRef = useRef<any>(null);
  const synthesisUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Check Speech Recognition & Synthesis support in browser
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const supportSpeech = !!SpeechRecognition && !!window.speechSynthesis;
    setSpeechSupported(supportSpeech);

    if (supportSpeech) {
      try {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = preferredLanguage === 'Spanish' ? 'es-ES' : preferredLanguage === 'Telugu' ? 'te-IN' : 'en-US';

        rec.onstart = () => {
          setIsListening(true);
          setAssistantState('listening');
          setErrorMsg(null);
        };

        rec.onresult = (e: any) => {
          const text = e.results[0][0].transcript;
          setSpokenInput(text);
          setAssistantState('thinking');
          handleVoiceSubmit(text);
        };

        rec.onerror = (e: any) => {
          console.warn('Speech Recognition notice:', e);
          if (e.error === 'not-allowed') {
            setErrorMsg('Microphone access denied. You can still type your questions.');
          } else {
            setErrorMsg('Unable to capture speech. Let\'s try typing or re-clicking.');
          }
          setIsListening(false);
          setAssistantState('idle');
        };

        rec.onend = () => {
          setIsListening(false);
          if (assistantState === 'listening') {
            setAssistantState('idle');
          }
        };

        recognitionRef.current = rec;
      } catch (err) {
        console.warn('Failed to initialize speech recognition:', err);
        setSpeechSupported(false);
      }
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [preferredLanguage]);

  const handleVoiceSubmit = async (text: string) => {
    if (!text.trim()) return;

    setAssistantState('thinking');
    try {
      const response = await fetch('/api/voice/interact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spokenText: text, preferredLanguage })
      });

      if (!response.ok) {
        throw new Error('Connection failed.');
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setAssistantReply(data.replyText);
      setAssistantState('speaking');

      // Speak text aloud if not muted and speech is supported
      if (!isMuted && window.speechSynthesis) {
        window.speechSynthesis.cancel(); // stop current speaking
        const utterance = new SpeechSynthesisUtterance(data.replyText);
        
        // Match language locale
        utterance.lang = preferredLanguage === 'Spanish' ? 'es-ES' : preferredLanguage === 'Telugu' ? 'te-IN' : 'en-US';
        
        // Select matching system voice for Dharma
        const customBuddyVoice = availableVoices.find(v => v.name === selectedBuddyVoiceName);
        if (customBuddyVoice) {
          utterance.voice = customBuddyVoice;
        } else {
          const matchedVoice = selectVoice(preferredLanguage);
          if (matchedVoice) utterance.voice = matchedVoice;
        }

        utterance.pitch = customPitch * 0.95;
        utterance.rate = customRate * 0.95;

        utterance.onend = () => {
          setAssistantState('idle');
        };
        utterance.onerror = (e) => {
          console.warn('Speech Synthesis notice:', e);
          setAssistantState('idle');
        };
        synthesisUtteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      } else {
        // Fallback for mute/non-supported
        setTimeout(() => {
          setAssistantState('idle');
        }, 3000);
      }

      // Log activity
      onActivityComplete(15, `Interacted with Voice Study Buddy: "${text.substring(0, 40)}..."`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Dharma Buddy is busy right now. Let\'s try again.');
      setAssistantState('idle');
    }
  };

  const toggleMic = () => {
    if (!speechSupported) {
      setErrorMsg('Web Speech API is not supported in this frame. Please type below instead.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
        recognitionRef.current?.start();
      } catch (err) {
        console.error(err);
        setErrorMsg('Microphone is busy. Please type.');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto text-center" id="voice-assistant-container">
      {/* Title */}
      <div>
        <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">
          Hands-Free Learning
        </span>
        <h2 className="text-2xl font-display font-bold text-slate-800 mt-2">Voice Study Buddy</h2>
        <p className="text-xs sm:text-sm text-slate-400">Speak naturally to discuss engineering concepts with a companion</p>
      </div>

      {/* Main Wave Panel */}
      <div className="bg-slate-950 rounded-3xl p-8 border border-slate-800 shadow-xl space-y-8 relative overflow-hidden" id="voice-visualizer-panel">
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button
            onClick={() => setShowVoiceSettings(!showVoiceSettings)}
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
              showVoiceSettings 
                ? 'bg-indigo-600 border-indigo-600 text-white' 
                : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400'
            }`}
            title="Voice configuration settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              const nextMute = !isMuted;
              setIsMuted(nextMute);
              if (nextMute && window.speechSynthesis) {
                window.speechSynthesis.cancel();
              }
            }}
            className="p-2 bg-slate-900 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors text-slate-400 cursor-pointer"
            title={isMuted ? 'Unmute TTS feedback' : 'Mute TTS feedback'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-indigo-400" />}
          </button>
        </div>

        {/* Ambient Waves Equalizer animation */}
        <div className="flex items-center justify-center h-48 gap-1.5" id="wave-bars">
          {Array.from({ length: 15 }).map((_, i) => {
            let delay = i * 0.1;
            let duration = 0.6 + Math.random() * 0.6;
            let hClass = 'h-3'; // Default idle height

            if (assistantState === 'listening') {
              hClass = 'h-12';
              duration = 0.5 + Math.random() * 0.4;
            } else if (assistantState === 'thinking') {
              hClass = 'h-8';
              duration = 0.3;
            } else if (assistantState === 'speaking') {
              hClass = 'h-24';
              duration = 0.4 + Math.random() * 0.5;
            }

            return (
              <motion.div
                key={i}
                animate={{
                  height: assistantState === 'idle' ? [8, 12, 8] : [12, 70, 12]
                }}
                transition={{
                  repeat: Infinity,
                  duration: duration,
                  delay: delay,
                  ease: 'easeInOut'
                }}
                className={`w-1 rounded-full transition-all duration-300 ${
                  assistantState === 'listening'
                    ? 'bg-amber-400'
                    : assistantState === 'thinking'
                      ? 'bg-blue-400'
                      : assistantState === 'speaking'
                        ? 'bg-indigo-400'
                        : 'bg-slate-700'
                }`}
                style={{
                  maxHeight: assistantState === 'idle' ? '12px' : '90px'
                }}
              />
            );
          })}
        </div>

        {/* State Label */}
        <div className="space-y-2">
          <span className={`text-xs font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
            assistantState === 'listening'
              ? 'text-amber-400 border-amber-400/20 bg-amber-400/5'
              : assistantState === 'thinking'
                ? 'text-blue-400 border-blue-400/20 bg-blue-400/5'
                : assistantState === 'speaking'
                  ? 'text-indigo-400 border-indigo-400/20 bg-indigo-400/5'
                  : 'text-slate-500 border-slate-800'
          }`}>
            {assistantState === 'listening' && 'Listening to speech...'}
            {assistantState === 'thinking' && 'Consulting resources...'}
            {assistantState === 'speaking' && 'Speaking answer...'}
            {assistantState === 'idle' && 'Study Buddy is ready'}
          </span>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Click the microphone and say something like: "What is the difference between compiler and interpreter?"
          </p>
        </div>

        {/* Action Micro Button */}
        <div className="flex justify-center">
          <button
            onClick={toggleMic}
            className={`w-16 h-16 rounded-full flex items-center justify-center border transition-all cursor-pointer shadow-md ${
              isListening
                ? 'bg-red-500 border-red-500 text-white animate-pulse'
                : 'bg-indigo-600 border-indigo-600 hover:bg-indigo-700 text-white'
            }`}
            title="Click to speak hands-free"
          >
            {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
        </div>

        {/* Voice Settings Panel */}
        <AnimatePresence>
          {showVoiceSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-slate-800 pt-6 mt-6 space-y-4 text-left overflow-hidden text-slate-300"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                <span>Voice Customization</span>
              </div>

              {/* Dharma Voice Selection */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Dharma Study Buddy Voice</label>
                <select
                  value={selectedBuddyVoiceName}
                  onChange={(e) => setSelectedBuddyVoiceName(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2 focus:outline-hidden focus:border-indigo-500 font-medium cursor-pointer"
                >
                  {availableVoices.map((voice) => (
                    <option key={`buddy-${voice.name}`} value={voice.name} className="bg-slate-950 text-slate-300">
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

                    const buddyMatch = activeVoices.find(v => {
                      const name = v.name.toLowerCase();
                      return name.includes('david') || name.includes('daniel') || name.includes('richard') || name.includes('male') || name.includes('en-gb') || name.includes('google us english male');
                    }) || activeVoices[0];

                    if (buddyMatch) setSelectedBuddyVoiceName(buddyMatch.name);
                  }
                }}
                className="w-full bg-slate-900 hover:bg-slate-850 text-slate-300 text-[10px] uppercase font-bold tracking-wider py-1.5 rounded-lg border border-slate-800 transition-colors cursor-pointer text-center"
              >
                Reset Voice Preferences
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Manual Input Fallback & Transcriptions */}
      <div className="space-y-4" id="voice-transcripts">
        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-xs flex gap-2 items-center justify-center font-semibold shadow-2xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>{errorMsg}</p>
          </div>
        )}

        {/* Past Dialogues Transcript Box */}
        {(spokenInput || assistantReply) && (
          <div className="bg-white p-5 rounded-3xl border border-slate-200 text-left space-y-4 shadow-3xs text-xs sm:text-sm">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Last Speech Transcript</h4>
            
            {spokenInput && (
              <div className="flex gap-2.5 items-start">
                <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl leading-relaxed text-slate-700 font-medium">
                  "{spokenInput}"
                </div>
              </div>
            )}

            {assistantReply && (
              <div className="flex gap-2.5 items-start">
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-indigo-50/30 border border-indigo-100/30 p-3 rounded-xl leading-relaxed text-slate-800">
                  "{assistantReply}"
                </div>
              </div>
            )}
          </div>
        )}

        {/* Manual Keyboard input fallback form */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-3xs">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const input = (e.currentTarget.elements.namedItem('keyboardText') as HTMLInputElement).value;
              if (!input.trim()) return;
              setSpokenInput(input);
              handleVoiceSubmit(input);
              e.currentTarget.reset();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              name="keyboardText"
              placeholder="Or type here (e.g. explain hashing functions)..."
              className="flex-1 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs focus:outline-hidden text-slate-800 font-medium"
            />
            <button
              type="submit"
              disabled={assistantState === 'thinking'}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40"
            >
              Ask
              <Send className="w-3.5 h-3.5 text-white" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
