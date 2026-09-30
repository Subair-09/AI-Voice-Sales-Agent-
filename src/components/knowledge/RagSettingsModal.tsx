import React, { useState } from 'react';
import {
  X,
  Sliders,
  Sparkles,
  ShieldCheck,
  Check,
  RefreshCw,
  Cpu,
  Layers,
  Save,
} from 'lucide-react';
import { RagSettings } from '../../types/knowledge';

interface RagSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (settings: RagSettings) => void;
}

export const RagSettingsModal: React.FC<RagSettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [retrievalEnabled, setRetrievalEnabled] = useState(true);
  const [maxResults, setMaxResults] = useState(5);
  const [relevanceThreshold, setRelevanceThreshold] = useState(0.72);
  const [useKnowledgeBaseFirst, setUseKnowledgeBaseFirst] = useState(true);
  const [fallbackToGeneralAI, setFallbackToGeneralAI] = useState(true);
  const [chunkSize, setChunkSize] = useState(512);
  const [chunkOverlap, setChunkOverlap] = useState(64);
  const [embeddingModel, setEmbeddingModel] = useState('text-embedding-004');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      if (onSave) {
        onSave({
          retrievalEnabled,
          maxResults,
          relevanceThreshold,
          useKnowledgeBaseFirst,
          fallbackToGeneralAI,
        });
      }
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 800);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-[#E6E7EB] shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-[#F3F4F6] flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E8F7EF] text-[#15966B] flex items-center justify-center shrink-0">
              <Sliders className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#17243A]">
                RAG Retrieval Settings
              </h3>
              <p className="text-xs text-[#6B7280] font-medium">
                Configure semantic search and chunking parameters for your AI sales agent.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-[#64748B] hover:text-[#17243A] hover:bg-[#FAF7F0] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 text-xs">
          {/* Main Switch */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF7F0] border border-[#F1EADA]">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#17243A]">
                  Enable RAG Knowledge Retrieval
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F7EF] text-[#15966B]">
                  Active
                </span>
              </div>
              <p className="text-[11px] text-[#6B7280] mt-0.5">
                AI Agent will ground responses in your uploaded documents during telephone calls.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={retrievalEnabled}
              onClick={() => setRetrievalEnabled(!retrievalEnabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                retrievalEnabled ? 'bg-[#15966B]' : 'bg-[#D1D5DB]'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                  retrievalEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Model Selection */}
          <div>
            <label className="block font-bold text-[#17243A] mb-1.5 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Embedding Model</span>
            </label>
            <select
              value={embeddingModel}
              onChange={(e) => setEmbeddingModel(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-[#FAF7F0] border border-[#E6E7EB] text-[#17243A] cursor-pointer"
            >
              <option value="text-embedding-004">
                Google Gemini text-embedding-004 (768-dim, Fast Retrieval)
              </option>
              <option value="text-embedding-gecko">
                Google Gecko Multilingual (768-dim)
              </option>
            </select>
            <p className="text-[11px] text-[#6B7280] mt-1">
              High-accuracy dense embeddings fine-tuned for conversational customer support.
            </p>
          </div>

          {/* Top-K Chunks Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between font-bold text-[#17243A]">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#64748B]" />
                <span>Max Retrieved Chunks per Query</span>
              </span>
              <span className="text-sm font-mono text-[#D97706]">{maxResults}</span>
            </div>
            <input
              type="range"
              min={2}
              max={10}
              step={1}
              value={maxResults}
              onChange={(e) => setMaxResults(Number(e.target.value))}
              className="w-full accent-[#F9B91A] cursor-pointer"
            />
            <p className="text-[11px] text-[#6B7280]">
              Higher numbers increase comprehensive grounding context, but add slightly more tokens per prompt.
            </p>
          </div>

          {/* Relevance Threshold Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between font-bold text-[#17243A]">
              <span>Semantic Similarity Threshold</span>
              <span className="text-sm font-mono text-[#15966B]">
                {(relevanceThreshold * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min={0.5}
              max={0.95}
              step={0.02}
              value={relevanceThreshold}
              onChange={(e) => setRelevanceThreshold(Number(e.target.value))}
              className="w-full accent-[#15966B] cursor-pointer"
            />
            <p className="text-[11px] text-[#6B7280]">
              Discard chunks with cosine similarity below this score to eliminate hallucinations.
            </p>
          </div>

          {/* Chunk Size & Overlap Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#17243A] mb-1">
                Chunk Size (tokens)
              </label>
              <input
                type="number"
                value={chunkSize}
                onChange={(e) => setChunkSize(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-[#E6E7EB] text-[#17243A] font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-[#17243A] mb-1">
                Overlap (tokens)
              </label>
              <input
                type="number"
                value={chunkOverlap}
                onChange={(e) => setChunkOverlap(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-[#E6E7EB] text-[#17243A] font-mono"
              />
            </div>
          </div>

          {/* Behavior Toggles */}
          <div className="space-y-2 pt-2 border-t border-[#F3F4F6]">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={useKnowledgeBaseFirst}
                onChange={(e) => setUseKnowledgeBaseFirst(e.target.checked)}
                className="mt-0.5 rounded-sm text-[#F9B91A] focus:ring-[#F9B91A] cursor-pointer"
              />
              <div>
                <span className="font-bold text-[#17243A]">
                  Prioritize Knowledge Base Over General Knowledge
                </span>
                <p className="text-[11px] text-[#6B7280]">
                  When answering questions about pricing or menu, always quote verified documents directly.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={fallbackToGeneralAI}
                onChange={(e) => setFallbackToGeneralAI(e.target.checked)}
                className="mt-0.5 rounded-sm text-[#F9B91A] focus:ring-[#F9B91A] cursor-pointer"
              />
              <div>
                <span className="font-bold text-[#17243A]">
                  Polite Fallback for Unindexed Inquiries
                </span>
                <p className="text-[11px] text-[#6B7280]">
                  If information is missing, agent promises to consult the bakery manager rather than guessing.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[#F3F4F6] bg-[#FAFAFA] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[#E6E7EB] bg-white hover:bg-[#FAF7F0] text-xs font-bold text-[#64748B] hover:text-[#17243A] transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-[#F9B91A] hover:bg-[#E5A812] active:scale-[0.99] text-xs font-bold text-[#17243A] flex items-center gap-2 shadow-xs cursor-pointer transition-all"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-[#15966B]" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
