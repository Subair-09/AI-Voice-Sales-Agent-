import React from 'react';
import { Phone, PhoneCall, PhoneMissed, Clock } from 'lucide-react';

interface MetricsProps {
  metrics?: {
    totalCalls: number;
    totalCallsChange: string;
    answeredCalls: number;
    answeredCallsChange: string;
    missedCalls: number;
    missedCallsChange: string;
    avgDuration: string;
    avgDurationChange: string;
  };
}

export const CallMetricsCards: React.FC<MetricsProps> = ({ metrics }) => {
  const data = [
    {
      id: 'total',
      title: 'Total Calls',
      value: metrics?.totalCalls != null ? metrics.totalCalls.toString() : '0',
      change: metrics?.totalCallsChange || '0%',
      isPositive: true,
      timeframe: 'vs. previous 7 days',
      icon: Phone,
      iconBg: 'bg-[#E8F7EF]',
      iconColor: 'text-[#15966B]',
    },
    {
      id: 'answered',
      title: 'Answered Calls',
      value: metrics?.answeredCalls != null ? metrics.answeredCalls.toString() : '0',
      change: metrics?.answeredCallsChange || '0%',
      isPositive: true,
      timeframe: 'vs. previous 7 days',
      icon: PhoneCall,
      iconBg: 'bg-[#E0F2FE]',
      iconColor: 'text-[#0284C7]',
    },
    {
      id: 'missed',
      title: 'Missed Calls',
      value: metrics?.missedCalls != null ? metrics.missedCalls.toString() : '0',
      change: metrics?.missedCallsChange || '0%',
      isPositive: false,
      timeframe: 'vs. previous 7 days',
      icon: PhoneMissed,
      iconBg: 'bg-[#F3E8FF]',
      iconColor: 'text-[#9333EA]',
    },
    {
      id: 'duration',
      title: 'Avg. Call Duration',
      value: metrics?.avgDuration || '0m 00s',
      change: metrics?.avgDurationChange || '0%',
      isPositive: true,
      timeframe: 'vs. previous 7 days',
      icon: Clock,
      iconBg: 'bg-[#FEF3C7]',
      iconColor: 'text-[#D97706]',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      {data.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E6E7EB] shadow-xs flex flex-col justify-between"
          >
            {/* Top Row: Title + Icon */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#6B7280]">
                {item.title}
              </span>
              <div
                className={`w-8 h-8 rounded-full ${item.iconBg} ${item.iconColor} flex items-center justify-center`}
              >
                <Icon className="w-4 h-4 stroke-[2]" />
              </div>
            </div>

            {/* Value */}
            <div className="text-2xl sm:text-3xl font-bold text-[#17243A] tracking-tight my-1">
              {item.value}
            </div>

            {/* Delta */}
            <div className="flex items-center gap-1.5 text-xs mt-1">
              <span
                className={`font-semibold flex items-center ${
                  item.isPositive ? 'text-[#15966B]' : 'text-[#DC2626]'
                }`}
              >
                {item.change}
              </span>
              <span className="text-[#6B7280] font-normal">
                {item.timeframe}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
