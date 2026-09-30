import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  CreditCard,
  Coins,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Edit2,
  Check,
  Download,
  RefreshCw,
  Copy,
} from 'lucide-react';
import { PaymentRecord } from '../types/payment';

interface TransactionDetailsDrawerProps {
  payment: PaymentRecord | null;
  onClose: () => void;
  onViewOrder?: (orderId: string) => void;
  onDownloadReceipt?: (payment: PaymentRecord) => void;
  onNotesUpdated?: (paymentId: string, newNotes: string) => void;
  onPaymentRetried?: (updatedPayment: PaymentRecord) => void;
}

export const TransactionDetailsDrawer: React.FC<TransactionDetailsDrawerProps> = ({
  payment,
  onClose,
  onViewOrder,
  onDownloadReceipt,
  onNotesUpdated,
  onPaymentRetried,
}) => {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState(payment?.notes || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  // Sync state if payment changes
  React.useEffect(() => {
    if (payment) {
      setNotesText(payment.notes || '');
      setIsEditingNotes(false);
      setCopiedRef(false);
    }
  }, [payment]);

  if (!payment) return null;

  const handleCopyRef = () => {
    navigator.clipboard.writeText(payment.transactionReference);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      const response = await fetch(`/api/admin/payments/${payment.id}/notes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: notesText }),
      });
      if (response.ok) {
        setIsEditingNotes(false);
        onNotesUpdated?.(payment.id, notesText);
      }
    } catch (err) {
      console.error('Error saving notes:', err);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleRetryPayment = async () => {
    setIsRetrying(true);
    try {
      const response = await fetch(`/api/admin/payments/${payment.id}/retry`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success && data.payment) {
        onPaymentRetried?.(data.payment);
      }
    } catch (err) {
      console.error('Error retrying payment query:', err);
    } finally {
      setIsRetrying(false);
    }
  };

  const isSuccess = payment.status === 'Successful';
  const isPending = payment.status === 'Pending';
  const isFailed = payment.status === 'Failed';

  return (
    <div className="bg-white rounded-2xl border border-[#E6E7EB] shadow-xs flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-[#F3F4F6] flex items-center justify-between">
        <h3 className="text-base font-bold text-[#17243A]">Transaction Details</h3>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full hover:bg-[#F3F4F6] flex items-center justify-center text-[#64748B] hover:text-[#17243A] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="p-4 sm:p-5 space-y-5 overflow-y-auto max-h-[calc(100vh-230px)]">
        {/* Banner with Ref & Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                isSuccess
                  ? 'bg-[#15966B] text-white'
                  : isPending
                  ? 'bg-[#D97706] text-white'
                  : 'bg-[#DC2626] text-white'
              }`}
            >
              {isSuccess ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : isPending ? (
                <Clock className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-lg font-bold text-[#17243A] tracking-tight">
                  {payment.transactionReference}
                </h4>
                <button
                  onClick={handleCopyRef}
                  title="Copy reference"
                  className="text-[#9CA3AF] hover:text-[#17243A] p-0.5 rounded cursor-pointer"
                >
                  {copiedRef ? (
                    <Check className="w-3.5 h-3.5 text-[#15966B]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <p className="text-[11px] text-[#6B7280]">Paystack Ref: {payment.paystackReference}</p>
            </div>
          </div>

          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
              isSuccess
                ? 'bg-[#E8F7EF] text-[#15966B]'
                : isPending
                ? 'bg-[#FEF3C7] text-[#D97706]'
                : 'bg-[#FEE2E2] text-[#DC2626]'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isSuccess ? 'bg-[#15966B]' : isPending ? 'bg-[#D97706]' : 'bg-[#DC2626]'
              }`}
            />
            {payment.status}
          </span>
        </div>

        {/* Customer Snapshot */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FAF7F0] border border-[#F1EADA]">
          <div
            className={`w-10 h-10 rounded-full ${payment.avatarBg} ${payment.avatarColor} font-bold text-xs flex items-center justify-center shrink-0`}
          >
            {payment.customerInitials}
          </div>
          <div className="min-w-0 flex-1">
            <h5 className="text-xs font-bold text-[#17243A] truncate">
              {payment.customerName}
            </h5>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-[#64748B] mt-0.5">
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-[#9CA3AF]" />
                {payment.customerPhone}
              </span>
              <span className="flex items-center gap-1 truncate">
                <Mail className="w-3 h-3 text-[#9CA3AF]" />
                {payment.customerEmail}
              </span>
            </div>
          </div>
        </div>

        {/* Three Columns Key Info Box */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-[#FAF7F0] rounded-xl border border-[#F1EADA] text-center">
          <div className="p-1">
            <div className="flex items-center justify-center gap-1 text-[11px] text-[#6B7280] mb-0.5">
              <Calendar className="w-3 h-3 text-[#9CA3AF]" />
              <span>Date & Time</span>
            </div>
            <p className="text-xs font-bold text-[#17243A] leading-tight">{payment.date}</p>
            <p className="text-[11px] text-[#6B7280]">{payment.time}</p>
          </div>

          <div className="p-1 border-x border-[#E5E0D0]">
            <div className="flex items-center justify-center gap-1 text-[11px] text-[#6B7280] mb-0.5">
              <CreditCard className="w-3 h-3 text-[#9CA3AF]" />
              <span>Payment</span>
            </div>
            <p className="text-xs font-bold text-[#17243A] leading-tight">{payment.paymentMethod}</p>
            <p className="text-[11px] text-[#6B7280] capitalize">{payment.channel || 'Paystack'}</p>
          </div>

          <div className="p-1">
            <div className="flex items-center justify-center gap-1 text-[11px] text-[#6B7280] mb-0.5">
              <Coins className="w-3 h-3 text-[#9CA3AF]" />
              <span>Amount</span>
            </div>
            <p className="text-xs font-bold text-[#17243A] leading-tight">{payment.formattedAmount}</p>
            <p className="text-[11px] text-[#15966B] font-semibold">{payment.currency}</p>
          </div>
        </div>

        {/* Section: Payment Summary */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-[#17243A] uppercase tracking-wider">
            Payment Summary
          </h4>
          <div className="space-y-2 text-xs divide-y divide-[#F3F4F6]">
            <div className="flex justify-between py-1">
              <span className="text-[#6B7280]">Transaction Reference</span>
              <span className="font-semibold text-[#17243A]">{payment.transactionReference}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#6B7280]">Payment Method</span>
              <span className="font-semibold text-[#17243A]">{payment.paymentMethod}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#6B7280]">Amount</span>
              <span className="font-bold text-[#17243A]">{payment.formattedAmount}</span>
            </div>
            <div className="flex justify-between py-1 items-center">
              <span className="text-[#6B7280]">Status</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  isSuccess
                    ? 'bg-[#E8F7EF] text-[#15966B]'
                    : isPending
                    ? 'bg-[#FEF3C7] text-[#D97706]'
                    : 'bg-[#FEE2E2] text-[#DC2626]'
                }`}
              >
                {payment.status}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#6B7280]">Paid At</span>
              <span className="font-medium text-[#17243A]">{payment.paidAt}</span>
            </div>
          </div>
        </div>

        {/* Section: Order Information */}
        <div className="space-y-2 pt-2 border-t border-[#F3F4F6]">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#17243A] uppercase tracking-wider">
              Order Information
            </h4>
            {payment.orderId && (
              <button
                onClick={() => onViewOrder?.(payment.orderId)}
                className="text-xs font-bold text-[#0284C7] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{payment.orderId}</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="p-3 rounded-xl bg-[#FAF7F0] border border-[#F1EADA] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={payment.productSummary.thumbnail || '/assets/banana-bread.jpg'}
                alt={payment.productSummary.name}
                className="w-11 h-11 rounded-lg object-cover border border-[#E5E0D0]"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/banana-bread.jpg';
                }}
              />
              <div>
                <p className="text-xs font-bold text-[#17243A]">
                  {payment.productSummary.name}
                </p>
                <p className="text-[11px] text-[#6B7280]">
                  Quantity: <span className="font-semibold text-[#17243A]">× {payment.productSummary.quantity}</span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-[#17243A]">
                Total {payment.productSummary.total}
              </p>
            </div>
          </div>
        </div>

        {/* Section: Customer Information */}
        <div className="space-y-2 pt-2 border-t border-[#F3F4F6]">
          <h4 className="text-xs font-bold text-[#17243A] uppercase tracking-wider">
            Customer Information
          </h4>
          <div className="space-y-1 text-xs">
            <p className="font-bold text-[#17243A] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F9B91A]"></span>
              {payment.customerName}
            </p>
            <p className="text-[#64748B] flex items-center gap-1.5 pl-3.5">
              <Phone className="w-3 h-3 text-[#9CA3AF]" />
              {payment.customerPhone}
            </p>
            <p className="text-[#64748B] flex items-center gap-1.5 pl-3.5">
              <MapPin className="w-3 h-3 text-[#9CA3AF]" />
              {payment.customerAddress}
            </p>
          </div>
        </div>

        {/* Section: Notes */}
        <div className="space-y-2 pt-2 border-t border-[#F3F4F6]">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#17243A] uppercase tracking-wider">
              Notes
            </h4>
            {!isEditingNotes && (
              <button
                onClick={() => setIsEditingNotes(true)}
                className="text-[#6B7280] hover:text-[#17243A] flex items-center gap-1 text-[11px] font-medium cursor-pointer"
              >
                <Edit2 className="w-3 h-3" />
                Edit
              </button>
            )}
          </div>

          {isEditingNotes ? (
            <div className="space-y-2">
              <textarea
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                rows={2}
                className="w-full text-xs p-2.5 rounded-xl border border-[#F9B91A] focus:outline-hidden focus:ring-1 focus:ring-[#F9B91A] bg-white text-[#17243A]"
                placeholder="Add internal transaction notes..."
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setNotesText(payment.notes || '');
                    setIsEditingNotes(false);
                  }}
                  className="px-2.5 py-1 text-xs text-[#6B7280] hover:text-[#17243A] rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes}
                  className="px-3 py-1 bg-[#F9B91A] hover:bg-[#E5A812] text-xs font-bold text-[#17243A] rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  {isSavingNotes ? 'Saving...' : 'Save Notes'}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-[#FAF7F0] border border-[#F1EADA] text-xs text-[#4B5563] italic">
              "{payment.notes || 'No notes added for this transaction.'}"
            </div>
          )}
        </div>
      </div>

      {/* Drawer Action Buttons Footer */}
      <div className="p-4 sm:p-5 border-t border-[#F3F4F6] bg-white space-y-2 mt-auto">
        <button
          onClick={() => onDownloadReceipt?.(payment)}
          className="w-full py-2.5 px-4 rounded-xl bg-[#F9B91A] hover:bg-[#E5A812] active:scale-[0.99] font-bold text-xs text-[#17243A] flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
        >
          <Download className="w-4 h-4 stroke-[2.2]" />
          <span>Download Receipt</span>
        </button>

        {(isPending || isFailed) && (
          <button
            onClick={handleRetryPayment}
            disabled={isRetrying}
            className="w-full py-2 px-4 rounded-xl bg-[#FAF7F0] hover:bg-[#F3EFE6] border border-[#E6E7EB] font-semibold text-xs text-[#17243A] flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? 'Checking Paystack...' : 'Verify / Re-query Payment'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
