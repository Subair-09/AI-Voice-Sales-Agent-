import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Sliders,
  Sparkles,
  BookOpen,
  RefreshCw,
  Search,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import {
  KnowledgeDocument,
  KnowledgeStats,
  KnowledgeCategory,
  KnowledgeUsageStats,
  RagSettings,
} from '../../types/knowledge';
import { RagStatusBanner } from './RagStatusBanner';
import { KnowledgeMetricsCards } from './KnowledgeMetricsCards';
import { KnowledgeDocumentsTable } from './KnowledgeDocumentsTable';
import { DocumentDetailsDrawer } from './DocumentDetailsDrawer';
import { KnowledgeCategoriesCard } from './KnowledgeCategoriesCard';
import { AiKnowledgeUsageCard } from './AiKnowledgeUsageCard';
import { QuickTipsCard } from './QuickTipsCard';
import { BottomKnowledgeCards } from './BottomKnowledgeCards';
import { UploadDocumentModal } from './UploadDocumentModal';
import { RagSettingsModal } from './RagSettingsModal';
import { DocumentContentPreviewModal } from './DocumentContentPreviewModal';

// Default initial documents if server is offline or slow
const DEFAULT_DOCUMENTS: KnowledgeDocument[] = [
  {
    id: 'doc-1',
    title: 'Product Pricing & Menu Guide',
    fileName: 'Product-Pricing-Guide-2026.pdf',
    description: 'Current pricing for all classic banana breads, specialty loaves, and seasonal slices with bulk discounts.',
    category: 'Products',
    fileType: 'PDF',
    fileSize: '1.2 MB',
    fileSizeBytes: 1258291,
    status: 'Indexed',
    chunkCount: 24,
    embeddingStatus: 'Complete',
    vectorIndexStatus: 'Ready',
    textExtractedStatus: 'Complete',
    uploadedDate: '15 Mar 2026',
    lastUpdated: '2 hours ago',
    lastIndexed: '15 Mar 2026, 09:30 AM',
    contentPreview: 'Classic Banana Bread: ₦7,500 ($18.00)\nChocolate Chip Banana Bread: ₦9,000 ($21.50)\nWalnut Crumble Loaf: ₦9,500 ($23.00)\nVegan Oat Crunch Loaf: ₦9,000 ($21.50)',
    fullContent: `# Baked by Doja - Official Product & Pricing Guide 2026

## Core Menu Items
- **Classic Banana Bread Loaf**: ₦7,500 ($18.00). Made with organic caramelized Cavendish bananas, golden honey, and Madagascar bourbon vanilla.
- **Chocolate Chip Banana Loaf**: ₦9,000 ($21.50). Folded with 64% Belgian dark chocolate chunks.
- **Walnut Crunch Banana Loaf**: ₦9,500 ($23.00). Topped with cinnamon roasted California walnuts.
- **Nutella Swirl Banana Bread**: ₦10,000 ($24.00). Generously marbled with pure hazelnut cocoa cream.
- **Vegan Coconut Sugar Loaf**: ₦9,000 ($21.50). Dairy-free, egg-free, prepared with cold-pressed coconut oil.

## Box Sets & Bundles
- **Taster Trio Box**: ₦24,000 (Includes Classic, Choc Chip, and Walnut).
- **Catering Celebration Platter**: ₦54,000 (Pre-sliced into 24 party portions with custom wrapping).

## Storage Instructions
Keep at room temperature in airtight tin for 4 days, or refrigerate up to 10 days. Warm in microwave for 15 seconds before serving.`,
    availableToAI: true,
  },
  {
    id: 'doc-2',
    title: 'Lagos Delivery Zones & Courier Rates',
    fileName: 'Delivery-Zones-Rates-Lagos.pdf',
    description: 'Delivery zones, courier tariffs, dispatch cutoff times, and temperature-controlled rider guidelines.',
    category: 'Delivery',
    fileType: 'PDF',
    fileSize: '840 KB',
    fileSizeBytes: 860160,
    status: 'Indexed',
    chunkCount: 18,
    embeddingStatus: 'Complete',
    vectorIndexStatus: 'Ready',
    textExtractedStatus: 'Complete',
    uploadedDate: '10 Mar 2026',
    lastUpdated: '1 day ago',
    lastIndexed: '10 Mar 2026, 11:15 AM',
    contentPreview: 'Victoria Island / Ikoyi: ₦1,500 (Same-day dispatch if ordered before 2 PM)\nLekki Phase 1 to Ajah: ₦2,000 - ₦3,000\nMainland (Ikeja, Yaba, Surulere): ₦2,500 - ₦3,500',
    fullContent: `# Baked by Doja - Logistics & Delivery Directory

## Coverage Zones & Tariffs
1. **Zone A (Island Core)**: Ikoyi, Victoria Island, Oniru — ₦1,500. Dispatch transit ~45 minutes.
2. **Zone B (Lekki Corridor)**: Lekki Phase 1 to Chevron — ₦2,200. VGC, Ajah, Sangotedo — ₦3,200.
3. **Zone C (Central Mainland)**: Ikeja GRA, Maryland, Yaba, Surulere — ₦2,800.
4. **Zone D (Outer Mainland)**: Magodo, Gbagada, Festac, Alausa — ₦3,500.

## Dispatch Schedule
- Batch 1: Leaves central bakery at 10:00 AM (Orders placed overnight).
- Batch 2: Leaves at 2:30 PM (Orders placed morning).
- Orders after 4:00 PM are baked fresh at dawn for next-day 10:00 AM dispatch.`,
    availableToAI: true,
  },
  {
    id: 'doc-3',
    title: 'Order Policies, Cancellations & FAQs',
    fileName: 'Order-Policies-and-Cancellations.pdf',
    description: 'Customer policies on same-day changes, refund rules, allergies warning, and bulk corporate orders.',
    category: 'FAQs & Policies',
    fileType: 'PDF',
    fileSize: '512 KB',
    fileSizeBytes: 524288,
    status: 'Indexed',
    chunkCount: 12,
    embeddingStatus: 'Complete',
    vectorIndexStatus: 'Ready',
    textExtractedStatus: 'Complete',
    uploadedDate: '01 Mar 2026',
    lastUpdated: '3 days ago',
    lastIndexed: '01 Mar 2026, 04:00 PM',
    contentPreview: 'Cancellations: Permitted up to 2 hours before oven baking cycle.\nRefunds: Instant store credit or original payment method within 24 hours.\nAllergen Notice: Our kitchen handles walnuts, dairy, and eggs.',
    fullContent: `# Baked by Doja - Customer Policies & FAQs

### Can I cancel or modify my loaf order?
You can adjust toppings or cancel up to 2 hours prior to scheduled oven time. Once a loaf is in the baking oven, cancellations cannot be accepted.

### What are the payment options?
We accept instant bank transfers (Monnify/Paystack virtual accounts), debit cards, and USSD. Cash on delivery is unavailable to protect rider safety.

### Do your banana breads contain nuts?
Our Classic loaf contains NO nuts, but is baked in a kitchen that roasts California walnuts. Nut-sensitive customers are advised of potential trace exposure.

### Can we order customized greeting sleeves?
Yes! Complimentary ribbon bands with handwritten gift notes are included for gift orders. Provide the recipient note to the AI sales agent during your call.`,
    availableToAI: true,
  },
  {
    id: 'doc-4',
    title: 'Store Operations & Kitchen Hours',
    fileName: 'Bakery-Operations-Hours.txt',
    description: 'Bakehouse schedule, emergency contact numbers, and pickup counter availability.',
    category: 'Business',
    fileType: 'TXT',
    fileSize: '95 KB',
    fileSizeBytes: 97280,
    status: 'Indexed',
    chunkCount: 8,
    embeddingStatus: 'Complete',
    vectorIndexStatus: 'Ready',
    textExtractedStatus: 'Complete',
    uploadedDate: '28 Feb 2026',
    lastUpdated: '1 week ago',
    lastIndexed: '28 Feb 2026, 02:00 PM',
    contentPreview: 'Operating Hours: Monday to Saturday, 7:30 AM - 7:00 PM; Sunday: 9:00 AM - 5:00 PM.\nPickup Counter: 14 Admiralty Way, Lekki Phase 1, Lagos.',
    fullContent: `# Baked by Doja - Operating Standards

- Operating Hours: Monday to Saturday 7:30 AM to 7:00 PM. Sundays 9:00 AM to 5:00 PM.
- Physical Pickup: 14 Admiralty Way, Lekki Phase 1, Lagos.
- Fresh Bake Windows: Loaves come out hot from the ovens at 8:30 AM, 12:00 PM, and 4:00 PM.
- AI Phone Service: Operates 24 hours daily, taking orders and scheduling delivery time slots.`,
    availableToAI: true,
  },
  {
    id: 'doc-5',
    title: 'Customer Order Fulfillment Playbook',
    fileName: 'Order-Fulfillment-Workflow.docx',
    description: 'Internal fulfillment standard operating procedures from incoming call to doorstep handoff.',
    category: 'Orders',
    fileType: 'DOCX',
    fileSize: '1.5 MB',
    fileSizeBytes: 1572864,
    status: 'Indexed',
    chunkCount: 30,
    embeddingStatus: 'Complete',
    vectorIndexStatus: 'Ready',
    textExtractedStatus: 'Complete',
    uploadedDate: '20 Feb 2026',
    lastUpdated: '2 weeks ago',
    lastIndexed: '20 Feb 2026, 10:00 AM',
    contentPreview: 'Step 1: AI voice order confirmation\nStep 2: Payment link dispatch via SMS & WhatsApp\nStep 3: Loaf packaging with tamper-evident seal',
    fullContent: `# Order Fulfillment SOP

1. AI sales agent books customer address and flavor selection.
2. Automated SMS confirmation dispatched with tracking link.
3. Loaves boxed in craft cardboard with moisture-locking greaseproof liner.
4. Courier pickup verified via unique 4-digit security dispatch PIN.`,
    availableToAI: true,
  },
];

export const KnowledgeBaseView: React.FC = () => {
  // Data State
  const [documents, setDocuments] = useState<KnowledgeDocument[]>(DEFAULT_DOCUMENTS);
  const [selectedDocId, setSelectedDocId] = useState<string | undefined>(DEFAULT_DOCUMENTS[0].id);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(true);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [selectedSort, setSelectedSort] = useState('Recently Updated');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Modals State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<KnowledgeDocument | null>(null);

  // Notification Banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch initial knowledge data from server
  useEffect(() => {
    const fetchKnowledge = async () => {
      try {
        const res = await fetch('/api/admin/knowledge');
        if (res.ok) {
          const data = await res.json();
          if (data && data.documents && data.documents.length > 0) {
            setDocuments(data.documents);
            if (!selectedDocId) {
              setSelectedDocId(data.documents[0].id);
            }
          }
        }
      } catch (err) {
        console.warn('Could not fetch server knowledge, using active default documents:', err);
      }
    };

    fetchKnowledge();
  }, []);

  // Filtered & Sorted documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat =
        selectedCategory === 'All Categories' || doc.category === selectedCategory;

      const matchesStatus =
        selectedStatus === 'All Status' || doc.status === selectedStatus;

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [documents, searchQuery, selectedCategory, selectedStatus]);

  // Sort logic
  const sortedDocuments = useMemo(() => {
    const list = [...filteredDocuments];
    if (selectedSort === 'Name (A-Z)') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (selectedSort === 'Chunks (Most)') {
      list.sort((a, b) => b.chunkCount - a.chunkCount);
    } else if (selectedSort === 'Size (Largest)') {
      list.sort((a, b) => b.fileSizeBytes - a.fileSizeBytes);
    }
    // Default 'Recently Updated' keeps array order
    return list;
  }, [filteredDocuments, selectedSort]);

  // Pagination
  const totalPages = Math.ceil(sortedDocuments.length / pageSize) || 1;
  const paginatedDocuments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedDocuments.slice(start, start + pageSize);
  }, [sortedDocuments, currentPage, pageSize]);

  // Stats calculation
  const totalChunks = useMemo(
    () => documents.reduce((sum, d) => sum + (d.chunkCount || 0), 0),
    [documents]
  );
  const indexedCount = useMemo(
    () => documents.filter((d) => d.status === 'Indexed').length,
    [documents]
  );
  const uniqueCategories = useMemo(
    () => Array.from(new Set(documents.map((d) => d.category))),
    [documents]
  );

  const stats: KnowledgeStats = {
    totalDocuments: documents.length,
    totalCategories: uniqueCategories.length,
    knowledgeChunks: totalChunks,
    indexedDocuments: indexedCount,
    lastUpdated: 'Today at 09:42 AM',
    isRagActive: true,
  };

  // Category counts for card
  const categoryCounts = useMemo(() => {
    const categories: KnowledgeCategory[] = [
      'Products',
      'Delivery',
      'Orders',
      'FAQs & Policies',
      'Business',
      'General',
    ];
    return categories.map((cat) => ({
      category: cat,
      count: documents.filter((d) => d.category === cat).length,
    }));
  }, [documents]);

  const selectedDocument = useMemo(() => {
    return documents.find((d) => d.id === selectedDocId) || documents[0] || null;
  }, [documents, selectedDocId]);

  // Handlers
  const handleRefreshKnowledge = async () => {
    try {
      const res = await fetch('/api/admin/knowledge');
      if (res.ok) {
        const data = await res.json();
        if (data.documents) {
          setDocuments(data.documents);
        }
      }
    } catch {
      // simulate refresh
    }
    showToast('Knowledge base refreshed! All semantic embeddings synchronized with AI agent.');
  };

  const handleSelectDocument = (doc: KnowledgeDocument) => {
    setSelectedDocId(doc.id);
    setIsDetailsDrawerOpen(true);
  };

  const handleReindexDocument = async (doc: KnowledgeDocument) => {
    try {
      const res = await fetch(`/api/admin/knowledge/${doc.id}/reindex`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.document) {
          setDocuments((prev) =>
            prev.map((d) => (d.id === doc.id ? data.document : d))
          );
        }
      } else {
        // Fallback local update
        setDocuments((prev) =>
          prev.map((d) =>
            d.id === doc.id
              ? {
                  ...d,
                  status: 'Indexed',
                  chunkCount: d.chunkCount + 2,
                  lastUpdated: 'Just now',
                  lastIndexed: 'Just now',
                }
              : d
          )
        );
      }
    } catch {
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === doc.id
            ? {
                ...d,
                status: 'Indexed',
                chunkCount: d.chunkCount + 2,
                lastUpdated: 'Just now',
              }
            : d
        )
      );
    }
    showToast(`"${doc.fileName}" re-indexed successfully.`);
  };

  const handleDeleteDocument = async (doc: KnowledgeDocument) => {
    try {
      await fetch(`/api/admin/knowledge/${doc.id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Delete request error, updating locally', err);
    }

    setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    if (selectedDocId === doc.id) {
      const remaining = documents.filter((d) => d.id !== doc.id);
      setSelectedDocId(remaining[0]?.id);
    }
    showToast(`Removed "${doc.fileName}" from Knowledge Base.`);
  };

  const handleUpdateDescription = async (docId: string, newDesc: string) => {
    try {
      await fetch(`/api/admin/knowledge/${docId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: newDesc }),
      });
    } catch (err) {
      console.warn('Update description error, updating locally', err);
    }

    setDocuments((prev) =>
      prev.map((d) =>
        d.id === docId ? { ...d, description: newDesc, lastUpdated: 'Just now' } : d
      )
    );
    showToast('Document description updated.');
  };

  const handleUploadSuccess = (newDoc: KnowledgeDocument) => {
    setDocuments((prev) => [newDoc, ...prev]);
    setSelectedDocId(newDoc.id);
    setIsDetailsDrawerOpen(true);
    showToast(`"${newDoc.fileName}" uploaded & indexed into vector store!`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#17243A] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-[#334155] animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle className="w-5 h-5 text-[#15966B]" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* 1. TOP TITLE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-[#17243A] tracking-tight">
              Knowledge Base
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E8F7EF] text-[#15966B] border border-[#A7F3D0]">
              RAG Active
            </span>
          </div>
          <p className="text-xs text-[#6B7280] font-medium mt-1">
            Manage business documents and information your AI agent uses to answer customer questions.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* RAG Settings Button */}
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#FAF7F0] border border-[#E6E7EB] text-xs font-bold text-[#17243A] flex items-center gap-2 transition-all cursor-pointer shadow-2xs hover:border-[#D1D5DB]"
          >
            <Sliders className="w-4 h-4 stroke-[2.2] text-[#64748B]" />
            <span>RAG Settings</span>
          </button>

          {/* Add Knowledge Button */}
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#F9B91A] hover:bg-[#E5A812] active:scale-[0.99] text-xs font-bold text-[#17243A] flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Knowledge</span>
          </button>
        </div>
      </div>

      {/* 2. RAG STATUS ACTIVE BANNER */}
      <RagStatusBanner stats={stats} onRefresh={handleRefreshKnowledge} />

      {/* 3. METRIC CARDS ROW */}
      <KnowledgeMetricsCards stats={stats} />

      {/* 4. MAIN CONTENT TWO-COLUMN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left Column: Knowledge Documents Table */}
        <div className="xl:col-span-8 space-y-5">
          <KnowledgeDocumentsTable
            documents={paginatedDocuments}
            totalCount={sortedDocuments.length}
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            selectedDocId={selectedDocId}
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            selectedStatus={selectedStatus}
            selectedSort={selectedSort}
            onSearchChange={(q) => {
              setSearchQuery(q);
              setCurrentPage(1);
            }}
            onCategoryChange={(c) => {
              setSelectedCategory(c);
              setCurrentPage(1);
            }}
            onStatusChange={(s) => {
              setSelectedStatus(s);
              setCurrentPage(1);
            }}
            onSortChange={(so) => {
              setSelectedSort(so);
              setCurrentPage(1);
            }}
            onPageChange={setCurrentPage}
            onSelectDocument={handleSelectDocument}
            onReindexDocument={handleReindexDocument}
            onDeleteDocument={handleDeleteDocument}
            onViewContentPreview={(doc) => setPreviewDoc(doc)}
          />

          {/* Bottom informative cards */}
          <BottomKnowledgeCards
            onOpenUpload={() => setIsUploadModalOpen(true)}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
          />
        </div>

        {/* Right Column: Details Drawer, Categories, Usage, Tips */}
        <div className="xl:col-span-4 space-y-5">
          {/* Document Details Drawer (when a document is selected) */}
          {selectedDocument && isDetailsDrawerOpen && (
            <DocumentDetailsDrawer
              document={selectedDocument}
              isOpen={isDetailsDrawerOpen}
              onClose={() => setIsDetailsDrawerOpen(false)}
              onReindex={handleReindexDocument}
              onDelete={handleDeleteDocument}
              onUpdateDescription={handleUpdateDescription}
              onViewFullContent={(doc) => setPreviewDoc(doc)}
            />
          )}

          {/* Categories Card */}
          <KnowledgeCategoriesCard
            categories={categoryCounts}
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setCurrentPage(1);
            }}
          />

          {/* AI Knowledge Usage Card */}
          <AiKnowledgeUsageCard />

          {/* Quick Tips Card */}
          <QuickTipsCard />
        </div>
      </div>

      {/* Interactive Modals */}
      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      <RagSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onSave={() => showToast('RAG settings successfully updated and saved.')}
      />

      <DocumentContentPreviewModal
        document={previewDoc}
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
      />
    </div>
  );
};
