import React, { useState, useEffect } from 'react';
import { Calendar, Download, ChevronDown } from 'lucide-react';
import { CallMetricsCards } from './CallMetricsCards';
import { CallLogTable, CallRecord } from './CallLogTable';
import { CallDetailsPanel } from './CallDetailsPanel';
import { safeFetchJson } from '../utils/api';

export const CallsView: React.FC = () => {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [searchPhone, setSearchPhone] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Calls');
  const [outcomeFilter, setOutcomeFilter] = useState('All Outcomes');
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState('Jun 17, 2025 - Jun 24, 2025');
  const [isExporting, setIsExporting] = useState(false);

  // Fetch calls from API
  useEffect(() => {
    let isMounted = true;
    const fetchCalls = async () => {
      try {
        const queryParams = new URLSearchParams({
          search: searchPhone,
          status: statusFilter,
          outcome: outcomeFilter,
          page: currentPage.toString(),
        });

        const data = await safeFetchJson(`/api/admin/calls?${queryParams.toString()}`);
        if (!isMounted || !data) return;
        setCalls(data.calls || []);
        setMetrics(data.metrics || null);

        // By default select the first call if none selected or if selected is filtered out
        if (data.calls && data.calls.length > 0) {
          if (!selectedCall || !data.calls.find((c: CallRecord) => c.id === selectedCall.id)) {
            setSelectedCall(data.calls[0]);
          }
        } else {
          setSelectedCall(null);
        }
      } catch {
        // Silently preserve current calls during server reload
      }
    };

    fetchCalls();
    return () => {
      isMounted = false;
    };
  }, [searchPhone, statusFilter, outcomeFilter, currentPage]);

  const handleExportCalls = () => {
    setIsExporting(true);
    window.location.href = '/api/admin/calls/export';
    setTimeout(() => setIsExporting(false), 1500);
  };

  return (
    <div className="space-y-5">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#17243A] tracking-tight">
            Calls
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-0.5">
            View and manage all customer calls, including AI conversations and call details.
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

          {/* Export Calls Button */}
          <button
            onClick={handleExportCalls}
            disabled={isExporting}
            className="flex items-center gap-2 bg-white border border-[#E6E7EB] px-3.5 py-2 rounded-xl shadow-xs text-xs font-semibold text-[#17243A] hover:bg-stone-50 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#17243A]" />
            <span>{isExporting ? 'Exporting...' : 'Export Calls'}</span>
          </button>
        </div>
      </div>

      {/* 2. Four Call Metrics Cards */}
      <CallMetricsCards metrics={metrics} />

      {/* 3. Main Split View: Call Log Table (Left) + Call Details Panel (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
        {/* Left Column: Call Log Table (Span 8) */}
        <div className="xl:col-span-8 flex flex-col">
          <CallLogTable
            calls={calls}
            selectedCallId={selectedCall?.id || ''}
            onSelectCall={(c) => setSelectedCall(c)}
            searchPhone={searchPhone}
            onSearchPhoneChange={setSearchPhone}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            outcomeFilter={outcomeFilter}
            onOutcomeFilterChange={setOutcomeFilter}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            totalCallsCount={metrics?.totalCalls || 48}
          />
        </div>

        {/* Right Column: Call Details Panel (Span 4) */}
        <div className="xl:col-span-4 flex flex-col">
          <CallDetailsPanel
            call={selectedCall}
            onClose={() => setSelectedCall(null)}
            onViewOrder={(orderId) => {
              alert(`Navigating to Order #${orderId}`);
            }}
          />
        </div>
      </div>
    </div>
  );
};
