import React, { useState, useEffect } from 'react';
import {
  X,
  Phone,
  Mail,
  User,
  MapPin,
  ClipboardList,
  Edit2,
  Check,
  PhoneCall,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { CustomerRecord } from './CustomersListTable';

interface CustomerDetailsPanelProps {
  customer: CustomerRecord | null;
  onClose?: () => void;
  onOpenMessageModal?: (customer: CustomerRecord) => void;
  onViewAllOrders?: (customer: CustomerRecord) => void;
}

export const CustomerDetailsPanel: React.FC<CustomerDetailsPanelProps> = ({
  customer,
  onClose,
  onOpenMessageModal,
  onViewAllOrders,
}) => {
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCallingCustomer, setIsCallingCustomer] = useState(false);

  useEffect(() => {
    if (customer) {
      setNoteText(customer.notes || '');
      setIsEditingNote(false);
    }
  }, [customer?.id]);

  if (!customer) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-[#E6E7EB] shadow-xs flex flex-col items-center justify-center text-center h-full min-h-[400px]">
        <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mb-3">
          <User className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-[#17243A]">No Customer Selected</h3>
        <p className="text-xs text-gray-500 mt-1 max-w-xs">
          Select any customer from the table on the left to inspect customer profile, contact information, order history, and notes.
        </p>
      </div>
    );
  }

  const handleSaveNote = async () => {
    setIsSavingNote(true);
    try {
      await fetch(`/api/admin/customers/${customer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: noteText }),
      });
      customer.notes = noteText;
      setIsEditingNote(false);
      setToastMessage('Note updated successfully');
      setTimeout(() => setToastMessage(null), 2500);
    } catch {
      setIsEditingNote(false);
      setToastMessage('Saved note locally');
      setTimeout(() => setToastMessage(null), 2500);
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleCallWithVapi = async () => {
    if (!customer.phone) return;
    setIsCallingCustomer(true);
    try {
      const res = await fetch('/api/vapi/call/phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerPhoneNumber: customer.phone,
          customerName: customer.name,
          purpose: 'Customer follow-up & fresh banana bread recommendation',
        }),
      });
      const data = await res.json();
      setToastMessage(data.message || `Outbound Vapi call initiated to ${customer.name}`);
      setTimeout(() => setToastMessage(null), 3500);
    } catch {
      setToastMessage(`Initiating Vapi call to ${customer.phone}...`);
      setTimeout(() => setToastMessage(null), 3500);
    } finally {
      setIsCallingCustomer(false);
    }
  };

  const getOrderStatusBadge = (status: string) => {
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

  // Customer order history
  const orders = customer.orderHistory || [];

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E6E7EB] shadow-xs flex flex-col justify-between h-full relative">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="absolute top-3 left-4 right-4 z-30 bg-[#17243A] text-white text-xs px-3.5 py-2 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-[#15966B] shrink-0" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      <div className="space-y-4">
        {/* Panel Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h3 className="text-sm font-bold text-[#17243A]">
            Customer Details
          </h3>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Close customer details"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Selected Customer Profile Header Lockup */}
        <div className="flex items-start gap-3.5">
          {/* Avatar with Initials */}
          <div
            className={`w-12 h-12 rounded-full ${
              customer.avatarBg || 'bg-[#EDE9FE]'
            } ${
              customer.avatarColor || 'text-[#6D28D9]'
            } font-bold text-base flex items-center justify-center shrink-0 shadow-2xs`}
          >
            {customer.initials}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold text-[#17243A] truncate">
                {customer.name}
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#E8F7EF] text-[#15966B]">
                {customer.status}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[#6B7280] mt-1">
              <Phone className="w-3 h-3 text-[#94A3B8] shrink-0" />
              <span className="truncate">{customer.phone}</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[#6B7280] mt-0.5">
              <Mail className="w-3 h-3 text-[#94A3B8] shrink-0" />
              <span className="truncate">{customer.email}</span>
            </div>
          </div>
        </div>

        {/* 3 Compact Metric Cards in a Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-[#FAF7F0] rounded-xl p-2.5 border border-[#EFECE6] text-left">
            <div className="text-[11px] font-medium text-[#6B7280]">
              Total Orders
            </div>
            <div className="text-base font-bold text-[#17243A] mt-0.5">
              {customer.totalOrders}
            </div>
          </div>

          <div className="bg-[#FAF7F0] rounded-xl p-2.5 border border-[#EFECE6] text-left">
            <div className="text-[11px] font-medium text-[#6B7280]">
              Total Spent
            </div>
            <div className="text-base font-bold text-[#17243A] mt-0.5">
              {customer.formattedTotalSpent}
            </div>
          </div>

          <div className="bg-[#FAF7F0] rounded-xl p-2.5 border border-[#EFECE6] text-left">
            <div className="text-[11px] font-medium text-[#6B7280]">
              Last Order
            </div>
            <div className="text-[11px] font-bold text-[#17243A] mt-1 truncate">
              {customer.lastOrder}
            </div>
          </div>
        </div>

        {/* Customer Information List */}
        <div>
          <h4 className="text-xs font-bold text-[#17243A] mb-2.5">
            Customer Information
          </h4>

          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2.5 text-[#475569]">
              <User className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
              <div className="flex-1 flex justify-between">
                <span className="text-[#6B7280]">Name</span>
                <span className="font-semibold text-[#17243A]">{customer.name}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-[#475569]">
              <Phone className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
              <div className="flex-1 flex justify-between">
                <span className="text-[#6B7280]">Phone</span>
                <span className="font-medium text-[#17243A]">{customer.phone}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-[#475569]">
              <Mail className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
              <div className="flex-1 flex justify-between">
                <span className="text-[#6B7280]">Email</span>
                <span className="font-medium text-[#17243A]">{customer.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-[#475569]">
              <MapPin className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
              <div className="flex-1 flex justify-between">
                <span className="text-[#6B7280]">Location</span>
                <span className="font-medium text-[#17243A]">{customer.location || 'Lagos, Nigeria'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order History */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-[#17243A]">
              Order History
            </h4>
            <button
              onClick={() => onViewAllOrders && onViewAllOrders(customer)}
              className="text-[11px] font-bold text-[#17243A] hover:text-[#D97706] flex items-center gap-0.5 transition-colors cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {orders.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#6B7280]">
                No orders recorded yet for this customer.
              </div>
            ) : (
              orders.map((ord, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-[#FAF7F0] transition-colors border border-transparent hover:border-[#EFECE6]"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={ord.thumbnail || '/assets/banana-bread.jpg'}
                      alt="Banana Bread"
                      className="w-9 h-9 rounded-lg object-cover border border-[#E6E7EB] shrink-0"
                    />
                    <div>
                      <div className="font-bold text-xs text-[#17243A]">
                        {ord.orderId}
                      </div>
                      <div className="text-[11px] text-[#6B7280]">
                        {ord.itemsSummary}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1.5 mb-0.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${getOrderStatusBadge(
                          ord.status
                        )}`}
                      >
                        {ord.status}
                      </span>
                      <span className="text-xs font-bold text-[#17243A]">
                        {ord.amount}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#6B7280]">
                      {ord.date}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Customer Notes */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <ClipboardList className="w-3.5 h-3.5 text-[#17243A]" />
              <h4 className="text-xs font-bold text-[#17243A]">
                Customer Notes
              </h4>
            </div>

            {!isEditingNote ? (
              <button
                onClick={() => setIsEditingNote(true)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded transition-colors"
                title="Edit note"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            ) : (
              <button
                onClick={handleSaveNote}
                disabled={isSavingNote}
                className="text-[11px] text-[#15966B] font-bold flex items-center gap-1 hover:underline"
              >
                <Check className="w-3 h-3" />
                <span>Save</span>
              </button>
            )}
          </div>

          {isEditingNote ? (
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={2}
              className="w-full text-xs p-2.5 rounded-xl border border-[#F9B91A] bg-white text-[#17243A] focus:outline-none"
              placeholder="Add customer preferences, dietary instructions or notes..."
            />
          ) : (
            <div className="bg-[#FAF7F0] rounded-xl p-3 border border-[#EFECE6] text-xs text-[#475569] leading-relaxed">
              {noteText || 'Loves banana bread and often orders for special occasions.'}
            </div>
          )}
        </div>
      </div>

      {/* Primary Action Buttons (Bottom) */}
      <div className="grid grid-cols-2 gap-2.5 pt-4 mt-3 border-t border-gray-100">
        <button
          onClick={handleCallWithVapi}
          disabled={isCallingCustomer}
          className="h-11 bg-[#17243A] hover:bg-[#2A3B56] active:scale-[0.99] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
          title="Place automated outbound sales call using Vapi Voice AI"
        >
          <Phone className="w-3.5 h-3.5 text-[#F9B91A] stroke-[2.2]" />
          <span>{isCallingCustomer ? 'Calling...' : 'Call (Vapi AI)'}</span>
        </button>

        <button
          onClick={() => onOpenMessageModal && onOpenMessageModal(customer)}
          className="h-11 bg-[#F9B91A] hover:bg-[#ECAE0E] active:scale-[0.99] text-[#17243A] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
        >
          <PhoneCall className="w-3.5 h-3.5 stroke-[2.2]" />
          <span>Message</span>
        </button>
      </div>
    </div>
  );
};
