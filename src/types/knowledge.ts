export type KnowledgeCategory =
  | 'Products'
  | 'Orders'
  | 'Delivery'
  | 'FAQs & Policies'
  | 'Business'
  | 'General';

export type KnowledgeStatus = 'Indexed' | 'Processing' | 'Failed' | 'Pending';

export interface KnowledgeDocument {
  id: string;
  title: string;
  fileName: string;
  description: string;
  category: KnowledgeCategory;
  fileType: 'PDF' | 'DOCX' | 'TXT' | 'CSV';
  fileSize: string;
  fileSizeBytes: number;
  status: KnowledgeStatus;
  chunkCount: number;
  embeddingStatus: 'Complete' | 'Generating' | 'Failed' | 'Pending';
  vectorIndexStatus: 'Ready' | 'Indexing' | 'Pending';
  textExtractedStatus: 'Complete' | 'Extracting' | 'Pending';
  uploadedDate: string;
  lastUpdated: string;
  lastIndexed: string;
  contentPreview: string;
  fullContent: string;
  availableToAI: boolean;
  storageUrl?: string;
}

export interface KnowledgeStats {
  totalDocuments: number;
  totalCategories: number;
  knowledgeChunks: number;
  indexedDocuments: number;
  lastUpdated: string;
  isRagActive: boolean;
}

export interface KnowledgeCategoryCount {
  category: KnowledgeCategory;
  count: number;
}

export interface KnowledgeUsageStats {
  questionsAnswered: number;
  questionsChange: string;
  mostQueriedTopics: {
    rank: number;
    topic: string;
    percentage: number;
  }[];
}

export interface KnowledgeActivityItem {
  id: string;
  title: string;
  fileName: string;
  timestamp: string;
  type: 'indexed' | 'updated' | 'uploaded' | 'reindexed' | 'deleted';
}

export interface RagSettings {
  retrievalEnabled: boolean;
  maxResults: number;
  relevanceThreshold: number;
  useKnowledgeBaseFirst: boolean;
  fallbackToGeneralAI: boolean;
}
