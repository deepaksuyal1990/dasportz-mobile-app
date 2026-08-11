import type { InvoiceData } from '../utils/invoicePdf';
import { showOrderNotification } from './localNotifications';
import { requestTwilioOrderNotify } from './twilioNotify';

/**
 * Local notification + Twilio WhatsApp via PlayNex backend (when allowed).
 * Does not open the WhatsApp app.
 *
 * WhatsApp is skipped when the user turned off WhatsApp in notification preferences.
 * Prefer passing notifyCustomer: false on create-order in that case so the backend
 * does not message them either.
 */
export async function notifyOrderConfirmation(
  invoiceData: InvoiceData,
  customerPhone: string,
  options?: {
    backendAlreadyNotified?: boolean;
    /** When false, skip Twilio / backend WhatsApp entirely. Defaults to true. */
    allowWhatsApp?: boolean;
  },
) {
  const isCash = invoiceData.paymentMethod === 'cash';
  const title = isCash
    ? invoiceData.kind === 'service'
      ? 'Booking reserved'
      : 'Order placed'
    : invoiceData.kind === 'service'
      ? 'Booking confirmed'
      : 'Order confirmed';

  const body = isCash
    ? `${invoiceData.orderId} · ${invoiceData.amount} · Pay at store`
    : `${invoiceData.orderId} · ${invoiceData.amount} · Payment received`;

  await showOrderNotification({
    title,
    body,
    orderId: invoiceData.orderId,
  });

  const allowWhatsApp = options?.allowWhatsApp !== false;
  if (!allowWhatsApp) {
    console.log('[OrderConfirmation] WhatsApp skipped — preference is off');
    return;
  }

  try {
    const result = await requestTwilioOrderNotify({
      customerPhone,
      invoiceData,
      alreadyNotified: options?.backendAlreadyNotified,
    });
    if (!result.ok && !result.alreadyHandled) {
      console.warn('[OrderConfirmation] Twilio backend notify:', result.message);
    }
  } catch (err) {
    console.warn('[OrderConfirmation] Twilio backend notify failed:', err);
  }
}
