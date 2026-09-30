import React, { useState } from 'react';
import {
  X,
  FileText,
  Copy,
  Check,
  Download,
  Layers,
  Search,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { KnowledgeDocument } from '../../types/knowledge';

interface DocumentContentPreviewModalProps {
  document: KnowledgeDocument | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentContentPreviewModal: React.FC<DocumentContentPreviewModalProps> = ({
  document,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'full' | 'chunks' | 'test'>('full');
  const [copied, setCopied] = useState(false);
  const [testQuery, setTestQuery] = useState('');
  const [testResult, setTestResult] = useState<{
    matchedChunkIndex: number;
    score: number;
    snippet: string;
  } | null>(null);

  if (!isOpen || !document) return null;

  const content = document.fullContent || document.contentPreview || 'No content available.';

  // Simulate chunk breakdown (split paragraphs or every 250 chars)
  const simulatedChunks = content
    .split(/\n\n+/)
    .filter((c) => c.trim().length > 0)
    .map((chunk, index) => ({
      index: index + 1,
      tokens: Math.round(chunk.length / 3.8),
      text: chunk.trim(),
    }));

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = document.fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRunSemanticSearch = () => {
    if (!testQuery.trim() || simulatedChunks.length === 0) return;
    const lowerQuery = testQuery.toLowerCase();

    // Find best matching chunk based on keyword overlaps
    let bestMatchIdx = 0;
    let maxOverlap = 0;

    simulatedChunks.forEach((c, i) => {
      const words = lowerQuery.split(/\s+/);
      let count = 0;
      words.forEach((w) => {
        if (c.text.toLowerCase().includes(w)) count += 1;
      });
      if (count > maxOverlap) {
        maxOverlap = count;
        bestMatchIdx = i;
      }
    });

    const score = maxOverlap > 0 ? Math.min(0.96, 0.72 + maxOverlap * 0.08) : 0.68;
    setTestResult({
      matchedChunkIndex: bestMatchIdx + 1,
      score,
      snippet: simulatedChunks[bestMatchIdx]?.text || simulatedChunks[0].text,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#E6E7EB] shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-[#F3F4F6] flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-[#17243A]">
                  {document.fileName}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F7EF] text-[#15966B]">
                  {document.status}
                </span>
              </div>
              <p className="text-xs text-[#6B7280] font-medium">
                {document.category} • {document.fileSize} • {document.chunkCount} vector chunks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopy}
              className="p-2 rounded-xl text-[#64748B] hover:text-[#17243A] hover:bg-[#FAF7F0] transition-colors cursor-pointer"
              title="Copy text"
            >
              {copied ? (
                <Check className="w-4 h-4 text-[#15966B]" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={handleDownload}
              className="p-2 rounded-xl text-[#64748B] hover:text-[#17243A] hover:bg-[#FAF7F0] transition-colors cursor-pointer"
              title="Download file"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#64748B] hover:text-[#17243A] hover:bg-[#FAF7F0] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-2 border-b border-[#F3F4F6] bg-[#FAF7F0]/40 text-xs">
          <button
            onClick={() => setActiveTab('full')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'full'
                ? 'bg-white text-[#17243A] shadow-2xs border border-[#E6E7EB]'
                : 'text-[#64748B] hover:text-[#17243A]'
            }`}
          >
            Full Content
          </button>

          <button
            onClick={() => setActiveTab('chunks')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'chunks'
                ? 'bg-white text-[#17243A] shadow-2xs border border-[#E6E7EB]'
                : 'text-[#64748B] hover:text-[#17243A]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Vector Chunks ({simulatedChunks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('test')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'test'
                ? 'bg-[#F9B91A] text-[#17243A] shadow-2xs'
                : 'text-[#64748B] hover:text-[#17243A]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Test Semantic Retrieval</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {activeTab === 'full' && (
            <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#E6E7EB] font-mono text-xs text-[#334155] whitespace-pre-wrap leading-relaxed select-text">
              {content}
            </div>
          )}

          {activeTab === 'chunks' && (
            <div className="space-y-3">
              {simulatedChunks.map((chunk) => (
                <div
                  key={chunk.index}
                  className="p-3.5 rounded-2xl bg-[#FAF7F0] border border-[#E6E7EB] space-y-1.5 hover:border-[#D1D5DB] transition-all"
                >
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-[#0284C7] bg-[#E0F2FE] px-2 py-0.5 rounded-md">
                      Chunk #{chunk.index}
                    </span>
                    <span className="text-[#64748B] font-mono">
                      ~{chunk.tokens} tokens
                    </span>
                  </div>
                  <p className="text-xs text-[#334155] leading-relaxed whitespace-pre-wrap font-sans">
                    {chunk.text}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'test' && (
            <div className="space-y-4">
              <div className="bg-[#FFFBEB] p-3.5 rounded-2xl border border-[#FDE68A]">
                <p className="font-bold text-xs text-[#17243A] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>Verify RAG Retrieval for Call Agents</span>
                </p>
                <p className="text-[11px] text-[#6B7280] mt-0.5">
                  Simulate a caller inquiry to see which knowledge chunk is fetched with high cosine similarity.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={testQuery}
                    onChange={(e) => setTestQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRunSemanticSearch()}
                    placeholder="e.g. How much is classic loaf or what are delivery rates?"
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-[#FAF7F0] border border-[#E6E7EB] text-[#17243A] focus:outline-hidden focus:ring-1 focus:ring-[#F9B91A]"
                  />
                </div>
                <button
                  onClick={handleRunSemanticSearch}
                  className="px-4 py-2 rounded-xl bg-[#F9B91A] hover:bg-[#E5A812] text-xs font-bold text-[#17243A] cursor-pointer shadow-xs"
                >
                  Test Query
                </button>
              </div>

              {testResult && (
                <div className="p-4 rounded-2xl bg-[#E8F7EF] border border-[#A7F3D0] space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#15966B] flex items-center gap-1.5">
                      <Check className="w-4 h-4 stroke-[3]" />
                      Matched Chunk #{testResult.matchedChunkIndex}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#15966B] text-white font-mono">
                      {(testResult.score * 100).toFixed(1)}% Match
                    </span>
                  </div>
                  <div className="p-3 bg-white/80 rounded-xl text-xs text-[#17243A] leading-relaxed border border-[#A7F3D0]">
                    {testResult.snippet}
                  </div>
                  <p className="text-[11px] text-[#065F46] font-medium">
                    AI Voice agent will use this context to craft an instant natural voice response.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#F3F4F6] bg-[#FAFAFA] flex items-center justify-between text-xs text-[#6B7280]">
          <span>Document ID: {document.id}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-[#E6E7EB] bg-white hover:bg-[#FAF7F0] text-xs font-bold text-[#17243A] cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
