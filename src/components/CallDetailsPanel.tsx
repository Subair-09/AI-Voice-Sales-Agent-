import React, { useState } from 'react';
import {
  X,
  Phone,
  Calendar,
  Clock,
  Package,
  PhoneCall,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  User,
} from 'lucide-react';
import { CallRecord } from './CallLogTable';
import { BreadIcon } from './DashboardSidebar';

interface CallDetailsPanelProps {
  call: CallRecord | null;
  onClose?: () => void;
  onViewOrder?: (orderId: string) => void;
}

export const CallDetailsPanel: React.FC<CallDetailsPanelProps> = ({
  call,
  onClose,
  onViewOrder,
}) => {
  const [callingState, setCallingState] = useState<'idle' | 'calling' | 'connected'>('idle');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!call) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-[#E6E7EB] shadow-xs flex flex-col items-center justify-center text-center h-full min-h-[400px]">
        <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mb-3">
          <Phone className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-[#17243A]">No Call Selected</h3>
        <p className="text-xs text-gray-500 mt-1 max-w-xs">
          Select any call from the log on the left to inspect call transcript, audio, and details.
        </p>
      </div>
    );
  }

  const isMissed = call.status === 'Missed';

  const handleCallAgain = async () => {
    setCallingState('calling');
    try {
      const res = await fetch(`/api/admin/calls/${call.id}/call-again`, { method: 'POST' });
      const data = await res.json();
      setCallingState('connected');
      setToastMessage(data.message || `Calling ${call.phoneNumber}...`);
      setTimeout(() => {
        setCallingState('idle');
        setTimeout(() => setToastMessage(null), 3000);
      }, 2500);
    } catch {
      setCallingState('idle');
      setToastMessage(`Initiating outbound call to ${call.phoneNumber}`);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E6E7EB] shadow-xs flex flex-col justify-between h-full relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-3 left-4 right-4 z-30 bg-[#17243A] text-white text-xs px-3.5 py-2 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-[#15966B] shrink-0" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      <div>
        {/* Panel Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <h3 className="text-sm font-bold text-[#17243A]">
            Call Details
          </h3>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Close call details"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Customer Header Lockup */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                isMissed ? 'bg-[#FEE2E2] text-[#DC2626]' : 'bg-[#E8F7EF] text-[#15966B]'
              }`}
            >
              <Phone className="w-4 h-4 stroke-[2.2]" />
            </div>

            <div>
              <div className="text-sm font-bold text-[#17243A] leading-tight">
                {call.phoneNumber}
              </div>
              <div className="text-xs text-[#6B7280] leading-tight mt-0.5">
                {call.customer}
              </div>
            </div>
          </div>

          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
              isMissed
                ? 'bg-[#FEE2E2] text-[#DC2626]'
                : 'bg-[#E8F7EF] text-[#15966B]'
            }`}
          >
            {call.status}
          </span>
        </div>

        {/* Date & Duration Info Grid */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-[#FAF7F0] rounded-xl border border-[#EFECE6] mb-4 text-xs">
          {/* Date info */}
          <div className="flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-[#17243A] shrink-0" />
            <div>
              <div className="font-semibold text-[#17243A] leading-tight">
                {call.date}
              </div>
              <div className="text-[11px] text-[#6B7280] leading-tight">
                {call.time}
              </div>
            </div>
          </div>

          {/* Duration info */}
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-[#17243A] shrink-0" />
            <div>
              <div className="text-[11px] text-[#6B7280] leading-tight">
                Duration
              </div>
              <div className="font-mono font-semibold text-[#17243A] leading-tight">
                {call.duration}
              </div>
            </div>
          </div>
        </div>

        {/* Call Summary */}
        <div className="mb-4">
          <h4 className="text-xs font-bold text-[#17243A] mb-1.5">
            Call Summary
          </h4>
          <div className="bg-[#FAF7F0]/80 rounded-xl p-3 border border-[#EFECE6] text-xs text-[#475569] leading-relaxed">
            {call.summary}
          </div>
        </div>

        {/* Call Transcript */}
        <div>
          <h4 className="text-xs font-bold text-[#17243A] mb-2 flex items-center justify-between">
            <span>Call Transcript</span>
            <span className="text-[10px] text-gray-400 font-normal">
              Audio transcribed via AI
            </span>
          </h4>

          <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
            {call.transcript && call.transcript.length > 0 ? (
              call.transcript.map((msg, idx) => {
                const isAgent = msg.speaker === 'AI Agent';

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isAgent
                            ? 'bg-[#FEF3C7] text-[#D97706]'
                            : 'bg-[#E0F2FE] text-[#0284C7]'
                        }`}
                      >
                        {isAgent ? (
                          <BreadIcon size={12} />
                        ) : (
                          <User className="w-3 h-3" />
                        )}
                      </div>
                      <span className="font-bold text-[#17243A]">
                        {msg.speaker}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {msg.time}
                      </span>
                    </div>

                    <div
                      className={`text-xs p-2.5 rounded-xl leading-relaxed ${
                        isAgent
                          ? 'bg-[#FAF7F0] border border-[#EFECE6] text-[#2B1B12] rounded-tl-xs'
                          : 'bg-[#F0F9FF] border border-[#BAE6FD] text-[#0369A1] rounded-tl-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-xs text-gray-400 italic py-2">
                No conversation transcript recorded for this call.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Call Actions (Bottom Buttons) */}
      <div className="grid grid-cols-2 gap-3 pt-4 mt-4 border-t border-gray-100">
        <button
          onClick={handleCallAgain}
          disabled={callingState !== 'idle'}
          className="h-10 px-3 bg-[#F9B91A] hover:bg-[#ECAE0E] active:scale-[0.99] text-[#17243A] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
        >
          <PhoneCall className="w-3.5 h-3.5 stroke-[2.2]" />
          <span>
            {callingState === 'calling' ? 'Dialing...' : callingState === 'connected' ? 'Connected' : 'Call Again'}
          </span>
        </button>

        <button
          onClick={() => {
            if (call.orderId && onViewOrder) {
              onViewOrder(call.orderId);
            } else {
              setToastMessage(call.orderId ? `Order #${call.orderId}` : 'No associated order for this call');
              setTimeout(() => setToastMessage(null), 3000);
            }
          }}
          className="h-10 px-3 bg-white hover:bg-stone-50 active:scale-[0.99] border border-[#E6E7EB] text-[#17243A] font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
        >
          <Package className="w-3.5 h-3.5 stroke-[2]" />
          <span>View Order</span>
        </button>
      </div>
    </div>
  );
};
