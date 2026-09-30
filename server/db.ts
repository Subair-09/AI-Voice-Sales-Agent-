import { MongoClient, Db, Collection, ObjectId } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;
let isConnected = false;
let connectionError: string | undefined = undefined;

const MONGODB_URI = process.env.MONGODB_URI || '';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'baked_by_doja';

export async function initMongo(): Promise<{ connected: boolean; dbName: string; error?: string }> {
  if (!MONGODB_URI) {
    connectionError = 'MONGODB_URI is not set in environment variables';
    console.log('ℹ️ MongoDB: MONGODB_URI not configured. Operating in resilient hybrid mode.');
    return { connected: false, dbName: MONGODB_DB_NAME, error: connectionError };
  }

  try {
    client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });

    await client.connect();
    db = client.db(MONGODB_DB_NAME);
    isConnected = true;
    connectionError = undefined;

    console.log(`✅ MongoDB: Successfully connected to database "${MONGODB_DB_NAME}"`);

    // Ensure collections and indexes
    try {
      await db.collection('orders').createIndex({ id: 1 }, { unique: true, sparse: true });
      await db.collection('products').createIndex({ id: 1 }, { unique: true, sparse: true });
      await db.collection('customers').createIndex({ id: 1 }, { unique: true, sparse: true });
      await db.collection('knowledge').createIndex({ id: 1 }, { unique: true, sparse: true });
      await db.collection('calls').createIndex({ id: 1 }, { unique: true, sparse: true });
    } catch (idxErr) {
      console.warn('MongoDB Index setup note:', idxErr);
    }

    return { connected: true, dbName: MONGODB_DB_NAME };
  } catch (err: any) {
    isConnected = false;
    connectionError = err?.message || 'Failed to connect to MongoDB';
    console.warn(`⚠️ MongoDB connection warning: ${connectionError}. Using server fallback.`);
    return { connected: false, dbName: MONGODB_DB_NAME, error: connectionError };
  }
}

export function getDb(): Db | null {
  return db;
}

export function isMongoConnected(): boolean {
  return isConnected;
}

export function getMongoError(): string | undefined {
  return connectionError;
}

export async function getMongoStats() {
  const uriConfigured = Boolean(MONGODB_URI);
  if (!isConnected || !db) {
    return {
      connected: false,
      uriConfigured,
      error: connectionError || 'Not connected',
      dbName: MONGODB_DB_NAME,
      counts: {
        orders: 0,
        products: 0,
        customers: 0,
        knowledge: 0,
        calls: 0,
      },
    };
  }

  try {
    const [orders, products, customers, knowledge, calls] = await Promise.all([
      db.collection('orders').countDocuments().catch(() => 0),
      db.collection('products').countDocuments().catch(() => 0),
      db.collection('customers').countDocuments().catch(() => 0),
      db.collection('knowledge').countDocuments().catch(() => 0),
      db.collection('calls').countDocuments().catch(() => 0),
    ]);

    return {
      connected: true,
      uriConfigured: true,
      dbName: MONGODB_DB_NAME,
      counts: {
        orders,
        products,
        customers,
        knowledge,
        calls,
      },
    };
  } catch (err: any) {
    return {
      connected: false,
      uriConfigured: true,
      error: err.message,
      dbName: MONGODB_DB_NAME,
      counts: { orders: 0, products: 0, customers: 0, knowledge: 0, calls: 0 },
    };
  }
}

// Data synchronization helpers
export async function syncOrderToMongo(order: any): Promise<boolean> {
  if (!db || !isConnected) return false;
  try {
    const { _id, ...cleanOrder } = order;
    await db.collection('orders').updateOne(
      { id: cleanOrder.id || cleanOrder.orderId },
      { $set: { ...cleanOrder, updatedAt: new Date() } },
      { upsert: true }
    );
    return true;
  } catch (err) {
    console.error('Error saving order to MongoDB:', err);
    return false;
  }
}

export async function syncProductToMongo(product: any): Promise<boolean> {
  if (!db || !isConnected) return false;
  try {
    const { _id, ...cleanProduct } = product;
    await db.collection('products').updateOne(
      { id: cleanProduct.id },
      { $set: { ...cleanProduct, updatedAt: new Date() } },
      { upsert: true }
    );
    return true;
  } catch (err) {
    console.error('Error saving product to MongoDB:', err);
    return false;
  }
}

export async function deleteProductFromMongo(productId: string): Promise<boolean> {
  if (!db || !isConnected) return false;
  try {
    const decoded = decodeURIComponent(productId);
    const filters: any[] = [
      { id: productId },
      { id: decoded },
      { slug: productId },
      { slug: decoded },
      { name: productId },
      { name: decoded },
      { _id: productId },
      { _id: decoded }
    ];

    try {
      if (ObjectId.isValid(productId) && productId.length === 24) {
        filters.push({ _id: new ObjectId(productId) });
      }
    } catch (e) {}
    try {
      if (ObjectId.isValid(decoded) && decoded.length === 24) {
        filters.push({ _id: new ObjectId(decoded) });
      }
    } catch (e) {}

    const result = await db.collection('products').deleteOne({ $or: filters });
    return (result.deletedCount || 0) > 0;
  } catch (err) {
    console.error('Error deleting product from MongoDB:', err);
    return false;
  }
}

export async function deleteOrderFromMongo(orderId: string): Promise<boolean> {
  if (!db || !isConnected) return false;
  try {
    await db.collection('orders').deleteOne({ $or: [{ id: orderId }, { orderId: orderId }] });
    return true;
  } catch (err) {
    console.error('Error deleting order from MongoDB:', err);
    return false;
  }
}

export async function syncCustomerToMongo(customer: any): Promise<boolean> {
  if (!db || !isConnected) return false;
  try {
    const { _id, ...cleanCustomer } = customer;
    await db.collection('customers').updateOne(
      { id: cleanCustomer.id },
      { $set: { ...cleanCustomer, updatedAt: new Date() } },
      { upsert: true }
    );
    return true;
  } catch (err) {
    console.error('Error saving customer to MongoDB:', err);
    return false;
  }
}

export async function syncKnowledgeToMongo(doc: any): Promise<boolean> {
  if (!db || !isConnected) return false;
  try {
    const { _id, ...cleanDoc } = doc;
    await db.collection('knowledge').updateOne(
      { id: cleanDoc.id },
      { $set: { ...cleanDoc, updatedAt: new Date() } },
      { upsert: true }
    );
    return true;
  } catch (err) {
    console.error('Error saving knowledge doc to MongoDB:', err);
    return false;
  }
}

export async function syncCallToMongo(call: any): Promise<boolean> {
  if (!db || !isConnected) return false;
  try {
    const { _id, ...cleanCall } = call;
    await db.collection('calls').updateOne(
      { id: cleanCall.id },
      { $set: { ...cleanCall, updatedAt: new Date() } },
      { upsert: true }
    );
    return true;
  } catch (err) {
    console.error('Error saving call to MongoDB:', err);
    return false;
  }
}

export async function syncPaymentToMongo(payment: any): Promise<boolean> {
  if (!db || !isConnected) return false;
  try {
    const { _id, ...cleanPayment } = payment;
    await db.collection('payments').updateOne(
      { id: cleanPayment.id },
      { $set: { ...cleanPayment, updatedAt: new Date() } },
      { upsert: true }
    );
    return true;
  } catch (err) {
    console.error('Error saving payment to MongoDB:', err);
    return false;
  }
}

export async function syncSettingsToMongo(settings: any): Promise<boolean> {
  if (!db || !isConnected) return false;
  try {
    const { _id, ...cleanSettings } = settings;
    await db.collection('settings').updateOne(
      { key: 'global_bakery_settings' },
      { $set: { ...cleanSettings, key: 'global_bakery_settings', updatedAt: new Date() } },
      { upsert: true }
    );
    return true;
  } catch (err) {
    console.error('Error saving settings to MongoDB:', err);
    return false;
  }
}

export async function fetchSettingsFromMongo(): Promise<any | null> {
  if (!db || !isConnected) return null;
  try {
    const doc = await db.collection('settings').findOne({ key: 'global_bakery_settings' });
    if (!doc) return null;
    const { _id, key, ...rest } = doc;
    return rest;
  } catch (err) {
    console.warn('Error reading settings from MongoDB:', err);
    return null;
  }
}


export async function fetchCollectionFromMongo(collName: string): Promise<any[]> {
  if (!db || !isConnected) return [];
  try {
    return await db.collection(collName).find().sort({ _id: -1 }).toArray();
  } catch (err) {
    console.warn(`Error fetching ${collName} from MongoDB:`, err);
    return [];
  }
}

export async function clearAllMongoCollections(): Promise<{ success: boolean; cleared: Record<string, number>; error?: string }> {
  if (!db || !isConnected) {
    return { success: false, cleared: {}, error: 'MongoDB is not connected' };
  }
  try {
    const collections = ['orders', 'products', 'customers', 'knowledge', 'calls', 'payments'];
    const cleared: Record<string, number> = {};
    for (const coll of collections) {
      try {
        const res = await db.collection(coll).deleteMany({});
        cleared[coll] = res.deletedCount;
      } catch (err: any) {
        cleared[coll] = 0;
      }
    }
    return { success: true, cleared };
  } catch (err: any) {
    console.error('Error clearing MongoDB collections:', err);
    return { success: false, cleared: {}, error: err.message };
  }
}
