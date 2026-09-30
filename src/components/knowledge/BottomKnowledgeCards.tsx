import React from 'react';
import { BookOpen, ShieldCheck, ArrowRight } from 'lucide-react';

interface BottomKnowledgeCardsProps {
  onOpenUpload: () => void;
  onOpenSettings: () => void;
}

export const BottomKnowledgeCards: React.FC<BottomKnowledgeCardsProps> = ({
  onOpenUpload,
  onOpenSettings,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 1. Keep Your Knowledge Base Updated Card */}
      <div className="bg-[#FFF8EC] border border-[#FEEBC8] rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#FFE39A] text-[#854D0E] flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#17243A]">
              Keep Your Knowledge Base Updated
            </h4>
            <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
              The more accurate and detailed your information, the better your AI agent can serve your customers.
            </p>
          </div>
        </div>

        <div className="mt-4 pt-2">
          <button
            onClick={onOpenUpload}
            className="px-4 py-2 rounded-xl bg-white hover:bg-[#FAF7F0] border border-[#E6E7EB] text-xs font-bold text-[#17243A] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <span>Manage Knowledge Base</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* 2. RAG Settings Card */}
      <div className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#BBF7D0] text-[#166534] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#17243A]">RAG Settings</h4>
            <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
              Control how your AI agent retrieves information from your knowledge base.
            </p>
          </div>
        </div>

        <div className="mt-4 pt-2">
          <button
            onClick={onOpenSettings}
            className="px-4 py-2 rounded-xl bg-white hover:bg-[#FAF7F0] border border-[#E6E7EB] text-xs font-bold text-[#17243A] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <span>Manage Settings</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
