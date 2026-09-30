import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Send,
  Smartphone,
  Monitor,
  Code,
  Eye,
  CheckCircle,
  Copy,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

interface EmailTemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultOrderId?: string;
}

export const EmailTemplatePreviewModal: React.FC<EmailTemplatePreviewModalProps> = ({
  isOpen,
  onClose,
  defaultOrderId,
}) => {
  const [emailHtml, setEmailHtml] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile' | 'code'>('desktop');
  const [testEmailRecipient, setTestEmailRecipient] = useState('bimbo@example.com');
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchTemplate();
    }
  }, [isOpen]);

  const fetchTemplate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/email/preview-template');
      const data = await res.json();
      if (data.success && data.html) {
        setEmailHtml(data.html);
      }
    } catch (err) {
      console.error('Failed to fetch preview email template:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmailRecipient || !testEmailRecipient.includes('@')) return;
    setIsSending(true);
    setSendResult(null);
    try {
      const res = await fetch('/api/integrations/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: testEmailRecipient,
          type: 'order',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSendResult({
          success: true,
          message: `Transactional email successfully dispatched to ${testEmailRecipient}!`,
        });
      } else {
        setSendResult({
          success: false,
          message: data.error || 'Failed to dispatch email via Resend.',
        });
      }
    } catch (err: any) {
      setSendResult({ success: false, message: err.message || 'Network error occurred' });
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(emailHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#17243A]/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl border border-[#E6E7EB] flex flex-col h-[92vh] overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="px-6 py-4 border-b border-[#E6E7EB] flex items-center justify-between bg-[#FAF7F0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center text-xl shadow-xs">
              🍌
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-[#17243A] text-base">
                  Transactional Email Template
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#EBF8F1] text-[#15803D] border border-[#C6EBD7]">
                  Strict Source of Truth
                </span>
              </div>
              <p className="text-xs text-[#78716C] mt-0.5">
                Baked by Doja • Artisanal Handcrafted Banana Bread Bakery (Order #BB-4504)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View switcher */}
            <div className="flex items-center p-1 bg-white rounded-xl border border-[#E6E7EB] text-xs font-semibold">
              <button
                onClick={() => setViewMode('desktop')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'desktop'
                    ? 'bg-[#17243A] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#17243A]'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Desktop</span>
              </button>
              <button
                onClick={() => setViewMode('mobile')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'mobile'
                    ? 'bg-[#17243A] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#17243A]'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mobile</span>
              </button>
              <button
                onClick={() => setViewMode('code')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'code'
                    ? 'bg-[#17243A] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#17243A]'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">HTML</span>
              </button>
            </div>

            <button
              onClick={handleCopyHtml}
              className="p-2 rounded-xl bg-white border border-[#E6E7EB] text-[#475569] hover:text-[#17243A] hover:bg-[#FAF7F0] transition-colors cursor-pointer"
              title="Copy HTML to clipboard"
            >
              {copied ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white border border-[#E6E7EB] text-[#64748B] hover:text-[#17243A] hover:bg-[#FAF7F0] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 stroke-[2.2]" />
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-[#FAF8F5]">
          
          {/* LEFT/MAIN: PREVIEW CANVAS */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 flex items-start justify-center">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-3 border-[#F9B91A] border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-[#78716C] font-medium">Generating email preview...</p>
              </div>
            ) : viewMode === 'code' ? (
              <div className="w-full max-w-3xl bg-[#17243A] text-emerald-300 p-5 rounded-2xl font-mono text-xs overflow-auto max-h-[72vh] shadow-inner border border-[#334155] leading-relaxed">
                <pre>{emailHtml}</pre>
              </div>
            ) : (
              <div
                className={`transition-all duration-300 bg-white rounded-2xl shadow-xl border border-[#EBE5D8] overflow-hidden ${
                  viewMode === 'mobile' ? 'w-[375px]' : 'w-full max-w-[640px]'
                }`}
                style={{ minHeight: '680px' }}
              >
                <iframe
                  title="Baked by Doja Transactional Email"
                  srcDoc={emailHtml}
                  className="w-full h-[720px] border-none"
                  sandbox="allow-same-origin"
                />
              </div>
            )}
          </div>

          {/* RIGHT: TEST SEND & DYNAMIC VARIABLES SIDEBAR */}
          <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-[#EBE5D8] bg-white p-5 overflow-y-auto flex flex-col justify-between">
            <div className="space-y-5">
              
              {/* Send Live Test Box */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EBE5D8] space-y-3">
                <div className="flex items-center gap-2 text-[#17243A]">
                  <Mail className="w-4 h-4 text-[#D97706]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">Test Resend Dispatch</h4>
                </div>
                <p className="text-[11px] text-[#78716C] leading-relaxed">
                  Send this exact production template live to your inbox using Resend.
                </p>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#78716C] mb-1">
                    Recipient Address
                  </label>
                  <input
                    type="email"
                    value={testEmailRecipient}
                    onChange={(e) => setTestEmailRecipient(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#EBE5D8] text-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#F9B91A]"
                  />
                </div>

                <button
                  onClick={handleSendTestEmail}
                  disabled={isSending}
                  className="w-full py-2.5 rounded-xl bg-[#F9B91A] hover:bg-[#E6A700] text-[#17243A] font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSending ? 'Sending via Resend...' : 'Send Live Test Email'}</span>
                </button>

                {sendResult && (
                  <div
                    className={`p-2.5 rounded-xl text-xs font-medium ${
                      sendResult.success
                        ? 'bg-[#EBF8F1] text-[#15803D] border border-[#C6EBD7]'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {sendResult.message}
                  </div>
                )}
              </div>

              {/* Dynamic Data Variables Reference */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#17243A]">
                  <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>Dynamic Template Variables</span>
                </div>
                <p className="text-[11px] text-[#78716C] leading-normal">
                  All production order properties are mapped dynamically at runtime:
                </p>

                <div className="space-y-1.5 font-mono text-[11px] max-h-48 overflow-y-auto pr-1">
                  {[
                    ['{{orderNumber}}', 'BB-4504'],
                    ['{{customerName}}', 'Bimbo'],
                    ['{{phone}}', '+234 803 999 1122'],
                    ['{{email}}', 'bimbo@example.com'],
                    ['{{deliveryAddress}}', 'Victoria Island, Lagos'],
                    ['{{orderType}}', 'Delivery Appointment'],
                    ['{{scheduledSlot}}', 'Saturday at 10:00 AM'],
                    ['{{paymentMethod}}', 'Paystack'],
                    ['{{subtotal}}', '₦30,000'],
                    ['{{deliveryFee}}', '₦2,500'],
                    ['{{grandTotal}}', '₦32,500'],
                    ['{{dashboardOrderUrl}}', 'Link to live dashboard'],
                  ].map(([variable, val]) => (
                    <div
                      key={variable}
                      className="p-1.5 rounded-lg bg-[#FAF8F5] border border-[#F1ECE1] flex items-center justify-between"
                    >
                      <span className="text-[#B45309] font-semibold">{variable}</span>
                      <span className="text-[#78716C] text-[10px]">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Bakery Brand Badge */}
            <div className="mt-4 pt-4 border-t border-[#F1ECE1] text-center">
              <div className="text-[11px] font-bold text-[#17243A]">Baked by Doja 🍌</div>
              <p className="text-[10px] text-[#78716C]">
                Lekki Phase 1, Lagos • Handcrafted Daily
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
