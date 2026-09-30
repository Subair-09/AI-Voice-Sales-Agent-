import fs from 'fs';
import path from 'path';

export interface ProductItem {
  id: string;
  name: string;
  subtitle: string;
  slug: string;
  category: string;
  price: number;
  formattedPrice: string;
  currency: string;
  stock: 'In Stock' | 'Low Stock' | 'Out of Stock';
  stockQuantity: number;
  lowStockThreshold: number;
  sales: number;
  status: 'Active' | 'Draft' | 'Out of Stock' | 'Archived';
  addedOn: string;
  description: string;
  image: string;
  images: string[];
  recentSales?: {
    date: string;
    amount: string;
    orderId: string;
  }[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const CUSTOMERS_FILE = path.join(DATA_DIR, 'customers.json');
const CALLS_FILE = path.join(DATA_DIR, 'calls.json');
const PAYMENTS_FILE = path.join(DATA_DIR, 'payments.json');
const KNOWLEDGE_FILE = path.join(DATA_DIR, 'knowledge.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

export interface BakerySettings {
  store: {
    name: string;
    tagline: string;
    description: string;
    email: string;
    phone: string;
    whatsapp: string;
    instagram: string;
    address: string;
    city: string;
    state: string;
    country: string;
    currency: string;
    currencySymbol: string;
    timezone: string;
    openingHours: {
      weekday: string;
      weekend: string;
      bakingDays: string;
      leadTimeHours: number;
    };
  };
  agent: {
    agentName: string;
    voiceId: string;
    voiceName: string;
    language: string;
    greeting: string;
    voiceSpeed: number;
    silenceTimeout: number;
    maxCallDuration: number;
    responseDelay: number;
    bargeIn: boolean;
    autoHandling: boolean;
    callRecording: boolean;
    transcription: boolean;
    humanEscalationPhone: string;
    enableFallbackTransfer: boolean;
  };
  payments: {
    currency: string;
    allowBankTransfer: boolean;
    allowPaystack: boolean;
    allowMonnify: boolean;
    bankName: string;
    accountNumber: string;
    accountName: string;
    bankInstructions: string;
    paystackPublicKey: string;
    monnifyApiKey: string;
    taxRatePercentage: number;
  };
  delivery: {
    pickupAvailable: boolean;
    pickupLocation: string;
    islandDeliveryFee: number;
    mainlandDeliveryFee: number;
    freeDeliveryThreshold: number;
    estimatedDeliveryTime: string;
    deliveryNotes: string;
    minimumOrderAmount: number;
  };
  notifications: {
    emailAlertsEnabled: boolean;
    smsAlertsEnabled: boolean;
    whatsappAlertsEnabled: boolean;
    adminNotificationEmail: string;
    adminNotificationPhone: string;
    notifyOnNewOrder: boolean;
    notifyOnPaymentConfirmed: boolean;
    notifyOnLowStock: boolean;
    lowStockAlertThreshold: number;
    dailySummaryEmail: boolean;
  };
  security: {
    adminName: string;
    adminEmail: string;
    sessionTimeoutMinutes: number;
    twoFactorEnabled: boolean;
    enforcePasswordExpiry: boolean;
    auditLogging: boolean;
  };
  updatedAt?: string;
}

export const DEFAULT_SETTINGS: BakerySettings = {
  store: {
    name: 'Baked by Doja',
    tagline: 'Artisanal Handcrafted Banana Loaves & Gourmet Bakes',
    description: 'Freshly baked gourmet banana bread crafted with caramelized bananas, premium roasted nuts, and pure Madagascar vanilla.',
    email: 'orders@bakedbydoja.com',
    phone: '+234 812 345 6789',
    whatsapp: '+234 812 345 6789',
    instagram: '@bakedbydoja',
    address: '14B Admiralty Way, Lekki Phase 1',
    city: 'Lagos',
    state: 'Lagos State',
    country: 'Nigeria',
    currency: 'NGN',
    currencySymbol: '₦',
    timezone: 'Africa/Lagos (WAT, UTC+1)',
    openingHours: {
      weekday: '08:00 AM – 06:00 PM',
      weekend: '09:00 AM – 05:00 PM',
      bakingDays: 'Monday through Saturday',
      leadTimeHours: 3,
    },
  },
  agent: {
    agentName: 'Doja AI Sales Concierge',
    voiceId: 'amina-lagos',
    voiceName: 'Amina (Lagos Warm Accent)',
    language: 'Nigerian English & Pidgin-friendly',
    greeting: 'Hi, welcome to Baked by Doja! 🍰 We’ve got delicious freshly baked treats ready for you. What can I help you find or order today?',
    voiceSpeed: 0.88,
    silenceTimeout: 5,
    maxCallDuration: 10,
    responseDelay: 350,
    bargeIn: true,
    autoHandling: true,
    callRecording: true,
    transcription: true,
    humanEscalationPhone: '+234 803 123 4567',
    enableFallbackTransfer: true,
  },
  payments: {
    currency: 'NGN',
    allowBankTransfer: true,
    allowPaystack: true,
    allowMonnify: false,
    bankName: 'Guaranty Trust Bank (GTBank)',
    accountNumber: '0123456789',
    accountName: 'Baked by Doja Confectionery Ltd',
    bankInstructions: 'Please include your Order ID or phone number as transaction reference and send payment receipt.',
    paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY || '',
    monnifyApiKey: process.env.MONNIFY_API_KEY || '',
    taxRatePercentage: 7.5,
  },
  delivery: {
    pickupAvailable: true,
    pickupLocation: '14B Admiralty Way, Lekki Phase 1, Lagos',
    islandDeliveryFee: 2500,
    mainlandDeliveryFee: 4000,
    freeDeliveryThreshold: 45000,
    estimatedDeliveryTime: '45 – 90 minutes across Lagos',
    deliveryNotes: 'All orders are sealed in heat-resistant, eco-friendly luxury packaging.',
    minimumOrderAmount: 10000,
  },
  notifications: {
    emailAlertsEnabled: true,
    smsAlertsEnabled: true,
    whatsappAlertsEnabled: true,
    adminNotificationEmail: 'admin@bakedbydoja.com',
    adminNotificationPhone: '+234 812 345 6789',
    notifyOnNewOrder: true,
    notifyOnPaymentConfirmed: true,
    notifyOnLowStock: true,
    lowStockAlertThreshold: 10,
    dailySummaryEmail: true,
  },
  security: {
    adminName: 'Chef Doja & Admin Team',
    adminEmail: 'admin@bakedbydoja.com',
    sessionTimeoutMinutes: 60,
    twoFactorEnabled: false,
    enforcePasswordExpiry: false,
    auditLogging: true,
  },
};

export const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: 'prod-classic-01',
    name: 'Classic Banana Bread',
    subtitle: 'Signature Golden Crust Loaf',
    slug: 'classic-banana-bread',
    category: 'Classic Loaves',
    price: 10000,
    formattedPrice: '₦10,000',
    currency: 'NGN',
    stock: 'In Stock',
    stockQuantity: 45,
    lowStockThreshold: 10,
    sales: 124,
    status: 'Active',
    addedOn: '12 Jan, 2025',
    description: 'Our timeless signature loaf made with caramelized ripe Cavendish bananas, golden butter, and pure Madagascar vanilla.',
    image: 'https://images.unsplash.com/photo-1605698802008-a5b78b029a1b?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1605698802008-a5b78b029a1b?auto=format&fit=crop&w=600&q=80'],
    recentSales: [],
  },
  {
    id: 'prod-choc-chip-02',
    name: 'Chocolate Chip Banana Bread',
    subtitle: 'Belgian Dark Chocolate Infused',
    slug: 'chocolate-chip-banana-bread',
    category: 'Specialty Loaves',
    price: 12500,
    formattedPrice: '₦12,500',
    currency: 'NGN',
    stock: 'In Stock',
    stockQuantity: 38,
    lowStockThreshold: 8,
    sales: 96,
    status: 'Active',
    addedOn: '14 Jan, 2025',
    description: 'Moist, rich handcrafted banana bread loaded with premium Belgian dark chocolate chips.',
    image: 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1598373182133-52452f7691ef?auto=format&fit=crop&w=600&q=80'],
    recentSales: [],
  },
  {
    id: 'prod-walnut-03',
    name: 'Walnut & Cinnamon Banana Bread',
    subtitle: 'Toasted English Walnuts & Spice',
    slug: 'walnut-cinnamon-banana-bread',
    category: 'Specialty Loaves',
    price: 13000,
    formattedPrice: '₦13,000',
    currency: 'NGN',
    stock: 'In Stock',
    stockQuantity: 28,
    lowStockThreshold: 5,
    sales: 64,
    status: 'Active',
    addedOn: '18 Jan, 2025',
    description: 'Infused with warm Ceylon cinnamon and generously folded with roasted crunchy English walnuts.',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80'],
    recentSales: [],
  },
  {
    id: 'prod-strawberry-04',
    name: 'Strawberry Swirl Banana Bread',
    subtitle: 'Organic Berry Compote Ribbon',
    slug: 'strawberry-swirl-banana-bread',
    category: 'Fruit & Berry',
    price: 14000,
    formattedPrice: '₦14,000',
    currency: 'NGN',
    stock: 'In Stock',
    stockQuantity: 22,
    lowStockThreshold: 5,
    sales: 45,
    status: 'Active',
    addedOn: '01 Feb, 2025',
    description: 'Artisanal banana bread marbled with homemade organic strawberry reduction and fragrant vanilla glaze.',
    image: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?auto=format&fit=crop&w=600&q=80'],
    recentSales: [],
  },
  {
    id: 'prod-blueberry-05',
    name: 'Blueberry Almond Banana Bread',
    subtitle: 'Wild Blueberries & Toasted Flakes',
    slug: 'blueberry-almond-banana-bread',
    category: 'Fruit & Berry',
    price: 15000,
    formattedPrice: '₦15,000',
    currency: 'NGN',
    stock: 'In Stock',
    stockQuantity: 20,
    lowStockThreshold: 5,
    sales: 32,
    status: 'Active',
    addedOn: '10 Feb, 2025',
    description: 'Tender banana loaf bursting with sweet wild blueberries and topped with roasted sliced California almonds.',
    image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=600&q=80'],
    recentSales: [],
  },
];

function readJsonFile<T>(filePath: string, fallback: T): T {
  ensureDataDir();
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      if (content.trim()) {
        return JSON.parse(content) as T;
      }
    }
  } catch (err) {
    console.warn(`Error reading ${filePath}:`, err);
  }
  return fallback;
}

function writeJsonFile<T>(filePath: string, data: T): void {
  ensureDataDir();
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

// ========================
// PRODUCTS STORAGE
// ========================
export function getStoredProducts(): ProductItem[] {
  const products = readJsonFile<ProductItem[]>(PRODUCTS_FILE, []);
  return products || [];
}

export function saveStoredProducts(products: ProductItem[]): void {
  writeJsonFile(PRODUCTS_FILE, products);
}

export function addStoredProduct(product: ProductItem): ProductItem[] {
  const products = getStoredProducts();
  const existingIdx = products.findIndex((p) => p.id === product.id);
  if (existingIdx >= 0) {
    products[existingIdx] = product;
  } else {
    products.unshift(product);
  }
  saveStoredProducts(products);
  return products;
}

export function updateStoredProduct(id: string, updates: Partial<ProductItem>): ProductItem | null {
  const products = getStoredProducts();
  const idx = products.findIndex((p) => p.id === id || p.slug === id);
  if (idx === -1) return null;
  products[idx] = { ...products[idx], ...updates };
  saveStoredProducts(products);
  return products[idx];
}

export function deleteStoredProduct(id: string): ProductItem | null {
  const products = getStoredProducts();
  const decoded = decodeURIComponent(id);
  const idx = products.findIndex(
    (p: any) =>
      p.id === id ||
      p.slug === id ||
      p._id === id ||
      p.id === decoded ||
      p.slug === decoded ||
      p.name?.toLowerCase() === id.toLowerCase() ||
      p.name?.toLowerCase() === decoded.toLowerCase()
  );
  if (idx === -1) return null;
  const [deleted] = products.splice(idx, 1);
  saveStoredProducts(products);
  return deleted;
}

// ========================
// ORDERS STORAGE
// ========================
export function getStoredOrders(): any[] {
  return readJsonFile<any[]>(ORDERS_FILE, []);
}

export function saveStoredOrders(orders: any[]): void {
  writeJsonFile(ORDERS_FILE, orders);
}

export function addStoredOrder(order: any): any[] {
  const orders = getStoredOrders();
  const existingIdx = orders.findIndex((o) => o.id === order.id || o.orderNumber === order.orderNumber);
  if (existingIdx >= 0) {
    orders[existingIdx] = { ...orders[existingIdx], ...order };
  } else {
    orders.unshift(order);
  }
  saveStoredOrders(orders);
  return orders;
}

// ========================
// CUSTOMERS STORAGE
// ========================
export function getStoredCustomers(): any[] {
  return readJsonFile<any[]>(CUSTOMERS_FILE, []);
}

export function saveStoredCustomers(customers: any[]): void {
  writeJsonFile(CUSTOMERS_FILE, customers);
}

export function addStoredCustomer(customer: any): any[] {
  const customers = getStoredCustomers();
  const existingIdx = customers.findIndex((c) => c.id === customer.id || (c.phone && c.phone === customer.phone));
  if (existingIdx >= 0) {
    customers[existingIdx] = { ...customers[existingIdx], ...customer };
  } else {
    customers.unshift(customer);
  }
  saveStoredCustomers(customers);
  return customers;
}

// ========================
// CALLS STORAGE
// ========================
export function getStoredCalls(): any[] {
  return readJsonFile<any[]>(CALLS_FILE, []);
}

export function saveStoredCalls(calls: any[]): void {
  writeJsonFile(CALLS_FILE, calls);
}

export function addStoredCall(call: any): any[] {
  const calls = getStoredCalls();
  calls.unshift(call);
  saveStoredCalls(calls);
  return calls;
}

// ========================
// PAYMENTS STORAGE
// ========================
export function getStoredPayments(): any[] {
  return readJsonFile<any[]>(PAYMENTS_FILE, []);
}

export function saveStoredPayments(payments: any[]): void {
  writeJsonFile(PAYMENTS_FILE, payments);
}

export function addStoredPayment(payment: any): any[] {
  const payments = getStoredPayments();
  payments.unshift(payment);
  saveStoredPayments(payments);
  return payments;
}

// ========================
// KNOWLEDGE STORAGE
// ========================
export function getStoredKnowledge(): any[] {
  return readJsonFile<any[]>(KNOWLEDGE_FILE, []);
}

export function saveStoredKnowledge(docs: any[]): void {
  writeJsonFile(KNOWLEDGE_FILE, docs);
}

// ========================
// SETTINGS STORAGE
// ========================
export function getStoredSettings(): BakerySettings {
  const settings = readJsonFile<BakerySettings | null>(SETTINGS_FILE, null);
  if (!settings) {
    writeJsonFile(SETTINGS_FILE, DEFAULT_SETTINGS);
    return { ...DEFAULT_SETTINGS };
  }
  return {
    ...DEFAULT_SETTINGS,
    ...settings,
    store: { ...DEFAULT_SETTINGS.store, ...(settings.store || {}) },
    agent: { ...DEFAULT_SETTINGS.agent, ...(settings.agent || {}) },
    payments: { ...DEFAULT_SETTINGS.payments, ...(settings.payments || {}) },
    delivery: { ...DEFAULT_SETTINGS.delivery, ...(settings.delivery || {}) },
    notifications: { ...DEFAULT_SETTINGS.notifications, ...(settings.notifications || {}) },
    security: { ...DEFAULT_SETTINGS.security, ...(settings.security || {}) },
  };
}

export function saveStoredSettings(updates: Partial<BakerySettings>): BakerySettings {
  const current = getStoredSettings();
  const merged: BakerySettings = {
    ...current,
    ...updates,
    store: updates.store ? { ...current.store, ...updates.store } : current.store,
    agent: updates.agent ? { ...current.agent, ...updates.agent } : current.agent,
    payments: updates.payments ? { ...current.payments, ...updates.payments } : current.payments,
    delivery: updates.delivery ? { ...current.delivery, ...updates.delivery } : current.delivery,
    notifications: updates.notifications ? { ...current.notifications, ...updates.notifications } : current.notifications,
    security: updates.security ? { ...current.security, ...updates.security } : current.security,
    updatedAt: new Date().toISOString(),
  };
  writeJsonFile(SETTINGS_FILE, merged);
  return merged;
}

export function resetStoredSettings(): BakerySettings {
  const fresh = { ...DEFAULT_SETTINGS, updatedAt: new Date().toISOString() };
  writeJsonFile(SETTINGS_FILE, fresh);
  return fresh;
}

