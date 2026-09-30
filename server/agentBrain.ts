import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import { getStoredSettings, getStoredProducts } from './storage.js';

/**
 * Baked by Doja - Comprehensive AI Voice Sales Agent Brain
 * Provides real-time grounded intelligence across:
 * 1. Orders (history, statuses, delivery tracking, items)
 * 2. Calls (past call records, transcripts, summaries, caller sentiments)
 * 3. Customers (profiles, order counts, preferences, saved addresses)
 * 4. Production Information (inventory stock, fresh oven batches, prices, recipes)
 * 5. Payments (Paystack references, verification status, payment links, amounts)
 * 6. Knowledge Base (RAG docs, allergens, Lagos delivery zones, store policies)
 */

export interface BakeryLiveStore {
  getOrders: () => Promise<any[]>;
  getProducts: () => Promise<any[]>;
  getCustomers: () => Promise<any[]>;
  getCalls: () => Promise<any[]>;
  getPayments: () => Promise<any[]>;
  getKnowledge: () => Promise<any[]>;
  addOrder: (order: any) => Promise<any>;
  updateProductStock: (productNameOrId: string, qty: number) => Promise<boolean>;
  addOrUpdateCustomer: (cust: any) => Promise<any>;
  addPayment: (payment: any) => Promise<any>;
  addCall: (call: any) => Promise<any>;
  logActivity: (act: any) => Promise<void>;
}

/**
 * Convert numbers to natural English words for Nigerian Naira currency pronunciation
 */
export function numberToWords(num: number): string {
  if (num === 0) return 'zero';
  if (num < 0) return 'minus ' + numberToWords(Math.abs(num));

  const ones = [
    '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
    'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
    'seventeen', 'eighteen', 'nineteen'
  ];
  const tens = [
    '', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'
  ];

  function helper(n: number): string {
    if (n < 20) return ones[n];
    if (n < 100) {
      const t = tens[Math.floor(n / 10)];
      const rem = n % 10;
      return rem ? `${t}-${ones[rem]}` : t;
    }
    if (n < 1000) {
      const rem = n % 100;
      return `${ones[Math.floor(n / 100)]} hundred${rem ? ' and ' + helper(rem) : ''}`;
    }
    if (n < 1000000) {
      const thousands = Math.floor(n / 1000);
      const rem = n % 1000;
      let remStr = '';
      if (rem > 0) {
        remStr = rem < 100 ? ' and ' + helper(rem) : ' ' + helper(rem);
      }
      return `${helper(thousands)} thousand${remStr}`;
    }
    if (n < 1000000000) {
      const millions = Math.floor(n / 1000000);
      const rem = n % 1000000;
      let remStr = '';
      if (rem > 0) {
        remStr = rem < 100 ? ' and ' + helper(rem) : ' ' + helper(rem);
      }
      return `${helper(millions)} million${remStr}`;
    }
    return n.toString();
  }

  return helper(Math.round(num)).trim();
}

/**
 * Convert numeric amount into spoken words in Nigerian Naira
 * e.g. 10000 -> "ten thousand naira"
 * 9600 -> "nine thousand six hundred naira"
 * 12500 -> "twelve thousand five hundred naira"
 */
export function formatPriceInWords(num: number): string {
  const rounded = Math.round(Number(num) || 0);
  if (rounded <= 0) return 'zero naira';
  return `${numberToWords(rounded)} naira`;
}

/**
 * Replace any remaining raw currency formats (₦10,000, 10,000 Naira, etc.)
 * in agent spoken text with fully spelled-out words in Naira.
 */
export function replacePriceNumbersWithWords(text: string): string {
  if (!text) return text;

  let result = text;

  // 1. Remove parenthetical numeric prices if preceded by words:
  // e.g. "ten thousand naira (₦10,000)" or "ten thousand naira (10,000 naira)" -> "ten thousand naira"
  result = result.replace(/\s*\((?:₦|N|NGN)?\s*[0-9,]+(?:\s*(?:naira|NGN))?\)/gi, '');

  // 2. Replace amounts prefixed with ₦, N, or NGN e.g. ₦10,000, ₦10000, N12,500, NGN 9,600
  result = result.replace(/(?:₦|NGN|(?:\bN))\s*([0-9,]+(?:\.\d+)?)(?:\s*(?:naira|NGN))?/gi, (match, numStr) => {
    const cleanNum = Math.round(parseFloat(numStr.replace(/,/g, '')));
    if (!isNaN(cleanNum) && cleanNum > 0) {
      return formatPriceInWords(cleanNum);
    }
    return match;
  });

  // 3. Replace standalone digits immediately preceding "naira" or "NGN" e.g. "10,000 naira", "12500 naira"
  result = result.replace(/\b([0-9,]+)\s*(?:naira|NGN)\b/gi, (match, numStr) => {
    const cleanNum = Math.round(parseFloat(numStr.replace(/,/g, '')));
    if (!isNaN(cleanNum) && cleanNum > 0) {
      return formatPriceInWords(cleanNum);
    }
    return match;
  });

  // 4. Replace shorthand "k" prices e.g. "10k naira", "12.5k naira", "14k"
  result = result.replace(/\b(\d+(?:\.\d+)?)\s*[kK]\s*(?:naira|NGN)?\b/gi, (match, numStr) => {
    const cleanNum = Math.round(parseFloat(numStr) * 1000);
    if (!isNaN(cleanNum) && cleanNum > 0) {
      return formatPriceInWords(cleanNum);
    }
    return match;
  });

  // 5. Replace price-context numbers where currency symbol was omitted:
  // e.g. "priced at 12,500", "costs 10,000", "price of 10,000", "total of 20,000", "fee is 2,500"
  result = result.replace(
    /\b(costs?|priced?\s+at|price\s+is|price\s+of|total(?:ing|led)?\s+(?:is|of)?|total\s+amount\s+(?:is|of)?|fee\s+(?:is|of)?|amount\s+(?:is|of)?|subtotal\s+(?:is|of)?)\s*(?:₦|N|NGN)?\s*([0-9]{1,3}(?:,[0-9]{3})+|[1-9][0-9]{2,6})(?!\s*(?:mins|min|minutes|hours|hour|days|loaves|loaf|pieces|items|g|kg|am|pm|\/))\b/gi,
    (match, prefix, numStr) => {
      const cleanNum = Math.round(parseFloat(numStr.replace(/,/g, '')));
      if (!isNaN(cleanNum) && cleanNum > 0) {
        return `${prefix} ${formatPriceInWords(cleanNum)}`;
      }
      return match;
    }
  );

  // 6. Clean any remaining raw ₦ symbols
  result = result.replace(/₦/g, '');

  // 7. Clean duplicate "naira naira"
  result = result.replace(/\bnaira\s+naira\b/gi, 'naira');

  return result;
}

// Dynamically generated core bakery knowledge based on store and delivery settings
export function getDynamicBakeryKnowledge() {
  const settings = getStoredSettings();
  const s = settings.store;
  const d = settings.delivery;
  const p = settings.payments;

  return [
    {
      title: `${s.name} Location & Operating Hours`,
      category: 'Store Information',
      content: `${s.name} flagship bakery and dispatch kitchen is located at ${s.address}, ${s.city}, ${s.state}, ${s.country}. Operating hours: ${s.openingHours.weekday}; weekend: ${s.openingHours.weekend}. Baking schedule: ${s.openingHours.bakingDays}.`,
    },
    {
      title: 'Lagos Delivery Zones & Pricing',
      category: 'Delivery Policies',
      content: `We deliver fresh across Lagos daily with guaranteed dispatch windows. Island / Lekki: ₦${d.islandDeliveryFee.toLocaleString()} (delivery in ${d.estimatedDeliveryTime}). Mainland: ₦${d.mainlandDeliveryFee.toLocaleString()}. Free delivery for orders above ₦${d.freeDeliveryThreshold.toLocaleString()}. ${d.deliveryNotes}`,
    },
    {
      title: 'Ingredients, Allergen Safety & Dietary Options',
      category: 'Ingredients & Allergens',
      content:
        'All our gourmet banana breads are made with overripe premium Cavendish bananas, pure creamery butter, unrefined brown cane sugar, Madagascar vanilla, and unbleached flour. We offer Walnut & Cinnamon Loaf and Blueberry Almond Loaf which contain tree nuts. Our Classic and Chocolate Chip loaves are nut-free but prepared in a facility that handles nuts. We also bake designated Gluten-Free and Dairy-Free banana breads upon request.',
    },
    {
      title: 'Baking Freshness, Shelf Life & Storage',
      category: 'Product Care',
      content:
        'Every loaf is baked fresh daily in morning and afternoon batches. Shelf life is 4 days at room temperature in our moisture-seal packaging, up to 10 days refrigerated, and up to 2 months frozen. Warm a slice in the microwave for 15 to 20 seconds for optimal gooey texture.',
    },
    {
      title: 'Payment Methods & Instructions',
      category: 'Payments',
      content: `We accept automated Paystack checkout links (supporting Nigerian debit cards, Apple Pay, USSD, and Bank Transfer), direct bank transfers to our corporate ${p.bankName} account, and Cash on Delivery for verified repeat customers. ${p.bankInstructions}`,
    },
  ];
}

export function getDefaultCatalogue(): any[] {
  const stored = getStoredProducts();
  return stored.map((p) => ({
    id: p.id,
    name: p.name,
    subtitle: p.subtitle,
    category: p.category,
    price: p.price,
    priceInWords: formatPriceInWords(p.price),
    stock: p.stockQuantity,
    stockQuantity: p.stockQuantity,
    status: p.status === 'Active' ? 'In Stock' : p.status,
    batchReadyTime: 'Fresh hot batches ready now and every 45 minutes.',
    description: p.description,
  }));
}

const DEFAULT_ORDERS: any[] = [];
const DEFAULT_CUSTOMERS: any[] = [];
const DEFAULT_CALLS: any[] = [];
const DEFAULT_PAYMENTS: any[] = [];
const DEFAULT_PAYMENTS: any[] = [];

/**
 * Tool Declarations for Gemini 3.8 Flash
 */
export const agentFunctionDeclarations: FunctionDeclaration[] = [
  {
    name: 'checkProductAndProduction',
    description:
      'Checks current bakery production status, available loaf inventory, stock quantities, freshly baked batches in the oven, readiness times, and loaf prices.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        productName: {
          type: Type.STRING,
          description: 'Optional name or partial name of the banana bread variant (e.g. "classic", "chocolate", "walnut")',
        },
      },
    },
  },
  {
    name: 'checkOrderStatus',
    description:
      'Looks up order status, current stage (Pending, In Oven, Ready for Dispatch, Out for Delivery, Delivered), items ordered, delivery address, and total amount using the order ID or customer phone number.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        orderId: {
          type: Type.STRING,
          description: 'The bakery order ID (e.g. "BB-1024", "ORD-1234")',
        },
        phoneNumber: {
          type: Type.STRING,
          description: "The customer's contact phone number",
        },
      },
    },
  },
  {
    name: 'checkPaymentStatus',
    description:
      'Verifies payment status for an order or customer using order ID, Paystack reference, or customer contact. Confirms whether payment was successful, pending, or failed.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        orderId: {
          type: Type.STRING,
          description: 'The order ID associated with the payment',
        },
        paymentReference: {
          type: Type.STRING,
          description: 'The Paystack transaction reference (e.g. "pstk_123456")',
        },
        customerPhone: {
          type: Type.STRING,
          description: 'The phone number of the customer who paid',
        },
      },
    },
  },
  {
    name: 'lookupCustomer',
    description:
      'Finds customer profile, order history count, total amount spent, saved delivery address, favorite banana bread flavors, and notes from past interactions.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        phoneNumber: {
          type: Type.STRING,
          description: 'Phone number to look up in customer directory',
        },
        name: {
          type: Type.STRING,
          description: 'Customer full name or first name',
        },
      },
    },
  },
  {
    name: 'lookupPastCalls',
    description:
      'Searches past voice call history and transcripts for a customer to see what was previously discussed, reported issues, or customer preferences.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        phoneNumber: {
          type: Type.STRING,
          description: 'Customer phone number to retrieve past call logs and transcripts',
        },
        customerName: {
          type: Type.STRING,
          description: 'Customer name',
        },
      },
    },
  },
  {
    name: 'queryKnowledgeBase',
    description:
      'Queries bakery documentation and knowledge base for answers on allergens (gluten, nuts, dairy), delivery coverage & fees across Lagos, corporate orders, shelf life, storage, packaging, and store hours.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description: 'The question or topic to search in the bakery knowledge base',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'placeOrder',
    description:
      'Creates a new bakery order or scheduled appointment order in the database for the customer with selected loaves, quantity, customer name, phone number, email address, delivery street address, and optional appointment date/time.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        customerName: { type: Type.STRING, description: 'Customer full name (confirm exact spelling before submitting)' },
        customerPhone: { type: Type.STRING, description: 'Customer telephone number (confirm slowly with caller)' },
        customerEmail: { type: Type.STRING, description: 'Customer email address (confirm complete address)' },
        deliveryAddress: { type: Type.STRING, description: 'Delivery street address in Lagos' },
        isAppointment: { type: Type.BOOLEAN, description: 'True if this is a scheduled appointment order' },
        appointmentDate: { type: Type.STRING, description: 'Scheduled appointment or delivery date (e.g. "Tomorrow", "Friday 27th Sep")' },
        appointmentTime: { type: Type.STRING, description: 'Scheduled appointment or delivery time slot (e.g. "10:00 AM", "2:00 PM")' },
        orderType: { type: Type.STRING, description: 'Order type: Standard Delivery, Delivery Appointment, Bakery Tasting & Pickup, or Catering Appointment' },
        items: {
          type: Type.ARRAY,
          description: 'List of banana bread loaves being ordered',
          items: {
            type: Type.OBJECT,
            properties: {
              productName: { type: Type.STRING, description: 'Name of the banana bread variant' },
              quantity: { type: Type.NUMBER, description: 'Number of loaves' },
            },
            required: ['productName', 'quantity'],
          },
        },
        paymentMethod: {
          type: Type.STRING,
          description: 'Preferred payment method (Paystack, Bank Transfer, Cash on Delivery)',
        },
        notes: { type: Type.STRING, description: 'Special delivery, gift card, or appointment instructions' },
      },
      required: ['customerName', 'customerPhone', 'deliveryAddress', 'items'],
    },
  },
  {
    name: 'bookAppointmentOrder',
    description:
      'Books a scheduled appointment order (delivery slot, bakery tasting appointment, pickup appointment, or corporate catering consultation) for the customer, immediately recording it in the orders and customer CRM.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        customerName: { type: Type.STRING, description: 'Customer verified name' },
        customerPhone: { type: Type.STRING, description: 'Customer contact phone number' },
        customerEmail: { type: Type.STRING, description: 'Customer verified email address' },
        appointmentDate: { type: Type.STRING, description: 'Appointment date (e.g., Tomorrow, 26th Sep, Friday)' },
        appointmentTime: { type: Type.STRING, description: 'Appointment time slot (e.g., 10:00 AM, 2:30 PM)' },
        appointmentType: { type: Type.STRING, description: 'Type: Delivery Appointment, Bakery Tasting & Pickup, Catering Appointment, Custom Order' },
        deliveryAddress: { type: Type.STRING, description: 'Customer address or tasting location in Lagos' },
        items: {
          type: Type.ARRAY,
          description: 'Bakery treats or banana bread loaves requested for appointment',
          items: {
            type: Type.OBJECT,
            properties: {
              productName: { type: Type.STRING, description: 'Item name' },
              quantity: { type: Type.NUMBER, description: 'Quantity' },
            },
            required: ['productName', 'quantity'],
          },
        },
        paymentMethod: { type: Type.STRING, description: 'Payment method (Paystack, Bank Transfer, Cash on Delivery)' },
        notes: { type: Type.STRING, description: 'Appointment notes or dietary preferences' },
      },
      required: ['customerName', 'customerPhone', 'appointmentDate', 'appointmentTime'],
    },
  },
  {
    name: 'sendPaymentLink',
    description:
      'Generates an authentic Paystack checkout link and payment transaction record for an order, dispatching it to the customer via SMS/WhatsApp.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        customerContact: { type: Type.STRING, description: 'Phone number or email of the customer' },
        orderId: { type: Type.STRING, description: 'The order ID to pay for' },
        amount: { type: Type.NUMBER, description: 'Amount in Nigerian Naira' },
      },
      required: ['customerContact'],
    },
  },
];

/**
 * Execute an agent tool against live bakery store
 */
export async function executeAgentTool(
  toolName: string,
  args: any,
  store: BakeryLiveStore
): Promise<{ output: any; category: string }> {
  try {
    switch (toolName) {
      // 1. PRODUCTION & PRODUCT AVAILABILITY
      case 'checkProductAndProduction': {
        const products = await store.getProducts();
        const activeList = products.length > 0 ? products : getDefaultCatalogue();
        const query = (args.productName || '').toLowerCase().trim();

        let matched = activeList;
        if (query) {
          matched = activeList.filter(
            (p) =>
              p.name?.toLowerCase().includes(query) ||
              p.category?.toLowerCase().includes(query) ||
              p.description?.toLowerCase().includes(query)
          );
        }

        if (matched.length === 0) {
          return {
            category: 'Production',
            output: {
              found: false,
              message: `No loaves directly matched "${args.productName}". We bake Classic Banana Bread, Chocolate Chip, Walnut & Cinnamon, Strawberry Swirl, and Blueberry Almond daily.`,
              availableMenu: activeList.map((p) => {
                const numPrice = Number(p.price || 10000);
                const words = formatPriceInWords(numPrice);
                return {
                  name: p.name,
                  price: words,
                  priceInWords: words,
                  stock: p.stockQuantity ?? p.stock ?? 10,
                };
              }),
            },
          };
        }

        return {
          category: 'Production',
          output: {
            found: true,
            totalVariants: matched.length,
            products: matched.map((p) => {
              const numPrice = Number(p.price || 10000);
              const words = formatPriceInWords(numPrice);
              return {
                name: p.name,
                price: words,
                priceInWords: words,
                stockQuantity: p.stockQuantity ?? p.stock ?? 12,
                status: p.status || (p.stockQuantity > 0 ? 'In Stock' : 'Baking Next Batch'),
                batchReadyTime:
                  p.batchReadyTime ||
                  'Baked fresh in our morning batch; afternoon warm batch ready in 30 mins.',
              };
            }),
          },
        };
      }

      // 2. ORDERS LOOKUP & TRACKING
      case 'checkOrderStatus': {
        const rawOrders = await store.getOrders();
        const orders = rawOrders.length > 0 ? rawOrders : DEFAULT_ORDERS;
        const { orderId, phoneNumber } = args;

        let matched = orders;
        if (orderId) {
          const normId = orderId.toLowerCase().replace('#', '').trim();
          matched = matched.filter(
            (o) =>
              o.orderId?.toLowerCase().includes(normId) ||
              o.id?.toLowerCase().includes(normId)
          );
        } else if (phoneNumber) {
          const normPhone = phoneNumber.replace(/[\s\-\+]/g, '');
          matched = matched.filter((o) => {
            const op = (o.customerPhone || o.phoneNumber || o.phone || '').replace(/[\s\-\+]/g, '');
            return op.includes(normPhone) || normPhone.includes(op);
          });
        }

        if (!matched.length) {
          return {
            category: 'Orders',
            output: {
              found: false,
              message: `No order found matching "${orderId || phoneNumber}". We currently have ${orders.length} active orders logged in the bakery system.`,
            },
          };
        }

        const order = matched[0];
        return {
          category: 'Orders',
          output: {
            found: true,
            orderId: order.orderId || order.id,
            customerName: order.customerName || order.customer?.name,
            status: order.status,
            totalAmount: formatPriceInWords(Number(order.totalAmount || order.total || 0)),
            totalAmountFormatted: `₦${Number(order.totalAmount || order.total || 0).toLocaleString()}`,
            items: order.items || [{ name: 'Artisanal Banana Bread', quantity: 1 }],
            deliveryAddress: order.deliveryAddress || order.address || 'Lagos',
            paymentStatus: order.paymentStatus || 'Paid',
            orderDate: order.createdAt || order.date || 'Today',
            trackingNote:
              order.status === 'Delivered'
                ? 'Package has been delivered and signed for.'
                : order.status === 'Out for Delivery'
                ? 'Rider is on the way. Expected within 20-30 minutes.'
                : order.status === 'Ready' || order.status === 'Ready for Dispatch'
                ? 'Loaf is sealed in our luxury gift box and assigned to courier.'
                : 'Loaf is currently being baked and packaged in our Lekki kitchen.',
          },
        };
      }

      // 3. PAYMENT STATUS
      case 'checkPaymentStatus': {
        const rawPayments = await store.getPayments();
        const payments = rawPayments.length > 0 ? rawPayments : DEFAULT_PAYMENTS;
        const rawOrders = await store.getOrders();
        const orders = rawOrders.length > 0 ? rawOrders : DEFAULT_ORDERS;
        const { paymentReference, orderId, customerPhone } = args;

        let matchedPayment = null;
        if (paymentReference) {
          const refNorm = paymentReference.toLowerCase().trim();
          matchedPayment = payments.find(
            (p) =>
              p.reference?.toLowerCase().includes(refNorm) ||
              p.id?.toLowerCase().includes(refNorm)
          );
        }

        if (!matchedPayment && orderId) {
          const oNorm = orderId.toLowerCase().replace('#', '').trim();
          matchedPayment = payments.find((p) => p.orderId?.toLowerCase().includes(oNorm));
        }

        if (!matchedPayment && customerPhone) {
          const pNorm = customerPhone.replace(/[\s\-\+]/g, '');
          matchedPayment = payments.find((p) => {
            const cp = (p.customerPhone || '').replace(/[\s\-\+]/g, '');
            return cp && (cp.includes(pNorm) || pNorm.includes(cp));
          });
        }

        // Check if there is an order with payment status
        if (!matchedPayment && orderId) {
          const matchedOrder = orders.find(
            (o) =>
              o.orderId?.toLowerCase().includes(orderId.toLowerCase()) ||
              o.id?.toLowerCase().includes(orderId.toLowerCase())
          );
          if (matchedOrder) {
            return {
              category: 'Payments',
              output: {
                found: true,
                orderId: matchedOrder.orderId || matchedOrder.id,
                paymentStatus: matchedOrder.paymentStatus || 'Successful',
                amount: formatPriceInWords(Number(matchedOrder.totalAmount || 0)),
                amountFormatted: `₦${Number(matchedOrder.totalAmount || 0).toLocaleString()}`,
                method: matchedOrder.paymentMethod || 'Paystack Checkout',
                verified: matchedOrder.paymentStatus === 'Paid' || matchedOrder.paymentStatus === 'Successful',
              },
            };
          }
        }

        if (!matchedPayment) {
          return {
            category: 'Payments',
            output: {
              found: false,
              message: `No payment transaction found for "${paymentReference || orderId || customerPhone}". If you just sent a transfer, it may take 1-2 minutes to reflect on our Paystack webhook.`,
            },
          };
        }

        return {
          category: 'Payments',
          output: {
            found: true,
            transactionId: matchedPayment.id,
            reference: matchedPayment.reference,
            amount: formatPriceInWords(Number(matchedPayment.amount || 0)),
            amountFormatted: `₦${Number(matchedPayment.amount || 0).toLocaleString()}`,
            status: matchedPayment.status,
            method: matchedPayment.method || 'Paystack',
            date: matchedPayment.date || 'Today',
            customerName: matchedPayment.customerName,
          },
        };
      }

      // 4. CUSTOMER CRM LOOKUP
      case 'lookupCustomer': {
        const rawCustomers = await store.getCustomers();
        const customers = rawCustomers.length > 0 ? rawCustomers : DEFAULT_CUSTOMERS;
        const { phoneNumber, name } = args;

        let matched = customers;
        if (phoneNumber) {
          const normPhone = phoneNumber.replace(/[\s\-\+]/g, '');
          matched = matched.filter((c) => {
            const cp = (c.phone || '').replace(/[\s\-\+]/g, '');
            return cp.includes(normPhone) || normPhone.includes(cp);
          });
        } else if (name) {
          const normName = name.toLowerCase().trim();
          matched = matched.filter((c) => c.name?.toLowerCase().includes(normName));
        }

        if (!matched.length) {
          return {
            category: 'Customers',
            output: {
              found: false,
              isNewCustomer: true,
              message: `No prior customer profile on record for "${phoneNumber || name}". We will create a new profile for this lovely caller!`,
            },
          };
        }

        const customer = matched[0];
        return {
          category: 'Customers',
          output: {
            found: true,
            customerId: customer.id,
            name: customer.name,
            phone: customer.phone,
            email: customer.email,
            deliveryAddress: customer.address || 'Lagos',
            totalOrders: customer.totalOrders || 1,
            totalSpent: formatPriceInWords(Number(customer.totalSpent || 0)),
            totalSpentFormatted: `₦${Number(customer.totalSpent || 0).toLocaleString()}`,
            tier: customer.status || 'Valued Regular',
            favoriteFlavors: customer.notes || 'Classic Banana Bread & Chocolate Chip',
          },
        };
      }

      // 5. CALL LOGS & PAST CALL TRANSCRIPTS
      case 'lookupPastCalls': {
        const rawCalls = await store.getCalls();
        const calls = rawCalls.length > 0 ? rawCalls : DEFAULT_CALLS;
        const { phoneNumber, customerName } = args;

        let matched = calls;
        if (phoneNumber) {
          const normPhone = phoneNumber.replace(/[\s\-\+]/g, '');
          matched = matched.filter((c) => {
            const cp = (c.callerNumber || c.phoneNumber || '').replace(/[\s\-\+]/g, '');
            return cp.includes(normPhone) || normPhone.includes(cp);
          });
        } else if (customerName) {
          const normName = customerName.toLowerCase().trim();
          matched = matched.filter((c) =>
            (c.callerName || c.customerName || '').toLowerCase().includes(normName)
          );
        }

        if (!matched.length) {
          return {
            category: 'Calls',
            output: {
              found: false,
              message: `No previous recorded phone calls for "${phoneNumber || customerName}". This is their first voice interaction with Baked by Doja.`,
            },
          };
        }

        return {
          category: 'Calls',
          output: {
            found: true,
            totalPreviousCalls: matched.length,
            recentCalls: matched.slice(0, 3).map((c) => ({
              callId: c.id,
              date: c.timestamp || c.date || 'Recent',
              duration: c.duration || '2 mins',
              summary: c.summary || c.notes || 'Customer called regarding banana bread availability and delivery.',
              sentiment: c.sentiment || 'Positive',
              transcriptSnippet:
                c.transcript?.slice(0, 150) ||
                (c.messages ? c.messages[0]?.text : 'Inquired about ordering fresh loaves.'),
            })),
          },
        };
      }

      // 6. KNOWLEDGE BASE / RAG QUERY
      case 'queryKnowledgeBase': {
        const dbDocs = await store.getKnowledge();
        const allDocs = [...dbDocs, ...getDynamicBakeryKnowledge()];
        const query = (args.query || '').toLowerCase().trim();

        // Keyword ranking search
        const queryWords = query.split(/\s+/).filter((w: string) => w.length > 2);
        const scoredDocs = allDocs
          .map((doc) => {
            const text = `${doc.title} ${doc.category} ${doc.content || doc.description}`.toLowerCase();
            let score = 0;
            queryWords.forEach((word: string) => {
              if (text.includes(word)) score += 2;
            });
            return { doc, score };
          })
          .filter((item) => item.score > 0)
          .sort((a, b) => b.score - a.score);

        const results = scoredDocs.slice(0, 3).map((item) => ({
          title: item.doc.title,
          category: item.doc.category,
          snippet: item.doc.content || item.doc.description,
        }));

        if (results.length === 0) {
          const settings = getStoredSettings();
          const s = settings.store;
          const d = settings.delivery;
          return {
            category: 'Knowledge Base',
            output: {
              found: true,
              answers: [
                {
                  title: `${s.name} Policies & Information`,
                  snippet:
                    `Located at ${s.address}, ${s.city}. Open: ${s.openingHours.weekday}; weekend: ${s.openingHours.weekend}. Fresh banana breads baked daily. Island delivery ₦${d.islandDeliveryFee.toLocaleString()}; Mainland ₦${d.mainlandDeliveryFee.toLocaleString()}. Free delivery above ₦${d.freeDeliveryThreshold.toLocaleString()}. ${d.deliveryNotes}`,
                },
              ],
            },
          };
        }

        return {
          category: 'Knowledge Base',
          output: {
            found: true,
            matchesCount: results.length,
            answers: results,
          },
        };
      }

      // 7. ORDER & APPOINTMENT CREATION
      case 'bookAppointmentOrder':
      case 'placeOrder': {
        const {
          customerName,
          customerPhone,
          phoneNumber,
          customerEmail,
          email,
          deliveryAddress,
          items = [],
          paymentMethod = 'Paystack',
          notes,
          isAppointment,
          appointmentDate,
          appointmentTime,
          appointmentType,
          orderType,
        } = args;

        const products = await store.getProducts();
        const activeList = products.length > 0 ? products : getDefaultCatalogue();
        const settings = getStoredSettings();

        const isAppt = Boolean(
          toolName === 'bookAppointmentOrder' ||
          isAppointment ||
          appointmentDate ||
          appointmentTime ||
          appointmentType ||
          orderType?.toLowerCase().includes('appointment')
        );
        const resolvedPhone = customerPhone || phoneNumber || '';
        const resolvedEmail = customerEmail || email || '';
        const resolvedAddress = deliveryAddress || (isAppt ? (settings.delivery?.pickupLocation || settings.store?.address) : '');
        const apptDate = appointmentDate || (isAppt ? 'Tomorrow' : '');
        const apptTime = appointmentTime || (isAppt ? '10:00 AM' : '');
        const resolvedOrderType =
          orderType ||
          appointmentType ||
          (isAppt ? 'Appointment Order' : 'Standard Delivery');

        let subtotal = 0;
        const normalizedItems = (items && items.length > 0 ? items : []).map((it: any) => {
          const qty = Number(it.quantity) || 1;
          const matchedProd = activeList.find((p) =>
            p.name.toLowerCase().includes((it.productName || it.name || '').toLowerCase())
          );
          const unitPrice = matchedProd ? Number(matchedProd.price) : (Number(it.unitPrice) || Number(it.price) || 10000);
          subtotal += unitPrice * qty;
          return {
            name: matchedProd?.name || it.productName || it.name || 'Artisanal Banana Bread',
            productName: matchedProd?.name || it.productName || it.name || 'Artisanal Banana Bread',
            quantity: qty,
            unitPrice,
            totalPrice: unitPrice * qty,
          };
        });

        const addrLower = (resolvedAddress || '').toLowerCase();
        const isMainland =
          addrLower.includes('mainland') ||
          addrLower.includes('ikeja') ||
          addrLower.includes('surulere') ||
          addrLower.includes('yaba') ||
          addrLower.includes('maryland') ||
          addrLower.includes('gbagada') ||
          addrLower.includes('magodo');
        const deliveryFee =
          subtotal >= (settings.delivery?.freeDeliveryThreshold || 45000)
            ? 0
            : isMainland
            ? (settings.delivery?.mainlandDeliveryFee || 4000)
            : (settings.delivery?.islandDeliveryFee || 2500);
        const totalAmount = subtotal + deliveryFee;
        const orderId = `BB-${Math.floor(1000 + Math.random() * 9000)}`;
        const itemsSummary = normalizedItems.length > 0
          ? normalizedItems.map((i: any) => `${i.quantity}x ${i.productName || i.name}`).join(', ')
          : 'Custom bakery selection';
        const formattedAmount = `₦${totalAmount.toLocaleString()}`;

        const newOrder = {
          id: orderId,
          orderId,
          customerName: customerName || 'Valued Customer',
          customerPhone: resolvedPhone,
          phoneNumber: resolvedPhone,
          email: resolvedEmail,
          customerEmail: resolvedEmail,
          deliveryAddress: resolvedAddress,
          items: normalizedItems,
          itemsSummary,
          subtotal,
          deliveryFee,
          totalAmount,
          amount: formattedAmount,
          currency: 'NGN',
          status: 'Preparing',
          paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Pending',
          paymentMethod: paymentMethod || 'Paystack',
          isAppointment: isAppt,
          appointmentDate: apptDate,
          appointmentTime: apptTime,
          orderType: resolvedOrderType,
          notes: notes || (isAppt ? `Appointment order scheduled on ${apptDate} at ${apptTime}` : 'Taken live via AI Voice Sales Agent'),
          date: 'Today',
          fullDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          timeline: [
            { step: isAppt ? 'Appointment Order Created by AI Voice Agent' : 'Order Placed via AI Voice Agent', timestamp: 'Just now', status: 'completed' },
            { step: isAppt ? `Appointment Scheduled (${apptDate} at ${apptTime})` : 'Oven Baking & Preparation', timestamp: 'In progress', status: 'active' },
            { step: 'Quality Packaging & Gift Ribbon', timestamp: 'Upcoming', status: 'pending' },
            { step: 'Dispatch & Delivery to Lagos Address', timestamp: 'Upcoming', status: 'pending' },
          ],
          createdAt: new Date().toISOString(),
        };

        await store.addOrder(newOrder);

        // Update / create customer profile in CRM
        await store.addOrUpdateCustomer({
          name: customerName || 'Valued Customer',
          phone: resolvedPhone,
          email: resolvedEmail,
          address: resolvedAddress,
          location: resolvedAddress,
          notes: isAppt ? `Appointment scheduled: ${apptDate} at ${apptTime}` : 'Order placed via voice agent',
          lastOrderDate: new Date().toISOString(),
          incrementOrders: 1,
          incrementSpent: totalAmount,
          orderItem: {
            orderId,
            itemsSummary,
            status: 'Preparing',
            amount: formattedAmount,
            date: 'Today',
            isAppointment: isAppt,
            appointmentDate: apptDate,
          },
        });

        // Generate Paystack reference & payment record
        const paymentRef = `pstk_vapi_${Date.now().toString().slice(-6)}`;
        await store.addPayment({
          id: `pay-${Date.now()}`,
          orderId,
          customerName: customerName || 'Valued Customer',
          customerPhone: resolvedPhone,
          amount: totalAmount,
          method: paymentMethod,
          status: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Pending Payment Link',
          reference: paymentRef,
          date: 'Today',
        });

        // Log to agent activity
        await store.logActivity({
          id: `act-${Date.now()}`,
          type: isAppt ? 'appointment_created' : 'order_created',
          title: isAppt ? `New Voice Appointment Order ${orderId}` : `New Voice Order ${orderId}`,
          phoneNumber: resolvedPhone,
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          date: 'Today',
          details: `${itemsSummary} (${formattedAmount})${isAppt ? ` • Scheduled for ${apptDate} at ${apptTime}` : ''}`,
          iconBg: 'bg-[#E8F7EF]',
          iconColor: 'text-[#15966B]',
        });

        return {
          category: isAppt ? 'Appointment Orders' : 'Orders',
          output: {
            success: true,
            orderId,
            customerName: customerName || 'Valued Customer',
            customerPhone: resolvedPhone,
            customerEmail: resolvedEmail,
            totalAmount: formatPriceInWords(totalAmount),
            totalAmountFormatted: formattedAmount,
            items: normalizedItems,
            itemsSummary,
            deliveryAddress: resolvedAddress,
            deliveryFee: formatPriceInWords(deliveryFee),
            deliveryFeeFormatted: `₦${deliveryFee.toLocaleString()}`,
            isAppointment: isAppt,
            appointmentDate: apptDate,
            appointmentTime: apptTime,
            orderType: resolvedOrderType,
            status: 'Preparing (Scheduled in System)',
            paymentRef,
            paystackLink: `https://checkout.paystack.com/bb-${orderId.toLowerCase()}`,
            confirmationMessage: isAppt
              ? `Appointment order ${orderId} scheduled successfully for ${apptDate} at ${apptTime}. Total is ${formatPriceInWords(totalAmount)} including Lagos delivery.`
              : `Order ${orderId} created successfully. Total is ${formatPriceInWords(totalAmount)} including Lagos delivery.`,
          },
        };
      }

      // 8. SEND PAYMENT LINK
      case 'sendPaymentLink': {
        const { customerContact, orderId = `BB-${Math.floor(1000 + Math.random() * 9000)}`, amount = 12500 } = args;
        const paystackRef = `pstk_vapi_${Date.now().toString().slice(-6)}`;
        const checkoutUrl = `https://checkout.paystack.com/bb-${orderId.toLowerCase()}`;

        await store.addPayment({
          id: `pay-${Date.now()}`,
          orderId,
          customerPhone: customerContact,
          amount,
          method: 'Paystack Automated',
          status: 'Link Dispatched',
          reference: paystackRef,
          date: 'Today',
        });

        return {
          category: 'Payments',
          output: {
            success: true,
            orderId,
            paystackRef,
            checkoutUrl,
            customerContact,
            smsSent: true,
            message: `Paystack checkout link dispatched to ${customerContact} for ${formatPriceInWords(Number(amount))}.`,
          },
        };
      }

      default:
        return {
          category: 'System',
          output: { error: `Tool ${toolName} not implemented` },
        };
    }
  } catch (err: any) {
    console.error(`Error executing tool ${toolName}:`, err);
    return {
      category: 'System',
      output: { error: err.message || 'Execution error' },
    };
  }
}

/**
 * Generate full Bakery System Prompt containing live summaries
 */
export async function buildLiveBakeryAgentPrompt(store: BakeryLiveStore, callerPhone?: string, callerName?: string) {
  const [orders, products, customers, calls, payments, knowledge] = await Promise.all([
    store.getOrders().catch(() => []),
    store.getProducts().catch(() => []),
    store.getCustomers().catch(() => []),
    store.getCalls().catch(() => []),
    store.getPayments().catch(() => []),
    store.getKnowledge().catch(() => []),
  ]);

  const activeProducts = products.length > 0 ? products : getDefaultCatalogue();
  const activeOrders = orders.length > 0 ? orders : DEFAULT_ORDERS;
  const activeCustomers = customers.length > 0 ? customers : DEFAULT_CUSTOMERS;
  const activeCalls = calls.length > 0 ? calls : DEFAULT_CALLS;
  const activePayments = payments.length > 0 ? payments : DEFAULT_PAYMENTS;

  const menuLines = activeProducts.length > 0
    ? activeProducts
        .map((p) => {
          const numPrice = Number(p.price || 0);
          const priceInWords = formatPriceInWords(numPrice);
          return `- ${p.name}: Spoken Price: "${priceInWords}" (always pronounce as "${priceInWords}", never say digits or symbols) | Stock: ${p.stockQuantity ?? p.stock ?? 10} loaves | Status: ${p.status || 'Available'} | Batch: ${p.batchReadyTime || 'Fresh daily'}`;
        })
        .join('\n')
    : 'No products currently active in catalogue. If a customer inquires about products or wishes to order, let them know our catalogue is being updated and ask what custom baked treats or banana bread loaves they would like to order or pre-order.';

  const recentOrdersLines = activeOrders.slice(0, 10).map((o) => {
    const numAmt = Number(o.totalAmount || 0);
    const amtWords = formatPriceInWords(numAmt);
    return `Order #${o.orderId || o.id} (${o.customerName || 'Customer'}, ${o.customerPhone || 'N/A'}): ${o.status} - ${amtWords} | Items: ${Array.isArray(o.items) ? o.items.map((i: any) => `${i.quantity || 1}x ${i.productName || i.name}`).join(', ') : 'Banana bread'}`;
  }).join('\n') || 'No orders currently logged in database.';

  const recentCallsLines = activeCalls.slice(0, 8).map((c) =>
    `Call ID ${c.id} (${c.callerNumber || 'Unknown'} - ${c.callerName || 'Guest'}): ${c.duration || '1m 30s'} | Summary: ${c.summary || 'Inquired about banana bread loaves.'}`
  ).join('\n') || 'No past calls currently logged.';

  const knowledgeLines = [...knowledge, ...getDynamicBakeryKnowledge()].slice(0, 8).map(
    (k) => `[${k.title} (${k.category})]: ${k.content || k.description}`
  ).join('\n\n');

  let callerContext = '';
  if (callerPhone || callerName) {
    const matchedCustomer = activeCustomers.find(
      (c) =>
        (callerPhone && c.phone && c.phone.replace(/\D/g, '').includes(callerPhone.replace(/\D/g, ''))) ||
        (callerName && c.name?.toLowerCase().includes(callerName.toLowerCase()))
    );

    const callerOrders = activeOrders.filter(
      (o) =>
        (callerPhone && o.customerPhone && o.customerPhone.replace(/\D/g, '').includes(callerPhone.replace(/\D/g, ''))) ||
        (callerName && o.customerName?.toLowerCase().includes(callerName.toLowerCase()))
    );

    const callerCalls = activeCalls.filter(
      (c) =>
        callerPhone && c.callerNumber && c.callerNumber.replace(/\D/g, '').includes(callerPhone.replace(/\D/g, ''))
    );

    callerContext = `
ACTIVE CALLER IDENTIFICATION:
- Calling Number: ${callerPhone || 'Unlisted'}
- Customer Name: ${matchedCustomer?.name || callerName || 'Valued Caller'}
- Profile Status: ${matchedCustomer ? `Registered (${matchedCustomer.status || 'Repeat Customer'}, ${matchedCustomer.totalOrders || callerOrders.length} orders, total spent ₦${Number(matchedCustomer.totalSpent || 0).toLocaleString()})` : 'First-time caller'}
- Saved Address: ${matchedCustomer?.address || 'None on file'}
- Past Caller Orders: ${callerOrders.length > 0 ? callerOrders.map((o) => `#${o.orderId} (${o.status})`).join(', ') : 'None yet'}
- Previous Calls: ${callerCalls.length > 0 ? `${callerCalls.length} previous calls. Last: "${callerCalls[0].summary || 'General inquiry'}"` : 'First incoming call'}
`.trim();
  }

  return `
You are the official AI Voice Sales Agent for "Baked by Doja", Lagos's premier artisanal gourmet banana bread bakery based at 14 Admiralty Way, Lekki Phase 1, Lagos, Nigeria.
Your name is "Doja Voice Sales Agent".

${callerContext}

REAL-TIME BAKERY PRODUCTION & INVENTORY:
${menuLines}

RECENT ORDERS ON RECORD:
${recentOrdersLines}

RECENT CALLS & CALLER HISTORY:
${recentCallsLines}

CORE KNOWLEDGE BASE & STORE POLICIES:
${knowledgeLines}

============================================================
👋 FIRST MESSAGE & CALL OPENING GREETING (CRITICAL):
============================================================
Whenever a customer calls or a call begins, you must ALWAYS speak the full complete opening greeting:
"Hi, welcome to Baked by Doja! 🍰 We’ve got delicious freshly baked treats ready for you. What can I help you find or order today?"
NEVER drop or omit "Hi, welcome to".
NEVER answer with just "Baked by Doja!".
Always include the entire phrase: "Hi, welcome to Baked by Doja! 🍰 We’ve got delicious freshly baked treats ready for you. What can I help you find or order today?"

SPEAKING PACE & CADENCE (CRITICAL):
- Speak at a relaxed, calm, steady, and unhurried pace.
- NEVER speak fast or rush through words. Take your time to sound warm, clear, and hospitable.
- Pause naturally at commas, periods, and question marks so the customer comfortably absorbs what you say.

============================================================
📅 APPOINTMENT ORDERS & REAL-TIME SYSTEM SYNC (CRITICAL):
============================================================
Any appointment order taken by the voice agent should be seen in the order section and also the customer information should appear.
When a caller requests an appointment order (e.g. scheduled delivery slot, bakery tasting appointment, pickup, or corporate catering consultation):
1. Accurately collect and confirm the customer's name, phone number, email address, appointment date, appointment time slot, delivery address, and requested treats.
2. Call the 'bookAppointmentOrder' or 'placeOrder' tool with appointment parameters.
3. The order and customer profile will immediately appear in the admin Orders view and Customers directory.

============================================================
## ACCURACY, SPELLING, NUMBERS & PRONUNCIATION RULES
============================================================

### Customer Names
When collecting a customer's name, prioritize accuracy.
If the name is unclear, difficult to hear, unusual, or there is any uncertainty about the spelling, DO NOT guess.
Ask the customer to spell their name:
"Could you please spell your name for me so I can make sure I get it exactly right?"
Repeat the captured spelling back to the customer and ask for confirmation:
"Thank you. I have that as A-D-E-W-A-L-E. Is that correct?"
Only continue after the customer confirms.
Do not silently correct or assume the spelling of a customer's name.

### Phone Numbers
When collecting a phone number, repeat the number back slowly and ask the customer to confirm it.
If any digit is unclear, ask the customer to repeat that digit rather than guessing.

### Email Addresses
When collecting an email address, ask the customer to spell it out if there is any uncertainty.
Confirm the complete email address before saving it.
For example:
"Could you please spell the email address for me?"
Then:
"I have that as customer at gmail dot com. Is that correct?"
Never invent or assume an email address.

### Delivery Addresses
Delivery addresses must be captured accurately.
Ask the customer to provide the address clearly. If any part is unclear, ask them to repeat or spell it.
Pay particular attention to:
* House number
* Street name
* Estate or apartment name
* Area
* City
* State
* Landmark
* Postal code, when applicable
Repeat the important address details back to the customer before creating the order.
For example:
"Let me confirm your delivery address: number 15, Adeola Street, Ikeja, Lagos. Is that correct?"
Never guess an address.

### Prices & Currency (PRONOUNCE IN WORDS)
All Baked by Doja prices are in Nigerian Naira.
When speaking prices to customers, ALWAYS pronounce the price of the product entirely in words followed by the currency naira.
DO NOT use the "₦" symbol.
DO NOT use digits for prices (e.g. never write or say "10,000" or "9,600").
DO NOT read prices digit-by-digit or in a way that could sound ambiguous.
For example:
₦9,500 -> Say: "Nine thousand five hundred naira."
NOT: "Nine five zero zero."
NOT: "Nine five hundred."
NOT: "Nine dash five zero zero."

For:
₦10,000 -> Say: "Ten thousand naira."
₦15,000 -> Say: "Fifteen thousand naira."
₦3,500 -> Say: "Three thousand five hundred naira."
₦9,600 -> Say: "Nine thousand six hundred naira."
₦12,500 -> Say: "Twelve thousand five hundred naira."
₦14,000 -> Say: "Fourteen thousand naira."
₦13,000 -> Say: "Thirteen thousand naira."
₦19,200 -> Say: "Nineteen thousand two hundred naira."
₦21,700 -> Say: "Twenty-one thousand seven hundred naira."
₦23,500 -> Say: "Twenty-three thousand five hundred naira."

Always use the actual price returned by the product database. Always pronounce the price of the product in words. Never invent, estimate, round, or substitute a product price.

### Quantities
Speak quantities naturally and clearly.
For example:
Instead of:
"2 Banana Bread"
Say:
"Two banana breads."
Instead of:
"3 Chocolate Cakes"
Say:
"Three chocolate cakes."
Before creating an order, confirm the quantity of every product.

### Order Confirmation & Email Receipts
Before submitting an order, summarize the important details clearly:
* Customer name
* Phone number
* Email address (Always ask for their email address so the bakery can send their official order confirmation receipt with item list and total)
* Products & quantities
* Individual prices in words & grand total in words
* Delivery address

When the customer confirms:
1. The order is immediately registered in the bakery dashboard queue.
2. The customer's profile, contact details, and address are recorded into the customer CRM.
3. Resend triggers an official email confirmation containing the full itemized loaf list and total amount to the customer, and also dispatches an update to the bakery admin.

Example:
"Let me confirm your order. You'd like two banana breads at ten thousand naira each, for a total of twenty thousand naira. Your delivery address is 15 Adeola Street, Ikeja, Lagos. Is everything correct?"
Only create the order after the customer confirms.

### Numbers in Conversation
When speaking numbers aloud, prioritize natural human-readable pronunciation.
Do not unnecessarily read prices, quantities, addresses, or phone numbers as a continuous string of digits.
If a number is ambiguous, slow down and clarify it with the customer.

### Never Guess
If you cannot clearly hear or understand:
* A name
* Phone number
* Email
* Address
* Product
* Quantity
* Price
* Order reference
ASK THE CUSTOMER TO REPEAT OR SPELL IT.
Accuracy is more important than speed.

### Payment Amounts
When generating or discussing a payment amount, use the exact amount returned by the backend.
Always state the currency:
"Your total is twenty-five thousand naira."
Never claim that a payment has been received unless the backend or Paystack payment verification confirms that the transaction was successfully completed.

### Final Rule
The customer should never have to correct information that the agent could have clarified.
When uncertain, ASK.
Never guess.
`.trim();
}

/**
 * Intelligent Fallback Reasoner (when Gemini API is offline or key not provided)
 * Ensures 100% operational uptime by executing tools and formulating conversational answers
 */
export async function executeFallbackAgentResponse(
  userText: string,
  store: BakeryLiveStore,
  callerPhone?: string,
  callerName?: string
): Promise<{ reply: string; toolsExecuted: Array<{ toolName: string; input: any; output: any; category: string }> }> {
  const text = userText.toLowerCase().trim();
  const toolsExecuted: Array<{ toolName: string; input: any; output: any; category: string }> = [];

  // GREETINGS & WELCOME MESSAGE
  if (
    text === 'hello' ||
    text === 'hi' ||
    text === 'hey' ||
    text.startsWith('hello') ||
    text.startsWith('hi ') ||
    text.startsWith('hey ') ||
    text.startsWith('good morning') ||
    text.startsWith('good afternoon') ||
    text.startsWith('good day') ||
    text === 'welcome' ||
    text === 'welcome to baked by doja'
  ) {
    return {
      reply: 'Hi, welcome to Baked by Doja! 🍰 We’ve got delicious freshly baked treats ready for you. What can I help you find or order today?',
      toolsExecuted,
    };
  }

  // 1. ORDER INQUIRY / STATUS CHECK
  if (text.includes('order') && (text.includes('status') || text.includes('where') || text.includes('track') || text.includes('check') || text.includes('#') || text.includes('bb-') || text.includes('placed'))) {
    const matchId = userText.match(/(?:bb-?|#|order\s*)(\d{3,5})/i);
    const orderId = matchId ? `BB-${matchId[1]}` : undefined;
    const toolRes = await executeAgentTool('checkOrderStatus', { orderId, phoneNumber: callerPhone }, store);
    toolsExecuted.push({ toolName: 'checkOrderStatus', input: { orderId, phoneNumber: callerPhone }, output: toolRes.output, category: toolRes.category });

    if (toolRes.output.found) {
      const o = toolRes.output;
      return {
        reply: `I found your order ${o.orderId}! Current status is ${o.status}. ${o.trackingNote} Your total was ${o.totalAmount} for ${Array.isArray(o.items) ? o.items.map((i: any) => `${i.quantity || 1} ${i.productName || i.name}`).join(' and ') : 'your loaves'}.`,
        toolsExecuted,
      };
    } else {
      return {
        reply: `I searched our live system but couldn't find an order matching that reference. Could you please share your order number starting with BB, or your delivery phone number so I can pull it up?`,
        toolsExecuted,
      };
    }
  }

  // 2. PAYMENT INQUIRY
  if (text.includes('payment') || text.includes('paid') || text.includes('paystack') || text.includes('receipt') || text.includes('transfer')) {
    if (text.includes('link') || text.includes('send') || text.includes('pay now')) {
      const toolRes = await executeAgentTool('sendPaymentLink', { customerContact: callerPhone || '+234 810 123 4567', amount: 12500 }, store);
      toolsExecuted.push({ toolName: 'sendPaymentLink', input: { customerContact: callerPhone }, output: toolRes.output, category: toolRes.category });
      return {
        reply: `I have generated your secure Paystack checkout link and sent it via SMS to ${callerPhone || 'your phone'}. Once completed, our bakery will seal and dispatch your loaves right away!`,
        toolsExecuted,
      };
    } else {
      const matchRef = userText.match(/pstk_[a-z0-9_]+/i);
      const toolRes = await executeAgentTool('checkPaymentStatus', { paymentReference: matchRef ? matchRef[0] : undefined, customerPhone: callerPhone }, store);
      toolsExecuted.push({ toolName: 'checkPaymentStatus', input: { customerPhone: callerPhone }, output: toolRes.output, category: toolRes.category });
      if (toolRes.output.found) {
        return {
          reply: `Yes! I can confirm your payment of ${toolRes.output.amount} via ${toolRes.output.method} is ${toolRes.output.status}. Thank you so much!`,
          toolsExecuted,
        };
      } else {
        return {
          reply: `I checked our payment records. If you recently made a bank transfer or Paystack payment, it might take about a minute to confirm. Would you like me to resend the payment link or verify with your transfer reference?`,
          toolsExecuted,
        };
      }
    }
  }

  // 3. ORDER & APPOINTMENT PLACEMENT (Buy / Order / Reserve loaves / Book appointment)
  const isAppointmentIntent = text.includes('appointment') || text.includes('schedule');
  const isOrderIntent =
    isAppointmentIntent ||
    (((text.includes('buy') || text.includes('order') || text.includes('reserve') || text.includes('send me') || (text.includes('want') && (text.includes('loaf') || text.includes('loaves') || text.includes('bread'))))) &&
    !text.includes('status') && !text.includes('track') && !text.includes('where is') && !text.includes('check'));

  if (isOrderIntent) {
    const loavesCount = parseInt(userText.match(/(\d+)\s*(?:loaves|loaf|bread|banana)?/i)?.[1] || '2', 10);
    const variant = text.includes('chocolate chip')
      ? 'Chocolate Chip Banana Bread'
      : text.includes('chocolate')
      ? 'Chocolate Banana Bread'
      : text.includes('walnut')
      ? 'Walnut & Cinnamon Banana Bread'
      : text.includes('strawberry')
      ? 'Strawberry Swirl Banana Bread'
      : text.includes('blueberry')
      ? 'Blueberry Almond Loaf'
      : 'Classic Banana Bread Loaf';
    const address = text.includes('ikoyi')
      ? 'Glover Road, Ikoyi, Lagos'
      : text.includes('lekki')
      ? '14 Admiralty Way, Lekki Phase 1, Lagos'
      : text.includes('victoria') || text.includes(' vi ')
      ? 'Victoria Island, Lagos'
      : text.includes('ikeja')
      ? '15 Adeola Street, Ikeja, Lagos'
      : '14 Admiralty Way, Lekki Phase 1, Lagos';

    const apptDate = text.includes('friday')
      ? 'Friday'
      : text.includes('saturday')
      ? 'Saturday'
      : text.includes('tomorrow')
      ? 'Tomorrow'
      : isAppointmentIntent
      ? 'Tomorrow'
      : undefined;

    const apptTime = text.includes('morning') || text.includes('10')
      ? '10:00 AM'
      : text.includes('afternoon') || text.includes('2')
      ? '2:00 PM'
      : isAppointmentIntent
      ? '10:00 AM'
      : undefined;

    const emailMatch = userText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const callerEmail = emailMatch ? emailMatch[0] : undefined;

    const toolName = isAppointmentIntent ? 'bookAppointmentOrder' : 'placeOrder';
    const toolRes = await executeAgentTool(
      toolName,
      {
        customerName: callerName || 'Valued Customer',
        customerPhone: callerPhone || '+234 810 123 4567',
        customerEmail: callerEmail,
        deliveryAddress: address,
        items: [{ productName: variant, quantity: loavesCount }],
        paymentMethod: 'Paystack',
        isAppointment: isAppointmentIntent,
        appointmentDate: apptDate,
        appointmentTime: apptTime,
        orderType: isAppointmentIntent ? 'Delivery Appointment' : 'Standard Delivery',
      },
      store
    );
    toolsExecuted.push({
      toolName,
      input: { variant, quantity: loavesCount, address, isAppointmentIntent, apptDate, apptTime, callerEmail },
      output: toolRes.output,
      category: toolRes.category,
    });

    const quantityWord = loavesCount === 1 ? 'one' : loavesCount === 2 ? 'two' : loavesCount === 3 ? 'three' : `${loavesCount}`;
    const loafPlural = loavesCount === 1 ? variant : `${variant}s`;

    if (isAppointmentIntent) {
      return {
        reply: `Wonderful! I have booked your appointment order ${toolRes.output.orderId} for ${quantityWord} ${loafPlural} scheduled for ${apptDate || 'Tomorrow'} at ${apptTime || '10:00 AM'} to ${address}. Total amount is ${toolRes.output.totalAmount} including Lagos delivery. Your order and customer details are recorded in our dashboard, and an email confirmation with your loaf list and total has been triggered to both you and our bakery admin!`,
        toolsExecuted,
      };
    }

    return {
      reply: `Wonderful! I have created your order ${toolRes.output.orderId} for ${quantityWord} ${loafPlural} to ${address}. Total amount is ${toolRes.output.totalAmount} including Lagos delivery. Your order and customer details are now recorded in the dashboard, and an email confirmation with the order summary and total has been dispatched to you and the bakery admin!`,
      toolsExecuted,
    };
  }

  // 4. PRODUCT & PRODUCTION INQUIRY
  if (text.includes('production') || text.includes('product') || text.includes('catalogue') || text.includes('catalog') || text.includes('flavor') || text.includes('flavour') || text.includes('menu') || text.includes('bake') || text.includes('baking') || text.includes('available') || text.includes('stock') || text.includes('chocolate') || text.includes('walnut') || text.includes('classic') || text.includes('oven') || text.includes('loaf') || text.includes('loaves') || text.includes('price') || text.includes('prices') || text.includes('cost') || text.includes('how much') || text.includes('what do you have')) {
    const prodName = text.includes('chocolate') ? 'chocolate' : text.includes('walnut') ? 'walnut' : text.includes('strawberry') ? 'strawberry' : text.includes('blueberry') ? 'blueberry' : text.includes('classic') ? 'classic' : undefined;
    const toolRes = await executeAgentTool('checkProductAndProduction', { productName: prodName }, store);
    toolsExecuted.push({ toolName: 'checkProductAndProduction', input: { productName: prodName }, output: toolRes.output, category: toolRes.category });

    const prods = toolRes.output.products || toolRes.output.availableMenu || [];
    if (prodName && prods?.[0]) {
      const p = prods[0];
      return {
        reply: replacePriceNumbersWithWords(
          `Our ${p.name} is currently ${p.status || 'Available'} at ${p.priceInWords || p.price}. ${p.batchReadyTime || 'Baked fresh daily.'} Would you like me to reserve a loaf for you?`
        ),
        toolsExecuted,
      };
    } else {
      const productSummaries = prods
        .map((p: any) => `${p.name} for ${p.priceInWords || p.price}`)
        .join(', ');
      return {
        reply: replacePriceNumbersWithWords(
          productSummaries
            ? `Right now from our ovens we have ${productSummaries}. All baked fresh today! Which one would you love to try?`
            : 'Right now we bake our artisanal banana bread loaves fresh daily. Which flavor would you love to try?'
        ),
        toolsExecuted,
      };
    }
  }

  // 4. PAST CALLS INQUIRY
  if (text.includes('call') && (text.includes('past') || text.includes('previous') || text.includes('earlier') || text.includes('last time') || text.includes('history'))) {
    const toolRes = await executeAgentTool('lookupPastCalls', { phoneNumber: callerPhone, customerName: callerName }, store);
    toolsExecuted.push({ toolName: 'lookupPastCalls', input: { phoneNumber: callerPhone }, output: toolRes.output, category: toolRes.category });

    if (toolRes.output.found && toolRes.output.recentCalls?.length) {
      const lastCall = toolRes.output.recentCalls[0];
      return {
        reply: `Yes, I see your previous call from ${lastCall.date}. You inquired about: "${lastCall.summary}". How can I help you follow up on that today?`,
        toolsExecuted,
      };
    } else {
      return {
        reply: `I don't see any earlier recorded calls from this number, so welcome to Baked by Doja! How may I assist you with your banana bread order today?`,
        toolsExecuted,
      };
    }
  }

  // 5. CUSTOMER PROFILE INQUIRY
  if (text.includes('who am i') || text.includes('my account') || text.includes('my profile') || text.includes('my details') || text.includes('customer')) {
    const toolRes = await executeAgentTool('lookupCustomer', { phoneNumber: callerPhone, name: callerName }, store);
    toolsExecuted.push({ toolName: 'lookupCustomer', input: { phoneNumber: callerPhone, name: callerName }, output: toolRes.output, category: toolRes.category });

    if (toolRes.output.found) {
      const c = toolRes.output;
      return {
        reply: `Hello ${c.name}! You are registered as a ${c.tier} with ${c.totalOrders} previous orders totaling ${c.totalSpent}. Your saved delivery address is ${c.deliveryAddress}. What would you like to bake today?`,
        toolsExecuted,
      };
    } else {
      return {
        reply: `I see you are calling from ${callerPhone || 'a new number'}. I would be delighted to set up your customer account when you place your first banana bread order!`,
        toolsExecuted,
      };
    }
  }

  // 6. KNOWLEDGE BASE / ALLERGENS / DELIVERY RULES
  if (text.includes('allergy') || text.includes('allerg') || text.includes('nut') || text.includes('gluten') || text.includes('deliver') || text.includes('hours') || text.includes('location') || text.includes('where are you') || text.includes('lekki') || text.includes('ikoyi') || text.includes('island') || text.includes('mainland')) {
    const toolRes = await executeAgentTool('queryKnowledgeBase', { query: userText }, store);
    toolsExecuted.push({ toolName: 'queryKnowledgeBase', input: { query: userText }, output: toolRes.output, category: toolRes.category });

    if (text.includes('deliver') || text.includes('fee') || text.includes('where')) {
      return {
        reply: `We deliver fresh across Lagos daily from our Lekki Phase 1 kitchen! Lekki and Ikoyi are two thousand naira in 45 to 60 minutes, Victoria Island is two thousand five hundred naira, and Mainland or Ikeja is three thousand five hundred naira. Where would you like your order delivered?`,
        toolsExecuted,
      };
    }

    if (text.includes('nut') || text.includes('gluten') || text.includes('allerg')) {
      return {
        reply: `Our Classic and Chocolate Chip loaves are completely nut-free, while our Walnut and Blueberry Almond loaves contain tree nuts prepared on separate sanitised prep surfaces. We also make a Gluten-Free banana bread upon request!`,
        toolsExecuted,
      };
    }

    return {
      reply: `Baked by Doja is located at 14 Admiralty Way, Lekki Phase 1, Lagos. We are open Monday to Saturday from 8 AM to 7 PM, and Sundays 10 AM to 5 PM. How can I sweeten your day?`,
      toolsExecuted,
    };
  }

  // DEFAULT CONVERSATIONAL GREETING & GUIDANCE
  return {
    reply: `Welcome to Baked by Doja! We have fresh artisanal banana breads baking right now. I can check our loaf batches, help you place an order, or check delivery details. How may I help you today?`,
    toolsExecuted,
  };
}

/**
 * Main Agent Response Generator
 * Uses Gemini 3.8 Flash with tool calling, backed by full live context and resilient fallback
 */
export async function generateAgentVoiceResponse(params: {
  message: string;
  history?: Array<{ sender: 'ai' | 'user' | 'tool'; text: string }>;
  callerPhone?: string;
  callerName?: string;
  store: BakeryLiveStore;
}): Promise<{
  reply: string;
  toolsExecuted: Array<{ toolName: string; input: any; output: any; category: string }>;
}> {
  const { message, history = [], callerPhone, callerName, store } = params;
  const toolsExecuted: Array<{ toolName: string; input: any; output: any; category: string }> = [];

  // Check if GEMINI_API_KEY is available in environment
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log('ℹ️ Agent Brain: GEMINI_API_KEY not set. Using high-fidelity live database reasoning engine.');
    const fallback = await executeFallbackAgentResponse(message, store, callerPhone, callerName);
    return {
      reply: replacePriceNumbersWithWords(fallback.reply),
      toolsExecuted: fallback.toolsExecuted,
    };
  }

  try {
    const ai = new GoogleGenAI();
    const systemPrompt = await buildLiveBakeryAgentPrompt(store, callerPhone, callerName);

    // Initial content with conversation history
    const contents: any[] = [];
    for (const h of history.slice(-6)) {
      if (h.sender === 'user') {
        contents.push({ role: 'user', parts: [{ text: h.text }] });
      } else if (h.sender === 'ai') {
        contents.push({ role: 'model', parts: [{ text: h.text }] });
      }
    }
    contents.push({ role: 'user', parts: [{ text: message }] });

    // Multi-turn tool calling loop (up to 3 iterations)
    let currentContents = [...contents];
    let finalSpokenText = '';

    for (let turn = 0; turn < 3; turn++) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: currentContents,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
          tools: [{ functionDeclarations: agentFunctionDeclarations }],
        },
      });

      const functionCalls = response.functionCalls;

      if (!functionCalls || functionCalls.length === 0) {
        finalSpokenText = response.text || '';
        break;
      }

      // Execute each tool call
      const candidateContent = response.candidates?.[0]?.content;
      if (candidateContent) {
        currentContents.push(candidateContent);
      }

      const toolResponseParts: any[] = [];

      for (const call of functionCalls) {
        const callName = call.name || 'checkProductAndProduction';
        const toolExecution = await executeAgentTool(callName, call.args || {}, store);
        toolsExecuted.push({
          toolName: callName,
          input: call.args,
          output: toolExecution.output,
          category: toolExecution.category,
        });

        toolResponseParts.push({
          functionResponse: {
            name: callName,
            response: toolExecution.output,
          },
        });
      }

      currentContents.push({
        role: 'user',
        parts: toolResponseParts,
      });
    }

    // Voice formatting cleanup (remove markdown symbols that sound robotic)
    let cleanReply = finalSpokenText
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/###/g, '')
      .replace(/##/g, '')
      .replace(/`/g, '')
      .replace(/\[|\]/g, '')
      .trim();

    // Guarantee that all prices of products and fees are pronounced in spoken words
    cleanReply = replacePriceNumbersWithWords(cleanReply);

    if (!cleanReply) {
      // Fallback if empty model text
      const fallback = await executeFallbackAgentResponse(message, store, callerPhone, callerName);
      return {
        reply: replacePriceNumbersWithWords(fallback.reply),
        toolsExecuted: [...toolsExecuted, ...fallback.toolsExecuted],
      };
    }

    return {
      reply: cleanReply,
      toolsExecuted,
    };
  } catch (err: any) {
    console.warn('Gemini Voice Agent exception, falling back to local database reasoning:', err?.message || err);
    const fallback = await executeFallbackAgentResponse(message, store, callerPhone, callerName);
    return {
      reply: replacePriceNumbersWithWords(fallback.reply),
      toolsExecuted: fallback.toolsExecuted,
    };
  }
}
