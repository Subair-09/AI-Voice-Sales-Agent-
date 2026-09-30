import React, { useState } from 'react';
import { Mic, Play, Pause, ChevronDown, Volume2 } from 'lucide-react';

interface VoiceAndLanguageSectionProps {
  voice: string;
  language: string;
  onVoiceChange: (voice: string) => void;
  onLanguageChange: (lang: string) => void;
}

export const VoiceAndLanguageSection: React.FC<VoiceAndLanguageSectionProps> = ({
  voice,
  language,
  onVoiceChange,
  onLanguageChange,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const voiceOptions = [
    'Friendly Female (English)',
    'Warm Female (Lagos Accented)',
    'Professional Female (British)',
    'Friendly Male (English)',
    'Warm Male (Nigerian)',
  ];

  const languageOptions = [
    'English (US)',
    'English (UK)',
    'English (Nigerian)',
    'English (Global)',
  ];

  const handlePlaySample = () => {
    if (isPlaying) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
      return;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const sampleText =
        'Welcome to Baked by Doja! We have fresh artisanal banana breads baking right now. How can I help you today?';
      const utterance = new SpeechSynthesisUtterance(sampleText);
      utterance.rate = 1.0;
      utterance.pitch = voice.toLowerCase().includes('male') ? 0.9 : 1.1;

      // Select matching speech synthesis voice if available
      const synthVoices = window.speechSynthesis.getVoices();
      if (synthVoices.length > 0) {
        const femaleVoice = synthVoices.find(
          (v) =>
            (v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Google UK English Female') || v.name.includes('Zira')) &&
            v.lang.startsWith('en')
        );
        if (femaleVoice && !voice.toLowerCase().includes('male')) {
          utterance.voice = femaleVoice;
        }
      }

      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlaying(true);
      setTimeout(() => setIsPlaying(false), 3000);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E6E7EB] shadow-xs">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] flex items-center justify-center text-[#17243A]">
          <Mic className="w-4 h-4 stroke-[2.2]" />
        </div>
        <h4 className="text-sm font-bold text-[#17243A]">Voice & Language</h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        {/* Voice Selector */}
        <div className="sm:col-span-4">
          <label className="block text-[11px] font-semibold text-[#6B7280] mb-1.5">
            Voice
          </label>
          <div className="relative">
            <select
              value={voice}
              onChange={(e) => onVoiceChange(e.target.value)}
              className="w-full appearance-none pl-3 pr-8 py-2 text-xs font-semibold rounded-xl bg-[#FAF7F0] border border-[#E6E7EB] text-[#17243A] cursor-pointer hover:bg-[#F3EFE6] transition-colors focus:outline-hidden focus:ring-1 focus:ring-[#F9B91A]"
            >
              {voiceOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
          </div>
        </div>

        {/* Language Selector */}
        <div className="sm:col-span-4">
          <label className="block text-[11px] font-semibold text-[#6B7280] mb-1.5">
            Language
          </label>
          <div className="relative">
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="w-full appearance-none pl-3 pr-8 py-2 text-xs font-semibold rounded-xl bg-[#FAF7F0] border border-[#E6E7EB] text-[#17243A] cursor-pointer hover:bg-[#F3EFE6] transition-colors focus:outline-hidden focus:ring-1 focus:ring-[#F9B91A]"
            >
              {languageOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
          </div>
        </div>

        {/* Play Sample & Description */}
        <div className="sm:col-span-4 pt-1 sm:pt-4 flex flex-col sm:items-start">
          <button
            onClick={handlePlaySample}
            className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-2xs ${
              isPlaying
                ? 'bg-[#E8F7EF] text-[#15966B] border-[#A7F3D0] animate-pulse'
                : 'bg-white hover:bg-[#FAF7F0] text-[#17243A] border-[#E6E7EB]'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-[#15966B]" />
                <span>Playing Voice...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-[#17243A]" />
                <span>Play Sample</span>
              </>
            )}
          </button>
          <p className="text-[11px] text-[#6B7280] mt-1.5 leading-snug">
            This is how your agent will sound to customers.
          </p>
        </div>
      </div>
    </div>
  );
};
