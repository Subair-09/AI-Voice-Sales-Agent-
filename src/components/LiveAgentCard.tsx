import React from 'react';
import { Sparkles, PhoneCall } from 'lucide-react';

interface LiveAgentCardProps {
  status: 'Active' | 'Updating' | 'Offline' | 'Error';
  onTestCall: () => void;
  isLoading?: boolean;
}

export const LiveAgentCard: React.FC<LiveAgentCardProps> = ({
  status,
  onTestCall,
  isLoading = false,
}) => {
  const isOnline = status === 'Active';

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E6E7EB] shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        {/* Header with Title and Active Badge */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-[#17243A] font-bold text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#F9B91A] fill-[#F9B91A]" />
              Live Agent
            </span>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
              isOnline
                ? 'bg-[#E8F7EF] text-[#15966B]'
                : status === 'Updating'
                ? 'bg-[#FEF3C7] text-[#D97706]'
                : 'bg-[#FEE2E2] text-[#DC2626]'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isOnline
                  ? 'bg-[#15966B] animate-pulse'
                  : status === 'Updating'
                  ? 'bg-[#D97706]'
                  : 'bg-[#DC2626]'
              }`}
            />
            {status}
          </span>
        </div>

        {/* Informative Text */}
        <p className="text-xs text-[#6B7280] leading-relaxed mb-4">
          {isOnline
            ? 'Your AI agent is currently online and ready to handle customer calls.'
            : 'Your AI agent is currently offline. Enable it to begin receiving customer calls.'}
        </p>
      </div>

      {/* Large Yellow Test Call Button */}
      <button
        onClick={onTestCall}
        disabled={!isOnline || isLoading}
        className="w-full py-3 px-4 rounded-xl bg-[#F9B91A] hover:bg-[#E5A812] active:scale-[0.99] font-bold text-sm text-[#17243A] flex items-center justify-center gap-2.5 transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <PhoneCall className="w-4 h-4 stroke-[2.2]" />
        <span>Test Call</span>
      </button>
    </div>
  );
};
