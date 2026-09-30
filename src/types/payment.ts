export interface PaymentRecord {
  id: string;
  transactionReference: string;
  paystackReference: string;
  orderId: string;
  customerId: string;
  customerName: string;
  customerInitials: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  amount: number;
  formattedAmount: string;
  currency: string;
  paymentMethod: string;
  status: 'Successful' | 'Pending' | 'Failed' | 'Refunded' | 'Reversed';
  dateTime: string;
  date: string;
  time: string;
  paidAt: string;
  productSummary: {
    name: string;
    quantity: number;
    amount: string;
    total: string;
    thumbnail: string;
  };
  notes: string;
  gatewayResponse: string;
  channel: string;
  metadata?: any;
  webhookVerified: boolean;
  avatarBg: string;
  avatarColor: string;
}

export interface PaymentStats {
  totalRevenue: string;
  totalRevenueChange: string;
  successfulPayments: number;
  successfulPaymentsChange: string;
  pendingPayments: number;
  pendingPaymentsChange: string;
  failedPayments: number;
  failedPaymentsChange: string;
  timeframe: string;
}

export interface ReceiptData {
  receiptNumber: string;
  brandName: string;
  brandTagline: string;
  storeAddress: string;
  supportPhone: string;
  supportEmail: string;
  transactionReference: string;
  paystackReference: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  product: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  formattedAmount: string;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  isVerifiedSuccess: boolean;
  paymentDate: string;
  total: string;
  issuedAt: string;
}
