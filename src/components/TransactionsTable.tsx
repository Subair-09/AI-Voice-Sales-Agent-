import React, { useState } from 'react';
import {
  Search,
  ChevronDown,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Eye,
  Download,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { PaymentRecord } from '../types/payment';

interface TransactionsTableProps {
  payments: PaymentRecord[];
  selectedPaymentId: string;
  onSelectPayment: (payment: PaymentRecord) => void;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  paymentMethodFilter: string;
  onPaymentMethodFilterChange: (val: string) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  totalTransactionsCount?: number;
  onViewOrder?: (orderId: string) => void;
  onDownloadReceipt?: (payment: PaymentRecord) => void;
  onRetryPayment?: (payment: PaymentRecord) => void;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  payments,
  selectedPaymentId,
  onSelectPayment,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  paymentMethodFilter,
  onPaymentMethodFilterChange,
  currentPage,
  onPageChange,
  totalTransactionsCount = 0,
  onViewOrder,
  onDownloadReceipt,
  onRetryPayment,
}) => {
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const statusOptions = ['All Statuses', 'Successful', 'Pending', 'Failed'];
  const paymentMethodOptions = ['All Payment Methods', 'Paystack'];

  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalTransactionsCount / itemsPerPage) || 1;
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalTransactionsCount);

  const handleCopyRef = (e: React.MouseEvent, ref: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(ref);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E6E7EB] shadow-xs flex flex-col justify-between overflow-hidden">
      <div>
        {/* Table Top Header & Controls */}
        <div className="p-4 sm:p-5 border-b border-[#F3F4F6] flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h3 className="text-base sm:text-lg font-bold text-[#17243A]">Transactions</h3>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Bar */}
            <div className="relative min-w-[240px] sm:min-w-[280px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search by reference, customer or email..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#FAF7F0] border border-[#E6E7EB] text-[#17243A] placeholder-[#9CA3AF] focus:outline-hidden focus:ring-1 focus:ring-[#F9B91A] focus:border-[#F9B91A] transition-all"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => onStatusFilterChange(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 text-xs font-semibold rounded-xl bg-[#FAF7F0] border border-[#E6E7EB] text-[#17243A] cursor-pointer hover:bg-[#F3EFE6] transition-colors focus:outline-hidden focus:ring-1 focus:ring-[#F9B91A]"
              >
                {statusOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
            </div>

            {/* Payment Method Filter */}
            <div className="relative">
              <select
                value={paymentMethodFilter}
                onChange={(e) => onPaymentMethodFilterChange(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 text-xs font-semibold rounded-xl bg-[#FAF7F0] border border-[#E6E7EB] text-[#17243A] cursor-pointer hover:bg-[#F3EFE6] transition-colors focus:outline-hidden focus:ring-1 focus:ring-[#F9B91A]"
              >
                {paymentMethodOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#F3F4F6] text-[#6B7280] font-semibold bg-[#FAFAFA]">
                <th className="py-3 px-4 sm:px-5">Date & Time</th>
                <th className="py-3 px-3">Reference</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Payment Method</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#6B7280]">
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <p className="font-semibold text-[#17243A]">No transactions found</p>
                      <p className="text-[11px] text-[#9CA3AF]">
                        Try adjusting your search or filters.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                payments.map((payment) => {
                  const isSelected = selectedPaymentId === payment.id;
                  const isSuccess = payment.status === 'Successful';
                  const isPending = payment.status === 'Pending';
                  const isFailed = payment.status === 'Failed';

                  return (
                    <tr
                      key={payment.id}
                      onClick={() => onSelectPayment(payment)}
                      className={`hover:bg-[#FAF7F0]/60 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#FFF8EC] border-l-4 border-l-[#F9B91A]'
                          : ''
                      }`}
                    >
                      {/* Date & Time */}
                      <td className="py-3.5 px-4 sm:px-5 text-[#17243A] font-medium whitespace-nowrap">
                        {payment.dateTime}
                      </td>

                      {/* Reference */}
                      <td className="py-3.5 px-3 font-semibold text-[#17243A] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{payment.transactionReference}</span>
                          <button
                            onClick={(e) => handleCopyRef(e, payment.transactionReference, payment.id)}
                            title="Copy reference"
                            className="text-[#9CA3AF] hover:text-[#17243A] p-0.5 rounded cursor-pointer"
                          >
                            {copiedId === payment.id ? (
                              <Check className="w-3 h-3 text-[#15966B]" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-full ${payment.avatarBg} ${payment.avatarColor} text-[11px] font-bold flex items-center justify-center shrink-0`}
                          >
                            {payment.customerInitials}
                          </div>
                          <div>
                            <span className="font-semibold text-[#17243A] block">
                              {payment.customerName}
                            </span>
                            <span className="text-[11px] text-[#9CA3AF] block">
                              {payment.customerPhone}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-3 font-bold text-[#17243A] whitespace-nowrap">
                        {payment.formattedAmount}
                      </td>

                      {/* Payment Method */}
                      <td className="py-3.5 px-3 text-[#4B5563] font-medium whitespace-nowrap">
                        {payment.paymentMethod}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            isSuccess
                              ? 'bg-[#E8F7EF] text-[#15966B]'
                              : isPending
                              ? 'bg-[#FEF3C7] text-[#D97706]'
                              : 'bg-[#FEE2E2] text-[#DC2626]'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isSuccess
                                ? 'bg-[#15966B]'
                                : isPending
                                ? 'bg-[#D97706]'
                                : 'bg-[#DC2626]'
                            }`}
                          />
                          {payment.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right relative whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenActionId(openActionId === payment.id ? null : payment.id);
                          }}
                          className="w-8 h-8 rounded-lg hover:bg-black/5 flex items-center justify-center text-[#6B7280] hover:text-[#17243A] ml-auto transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Action Menu Dropdown */}
                        {openActionId === payment.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-4 top-11 z-30 w-44 bg-white rounded-xl shadow-lg border border-[#E6E7EB] py-1.5 text-left animate-in fade-in zoom-in-95 duration-100"
                          >
                            <button
                              onClick={() => {
                                onSelectPayment(payment);
                                setOpenActionId(null);
                              }}
                              className="w-full px-3.5 py-2 text-xs font-semibold text-[#17243A] hover:bg-[#FAF7F0] flex items-center gap-2 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#6B7280]" />
                              View Transaction
                            </button>

                            {payment.orderId && (
                              <button
                                onClick={() => {
                                  onViewOrder?.(payment.orderId);
                                  setOpenActionId(null);
                                }}
                                className="w-full px-3.5 py-2 text-xs font-semibold text-[#17243A] hover:bg-[#FAF7F0] flex items-center gap-2 cursor-pointer"
                              >
                                <ExternalLink className="w-3.5 h-3.5 text-[#6B7280]" />
                                View Order ({payment.orderId})
                              </button>
                            )}

                            <button
                              onClick={() => {
                                onDownloadReceipt?.(payment);
                                setOpenActionId(null);
                              }}
                              className="w-full px-3.5 py-2 text-xs font-semibold text-[#17243A] hover:bg-[#FAF7F0] flex items-center gap-2 cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5 text-[#6B7280]" />
                              Download Receipt
                            </button>

                            {(isPending || isFailed) && (
                              <button
                                onClick={() => {
                                  onRetryPayment?.(payment);
                                  setOpenActionId(null);
                                }}
                                className="w-full px-3.5 py-2 text-xs font-semibold text-[#D97706] hover:bg-[#FEF3C7]/40 flex items-center gap-2 cursor-pointer"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                Re-query Gateway
                              </button>
                            )}
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

      {/* Pagination Bar */}
      <div className="p-4 sm:p-5 border-t border-[#F3F4F6] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <span className="text-[#6B7280] font-medium">
          Showing {payments.length > 0 ? startItem : 0} - {endItem} of {totalTransactionsCount} transactions
        </span>

        <div className="flex items-center gap-1.5 select-none">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="w-8 h-8 rounded-lg border border-[#E6E7EB] hover:bg-[#FAF7F0] flex items-center justify-center text-[#6B7280] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentPage === pageNum
                  ? 'bg-[#F9B91A] text-[#17243A] shadow-xs'
                  : 'border border-[#E6E7EB] text-[#6B7280] hover:bg-[#FAF7F0]'
              }`}
            >
              {pageNum}
            </button>
          ))}

          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="w-8 h-8 rounded-lg border border-[#E6E7EB] hover:bg-[#FAF7F0] flex items-center justify-center text-[#6B7280] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
