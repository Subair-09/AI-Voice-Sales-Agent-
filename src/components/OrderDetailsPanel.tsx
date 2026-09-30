import React, { useState } from 'react';
import {
  X,
  Package,
  Calendar,
  CreditCard,
  User,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Clock,
  Circle,
  PhoneCall,
} from 'lucide-react';
import { OrderRecord } from './OrdersListTable';

interface OrderDetailsPanelProps {
  order: OrderRecord | null;
  onClose?: () => void;
  onStatusChange?: (newStatus: OrderRecord['status']) => void;
}

export const OrderDetailsPanel: React.FC<OrderDetailsPanelProps> = ({
  order,
  onClose,
  onStatusChange,
}) => {
  const [callingState, setCallingState] = useState<'idle' | 'calling' | 'connected'>('idle');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!order) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-[#E6E7EB] shadow-xs flex flex-col items-center justify-center text-center h-full min-h-[400px]">
        <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mb-3">
          <Package className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-[#17243A]">No Order Selected</h3>
        <p className="text-xs text-gray-500 mt-1 max-w-xs">
          Select any order from the table on the left to inspect customer details, items, timeline, and delivery notes.
        </p>
      </div>
    );
  }

  const handleCallCustomer = async () => {
    setCallingState('calling');
    try {
      const res = await fetch(`/api/admin/orders/${order.orderId}/call-customer`, { method: 'POST' });
      const data = await res.json();
      setCallingState('connected');
      setToastMessage(data.message || `Calling ${order.customerName}...`);
      setTimeout(() => {
        setCallingState('idle');
        setTimeout(() => setToastMessage(null), 3000);
      }, 2500);
    } catch {
      setCallingState('idle');
      setToastMessage(`Initiating outbound call to ${order.phoneNumber}`);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

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
    <div className="bg-white rounded-2xl p-5 border border-[#E6E7EB] shadow-xs flex flex-col justify-between h-full relative">
      {/* Toast Notification */}
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
            Order Details
          </h3>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Close order details"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Selected Order & Customer Header Lockup */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 stroke-[2.2]" />
            </div>

            <div>
              <div className="text-sm font-bold text-[#17243A] leading-tight">
                {order.orderId}
              </div>
              <div className="text-xs text-[#17243A] font-medium leading-tight mt-0.5">
                {order.customerName}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-[#6B7280] mt-0.5">
                <Phone className="w-3 h-3 text-[#94A3B8]" />
                <span>{order.phoneNumber}</span>
              </div>
            </div>
          </div>

          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${getStatusBadge(
              order.status
            )}`}
          >
            {order.status}
          </span>
        </div>

        {/* Date & Payment Info Grid */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-[#FAF7F0] rounded-xl border border-[#EFECE6] text-xs">
          {/* Date info */}
          <div className="flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-[#17243A] shrink-0" />
            <div>
              <div className="font-semibold text-[#17243A] leading-tight">
                {order.fullDate}
              </div>
              <div className="text-[11px] text-[#6B7280] leading-tight">
                {order.time}
              </div>
            </div>
          </div>

          {/* Payment info */}
          <div className="flex items-center gap-2.5">
            <CreditCard className="w-4 h-4 text-[#17243A] shrink-0" />
            <div>
              <div className="text-[11px] text-[#6B7280] leading-tight">
                {order.paymentMethod}
              </div>
              <div className="font-bold text-[#17243A] leading-tight">
                {order.amount}
              </div>
            </div>
          </div>
        </div>

        {/* Order Items Section */}
        <div>
          <h4 className="text-xs font-bold text-[#17243A] mb-2">
            Order Items
          </h4>

          <div className="space-y-2">
            {order.items && order.items.length > 0 ? (
              order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={item.image || '/assets/banana-bread.jpg'}
                      alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover border border-[#E6E7EB] shrink-0"
                    />
                    <div>
                      <div className="font-semibold text-[#17243A]">{item.name}</div>
                      <div className="text-[11px] text-[#6B7280]">× {item.quantity}</div>
                    </div>
                  </div>
                  <div className="font-bold text-[#17243A]">
                    ₦{item.totalPrice.toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/assets/banana-bread.jpg"
                    alt="Banana Bread"
                    className="w-10 h-10 rounded-lg object-cover border border-[#E6E7EB] shrink-0"
                  />
                  <div>
                    <div className="font-semibold text-[#17243A]">Banana Bread</div>
                    <div className="text-[11px] text-[#6B7280]">× 2</div>
                  </div>
                </div>
                <div className="font-bold text-[#17243A]">₦10,000</div>
              </div>
            )}

            <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-bold text-[#17243A]">
              <span>Total</span>
              <span className="text-sm">{order.amount}</span>
            </div>
          </div>
        </div>

        {/* Customer Information Section */}
        <div className="pt-1">
          <h4 className="text-xs font-bold text-[#17243A] mb-2">
            Customer Information
          </h4>

          <div className="space-y-1.5 text-xs text-[#475569]">
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
              <span className="font-medium text-[#17243A]">{order.customerName}</span>
            </div>

            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
              <span>{order.phoneNumber || order.customerPhone || 'Not provided'}</span>
            </div>

            {(order.email || order.customerEmail) && (
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
                <span className="text-[#17243A]">{order.email || order.customerEmail}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
              <span>{order.deliveryAddress}</span>
            </div>

            {/* Appointment Schedule Details */}
            {(order.isAppointment || order.appointmentDate) && (
              <div className="mt-2.5 p-2.5 bg-[#FEF9C3]/70 border border-[#FDE047] rounded-xl text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#854D0E]">
                  <Calendar className="w-3.5 h-3.5 text-[#CA8A04]" />
                  <span>{order.orderType || 'Scheduled Appointment Order'}</span>
                </div>
                <div className="text-[11px] text-[#A16207]">
                  <span className="font-semibold">Slot:</span> {order.appointmentDate || 'Tomorrow'} at {order.appointmentTime || '10:00 AM'}
                </div>
                {order.notes && (
                  <div className="text-[11px] text-[#854D0E]/80 italic mt-0.5">
                    "{order.notes}"
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Order Status Timeline (Horizontal Tracker) */}
        <div className="pt-1">
          <h4 className="text-xs font-bold text-[#17243A] mb-2">
            Order Status
          </h4>

          {/* Horizontal Progress Flow */}
          <div className="relative">
            <div className="flex items-center justify-between relative z-10">
              {order.timeline && order.timeline.length > 0 ? (
                order.timeline.map((step, idx) => {
                  const isCompleted = step.status === 'completed';
                  const isActive = step.status === 'active';

                  return (
                    <div key={idx} className="flex flex-col items-center flex-1 text-center">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors ${
                          isCompleted
                            ? 'bg-[#15966B] text-white'
                            : isActive
                            ? 'bg-[#F9B91A] text-[#17243A] shadow-xs ring-2 ring-[#F9B91A]/30'
                            : 'bg-stone-100 text-stone-400 border border-stone-200'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                        ) : isActive ? (
                          <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
                        ) : (
                          <Circle className="w-3 h-3 stroke-[2]" />
                        )}
                      </div>

                      <div className="mt-1 text-[10px] font-semibold text-[#17243A] leading-tight">
                        {step.step}
                      </div>

                      {step.timestamp !== 'Pending' && (
                        <div className="text-[9px] text-[#6B7280] leading-tight mt-0.5">
                          {step.timestamp}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <>
                  <div className="flex flex-col items-center flex-1 text-center">
                    <div className="w-6 h-6 rounded-full bg-[#15966B] text-white flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <div className="mt-1 text-[10px] font-semibold text-[#17243A]">Order Placed</div>
                    <div className="text-[9px] text-[#6B7280]">24 Jun, 09:12 AM</div>
                  </div>
                  <div className="flex flex-col items-center flex-1 text-center">
                    <div className="w-6 h-6 rounded-full bg-[#15966B] text-white flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <div className="mt-1 text-[10px] font-semibold text-[#17243A]">Payment Confirmed</div>
                    <div className="text-[9px] text-[#6B7280]">24 Jun, 09:15 AM</div>
                  </div>
                  <div className="flex flex-col items-center flex-1 text-center">
                    <div className="w-6 h-6 rounded-full bg-[#F9B91A] text-[#17243A] flex items-center justify-center shadow-xs">
                      <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <div className="mt-1 text-[10px] font-semibold text-[#17243A]">Preparing</div>
                    <div className="text-[9px] text-[#6B7280]">24 Jun, 09:20 AM</div>
                  </div>
                  <div className="flex flex-col items-center flex-1 text-center">
                    <div className="w-6 h-6 rounded-full bg-stone-100 text-stone-400 border border-stone-200 flex items-center justify-center">
                      <Circle className="w-3 h-3 stroke-[2]" />
                    </div>
                    <div className="mt-1 text-[10px] font-semibold text-[#17243A]">Out for Delivery</div>
                  </div>
                  <div className="flex flex-col items-center flex-1 text-center">
                    <div className="w-6 h-6 rounded-full bg-stone-100 text-stone-400 border border-stone-200 flex items-center justify-center">
                      <Circle className="w-3 h-3 stroke-[2]" />
                    </div>
                    <div className="mt-1 text-[10px] font-semibold text-[#17243A]">Delivered</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="pt-1">
          <h4 className="text-xs font-bold text-[#17243A] mb-1.5">
            Notes
          </h4>
          <div className="bg-[#FAF7F0]/80 rounded-xl p-3 border border-[#EFECE6] text-xs text-[#475569] leading-relaxed">
            {order.notes || "Customer requested extra butter and a gift note: 'Happy Birthday!'"}
          </div>
        </div>
      </div>

      {/* Action Buttons (Bottom) */}
      <div className="grid grid-cols-2 gap-3 pt-4 mt-4 border-t border-gray-100">
        <button
          onClick={handleCallCustomer}
          disabled={callingState !== 'idle'}
          className="h-10 px-3 bg-[#F9B91A] hover:bg-[#ECAE0E] active:scale-[0.99] text-[#17243A] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
        >
          <PhoneCall className="w-3.5 h-3.5 stroke-[2.2]" />
          <span>
            {callingState === 'calling' ? 'Calling...' : callingState === 'connected' ? 'Connected' : 'Call Customer'}
          </span>
        </button>

        <button
          onClick={() => {
            setToastMessage(`Viewing full order details for #${order.orderId}`);
            setTimeout(() => setToastMessage(null), 3000);
          }}
          className="h-10 px-3 bg-white hover:bg-stone-50 active:scale-[0.99] border border-[#E6E7EB] text-[#17243A] font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
        >
          <Package className="w-3.5 h-3.5 stroke-[2]" />
          <span>View Order</span>
        </button>
      </div>
    </div>
  );
};
