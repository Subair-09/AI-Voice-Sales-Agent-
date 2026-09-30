import React, { useState } from 'react';
import { Search, ChevronDown, MoreHorizontal, PhoneMissed, ChevronLeft, ChevronRight } from 'lucide-react';

export interface CallRecord {
  id: string;
  dateTime: string;
  date: string;
  time: string;
  phoneNumber: string;
  customer: string;
  duration: string;
  outcome: string;
  status: 'Completed' | 'Missed';
  orderId?: string | null;
  summary: string;
  transcript: Array<{ speaker: string; time: string; text: string }>;
}

interface CallLogTableProps {
  calls: CallRecord[];
  selectedCallId: string;
  onSelectCall: (call: CallRecord) => void;
  searchPhone: string;
  onSearchPhoneChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  outcomeFilter: string;
  onOutcomeFilterChange: (val: string) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  totalCallsCount?: number;
}

export const CallLogTable: React.FC<CallLogTableProps> = ({
  calls,
  selectedCallId,
  onSelectCall,
  searchPhone,
  onSearchPhoneChange,
  statusFilter,
  onStatusFilterChange,
  outcomeFilter,
  onOutcomeFilterChange,
  currentPage,
  onPageChange,
  totalCallsCount = 0,
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const outcomesList = [
    'All Outcomes',
    'Order placed',
    'Payment link sent',
    'Product enquiry',
    'General enquiry',
    'Missed call',
  ];

  const statusList = ['All Calls', 'Completed', 'Missed'];

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E6E7EB] shadow-xs flex-1 flex flex-col justify-between">
      {/* Top Header & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-5">
        <h2 className="text-base sm:text-lg font-bold text-[#17243A]">
          Call Log
        </h2>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search by phone number */}
          <div className="relative min-w-[200px] sm:min-w-[220px]">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchPhone}
              onChange={(e) => onSearchPhoneChange(e.target.value)}
              placeholder="Search by phone number..."
              className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-[#E6E7EB] rounded-xl text-[#17243A] placeholder-[#94A3B8] focus:outline-none focus:border-[#F9B91A]"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="appearance-none h-9 pl-3 pr-8 text-xs font-medium bg-white border border-[#E6E7EB] rounded-xl text-[#17243A] focus:outline-none focus:border-[#F9B91A] cursor-pointer"
            >
              {statusList.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B7280] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Outcome Filter */}
          <div className="relative">
            <select
              value={outcomeFilter}
              onChange={(e) => onOutcomeFilterChange(e.target.value)}
              className="appearance-none h-9 pl-3 pr-8 text-xs font-medium bg-white border border-[#E6E7EB] rounded-xl text-[#17243A] focus:outline-none focus:border-[#F9B91A] cursor-pointer"
            >
              {outcomesList.map((oc) => (
                <option key={oc} value={oc}>
                  {oc}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B7280] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead>
            <tr className="border-b border-[#F1F5F9] text-[#6B7280] font-semibold">
              <th className="pb-3.5 pr-4">Date & Time</th>
              <th className="pb-3.5 pr-4">Phone Number</th>
              <th className="pb-3.5 pr-4">Customer</th>
              <th className="pb-3.5 pr-4">Duration</th>
              <th className="pb-3.5 pr-4">Outcome</th>
              <th className="pb-3.5 pr-4">Status</th>
              <th className="pb-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F8FAFC]">
            {calls.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-xs text-[#6B7280]">
                  No call records found. When customers call the bakery via the AI voice agent, real logs will appear here.
                </td>
              </tr>
            ) : (
              calls.map((call) => {
                const isSelected = selectedCallId === call.id;
                const isMissed = call.status === 'Missed';

                return (
                  <tr
                    key={call.id}
                    onClick={() => onSelectCall(call)}
                    className={`transition-colors cursor-pointer select-none ${
                      isSelected
                        ? 'bg-[#FAF7F0] font-medium'
                        : 'hover:bg-[#FAF7F0]/60'
                    }`}
                  >
                    {/* Date & Time */}
                  <td className="py-3.5 pr-4 text-[#17243A]">
                    {call.dateTime}
                  </td>

                  {/* Phone Number */}
                  <td className="py-3.5 pr-4 text-[#17243A] font-medium">
                    {call.phoneNumber}
                  </td>

                  {/* Customer */}
                  <td className="py-3.5 pr-4 text-[#17243A]">
                    {call.customer}
                  </td>

                  {/* Duration */}
                  <td className="py-3.5 pr-4 text-[#6B7280] font-mono">
                    {call.duration}
                  </td>

                  {/* Outcome */}
                  <td className="py-3.5 pr-4">
                    {isMissed ? (
                      <span className="inline-flex items-center gap-1.5 text-[#EF4444] font-medium">
                        <PhoneMissed className="w-3.5 h-3.5 stroke-[2]" />
                        <span>Missed call</span>
                      </span>
                    ) : (
                      <span className="text-[#17243A]">{call.outcome}</span>
                    )}
                  </td>

                  {/* Status Pill */}
                  <td className="py-3.5 pr-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        isMissed
                          ? 'bg-[#FEE2E2] text-[#DC2626]'
                          : 'bg-[#E8F7EF] text-[#15966B]'
                      }`}
                    >
                      {isMissed && <PhoneMissed className="w-3 h-3 stroke-[2]" />}
                      <span>{call.status}</span>
                    </span>
                  </td>

                  {/* Action Menu */}
                  <td className="py-3.5 text-right relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === call.id ? null : call.id);
                      }}
                      className="p-1 rounded-lg hover:bg-gray-100 text-[#94A3B8] hover:text-[#17243A] transition-colors"
                      aria-label="Actions"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {activeMenuId === call.id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-10 w-40 bg-white rounded-xl shadow-xl border border-[#E6E7EB] py-1 z-30 text-left"
                      >
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            onSelectCall(call);
                          }}
                          className="w-full px-3 py-1.5 text-xs text-[#17243A] hover:bg-[#FAF7F0] flex items-center gap-2"
                        >
                          View Transcript
                        </button>
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            alert(`Calling ${call.phoneNumber}...`);
                          }}
                          className="w-full px-3 py-1.5 text-xs text-[#17243A] hover:bg-[#FAF7F0] flex items-center gap-2"
                        >
                          Call Again
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
          {totalCallsCount > 0 ? (
            <>Showing 1 - {calls.length} of {totalCallsCount} calls</>
          ) : (
            <>0 calls recorded</>
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

          {Array.from({ length: Math.max(1, Math.ceil(totalCallsCount / 10)) }, (_, i) => i + 1).map((p) => {
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
            onClick={() => onPageChange(Math.min(Math.max(1, Math.ceil(totalCallsCount / 10)), currentPage + 1))}
            className="w-7 h-7 rounded-lg border border-[#E6E7EB] flex items-center justify-center hover:bg-stone-50 text-gray-500 cursor-pointer disabled:opacity-40"
            disabled={currentPage >= Math.max(1, Math.ceil(totalCallsCount / 10))}
            aria-label="Next page"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
