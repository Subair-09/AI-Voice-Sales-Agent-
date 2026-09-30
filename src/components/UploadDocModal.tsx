import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, Loader2, Sparkles, BookOpen } from 'lucide-react';

interface UploadDocModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDocUploaded?: (doc: { name: string; size: string }) => void;
}

export const UploadDocModal: React.FC<UploadDocModalProps> = ({
  isOpen,
  onClose,
  onDocUploaded,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docCategory, setDocCategory] = useState('menu');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsProcessing(true);
    // Simulate RAG extraction and embedding pipeline
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      if (onDocUploaded) {
        onDocUploaded({
          name: selectedFile.name,
          size: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`,
        });
      }
      setTimeout(() => {
        setIsSuccess(false);
        setSelectedFile(null);
        onClose();
      }, 1400);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-[#E6E7EB] animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E8F7EF] text-[#15966B] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#17243A]">
                Upload Knowledge Document
              </h3>
              <p className="text-[11px] text-[#6B7280]">
                Sync PDFs or FAQs for AI Voice Agent RAG retrieval
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-[#17243A]">
              Document Embedded Successfully!
            </h4>
            <p className="text-xs text-gray-600 max-w-xs mx-auto">
              Vector chunks extracted. Your AI voice agent can now answer questions referencing this document.
            </p>
          </div>
        ) : (
          <form onSubmit={handleUploadSubmit} className="space-y-4 pt-4">
            {/* Drop Zone */}
            <label className="block border-2 border-dashed border-gray-200 hover:border-[#F9B91A] rounded-2xl p-6 text-center cursor-pointer transition-colors bg-[#FAF7F0]/40">
              <input
                type="file"
                accept=".pdf,.txt,.docx,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload className="w-8 h-8 text-[#94A3B8] mx-auto mb-2" />
              {selectedFile ? (
                <div>
                  <div className="text-xs font-bold text-[#17243A] flex items-center justify-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#15966B]" />
                    <span>{selectedFile.name}</span>
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    {(selectedFile.size / 1024).toFixed(1)} KB • Click to choose another
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-xs font-semibold text-[#17243A]">
                    Click or drag PDF catalogue, policy, or menu
                  </div>
                  <div className="text-[11px] text-[#6B7280] mt-1">
                    Supports PDF, DOCX, CSV up to 15MB
                  </div>
                </div>
              )}
            </label>

            {/* Document Purpose / Tag */}
            <div>
              <label className="block text-xs font-semibold text-[#17243A] mb-1">
                Document Category for Agent
              </label>
              <select
                value={docCategory}
                onChange={(e) => setDocCategory(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-[#E6E7EB] rounded-xl text-xs text-[#17243A] focus:outline-none focus:border-[#F9B91A]"
              >
                <option value="menu">Product Catalogue & Pricing</option>
                <option value="delivery">Delivery, Shipping & Pickup Policies</option>
                <option value="faqs">Baking Ingredients & Allergen FAQs</option>
                <option value="promotions">Special Offers & Bulk Discounts</option>
              </select>
            </div>

            {/* RAG Information Notice */}
            <div className="p-3 bg-[#E8F7EF] rounded-xl border border-[#A7F3D0] flex items-start gap-2.5 text-xs text-[#15966B]">
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <strong>RAG Pipeline:</strong> When uploaded, the text is automatically parsed, split into semantically relevant chunks, and made available during phone calls.
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedFile || isProcessing}
                className="px-5 py-2 text-xs font-bold text-[#17243A] bg-[#F9B91A] hover:bg-[#ECAE0E] rounded-xl shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Extracting Embeddings...</span>
                  </>
                ) : (
                  <span>Upload & Index</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
