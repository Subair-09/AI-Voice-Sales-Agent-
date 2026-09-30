import React from 'react';
import { CreditCard, Wallet, Clock, AlertCircle } from 'lucide-react';
import { PaymentStats } from '../types/payment';

interface PaymentStatsCardsProps {
  metrics?: Partial<PaymentStats>;
}

export const PaymentStatsCards: React.FC<PaymentStatsCardsProps> = ({ metrics }) => {
  const cards = [
    {
      id: 'total-revenue',
      title: 'Total Revenue',
      value: metrics?.totalRevenue || '₦0',
      change: metrics?.totalRevenueChange || '0%',
      isPositive: true,
      timeframe: metrics?.timeframe || 'vs. previous 7 days',
      icon: CreditCard,
      iconBg: 'bg-[#E8F7EF]',
      iconColor: 'text-[#15966B]',
    },
    {
      id: 'successful-payments',
      title: 'Successful Payments',
      value: metrics?.successfulPayments != null ? metrics.successfulPayments.toString() : '0',
      change: metrics?.successfulPaymentsChange || '0%',
      isPositive: true,
      timeframe: metrics?.timeframe || 'vs. previous 7 days',
      icon: Wallet,
      iconBg: 'bg-[#E0F2FE]',
      iconColor: 'text-[#0284C7]',
    },
    {
      id: 'pending-payments',
      title: 'Pending Payments',
      value: metrics?.pendingPayments != null ? metrics.pendingPayments.toString() : '0',
      change: metrics?.pendingPaymentsChange || '0%',
      isPositive: false,
      isPendingWarning: true,
      timeframe: metrics?.timeframe || 'vs. previous 7 days',
      icon: Clock,
      iconBg: 'bg-[#FEF3C7]',
      iconColor: 'text-[#D97706]',
    },
    {
      id: 'failed-payments',
      title: 'Failed Payments',
      value: metrics?.failedPayments != null ? metrics.failedPayments.toString() : '0',
      change: metrics?.failedPaymentsChange || '0%',
      isPositive: false,
      isFailedWarning: true,
      timeframe: metrics?.timeframe || 'vs. previous 7 days',
      icon: AlertCircle,
      iconBg: 'bg-[#FEE2E2]',
      iconColor: 'text-[#DC2626]',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
