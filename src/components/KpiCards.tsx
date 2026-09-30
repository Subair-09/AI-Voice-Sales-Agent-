import React, { useState, useEffect } from 'react';
import { Phone, Package, Check, Clock, User } from 'lucide-react';
import { safeFetchJson } from '../utils/api';

export const KpiCards: React.FC = () => {
  const [stats, setStats] = useState({
    totalCalls: 0,
    totalOrders: 0,
    paidOrders: 0,
    pendingPayments: 0,
    totalRevenue: '₦0',
  });

  useEffect(() => {
    let isMounted = true;
    const fetchKpis = async () => {
      try {
        const [callsData, ordersData, paymentsData] = await Promise.all([
          safeFetchJson('/api/admin/calls?limit=1'),
          safeFetchJson('/api/admin/orders?limit=1'),
          safeFetchJson('/api/admin/payments/stats'),
        ]);

        if (!isMounted) return;

        setStats((prev) => ({
          totalCalls: callsData?.metrics?.totalCalls ?? prev.totalCalls,
          totalOrders: ordersData?.metrics?.totalOrders ?? prev.totalOrders,
          paidOrders: ordersData?.metrics?.completedOrders ?? prev.paidOrders,
          pendingPayments: paymentsData?.pendingPayments ?? ordersData?.metrics?.pendingOrders ?? prev.pendingPayments,
          totalRevenue: paymentsData?.totalRevenue ?? prev.totalRevenue,
        }));
      } catch {
        // Silently preserve current stats during transient server reload
      }
    };

    fetchKpis();
    const interval = setInterval(fetchKpis, 8000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const kpis = [
    {
      id: 'calls',
      title: 'Total Calls',
      value: stats.totalCalls.toString(),
      change: '0%',
      isPositive: true,
      timeframe: 'vs. yesterday',
      icon: Phone,
      iconBg: 'bg-[#E8F7EF]',
      iconColor: 'text-[#15966B]',
    },
    {
      id: 'orders',
      title: 'Total Orders',
      value: stats.totalOrders.toString(),
      change: '0%',
      isPositive: true,
      timeframe: 'vs. yesterday',
      icon: Package,
      iconBg: 'bg-[#FEF3C7]',
      iconColor: 'text-[#D97706]',
    },
    {
      id: 'paid',
      title: 'Paid Orders',
      value: stats.paidOrders.toString(),
      change: '0%',
      isPositive: true,
      timeframe: 'vs. yesterday',
      icon: Check,
      iconBg: 'bg-[#D1FAE5]',
      iconColor: 'text-[#059669]',
    },
    {
      id: 'pending',
      title: 'Pending Payments',
      value: stats.pendingPayments.toString(),
      change: '0%',
      isPositive: false,
      timeframe: 'vs. yesterday',
      icon: Clock,
      iconBg: 'bg-[#FEE2E2]',
      iconColor: 'text-[#DC2626]',
    },
    {
      id: 'revenue',
      title: 'Total Revenue',
      value: stats.totalRevenue,
      change: '0%',
      isPositive: true,
      timeframe: 'vs. yesterday',
      icon: User,
      iconBg: 'bg-[#F3E8FF]',
      iconColor: 'text-[#9333EA]',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div
            key={kpi.id}
            className="bg-white rounded-2xl p-4 sm:p-4.5 border border-[#E6E7EB] shadow-xs flex flex-col justify-between"
          >
            {/* Top Icon in Circular Container */}
            <div className="mb-3">
              <div
                className={`w-9 h-9 rounded-full ${kpi.iconBg} ${kpi.iconColor} flex items-center justify-center`}
              >
                <Icon className="w-4 h-4 stroke-[2.2]" />
              </div>
            </div>

            {/* Title & Value */}
            <div>
              <div className="text-xs font-semibold text-[#6B7280]">
                {kpi.title}
              </div>
              <div className="text-2xl sm:text-[26px] font-bold text-[#17243A] tracking-tight mt-1 mb-2">
                {kpi.value}
              </div>
            </div>

            {/* Percentage delta */}
            <div className="flex items-center gap-1.5 text-xs">
              <span
                className={`font-semibold flex items-center ${
                  kpi.isPositive ? 'text-[#15966B]' : 'text-[#EF4444]'
                }`}
              >
                {kpi.isPositive ? '↑' : '↓'} {kpi.change}
              </span>
              <span className="text-[#6B7280] font-normal">
                {kpi.timeframe}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
