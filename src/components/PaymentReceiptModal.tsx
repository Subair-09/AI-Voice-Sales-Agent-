import React, { useRef, useState } from 'react';
import { X, Printer, Download, CheckCircle2, Clock, AlertTriangle, ShieldCheck, Mail, Check } from 'lucide-react';
import { BananaLogo } from './BananaLogo';
import { ReceiptData } from '../types/payment';

interface PaymentReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: ReceiptData | null;
  isLoading?: boolean;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  isOpen,
  onClose,
  receipt,
  isLoading = false,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isEmailing, setIsEmailing] = useState(false);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!receipt) return;
    const content = `
==============================================
             BAKED BY DOJA
       Fresh Bakes. Happy People.
==============================================
Official Transaction Receipt: ${receipt.receiptNumber}
Date: ${receipt.paymentDate}
Status: ${receipt.paymentStatus.toUpperCase()}

CUSTOMER DETAILS
Name:    ${receipt.customerName}
Phone:   ${receipt.customerPhone}
Email:   ${receipt.customerEmail}
Address: ${receipt.customerAddress}

TRANSACTION DETAILS
Order ID:              ${receipt.orderId}
Transaction Ref:       ${receipt.transactionReference}
Paystack Ref:          ${receipt.paystackReference}
Payment Method:        ${receipt.paymentMethod}
Payment Channel:       Verified Paystack Gateway

ITEM DETAILS
Item:       ${receipt.product}
Qty:        ${receipt.quantity}
Unit Price: ₦${receipt.unitPrice.toLocaleString()}
Subtotal:   ${receipt.formattedAmount}

----------------------------------------------
TOTAL PAID: ${receipt.total}
----------------------------------------------
Verification: ${receipt.isVerifiedSuccess ? 'VERIFIED BY PAYSTACK BACKEND' : 'AWAITING GATEWAY CONFIRMATION'}
Store: 12 Bayo Street, Victoria Island, Lagos
Contact: orders@bakedbydoja.com
Thank you for your business!
==============================================
    `.trim();

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt-${receipt.transactionReference}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleEmailReceipt = async () => {
    if (!receipt || !receipt.customerEmail) return;
    setIsEmailing(true);
    setEmailStatus(null);
    try {
      const res = await fetch('/api/integrations/email/receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiptNumber: receipt.receiptNumber,
          customerName: receipt.customerName,
          customerEmail: receipt.customerEmail,
          amount: receipt.total,
          paymentMethod: receipt.paymentMethod,
          orderId: receipt.orderId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEmailStatus(`Receipt sent to ${receipt.customerEmail} via Resend!`);
      } else {
        setEmailStatus('Failed to deliver receipt email');
      }
    } catch (err: any) {
      setEmailStatus(`Error: ${err.message}`);
    } finally {
      setIsEmailing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-[#E6E7EB] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="px-6 py-4 bg-[#FAF7F0] border-b border-[#E6E7EB] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#17243A]">Official Receipt</span>
            {receipt?.isVerifiedSuccess && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-[#15966B] bg-[#E8F7EF] px-2 py-0.5 rounded-full border border-[#A7F3D0]">
                <ShieldCheck className="w-3 h-3" />
                Verified
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center text-[#64748B] hover:text-[#17243A] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Receipt Content Area */}
        <div ref={receiptRef} className="p-6 space-y-6">
          {isLoading || !receipt ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-8 h-8 border-3 border-[#F9B91A] border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-xs text-[#6B7280]">Loading receipt information...</p>
            </div>
          ) : (
            <>
              {/* Bakery Branding Header */}
              <div className="text-center pb-5 border-b border-dashed border-[#E5E7EB]">
                <div className="flex justify-center mb-2">
                  <BananaLogo size="md" />
                </div>
                <p className="text-xs text-[#6B7280]">{receipt.storeAddress}</p>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Tel: {receipt.supportPhone} &bull; {receipt.supportEmail}
                </p>

                {/* Status Badge */}
                <div className="mt-3 flex justify-center">
                  {receipt.paymentStatus === 'Successful' ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F7EF] text-[#15966B] text-xs font-bold border border-[#A7F3D0]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Payment Successful
                    </div>
                  ) : receipt.paymentStatus === 'Pending' ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF3C7] text-[#D97706] text-xs font-bold border border-[#FDE68A]">
                      <Clock className="w-3.5 h-3.5" />
                      Payment Pending
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEE2E2] text-[#DC2626] text-xs font-bold border border-[#FECACA]">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Payment Failed
                    </div>
                  )}
                </div>
              </div>

              {/* Receipt Reference Numbers */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-[#FAF7F0] p-3 rounded-xl border border-[#F1EADA]">
                <div>
                  <span className="text-[#6B7280] block text-[11px]">Receipt Number</span>
                  <span className="font-semibold text-[#17243A]">{receipt.receiptNumber}</span>
                </div>
                <div>
                  <span className="text-[#6B7280] block text-[11px]">Payment Date</span>
                  <span className="font-semibold text-[#17243A]">{receipt.paymentDate}</span>
                </div>
                <div>
                  <span className="text-[#6B7280] block text-[11px]">Transaction Ref</span>
                  <span className="font-mono font-semibold text-[#17243A]">{receipt.transactionReference}</span>
                </div>
                <div>
                  <span className="text-[#6B7280] block text-[11px]">Order Reference</span>
                  <span className="font-mono font-semibold text-[#17243A]">{receipt.orderId}</span>
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <h5 className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-1.5">
                  Billed To
                </h5>
                <div className="text-xs space-y-0.5">
                  <p className="font-bold text-[#17243A]">{receipt.customerName}</p>
                  <p className="text-[#64748B]">{receipt.customerPhone}</p>
                  <p className="text-[#64748B]">{receipt.customerEmail}</p>
                  <p className="text-[#64748B]">{receipt.customerAddress}</p>
                </div>
              </div>

              {/* Items Breakdown Table */}
              <div>
                <h5 className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-2">
                  Order Breakdown
                </h5>
                <div className="border border-[#E5E7EB] rounded-xl overflow-hidden text-xs">
                  <div className="grid grid-cols-12 bg-[#F9FAFB] p-2.5 font-semibold text-[#4B5563] border-b border-[#E5E7EB]">
                    <div className="col-span-6">Item</div>
                    <div className="col-span-2 text-center">Qty</div>
                    <div className="col-span-4 text-right">Amount</div>
                  </div>
                  <div className="grid grid-cols-12 p-3 text-[#17243A] items-center border-b border-[#F3F4F6]">
                    <div className="col-span-6">
                      <p className="font-semibold">{receipt.product}</p>
                      <p className="text-[11px] text-[#6B7280]">₦{receipt.unitPrice.toLocaleString()} each</p>
                    </div>
                    <div className="col-span-2 text-center text-[#4B5563]">
                      × {receipt.quantity}
                    </div>
                    <div className="col-span-4 text-right font-semibold">
                      {receipt.formattedAmount}
                    </div>
                  </div>
                  <div className="p-3 bg-[#FAF7F0] space-y-1.5">
                    <div className="flex justify-between text-xs text-[#6B7280]">
                      <span>Payment Method</span>
                      <span className="font-medium text-[#17243A]">{receipt.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between text-xs text-[#6B7280]">
                      <span>Processing Fee</span>
                      <span className="font-medium text-[#15966B]">₦0.00 (Covered)</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-[#17243A] pt-2 border-t border-[#E5E7EB]">
                      <span>Total Paid</span>
                      <span className="text-[#17243A]">{receipt.total}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security / Verification Footer */}
              <div className="text-center pt-2 text-[11px] text-[#6B7280] space-y-1">
                <p>Payment processed securely through Paystack Payments Gateway.</p>
                <p className="text-[#9CA3AF]">
                  Paystack Reference: <span className="font-mono">{receipt.paystackReference}</span>
                </p>
              </div>

              {emailStatus && (
                <div className="p-2.5 rounded-xl bg-[#E8F7EF] border border-[#A7F3D0] text-center text-xs font-semibold text-[#15966B] flex items-center justify-center gap-1.5">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{emailStatus}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#FAF7F0] border-t border-[#E6E7EB] flex items-center justify-between gap-2.5">
          {receipt?.customerEmail ? (
            <button
              onClick={handleEmailReceipt}
              disabled={isEmailing}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#E6E7EB] hover:bg-[#F3F4F6] text-xs font-semibold text-[#17243A] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Mail className="w-3.5 h-3.5 text-[#D97706]" />
              <span>{isEmailing ? 'Sending via Resend...' : 'Email Receipt'}</span>
            </button>
          ) : (
            <div></div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#E6E7EB] hover:bg-[#F3F4F6] text-xs font-semibold text-[#17243A] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-xl bg-[#F9B91A] hover:bg-[#E5A812] active:scale-[0.99] text-xs font-bold text-[#17243A] flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
