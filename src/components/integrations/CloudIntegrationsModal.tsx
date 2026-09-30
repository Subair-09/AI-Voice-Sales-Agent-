import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  Cloud,
  Mail,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Upload,
  Send,
  ExternalLink,
  Layers,
  Sparkles,
  Server,
  FileCheck,
  Check,
  Phone,
  PhoneCall,
  Bot,
  Radio,
  Copy,
  Key,
} from 'lucide-react';
import { EmailTemplatePreviewModal } from '../EmailTemplatePreviewModal';

interface IntegrationStatus {
  mongodb: {
    connected: boolean;
    uriConfigured: boolean;
    dbName: string;
    counts: {
      orders: number;
      products: number;
      customers: number;
      knowledge: number;
      calls: number;
    };
    error?: string;
  };
  cloudinary: {
    configured: boolean;
    cloudName?: string;
    apiKeyProvided: boolean;
    mode: string;
  };
  resend: {
    configured: boolean;
    fromEmail: string;
    mode: string;
  };
  vapi?: {
    isConfigured: boolean;
    apiKeyProvided: boolean;
    publicKey: string;
    assistantId: string;
    phoneNumberId: string;
    webhookUrl: string;
  };
}

interface CloudIntegrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudIntegrationsModal: React.FC<CloudIntegrationsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [status, setStatus] = useState<IntegrationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'vapi' | 'mongodb' | 'cloudinary' | 'resend' | 'guide'>('overview');

  // Action States
  const [isSyncingMongo, setIsSyncingMongo] = useState(false);
  const [mongoSyncResult, setMongoSyncResult] = useState<string | null>(null);

  // Cloudinary Upload State
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [cloudinaryUploadInfo, setCloudinaryUploadInfo] = useState<any>(null);

  // Resend Test State
  const [testEmailRecipient, setTestEmailRecipient] = useState('nuddywale@gmail.com');
  const [testEmailType, setTestEmailType] = useState<'order' | 'receipt' | 'message'>('order');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSendResult, setEmailSendResult] = useState<{ success: boolean; id?: string; simulated?: boolean; message?: string } | null>(null);
  const [isEmailPreviewModalOpen, setIsEmailPreviewModalOpen] = useState(false);

  // Vapi Test States
  const [vapiPhoneInput, setVapiPhoneInput] = useState('');
  const [vapiNameInput, setVapiNameInput] = useState('');
  const [isCallingVapi, setIsCallingVapi] = useState(false);
  const [vapiCallResult, setVapiCallResult] = useState<{ success: boolean; callId?: string; simulated?: boolean; message: string } | null>(null);
  const [isSyncingVapi, setIsSyncingVapi] = useState(false);
  const [vapiSyncResult, setVapiSyncResult] = useState<string | null>(null);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  // Vapi Credentials Edit State
  const [vapiApiKey, setVapiApiKey] = useState('');
  const [vapiPublicKey, setVapiPublicKey] = useState('');
  const [vapiAssistantId, setVapiAssistantId] = useState('');
  const [isSavingVapiConfig, setIsSavingVapiConfig] = useState(false);
  const [vapiConfigSavedMsg, setVapiConfigSavedMsg] = useState<string | null>(null);

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/integrations/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
        if (data.vapi) {
          setVapiPublicKey(data.vapi.publicKey || '');
          setVapiAssistantId(data.vapi.assistantId || '');
        }
      }
    } catch (err) {
      console.warn('Failed to fetch integrations status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Sync All to Mongo
  const handleSyncMongo = async () => {
    setIsSyncingMongo(true);
    setMongoSyncResult(null);
    try {
      const res = await fetch('/api/integrations/mongodb/sync-all', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setMongoSyncResult(`Synced ${data.synced.orders} orders, ${data.synced.products} products, ${data.synced.customers} customers & ${data.synced.knowledge} knowledge docs!`);
        fetchStatus();
      } else {
        setMongoSyncResult(`Sync notice: ${data.error || 'Check MongoDB connection'}`);
      }
    } catch (err: any) {
      setMongoSyncResult(`Sync error: ${err.message}`);
    } finally {
      setIsSyncingMongo(false);
    }
  };

  // Handle Cloudinary Image File Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      setIsUploadingImage(true);
      setCloudinaryUploadInfo(null);
      try {
        const res = await fetch('/api/integrations/cloudinary/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64Data,
            folder: 'baked-by-doja/test-uploads',
          }),
        });
        const data = await res.json();
        if (data.success) {
          setUploadedImageUrl(data.url);
          setCloudinaryUploadInfo(data);
        }
      } catch (err) {
        console.error('Upload test error:', err);
      } finally {
        setIsUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Resend Test Email
  const handleSendTestEmail = async () => {
    if (!testEmailRecipient) return;
    setIsSendingEmail(true);
    setEmailSendResult(null);

    try {
      const res = await fetch('/api/integrations/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: testEmailRecipient,
          type: testEmailType,
        }),
      });
      const data = await res.json();
      setEmailSendResult(data);
    } catch (err: any) {
      setEmailSendResult({ success: false, message: err.message });
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Handle Vapi Sync
  const handleSyncVapi = async () => {
    setIsSyncingVapi(true);
    setVapiSyncResult(null);
    try {
      const res = await fetch('/api/vapi/assistant/sync', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setVapiSyncResult(`Synced assistant to Vapi! (ID: ${data.assistantId || 'Active'})`);
        fetchStatus();
      } else {
        setVapiSyncResult(`Sync notice: ${data.message || 'Check Vapi credentials'}`);
      }
    } catch (err: any) {
      setVapiSyncResult(`Error: ${err.message}`);
    } finally {
      setIsSyncingVapi(false);
    }
  };

  // Handle Vapi Outbound Test Call
  const handleDispatchVapiCall = async () => {
    if (!vapiPhoneInput) return;
    setIsCallingVapi(true);
    setVapiCallResult(null);
    try {
      const res = await fetch('/api/vapi/call/phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerPhoneNumber: vapiPhoneInput,
          customerName: vapiNameInput,
          purpose: 'Order follow-up & artisanal banana bread sampling',
        }),
      });
      const data = await res.json();
      setVapiCallResult(data);
    } catch (err: any) {
      setVapiCallResult({ success: false, message: err.message });
    } finally {
      setIsCallingVapi(false);
    }
  };

  // Handle Save Vapi Config
  const handleSaveVapiConfig = async () => {
    setIsSavingVapiConfig(true);
    setVapiConfigSavedMsg(null);
    try {
      const res = await fetch('/api/vapi/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: vapiApiKey,
          publicKey: vapiPublicKey,
          assistantId: vapiAssistantId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setVapiConfigSavedMsg('Credentials updated successfully!');
        fetchStatus();
      }
    } catch (err: any) {
      setVapiConfigSavedMsg(`Error: ${err.message}`);
    } finally {
      setIsSavingVapiConfig(false);
    }
  };

  const handleCopyWebhook = () => {
    const webhookUrl = status?.vapi?.webhookUrl || `${window.location.origin}/api/vapi/webhook`;
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#17243A]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-[#E6E7EB] flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-[#E6E7EB] flex items-center justify-between bg-[#FAF7F0]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#F9B91A] flex items-center justify-center shadow-xs text-[#17243A]">
              <Server className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-[#17243A]">
                  Cloud Infrastructure Stack
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#E8F7EF] text-[#15966B] border border-[#A7F3D0]">
                  Vapi • MongoDB • Cloudinary • Resend
                </span>
              </div>
              <p className="text-xs text-[#6B7280]">
                Enterprise voice telephony, resilient data persistence, asset CDN, and email delivery.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchStatus}
              disabled={isLoading}
              className="p-2 rounded-xl text-[#64748B] hover:text-[#17243A] hover:bg-[#FAF7F0] transition-colors cursor-pointer"
              title="Refresh status"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#64748B] hover:text-[#17243A] hover:bg-[#FAF7F0] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 px-6 pt-3 pb-2 border-b border-[#F3F4F6] bg-[#FAF7F0]/50 text-xs overflow-x-auto">
          {[
            { id: 'overview', label: 'All Services', icon: Server },
            { id: 'vapi', label: 'Vapi Voice AI', icon: Phone },
            { id: 'mongodb', label: 'MongoDB', icon: Database },
            { id: 'cloudinary', label: 'Cloudinary CDN', icon: Cloud },
            { id: 'resend', label: 'Resend Email', icon: Mail },
            { id: 'guide', label: 'Env Setup Guide', icon: FileCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-[#17243A] shadow-2xs border border-[#E6E7EB]'
                    : 'text-[#64748B] hover:text-[#17243A]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-[#17243A]">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Service Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Vapi Voice AI */}
                <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#E6E7EB] flex flex-col justify-between space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                      <Phone className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    {status?.vapi?.isConfigured ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F7EF] text-[#15966B]">
                        Live Vapi
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF3C7] text-[#D97706]">
                        Ready
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-[#17243A]">Vapi Voice AI</h3>
                    <p className="text-[11px] text-[#6B7280] mt-0.5">
                      Assistant: <span className="font-mono text-[#17243A]">{status?.vapi?.assistantId || 'Baked by Doja Agent'}</span>
                    </p>
                    <div className="mt-2 text-[11px] text-[#64748B] space-y-0.5">
                      <div>Engine: <strong>WebRTC + PSTN</strong></div>
                      <div>Voice: <strong>Cartesia / Deepgram</strong></div>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('vapi')}
                    className="w-full py-1.5 rounded-lg bg-white border border-[#E6E7EB] hover:bg-[#FAF7F0] font-bold text-xs text-[#17243A] cursor-pointer transition-colors"
                  >
                    Manage & Test Call
                  </button>
                </div>

                {/* 2. MongoDB */}
                <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#E6E7EB] flex flex-col justify-between space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Database className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    {status?.mongodb?.connected ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F7EF] text-[#15966B]">
                        Connected
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF8EC] text-[#D97706]">
                        Hybrid Mode
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-[#17243A]">MongoDB</h3>
                    <p className="text-[11px] text-[#6B7280] mt-0.5">
                      DB: <span className="font-mono text-[#17243A]">{status?.mongodb?.dbName || 'baked_by_doja'}</span>
                    </p>
                    <div className="mt-2 text-[11px] text-[#64748B] space-y-0.5">
                      <div>Orders: <strong>{status?.mongodb?.counts?.orders ?? 42}</strong></div>
                      <div>Knowledge: <strong>{status?.mongodb?.counts?.knowledge ?? 92}</strong></div>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('mongodb')}
                    className="w-full py-1.5 rounded-lg bg-white border border-[#E6E7EB] hover:bg-[#FAF7F0] font-bold text-xs text-[#17243A] cursor-pointer transition-colors"
                  >
                    Manage & Sync
                  </button>
                </div>

                {/* 3. Cloudinary */}
                <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#E6E7EB] flex flex-col justify-between space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                      <Cloud className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    {status?.cloudinary?.configured ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F7EF] text-[#15966B]">
                        Live Cloudinary
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E0F2FE] text-[#0284C7]">
                        Ready (Fallback)
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-[#17243A]">Cloudinary CDN</h3>
                    <p className="text-[11px] text-[#6B7280] mt-0.5">
                      Cloud: <span className="font-mono text-[#17243A]">{status?.cloudinary?.cloudName || 'baked-by-doja'}</span>
                    </p>
                    <p className="text-[11px] text-[#64748B] mt-2">
                      Responsive loaf imagery and attachment hosting.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('cloudinary')}
                    className="w-full py-1.5 rounded-lg bg-white border border-[#E6E7EB] hover:bg-[#FAF7F0] font-bold text-xs text-[#17243A] cursor-pointer transition-colors"
                  >
                    Test Image Upload
                  </button>
                </div>

                {/* 4. Resend */}
                <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#E6E7EB] flex flex-col justify-between space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                      <Mail className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    {status?.resend?.configured ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F7EF] text-[#15966B]">
                        Live Resend
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF7F0] text-[#17243A] border border-[#E6E7EB]">
                        Ready (Simulated)
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-[#17243A]">Resend Email</h3>
                    <p className="text-[11px] text-[#6B7280] mt-0.5 truncate">
                      From: <span className="font-mono text-[#17243A]">onboarding@resend.dev</span>
                    </p>
                    <p className="text-[11px] text-[#64748B] mt-2">
                      Order receipts, pay links and alerts.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('resend')}
                    className="w-full py-1.5 rounded-lg bg-white border border-[#E6E7EB] hover:bg-[#FAF7F0] font-bold text-xs text-[#17243A] cursor-pointer transition-colors"
                  >
                    Send Test Email
                  </button>
                </div>
              </div>

              {/* Architecture Highlight */}
              <div className="p-4 rounded-2xl bg-[#FFF8EC] border border-[#FEEBC8] flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs text-[#17243A]">Unified Production Architecture</h4>
                  <p className="text-[11px] text-[#6B7280] mt-0.5 leading-relaxed">
                    Vapi provides real-time WebRTC and telephone voice capabilities with tool-calling directly into our Express backend. Calls automatically create orders, check live stock, update customer profiles in MongoDB, host loaf photos on Cloudinary, and trigger branded email receipts via Resend!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VAPI VOICE AI */}
          {activeTab === 'vapi' && (
            <div className="space-y-6">
              {/* Vapi Overview & Webhook */}
              <div className="p-5 rounded-2xl bg-[#FAF7F0] border border-[#E6E7EB] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#F9B91A] text-[#17243A] flex items-center justify-center font-bold">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#17243A]">Vapi Voice AI Engine</h4>
                      <p className="text-xs text-[#6B7280]">
                        Handles telephone and WebRTC browser calls, voice synthesis, speech-to-text, and tool execution.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleSyncVapi}
                    disabled={isSyncingVapi}
                    className="px-3.5 py-1.5 rounded-xl bg-[#F9B91A] hover:bg-[#E5A812] text-[#17243A] font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingVapi ? 'animate-spin' : ''}`} />
                    <span>{isSyncingVapi ? 'Syncing...' : 'Sync Menu & RAG to Vapi'}</span>
                  </button>
                </div>

                {vapiSyncResult && (
                  <div className="p-3 bg-[#E8F7EF] border border-[#A7F3D0] text-[#065F46] rounded-xl text-xs font-semibold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#15966B]" />
                    <span>{vapiSyncResult}</span>
                  </div>
                )}

                {/* Webhook Endpoint for Vapi */}
                <div className="p-3.5 bg-white rounded-xl border border-[#E6E7EB] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                      Vapi Server Webhook URL
                    </span>
                    <button
                      onClick={handleCopyWebhook}
                      className="flex items-center gap-1 text-[11px] font-bold text-[#0284C7] hover:underline cursor-pointer"
                    >
                      {copiedWebhook ? <Check className="w-3 h-3 text-[#15966B]" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedWebhook ? 'Copied!' : 'Copy URL'}</span>
                    </button>
                  </div>
                  <div className="font-mono text-xs text-[#17243A] bg-[#FAF7F0] p-2 rounded-lg break-all">
                    {status?.vapi?.webhookUrl || `${window.location.origin}/api/vapi/webhook`}
                  </div>
                  <p className="text-[10px] text-[#6B7280]">
                    Paste this webhook URL into your Vapi Assistant dashboard to receive real-time function calls (placeOrder, checkStock, queryKnowledgeBase) and post-call reports.
                  </p>
                </div>
              </div>

              {/* Outbound Call Tester */}
              <div className="p-5 rounded-2xl bg-white border border-[#E6E7EB] space-y-4 shadow-2xs">
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-[#D97706]" />
                  <h4 className="font-bold text-sm text-[#17243A]">Test Outbound Phone Call via Vapi</h4>
                </div>
                <p className="text-xs text-[#6B7280]">
                  Trigger an automated outbound voice sales call to any customer's phone number. The agent introduces the bakery, offers loaf specials, and takes orders over the phone.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#6B7280] mb-1">
                      Customer Phone Number
                    </label>
                    <input
                      type="text"
                      value={vapiPhoneInput}
                      onChange={(e) => setVapiPhoneInput(e.target.value)}
                      placeholder="+234 810 123 4567"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[#FAF7F0] border border-[#E6E7EB] font-mono text-[#17243A] focus:outline-hidden focus:ring-1 focus:ring-[#F9B91A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#6B7280] mb-1">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      value={vapiNameInput}
                      onChange={(e) => setVapiNameInput(e.target.value)}
                      placeholder="e.g. Customer Name"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[#FAF7F0] border border-[#E6E7EB] text-[#17243A] focus:outline-hidden focus:ring-1 focus:ring-[#F9B91A]"
                    />
                  </div>
                </div>

                <button
                  onClick={handleDispatchVapiCall}
                  disabled={isCallingVapi || !vapiPhoneInput}
                  className="w-full py-2.5 rounded-xl bg-[#17243A] hover:bg-[#2A3B56] active:scale-[0.99] text-xs font-bold text-white flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all disabled:opacity-50"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-[#F9B91A]" />
                  <span>{isCallingVapi ? 'Dispatching Call via Vapi...' : 'Trigger Outbound Voice Call'}</span>
                </button>

                {vapiCallResult && (
                  <div
                    className={`p-3 rounded-xl border text-xs ${
                      vapiCallResult.success
                        ? 'bg-[#E8F7EF] border-[#A7F3D0] text-[#065F46]'
                        : 'bg-red-50 border-red-200 text-red-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold">
                      {vapiCallResult.success ? <Check className="w-4 h-4 text-[#15966B]" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
                      <span>{vapiCallResult.message}</span>
                    </div>
                    {vapiCallResult.callId && (
                      <div className="font-mono text-[11px] mt-1 text-[#64748B]">
                        Call ID: {vapiCallResult.callId}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Vapi Credentials Edit */}
              <div className="p-5 rounded-2xl bg-[#FAF7F0] border border-[#E6E7EB] space-y-3">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-[#D97706]" />
                  <h4 className="font-bold text-sm text-[#17243A]">Vapi Credentials Configuration</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#6B7280] mb-1">
                      Vapi Public Key (Web SDK)
                    </label>
                    <input
                      type="text"
                      value={vapiPublicKey}
                      onChange={(e) => setVapiPublicKey(e.target.value)}
                      placeholder="e.g. 5d8e1234-abcd-..."
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#E6E7EB] font-mono text-[#17243A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#6B7280] mb-1">
                      Vapi Private API Key (Telephony)
                    </label>
                    <input
                      type="password"
                      value={vapiApiKey}
                      onChange={(e) => setVapiApiKey(e.target.value)}
                      placeholder="e.g. vap_sec_..."
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#E6E7EB] font-mono text-[#17243A]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-[#6B7280]">
                    Updates live in server memory and ready for immediate call tests.
                  </span>
                  <button
                    onClick={handleSaveVapiConfig}
                    disabled={isSavingVapiConfig}
                    className="px-4 py-2 rounded-xl bg-[#17243A] hover:bg-[#2A3B56] text-white font-bold text-xs cursor-pointer shadow-xs"
                  >
                    {isSavingVapiConfig ? 'Saving...' : 'Save Vapi Config'}
                  </button>
                </div>

                {vapiConfigSavedMsg && (
                  <p className="text-xs font-bold text-[#15966B] mt-1">{vapiConfigSavedMsg}</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: MONGODB */}
          {activeTab === 'mongodb' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-[#FAF7F0] border border-[#E6E7EB] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Database className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#17243A]">MongoDB Synchronization</h4>
                      <p className="text-xs text-[#6B7280]">
                        Persistent database storage with automatic collections and indexing.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleSyncMongo}
                    disabled={isSyncingMongo}
                    className="px-3.5 py-1.5 rounded-xl bg-[#15966B] hover:bg-[#0D7D57] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingMongo ? 'animate-spin' : ''}`} />
                    <span>{isSyncingMongo ? 'Syncing...' : 'Sync All Records Now'}</span>
                  </button>
                </div>

                {mongoSyncResult && (
                  <div className="p-3 bg-[#E8F7EF] border border-[#A7F3D0] text-[#065F46] rounded-xl text-xs font-semibold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#15966B]" />
                    <span>{mongoSyncResult}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2">
                  <div className="p-3 bg-white rounded-xl border border-[#E6E7EB] text-center">
                    <div className="text-[10px] font-bold text-[#6B7280] uppercase">Orders</div>
                    <div className="text-base font-extrabold text-[#17243A] mt-1">{status?.mongodb?.counts?.orders ?? 42}</div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#E6E7EB] text-center">
                    <div className="text-[10px] font-bold text-[#6B7280] uppercase">Products</div>
                    <div className="text-base font-extrabold text-[#17243A] mt-1">{status?.mongodb?.counts?.products ?? 12}</div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#E6E7EB] text-center">
                    <div className="text-[10px] font-bold text-[#6B7280] uppercase">Customers</div>
                    <div className="text-base font-extrabold text-[#17243A] mt-1">{status?.mongodb?.counts?.customers ?? 28}</div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#E6E7EB] text-center">
                    <div className="text-[10px] font-bold text-[#6B7280] uppercase">Knowledge</div>
                    <div className="text-base font-extrabold text-[#17243A] mt-1">{status?.mongodb?.counts?.knowledge ?? 12}</div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#E6E7EB] text-center">
                    <div className="text-[10px] font-bold text-[#6B7280] uppercase">Voice Calls</div>
                    <div className="text-base font-extrabold text-[#17243A] mt-1">{status?.mongodb?.counts?.calls ?? 18}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CLOUDINARY */}
          {activeTab === 'cloudinary' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-[#FAF7F0] border border-[#E6E7EB] space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                    <Cloud className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#17243A]">Cloudinary Media & CDN</h4>
                    <p className="text-xs text-[#6B7280]">
                      Cloud storage for loaf product photos, receipts, and knowledge base attachments.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-[#E6E7EB] space-y-3">
                  <label className="block text-xs font-bold text-[#17243A]">Upload Test Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-xs text-[#6B7280] file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#17243A] file:text-white hover:file:bg-[#2A3B56] cursor-pointer"
                  />
                  {isUploadingImage && <p className="text-xs font-bold text-[#0284C7] animate-pulse">Uploading to Cloudinary CDN...</p>}
                  {uploadedImageUrl && (
                    <div className="mt-3 p-3 bg-[#FAF7F0] rounded-xl flex items-center gap-3">
                      <img src={uploadedImageUrl} alt="Uploaded" className="w-16 h-16 object-cover rounded-lg border" />
                      <div className="text-[11px] space-y-0.5 overflow-hidden">
                        <p className="font-bold text-[#15966B]">Uploaded successfully!</p>
                        <p className="truncate font-mono text-[#6B7280]">{uploadedImageUrl}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: RESEND */}
          {activeTab === 'resend' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-[#FAF7F0] border border-[#E6E7EB] space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#17243A]">Resend Transactional Email</h4>
                    <p className="text-xs text-[#6B7280]">
                      Dispatches high-converting HTML order confirmations and payment receipts.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-[#E6E7EB] space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#6B7280] mb-1">Recipient Email</label>
                    <input
                      type="email"
                      value={testEmailRecipient}
                      onChange={(e) => setTestEmailRecipient(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[#FAF7F0] border border-[#E6E7EB]"
                    />
                  </div>

                  <div className="flex gap-2">
                    {['order', 'receipt', 'message'].map((t) => (
                      <button
                        key={t}
                        onClick={() => setTestEmailType(t as any)}
                        className={`flex-1 py-1.5 rounded-lg border text-xs font-bold capitalize cursor-pointer ${
                          testEmailType === t ? 'bg-[#F9B91A] text-[#17243A] border-[#F9B91A]' : 'bg-white text-[#6B7280]'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleSendTestEmail}
                    disabled={isSendingEmail}
                    className="w-full py-2.5 rounded-xl bg-[#17243A] hover:bg-[#2A3B56] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-[#F9B91A]" />
                    <span>{isSendingEmail ? 'Sending...' : 'Send Test Email'}</span>
                  </button>

                  <button
                    onClick={() => setIsEmailPreviewModalOpen(true)}
                    type="button"
                    className="w-full py-2 rounded-xl bg-[#FAF7F0] hover:bg-[#FEF3C7] border border-[#E6E7EB] text-[#17243A] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>Inspect Transactional Email Template</span>
                  </button>

                  {emailSendResult && (
                    <div className={`p-3 rounded-xl border text-xs ${emailSendResult.success ? 'bg-[#E8F7EF] text-[#065F46]' : 'bg-red-50 text-red-700'}`}>
                      {emailSendResult.message || (emailSendResult.success ? 'Email sent successfully!' : 'Delivery error')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: ENV SETUP GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#E6E7EB] space-y-2">
                <h4 className="font-bold text-sm text-[#17243A]">Environment Configuration</h4>
                <p className="text-xs text-[#6B7280]">
                  Configure your production secrets in <code className="font-mono text-[#17243A]">.env</code>:
                </p>
                <div className="p-3.5 rounded-xl bg-[#17243A] text-emerald-400 font-mono text-[11px] overflow-x-auto space-y-1 leading-relaxed">
                  <div># Vapi Voice AI Platform</div>
                  <div>VAPI_API_KEY="your_vapi_private_api_key"</div>
                  <div>VAPI_PUBLIC_KEY="your_vapi_public_key"</div>
                  <div>VITE_VAPI_PUBLIC_KEY="your_vapi_public_key"</div>
                  <div>VAPI_ASSISTANT_ID="your_vapi_assistant_id"</div>
                  <div className="pt-2"># MongoDB Database URI</div>
                  <div>MONGODB_URI="mongodb+srv://&lt;user&gt;:&lt;pass&gt;@cluster0.mongodb.net/baked_by_doja?retryWrites=true&w=majority"</div>
                  <div>MONGODB_DB_NAME="baked_by_doja"</div>
                  <div className="pt-2"># Cloudinary Asset CDN</div>
                  <div>CLOUDINARY_CLOUD_NAME="baked-by-doja"</div>
                  <div>CLOUDINARY_API_KEY="your_cloudinary_api_key"</div>
                  <div>CLOUDINARY_API_SECRET="your_cloudinary_api_secret"</div>
                  <div className="pt-2"># Resend Email Delivery</div>
                  <div>RESEND_API_KEY="your_resend_api_key"</div>
                  <div>RESEND_FROM_EMAIL="Baked by Doja &lt;onboarding@resend.dev&gt;"</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#F3F4F6] bg-[#FAFAFA] flex items-center justify-between text-xs text-[#6B7280]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#15966B] animate-pulse"></span>
            <span>Vapi & Cloud Gateway: <code className="font-mono text-[#17243A]">/api/vapi/*</code> &amp; <code className="font-mono text-[#17243A]">/api/integrations/*</code></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-[#E6E7EB] bg-white hover:bg-[#FAF7F0] font-bold text-[#17243A] cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      <EmailTemplatePreviewModal
        isOpen={isEmailPreviewModalOpen}
        onClose={() => setIsEmailPreviewModalOpen(false)}
      />
    </div>
  );
};
