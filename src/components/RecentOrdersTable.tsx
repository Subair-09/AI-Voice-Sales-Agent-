import React, { useState, useEffect } from 'react';
import { ArrowRight, MoreVertical, CheckCircle, ExternalLink, Send, PackageOpen } from 'lucide-react';
import { safeFetchJson } from '../utils/api';

export interface OrderItem {
  id: string;
  customer: string;
  items: string;
  amount: string;
  paymentStatus: 'Paid' | 'Pending';
  status: 'Preparing' | 'Delivered' | 'Processing' | 'Pending';
  date: string;
}

interface RecentOrdersTableProps {
  onViewAll?: () => void;
  searchFilter?: string;
}

export const RecentOrdersTable: React.FC<RecentOrdersTableProps> = ({
  onViewAll,
  searchFilter = '',
}) => {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchRecentOrders = async () => {
      try {
        const data = await safeFetchJson('/api/admin/orders?limit=6');
        if (!isMounted) return;
        if (data && data.orders) {
          const mapped: OrderItem[] = data.orders.map((o: any) => ({
            id: o.orderId,
            customer: o.customerName || 'Guest Customer',
            items: o.itemsSummary || (o.items ? o.items.map((i: any) => `${i.quantity} × ${i.name}`).join(', ') : 'Order Items'),
            amount: o.amount || `₦${(o.totalAmount || 0).toLocaleString()}`,
            paymentStatus: o.paymentStatus === 'Paid' ? 'Paid' : 'Pending',
            status: o.status || 'Pending',
            date: o.date || 'Today',
          }));
          setOrders(mapped);
        }
      } catch {
        // Silently preserve orders during server reloads
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchRecentOrders();
    const interval = setInterval(fetchRecentOrders, 8000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const filteredOrders = orders.filter((order) => {
    if (!searchFilter) return true;
    const q = searchFilter.toLowerCase();
    return (
      order.id.toLowerCase().includes(q) ||
      order.customer.toLowerCase().includes(q) ||
      order.items.toLowerCase().includes(q)
    );
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E6E7EB] shadow-xs relative">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="absolute top-4 right-4 z-30 bg-[#17243A] text-white text-xs px-3.5 py-2 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150">
          <CheckCircle className="w-3.5 h-3.5 text-[#15966B]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Table Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#17243A]">
            Recent Orders
          </h2>
        </div>

        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-[#15966B] hover:text-[#0D8B68] flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead>
            <tr className="border-b border-[#F1F5F9] text-[#6B7280] font-semibold">
              <th className="pb-3 pr-4">Order ID</th>
              <th className="pb-3 pr-4">Customer</th>
              <th className="pb-3 pr-4">Items</th>
              <th className="pb-3 pr-4">Amount</th>
              <th className="pb-3 pr-4">Payment</th>
              <th className="pb-3 pr-4">Status</th>
              <th className="pb-3 pr-4">Date</th>
              <th className="pb-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F8FAFC]">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-xs text-[#6B7280]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <PackageOpen className="w-8 h-8 text-stone-300 stroke-[1.5]" />
                    <p className="font-medium text-stone-600">No orders recorded yet</p>
                    <p className="text-[11px] text-stone-400">Incoming online bakes and AI voice sales orders will appear here automatically.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const isMenuOpen = activeMenuId === order.id;

                return (
                  <tr key={order.id} className="hover:bg-[#FAF7F0]/60 transition-colors">
                    {/* Order ID */}
                    <td className="py-3.5 pr-4 font-semibold text-[#17243A]">
                      {order.id}
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 pr-4 text-[#17243A] font-medium">
                      {order.customer}
                    </td>

                    {/* Items */}
                    <td className="py-3.5 pr-4 text-[#475569]">
                      {order.items}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 pr-4 font-bold text-[#17243A]">
                      {order.amount}
                    </td>

                    {/* Payment Status */}
                    <td className="py-3.5 pr-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          order.paymentStatus === 'Paid'
                            ? 'bg-[#E8F7EF] text-[#15966B]'
                            : 'bg-[#FEF3C7] text-[#D97706]'
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 pr-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          order.status === 'Preparing'
                            ? 'bg-[#FEF3C7] text-[#D97706]'
                            : order.status === 'Delivered'
                            ? 'bg-[#E8F7EF] text-[#15966B]'
                            : order.status === 'Processing'
                            ? 'bg-[#E0F2FE] text-[#0284C7]'
                            : 'bg-[#FEF3C7] text-[#D97706]'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 pr-4 text-[#6B7280]">
                      {order.date}
                    </td>

                    {/* Actions Menu */}
                    <td className="py-3.5 text-right relative">
                      <button
                        onClick={() => setActiveMenuId(isMenuOpen ? null : order.id)}
                        className="p-1 hover:bg-stone-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                        aria-label="Order actions"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {isMenuOpen && (
                        <div className="absolute right-0 top-10 w-44 bg-white border border-[#E6E7EB] rounded-xl shadow-lg z-20 py-1 divide-y divide-[#F1F5F9] text-left">
                          <div className="py-1">
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                if (onViewAll) onViewAll();
                              }}
                              className="w-full px-3 py-1.5 text-xs text-[#17243A] hover:bg-[#FAF7F0] flex items-center gap-2"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                              <span>View Details</span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                showToast(`Payment link resent to ${order.customer}`);
                              }}
                              className="w-full px-3 py-1.5 text-xs text-[#17243A] hover:bg-[#FAF7F0] flex items-center gap-2"
                            >
                              <Send className="w-3.5 h-3.5 text-[#F9B91A]" />
                              <span>Resend Payment Link</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
