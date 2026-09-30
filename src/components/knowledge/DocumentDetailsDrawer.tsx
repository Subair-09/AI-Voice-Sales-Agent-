import React, { useState } from 'react';
import {
  X,
  FileText,
  Clock,
  Edit2,
  Check,
  CheckCircle2,
  RefreshCw,
  Download,
  Trash2,
  ArrowRight,
  Save,
} from 'lucide-react';
import { KnowledgeDocument } from '../../types/knowledge';

interface DocumentDetailsDrawerProps {
  document: KnowledgeDocument | null;
  isOpen: boolean;
  onClose: () => void;
  onReindex: (doc: KnowledgeDocument) => Promise<void>;
  onDelete: (doc: KnowledgeDocument) => void;
  onUpdateDescription: (docId: string, newDesc: string) => Promise<void>;
  onViewFullContent: (doc: KnowledgeDocument) => void;
}

export const DocumentDetailsDrawer: React.FC<DocumentDetailsDrawerProps> = ({
  document,
  isOpen,
  onClose,
  onReindex,
  onDelete,
  onUpdateDescription,
  onViewFullContent,
}) => {
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descriptionInput, setDescriptionInput] = useState('');
  const [isSavingDesc, setIsSavingDesc] = useState(false);
  const [isReindexing, setIsReindexing] = useState(false);

  React.useEffect(() => {
    if (document) {
      setDescriptionInput(document.description);
      setIsEditingDesc(false);
    }
  }, [document]);

  if (!isOpen || !document) return null;

  const isPdf = document.fileName.toLowerCase().endsWith('.pdf');

  const handleSaveDescription = async () => {
    setIsSavingDesc(true);
    try {
      await onUpdateDescription(document.id, descriptionInput);
      setIsEditingDesc(false);
    } finally {
      setIsSavingDesc(false);
    }
  };

  const handleReindexClick = async () => {
    setIsReindexing(true);
    try {
      await onReindex(document);
    } finally {
      setTimeout(() => setIsReindexing(false), 800);
    }
  };

  const handleDownload = () => {
    const textContent = document.fullContent || document.contentPreview || document.description;
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = document.fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E6E7EB] shadow-xs p-5 lg:p-6 space-y-6 flex flex-col justify-between">
      <div className="space-y-6">
        {/* 1. Header with Close Button */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F3F4F6]">
          <h3 className="text-base font-bold text-[#17243A]">Document Details</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-[#64748B] hover:text-[#17243A] hover:bg-[#FAF7F0] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. Top Selected File Banner */}
        <div className="flex items-start gap-3.5">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
              isPdf
                ? 'bg-[#FEE2E2] text-[#DC2626]'
                : 'bg-[#E0F2FE] text-[#0284C7]'
            }`}
          >
            {isPdf ? (
              <span className="text-xs font-black tracking-tight">PDF</span>
            ) : (
              <FileText className="w-6 h-6 stroke-[2]" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm text-[#17243A] truncate">
                {document.fileName}
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F7EF] text-[#15966B] border border-[#A7F3D0] shrink-0">
                {document.status}
              </span>
            </div>

            <p className="text-xs text-[#6B7280] mt-0.5">
              Category:{' '}
              <span className="font-bold text-[#0284C7]">
                {document.category}
              </span>
            </p>

            <p className="text-[11px] font-medium text-[#9CA3AF] mt-0.5">
              {document.fileSize} • {document.chunkCount} chunks
            </p>
          </div>
        </div>

        {/* 3. Upload & Last Update Timestamps */}
        <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#FAF7F0] border border-[#F1EADA] text-xs">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#6B7280]">
              <Clock className="w-3.5 h-3.5" />
              <span>Uploaded</span>
            </div>
            <div className="font-bold text-[#17243A] mt-0.5">
              {document.uploadedDate}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#6B7280]">
              <Clock className="w-3.5 h-3.5" />
              <span>Last Updated</span>
            </div>
            <div className="font-bold text-[#17243A] mt-0.5">
              {document.lastUpdated}
            </div>
          </div>
        </div>

        {/* 4. Description Section */}
        <div>
          <h5 className="text-xs font-bold text-[#17243A] mb-1.5">Description</h5>

          {isEditingDesc ? (
            <div className="space-y-2">
              <textarea
                value={descriptionInput}
                onChange={(e) => setDescriptionInput(e.target.value)}
                rows={3}
                className="w-full p-2.5 text-xs rounded-xl bg-[#FAF7F0] border border-[#E6E7EB] text-[#17243A] focus:outline-hidden focus:ring-1 focus:ring-[#F9B91A]"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setIsEditingDesc(false)}
                  className="px-3 py-1 rounded-lg text-xs font-semibold text-[#64748B] hover:bg-[#FAF7F0] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDescription}
                  disabled={isSavingDesc}
                  className="px-3.5 py-1 rounded-lg bg-[#F9B91A] text-xs font-bold text-[#17243A] flex items-center gap-1.5 shadow-2xs cursor-pointer hover:bg-[#E5A812]"
                >
                  <Save className="w-3 h-3" />
                  <span>{isSavingDesc ? 'Saving...' : 'Save'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                {document.description}
              </p>
              <button
                onClick={() => setIsEditingDesc(true)}
                className="mt-2.5 px-3 py-1.5 rounded-xl border border-[#E6E7EB] hover:bg-[#FAF7F0] text-xs font-bold text-[#17243A] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Edit2 className="w-3.5 h-3.5 text-[#64748B]" />
                <span>Edit Description</span>
              </button>
            </div>
          )}
        </div>

        {/* 5. Content Preview Section */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <h5 className="text-xs font-bold text-[#17243A] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Content Preview</span>
            </h5>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF7F0] border border-[#E6E7EB] text-xs leading-relaxed text-[#334155] whitespace-pre-line font-mono font-medium">
            {document.contentPreview}
          </div>

          <button
            onClick={() => onViewFullContent(document)}
            className="mt-2 text-xs font-bold text-[#0284C7] hover:text-[#0369A1] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>View Full Content</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>

        {/* 6. Processing Section */}
        <div>
          <h5 className="text-xs font-bold text-[#17243A] mb-2.5 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#15966B]" />
            <span>Processing</span>
          </h5>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#475569]">
                <CheckCircle2 className="w-4 h-4 text-[#15966B]" />
                <span>Text extracted</span>
              </div>
              <span className="font-semibold text-[#15966B]">
                {document.textExtractedStatus}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#475569]">
                <CheckCircle2 className="w-4 h-4 text-[#15966B]" />
                <span>Chunks created</span>
              </div>
              <span className="font-bold text-[#17243A]">
                {document.chunkCount}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#475569]">
                <CheckCircle2 className="w-4 h-4 text-[#15966B]" />
                <span>Embeddings</span>
              </div>
              <span className="font-semibold text-[#15966B]">
                {document.embeddingStatus}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#475569]">
                <CheckCircle2 className="w-4 h-4 text-[#15966B]" />
                <span>Vector index</span>
              </div>
              <span className="font-semibold text-[#15966B]">
                {document.vectorIndexStatus}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2 text-[#475569]">
                <CheckCircle2 className="w-4 h-4 text-[#15966B]" />
                <span>Last indexed</span>
              </div>
              <span className="text-[11px] font-medium text-[#64748B]">
                {document.lastIndexed}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Action Buttons at Bottom */}
      <div className="space-y-2.5 pt-4 border-t border-[#F3F4F6]">
        {/* Re-index Document Button */}
        <button
          onClick={handleReindexClick}
          disabled={isReindexing}
          className="w-full py-2.5 px-4 rounded-xl bg-[#F9B91A] hover:bg-[#E5A812] active:scale-[0.99] font-bold text-xs text-[#17243A] flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
        >
          <RefreshCw
            className={`w-4 h-4 stroke-[2.3] ${isReindexing ? 'animate-spin' : ''}`}
          />
          <span>{isReindexing ? 'Indexing Document...' : 'Re-index Document'}</span>
        </button>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          className="w-full py-2 px-4 rounded-xl bg-white hover:bg-[#FAF7F0] border border-[#E6E7EB] text-xs font-bold text-[#17243A] flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
        >
          <Download className="w-3.5 h-3.5 stroke-[2.2] text-[#64748B]" />
          <span>Download</span>
        </button>

        {/* Delete Document Button */}
        <button
          onClick={() => onDelete(document)}
          className="w-full py-2 px-4 rounded-xl bg-white hover:bg-[#FEE2E2]/50 border border-[#FCA5A5] text-xs font-bold text-[#DC2626] flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5 stroke-[2.2]" />
          <span>Delete Document</span>
        </button>
      </div>
    </div>
  );
};
