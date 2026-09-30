import React from 'react';
import { BookOpen, Database, ArrowRight, CheckCircle2, Search, FileText } from 'lucide-react';

interface KnowledgeRagTabProps {
  onNavigateKnowledgeBase?: () => void;
}

export const KnowledgeRagTab: React.FC<KnowledgeRagTabProps> = ({
  onNavigateKnowledgeBase,
}) => {
  const documents = [
    { title: 'Banana Bread Recipe & Ingredients', type: 'Product Info', tokens: '2.4k', updated: '2 days ago' },
    { title: 'Lagos Delivery Zones & Pricing', type: 'Policy', tokens: '1.8k', updated: '1 week ago' },
    { title: 'Allergen & Gluten-Free FAQ', type: 'Customer FAQ', tokens: '3.1k', updated: '3 days ago' },
    { title: 'Paystack Payment & Refund Policy', type: 'Finance', tokens: '1.2k', updated: 'Yesterday' },
  ];

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl p-6 border border-[#E6E7EB] shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-[#F3F4F6]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] flex items-center justify-center text-[#17243A]">
              <BookOpen className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#17243A]">Knowledge Base & RAG Index</h3>
              <p className="text-xs text-[#6B7280]">
                Retrieval-Augmented Generation provides factual context for bakery queries.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#E8F7EF] text-[#15966B] rounded-full text-xs font-bold border border-[#A7F3D0]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Vector Store Synchronized
          </div>
        </div>

        {/* Philosophy Card */}
        <div className="mt-5 p-4 rounded-xl bg-[#FFF8EC] border border-[#FEEBC8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-[#17243A]">
              Behavior vs. Knowledge Separation
            </h4>
            <p className="text-xs text-[#6B7280] mt-0.5 max-w-xl leading-relaxed">
              This <strong>AI Agent</strong> page configures <em>how</em> your agent behaves and communicates. The dedicated <strong>Knowledge Base</strong> section manages <em>what documents and facts</em> the agent searches.
            </p>
          </div>

          {onNavigateKnowledgeBase && (
            <button
              onClick={onNavigateKnowledgeBase}
              className="px-4 py-2 rounded-xl bg-[#F9B91A] hover:bg-[#E5A812] text-xs font-bold text-[#17243A] flex items-center gap-1.5 shadow-2xs shrink-0 cursor-pointer"
            >
              <span>Open Knowledge Base</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          )}
        </div>

        {/* Synced Collections */}
        <div className="mt-6">
          <h4 className="text-xs font-bold text-[#17243A] uppercase tracking-wider mb-3">
            Active Grounding Collections
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {documents.map((doc, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl border border-[#E6E7EB] bg-[#FAF7F0] flex items-start justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-2.5">
                  <FileText className="w-4 h-4 text-[#64748B] mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold text-[#17243A]">{doc.title}</p>
                    <p className="text-[11px] text-[#6B7280]">
                      {doc.type} • {doc.tokens} tokens
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-[#9CA3AF] shrink-0 font-medium">
                  {doc.updated}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
