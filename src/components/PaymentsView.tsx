import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Download, RefreshCw, Settings, Lightbulb, ArrowRight } from 'lucide-react';
import { PaymentStatsCards } from './PaymentStatsCards';
import { TransactionsTable } from './TransactionsTable';
import { TransactionDetailsDrawer } from './TransactionDetailsDrawer';
import { PaymentReceiptModal } from './PaymentReceiptModal';
import { BananaIcon } from './BananaLogo';
import { PaymentRecord, PaymentStats, ReceiptData } from '../types/payment';
import { safeFetchJson } from '../utils/api';

interface PaymentsViewProps {
  onAgentSettings?: () => void;
  onViewOrders?: (orderId?: string) => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  onAgentSettings,
  onViewOrders,
}) => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [stats, setStats] = useState<Partial<PaymentStats>>({
    totalRevenue: '₦0',
    totalRevenueChange: '0%',
    successfulPayments: 0,
    successfulPaymentsChange: '0%',
    pendingPayments: 0,
    pendingPaymentsChange: '0%',
    failedPayments: 0,
    failedPaymentsChange: '0%',
    timeframe: 'vs. previous 7 days',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('All Payment Methods');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Receipt Modal State
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [isReceiptLoading, setIsReceiptLoading] = useState(false);

  // Date range selector state
  const [dateRange] = useState('Jun 17, 2025 - Jun 24, 2025');

  // Fetch payments from backend API
  const fetchPayments = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchQuery,
        status: statusFilter,
        paymentMethod: paymentMethodFilter,
      });

      const data = await safeFetchJson(`/api/admin/payments?${params.toString()}`);
      if (data) {
        setPayments(data.payments || []);
        setTotalCount(data.totalCount || 0);

        if (data.metrics) {
          setStats(data.metrics);
        }

        // Set initial selected payment if not set or if current selected is no longer in view
        if (data.payments && data.payments.length > 0) {
          setSelectedPayment((prev) => {
            if (!prev) return data.payments[0];
            const found = data.payments.find((p: PaymentRecord) => p.id === prev.id);
            return found || data.payments[0];
          });
        } else {
          setSelectedPayment(null);
        }
      }
    } catch {
      // Silently preserve payments during server reloads
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, statusFilter, paymentMethodFilter]);

  // Initial load & when filters change
  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Polling for live updates every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPayments();
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchPayments]);

  // Handle Export to CSV
  const handleExportPayments = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        paymentMethod: paymentMethodFilter,
        search: searchQuery,
      });
      window.location.href = `/api/admin/payments/export?${params.toString()}`;
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setTimeout(() => setIsExporting(false), 1000);
    }
  };

  // Open validated receipt modal
  const handleDownloadReceipt = async (payment: PaymentRecord) => {
    setIsReceiptLoading(true);
    setIsReceiptOpen(true);
    try {
      const response = await fetch(`/api/admin/payments/${payment.id}/receipt`);
      if (response.ok) {
        const data = await response.json();
        setReceiptData(data);
      }
    } catch (err) {
      console.error('Failed to load receipt:', err);
    } finally {
      setIsReceiptLoading(false);
    }
  };

  // Notes update callback
  const handleNotesUpdated = (paymentId: string, newNotes: string) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === paymentId ? { ...p, notes: newNotes } : p))
    );
    if (selectedPayment?.id === paymentId) {
      setSelectedPayment((prev) => (prev ? { ...prev, notes: newNotes } : null));
    }
  };

  // Payment retried callback
  const handlePaymentRetried = (updatedPayment: PaymentRecord) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === updatedPayment.id ? updatedPayment : p))
    );
    setSelectedPayment(updatedPayment);
    fetchPayments(); // Refresh stats
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#17243A] tracking-tight">
            Payments
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
            Track payments, view transactions and manage your revenue.
          </p>
        </div>

        {/* Date Selector & Export Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date Range Badge */}
          <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-[#E6E7EB] text-xs font-semibold text-[#17243A] shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-[#6B7280]" />
            <span>{dateRange}</span>
          </div>

          {/* Export Payments Button */}
          <button
            onClick={handleExportPayments}
            disabled={isExporting}
            className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-[#FAF7F0] border border-[#E6E7EB] rounded-xl text-xs font-bold text-[#17243A] transition-all shadow-2xs cursor-pointer active:scale-98"
          >
            <Download className="w-3.5 h-3.5 text-[#6B7280]" />
            <span>{isExporting ? 'Exporting...' : 'Export Payments'}</span>
          </button>

          {/* Manual Refresh Indicator */}
          <button
            onClick={() => fetchPayments()}
            title="Refresh Transactions"
            className="w-9 h-9 flex items-center justify-center bg-white hover:bg-[#FAF7F0] border border-[#E6E7EB] rounded-xl text-[#6B7280] hover:text-[#17243A] transition-all shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#F9B91A]' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Four Payment Metric Cards */}
      <PaymentStatsCards metrics={stats} />

      {/* 3. Main Workspace: Table + Details Drawer */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left Column: Transactions Table */}
        <div className={selectedPayment ? 'xl:col-span-8' : 'xl:col-span-12'}>
          <TransactionsTable
            payments={payments}
            selectedPaymentId={selectedPayment?.id || ''}
            onSelectPayment={(p) => setSelectedPayment(p)}
            searchQuery={searchQuery}
            onSearchChange={(val) => {
              setSearchQuery(val);
              setCurrentPage(1);
            }}
            statusFilter={statusFilter}
            onStatusFilterChange={(val) => {
              setStatusFilter(val);
              setCurrentPage(1);
            }}
            paymentMethodFilter={paymentMethodFilter}
            onPaymentMethodFilterChange={(val) => {
              setPaymentMethodFilter(val);
              setCurrentPage(1);
            }}
            currentPage={currentPage}
            onPageChange={(page) => setCurrentPage(page)}
            totalTransactionsCount={totalCount}
            onViewOrder={(orderId) => onViewOrders?.(orderId)}
            onDownloadReceipt={handleDownloadReceipt}
            onRetryPayment={handlePaymentRetried}
          />
        </div>

        {/* Right Column: Transaction Details Drawer */}
        {selectedPayment && (
          <div className="xl:col-span-4 sticky top-6">
            <TransactionDetailsDrawer
              payment={selectedPayment}
              onClose={() => setSelectedPayment(null)}
              onViewOrder={(orderId) => onViewOrders?.(orderId)}
              onDownloadReceipt={handleDownloadReceipt}
              onNotesUpdated={handleNotesUpdated}
              onPaymentRetried={handlePaymentRetried}
            />
          </div>
        )}
      </div>

      {/* 4. Bottom Information Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Card: Keep Your Payments Smooth */}
        <div className="lg:col-span-7 bg-[#FFF8EC] rounded-2xl p-4 sm:p-5 border border-[#FEEBC8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#FFE39A] flex items-center justify-center shrink-0">
              <BananaIcon size={22} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#17243A] leading-tight">
                Keep Your Payments Smooth
              </h4>
              <p className="text-xs text-[#6B7280] leading-snug mt-0.5 max-w-md">
                Monitor transactions, resolve issues and keep your revenue flowing with real-time payment tracking.
              </p>
            </div>
          </div>

          <button
            onClick={onAgentSettings}
            className="self-start sm:self-center px-3.5 py-2 rounded-xl bg-[#FFE39A] hover:bg-[#F9B91A] active:scale-[0.99] border border-[#FEEBC8] text-[#17243A] font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 stroke-[2]" />
            <span>View Payment Settings</span>
            <ArrowRight className="w-3 h-3 stroke-[2.5]" />
          </button>
        </div>

        {/* Right Card: Quick Tips */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-4 sm:p-5 border border-[#E6E7EB] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E8F7EF] text-[#15966B] flex items-center justify-center shrink-0">
              <Lightbulb className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#17243A] leading-tight">
                Quick Tips
              </h4>
              <p className="text-xs text-[#6B7280] leading-snug mt-0.5">
                Ensure your Paystack webhook is properly configured to receive instant payment updates.
              </p>
            </div>
          </div>

          <button
            onClick={onAgentSettings}
            className="self-start sm:self-center px-3.5 py-2 rounded-xl bg-[#FAF7F0] hover:bg-[#F3EFE6] border border-[#E6E7EB] text-[#17243A] font-semibold text-xs flex items-center gap-1 transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <span>Manage Settings</span>
            <ArrowRight className="w-3 h-3 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* 5. Official Receipt Modal */}
      <PaymentReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        receipt={receiptData}
        isLoading={isReceiptLoading}
      />
    </div>
  );
};
