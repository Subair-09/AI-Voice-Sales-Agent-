import React, { useState } from 'react';
import { Search, ChevronDown, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';

export interface OrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  image?: string;
}

export interface TimelineStep {
  step: string;
  timestamp: string;
  status: 'completed' | 'active' | 'pending';
}

export interface OrderRecord {
  orderId: string;
  customerName: string;
  phoneNumber: string;
  customerPhone?: string;
  email?: string;
  customerEmail?: string;
  deliveryAddress: string;
  itemsSummary: string;
  items: OrderItem[];
  amount: string;
  totalAmount: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: 'Paid' | 'Pending' | 'Failed' | 'Refunded';
  paymentReference?: string;
  status: 'Preparing' | 'Processing' | 'Pending' | 'Completed' | 'Delivered';
  date: string;
  fullDate: string;
  time: string;
  notes: string;
  timeline: TimelineStep[];
  callId?: string;
  isAppointment?: boolean;
  appointmentDate?: string;
  appointmentTime?: string;
  orderType?: string;
}

interface OrdersListTableProps {
  orders: OrderRecord[];
  selectedOrderId: string;
  onSelectOrder: (order: OrderRecord) => void;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  paymentMethodFilter: string;
  onPaymentMethodFilterChange: (val: string) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  totalOrdersCount?: number;
}

export const OrdersListTable: React.FC<OrdersListTableProps> = ({
  orders,
  selectedOrderId,
  onSelectOrder,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  paymentMethodFilter,
  onPaymentMethodFilterChange,
  currentPage,
  onPageChange,
  totalOrdersCount = 0,
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const statuses = [
    'All Statuses',
    'Appointments',
    'Preparing',
    'Processing',
    'Pending',
    'Completed',
    'Delivered',
  ];
  const paymentMethods = ['All Payment Methods', 'Paystack', 'Bank Transfer', 'Cash on Delivery'];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Preparing':
        return 'bg-[#FEF3C7] text-[#D97706]';
      case 'Processing':
        return 'bg-[#E0F2FE] text-[#0284C7]';
      case 'Pending':
        return 'bg-[#FEF9C3] text-[#CA8A04]';
      case 'Completed':
      case 'Delivered':
      default:
        return 'bg-[#E8F7EF] text-[#15966B]';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E6E7EB] shadow-xs flex flex-col justify-between">
      {/* Table Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-5">
        <h2 className="text-base sm:text-lg font-bold text-[#17243A]">
          Orders List
        </h2>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search field */}
          <div className="relative min-w-[220px] sm:min-w-[280px]">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by order ID, customer name or phone..."
              className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-[#E6E7EB] rounded-xl text-[#17243A] placeholder-[#94A3B8] focus:outline-none focus:border-[#F9B91A]"
            />
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="appearance-none h-9 pl-3 pr-8 text-xs font-medium bg-white border border-[#E6E7EB] rounded-xl text-[#17243A] focus:outline-none focus:border-[#F9B91A] cursor-pointer"
            >
              {statuses.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B7280] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Payment Method Dropdown */}
          <div className="relative">
            <select
              value={paymentMethodFilter}
              onChange={(e) => onPaymentMethodFilterChange(e.target.value)}
              className="appearance-none h-9 pl-3 pr-8 text-xs font-medium bg-white border border-[#E6E7EB] rounded-xl text-[#17243A] focus:outline-none focus:border-[#F9B91A] cursor-pointer"
            >
              {paymentMethods.map((pm) => (
                <option key={pm} value={pm}>
                  {pm}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B7280] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table Component */}
      <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead>
            <tr className="border-b border-[#F1F5F9] text-[#6B7280] font-semibold">
              <th className="pb-3.5 pr-4">Order ID</th>
              <th className="pb-3.5 pr-4">Customer</th>
              <th className="pb-3.5 pr-4">Items</th>
              <th className="pb-3.5 pr-4">Amount</th>
              <th className="pb-3.5 pr-4">Payment Method</th>
              <th className="pb-3.5 pr-4">Status</th>
              <th className="pb-3.5 pr-4">Date</th>
              <th className="pb-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F8FAFC]">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-xs text-[#6B7280]">
                  No orders recorded yet. When customer orders are created via the voice agent or store, they will appear here.
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const isSelected = selectedOrderId === order.orderId;

                return (
                  <tr
                    key={order.orderId}
                    onClick={() => onSelectOrder(order)}
                    className={`transition-colors cursor-pointer select-none ${
                      isSelected
                        ? 'bg-[#FAF7F0] font-medium'
                        : 'hover:bg-[#FAF7F0]/60'
                    }`}
                  >
                    {/* Order ID & Appointment Indicator */}
                  <td className="py-3.5 pr-4 font-bold text-[#17243A]">
                    <div className="flex flex-col items-start gap-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span>{order.orderId}</span>
                        {(order.isAppointment || order.appointmentDate || order.orderType?.toLowerCase().includes('appointment')) && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                            📅 Appointment
                          </span>
                        )}
                      </div>
                      {(order.isAppointment || order.appointmentDate) && (
                        <span className="text-[10px] font-medium text-[#B45309]">
                          {order.appointmentDate || 'Tomorrow'} {order.appointmentTime ? `• ${order.appointmentTime}` : ''}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Customer Information (Name, Phone, Email) */}
                  <td className="py-3.5 pr-4 text-[#17243A]">
                    <div className="flex flex-col">
                      <span className="font-semibold text-[#17243A]">{order.customerName}</span>
                      {(order.phoneNumber || order.customerPhone || order.email || order.customerEmail) && (
                        <div className="flex items-center gap-1.5 text-[11px] text-[#64748B] mt-0.5 font-normal">
                          <span>{order.phoneNumber || order.customerPhone}</span>
                          {(order.email || order.customerEmail) && (
                            <>
                              <span className="text-[#CBD5E1]">•</span>
                              <span className="truncate max-w-[120px]">{order.email || order.customerEmail}</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Items */}
                  <td className="py-3.5 pr-4 text-[#475569]">
                    {order.itemsSummary}
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 pr-4 font-bold text-[#17243A]">
                    {order.amount}
                  </td>

                  {/* Payment Method */}
                  <td className="py-3.5 pr-4 text-[#475569]">
                    {order.paymentMethod}
                  </td>

                  {/* Status Pill */}
                  <td className="py-3.5 pr-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="py-3.5 pr-4 text-[#6B7280]">
                    {order.date}
                  </td>

                  {/* Action Menu */}
                  <td className="py-3.5 text-right relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === order.orderId ? null : order.orderId);
                      }}
                      className="p-1 rounded-lg hover:bg-gray-100 text-[#94A3B8] hover:text-[#17243A] transition-colors"
                      aria-label="Actions"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenuId === order.orderId && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-10 w-40 bg-white rounded-xl shadow-xl border border-[#E6E7EB] py-1 z-30 text-left"
                      >
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            onSelectOrder(order);
                          }}
                          className="w-full px-3 py-1.5 text-xs text-[#17243A] hover:bg-[#FAF7F0] flex items-center gap-2"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            alert(`Printing packing slip for Order #${order.orderId}`);
                          }}
                          className="w-full px-3 py-1.5 text-xs text-[#17243A] hover:bg-[#FAF7F0] flex items-center gap-2"
                        >
                          Print Slip
                        </button>
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

      {/* Pagination Footer */}
      <div className="pt-4 mt-2 border-t border-[#F1F5F9] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#6B7280]">
        <div>
          {totalOrdersCount > 0 ? (
            <>Showing 1 - {orders.length} of {totalOrdersCount} orders</>
          ) : (
            <>0 orders recorded</>
          )}
        </div>

        <div className="flex items-center gap-1.5 self-center sm:self-auto select-none">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            className="w-7 h-7 rounded-lg border border-[#E6E7EB] flex items-center justify-center hover:bg-stone-50 text-gray-500 cursor-pointer disabled:opacity-40"
            disabled={currentPage <= 1}
            aria-label="Previous page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {Array.from({ length: Math.max(1, Math.ceil(totalOrdersCount / 10)) }, (_, i) => i + 1).map((p) => {
            const isActive = currentPage === p;
            return (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#F9B91A] text-[#17243A] font-bold shadow-xs'
                    : 'text-gray-600 hover:bg-stone-100'
                }`}
              >
                {p}
              </button>
            );
          })}

          <button
            onClick={() => onPageChange(Math.min(Math.max(1, Math.ceil(totalOrdersCount / 10)), currentPage + 1))}
            className="w-7 h-7 rounded-lg border border-[#E6E7EB] flex items-center justify-center hover:bg-stone-50 text-gray-500 cursor-pointer disabled:opacity-40"
            disabled={currentPage >= Math.max(1, Math.ceil(totalOrdersCount / 10))}
            aria-label="Next page"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
