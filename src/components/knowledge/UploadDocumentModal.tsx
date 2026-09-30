import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  FileText,
  CheckCircle2,
  Loader2,
  Sparkles,
  ArrowRight,
  Database,
  Layers,
  Cpu,
} from 'lucide-react';
import { KnowledgeCategory } from '../../types/knowledge';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (newDoc: any) => void;
}

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<KnowledgeCategory>('Products');
  const [description, setDescription] = useState('');
  const [availableToAI, setAvailableToAI] = useState(true);

  // Upload & Indexing Pipeline simulation state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isComplete, setIsComplete] = useState(false);

  if (!isOpen) return null;

  const pipelineSteps = [
    { label: 'Uploading file', icon: UploadCloud },
    { label: 'Extracting text & OCR', icon: FileText },
    { label: 'Content cleaning & tokenizing', icon: Sparkles },
    { label: 'Creating knowledge chunks', icon: Layers },
    { label: 'Generating vector embeddings', icon: Cpu },
    { label: 'Indexing into Vector Store', icon: Database },
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(cleanTitle);
      setDescription(
        `Business documentation regarding ${cleanTitle.toLowerCase()} for Baked by Doja customer enquiries.`
      );
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(cleanTitle);
      setDescription(
        `Business documentation regarding ${cleanTitle.toLowerCase()} for Baked by Doja customer enquiries.`
      );
    }
  };

  const handleUploadAndIndex = async () => {
    if (!selectedFile || !title.trim()) return;

    setIsProcessing(true);
    setProgressPercent(15);
    setCurrentStep(0);

    // Simulate RAG pipeline stages
    const timer1 = setTimeout(() => {
      setProgressPercent(35);
      setCurrentStep(1);
    }, 700);

    const timer2 = setTimeout(() => {
      setProgressPercent(60);
      setCurrentStep(2);
    }, 1400);

    const timer3 = setTimeout(() => {
      setProgressPercent(82);
      setCurrentStep(3);
    }, 2100);

    const timer4 = setTimeout(() => {
      setProgressPercent(95);
      setCurrentStep(4);
    }, 2800);

    const timer5 = setTimeout(async () => {
      setProgressPercent(100);
      setCurrentStep(5);
      setIsComplete(true);

      try {
        const fileExt = selectedFile.name.split('.').pop()?.toUpperCase() || 'PDF';
        const sizeMb = (selectedFile.size / (1024 * 1024)).toFixed(1) + ' MB';

        const res = await fetch('/api/admin/knowledge/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim(),
            fileName: selectedFile.name,
            category,
            description: description.trim(),
            fileType: fileExt,
            fileSize: sizeMb,
            availableToAI,
            contentPreview: `${title}\n${description}\nFresh bakes, product prices, delivery options, and operating guidelines.`,
          }),
        });

        const data = await res.json();
        if (data && data.document) {
          onUploadSuccess(data.document);
        }
      } catch (err) {
        console.error('Failed to save document:', err);
      }
    }, 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  };

  const handleReset = () => {
    setSelectedFile(null);
    setTitle('');
    setDescription('');
    setIsProcessing(false);
    setProgressPercent(0);
    setCurrentStep(0);
    setIsComplete(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-[#E6E7EB] shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-[#F3F4F6] flex items-start justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-[#17243A]">
              Add to Knowledge Base
            </h3>
            <p className="text-xs text-[#6B7280] mt-1 font-medium">
              Upload information your AI agent should know about your business.
            </p>
          </div>
          <button
            onClick={handleReset}
            className="w-8 h-8 rounded-xl text-[#64748B] hover:text-[#17243A] hover:bg-[#FAF7F0] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {!isProcessing ? (
            <>
              {/* Drag & Drop Upload Area */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                  selectedFile
                    ? 'border-[#15966B] bg-[#E8F7EF]/30'
                    : 'border-[#CBD5E1] bg-[#FAF7F0]/60 hover:bg-[#FAF7F0] hover:border-[#F9B91A]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt,.csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div className="w-12 h-12 rounded-2xl bg-white shadow-2xs border border-[#E6E7EB] text-[#17243A] flex items-center justify-center mx-auto mb-3">
                  {selectedFile ? (
                    <FileText className="w-6 h-6 text-[#15966B]" />
                  ) : (
                    <UploadCloud className="w-6 h-6 text-[#F9B91A]" />
                  )}
                </div>

                {selectedFile ? (
                  <div>
                    <p className="text-sm font-bold text-[#17243A]">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-[#15966B] font-semibold mt-0.5">
                      {(selectedFile.size / 1024).toFixed(0)} KB • Click to choose another file
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-bold text-[#17243A]">
                      Drag & drop your document here
                    </p>
                    <p className="text-xs text-[#6B7280] mt-1">
                      or <span className="text-[#D97706] font-bold underline">Browse Files</span>
                    </p>
                    <p className="text-[11px] text-[#9CA3AF] mt-2">
                      Supported formats: PDF, DOCX, TXT, CSV (Maximum 10 MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Metadata Form */}
              <div className="space-y-4">
                {/* Title & Category Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-[#17243A] mb-1.5">
                      Document Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Lagos Delivery Zones"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[#FAF7F0] border border-[#E6E7EB] text-[#17243A] focus:outline-hidden focus:ring-1 focus:ring-[#F9B91A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#17243A] mb-1.5">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as KnowledgeCategory)}
                      className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-[#FAF7F0] border border-[#E6E7EB] text-[#17243A] cursor-pointer"
                    >
                      <option value="Products">Products</option>
                      <option value="Orders">Orders</option>
                      <option value="Delivery">Delivery</option>
                      <option value="FAQs & Policies">FAQs & Policies</option>
                      <option value="Business">Business</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-[#17243A] mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Short summary of what this document covers..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl bg-[#FAF7F0] border border-[#E6E7EB] text-[#17243A] focus:outline-hidden focus:ring-1 focus:ring-[#F9B91A]"
                  />
                </div>

                {/* Visibility Toggle */}
                <div className="p-3 rounded-xl bg-[#FAF7F0] border border-[#F1EADA] flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#17243A]">
                      Available to AI Agent
                    </p>
                    <p className="text-[11px] text-[#6B7280]">
                      Enable vector semantic search so AI voice agent can answer customer questions with this content.
                    </p>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={availableToAI}
                    onClick={() => setAvailableToAI(!availableToAI)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                      availableToAI ? 'bg-[#15966B]' : 'bg-[#D1D5DB]'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        availableToAI ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Upload & RAG Processing Pipeline UI */
            <div className="space-y-6 py-2">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-[#FFF8EC] text-[#D97706] flex items-center justify-center mx-auto border border-[#FEEBC8] shadow-xs">
                  {isComplete ? (
                    <CheckCircle2 className="w-7 h-7 text-[#15966B]" />
                  ) : (
                    <Loader2 className="w-7 h-7 animate-spin text-[#F9B91A]" />
                  )}
                </div>

                <h4 className="text-sm font-extrabold text-[#17243A]">
                  {isComplete
                    ? 'Document indexed successfully'
                    : `Processing ${selectedFile?.name}...`}
                </h4>
                <p className="text-xs text-[#6B7280]">
                  {isComplete
                    ? 'Your AI sales agent is now grounded with this verified knowledge.'
                    : 'Transforming document into semantic vectors for low-latency voice retrieval.'}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-[#17243A]">
                  <span>Progress</span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#E6E7EB] overflow-hidden">
                  <div
                    className="h-full bg-[#F9B91A] transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* RAG Pipeline Steps Timeline */}
              <div className="bg-[#FAF7F0] rounded-2xl p-4 border border-[#F1EADA] space-y-2.5">
                <h5 className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  RAG Pipeline Status
                </h5>

                <div className="space-y-2">
                  {pipelineSteps.map((step, idx) => {
                    const isDone = currentStep > idx || isComplete;
                    const isCurrent = currentStep === idx && !isComplete;

                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-[#15966B]" />
                          ) : isCurrent ? (
                            <Loader2 className="w-4 h-4 text-[#F9B91A] animate-spin" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-[#D1D5DB]" />
                          )}
                          <span
                            className={`${
                              isDone
                                ? 'text-[#17243A] font-semibold'
                                : isCurrent
                                ? 'text-[#D97706] font-bold'
                                : 'text-[#9CA3AF]'
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>

                        <span
                          className={`text-[10px] font-bold ${
                            isDone
                              ? 'text-[#15966B]'
                              : isCurrent
                              ? 'text-[#D97706]'
                              : 'text-[#9CA3AF]'
                          }`}
                        >
                          {isDone ? '✓ Done' : isCurrent ? 'Working...' : 'Queued'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="p-5 border-t border-[#F3F4F6] bg-[#FAFAFA] flex items-center justify-end gap-3">
          {!isComplete ? (
            <>
              <button
                type="button"
                onClick={handleReset}
                disabled={isProcessing}
                className="px-4 py-2.5 rounded-xl border border-[#E6E7EB] bg-white hover:bg-[#FAF7F0] text-xs font-bold text-[#64748B] hover:text-[#17243A] transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleUploadAndIndex}
                disabled={!selectedFile || !title.trim() || isProcessing}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer ${
                  !selectedFile || !title.trim() || isProcessing
                    ? 'bg-[#E6E7EB] text-[#9CA3AF] cursor-not-allowed'
                    : 'bg-[#F9B91A] hover:bg-[#E5A812] text-[#17243A] active:scale-[0.99]'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Upload & Index</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2.5 rounded-xl bg-[#15966B] hover:bg-[#12815B] text-xs font-bold text-white flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <span>Done</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
