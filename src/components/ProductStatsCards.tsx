import React from 'react';
import { Package, ShoppingCart, Coins, Star } from 'lucide-react';

interface ProductStatsProps {
  metrics?: {
    totalProducts?: number;
    totalProductsChange?: string;
    totalSold?: number;
    totalSoldChange?: string;
    totalRevenue?: string;
    totalRevenueChange?: string;
    avgProductPrice?: string;
    avgProductPriceChange?: string;
  };
}

export const ProductStatsCards: React.FC<ProductStatsProps> = ({ metrics }) => {
  const cards = [
    {
      id: 'total-products',
      title: 'Total Products',
      value: metrics?.totalProducts != null ? metrics.totalProducts.toString() : '0',
      change: metrics?.totalProductsChange || '0%',
      isPositive: true,
      timeframe: 'vs. previous 7 days',
      icon: Package,
      iconBg: 'bg-[#E8F7EF]',
      iconColor: 'text-[#15966B]',
    },
    {
      id: 'total-sold',
      title: 'Total Sold',
      value: metrics?.totalSold != null ? metrics.totalSold.toString() : '0',
      change: metrics?.totalSoldChange || '0%',
      isPositive: true,
      timeframe: 'vs. previous 7 days',
      icon: ShoppingCart,
      iconBg: 'bg-[#F3E8FF]',
      iconColor: 'text-[#9333EA]',
    },
    {
      id: 'total-revenue',
      title: 'Total Revenue',
      value: metrics?.totalRevenue || '₦0',
      change: metrics?.totalRevenueChange || '0%',
      isPositive: true,
      timeframe: 'vs. previous 7 days',
      icon: Coins,
      iconBg: 'bg-[#E0F2FE]',
      iconColor: 'text-[#0284C7]',
    },
    {
      id: 'avg-price',
      title: 'Avg. Product Price',
      value: metrics?.avgProductPrice || '₦0',
      change: metrics?.avgProductPriceChange || '0%',
      isPositive: true,
      timeframe: 'vs. previous 7 days',
      icon: Star,
      iconBg: 'bg-[#FEF3C7]',
      iconColor: 'text-[#D97706]',
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
