import React, { useState, useEffect } from 'react';

interface DataPoint {
  date: string;
  revenueRaw: number;
  ordersRaw: number;
  revenueDisplay: string;
  ordersDisplay: string;
}

const generateLast7Days = (): DataPoint[] => {
  const days: DataPoint[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    days.push({
      date: dayStr,
      revenueRaw: 0,
      ordersRaw: 0,
      revenueDisplay: '₦0',
      ordersDisplay: '0 orders',
    });
  }
  return days;
};

export const SalesOverviewChart: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [data, setData] = useState<DataPoint[]>(generateLast7Days());

  useEffect(() => {
    fetch('/api/admin/orders?limit=100')
      .then((res) => res.json())
      .then((json) => {
        if (json && Array.isArray(json.orders)) {
          const freshDays = generateLast7Days();
          json.orders.forEach((ord: any) => {
            const dateStr = ord.createdAt || ord.date;
            if (!dateStr) return;
            const parsed = new Date(dateStr);
            if (isNaN(parsed.getTime())) return;
            const formatted = parsed.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            });
            const dayMatch = freshDays.find((d) => d.date === formatted);
            if (dayMatch) {
              dayMatch.ordersRaw += 1;
              const amt = typeof ord.totalAmount === 'number' ? ord.totalAmount : parseFloat(String(ord.totalAmount || 0).replace(/[^\d.]/g, '')) || 0;
              dayMatch.revenueRaw += amt;
            }
          });
          freshDays.forEach((d) => {
            d.revenueDisplay = `₦${d.revenueRaw.toLocaleString()}`;
            d.ordersDisplay = `${d.ordersRaw} orders`;
          });
          setData(freshDays);
        }
      })
      .catch((err) => console.log('Chart orders fetch:', err));
  }, []);

  const totalRevenue = data.reduce((acc, d) => acc + d.revenueRaw, 0);
  const totalOrders = data.reduce((acc, d) => acc + d.ordersRaw, 0);

  // SVG coordinate calculations
  const chartWidth = 540;
  const chartHeight = 220;
  const paddingLeft = 55;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;
  const maxVal = Math.max(10000, ...data.map((d) => d.revenueRaw));

  const points = data.map((d, i) => {
    const x = paddingLeft + (i / (data.length - 1)) * innerWidth;
    const yRevenue = paddingTop + innerHeight - (maxVal > 0 ? (d.revenueRaw / maxVal) * innerHeight : 0);
    const yOrders = paddingTop + innerHeight - (totalOrders > 0 ? (d.ordersRaw / Math.max(1, totalOrders)) * innerHeight : 0);
    return { ...d, x, yRevenue, yOrders };
  });

  const revenuePath = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.yRevenue}`, '');
  const ordersPath = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.yOrders}`, '');

  const yTicks = [
    { label: `₦${Math.round(maxVal / 1000)}k`, val: maxVal },
    { label: `₦${Math.round((maxVal * 0.75) / 1000)}k`, val: maxVal * 0.75 },
    { label: `₦${Math.round((maxVal * 0.5) / 1000)}k`, val: maxVal * 0.5 },
    { label: `₦${Math.round((maxVal * 0.25) / 1000)}k`, val: maxVal * 0.25 },
    { label: '₦0', val: 0 },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E6E7EB] shadow-xs flex-1 flex flex-col justify-between">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#17243A]">
            Sales Overview
          </h2>
          <p className="text-xs text-[#6B7280]">
            Revenue and orders for the last 7 days
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F9B91A]" />
            <span className="text-[#17243A]">Revenue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#15966B]" />
            <span className="text-[#17243A]">Orders</span>
          </div>
        </div>
      </div>

      {/* SVG Chart Graphic */}
      <div className="relative w-full aspect-[21/9] sm:aspect-[24/10] min-h-[190px]">
        {totalRevenue === 0 && totalOrders === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 pointer-events-none z-10">
            <span className="text-xs font-medium text-stone-500 bg-white/90 px-3 py-1.5 rounded-full border border-stone-200 shadow-xs">
              No sales recorded in the past 7 days
            </span>
          </div>
        )}

        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-full overflow-visible select-none"
        >
          {/* Grid lines & Y Axis Labels */}
          {yTicks.map((tick, i) => {
            const y = paddingTop + innerHeight - (maxVal > 0 ? (tick.val / maxVal) * innerHeight : 0);
            return (
              <g key={i}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={chartWidth - paddingRight}
                  y2={y}
                  stroke="#F1F5F9"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  className="text-[10px] fill-[#94A3B8] font-sans font-medium"
                >
                  {tick.label}
                </text>
              </g>
            );
          })}

          {/* Orders Line (Green) */}
          <path
            d={ordersPath}
            fill="none"
            stroke="#15966B"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Revenue Line (Golden Yellow) */}
          <path
            d={revenuePath}
            fill="none"
            stroke="#F9B91A"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {points.map((p, i) => {
            const isHovered = hoveredIndex === i;
            return (
              <g
                key={i}
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Vertical hover guide */}
                {isHovered && (
                  <line
                    x1={p.x}
                    y1={paddingTop}
                    x2={p.x}
                    y2={paddingTop + innerHeight}
                    stroke="#E2E8F0"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                )}

                {/* Orders Dot */}
                <circle
                  cx={p.x}
                  cy={p.yOrders}
                  r={isHovered ? 5 : 3.5}
                  fill="#15966B"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                  className="transition-all duration-150"
                />

                {/* Revenue Dot */}
                <circle
                  cx={p.x}
                  cy={p.yRevenue}
                  r={isHovered ? 5 : 3.5}
                  fill="#F9B91A"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                  className="transition-all duration-150"
                />

                {/* X Axis Date Label */}
                <text
                  x={p.x}
                  y={chartHeight - 14}
                  textAnchor="middle"
                  className={`text-[11px] font-sans font-medium transition-colors ${
                    isHovered ? 'fill-[#17243A] font-bold' : 'fill-[#6B7280]'
                  }`}
                >
                  {p.date}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Popup */}
        {hoveredIndex !== null && (
          <div
            className="absolute z-20 bg-[#17243A] text-white p-2.5 rounded-xl shadow-lg text-[11px] pointer-events-none transform -translate-x-1/2 -translate-y-full"
            style={{
              left: `${(points[hoveredIndex].x / chartWidth) * 100}%`,
              top: `${(points[hoveredIndex].yRevenue / chartHeight) * 100 - 12}%`,
            }}
          >
            <div className="font-bold text-gray-200 mb-1 border-b border-gray-700 pb-1">
              {data[hoveredIndex].date}
            </div>
            <div className="flex items-center gap-1.5 text-[#F9B91A]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F9B91A]" />
              <span>Revenue: {data[hoveredIndex].revenueDisplay}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#34D399]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
              <span>Orders: {data[hoveredIndex].ordersDisplay}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
