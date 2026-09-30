import React from 'react';
import { Lightbulb, ArrowRight, Settings } from 'lucide-react';
import { BananaIcon } from './BananaLogo';

interface BottomCtaCardsProps {
  onAgentSettings?: () => void;
  onManageProducts?: () => void;
  quickTipsTitle?: string;
  quickTipsDescription?: string;
  quickTipsActionLabel?: string;
  onQuickTipsAction?: () => void;
}

export const BottomCtaCards: React.FC<BottomCtaCardsProps> = ({
  onAgentSettings,
  onManageProducts,
  quickTipsTitle = 'Quick Tips',
  quickTipsDescription = 'Keep your customer data updated for better AI responses and personalized service.',
  quickTipsActionLabel = 'Manage Customers',
  onQuickTipsAction,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Left Card: AI Agent Smarter Bakery */}
      <div className="lg:col-span-7 bg-[#FFF8EC] rounded-2xl p-4 sm:p-5 border border-[#FEEBC8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#FFE39A] flex items-center justify-center shrink-0">
            <BananaIcon size={22} />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-[#17243A] leading-tight">
              Let Your Bakery Work Smarter
            </h4>
            <p className="text-xs text-[#6B7280] leading-snug mt-0.5 max-w-md">
              Your AI agent is ready to take orders, answer questions, and help your customers — 24/7.
            </p>
          </div>
        </div>

        <button
          onClick={onAgentSettings}
          className="self-start sm:self-center px-3.5 py-2 rounded-xl bg-[#FFE39A] hover:bg-[#F9B91A] active:scale-[0.99] border border-[#FEEBC8] text-[#17243A] font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer"
        >
          <Settings className="w-3.5 h-3.5 stroke-[2]" />
          <span>View AI Agent Settings</span>
          <ArrowRight className="w-3 h-3 stroke-[2.5]" />
        </button>
      </div>

      {/* Right Card: Quick Tips */}
      <div className="lg:col-span-5 bg-white rounded-2xl p-4 sm:p-5 border border-[#E6E7EB] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#E8F7EF] text-[#15966B] flex items-center justify-center shrink-0">
            <Lightbulb className="w-4 h-4 stroke-[2]" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-[#17243A] leading-tight">
              {quickTipsTitle}
            </h4>
            <p className="text-xs text-[#6B7280] leading-snug mt-0.5">
              {quickTipsDescription}
            </p>
          </div>
        </div>

        <button
          onClick={onQuickTipsAction || onManageProducts}
          className="self-start sm:self-center px-3 py-2 rounded-xl bg-[#E8F7EF] hover:bg-[#D1FAE5] active:scale-[0.99] border border-[#A7F3D0] text-[#15966B] font-semibold text-xs flex items-center gap-1 transition-all shadow-xs shrink-0 cursor-pointer"
        >
          <span>{quickTipsActionLabel}</span>
          <ArrowRight className="w-3 h-3 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
