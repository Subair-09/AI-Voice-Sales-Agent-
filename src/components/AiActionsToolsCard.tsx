import React from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { AgentTool } from '../types/agent';

interface AiActionsToolsCardProps {
  tools: AgentTool[];
  onManageTools?: () => void;
}

export const AiActionsToolsCard: React.FC<AiActionsToolsCardProps> = ({
  tools,
  onManageTools,
}) => {
  // Primary actions to display in the card as per the reference image
  const displayItems = [
    'Check product availability',
    'Create new orders',
    'Generate Paystack payment links',
    'Check payment status',
    'Send email confirmations',
    'Update customer information',
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E6E7EB] shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        <h3 className="text-base font-bold text-[#17243A]">AI Actions & Tools</h3>
        <p className="text-xs text-[#6B7280] mt-1 mb-4">
          Your agent can perform the following actions:
        </p>

        <ul className="space-y-3">
          {displayItems.map((item, idx) => {
            const matchedTool = tools.find(
              (t) => t.displayName.toLowerCase() === item.toLowerCase()
            );
            const isEnabled = matchedTool ? matchedTool.enabled : true;

            return (
              <li key={idx} className="flex items-center gap-3 text-xs">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    isEnabled
                      ? 'bg-[#E8F7EF] text-[#15966B]'
                      : 'bg-[#F3F4F6] text-[#9CA3AF]'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span
                  className={`font-medium ${
                    isEnabled ? 'text-[#17243A]' : 'text-[#9CA3AF] line-through'
                  }`}
                >
                  {item}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {onManageTools && (
        <div className="mt-4 pt-3 border-t border-[#F3F4F6] flex justify-end">
          <button
            onClick={onManageTools}
            className="text-[11px] font-bold text-[#6B7280] hover:text-[#17243A] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Manage All Tools ({tools.length})</span>
            <ArrowRight className="w-3 h-3 stroke-[2.5]" />
          </button>
        </div>
      )}
    </div>
  );
};
