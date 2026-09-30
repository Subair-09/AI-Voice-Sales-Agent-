import React from 'react';
import { Users, UserPlus, RefreshCw, Heart } from 'lucide-react';

interface CustomerStatsProps {
  metrics?: {
    totalCustomers: number;
    totalCustomersChange: string;
    newCustomers: number;
    newCustomersChange: string;
    repeatCustomers: number;
    repeatCustomersChange: string;
    avgOrderValue: string;
    avgOrderValueChange: string;
  };
}

export const CustomerStatsCards: React.FC<CustomerStatsProps> = ({ metrics }) => {
  const cards = [
    {
      id: 'total',
      title: 'Total Customers',
      value: metrics?.totalCustomers != null ? metrics.totalCustomers.toString() : '0',
      change: metrics?.totalCustomersChange || '0%',
      isPositive: true,
      timeframe: 'vs. previous 7 days',
      icon: Users,
      iconBg: 'bg-[#E8F7EF]',
      iconColor: 'text-[#15966B]',
    },
    {
      id: 'new',
      title: 'New Customers',
      value: metrics?.newCustomers != null ? metrics.newCustomers.toString() : '0',
      change: metrics?.newCustomersChange || '0%',
      isPositive: true,
      timeframe: 'vs. previous 7 days',
      icon: UserPlus,
      iconBg: 'bg-[#F3E8FF]',
      iconColor: 'text-[#9333EA]',
    },
    {
      id: 'repeat',
      title: 'Repeat Customers',
      value: metrics?.repeatCustomers != null ? metrics.repeatCustomers.toString() : '0',
      change: metrics?.repeatCustomersChange || '0%',
      isPositive: true,
      timeframe: 'vs. previous 7 days',
      icon: RefreshCw,
      iconBg: 'bg-[#E0F2FE]',
      iconColor: 'text-[#0284C7]',
    },
    {
      id: 'aov',
      title: 'Avg. Order Value',
      value: metrics?.avgOrderValue || '₦0',
      change: metrics?.avgOrderValueChange || '0%',
      isPositive: true,
      timeframe: 'vs. previous 7 days',
      icon: Heart,
      iconBg: 'bg-[#FEF3C7]',
      iconColor: 'text-[#D97706]',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      {cards.map((item) => {
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
