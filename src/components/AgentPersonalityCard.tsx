import React, { useState } from 'react';
import { Sparkles, Edit2, Check, X } from 'lucide-react';
import { AIAgentConfig } from '../types/agent';

interface AgentPersonalityCardProps {
  personality: AIAgentConfig['personality'];
  onSavePersonality: (newPersonality: AIAgentConfig['personality']) => Promise<void>;
}

export const AgentPersonalityCard: React.FC<AgentPersonalityCardProps> = ({
  personality,
  onSavePersonality,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftTone, setDraftTone] = useState(personality.tone);
  const [draftStyle, setDraftStyle] = useState(personality.style);
  const [draftTraits, setDraftTraits] = useState<string[]>(personality.traits);
  const [draftDescription, setDraftDescription] = useState(personality.description);
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    setDraftTone(personality.tone);
    setDraftStyle(personality.style);
    setDraftTraits(personality.traits);
    setDraftDescription(personality.description);
  }, [personality]);

  const availableTraits = [
    'Friendly',
    'Professional',
    'Helpful',
    'Patient',
    'Cheerful',
    'Conversational',
  ];

  const handleToggleTrait = (trait: string) => {
    if (draftTraits.includes(trait)) {
      if (draftTraits.length > 1) {
        setDraftTraits(draftTraits.filter((t) => t !== trait));
      }
    } else {
      setDraftTraits([...draftTraits, trait]);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSavePersonality({
        tone: draftTone,
        style: draftStyle,
        traits: draftTraits,
        description: draftDescription,
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save personality:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const getTraitBadgeClass = (trait: string) => {
    switch (trait.toLowerCase()) {
      case 'friendly':
        return 'bg-[#E8F7EF] text-[#15966B] border border-[#A7F3D0]';
      case 'professional':
        return 'bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD]';
      case 'helpful':
        return 'bg-[#F3E8FF] text-[#9333EA] border border-[#E9D5FF]';
      case 'cheerful':
        return 'bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]';
      default:
        return 'bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E6E7EB] shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] flex items-center justify-center text-[#17243A]">
              <Sparkles className="w-4 h-4 stroke-[2.2] text-[#F9B91A] fill-[#F9B91A]" />
            </div>
            <h4 className="text-sm font-bold text-[#17243A]">Agent Personality</h4>
          </div>

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1.5 rounded-xl border border-[#E6E7EB] hover:bg-[#FAF7F0] text-xs font-semibold text-[#17243A] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-[#6B7280] mb-1">
                Select Traits
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableTraits.map((t) => {
                  const isSelected = draftTraits.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleToggleTrait(t)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? getTraitBadgeClass(t)
                          : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
                      }`}
                    >
                      {isSelected ? `✓ ${t}` : t}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#6B7280] mb-1">
                Tone & Behavior Description
              </label>
              <textarea
                value={draftDescription}
                onChange={(e) => setDraftDescription(e.target.value)}
                rows={3}
                className="w-full text-xs p-2.5 rounded-xl border border-[#F9B91A] focus:outline-hidden focus:ring-1 focus:ring-[#F9B91A] bg-white text-[#17243A]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => {
                  setDraftTraits(personality.traits);
                  setDraftDescription(personality.description);
                  setIsEditing(false);
                }}
                disabled={isSaving}
                className="px-3 py-1.5 rounded-xl border border-[#E6E7EB] hover:bg-[#F3F4F6] text-xs font-medium text-[#6B7280] flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3 h-3" />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-1.5 rounded-xl bg-[#F9B91A] hover:bg-[#E5A812] text-xs font-bold text-[#17243A] flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-[0.99]"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Personality Tags */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {personality.traits.map((trait) => (
                <span
                  key={trait}
                  className={`px-3 py-1 rounded-full text-xs font-bold ${getTraitBadgeClass(
                    trait
                  )}`}
                >
                  {trait}
                </span>
              ))}
            </div>

            {/* Description Text */}
            <p className="text-xs text-[#6B7280] leading-relaxed">
              {personality.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
