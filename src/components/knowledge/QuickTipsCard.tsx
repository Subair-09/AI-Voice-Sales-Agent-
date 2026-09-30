import React from 'react';
import { CheckCircle2, HelpCircle } from 'lucide-react';

export const QuickTipsCard: React.FC = () => {
  const tips = [
    {
      title: 'Keep your knowledge current',
      description: 'Update your product and delivery information whenever your business changes.',
    },
    {
      title: 'Use clear documents',
      description: 'Give the AI structured, easy-to-understand information.',
    },
    {
      title: 'Avoid conflicting information',
      description: 'Keep current prices and inventory in your Products section.',
    },
    {
      title: 'Test your AI',
      description: "After updating your knowledge, make a test call to verify the agent's answers.",
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E6E7EB] shadow-xs hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-3.5 pb-2 border-b border-[#F3F4F6]">
        <div className="w-7 h-7 rounded-lg bg-[#FAF7F0] flex items-center justify-center text-[#17243A]">
          <HelpCircle className="w-3.5 h-3.5 stroke-[2.2]" />
        </div>
        <h3 className="text-sm font-bold text-[#17243A]">Quick Tips</h3>
      </div>

      <div className="space-y-3">
        {tips.map((tip, i) => (
          <div key={i} className="flex items-start gap-2.5 text-xs">
            <CheckCircle2 className="w-4 h-4 text-[#15966B] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#17243A] leading-tight">{tip.title}</p>
              <p className="text-[11px] text-[#6B7280] mt-0.5 leading-relaxed">
                {tip.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
