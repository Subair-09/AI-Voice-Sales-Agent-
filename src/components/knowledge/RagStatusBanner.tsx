import React, { useState } from 'react';
import { Check, RefreshCw } from 'lucide-react';
import { KnowledgeStats } from '../../types/knowledge';

interface RagStatusBannerProps {
  stats: KnowledgeStats;
  onRefresh: () => Promise<void>;
}

export const RagStatusBanner: React.FC<RagStatusBannerProps> = ({
  stats,
  onRefresh,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E6E7EB] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
      {/* Left side: Icon + Title + Description */}
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-full bg-[#15966B] text-white flex items-center justify-center shrink-0 shadow-xs">
          <Check className="w-6 h-6 stroke-[3]" />
        </div>
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-[#17243A]">
              Knowledge Base is Active
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E8F7EF] text-[#15966B] border border-[#A7F3D0]">
              <span className="w-2 h-2 rounded-full bg-[#15966B] animate-pulse" />
              RAG Active
            </span>
          </div>
          <p className="text-xs text-[#6B7280] mt-1 font-medium">
            Your AI agent can access your business information during customer conversations.
          </p>
        </div>
      </div>

      {/* Right side: Stats + Refresh button */}
      <div className="flex flex-wrap items-center gap-6 sm:gap-8 self-end lg:self-center">
        <div className="flex items-center gap-6 sm:gap-8">
          <div>
            <div className="text-sm font-extrabold text-[#17243A]">
              {stats.totalDocuments}
            </div>
            <div className="text-[11px] text-[#6B7280] font-medium">Documents</div>
          </div>

          <div className="h-7 w-px bg-[#E6E7EB]" />

          <div>
            <div className="text-sm font-extrabold text-[#17243A]">
              {stats.knowledgeChunks}
            </div>
            <div className="text-[11px] text-[#6B7280] font-medium">Knowledge Chunks</div>
          </div>

          <div className="h-7 w-px bg-[#E6E7EB]" />

          <div>
            <div className="text-[11px] text-[#6B7280] font-medium">Last Updated</div>
            <div className="text-xs font-bold text-[#17243A]">
              {stats.lastUpdated}
            </div>
          </div>
        </div>

        {/* Refresh Knowledge Button */}
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAF7F0] border border-[#E6E7EB] text-xs font-bold text-[#17243A] flex items-center gap-2 transition-all cursor-pointer shadow-2xs hover:border-[#D1D5DB]"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 stroke-[2.3] ${isRefreshing ? 'animate-spin text-[#F9B91A]' : 'text-[#64748B]'}`}
          />
          <span>Refresh Knowledge</span>
        </button>
      </div>
    </div>
  );
};
