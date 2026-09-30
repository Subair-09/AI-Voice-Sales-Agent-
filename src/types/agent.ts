export interface AIAgentConfig {
  id: string;
  name: string;
  status: 'Active' | 'Updating' | 'Offline' | 'Error';
  phoneNumber: string;
  callerId: string;
  voice: string;
  language: string;
  greeting: string;
  farewell: string;
  instructions: string;

  personality: {
    tone: 'Friendly' | 'Professional' | 'Warm' | 'Casual';
    style: 'Concise' | 'Balanced' | 'Detailed';
    traits: string[];
    description: string;
  };

  settings: {
    autoHandling: boolean;
    orderConfirmation: boolean;
    paymentLinkGeneration: boolean;
    emailNotifications: boolean;
    callRecording: boolean;
    transcription: boolean;
    bargeIn: boolean;
    maxCallDuration: number; // in minutes
    silenceTimeout: number; // in seconds
    voiceSpeed: number; // 0.8 - 1.2
    responseDelay: number; // in milliseconds
    autoRetry: boolean;
  };

  tools: AgentTool[];

  businessHours: BusinessHoursItem[];
  alwaysAvailable: boolean;
  outsideHoursAction: 'ai' | 'human' | 'closed_message';

  humanHandoff: {
    enabled: boolean;
    phoneNumber: string;
    triggers: string[];
    message: string;
    maxWaitTime: number; // in seconds
  };

  createdAt: string;
  updatedAt: string;
}

export interface AgentTool {
  id: string;
  name: string;
  displayName: string;
  description: string;
  endpoint: string;
  permission: string;
  enabled: boolean;
  category: 'Orders' | 'Payments' | 'Customers' | 'Products' | 'System';
}

export interface AgentActivityItem {
  id: string;
  type: 'order_created' | 'payment_sent' | 'customer_enquiry' | 'order_completed' | 'handoff' | 'call_failed';
  title: string;
  phoneNumber: string;
  time: string;
  date?: string;
  details?: string;
  iconBg: string;
  iconColor: string;
}

export interface AgentStats {
  status: 'Active' | 'Updating' | 'Offline' | 'Error';
  statusDescription: string;
  totalCalls: number;
  totalCallsChange: string;
  totalCallsTimeframe: string;
  ordersCreated: number;
  ordersCreatedChange: string;
  ordersCreatedTimeframe: string;
  revenueGenerated: string;
  revenueGeneratedRaw: number;
  revenueGeneratedChange: string;
  revenueGeneratedTimeframe: string;
}

export interface BusinessHoursItem {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface TestCallMessage {
  id: string;
  sender: 'ai' | 'user' | 'system' | 'tool';
  text: string;
  timestamp: string;
  toolCall?: {
    toolName: string;
    input: any;
    output: any;
  };
}
