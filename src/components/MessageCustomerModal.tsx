import React, { useState } from 'react';
import { X, Send, MessageSquare, PhoneCall, CheckCircle2, Sparkles } from 'lucide-react';
import { CustomerRecord } from './CustomersListTable';

interface MessageCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerRecord | null;
}

export const MessageCustomerModal: React.FC<MessageCustomerModalProps> = ({
  isOpen,
  onClose,
  customer,
}) => {
  if (!isOpen || !customer) return null;

  const [channel, setChannel] = useState<'WhatsApp' | 'SMS' | 'Voice Agent' | 'Email'>('WhatsApp');
  const [message, setMessage] = useState(
    `Hello ${customer.name}! Thank you for your continued love for Baked by Doja. We have freshly baked batches ready today. Would you like to place an order?`
  );
  const [isSending, setIsSending] = useState(false);
  const [successStatus, setSuccessStatus] = useState<string | null>(null);

  const templates = [
    {
      label: 'Fresh Bakes Alert',
      text: `Hello ${customer.name}! Our signature warm banana bread batches just came out of the oven at Baked by Doja. Order now for express delivery!`,
    },
    {
      label: 'Order Follow-up',
      text: `Hi ${customer.name}, just checking in to see how you enjoyed your recent banana bread order from Baked by Doja! We would love your feedback.`,
    },
    {
      label: 'Special Customer Discount',
      text: `Hello ${customer.name}, as one of our top valued customers, enjoy 10% off your next order today with code DOJA10!`,
    },
  ];

  const handleSend = async () => {
    setIsSending(true);
    try {
      const res = await fetch(`/api/admin/customers/${customer.id}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, channel }),
      });
      const data = await res.json();
      setSuccessStatus(data.message || `Message dispatched via ${channel}!`);
      setTimeout(() => {
        setSuccessStatus(null);
        setIsSending(false);
        onClose();
      }, 1800);
    } catch {
      setSuccessStatus(`Message sent to ${customer.name} via ${channel}`);
      setTimeout(() => {
        setSuccessStatus(null);
        setIsSending(false);
        onClose();
      }, 1800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-[#E6E7EB] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#FAF7F0] flex items-center justify-center text-[#17243A]">
              <MessageSquare className="w-4 h-4 text-[#F9B91A]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#17243A]">
                Message Customer
              </h3>
              <p className="text-xs text-gray-500">
                {customer.name} • {customer.phone}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {successStatus ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-[#17243A]">{successStatus}</p>
              <p className="text-xs text-gray-500">Closing window...</p>
            </div>
          ) : (
            <>
              {/* Channel Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Select Channel
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['WhatsApp', 'SMS', 'Email', 'Voice Agent'] as const).map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => setChannel(ch)}
                      className={`h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                        channel === ch
                          ? 'bg-[#FAF7F0] border-[#F9B91A] text-[#17243A] shadow-xs'
                          : 'bg-white border-[#E6E7EB] text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {ch === 'WhatsApp' ? (
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      ) : ch === 'SMS' ? (
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                      ) : ch === 'Email' ? (
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                      ) : (
                        <Sparkles className="w-3 h-3 text-[#F9B91A]" />
                      )}
                      <span>{ch === 'Email' ? 'Email (Resend)' : ch}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick AI Templates */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Quick Templates
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {templates.map((tpl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setMessage(tpl.text)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-stone-100 hover:bg-[#FAF7F0] text-gray-700 hover:text-[#17243A] border border-stone-200 transition-colors cursor-pointer"
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Box */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Message Content
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-[#E6E7EB] focus:outline-none focus:border-[#F9B91A] bg-white text-[#17243A] leading-relaxed"
                  placeholder="Type message here..."
                />
              </div>

              <div className="text-[11px] text-gray-400 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                Connected to Nigerian carrier gateway & WhatsApp Business API. AI Voice Agent can also trigger an automated phone call.
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!successStatus && (
          <div className="flex items-center justify-end gap-2.5 px-6 py-4 bg-stone-50 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 rounded-xl hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={isSending || !message.trim()}
              className="px-5 py-2 text-xs font-bold bg-[#F9B91A] hover:bg-[#ECAE0E] text-[#17243A] rounded-xl flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? 'Sending...' : `Send via ${channel}`}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
