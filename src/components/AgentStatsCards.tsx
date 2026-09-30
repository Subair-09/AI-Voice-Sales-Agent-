import React from 'react';
import { Bot, Phone, ShoppingBag, PieChart } from 'lucide-react';
import { AgentStats } from '../types/agent';

interface AgentStatsCardsProps {
  stats: AgentStats;
}

export const AgentStatsCards: React.FC<AgentStatsCardsProps> = ({ stats }) => {
  const isAgentActive = stats.status === 'Active';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Agent Status */}
      <div className="bg-white rounded-2xl p-5 border border-[#E6E7EB] shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#E8F7EF] text-[#15966B] flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xs font-medium text-[#6B7280]">Agent Status</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isAgentActive ? 'bg-[#15966B] animate-pulse' : 'bg-[#DC2626]'
                  }`}
                />
                <span className="text-base font-bold text-[#17243A]">
                  {stats.status}
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs text-[#6B7280] leading-snug mt-2">
            {stats.statusDescription}
          </p>
        </div>
      </div>

      {/* 2. Total Calls (7 days) */}
      <div className="bg-white rounded-2xl p-5 border border-[#E6E7EB] shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
        <div>
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium text-[#6B7280]">
                Total Calls (7 days)
              </span>
              <div className="text-2xl font-bold text-[#17243A] mt-1 tracking-tight">
                {stats.totalCalls}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 stroke-[2]" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#F3F4F6] flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-[#15966B]">
              {stats.totalCallsChange}
            </span>
            <span className="text-[#9CA3AF]">{stats.totalCallsTimeframe}</span>
          </div>
        </div>
      </div>

      {/* 3. Orders Created */}
      <div className="bg-white rounded-2xl p-5 border border-[#E6E7EB] shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
        <div>
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium text-[#6B7280]">
                Orders Created
              </span>
              <div className="text-2xl font-bold text-[#17243A] mt-1 tracking-tight">
                {stats.ordersCreated}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#F3E8FF] text-[#9333EA] flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5 stroke-[2]" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#F3F4F6] flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-[#15966B]">
              {stats.ordersCreatedChange}
            </span>
            <span className="text-[#9CA3AF]">{stats.ordersCreatedTimeframe}</span>
          </div>
        </div>
      </div>

      {/* 4. Revenue Generated */}
      <div className="bg-white rounded-2xl p-5 border border-[#E6E7EB] shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
        <div>
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium text-[#6B7280]">
                Revenue Generated
              </span>
              <div className="text-2xl font-bold text-[#17243A] mt-1 tracking-tight">
                {stats.revenueGenerated}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0">
              <PieChart className="w-5 h-5 stroke-[2]" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#F3F4F6] flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-[#15966B]">
              {stats.revenueGeneratedChange}
            </span>
            <span className="text-[#9CA3AF]">{stats.revenueGeneratedTimeframe}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
