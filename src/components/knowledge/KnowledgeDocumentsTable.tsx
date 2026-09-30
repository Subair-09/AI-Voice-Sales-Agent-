import React, { useState } from 'react';
import {
  Search,
  ChevronDown,
  Filter,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  Download,
  Trash2,
  FileText,
  FileCheck,
  AlertCircle,
} from 'lucide-react';
import { KnowledgeDocument, KnowledgeCategory, KnowledgeStatus } from '../../types/knowledge';

interface KnowledgeDocumentsTableProps {
  documents: KnowledgeDocument[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  selectedDocId?: string;
  searchQuery: string;
  selectedCategory: string;
  selectedStatus: string;
  selectedSort: string;
  onSearchChange: (q: string) => void;
  onCategoryChange: (cat: string) => void;
  onStatusChange: (status: string) => void;
  onSortChange: (sort: string) => void;
  onPageChange: (page: number) => void;
  onSelectDocument: (doc: KnowledgeDocument) => void;
  onReindexDocument: (doc: KnowledgeDocument) => void;
  onDeleteDocument: (doc: KnowledgeDocument) => void;
  onViewContentPreview: (doc: KnowledgeDocument) => void;
}

export const KnowledgeDocumentsTable: React.FC<KnowledgeDocumentsTableProps> = ({
  documents,
  totalCount,
  currentPage,
  totalPages,
  pageSize,
  selectedDocId,
  searchQuery,
  selectedCategory,
  selectedStatus,
  selectedSort,
  onSearchChange,
  onCategoryChange,
  onStatusChange,
  onSortChange,
  onPageChange,
  onSelectDocument,
  onReindexDocument,
  onDeleteDocument,
  onViewContentPreview,
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Close menus when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const getCategoryBadgeClass = (category: KnowledgeCategory) => {
    switch (category) {
      case 'Products':
        return 'bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD]';
      case 'Delivery':
        return 'bg-[#F3E8FF] text-[#9333EA] border border-[#E9D5FF]';
      case 'FAQs & Policies':
        return 'bg-[#FFEDD5] text-[#C2410C] border border-[#FED7AA]';
      case 'Orders':
        return 'bg-[#E8F7EF] text-[#15966B] border border-[#A7F3D0]';
      case 'Business':
        return 'bg-[#F3E8FF] text-[#7E22CE] border border-[#DDD6FE]';
      case 'General':
      default:
        return 'bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]';
    }
  };

  const getStatusBadge = (status: KnowledgeStatus) => {
    switch (status) {
      case 'Indexed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E8F7EF] text-[#15966B] border border-[#A7F3D0]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#15966B]" />
            Indexed
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse" />
            Processing
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
            Failed
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF]" />
            Pending
          </span>
        );
    }
  };

  const startEntry = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endEntry = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="bg-white rounded-2xl border border-[#E6E7EB] shadow-xs overflow-hidden">
      {/* 1. Header & Filter Toolbar */}
      <div className="p-5 border-b border-[#F3F4F6] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#17243A]">
            Knowledge Documents
          </h3>
          <span className="text-xs text-[#6B7280] font-medium hidden sm:inline-block">
            {totalCount} total documents configured
          </span>
        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-[#FAF7F0] border border-[#E6E7EB] text-[#17243A] placeholder-[#9CA3AF] focus:outline-hidden focus:ring-1 focus:ring-[#F9B91A] focus:border-[#F9B91A] transition-all"
            />
          </div>

          {/* Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Dropdown */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 text-xs font-semibold rounded-xl bg-[#FAF7F0] border border-[#E6E7EB] text-[#17243A] cursor-pointer hover:border-[#D1D5DB] transition-all"
              >
                <option value="All Categories">All Categories</option>
                <option value="Products">Products</option>
                <option value="Orders">Orders</option>
                <option value="Delivery">Delivery</option>
                <option value="FAQs & Policies">FAQs & Policies</option>
                <option value="Business">Business</option>
                <option value="General">General</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#6B7280] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Status Dropdown */}
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => onStatusChange(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 text-xs font-semibold rounded-xl bg-[#FAF7F0] border border-[#E6E7EB] text-[#17243A] cursor-pointer hover:border-[#D1D5DB] transition-all"
              >
                <option value="All Status">All Status</option>
                <option value="Indexed">Indexed</option>
                <option value="Processing">Processing</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#6B7280] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={selectedSort}
                onChange={(e) => onSortChange(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 text-xs font-semibold rounded-xl bg-[#FAF7F0] border border-[#E6E7EB] text-[#17243A] cursor-pointer hover:border-[#D1D5DB] transition-all"
              >
                <option value="Recently Updated">Recently Updated</option>
                <option value="Name (A-Z)">Name (A-Z)</option>
                <option value="Size (Largest)">Size (Largest)</option>
                <option value="Chunks (Most)">Chunks (Most)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#6B7280] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Filter icon reset button */}
            <button
              onClick={() => {
                onSearchChange('');
                onCategoryChange('All Categories');
                onStatusChange('All Status');
                onSortChange('Recently Updated');
              }}
              title="Reset all filters"
              className="p-2 rounded-xl bg-[#FAF7F0] hover:bg-[#F3EFE6] border border-[#E6E7EB] text-[#64748B] hover:text-[#17243A] transition-colors cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Documents Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#F3F4F6] text-[11px] font-bold text-[#64748B] uppercase tracking-wider bg-[#FAFAFA]/70">
              <th className="py-3 px-5">Document</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-3">Type</th>
              <th className="py-3 px-3">Size</th>
              <th className="py-3 px-3">Chunks</th>
              <th className="py-3 px-4">Updated</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3F4F6] text-xs">
            {documents.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center">
                  <div className="max-w-sm mx-auto text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-[#FAF7F0] text-[#9CA3AF] flex items-center justify-center mx-auto">
                      <FileText className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-[#17243A]">
                      No documents match your filter
                    </p>
                    <p className="text-[11px] text-[#6B7280]">
                      Try changing your search term or reset filters to view all knowledge documents.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              documents.map((doc) => {
                const isSelected = selectedDocId === doc.id;
                const isPdf = doc.fileName.toLowerCase().endsWith('.pdf');

                return (
                  <tr
                    key={doc.id}
                    onClick={() => onSelectDocument(doc)}
                    className={`transition-colors cursor-pointer group ${
                      isSelected
                        ? 'bg-[#FFFBEB] hover:bg-[#FEF3C7]/40'
                        : 'hover:bg-[#FAF7F0]/80'
                    }`}
                  >
                    {/* Document Name + Description + Icon */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            isPdf
                              ? 'bg-[#FEE2E2] text-[#DC2626]'
                              : 'bg-[#E0F2FE] text-[#0284C7]'
                          }`}
                        >
                          {isPdf ? (
                            <span className="text-[10px] font-extrabold tracking-tighter">
                              PDF
                            </span>
                          ) : (
                            <FileText className="w-4 h-4 stroke-[2.2]" />
                          )}
                        </div>
                        <div className="min-w-0 max-w-[240px] sm:max-w-xs">
                          <p className="font-bold text-[#17243A] truncate group-hover:text-[#0F172A]">
                            {doc.fileName}
                          </p>
                          <p className="text-[11px] text-[#6B7280] line-clamp-1 mt-0.5">
                            {doc.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${getCategoryBadgeClass(
                          doc.category
                        )}`}
                      >
                        {doc.category}
                      </span>
                    </td>

                    {/* Type */}
                    <td className="py-3.5 px-3 whitespace-nowrap font-mono text-[11px] text-[#64748B] font-bold">
                      <span className="bg-[#F3F4F6] text-[#4B5563] text-[10px] font-extrabold px-1.5 py-0.5 rounded-md">
                        {doc.fileType}
                      </span>
                    </td>

                    {/* Size */}
                    <td className="py-3.5 px-3 whitespace-nowrap font-mono text-[11px] text-[#64748B]">
                      {doc.fileSize}
                    </td>

                    {/* Chunks */}
                    <td className="py-3.5 px-3 whitespace-nowrap font-mono text-xs font-bold text-[#17243A]">
                      {doc.chunkCount}
                    </td>

                    {/* Updated */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-[#6B7280] text-[11px]">
                      {doc.lastUpdated}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(doc.status)}
                    </td>

                    {/* Actions Menu */}
                    <td
                      className="py-3.5 px-4 text-right whitespace-nowrap relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() =>
                          setActiveMenuId(activeMenuId === doc.id ? null : doc.id)
                        }
                        className="p-1.5 rounded-lg text-[#64748B] hover:text-[#17243A] hover:bg-[#E6E7EB]/50 transition-colors cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === doc.id && (
                        <div className="absolute right-4 top-10 w-44 bg-white rounded-xl shadow-lg border border-[#E6E7EB] py-1.5 z-30 text-left">
                          <button
                            onClick={() => {
                              onSelectDocument(doc);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3 py-1.5 text-xs text-[#17243A] hover:bg-[#FAF7F0] flex items-center gap-2 cursor-pointer font-medium"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#64748B]" />
                            <span>View Details</span>
                          </button>

                          <button
                            onClick={() => {
                              onViewContentPreview(doc);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3 py-1.5 text-xs text-[#17243A] hover:bg-[#FAF7F0] flex items-center gap-2 cursor-pointer font-medium"
                          >
                            <FileCheck className="w-3.5 h-3.5 text-[#64748B]" />
                            <span>Content Preview</span>
                          </button>

                          <button
                            onClick={() => {
                              onReindexDocument(doc);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3 py-1.5 text-xs text-[#17243A] hover:bg-[#FAF7F0] flex items-center gap-2 cursor-pointer font-medium"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-[#15966B]" />
                            <span>Re-index</span>
                          </button>

                          <a
                            href={`#download-${doc.id}`}
                            onClick={(e) => {
                              e.preventDefault();
                              const blob = new Blob([doc.fullContent || doc.contentPreview], {
                                type: 'text/plain',
                              });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = doc.fileName;
                              a.click();
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3 py-1.5 text-xs text-[#17243A] hover:bg-[#FAF7F0] flex items-center gap-2 cursor-pointer font-medium"
                          >
                            <Download className="w-3.5 h-3.5 text-[#64748B]" />
                            <span>Download</span>
                          </a>

                          <div className="h-px bg-[#F3F4F6] my-1" />

                          <button
                            onClick={() => {
                              onDeleteDocument(doc);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3 py-1.5 text-xs text-[#DC2626] hover:bg-[#FEE2E2]/60 flex items-center gap-2 cursor-pointer font-medium"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Document</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 3. Pagination Footer */}
      <div className="p-4 border-t border-[#F3F4F6] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <span className="text-[#6B7280] font-medium">
          Showing {startEntry} - {endEntry} of {totalCount} documents
        </span>

        <div className="flex items-center gap-1.5 self-center sm:self-auto">
          {/* Previous Page */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${
              currentPage <= 1
                ? 'border-[#E6E7EB] text-[#D1D5DB] cursor-not-allowed bg-white'
                : 'border-[#E6E7EB] text-[#17243A] hover:bg-[#FAF7F0] cursor-pointer'
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* Page numbers */}
          {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map((p) => {
            const isActive = p === currentPage;
            return (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#F9B91A] text-[#17243A] shadow-2xs border border-[#F9B91A]'
                    : 'bg-white border border-[#E6E7EB] text-[#64748B] hover:text-[#17243A] hover:bg-[#FAF7F0]'
                }`}
              >
                {p}
              </button>
            );
          })}

          {/* Next Page */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${
              currentPage >= totalPages
                ? 'border-[#E6E7EB] text-[#D1D5DB] cursor-not-allowed bg-white'
                : 'border-[#E6E7EB] text-[#17243A] hover:bg-[#FAF7F0] cursor-pointer'
            }`}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
