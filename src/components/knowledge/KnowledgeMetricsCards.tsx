import React from 'react';
import { FileText, Database, CheckCircle2, RotateCw } from 'lucide-react';
import { KnowledgeStats } from '../../types/knowledge';

interface KnowledgeMetricsCardsProps {
  stats: KnowledgeStats;
}

export const KnowledgeMetricsCards: React.FC<KnowledgeMetricsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Documents */}
      <div className="bg-white rounded-2xl p-5 border border-[#E6E7EB] shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
        <div>
          <span className="text-xs font-semibold text-[#6B7280]">Total Documents</span>
          <div className="text-2xl font-extrabold text-[#17243A] mt-1 tracking-tight">
            {stats.totalDocuments}
          </div>
          <span className="text-[11px] font-medium text-[#6B7280] mt-0.5 inline-block">
            {stats.totalCategories} categories
          </span>
        </div>
        <div className="w-11 h-11 rounded-2xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5 stroke-[2.2]" />
        </div>
      </div>

      {/* 2. Knowledge Chunks */}
      <div className="bg-white rounded-2xl p-5 border border-[#E6E7EB] shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
        <div>
          <span className="text-xs font-semibold text-[#6B7280]">Knowledge Chunks</span>
          <div className="text-2xl font-extrabold text-[#17243A] mt-1 tracking-tight">
            {stats.knowledgeChunks}
          </div>
          <span className="text-[11px] font-medium text-[#6B7280] mt-0.5 inline-block">
            Available to AI
          </span>
        </div>
        <div className="w-11 h-11 rounded-2xl bg-[#F3E8FF] text-[#9333EA] flex items-center justify-center shrink-0">
          <Database className="w-5 h-5 stroke-[2.2]" />
        </div>
      </div>

      {/* 3. Indexed Documents */}
      <div className="bg-white rounded-2xl p-5 border border-[#E6E7EB] shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
        <div>
          <span className="text-xs font-semibold text-[#6B7280]">Indexed Documents</span>
          <div className="text-2xl font-extrabold text-[#17243A] mt-1 tracking-tight">
            {stats.indexedDocuments}
          </div>
          <span className="text-[11px] font-medium text-[#15966B] mt-0.5 inline-block font-semibold">
            Ready for AI
          </span>
        </div>
        <div className="w-11 h-11 rounded-2xl bg-[#E8F7EF] text-[#15966B] flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
        </div>
      </div>

      {/* 4. Last Updated */}
      <div className="bg-white rounded-2xl p-5 border border-[#E6E7EB] shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
        <div>
          <span className="text-xs font-semibold text-[#6B7280]">Last Updated</span>
          <div className="text-xl font-extrabold text-[#17243A] mt-1 tracking-tight">
            {stats.lastUpdated}
          </div>
          <span className="text-[11px] font-medium text-[#6B7280] mt-0.5 inline-block">
            Knowledge synchronized
          </span>
        </div>
        <div className="w-11 h-11 rounded-2xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0">
          <RotateCw className="w-5 h-5 stroke-[2.2]" />
        </div>
      </div>
    </div>
  );
};
