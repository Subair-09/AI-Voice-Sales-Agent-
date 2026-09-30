import React, { useState } from 'react';
import { Search, ChevronDown, MoreVertical, ChevronLeft, ChevronRight, Eye, Package, Edit, FileText, PhoneCall, UserX } from 'lucide-react';

export interface CustomerOrderHistoryItem {
  orderId: string;
  itemsSummary: string;
  status: 'Preparing' | 'Processing' | 'Pending' | 'Completed' | 'Delivered';
  amount: string;
  date: string;
  thumbnail?: string;
}

export interface CustomerRecord {
  id: string;
  name: string;
  initials: string;
  phone: string;
  email: string;
  location: string;
  totalOrders: number;
  totalSpent: number;
  formattedTotalSpent: string;
  lastOrder: string;
  status: 'Active' | 'Inactive';
  notes: string;
  avatarBg?: string;
  avatarColor?: string;
  orderHistory?: CustomerOrderHistoryItem[];
}

interface CustomersListTableProps {
  customers: CustomerRecord[];
  selectedCustomerId: string;
  onSelectCustomer: (customer: CustomerRecord) => void;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  totalCustomersCount?: number;
  onMessageCustomer?: (customer: CustomerRecord) => void;
  onEditCustomer?: (customer: CustomerRecord) => void;
  onDeactivateCustomer?: (customer: CustomerRecord) => void;
}

export const CustomersListTable: React.FC<CustomersListTableProps> = ({
  customers,
  selectedCustomerId,
  onSelectCustomer,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  currentPage,
  onPageChange,
  totalCustomersCount = 0,
  onMessageCustomer,
  onEditCustomer,
  onDeactivateCustomer,
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const statuses = ['All Customers', 'Active', 'Inactive'];

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E6E7EB] shadow-xs flex flex-col justify-between">
      {/* Table Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <h2 className="text-base sm:text-lg font-bold text-[#17243A]">
          Customers List
        </h2>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search field */}
          <div className="relative min-w-[220px] sm:min-w-[280px]">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by name, phone or email..."
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
        </div>
      </div>

      {/* Table Component */}
      <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead>
            <tr className="border-b border-[#F1F5F9] text-[#6B7280] font-semibold">
              <th className="pb-3.5 pr-4">Customer</th>
              <th className="pb-3.5 pr-4">Phone Number</th>
              <th className="pb-3.5 pr-4">Email</th>
              <th className="pb-3.5 pr-4 text-center sm:text-left">Total Orders</th>
              <th className="pb-3.5 pr-4">Total Spent</th>
              <th className="pb-3.5 pr-4">Last Order</th>
              <th className="pb-3.5 pr-4">Status</th>
              <th className="pb-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F8FAFC]">
            {customers.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-xs text-[#6B7280]">
                  No customers found. When customers place orders or interact with the bakery, their directory profiles will appear here.
                </td>
              </tr>
            ) : (
              customers.map((cust) => {
                const isSelected = selectedCustomerId === cust.id;

                return (
                  <tr
                    key={cust.id}
                    onClick={() => onSelectCustomer(cust)}
                    className={`transition-colors cursor-pointer select-none ${
                      isSelected
                        ? 'bg-[#FAF7F0] font-medium'
                        : 'hover:bg-[#FAF7F0]/60'
                    }`}
                  >
                    {/* Customer with circular initials avatar */}
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full ${cust.avatarBg || 'bg-[#EDE9FE]'} ${cust.avatarColor || 'text-[#6D28D9]'} font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs`}
                      >
                        {cust.initials}
                      </div>
                      <span className="font-semibold text-[#17243A]">
                        {cust.name}
                      </span>
                    </div>
                  </td>

                  {/* Phone Number */}
                  <td className="py-3.5 pr-4 text-[#475569]">
                    {cust.phone}
                  </td>

                  {/* Email */}
                  <td className="py-3.5 pr-4 text-[#475569]">
                    {cust.email}
                  </td>

                  {/* Total Orders */}
                  <td className="py-3.5 pr-4 text-[#17243A] text-center sm:text-left font-medium">
                    {cust.totalOrders}
                  </td>

                  {/* Total Spent */}
                  <td className="py-3.5 pr-4 font-bold text-[#17243A]">
                    {cust.formattedTotalSpent}
                  </td>

                  {/* Last Order */}
                  <td className="py-3.5 pr-4 text-[#6B7280]">
                    {cust.lastOrder}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 pr-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        cust.status === 'Active'
                          ? 'bg-[#E8F7EF] text-[#15966B]'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {cust.status}
                    </span>
                  </td>

                  {/* Actions 3-dot menu */}
                  <td className="py-3.5 text-right relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === cust.id ? null : cust.id);
                      }}
                      className="p-1 rounded-lg hover:bg-gray-100 text-[#94A3B8] hover:text-[#17243A] transition-colors"
                      aria-label="Actions"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenuId === cust.id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-10 w-44 bg-white rounded-xl shadow-xl border border-[#E6E7EB] py-1.5 z-30 text-left divide-y divide-gray-100"
                      >
                        <div className="py-1">
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              onSelectCustomer(cust);
                            }}
                            className="w-full px-3 py-1.5 text-xs text-[#17243A] hover:bg-[#FAF7F0] flex items-center gap-2"
                          >
                            <Eye className="w-3.5 h-3.5 text-gray-400" />
                            <span>View Customer</span>
                          </button>
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              onSelectCustomer(cust);
                            }}
                            className="w-full px-3 py-1.5 text-xs text-[#17243A] hover:bg-[#FAF7F0] flex items-center gap-2"
                          >
                            <Package className="w-3.5 h-3.5 text-gray-400" />
                            <span>View Orders</span>
                          </button>
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              if (onEditCustomer) onEditCustomer(cust);
                            }}
                            className="w-full px-3 py-1.5 text-xs text-[#17243A] hover:bg-[#FAF7F0] flex items-center gap-2"
                          >
                            <Edit className="w-3.5 h-3.5 text-gray-400" />
                            <span>Edit Customer</span>
                          </button>
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              onSelectCustomer(cust);
                            }}
                            className="w-full px-3 py-1.5 text-xs text-[#17243A] hover:bg-[#FAF7F0] flex items-center gap-2"
                          >
                            <FileText className="w-3.5 h-3.5 text-gray-400" />
                            <span>Add Note</span>
                          </button>
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              if (onMessageCustomer) onMessageCustomer(cust);
                            }}
                            className="w-full px-3 py-1.5 text-xs text-[#17243A] hover:bg-[#FAF7F0] flex items-center gap-2 font-medium"
                          >
                            <PhoneCall className="w-3.5 h-3.5 text-[#15966B]" />
                            <span>Message Customer</span>
                          </button>
                        </div>

                        <div className="py-1">
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              if (onDeactivateCustomer) onDeactivateCustomer(cust);
                            }}
                            className="w-full px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <UserX className="w-3.5 h-3.5 text-red-500" />
                            <span>Deactivate Customer</span>
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

      {/* Pagination Footer */}
      <div className="pt-4 mt-2 border-t border-[#F1F5F9] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#6B7280]">
        <div>
          {totalCustomersCount > 0 ? (
            <>Showing 1 - {customers.length} of {totalCustomersCount} customers</>
          ) : (
            <>0 customers recorded</>
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

          {Array.from({ length: Math.max(1, Math.ceil(totalCustomersCount / 10)) }, (_, i) => i + 1).map((p) => {
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
            onClick={() => onPageChange(Math.min(Math.max(1, Math.ceil(totalCustomersCount / 10)), currentPage + 1))}
            className="w-7 h-7 rounded-lg border border-[#E6E7EB] flex items-center justify-center hover:bg-stone-50 text-gray-500 cursor-pointer disabled:opacity-40"
            disabled={currentPage >= Math.max(1, Math.ceil(totalCustomersCount / 10))}
            aria-label="Next page"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
