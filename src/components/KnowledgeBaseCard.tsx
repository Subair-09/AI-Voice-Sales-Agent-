import React from 'react';
import { BookOpen, FileText, Upload, ArrowRight } from 'lucide-react';

interface KnowledgeDoc {
  id: string;
  name: string;
  updated: string;
  size?: string;
}

interface KnowledgeBaseCardProps {
  onUploadClick: () => void;
  onViewAll?: () => void;
}

export const KnowledgeBaseCard: React.FC<KnowledgeBaseCardProps> = ({
  onUploadClick,
  onViewAll,
}) => {
  const documents: KnowledgeDoc[] = [
    { id: '1', name: 'Product Catalogue.pdf', updated: 'Updated 2 days ago', size: '2.4 MB' },
    { id: '2', name: 'Delivery & Shipping Info.pdf', updated: 'Updated 3 days ago', size: '1.1 MB' },
    { id: '3', name: 'FAQ & Policies.pdf', updated: 'Updated 5 days ago', size: '890 KB' },
    { id: '4', name: 'Order Processing Guide.pdf', updated: 'Updated 1 week ago', size: '1.8 MB' },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E6E7EB] shadow-xs">
      {/* Header with RAG Badge */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#17243A]" />
          <h3 className="text-sm font-bold text-[#17243A]">
            Knowledge Base
          </h3>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#E8F7EF] text-[#15966B] border border-[#A7F3D0] leading-none">
            RAG
          </span>
        </div>

        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-[#15966B] hover:text-[#0D8B68] flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
        </button>
      </div>

      <p className="text-xs text-[#6B7280] leading-snug mb-3.5">
        Manage your knowledge base (PDFs, FAQs, policies, etc.)
      </p>

      {/* 4 Document Rows */}
      <div className="space-y-2 mb-3.5">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#FAF7F0] transition-colors group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#64748B] shrink-0 group-hover:border-[#15966B]/40 group-hover:text-[#15966B] transition-colors">
              <FileText className="w-4 h-4 stroke-[1.8]" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-[#17243A] truncate leading-tight group-hover:text-[#15966B] transition-colors">
                {doc.name}
              </div>
              <div className="text-[10px] text-[#6B7280] leading-tight mt-0.5">
                {doc.updated}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload New Document CTA */}
      <button
        onClick={onUploadClick}
        className="w-full h-10 bg-white hover:bg-stone-50 border border-[#E6E7EB] hover:border-[#F9B91A] text-[#17243A] text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
      >
        <Upload className="w-3.5 h-3.5 text-[#17243A]" />
        <span>Upload New Document</span>
      </button>
    </div>
  );
};
