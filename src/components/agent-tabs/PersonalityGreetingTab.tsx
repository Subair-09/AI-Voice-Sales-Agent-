import React, { useState } from 'react';
import { Sparkles, MessageSquare, HeartHandshake, Save, CheckCircle2 } from 'lucide-react';
import { AIAgentConfig } from '../../types/agent';

interface PersonalityGreetingTabProps {
  config: AIAgentConfig;
  onUpdatePersonality: (personality: AIAgentConfig['personality']) => Promise<void>;
  onUpdateGreetingFarewell: (greeting: string, farewell: string) => Promise<void>;
}

export const PersonalityGreetingTab: React.FC<PersonalityGreetingTabProps> = ({
  config,
  onUpdatePersonality,
  onUpdateGreetingFarewell,
}) => {
  const [tone, setTone] = useState(config.personality.tone);
  const [style, setStyle] = useState(config.personality.style);
  const [traits, setTraits] = useState<string[]>(config.personality.traits);
  const [description, setDescription] = useState(config.personality.description);
  const [greeting, setGreeting] = useState(config.greeting);
  const [farewell, setFarewell] = useState(config.farewell);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const availableTraits = [
    'Helpful',
    'Patient',
    'Cheerful',
    'Professional',
    'Conversational',
    'Warm',
  ];

  const handleToggleTrait = (trait: string) => {
    if (traits.includes(trait)) {
      if (traits.length > 1) {
        setTraits(traits.filter((t) => t !== trait));
      }
    } else {
      setTraits([...traits, trait]);
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await Promise.all([
        onUpdatePersonality({
          tone,
          style,
          traits,
          description,
        }),
        onUpdateGreetingFarewell(greeting, farewell),
      ]);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save personality & greeting:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. Personality & Style Configuration */}
      <div className="bg-white rounded-2xl p-6 border border-[#E6E7EB] shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 border-b border-[#F3F4F6]">
          <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] flex items-center justify-center text-[#17243A]">
            <Sparkles className="w-4 h-4 stroke-[2.2] text-[#F9B91A] fill-[#F9B91A]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#17243A]">Tone & Personality Traits</h3>
            <p className="text-xs text-[#6B7280]">
              Define the bakery's warm, welcoming vocal identity.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
          {/* Tone Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#17243A] mb-1.5">
              Primary Tone
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['Friendly', 'Professional', 'Warm', 'Casual'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTone(t)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    tone === t
                      ? 'bg-[#F9B91A] text-[#17243A] border-[#F9B91A] shadow-xs'
                      : 'bg-[#FAF7F0] hover:bg-[#F3EFE6] text-[#475569] border-[#E6E7EB]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Response Length / Style */}
          <div>
            <label className="block text-xs font-semibold text-[#17243A] mb-1.5">
              Response Style
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Concise', 'Balanced', 'Detailed'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStyle(s)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    style === s
                      ? 'bg-[#F9B91A] text-[#17243A] border-[#F9B91A] shadow-xs'
                      : 'bg-[#FAF7F0] hover:bg-[#F3EFE6] text-[#475569] border-[#E6E7EB]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Personality Traits Multi-Select */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-[#17243A] mb-2">
              Personality Badges
            </label>
            <div className="flex flex-wrap gap-2">
              {availableTraits.map((trait) => {
                const isSelected = traits.includes(trait);
                return (
                  <button
                    key={trait}
                    type="button"
                    onClick={() => handleToggleTrait(trait)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#17243A] text-white shadow-xs'
                        : 'bg-[#FAF7F0] hover:bg-[#F3EFE6] text-[#64748B] border border-[#E6E7EB]'
                    }`}
                  >
                    {isSelected ? `✓ ${trait}` : `+ ${trait}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Personality Description */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-[#17243A] mb-1.5">
              Personality Summary
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full text-xs p-3 rounded-xl bg-[#FAF7F0] border border-[#E6E7EB] text-[#17243A] focus:outline-hidden focus:ring-1 focus:ring-[#F9B91A]"
            />
          </div>
        </div>
      </div>

      {/* 2. Greetings & Farewells */}
      <div className="bg-white rounded-2xl p-6 border border-[#E6E7EB] shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 border-b border-[#F3F4F6]">
          <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] flex items-center justify-center text-[#17243A]">
            <MessageSquare className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#17243A]">Spoken Greetings & Closing</h3>
            <p className="text-xs text-[#6B7280]">
              The initial opening welcome and concluding farewell statement for callers.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
          {/* Greeting */}
          <div>
            <label className="block text-xs font-semibold text-[#17243A] mb-1.5">
              Opening Greeting
            </label>
            <textarea
              value={greeting}
              onChange={(e) => setGreeting(e.target.value)}
              rows={4}
              className="w-full text-xs p-3 rounded-xl bg-[#FAF7F0] border border-[#E6E7EB] text-[#17243A] focus:outline-hidden focus:ring-1 focus:ring-[#F9B91A] leading-relaxed"
            />
          </div>

          {/* Farewell */}
          <div>
            <label className="block text-xs font-semibold text-[#17243A] mb-1.5">
              Closing Farewell
            </label>
            <textarea
              value={farewell}
              onChange={(e) => setFarewell(e.target.value)}
              rows={4}
              className="w-full text-xs p-3 rounded-xl bg-[#FAF7F0] border border-[#E6E7EB] text-[#17243A] focus:outline-hidden focus:ring-1 focus:ring-[#F9B91A] leading-relaxed"
            />
          </div>
        </div>

        {/* Save button */}
        <div className="mt-5 pt-4 border-t border-[#F3F4F6] flex items-center justify-end gap-3">
          {savedSuccess && (
            <span className="text-xs font-bold text-[#15966B] flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              Changes saved successfully!
            </span>
          )}
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-[#F9B91A] hover:bg-[#E5A812] active:scale-[0.99] font-bold text-xs text-[#17243A] flex items-center gap-2 shadow-xs cursor-pointer transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Personality & Greetings'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
