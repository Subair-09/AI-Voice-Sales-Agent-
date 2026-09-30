import React, { useState } from 'react';
import { MessageSquare, Edit2, Check, X } from 'lucide-react';

interface AgentGreetingSectionProps {
  greeting: string;
  onSaveGreeting: (newGreeting: string) => Promise<void>;
}

export const AgentGreetingSection: React.FC<AgentGreetingSectionProps> = ({
  greeting,
  onSaveGreeting,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftGreeting, setDraftGreeting] = useState(greeting);
  const [isSaving, setIsSaving] = useState(false);

  // Sync if prop changes outside
  React.useEffect(() => {
    setDraftGreeting(greeting);
  }, [greeting]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveGreeting(draftGreeting);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save greeting:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setDraftGreeting(greeting);
    setIsEditing(false);
  };

  // Split greeting into paragraphs if multi-line
  const paragraphs = greeting.split('\n\n').filter(Boolean);

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E6E7EB] shadow-xs">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] flex items-center justify-center text-[#17243A]">
            <MessageSquare className="w-4 h-4 stroke-[2.2]" />
          </div>
          <h4 className="text-sm font-bold text-[#17243A]">Agent Greeting</h4>
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
        <div className="space-y-3">
          <textarea
            value={draftGreeting}
            onChange={(e) => setDraftGreeting(e.target.value)}
            rows={4}
            className="w-full text-xs p-3 rounded-xl border border-[#F9B91A] focus:outline-hidden focus:ring-1 focus:ring-[#F9B91A] bg-white text-[#17243A] leading-relaxed"
            placeholder="Enter the greeting customers will hear when the call connects..."
          />
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="px-3 py-1.5 rounded-xl border border-[#E6E7EB] hover:bg-[#F3F4F6] text-xs font-medium text-[#6B7280] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <X className="w-3 h-3" />
              <span>Cancel</span>
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-1.5 rounded-xl bg-[#F9B91A] hover:bg-[#E5A812] text-xs font-bold text-[#17243A] flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all active:scale-[0.99]"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[#FAF7F0] rounded-xl p-4 border border-[#F1EADA] space-y-2">
          {paragraphs.length > 0 ? (
            paragraphs.map((p, idx) => (
              <p key={idx} className="text-xs text-[#334155] leading-relaxed">
                {p}
              </p>
            ))
          ) : (
            <p className="text-xs text-[#334155] leading-relaxed">{greeting}</p>
          )}
        </div>
      )}
    </div>
  );
};
