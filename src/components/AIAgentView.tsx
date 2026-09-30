import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  PhoneCall,
  Settings,
  BookOpen,
  Wrench,
  ArrowRight,
  RefreshCw,
  Check,
} from 'lucide-react';
import { AIAgentConfig, AgentStats, AgentActivityItem } from '../types/agent';
import { AgentStatsCards } from './AgentStatsCards';
import { LiveAgentCard } from './LiveAgentCard';
import { AiActionsToolsCard } from './AiActionsToolsCard';
import { RecentActivityCard } from './RecentActivityCard';
import { VoiceAndLanguageSection } from './VoiceAndLanguageSection';
import { AgentGreetingSection } from './AgentGreetingSection';
import { QuickSettingsCard } from './QuickSettingsCard';
import { AgentPersonalityCard } from './AgentPersonalityCard';
import { TestCallModal } from './TestCallModal';

// Tabs
import { VoicePhoneTab } from './agent-tabs/VoicePhoneTab';
import { AgentInstructionsTab } from './agent-tabs/AgentInstructionsTab';
import { PersonalityGreetingTab } from './agent-tabs/PersonalityGreetingTab';
import { ToolsActionsTab } from './agent-tabs/ToolsActionsTab';
import { KnowledgeRagTab } from './agent-tabs/KnowledgeRagTab';
import { CallSettingsTab } from './agent-tabs/CallSettingsTab';
import { BusinessHoursTab } from './agent-tabs/BusinessHoursTab';
import { HumanHandoffTab } from './agent-tabs/HumanHandoffTab';

interface AIAgentViewProps {
  onNavigateTab?: (tabId: string) => void;
}

export const AIAgentView: React.FC<AIAgentViewProps> = ({ onNavigateTab }) => {
  // Active internal configuration tab
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'voice-phone'
    | 'instructions'
    | 'personality-greeting'
    | 'tools-actions'
    | 'knowledge-rag'
    | 'call-settings'
    | 'business-hours'
    | 'human-handoff'
  >('overview');

  // Test Call Modal state
  const [isTestCallOpen, setIsTestCallOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Agent configuration state
  const [config, setConfig] = useState<AIAgentConfig>({
    id: 'vapi-baked-by-doja',
    name: 'Doja Voice Sales Agent',
    status: 'Active',
    phoneNumber: '+234 1 888 3652',
    callerId: 'Baked by Doja',
    voice: 'Friendly Female (English)',
    language: 'English (US)',
    greeting: `Hi, welcome to Baked by Doja! 🍰 We’ve got delicious freshly baked treats ready for you. What can I help you find or order today?`,
    farewell: `Thank you for calling Baked by Doja! We're preparing your order with love. Have a wonderful day!`,
    instructions: `You are the AI Voice Sales Assistant for Baked by Doja.

Your job is to help customers discover products, answer questions, take orders and appointment orders, and assist with payments.

Any appointment order taken by the voice agent should be seen in the order section and also the customer information should appear.

## ACCURACY, SPELLING, NUMBERS & PRONUNCIATION RULES

### Customer Names
When collecting a customer's name, prioritize accuracy.
If the name is unclear, difficult to hear, unusual, or there is any uncertainty about the spelling, DO NOT guess.
Ask the customer to spell their name:
"Could you please spell your name for me so I can make sure I get it exactly right?"
Repeat the captured spelling back to the customer and ask for confirmation:
"Thank you. I have that as A-D-E-W-A-L-E. Is that correct?"
Only continue after the customer confirms.
Do not silently correct or assume the spelling of a customer's name.

### Phone Numbers
When collecting a phone number, repeat the number back slowly and ask the customer to confirm it.
If any digit is unclear, ask the customer to repeat that digit rather than guessing.

### Email Addresses
When collecting an email address, ask the customer to spell it out if there is any uncertainty.
Confirm the complete email address before saving it.
For example:
"Could you please spell the email address for me?"
Then:
"I have that as customer at gmail dot com. Is that correct?"
Never invent or assume an email address.

### Delivery Addresses
Delivery addresses must be captured accurately.
Ask the customer to provide the address clearly. If any part is unclear, ask them to repeat or spell it.
Pay particular attention to:
* House number
* Street name
* Estate or apartment name
* Area
* City
* State
* Landmark
* Postal code, when applicable
Repeat the important address details back to the customer before creating the order.
For example:
"Let me confirm your delivery address: number 15, Adeola Street, Ikeja, Lagos. Is that correct?"
Never guess an address.

### Prices & Currency (PRONOUNCE IN WORDS)
All Baked by Doja prices are in Nigerian Naira.
When speaking prices to customers, ALWAYS pronounce the price of the product entirely in words followed by the currency naira.
DO NOT use the "₦" symbol.
DO NOT use digits for prices (e.g. never write or say "10,000" or "9,600").
DO NOT read prices digit-by-digit or in a way that could sound ambiguous.
For example:
₦9,500 -> Say: "Nine thousand five hundred naira."
NOT: "Nine five zero zero."
NOT: "Nine five hundred."
NOT: "Nine dash five zero zero."

For:
₦10,000 -> Say: "Ten thousand naira."
₦15,000 -> Say: "Fifteen thousand naira."
₦3,500 -> Say: "Three thousand five hundred naira."
₦9,600 -> Say: "Nine thousand six hundred naira."
₦12,500 -> Say: "Twelve thousand five hundred naira."
₦14,000 -> Say: "Fourteen thousand naira."
₦13,000 -> Say: "Thirteen thousand naira."
₦19,200 -> Say: "Nineteen thousand two hundred naira."
₦21,700 -> Say: "Twenty-one thousand seven hundred naira."
₦23,500 -> Say: "Twenty-three thousand five hundred naira."

Always use the actual price returned by the product database. Always pronounce the price of the product in words. Never invent, estimate, round, or substitute a product price.

### Quantities
Speak quantities naturally and clearly.
For example:
Instead of: "2 Banana Bread" -> Say: "Two banana breads."
Instead of: "3 Chocolate Cakes" -> Say: "Three chocolate cakes."
Before creating an order, confirm the quantity of every product.

### Order Confirmation & Email Receipts
Before submitting an order, summarize the important details clearly:
* Customer name
* Phone number
* Email address (Always ask for their email address so the bakery can send their official order confirmation receipt with item list and total)
* Products & quantities
* Individual prices in words & grand total in words
* Delivery address

When the customer confirms:
1. The order is immediately registered in the bakery dashboard queue.
2. The customer's profile, contact details, and address are recorded into the customer CRM.
3. Resend triggers an official email confirmation containing the full itemized loaf list and total amount to the customer, and also dispatches an update to the bakery admin.

Example:
"Let me confirm your order. You'd like two banana breads at ten thousand naira each, for a total of twenty thousand naira. Your delivery address is 15 Adeola Street, Ikeja, Lagos. Is everything correct?"
Only create the order after the customer confirms.

### Numbers in Conversation
When speaking numbers aloud, prioritize natural human-readable pronunciation.
Do not unnecessarily read prices, quantities, addresses, or phone numbers as a continuous string of digits.
If a number is ambiguous, slow down and clarify it with the customer.

### Never Guess
If you cannot clearly hear or understand:
* A name
* Phone number
* Email
* Address
* Product
* Quantity
* Price
* Order reference
ASK THE CUSTOMER TO REPEAT OR SPELL IT.
Accuracy is more important than speed.

### Payment Amounts
When generating or discussing a payment amount, use the exact amount returned by the backend.
Always state the currency:
"Your total is twenty-five thousand naira."
Never claim that a payment has been received unless the backend or Paystack payment verification confirms that the transaction was successfully completed.

### Final Rule
The customer should never have to correct information that the agent could have clarified.
When uncertain, ASK.
Never guess.`,
    personality: {
      tone: 'Friendly',
      style: 'Balanced',
      traits: ['Friendly', 'Professional', 'Helpful'],
      description:
        'Your agent is friendly, professional and always ready to help. It speaks naturally, builds trust and makes the ordering process simple and enjoyable.',
    },
    settings: {
      autoHandling: true,
      orderConfirmation: true,
      paymentLinkGeneration: true,
      emailNotifications: true,
      callRecording: true,
      transcription: true,
      bargeIn: true,
      maxCallDuration: 10,
      silenceTimeout: 15,
      voiceSpeed: 0.88,
      responseDelay: 350,
      autoRetry: true,
    },
    tools: [
      {
        id: 'tool-check-product',
        name: 'checkProductAvailability',
        displayName: 'Check product availability',
        description:
          'Queries bakery inventory for item stock, fresh batch timings, and current prices.',
        endpoint: '/api/tools/products/check',
        permission: 'Catalogue Read',
        enabled: true,
        category: 'Products',
      },
      {
        id: 'tool-create-order',
        name: 'createOrder',
        displayName: 'Create new orders',
        description:
          'Creates a pending order after verbal confirmation of products and customer delivery details.',
        endpoint: '/api/tools/orders/create',
        permission: 'Order Management',
        enabled: true,
        category: 'Orders',
      },
      {
        id: 'tool-generate-payment-link',
        name: 'generatePaymentLink',
        displayName: 'Generate Paystack payment links',
        description:
          'Generates an authentic Paystack checkout link and transmits SMS/WhatsApp to customer.',
        endpoint: '/api/tools/payments/generate-link',
        permission: 'Payments',
        enabled: true,
        category: 'Payments',
      },
      {
        id: 'tool-check-payment',
        name: 'checkPaymentStatus',
        displayName: 'Check payment status',
        description:
          'Polls backend webhook records to verify real Paystack payment status before confirmation.',
        endpoint: '/api/tools/payments/status',
        permission: 'Payments',
        enabled: true,
        category: 'Payments',
      },
      {
        id: 'tool-send-email-confirm',
        name: 'sendEmailConfirmation',
        displayName: 'Send email confirmations',
        description:
          'Dispatches receipt and order summary email to customer inbox automatically.',
        endpoint: '/api/tools/notifications/send',
        permission: 'Notifications',
        enabled: true,
        category: 'Orders',
      },
      {
        id: 'tool-update-customer',
        name: 'updateCustomerInformation',
        displayName: 'Update customer information',
        description:
          'Saves updated address, delivery notes, and contact phone into customer directory.',
        endpoint: '/api/tools/customers/update',
        permission: 'Customer Management',
        enabled: true,
        category: 'Customers',
      },
    ],
    businessHours: [
      { day: 'Monday', isOpen: true, openTime: '09:00 AM', closeTime: '06:00 PM' },
      { day: 'Tuesday', isOpen: true, openTime: '09:00 AM', closeTime: '06:00 PM' },
      { day: 'Wednesday', isOpen: true, openTime: '09:00 AM', closeTime: '06:00 PM' },
      { day: 'Thursday', isOpen: true, openTime: '09:00 AM', closeTime: '06:00 PM' },
      { day: 'Friday', isOpen: true, openTime: '09:00 AM', closeTime: '06:00 PM' },
      { day: 'Saturday', isOpen: true, openTime: '10:00 AM', closeTime: '04:00 PM' },
      { day: 'Sunday', isOpen: false, openTime: 'Closed', closeTime: 'Closed' },
    ],
    alwaysAvailable: false,
    outsideHoursAction: 'ai',
    humanHandoff: {
      enabled: true,
      phoneNumber: '+234 800 225 3336',
      triggers: [
        'Customer requests a human',
        'AI cannot answer the request',
        'Payment problem',
        'Customer is upset',
        'Order issue',
      ],
      message:
        "I'll connect you with a member of our team who can help you with that right away.",
      maxWaitTime: 45,
    },
    createdAt: '2025-06-01T08:00:00.000Z',
    updatedAt: new Date().toISOString(),
  });

  // KPI Stats
  const [stats, setStats] = useState<AgentStats>({
    status: 'Active',
    statusDescription: 'Your AI agent is ready to take calls and handle orders.',
    totalCalls: 0,
    totalCallsChange: '0%',
    totalCallsTimeframe: 'vs. previous 7 days',
    ordersCreated: 0,
    ordersCreatedChange: '0%',
    ordersCreatedTimeframe: 'vs. previous 7 days',
    revenueGenerated: '₦0',
    revenueGeneratedRaw: 0,
    revenueGeneratedChange: '0%',
    revenueGeneratedTimeframe: 'vs. previous 7 days',
  });

  // Recent activity
  const [activity, setActivity] = useState<AgentActivityItem[]>([]);

  // Fetch agent config on mount
  useEffect(() => {
    fetch('/api/admin/ai-agent')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.config) {
          setConfig(data.config);
        }
      })
      .catch((err) => console.log('Using default agent config:', err));

    fetch('/api/admin/ai-agent/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setStats(data);
        }
      })
      .catch((err) => console.log('Using default agent stats:', err));

    fetch('/api/admin/ai-agent/activity')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.activities) {
          setActivity(data.activities);
        }
      })
      .catch((err) => console.log('Using default agent activity:', err));
  }, []);

  // Update Config Helper
  const handleUpdateConfig = async (updates: Partial<AIAgentConfig>) => {
    try {
      const res = await fetch('/api/admin/ai-agent', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data && data.config) {
        setConfig(data.config);
      } else {
        setConfig((prev) => ({ ...prev, ...updates }));
      }
    } catch (err) {
      console.error('Failed to update config:', err);
      setConfig((prev) => ({ ...prev, ...updates }));
    }
  };

  // Toggle Quick Setting
  const handleToggleSetting = async (
    key: keyof AIAgentConfig['settings'],
    value: boolean
  ) => {
    const updatedSettings = {
      ...config.settings,
      [key]: value,
    };
    setConfig((prev) => ({
      ...prev,
      settings: updatedSettings,
    }));

    try {
      await fetch('/api/admin/ai-agent/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      });
    } catch (err) {
      console.error('Failed to update setting:', err);
    }
  };

  // Voice & Language updates
  const handleVoiceChange = (voice: string) => {
    setConfig((prev) => ({ ...prev, voice }));
    fetch('/api/admin/ai-agent/voice', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voice }),
    }).catch(console.error);
  };

  const handleLanguageChange = (language: string) => {
    setConfig((prev) => ({ ...prev, language }));
    fetch('/api/admin/ai-agent/voice', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language }),
    }).catch(console.error);
  };

  // Greeting Save
  const handleSaveGreeting = async (newGreeting: string) => {
    setConfig((prev) => ({ ...prev, greeting: newGreeting }));
    await fetch('/api/admin/ai-agent/greeting', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ greeting: newGreeting }),
    });
  };

  // Personality Save
  const handleSavePersonality = async (
    newPersonality: AIAgentConfig['personality']
  ) => {
    setConfig((prev) => ({ ...prev, personality: newPersonality }));
    await fetch('/api/admin/ai-agent/personality', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPersonality),
    });
  };

  // Tools toggle
  const handleToggleTool = async (toolId: string, enabled: boolean) => {
    setConfig((prev) => ({
      ...prev,
      tools: prev.tools.map((t) => (t.id === toolId ? { ...t, enabled } : t)),
    }));

    try {
      await fetch('/api/admin/ai-agent/tools', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolId, enabled }),
      });
    } catch (err) {
      console.error('Failed to toggle tool:', err);
    }
  };

  const tabs: {
    id: typeof activeTab;
    label: string;
  }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'voice-phone', label: 'Voice & Phone' },
    { id: 'instructions', label: 'Agent Instructions' },
    { id: 'personality-greeting', label: 'Personality & Greeting' },
    { id: 'tools-actions', label: 'Tools & Actions' },
    { id: 'knowledge-rag', label: 'Knowledge / RAG' },
    { id: 'call-settings', label: 'Call Settings' },
    { id: 'business-hours', label: 'Business Hours' },
    { id: 'human-handoff', label: 'Human Handoff' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#17243A] tracking-tight">
          AI Agent
        </h1>
        <p className="text-xs text-[#6B7280] mt-1 font-medium">
          Configure your AI voice agent, set up its behaviour, tools and knowledge base.
        </p>
      </div>

      {/* 2. Horizontal Navigation Tabs */}
      <div className="border-b border-[#E6E7EB] -mt-1 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max pb-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#FAF7F0] text-[#17243A] border border-[#F9B91A] shadow-2xs'
                    : 'text-[#64748B] hover:text-[#17243A] hover:bg-black/5'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Top 4 KPI Metric Cards (Always visible across agent views or in Overview) */}
      <AgentStatsCards stats={stats} />

      {/* 4. Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Left Column (8 cols / ~66%) */}
          <div className="lg:col-span-8 space-y-5">
            {/* Agent Configuration Section Title */}
            <div>
              <h2 className="text-base font-bold text-[#17243A]">
                Agent Configuration
              </h2>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Set up how your AI agent communicates and handles customer requests.
              </p>
            </div>

            {/* Sub-card 1: Voice & Language */}
            <VoiceAndLanguageSection
              voice={config.voice}
              language={config.language}
              onVoiceChange={handleVoiceChange}
              onLanguageChange={handleLanguageChange}
            />

            {/* Sub-card 2: Agent Greeting */}
            <AgentGreetingSection
              greeting={config.greeting}
              onSaveGreeting={handleSaveGreeting}
            />

            {/* Sub-row 3: Quick Settings & Agent Personality (2 cols) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <QuickSettingsCard
                settings={config.settings}
                onToggleSetting={handleToggleSetting}
              />

              <AgentPersonalityCard
                personality={config.personality}
                onSavePersonality={handleSavePersonality}
              />
            </div>

            {/* Sub-row 4: Knowledge Base & Test Your Agent (2 cols) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Knowledge Base Card */}
              <div className="bg-white rounded-2xl p-5 border border-[#E6E7EB] shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center mb-3">
                    <BookOpen className="w-5 h-5 stroke-[2]" />
                  </div>
                  <h4 className="text-sm font-bold text-[#17243A]">
                    Knowledge Base
                  </h4>
                  <p className="text-xs text-[#6B7280] mt-1.5 leading-relaxed">
                    Manage the information and documents your agent uses to provide accurate answers.
                  </p>
                </div>

                <div className="mt-4 pt-2">
                  <button
                    onClick={() => {
                      if (onNavigateTab) {
                        onNavigateTab('knowledge');
                      } else {
                        setActiveTab('knowledge-rag');
                      }
                    }}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white hover:bg-[#FAF7F0] border border-[#E6E7EB] text-xs font-bold text-[#17243A] flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <span>Manage Knowledge Base</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>

              {/* Test Your Agent Card */}
              <div className="bg-white rounded-2xl p-5 border border-[#E6E7EB] shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center mb-3">
                    <Wrench className="w-5 h-5 stroke-[2]" />
                  </div>
                  <h4 className="text-sm font-bold text-[#17243A]">
                    Test Your Agent
                  </h4>
                  <p className="text-xs text-[#6B7280] mt-1.5 leading-relaxed">
                    Try a sample call to see how your AI agent responds and handles customer requests.
                  </p>
                </div>

                <div className="mt-4 pt-2">
                  <button
                    onClick={() => setIsTestCallOpen(true)}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white hover:bg-[#FAF7F0] border border-[#E6E7EB] text-xs font-bold text-[#17243A] flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <span>Start Test Call</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (4 cols / ~34%) */}
          <div className="lg:col-span-4 space-y-5">
            {/* Top: Live Agent Card */}
            <LiveAgentCard
              status={config.status}
              onTestCall={() => setIsTestCallOpen(true)}
              isLoading={isLoading}
            />

            {/* Middle: AI Actions & Tools Card */}
            <AiActionsToolsCard
              tools={config.tools}
              onManageTools={() => setActiveTab('tools-actions')}
            />

            {/* Bottom: Recent Activity Card */}
            <RecentActivityCard
              activities={activity}
              onViewAll={() => {
                if (onNavigateTab) onNavigateTab('calls');
              }}
            />
          </div>
        </div>
      )}

      {/* Voice & Phone Tab */}
      {activeTab === 'voice-phone' && (
        <VoicePhoneTab
          config={config}
          onUpdateConfig={handleUpdateConfig}
          onTestCall={() => setIsTestCallOpen(true)}
        />
      )}

      {/* Agent Instructions Tab */}
      {activeTab === 'instructions' && (
        <AgentInstructionsTab
          config={config}
          onSaveInstructions={async (instructions) => {
            setConfig((prev) => ({ ...prev, instructions }));
            await fetch('/api/admin/ai-agent/instructions', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ instructions }),
            });
          }}
        />
      )}

      {/* Personality & Greeting Tab */}
      {activeTab === 'personality-greeting' && (
        <PersonalityGreetingTab
          config={config}
          onUpdatePersonality={async (personality) => {
            setConfig((prev) => ({ ...prev, personality }));
            await fetch('/api/admin/ai-agent/personality', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(personality),
            });
          }}
          onUpdateGreetingFarewell={async (greeting, farewell) => {
            setConfig((prev) => ({ ...prev, greeting, farewell }));
            await fetch('/api/admin/ai-agent/greeting', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ greeting, farewell }),
            });
          }}
        />
      )}

      {/* Tools & Actions Tab */}
      {activeTab === 'tools-actions' && (
        <ToolsActionsTab tools={config.tools} onToggleTool={handleToggleTool} />
      )}

      {/* Knowledge / RAG Tab */}
      {activeTab === 'knowledge-rag' && (
        <KnowledgeRagTab
          onNavigateKnowledgeBase={() => {
            if (onNavigateTab) onNavigateTab('knowledge');
          }}
        />
      )}

      {/* Call Settings Tab */}
      {activeTab === 'call-settings' && (
        <CallSettingsTab
          config={config}
          onUpdateSettings={async (newSettings) => {
            setConfig((prev) => ({ ...prev, settings: newSettings }));
            await fetch('/api/admin/ai-agent/settings', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newSettings),
            });
          }}
        />
      )}

      {/* Business Hours Tab */}
      {activeTab === 'business-hours' && (
        <BusinessHoursTab
          config={config}
          onUpdateBusinessHours={async (hours, alwaysAvailable, outsideAction) => {
            setConfig((prev) => ({
              ...prev,
              businessHours: hours,
              alwaysAvailable,
              outsideHoursAction: outsideAction,
            }));
            await fetch('/api/admin/ai-agent/business-hours', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                businessHours: hours,
                alwaysAvailable,
                outsideHoursAction: outsideAction,
              }),
            });
          }}
        />
      )}

      {/* Human Handoff Tab */}
      {activeTab === 'human-handoff' && (
        <HumanHandoffTab
          config={config}
          onUpdateHandoff={async (handoff) => {
            setConfig((prev) => ({ ...prev, humanHandoff: handoff }));
            await fetch('/api/admin/ai-agent/handoff', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(handoff),
            });
          }}
        />
      )}

      {/* Interactive Voice Test Call Simulation Modal */}
      <TestCallModal
        isOpen={isTestCallOpen}
        onClose={() => setIsTestCallOpen(false)}
        config={config}
      />
    </div>
  );
};
