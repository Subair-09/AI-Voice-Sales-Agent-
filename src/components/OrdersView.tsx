import React, { useState, useEffect } from 'react';
import { Calendar, Download, ChevronDown } from 'lucide-react';
import { OrderStatsCards } from './OrderStatsCards';
import { OrdersListTable, OrderRecord } from './OrdersListTable';
import { OrderDetailsPanel } from './OrderDetailsPanel';
import { BottomCtaCards } from './BottomCtaCards';
import { safeFetchJson } from '../utils/api';

interface OrdersViewProps {
  onAgentSettings?: () => void;
  onManageProducts?: () => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  onAgentSettings,
  onManageProducts,
}) => {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('All Payment Methods');
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState('Jun 17, 2025 - Jun 24, 2025');
  const [isExporting, setIsExporting] = useState(false);

  // Real-time polling / API fetching
  useEffect(() => {
    let isMounted = true;
    const fetchOrders = async () => {
      try {
        const queryParams = new URLSearchParams({
          search: searchQuery,
          status: statusFilter,
          paymentMethod: paymentMethodFilter,
          page: currentPage.toString(),
        });

        const data = await safeFetchJson(`/api/admin/orders?${queryParams.toString()}`);
        if (!isMounted || !data) return;
        setOrders(data.orders || []);
        setMetrics(data.metrics || null);

        // Auto select first order if none selected or if filtered
        if (data.orders && data.orders.length > 0) {
          if (!selectedOrder || !data.orders.find((o: OrderRecord) => o.orderId === selectedOrder.orderId)) {
            setSelectedOrder(data.orders[0]);
          }
        } else {
          setSelectedOrder(null);
        }
      } catch {
        // Silently preserve orders during reloads
      }
    };

    fetchOrders();

    // Polling every 10 seconds to catch orders placed in real-time by the AI Sales Agent
    const interval = setInterval(fetchOrders, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [searchQuery, statusFilter, paymentMethodFilter, currentPage]);

  const handleExportOrders = () => {
    setIsExporting(true);
    window.location.href = '/api/admin/orders/export';
    setTimeout(() => setIsExporting(false), 1500);
  };

  const handleStatusChange = async (newStatus: OrderRecord['status']) => {
    if (!selectedOrder) return;
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success && data.order) {
        setSelectedOrder(data.order);
        setOrders((prev) =>
          prev.map((o) => (o.orderId === data.order.orderId ? data.order : o))
        );
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#17243A] tracking-tight">
            Orders
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-0.5">
            Manage all customer orders, track status and fulfillment.
          </p>
        </div>

        {/* Date Selector & Export Actions */}
        <div className="flex items-center gap-3 self-start sm:self-auto select-none">
          {/* Date Range Selector */}
          <div className="flex items-center gap-2 bg-white border border-[#E6E7EB] px-3.5 py-2 rounded-xl shadow-xs text-xs font-semibold text-[#17243A] cursor-pointer hover:border-[#F9B91A] transition-colors">
            <Calendar className="w-4 h-4 text-[#17243A]" />
            <span>{dateRange}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B7280]" />
          </div>

          {/* Export Orders Button */}
          <button
            onClick={handleExportOrders}
            disabled={isExporting}
            className="flex items-center gap-2 bg-white border border-[#E6E7EB] px-3.5 py-2 rounded-xl shadow-xs text-xs font-semibold text-[#17243A] hover:bg-stone-50 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#17243A]" />
            <span>{isExporting ? 'Exporting...' : 'Export Orders'}</span>
          </button>
        </div>
      </div>

      {/* 2. Four Order Statistics Cards */}
      <OrderStatsCards metrics={metrics} />

      {/* 3. Main Split View: Orders List Table (Left) + Order Details Panel (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
        {/* Left Column: Orders List Table & Bottom CTA Cards (Span 8) */}
        <div className="xl:col-span-8 flex flex-col space-y-5">
          <OrdersListTable
            orders={orders}
            selectedOrderId={selectedOrder?.orderId || ''}
            onSelectOrder={(o) => setSelectedOrder(o)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            paymentMethodFilter={paymentMethodFilter}
            onPaymentMethodFilterChange={setPaymentMethodFilter}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            totalOrdersCount={metrics?.totalOrders || 32}
          />

          {/* Bottom Two Cards (Exactly matching reference layout!) */}
          <BottomCtaCards
            onAgentSettings={onAgentSettings}
            onManageProducts={onManageProducts}
          />
        </div>

        {/* Right Column: Order Details Panel (Span 4) */}
        <div className="xl:col-span-4 flex flex-col">
          <OrderDetailsPanel
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onStatusChange={handleStatusChange}
          />
        </div>
      </div>
    </div>
  );
};
