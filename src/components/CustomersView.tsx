import React, { useState, useEffect } from 'react';
import { Calendar, Download, ChevronDown } from 'lucide-react';
import { CustomerStatsCards } from './CustomerStatsCards';
import { CustomersListTable, CustomerRecord } from './CustomersListTable';
import { CustomerDetailsPanel } from './CustomerDetailsPanel';
import { BottomCtaCards } from './BottomCtaCards';
import { MessageCustomerModal } from './MessageCustomerModal';
import { safeFetchJson } from '../utils/api';

interface CustomersViewProps {
  onAgentSettings?: () => void;
  onManageProducts?: () => void;
  onViewOrders?: () => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  onAgentSettings,
  onManageProducts,
  onViewOrders,
}) => {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Customers');
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange] = useState('Jun 17, 2025 - Jun 24, 2025');
  const [isExporting, setIsExporting] = useState(false);

  // Modals & Notifications
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [activeMessagingCustomer, setActiveMessagingCustomer] = useState<CustomerRecord | null>(null);

  // Real-time polling & API fetching
  useEffect(() => {
    let isMounted = true;
    const fetchCustomers = async () => {
      try {
        const queryParams = new URLSearchParams({
          search: searchQuery,
          status: statusFilter,
          page: currentPage.toString(),
        });

        const data = await safeFetchJson(`/api/admin/customers?${queryParams.toString()}`);
        if (!isMounted || !data) return;
        setCustomers(data.customers || []);
        setMetrics(data.metrics || null);

        // Auto select first customer if none selected or if filtered
        if (data.customers && data.customers.length > 0) {
          if (!selectedCustomer || !data.customers.find((c: CustomerRecord) => c.id === selectedCustomer.id)) {
            setSelectedCustomer(data.customers[0]);
          }
        } else {
          setSelectedCustomer(null);
        }
      } catch {
        // Silently preserve customers during reloads
      }
    };

    fetchCustomers();

    // Polling every 10s to sync returning and new customers created via AI voice sales agent calls
    const interval = setInterval(fetchCustomers, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [searchQuery, statusFilter, currentPage]);

  const handleExportCustomers = () => {
    setIsExporting(true);
    window.location.href = '/api/admin/customers/export';
    setTimeout(() => setIsExporting(false), 1500);
  };

  const handleOpenMessage = (cust: CustomerRecord) => {
    setActiveMessagingCustomer(cust);
    setIsMessageModalOpen(true);
  };

  const handleDeactivateCustomer = async (cust: CustomerRecord) => {
    const nextStatus = cust.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await fetch(`/api/admin/customers/${cust.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      setCustomers((prev) =>
        prev.map((c) => (c.id === cust.id ? { ...c, status: nextStatus } : c))
      );
      if (selectedCustomer?.id === cust.id) {
        setSelectedCustomer({ ...selectedCustomer, status: nextStatus });
      }
    } catch (err) {
      console.error('Failed to deactivate customer', err);
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#17243A] tracking-tight">
            Customers
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-0.5">
            Manage your customer list, view details and track their order history.
          </p>
        </div>

        {/* Date Selector & Export Button */}
        <div className="flex items-center gap-3 self-start sm:self-auto select-none">
          {/* Date Range Selector */}
          <div className="flex items-center gap-2 bg-white border border-[#E6E7EB] px-3.5 py-2 rounded-xl shadow-xs text-xs font-semibold text-[#17243A] cursor-pointer hover:border-[#F9B91A] transition-colors">
            <Calendar className="w-4 h-4 text-[#17243A]" />
            <span>{dateRange}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B7280]" />
          </div>

          {/* Export Customers Button */}
          <button
            onClick={handleExportCustomers}
            disabled={isExporting}
            className="flex items-center gap-2 bg-white border border-[#E6E7EB] px-3.5 py-2 rounded-xl shadow-xs text-xs font-semibold text-[#17243A] hover:bg-stone-50 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#17243A]" />
            <span>{isExporting ? 'Exporting...' : 'Export Customers'}</span>
          </button>
        </div>
      </div>

      {/* 2. Customer Statistics (4 Metric Cards) */}
      <CustomerStatsCards metrics={metrics} />

      {/* 3. Main Split View: Customers List (Left 8 cols) + Customer Details Drawer (Right 4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
        {/* Left Column: Customers List Table & Bottom CTA Cards (Span 8) */}
        <div className="xl:col-span-8 flex flex-col space-y-5">
          <CustomersListTable
            customers={customers}
            selectedCustomerId={selectedCustomer?.id || ''}
            onSelectCustomer={(c) => setSelectedCustomer(c)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            totalCustomersCount={metrics?.totalCustomers || 48}
            onMessageCustomer={handleOpenMessage}
            onDeactivateCustomer={handleDeactivateCustomer}
          />

          {/* Bottom Two Cards (Matching reference screenshot exactly) */}
          <BottomCtaCards
            onAgentSettings={onAgentSettings}
            onManageProducts={onManageProducts}
            quickTipsTitle="Quick Tips"
            quickTipsDescription="Keep your customer data updated for better AI responses and personalized service."
            quickTipsActionLabel="Manage Customers"
            onQuickTipsAction={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>

        {/* Right Column: Customer Details Drawer / Panel (Span 4) */}
        <div className="xl:col-span-4 flex flex-col">
          <CustomerDetailsPanel
            customer={selectedCustomer}
            onClose={() => setSelectedCustomer(null)}
            onOpenMessageModal={(c) => handleOpenMessage(c)}
            onViewAllOrders={() => onViewOrders && onViewOrders()}
          />
        </div>
      </div>

      {/* Message Customer Modal */}
      <MessageCustomerModal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        customer={activeMessagingCustomer || selectedCustomer}
      />
    </div>
  );
};
