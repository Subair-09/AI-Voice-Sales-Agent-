/**
 * Vapi Voice AI Integration Module for Baked by Doja
 * Handles Vapi Assistant synchronization, WebRTC client credentials,
 * outbound phone calls, and Vapi server webhook callbacks (tool-calling, RAG, & call reporting).
 */
import { formatPriceInWords } from './agentBrain.js';
import { getStoredSettings, getStoredProducts } from './storage.js';

interface VapiConfigState {
  apiKey: string;
  publicKey: string;
  assistantId: string;
  phoneNumberId: string;
}

// In-memory runtime config with fallback to environment variables
const config: VapiConfigState = {
  apiKey: process.env.VAPI_API_KEY || '',
  publicKey: process.env.VAPI_PUBLIC_KEY || process.env.VITE_VAPI_PUBLIC_KEY || '',
  assistantId: process.env.VAPI_ASSISTANT_ID || '',
  phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID || '',
};

export function getVapiConfig() {
  return {
    isConfigured: Boolean(config.apiKey || config.publicKey),
    apiKeyProvided: Boolean(config.apiKey),
    publicKey: config.publicKey || '',
    assistantId: config.assistantId || '',
    phoneNumberId: config.phoneNumberId || '',
    webhookUrl: process.env.APP_URL ? `${process.env.APP_URL}/api/vapi/webhook` : '/api/vapi/webhook',
  };
}

export function updateVapiConfig(newConfig: Partial<VapiConfigState>) {
  if (newConfig.apiKey !== undefined) config.apiKey = newConfig.apiKey.trim();
  if (newConfig.publicKey !== undefined) config.publicKey = newConfig.publicKey.trim();
  if (newConfig.assistantId !== undefined) config.assistantId = newConfig.assistantId.trim();
  if (newConfig.phoneNumberId !== undefined) config.phoneNumberId = newConfig.phoneNumberId.trim();

  return getVapiConfig();
}

/**
 * Builds the complete Vapi Assistant specification injected with
 * Baked by Doja bakery menu, Lagos delivery policies, tone of voice, and tools.
 */
export function buildVapiAssistantPayload(options?: {
  agentName?: string;
  greeting?: string;
  voiceSpeed?: number;
  products?: Array<{
    name: string;
    price: number;
    stock: number;
    category?: string;
    description?: string;
    status?: string;
    batchReadyTime?: string;
  }>;
  knowledgeSnippets?: string[];
  serverUrl?: string;
}) {
  const settings = getStoredSettings();
  const s = settings.store;
  const d = settings.delivery;
  const p = settings.payments;
  const a = settings.agent;

  const agentName = options?.agentName || a.agentName || 'Doja Voice Sales Specialist';
  const greeting =
    options?.greeting ||
    a.greeting ||
    `Hi, welcome to ${s.name}! 🍰 We’ve got delicious freshly baked treats ready for you. What can I help you find or order today?`;

  const availableProducts = options?.products?.length
    ? options.products
    : getStoredProducts().map((pr) => ({
        name: pr.name,
        price: pr.price,
        stock: pr.stockQuantity,
        category: pr.category,
        description: pr.description,
        status: pr.status === 'Active' ? 'In Stock' : pr.status,
        batchReadyTime: 'Morning batch ready from 7:30 AM, afternoon batch ready in 30 mins',
      }));

  const productsList = availableProducts
    .map((prod) => {
      const numPrice = Number(prod.price) || 10000;
      const priceInWords = formatPriceInWords(numPrice);
      const stockText = prod.stock > 0 ? `${prod.stock} loaves in stock` : 'Fresh batch baking in oven';
      const statusText = prod.status || (prod.stock > 0 ? 'In Stock & Ready for Dispatch' : 'Baking');
      const batchText = prod.batchReadyTime || 'Fresh hot batch ready';
      const descText = prod.description ? ` - ${prod.description}` : '';
      return `* ${prod.name}: Spoken Price: "${priceInWords}" (${stockText} | ${statusText} | Batch: ${batchText})${descText}`;
    })
    .join('\n');

  const knowledgeContext = options?.knowledgeSnippets?.length
    ? `ADDITIONAL BUSINESS KNOWLEDGE & MEMORY:\n${options.knowledgeSnippets.join('\n\n')}`
    : `BAKERY DETAILS & POLICIES:
- Bakery Name: ${s.name}
- Location: ${s.address}, ${s.city}, ${s.state}, ${s.country}.
- Operating Hours: ${s.openingHours.weekday}; weekend: ${s.openingHours.weekend}.
- Delivery Fees: Island / Lekki (${formatPriceInWords(d.islandDeliveryFee)}), Mainland (${formatPriceInWords(d.mainlandDeliveryFee)}). Free delivery for orders above ${formatPriceInWords(d.freeDeliveryThreshold)}.
- Delivery Time: ${d.estimatedDeliveryTime}.
- Payment Options: Automated Paystack checkout link via SMS/WhatsApp or direct transfer to ${p.bankName}.
- Packaging: ${d.deliveryNotes}`;

  const systemPrompt = `
You are the official AI Voice Sales Agent for "${s.name}", a premier artisanal bakery in Lagos, Nigeria specializing in gourmet banana breads.
Your name is "${agentName}".

CORE PERSONALITY & SPEAKING PACING (CRITICAL):
- Warm, polite, engaging, articulate, hospitable, and proudly Nigerian-cosmopolitan.
- Speak in smooth, relaxed, natural conversational English with subtle warmth.
- PACE & SPEED: Speak at a calm, unhurried, and measured pace. Do NOT rush or speak quickly.
- Pause naturally at commas, periods, and question marks so the customer comfortably absorbs what you say.
- When delivering the greeting or describing menu items, speak gently and clearly without rushing.

============================================================
🥐 LIVE BAKERY PRODUCTION & PRODUCT CATALOGUE (AUTHORITATIVE)
============================================================
You have direct, immediate access to the bakery's live ovens and inventory catalogue.
All items listed below are currently active and available from our bakery kitchen at ${s.address}, ${s.city}:

${productsList}

============================================================
🚨 PRODUCTION INFORMATION INSTRUCTIONS (CRITICAL):
============================================================
1. You ALREADY possess full, real-time access to the bakery's production schedule and available product catalogue right here.
2. If the caller asks about:
   - "production information" or "available production"
   - "what loaves are available" or "what is in the oven"
   - "what flavors do you have" or "what are your prices"
   - "can you check available production"
   YOU MUST IMMEDIATELY and enthusiastically list the available loaves with their exact prices in Naira and stock!
3. NEVER SAY: "I cannot get available production information", "I don't have access to production details", or "I cannot check production status".
4. Always quote prices clearly in Nigerian Naira (e.g. "nine thousand six hundred Naira" for ₦9,600, or "ten thousand Naira" for ₦10,000).

${knowledgeContext}

============================================================
👋 CALL OPENING & FIRST MESSAGE (MANDATORY & CRITICAL):
============================================================
1. Whenever a customer calls the AI or a call begins, you must ALWAYS speak the complete opening greeting:
   "Hi, welcome to Baked by Doja! 🍰 We’ve got delicious freshly baked treats ready for you. What can I help you find or order today?"
2. NEVER drop or omit "Hi, welcome to".
3. NEVER start with just "Baked by Doja!".
4. Every customer must hear: "Hi, welcome to Baked by Doja! 🍰 We’ve got delicious freshly baked treats ready for you. What can I help you find or order today?"
5. If the caller starts by saying "Hello", "Hi", or greeting you, always warmly reply:
   "Hi, welcome to Baked by Doja! 🍰 We’ve got delicious freshly baked treats ready for you. What can I help you find or order today?"

============================================================
📅 APPOINTMENT ORDERS & REAL-TIME SYSTEM SYNC (CRITICAL):
============================================================
- Any appointment order or scheduled order taken by the voice agent MUST immediately be saved via the order tools.
- When an appointment order is taken:
  1. Capture customer name, phone number, email address, appointment date, appointment time, delivery/pickup address, and items.
  2. The appointment order MUST appear in the bakery order section.
  3. The customer information (name, phone, email, address, total orders, spent) MUST appear in the customer section.
  4. Call the 'bookAppointmentOrder' or 'placeOrder' tool with appointment details.

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

  const webhookUrl =
    options?.serverUrl ||
    (process.env.APP_URL ? `${process.env.APP_URL}/api/vapi/webhook` : undefined);

  return {
    name: `Baked by Doja - ${agentName}`,
    firstMessage: greeting,
    firstMessageMode: 'assistant-speaks-first',
    startSpeakingPlan: {
      waitSeconds: 2.2,
      smartEndpointingEnabled: true,
    },
    model: {
      provider: 'openai',
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
      ],
      tools: [
        {
          type: 'function',
          function: {
            name: 'placeOrder',
            description: 'Creates a new bakery order or scheduled appointment order for the caller when they specify items, quantity, customer details, and address.',
            parameters: {
              type: 'object',
              properties: {
                customerName: { type: 'string', description: "The customer's full name (accurately spelled and confirmed)" },
                customerPhone: { type: 'string', description: "The customer's contact phone number" },
                customerEmail: { type: 'string', description: "The customer's email address (confirmed with caller)" },
                deliveryAddress: { type: 'string', description: 'Delivery street address in Lagos' },
                isAppointment: { type: 'boolean', description: 'True if this order is scheduled as an appointment or specific date/time slot' },
                appointmentDate: { type: 'string', description: 'Scheduled appointment or delivery date' },
                appointmentTime: { type: 'string', description: 'Scheduled appointment or delivery time' },
                orderType: { type: 'string', description: 'Order type: Standard Delivery, Delivery Appointment, Bakery Tasting & Pickup, or Catering Appointment' },
                items: {
                  type: 'array',
                  description: 'List of bakery items being ordered',
                  items: {
                    type: 'object',
                    properties: {
                      productName: { type: 'string', description: 'Name of the banana bread variant' },
                      quantity: { type: 'number', description: 'Number of loaves' },
                    },
                    required: ['productName', 'quantity'],
                  },
                },
                paymentMethod: {
                  type: 'string',
                  enum: ['Paystack', 'Bank Transfer', 'Cash on Delivery'],
                  description: 'Preferred payment method',
                },
                notes: { type: 'string', description: 'Special delivery, gift card, or appointment instructions' },
              },
              required: ['items', 'deliveryAddress'],
            },
          },
        },
        {
          type: 'function',
          function: {
            name: 'bookAppointmentOrder',
            description: 'Books a scheduled appointment order (delivery slot, bakery tasting appointment, pickup, or corporate catering consultation) for the customer, immediately recording in orders and customer CRM.',
            parameters: {
              type: 'object',
              properties: {
                customerName: { type: 'string', description: "The customer's verified name" },
                customerPhone: { type: 'string', description: "The customer's contact phone number" },
                customerEmail: { type: 'string', description: "The customer's verified email address" },
                appointmentDate: { type: 'string', description: 'Appointment date (e.g., Tomorrow, 26th Sep, Friday)' },
                appointmentTime: { type: 'string', description: 'Appointment time slot (e.g., 10:00 AM, 2:30 PM)' },
                appointmentType: { type: 'string', description: 'Type: Delivery Appointment, Bakery Tasting & Pickup, Catering Appointment, Custom Order' },
                deliveryAddress: { type: 'string', description: 'Customer address or tasting location in Lagos' },
                items: {
                  type: 'array',
                  description: 'Bakery treats or banana bread loaves requested for appointment',
                  items: {
                    type: 'object',
                    properties: {
                      productName: { type: 'string', description: 'Item name' },
                      quantity: { type: 'number', description: 'Quantity' },
                    },
                    required: ['productName', 'quantity'],
                  },
                },
                paymentMethod: { type: 'string', enum: ['Paystack', 'Bank Transfer', 'Cash on Delivery'] },
                notes: { type: 'string', description: 'Appointment notes or dietary preferences' },
              },
              required: ['customerName', 'customerPhone', 'appointmentDate', 'appointmentTime'],
            },
          },
        },
        {
          type: 'function',
          function: {
            name: 'checkStockAndMenu',
            description: 'Checks current stock levels, freshly baked batches in oven, and prices of banana breads.',
            parameters: {
              type: 'object',
              properties: {
                productName: { type: 'string', description: 'Optional name of the bread variant to query' },
              },
            },
          },
        },
        {
          type: 'function',
          function: {
            name: 'checkOrderStatus',
            description: 'Checks live status, items, address, and delivery tracking of an order by order ID or customer phone.',
            parameters: {
              type: 'object',
              properties: {
                orderId: { type: 'string', description: 'Order ID like BB-1024' },
                phoneNumber: { type: 'string', description: 'Customer phone number' },
              },
            },
          },
        },
        {
          type: 'function',
          function: {
            name: 'checkPaymentStatus',
            description: 'Verifies whether a customer payment or transfer has cleared via Paystack.',
            parameters: {
              type: 'object',
              properties: {
                orderId: { type: 'string', description: 'Order ID' },
                paymentReference: { type: 'string', description: 'Paystack reference' },
                customerPhone: { type: 'string', description: 'Customer contact phone number' },
              },
            },
          },
        },
        {
          type: 'function',
          function: {
            name: 'lookupCustomer',
            description: 'Looks up caller profile, past order count, total spent, saved address, and favorite flavors.',
            parameters: {
              type: 'object',
              properties: {
                phoneNumber: { type: 'string', description: 'Customer phone number' },
                name: { type: 'string', description: 'Customer name' },
              },
            },
          },
        },
        {
          type: 'function',
          function: {
            name: 'lookupPastCalls',
            description: 'Retrieves previous call transcripts, summaries, and customer requests.',
            parameters: {
              type: 'object',
              properties: {
                phoneNumber: { type: 'string', description: 'Customer phone number' },
              },
            },
          },
        },
        {
          type: 'function',
          function: {
            name: 'sendPaymentLink',
            description: 'Dispatches a Paystack payment link or receipt via SMS/WhatsApp to the caller.',
            parameters: {
              type: 'object',
              properties: {
                customerContact: { type: 'string', description: 'Phone number or email' },
                orderId: { type: 'string', description: 'Optional existing order ID' },
                amount: { type: 'number', description: 'Amount in Naira' },
              },
              required: ['customerContact'],
            },
          },
        },
        {
          type: 'function',
          function: {
            name: 'queryKnowledgeBase',
            description: 'Queries the bakery knowledge base for specific questions on allergies, corporate orders, or store policies.',
            parameters: {
              type: 'object',
              properties: {
                query: { type: 'string', description: 'The question or topic to search' },
              },
              required: ['query'],
            },
          },
        },
      ],
    },
    voice: {
      provider: 'vapi',
      voiceId: 'Elliot',
      speed:
        typeof options?.voiceSpeed === 'number'
          ? Math.min(Math.max(options.voiceSpeed * 0.86, 0.78), 0.95)
          : 0.86,
    },
    transcriber: {
      provider: 'deepgram',
      model: 'nova-2',
      language: 'en',
    },
    serverUrl: webhookUrl,
    server: webhookUrl ? { url: webhookUrl, timeoutSeconds: 20 } : undefined,
  };
}

/**
 * Synchronize the Baked by Doja agent specification to Vapi's API
 */
export async function syncAssistantToVapi(options?: {
  agentName?: string;
  greeting?: string;
  voiceSpeed?: number;
  products?: Array<{
    name: string;
    price: number;
    stock: number;
    category?: string;
    description?: string;
    status?: string;
    batchReadyTime?: string;
  }>;
  knowledgeSnippets?: string[];
}): Promise<{
  success: boolean;
  assistantId?: string;
  assistant?: any;
  simulated?: boolean;
  message: string;
}> {
  const payload = buildVapiAssistantPayload(options);

  if (!config.apiKey) {
    const simulatedId = config.assistantId || `asst_vapi_${Date.now().toString().slice(-6)}`;
    config.assistantId = simulatedId;
    console.log(`ℹ️ Vapi: Operating in local/preview mode. Assistant prepared with ID "${simulatedId}"`);
    return {
      success: true,
      assistantId: simulatedId,
      assistant: payload,
      simulated: true,
      message: 'Assistant configuration prepared and validated (Simulated mode: VAPI_API_KEY not set).',
    };
  }

  try {
    const hasExisting = Boolean(config.assistantId);
    const endpoint = hasExisting
      ? `https://api.vapi.ai/assistant/${config.assistantId}`
      : 'https://api.vapi.ai/assistant';
    const method = hasExisting ? 'PATCH' : 'POST';

    const res = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      console.warn('Vapi Assistant sync API response error:', data);
      return {
        success: false,
        message: data.message || data.error || 'Failed to sync assistant with Vapi API',
      };
    }

    const assignedId = data.id || config.assistantId;
    config.assistantId = assignedId;

    return {
      success: true,
      assistantId: assignedId,
      assistant: data,
      simulated: false,
      message: hasExisting ? 'Vapi Assistant successfully updated' : 'Vapi Assistant successfully created',
    };
  } catch (err: any) {
    console.error('Vapi Assistant sync exception:', err);
    return {
      success: false,
      message: err.message || 'Exception during Vapi Assistant sync',
    };
  }
}

/**
 * Dispatches an outbound call to a customer's phone number using Vapi
 */
export async function dispatchOutboundCall(params: {
  customerPhoneNumber: string;
  customerName?: string;
  assistantId?: string;
  purpose?: string;
}): Promise<{
  success: boolean;
  callId?: string;
  simulated?: boolean;
  message: string;
}> {
  const assistantId = params.assistantId || config.assistantId || 'asst_doja_voice_default';

  if (!config.apiKey || !config.phoneNumberId) {
    const simCallId = `vapi_call_sim_${Date.now()}`;
    console.log(`📞 [Vapi Simulated Outbound Call] To: ${params.customerPhoneNumber} (${params.customerName || 'Customer'}) | Assistant: ${assistantId}`);
    return {
      success: true,
      callId: simCallId,
      simulated: true,
      message: `Simulated outbound call queued for ${params.customerPhoneNumber}. Set VAPI_API_KEY & VAPI_PHONE_NUMBER_ID for live telephony.`,
    };
  }

  try {
    const res = await fetch('https://api.vapi.ai/call/phone', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        phoneNumberId: config.phoneNumberId,
        assistantId,
        customer: {
          number: params.customerPhoneNumber,
          name: params.customerName || 'Valued Customer',
        },
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        message: data.message || 'Vapi outbound telephony error',
      };
    }

    return {
      success: true,
      callId: data.id,
      simulated: false,
      message: `Outbound call connected via Vapi (ID: ${data.id})`,
    };
  } catch (err: any) {
    console.error('Vapi outbound call error:', err);
    return {
      success: false,
      message: err.message || 'Failed to place outbound call via Vapi',
    };
  }
}

/**
 * Handles incoming Vapi Webhooks (tool-calls, assistant-request, end-of-call-report)
 */
export async function handleVapiWebhook(
  event: any,
  handlers: {
    onPlaceOrder: (args: any) => Promise<any>;
    onCheckStock: (args: any) => Promise<any>;
    onCheckOrderStatus?: (args: any) => Promise<any>;
    onCheckPaymentStatus?: (args: any) => Promise<any>;
    onLookupCustomer?: (args: any) => Promise<any>;
    onLookupPastCalls?: (args: any) => Promise<any>;
    onSendPaymentLink: (args: any) => Promise<any>;
    onQueryKnowledge: (args: any) => Promise<any>;
    onLogCall: (callData: any) => Promise<void>;
  }
) {
  const messageType = event.message?.type || event.type;
  console.log(`📡 [Vapi Webhook Received] Type: "${messageType}"`);

  // 1. Tool Call Execution (Handles tool-calls, tool_calls, tool-call, function-call, function_call)
  if (
    messageType === 'tool-calls' ||
    messageType === 'tool_calls' ||
    messageType === 'tool-call' ||
    messageType === 'function-call' ||
    messageType === 'function_call'
  ) {
    const rawCalls =
      event.message?.toolCalls ||
      event.message?.toolCallList ||
      event.toolCalls ||
      event.toolCallList ||
      (event.message?.functionCall ? [{ id: event.message.functionCall.id || 'fn_call_1', function: event.message.functionCall }] : []) ||
      (event.functionCall ? [{ id: event.functionCall.id || 'fn_call_1', function: event.functionCall }] : []);

    console.log(`🛠️ [Vapi Webhook] Processing ${rawCalls.length} tool call(s)`);
    const results = [];

    for (const toolCall of rawCalls) {
      const name = toolCall.function?.name || toolCall.name;
      const toolCallId = toolCall.id || toolCall.toolCallId || `call_${Date.now()}`;
      let args: any = {};
      try {
        args = typeof toolCall.function?.arguments === 'string'
          ? JSON.parse(toolCall.function.arguments)
          : toolCall.function?.arguments || toolCall.parameters || {};
      } catch {
        args = toolCall.parameters || {};
      }

      console.log(`⚡ [Vapi Tool Invocation] Function: "${name}" (ID: ${toolCallId}) | Args:`, JSON.stringify(args));
      let toolResult: any = { error: 'Unknown function' };

      try {
        if (name === 'placeOrder') {
          toolResult = await handlers.onPlaceOrder(args);
        } else if (name === 'bookAppointmentOrder') {
          toolResult = await handlers.onPlaceOrder({
            ...args,
            isAppointment: true,
            orderType: args.appointmentType || 'Appointment Order',
          });
        } else if (name === 'checkStockAndMenu' || name === 'checkProductAndProduction') {
          toolResult = await handlers.onCheckStock(args);
        } else if (name === 'checkOrderStatus' && handlers.onCheckOrderStatus) {
          toolResult = await handlers.onCheckOrderStatus(args);
        } else if (name === 'checkPaymentStatus' && handlers.onCheckPaymentStatus) {
          toolResult = await handlers.onCheckPaymentStatus(args);
        } else if (name === 'lookupCustomer' && handlers.onLookupCustomer) {
          toolResult = await handlers.onLookupCustomer(args);
        } else if (name === 'lookupPastCalls' && handlers.onLookupPastCalls) {
          toolResult = await handlers.onLookupPastCalls(args);
        } else if (name === 'sendPaymentLink') {
          toolResult = await handlers.onSendPaymentLink(args);
        } else if (name === 'queryKnowledgeBase') {
          toolResult = await handlers.onQueryKnowledge(args);
        }
      } catch (toolErr: any) {
        console.error(`❌ [Vapi Tool Execution Error] ${name}:`, toolErr);
        toolResult = { error: toolErr.message || 'Execution error' };
      }

      const stringResult = typeof toolResult === 'string' ? toolResult : JSON.stringify(toolResult);
      results.push({
        name,
        toolCallId,
        result: stringResult,
      });
    }

    if (messageType === 'function-call' || messageType === 'function_call') {
      return { result: results[0]?.result || JSON.stringify({ success: true }) };
    }

    console.log(`📤 [Vapi Webhook Replying] Results count: ${results.length}`);
    return { results };
  }

  // 2. End of Call Report (Save transcript and analytics)
  if (messageType === 'end-of-call-report') {
    const report = event.message || event;
    const callData = {
      vapiCallId: report.call?.id || report.id || `call_${Date.now()}`,
      customerPhone: report.customer?.number || report.call?.customer?.number || '',
      durationSeconds: report.durationSeconds || (report.endedAt && report.startedAt ? Math.round((new Date(report.endedAt).getTime() - new Date(report.startedAt).getTime()) / 1000) : 0),
      transcript: report.transcript || report.messages?.filter((m: any) => m.message).map((m: any) => `${m.role === 'bot' ? 'AI Agent' : 'Customer'}: ${m.message}`).join('\n') || '',
      summary: report.summary || 'Customer call with voice sales agent.',
      recordingUrl: report.recordingUrl || null,
      cost: typeof report.cost === 'number' ? report.cost : 0,
      endedReason: report.endedReason || 'completed',
    };

    await handlers.onLogCall(callData);
    return { success: true };
  }

  // 3. Status updates or generic events
  return { success: true, received: messageType };
}
