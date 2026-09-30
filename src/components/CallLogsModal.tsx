import React, { useState, useEffect } from 'react';
import { X, Phone, Play, Pause, CheckCircle2, User, Clock, MessageSquare, Headphones } from 'lucide-react';
import { safeFetchJson } from '../utils/api';

interface CallLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CallLogsModal: React.FC<CallLogsModalProps> = ({ isOpen, onClose }) => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [calls, setCalls] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    safeFetchJson('/api/admin/calls')
      .then((data) => {
        if (data && data.calls) {
          setCalls(data.calls);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-2xl w-full shadow-2xl border border-[#E6E7EB] max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E8F7EF] text-[#15966B] flex items-center justify-center">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#17243A]">
                AI Voice Sales Agent Call Logs
              </h3>
              <p className="text-xs text-[#6B7280]">
                Live phone recordings, Paystack orders & AI speech transcripts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Call Logs List */}
        <div className="overflow-y-auto space-y-4 py-4 flex-1 pr-1">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-gray-500">
              Loading call logs...
            </div>
          ) : calls.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-500 flex flex-col items-center justify-center gap-2">
              <Headphones className="w-8 h-8 text-stone-300 stroke-[1.5]" />
              <p className="font-semibold text-stone-700">No call logs recorded yet</p>
              <p className="text-[11px] text-stone-400">Incoming phone calls and AI voice transcripts will appear here automatically.</p>
            </div>
          ) : (
            calls.map((call) => {
              const isPlaying = playingId === call.id;
              const transcriptItems = Array.isArray(call.transcript)
                ? call.transcript
                : typeof call.transcript === 'string'
                ? [{ speaker: 'Transcript', text: call.transcript }]
                : [];

              return (
                <div
                  key={call.id}
                  className="bg-[#FAF7F0] border border-[#E6E7EB] rounded-2xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setPlayingId(isPlaying ? null : call.id)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                          isPlaying
                            ? 'bg-[#15966B] text-white'
                            : 'bg-white border border-[#E6E7EB] text-[#17243A] hover:bg-stone-50'
                        }`}
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                      </button>

                      <div>
                        <div className="text-xs font-bold text-[#17243A] flex items-center gap-2">
                          <span>{call.phoneNumber || call.phone || 'Unknown Caller'}</span>
                          <span className="text-[11px] font-normal text-gray-500">({call.customer || 'Guest'})</span>
                        </div>
                        <div className="text-[11px] text-[#15966B] font-semibold mt-0.5">
                          {call.outcome || 'Call Completed'}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-mono text-gray-600">{call.duration || '0m 00s'}</div>
                      <div className="text-[10px] text-gray-400">{call.dateTime || call.time || 'Recently'}</div>
                    </div>
                  </div>

                  {/* Transcript Box */}
                  {transcriptItems.length > 0 && (
                    <div className="bg-white rounded-xl p-3 border border-stone-200/80 space-y-2 text-xs">
                      <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                        Audio Transcript
                      </div>
                      {transcriptItems.map((t: any, idx: number) => (
                        <div key={idx} className="flex gap-2 text-[11px]">
                          <span className={`font-bold shrink-0 ${t.speaker === 'AI Agent' ? 'text-[#D97706]' : 'text-[#17243A]'}`}>
                            {t.speaker}:
                          </span>
                          <span className="text-gray-700 leading-snug">{t.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs shrink-0">
          <span className="text-gray-500">
            Powered by Vapi AI & Baked by Doja Knowledge Base
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-[#17243A] font-semibold rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
