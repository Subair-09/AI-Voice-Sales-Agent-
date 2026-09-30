import { Resend } from 'resend';
import { getStoredSettings } from './storage.js';

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Baked by Doja <onboarding@resend.dev>';

const isConfigured = Boolean(RESEND_API_KEY);
const resendClient = isConfigured ? new Resend(RESEND_API_KEY) : null;

if (isConfigured) {
  console.log(`✅ Resend: Initialized with API key (Sender: ${FROM_EMAIL})`);
} else {
  console.log('ℹ️ Resend: RESEND_API_KEY not set in environment. Outbound emails will run in resilient simulation mode.');
}

export function isResendConfigured(): boolean {
  return isConfigured;
}

export function getResendStatus() {
  return {
    configured: isConfigured,
    fromEmail: FROM_EMAIL,
    mode: isConfigured ? 'live_resend' : 'simulated_delivery',
  };
}

export interface OrderItemEmail {
  name: string;
  description?: string;
  quantity: number;
  price: string;
}

export interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  phone: string;
  email: string;
  deliveryAddress: string;
  orderType: string;
  scheduledSlot: string;
  paymentMethod: string;
  orderNotes?: string;
  items: OrderItemEmail[];
  subtotal: string;
  deliveryFee: string;
  grandTotal: string;
  dashboardOrderUrl?: string;
  aiAgentNotes?: string;
}

/**
 * Strict visual source of truth template for Baked by Doja Transactional Emails.
 * Table-based, inline-styled, responsive, with fallback fonts and cross-client compatibility.
 */
export function buildBakedByDojaOrderEmailHtml(data: OrderEmailData): string {
  const itemsHtml = (data.items || [])
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #F1ECE1;">
        <td style="padding: 14px 0 14px 0; vertical-align: top;">
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 700; color: #17243A; line-height: 1.3;">
            ${item.name}
          </div>
          ${
            item.description
              ? `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; color: #78716C; margin-top: 3px; font-style: italic; line-height: 1.4;">&ldquo;${item.description}&rdquo;</div>`
              : ''
          }
        </td>
        <td style="padding: 14px 12px; text-align: center; vertical-align: top; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 600; color: #57534E;">
          ${item.quantity}
        </td>
        <td style="padding: 14px 0 14px 0; text-align: right; vertical-align: top; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 700; color: #17243A;">
          ${item.price}
        </td>
      </tr>
    `
    )
    .join('');

  const dashboardUrl =
    data.dashboardOrderUrl ||
    process.env.APP_URL ||
    '';

  const notesText =
    data.orderNotes ||
    data.aiAgentNotes ||
    `Appointment order scheduled for ${data.scheduledSlot || 'Saturday at 10:00 AM'}.`;

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Order #${data.orderNumber} - Baked by Doja</title>
  <style type="text/css">
    body {
      margin: 0;
      padding: 0;
      background-color: #FAF8F5;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      -webkit-text-size-adjust: none;
      color: #17243A;
    }
    table {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      border: 0;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    @media only screen and (max-width: 660px) {
      .email-container {
        width: 100% !important;
        max-width: 100% !important;
        border-radius: 0px !important;
        border-left: none !important;
        border-right: none !important;
      }
      .mobile-padding {
        padding: 20px 16px !important;
      }
      .header-stack {
        display: block !important;
        width: 100% !important;
        text-align: left !important;
      }
      .header-right {
        text-align: left !important;
        margin-top: 10px !important;
      }
      .meta-grid-cell {
        display: block !important;
        width: 100% !important;
        margin-bottom: 10px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 24px 10px; background-color: #FAF8F5;">
  <!-- MAIN WRAPPER -->
  <table width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#FAF8F5">
    <tr>
      <td align="center" valign="top">

        <!-- 620-640px CENTRAL EMAIL CONTAINER -->
        <table class="email-container" width="630" border="0" cellpadding="0" cellspacing="0" style="max-width: 630px; width: 100%; background-color: #FFFFFF; border: 1px solid #EBE5D8; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(23, 36, 58, 0.04);">
          
          <!-- BRAND HEADER -->
          <tr>
            <td style="padding: 24px 28px; border-bottom: 1px solid #F1ECE1; background-color: #FFFFFF;">
              <table width="100%" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <!-- Left: Brand Identity -->
                  <td align="left" valign="middle">
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td valign="middle" style="padding-right: 12px;">
                          <div style="width: 44px; height: 44px; background-color: #FEF3C7; border-radius: 12px; text-align: center; line-height: 44px; font-size: 24px;">
                            🍌
                          </div>
                        </td>
                        <td valign="middle">
                          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 20px; font-weight: 800; color: #17243A; line-height: 1.1; letter-spacing: -0.3px;">
                            Baked by Doja
                          </div>
                          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11px; color: #78716C; margin-top: 3px; font-weight: 500;">
                            Artisanal Handcrafted Banana Bread Bakery
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <!-- Right: Poetic Tagline -->
                  <td class="header-right" align="right" valign="middle" style="font-family: Georgia, 'Times New Roman', serif; font-size: 12px; font-style: italic; color: #8C827A; line-height: 1.35;">
                    Good Things<br />Are Always<br />Baked ♡
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- MAIN CONTENT BODY -->
          <tr>
            <td class="mobile-padding" style="padding: 28px 28px 24px 28px;">

              <!-- MAIN AI ORDER ALERT CARD -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #EDF8F2; border: 1px solid #C6EBD7; border-radius: 16px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px 22px;">
                    <table width="100%" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="left" valign="top">
                          <!-- Badge -->
                          <table border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 10px;">
                            <tr>
                              <td valign="middle" style="padding-right: 8px;">
                                <div style="width: 28px; height: 28px; background-color: #D1F2DF; border-radius: 50%; text-align: center; line-height: 28px; font-size: 14px;">
                                  🤖
                                </div>
                              </td>
                              <td valign="middle">
                                <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11px; font-weight: 800; color: #15803D; letter-spacing: 0.8px; text-transform: uppercase;">
                                  NEW AI VOICE AGENT ORDER
                                </span>
                              </td>
                            </tr>
                          </table>
                          <!-- Heading -->
                          <h1 style="margin: 0 0 6px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 21px; font-weight: 800; color: #17243A; letter-spacing: -0.3px; line-height: 1.25;">
                            New Order #${data.orderNumber} Captured!
                          </h1>
                          <!-- Supporting Text -->
                          <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; line-height: 1.5; color: #4B5563;">
                            An order was just taken live by the AI Voice Sales Agent and recorded into your dashboard and customer CRM.
                          </p>
                        </td>
                        <!-- Right voice wave symbol -->
                        <td align="right" valign="top" style="width: 36px; padding-left: 10px; padding-top: 4px;">
                          <div style="font-size: 20px; line-height: 1; opacity: 0.85;" title="Voice Audio Wave">
                            🎙️
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CUSTOMER DETAILS CARD -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border: 1px solid #EBE6DC; border-radius: 16px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 22px;">
                    <h2 style="margin: 0 0 16px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 800; color: #17243A; text-transform: uppercase; letter-spacing: 0.5px;">
                      Customer Details
                    </h2>
                    
                    <table width="100%" border="0" cellpadding="0" cellspacing="0" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px;">
                      
                      <!-- Customer Name -->
                      <tr>
                        <td style="padding: 7px 0; color: #78716C; width: 180px; vertical-align: top;">
                          👤 Customer Name:
                        </td>
                        <td style="padding: 7px 0; font-weight: 700; color: #17243A; vertical-align: top;">
                          ${data.customerName}
                        </td>
                      </tr>

                      <!-- Phone Number -->
                      <tr>
                        <td style="padding: 7px 0; color: #78716C; vertical-align: top;">
                          📞 Phone Number:
                        </td>
                        <td style="padding: 7px 0; font-weight: 700; color: #17243A; vertical-align: top;">
                          <a href="tel:${data.phone}" style="color: #17243A; text-decoration: none;">${data.phone}</a>
                        </td>
                      </tr>

                      <!-- Email Address -->
                      <tr>
                        <td style="padding: 7px 0; color: #78716C; vertical-align: top;">
                          ✉️ Email Address:
                        </td>
                        <td style="padding: 7px 0; font-weight: 600; color: #17243A; vertical-align: top;">
                          ${data.email || '<span style="color:#A8A29E; font-weight:400; font-style:italic;">Not provided during call</span>'}
                        </td>
                      </tr>

                      <!-- Delivery Destination -->
                      <tr>
                        <td style="padding: 7px 0; color: #78716C; vertical-align: top;">
                          📍 Delivery Destination:
                        </td>
                        <td style="padding: 7px 0; font-weight: 600; color: #17243A; vertical-align: top;">
                          ${data.deliveryAddress}
                        </td>
                      </tr>

                      <!-- Order Type -->
                      <tr>
                        <td style="padding: 7px 0; color: #78716C; vertical-align: top;">
                          📦 Order Type:
                        </td>
                        <td style="padding: 7px 0; font-weight: 600; color: #17243A; vertical-align: top;">
                          ${data.orderType || 'Delivery Appointment'}
                        </td>
                      </tr>

                      <!-- Scheduled Slot -->
                      <tr>
                        <td style="padding: 7px 0; color: #78716C; vertical-align: top;">
                          📅 Scheduled Slot:
                        </td>
                        <td style="padding: 7px 0; font-weight: 700; color: #B45309; vertical-align: top;">
                          ${data.scheduledSlot || 'Saturday at 10:00 AM'}
                        </td>
                      </tr>

                      <!-- Payment Method -->
                      <tr>
                        <td style="padding: 7px 0; color: #78716C; vertical-align: top;">
                          💳 Payment Method:
                        </td>
                        <td style="padding: 7px 0; font-weight: 600; color: #17243A; vertical-align: top;">
                          ${data.paymentMethod || 'Paystack'}
                        </td>
                      </tr>

                      <!-- Call / Order Notes -->
                      <tr>
                        <td style="padding: 7px 0; color: #78716C; vertical-align: top;">
                          📝 Call / Order Notes:
                        </td>
                        <td style="padding: 7px 0; font-weight: 500; color: #44403C; line-height: 1.45; vertical-align: top;">
                          ${notesText}
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>

              <!-- ORDERED ITEMS & FINANCIAL BREAKDOWN CARD -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border: 1px solid #EBE6DC; border-radius: 16px; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 22px;">
                    <h2 style="margin: 0 0 16px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 800; color: #17243A; text-transform: uppercase; letter-spacing: 0.5px;">
                      Ordered Items & Financial Breakdown
                    </h2>

                    <!-- Items Table -->
                    <table width="100%" border="0" cellpadding="0" cellspacing="0">
                      <thead>
                        <tr style="border-bottom: 2px solid #F1ECE1; text-align: left;">
                          <th style="padding-bottom: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11px; text-transform: uppercase; color: #78716C; letter-spacing: 0.5px;">
                            Item
                          </th>
                          <th style="padding-bottom: 8px; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11px; text-transform: uppercase; color: #78716C; letter-spacing: 0.5px;">
                            Qty
                          </th>
                          <th style="padding-bottom: 8px; text-align: right; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11px; text-transform: uppercase; color: #78716C; letter-spacing: 0.5px;">
                            Price
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        ${itemsHtml}
                      </tbody>
                    </table>

                    <!-- Financial Breakdown Rows -->
                    <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-top: 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                      <tr>
                        <td align="left" style="padding: 5px 0; font-size: 13px; color: #78716C;">
                          Subtotal:
                        </td>
                        <td align="right" style="padding: 5px 0; font-size: 13px; font-weight: 600; color: #17243A;">
                          ${data.subtotal}
                        </td>
                      </tr>
                      <tr>
                        <td align="left" style="padding: 5px 0; font-size: 13px; color: #78716C;">
                          Lagos Delivery Fee:
                        </td>
                        <td align="right" style="padding: 5px 0; font-size: 13px; font-weight: 600; color: #17243A;">
                          ${data.deliveryFee}
                        </td>
                      </tr>
                      
                      <!-- Grand Total Highlight Row -->
                      <tr>
                        <td colspan="2" style="padding-top: 12px;">
                          <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #FAF7F0; border: 1px solid #F0E8D9; border-radius: 12px;">
                            <tr>
                              <td align="left" style="padding: 14px 18px; font-size: 15px; font-weight: 800; color: #17243A;">
                                Grand Total:
                              </td>
                              <td align="right" style="padding: 14px 18px; font-size: 19px; font-weight: 900; color: #15803D;">
                                ${data.grandTotal}
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

              <!-- ORDER METADATA HORIZONTAL CARD -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #FAF8F5; border: 1px solid #EBE5D8; border-radius: 14px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <table width="100%" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <!-- Delivery Slot -->
                        <td class="meta-grid-cell" width="50%" align="left" valign="middle">
                          <table border="0" cellpadding="0" cellspacing="0">
                            <tr>
                              <td valign="middle" style="padding-right: 10px; font-size: 20px;">
                                📅
                              </td>
                              <td valign="middle">
                                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 800; color: #17243A;">
                                  ${data.scheduledSlot || 'Saturday · 10:00 AM'}
                                </div>
                                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11px; color: #78716C; margin-top: 2px;">
                                  Scheduled Delivery
                                </div>
                              </td>
                            </tr>
                          </table>
                        </td>

                        <!-- Payment Method -->
                        <td class="meta-grid-cell" width="50%" align="left" valign="middle">
                          <table border="0" cellpadding="0" cellspacing="0">
                            <tr>
                              <td valign="middle" style="padding-right: 10px; font-size: 20px;">
                                💳
                              </td>
                              <td valign="middle">
                                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 800; color: #17243A;">
                                  ${data.paymentMethod || 'Paystack'}
                                </div>
                                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11px; color: #78716C; margin-top: 2px;">
                                  Payment Method
                                </div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- PRIMARY CTA: FULL-WIDTH GOLDEN BUTTON -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="center" style="background-color: #F9B91A; border-radius: 14px; padding: 0;">
                    <a href="${dashboardUrl}" target="_blank" style="display: block; width: 100%; padding: 16px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; font-weight: 800; color: #17243A; text-decoration: none; text-align: center; letter-spacing: -0.2px; box-sizing: border-box;">
                      View Order in Dashboard &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- AI AGENT NOTES SECTION -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #F2FBF6; border: 1px solid #C7EED8; border-radius: 14px; margin-bottom: 8px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 800; color: #166534; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
                      AI Agent Notes
                    </div>
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; line-height: 1.5; color: #14532D; font-style: italic;">
                      &ldquo;${notesText}&rdquo;
                    </div>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- DIVIDER & FOOTER -->
          <tr>
            <td style="padding: 24px 28px 28px 28px; border-top: 1px solid #F1ECE1; text-align: center; background-color: #FFFFFF;">
              <p style="margin: 0 0 6px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; color: #78716C;">
                Baked with ❤️ in Lekki Phase 1, Lagos, Nigeria.
              </p>
              <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; color: #A8A29E;">
                Thank you for supporting Baked by Doja! ♡
              </p>
            </td>
          </tr>

        </table>
        <!-- END CENTRAL CONTAINER -->

      </td>
    </tr>
  </table>
  <!-- END MAIN WRAPPER -->
</body>
</html>`;
}

/**
 * Replace {{variable}} dynamic placeholders in templates
 */
export function interpolateEmailVariables(templateHtml: string, variables: Record<string, string>): string {
  let result = templateHtml;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    result = result.replace(regex, value);
  }
  return result;
}

/**
 * Standard reference sample order data for previews and tests
 */
export const SAMPLE_BAKERY_ORDER_EMAIL_DATA: OrderEmailData = {
  orderNumber: 'BB-4504',
  customerName: 'Bimbo',
  phone: '+234 803 999 1122',
  email: 'bimbo@example.com',
  deliveryAddress: 'Victoria Island, Lagos',
  orderType: 'Delivery Appointment',
  scheduledSlot: 'Saturday at 10:00 AM',
  paymentMethod: 'Paystack',
  orderNotes: 'Appointment order scheduled on Saturday at 10:00 AM.',
  items: [
    {
      name: 'Chocolate Chip Banana Bread',
      description: 'Moist, rich and full of chocolate chips.',
      quantity: 3,
      price: '₦30,000',
    },
  ],
  subtotal: '₦30,000',
  deliveryFee: '₦2,500',
  grandTotal: '₦32,500',
  dashboardOrderUrl: process.env.APP_URL || '',
  aiAgentNotes: 'Appointment order scheduled for Saturday at 10:00 AM.',
};

/**
 * Send an Order Confirmation Email to the customer using the strict Baked by Doja template
 */
export async function sendOrderConfirmationEmail(params: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: Array<{ title?: string; name?: string; description?: string; quantity: number; price: string }>;
  totalAmount: string;
  subtotal?: string;
  deliveryFee?: string;
  deliveryAddress: string;
  isAppointment?: boolean;
  appointmentDate?: string;
  appointmentTime?: string;
  orderType?: string;
  paymentMethod?: string;
  notes?: string;
  dashboardOrderUrl?: string;
}) {
  const normalizedItems: OrderItemEmail[] = params.items.map((i) => ({
    name: i.name || i.title || 'Artisanal Banana Bread',
    description: i.description || (i.name?.includes('Chocolate') ? 'Moist, rich and full of chocolate chips.' : 'Handcrafted fresh daily with caramelized ripe bananas.'),
    quantity: Number(i.quantity) || 1,
    price: i.price,
  }));

  const scheduledSlot = params.isAppointment
    ? `${params.appointmentDate || 'Saturday'} at ${params.appointmentTime || '10:00 AM'}`
    : 'Same-Day Hot Batch Delivery';

  const subtotal = params.subtotal || params.totalAmount;
  const deliveryFee = params.deliveryFee || '₦2,500';

  const html = buildBakedByDojaOrderEmailHtml({
    orderNumber: params.orderId,
    customerName: params.customerName,
    phone: params.customerPhone || '+234 803 999 1122',
    email: params.customerEmail,
    deliveryAddress: params.deliveryAddress,
    orderType: params.orderType || (params.isAppointment ? 'Delivery Appointment' : 'Standard Delivery'),
    scheduledSlot,
    paymentMethod: params.paymentMethod || 'Paystack',
    orderNotes: params.notes || `Appointment order scheduled on ${scheduledSlot}.`,
    items: normalizedItems,
    subtotal,
    deliveryFee,
    grandTotal: params.totalAmount,
    dashboardOrderUrl: params.dashboardOrderUrl,
  });

  return sendCustomEmail({
    to: params.customerEmail,
    subject: `Order Confirmed #${params.orderId} - Baked by Doja`,
    html,
  });
}

/**
 * Send an Admin Notification Email for every new order taken by the AI Voice Agent
 */
export async function sendAdminOrderNotificationEmail(params: {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  items: Array<{ title?: string; name?: string; description?: string; quantity: number; price: string }>;
  totalAmount: string;
  subtotal?: string;
  deliveryFee?: string;
  isAppointment?: boolean;
  appointmentDate?: string;
  appointmentTime?: string;
  orderType?: string;
  paymentMethod?: string;
  notes?: string;
  adminEmails?: string[];
  dashboardOrderUrl?: string;
}) {
  const normalizedItems: OrderItemEmail[] = params.items.map((i) => ({
    name: i.name || i.title || 'Artisanal Banana Bread',
    description: i.description || (i.name?.includes('Chocolate') ? 'Moist, rich and full of chocolate chips.' : 'Handcrafted fresh daily with caramelized ripe bananas.'),
    quantity: Number(i.quantity) || 1,
    price: i.price,
  }));

  const scheduledSlot = params.isAppointment
    ? `${params.appointmentDate || 'Saturday'} at ${params.appointmentTime || '10:00 AM'}`
    : 'Same-Day Hot Batch Delivery';

  const subtotal = params.subtotal || params.totalAmount;
  const deliveryFee = params.deliveryFee || '₦2,500';

  const html = buildBakedByDojaOrderEmailHtml({
    orderNumber: params.orderId,
    customerName: params.customerName,
    phone: params.customerPhone,
    email: params.customerEmail || 'customer@example.com',
    deliveryAddress: params.deliveryAddress,
    orderType: params.orderType || (params.isAppointment ? 'Delivery Appointment' : 'Standard Delivery'),
    scheduledSlot,
    paymentMethod: params.paymentMethod || 'Paystack',
    orderNotes: params.notes || `Appointment order scheduled on ${scheduledSlot}.`,
    items: normalizedItems,
    subtotal,
    deliveryFee,
    grandTotal: params.totalAmount,
    dashboardOrderUrl: params.dashboardOrderUrl,
  });

  const recipients = params.adminEmails && params.adminEmails.length > 0
    ? params.adminEmails
    : [process.env.ADMIN_ALERT_EMAIL || 'nuddywale@gmail.com', 'admin@bakedbydoja.com'];

  const results = [];
  for (const adminTo of recipients) {
    if (adminTo) {
      const res = await sendCustomEmail({
        to: adminTo,
        subject: `🚨 [New AI Voice Order] #${params.orderId}: ${params.customerName} (${params.totalAmount})`,
        html,
      });
      results.push(res);
    }
  }

  return { success: true, deliveries: results };
}

/**
 * High-level helper: Triggers Resend email notifications to BOTH customer & admin
 * whenever the AI Voice Agent takes an order or appointment.
 */
export async function notifyOrderCreatedViaVoice(order: any) {
  const settings = getStoredSettings();
  const orderId = order.orderId || order.id || `BB-${Math.floor(1000 + Math.random() * 9000)}`;
  const customerName = order.customerName || 'Valued Customer';
  const customerEmail = order.customerEmail || order.email || '';
  const customerPhone = order.customerPhone || order.phoneNumber || '';
  const totalAmount = order.amount || (typeof order.totalAmount === 'number' ? `₦${order.totalAmount.toLocaleString()}` : order.totalAmount) || '₦0';
  const deliveryFee = order.deliveryFee ? (typeof order.deliveryFee === 'number' ? `₦${order.deliveryFee.toLocaleString()}` : order.deliveryFee) : undefined;
  const subtotal = order.subtotal ? (typeof order.subtotal === 'number' ? `₦${order.subtotal.toLocaleString()}` : order.subtotal) : undefined;
  const deliveryAddress = order.deliveryAddress || settings.store.address || '';
  const isAppointment = Boolean(order.isAppointment);
  const appointmentDate = order.appointmentDate;
  const appointmentTime = order.appointmentTime;
  const orderType = order.orderType || (isAppointment ? 'Delivery Appointment' : 'Standard Delivery');
  const paymentMethod = order.paymentMethod || 'Paystack';
  const notes = order.notes || '';

  const items = Array.isArray(order.items) && order.items.length > 0
    ? order.items.map((i: any) => ({
        title: i.productName || i.name || i.title || 'Artisanal Banana Bread',
        description: i.description || (i.name?.includes('Chocolate') ? 'Moist, rich and full of chocolate chips.' : 'Freshly baked artisanal loaf.'),
        quantity: Number(i.quantity) || 1,
        price: i.price
          ? (typeof i.price === 'string' ? i.price : `₦${Number(i.price).toLocaleString()}`)
          : (i.unitPrice ? `₦${(Number(i.unitPrice) * (Number(i.quantity) || 1)).toLocaleString()}` : '₦0'),
      }))
    : [{ title: 'Artisanal Selection', description: 'Freshly baked bakery order.', quantity: 1, price: totalAmount }];

  const outcome = {
    customerEmailSent: false,
    customerEmailId: undefined as string | undefined,
    adminEmailSent: false,
    adminEmailDeliveries: [] as any[],
  };

  // 1. Send confirmation email to Customer (if valid email is present)
  if (customerEmail && customerEmail.includes('@')) {
    try {
      const custRes = await sendOrderConfirmationEmail({
        orderId,
        customerName,
        customerEmail,
        customerPhone,
        items,
        totalAmount,
        subtotal,
        deliveryFee,
        deliveryAddress,
        isAppointment,
        appointmentDate,
        appointmentTime,
        orderType,
        paymentMethod,
        notes,
      });
      outcome.customerEmailSent = Boolean(custRes.success);
      outcome.customerEmailId = custRes.id;
      console.log(`📧 Customer order confirmation sent to ${customerEmail} (Order #${orderId})`);
    } catch (err: any) {
      console.warn(`Failed to send customer confirmation to ${customerEmail}:`, err?.message || err);
    }
  } else {
    console.log(`ℹ️ Order #${orderId}: No customer email provided on voice call (Phone: ${customerPhone || 'N/A'}). Admin notification will still be sent.`);
  }

  // 2. Always send real-time notification to Bakery Admin
  try {
    const adminRecipients = Array.from(
      new Set(
        [
          process.env.ADMIN_ALERT_EMAIL,
          process.env.ADMIN_EMAIL,
          settings.notifications.adminNotificationEmail,
          settings.security.adminEmail,
        ]
          .filter(Boolean)
          .map((e) => (e as string).toLowerCase().trim())
      )
    );

    const adminRes = await sendAdminOrderNotificationEmail({
      orderId,
      customerName,
      customerPhone,
      customerEmail,
      deliveryAddress,
      items,
      totalAmount,
      subtotal,
      deliveryFee,
      isAppointment,
      appointmentDate,
      appointmentTime,
      orderType,
      paymentMethod,
      notes,
      adminEmails: adminRecipients,
    });
    outcome.adminEmailSent = Boolean(adminRes.success);
    outcome.adminEmailDeliveries = adminRes.deliveries || [];
    console.log(`🔔 Admin notification email triggered for Order #${orderId} to: ${adminRecipients.join(', ')}`);
  } catch (err: any) {
    console.warn('Failed to send admin order notification email:', err?.message || err);
  }

  return outcome;
}

/**
 * Send a Payment Receipt Email
 */
export async function sendPaymentReceiptEmail(params: {
  receiptNumber: string;
  customerName: string;
  customerEmail: string;
  amount: string;
  paymentMethod: string;
  orderId?: string;
}) {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Payment Receipt #${params.receiptNumber}</title>
</head>
<body style="margin:0; padding:24px; background-color:#FAF8F5; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="600" style="background:#ffffff; border-radius:20px; border:1px solid #EBE5D8; padding:32px; box-shadow:0 4px 20px rgba(0,0,0,0.03);">
          <tr>
            <td align="center">
              <div style="font-size:32px; margin-bottom:12px;">🍌</div>
              <h2 style="margin:0 0 4px 0; font-size:20px; font-weight:800; color:#17243A;">Official Payment Receipt</h2>
              <p style="margin:0 0 20px 0; color:#78716C; font-size:13px;">Receipt #${params.receiptNumber}</p>
              
              <div style="background-color:#EDF8F2; border:1px solid #C6EBD7; border-radius:14px; padding:20px; margin-bottom:24px;">
                <span style="font-size:12px; font-weight:700; color:#15803D; text-transform:uppercase;">Amount Paid</span>
                <div style="font-size:32px; font-weight:900; color:#15803D; margin-top:4px;">${params.amount}</div>
                <div style="font-size:12px; color:#4B5563; margin-top:2px;">via ${params.paymentMethod}</div>
              </div>

              <table width="100%" style="font-size:13px; color:#17243A; border-top:1px solid #F1ECE1; padding-top:16px;">
                <tr>
                  <td style="padding:6px 0; color:#78716C;">Customer:</td>
                  <td style="padding:6px 0; font-weight:700; text-align:right;">${params.customerName}</td>
                </tr>
                ${
                  params.orderId
                    ? `<tr>
                  <td style="padding:6px 0; color:#78716C;">Order ID:</td>
                  <td style="padding:6px 0; font-weight:700; text-align:right;">#${params.orderId}</td>
                </tr>`
                    : ''
                }
                <tr>
                  <td style="padding:6px 0; color:#78716C;">Date:</td>
                  <td style="padding:6px 0; font-weight:700; text-align:right;">${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                </tr>
              </table>

              <div style="margin-top:28px; padding-top:20px; border-top:1px solid #F1ECE1; font-size:11px; color:#78716C;">
                Baked by Doja • Artisanal Handcrafted Banana Bread Bakery<br>
                Lekki Phase 1, Lagos, Nigeria
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return sendCustomEmail({
    to: params.customerEmail,
    subject: `Payment Receipt: #${params.receiptNumber} - Baked by Doja`,
    html,
  });
}

/**
 * Send a Customer Message Email
 */
export async function sendCustomerMessageEmail(params: {
  customerName: string;
  customerEmail: string;
  message: string;
  subject?: string;
}) {
  const subject = params.subject || 'Message from Baked by Doja';
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin:0; padding:24px; background-color:#FAF8F5; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="600" style="background:#ffffff; border-radius:20px; border:1px solid #EBE5D8; padding:32px; box-shadow:0 4px 20px rgba(0,0,0,0.03);">
          <tr>
            <td>
              <div style="margin-bottom:16px;">
                <span style="font-size:24px;">🍌</span>
                <span style="font-size:18px; font-weight:800; color:#17243A; margin-left:8px;">Baked by Doja</span>
              </div>
              <h2 style="font-size:18px; font-weight:800; margin:0 0 12px 0; color:#17243A;">Hello ${params.customerName},</h2>
              <div style="background-color:#FAF7F0; border-left:4px solid #F9B91A; border-radius:8px; padding:16px; margin:16px 0;">
                <p style="margin:0; font-size:14px; line-height:1.6; color:#334155; white-space:pre-line;">${params.message}</p>
              </div>
              <p style="font-size:12px; color:#78716C; margin-top:20px;">
                You can reply directly to this email or speak with our 24/7 AI voice sales agent anytime.
              </p>
              <div style="margin-top:28px; padding-top:16px; border-top:1px solid #F1ECE1; font-size:11px; color:#78716C; text-align:center;">
                Baked with ❤️ in Lekki Phase 1, Lagos, Nigeria.
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return sendCustomEmail({
    to: params.customerEmail,
    subject,
    html,
  });
}

/**
 * Generic email sender using Resend
 */
export async function sendCustomEmail(params: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}): Promise<{ success: boolean; id?: string; error?: string; simulated?: boolean }> {
  const recipient = Array.isArray(params.to) ? params.to[0] : params.to;

  if (!isConfigured || !resendClient) {
    const simulatedId = `resend_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    console.log(`📨 [Resend Simulated Email] To: ${recipient} | Subject: "${params.subject}" | ID: ${simulatedId}`);
    return {
      success: true,
      id: simulatedId,
      simulated: true,
    };
  }

  try {
    const { data, error } = await resendClient.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    });

    if (error) {
      console.error('Resend API error:', error);
      return { success: false, error: error.message };
    }

    console.log(`✅ [Resend Email Sent] ID: ${data?.id} to ${recipient}`);
    return { success: true, id: data?.id, simulated: false };
  } catch (err: any) {
    console.error('Resend delivery exception:', err);
    return { success: false, error: err.message || 'Email delivery failed' };
  }
}

/**
 * Send admin alert email
 */
export async function sendAdminAlertEmail(params: {
  title: string;
  message: string;
  adminEmail?: string;
}) {
  const to = params.adminEmail || process.env.ADMIN_ALERT_EMAIL || 'admin@bakedbydoja.com';
  const html = `<!DOCTYPE html>
<html>
<body style="font-family:sans-serif; background:#FAF8F5; padding:24px;">
  <div style="max-width:580px; margin:0 auto; background:#fff; border-radius:16px; padding:24px; border:1px solid #EBE5D8;">
    <h2 style="margin:0 0 8px 0; color:#17243A;">⚠️ Bakery Admin Alert</h2>
    <p style="font-size:15px; font-weight:bold; color:#17243A;">${params.title}</p>
    <p style="font-size:13px; color:#475569; line-height:1.6;">${params.message}</p>
    <p style="font-size:11px; color:#78716C; margin-top:20px;">Baked by Doja Automated AI Monitoring</p>
  </div>
</body>
</html>`;

  return sendCustomEmail({
    to,
    subject: `[Bakery Alert] ${params.title}`,
    html,
  });
}
