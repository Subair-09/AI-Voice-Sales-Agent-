import React from 'react';
import { TrendingUp, Sparkles } from 'lucide-react';
import { KnowledgeUsageStats } from '../../types/knowledge';

interface AiKnowledgeUsageCardProps {
  usage?: KnowledgeUsageStats;
}

export const AiKnowledgeUsageCard: React.FC<AiKnowledgeUsageCardProps> = ({
  usage = {
    questionsAnswered: 86,
    questionsChange: '↑ 24%',
    mostQueriedTopics: [
      { rank: 1, topic: 'Product prices', percentage: 34 },
      { rank: 2, topic: 'Delivery information', percentage: 25 },
      { rank: 3, topic: 'Product availability', percentage: 19 },
      { rank: 4, topic: 'Order policies', percentage: 13 },
      { rank: 5, topic: 'Other', percentage: 9 },
    ],
  },
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E6E7EB] shadow-xs hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-1 pb-2 border-b border-[#F3F4F6]">
        <div className="w-7 h-7 rounded-lg bg-[#FAF7F0] flex items-center justify-center text-[#17243A]">
          <TrendingUp className="w-3.5 h-3.5 stroke-[2.2]" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#17243A]">AI Knowledge Usage</h3>
        </div>
      </div>

      <p className="text-[11px] text-[#6B7280] mb-3">
        See how your AI agent is using the knowledge base.
      </p>

      {/* Main Metric */}
      <div className="flex items-baseline gap-2.5 mb-1">
        <span className="text-2xl font-black text-[#17243A]">
          {usage.questionsAnswered}
        </span>
        <span className="text-xs font-bold text-[#15966B] flex items-center gap-0.5">
          {usage.questionsChange}
        </span>
      </div>
      <p className="text-[11px] text-[#6B7280] font-medium mb-4">
        Questions answered from Knowledge Base
      </p>

      {/* Most Queried Topics */}
      <div className="pt-2 border-t border-[#F3F4F6]">
        <h4 className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-2">
          Most queried topics
        </h4>

        <div className="space-y-2 text-xs">
          {usage.mostQueriedTopics.map((item) => (
            <div key={item.rank} className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#334155]">
                <span className="w-4 text-[11px] text-[#9CA3AF] font-bold text-center">
                  {item.rank}
                </span>
                <span className="font-medium truncate max-w-[160px] sm:max-w-none">
                  {item.topic}
                </span>
              </div>
              <span className="text-xs font-bold text-[#17243A] shrink-0 font-mono">
                {item.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
