import { toWhatsAppE164 } from '../utils/linking';
import type { InvoiceData } from '../utils/invoiceHtml';
import { getApiBase, SHOP_ID } from './paymentsApi';

export type BackendNotifyResult = {
  ok: boolean;
  alreadyHandled?: boolean;
  message?: string;
};

/**
 * Ask PlayNex Lambda to (re)send order WhatsApp via Twilio.
 * Primary path is create-order / verify-payment; this is a best-effort
 * follow-up for cash product orders where create-order still opens a Zoho session.
 */
export async function requestTwilioOrderNotify(params: {
  customerPhone: string;
  invoiceData: InvoiceData;
  /** Set when create-order / verify-payment already messaged the customer. */
  alreadyNotified?: boolean;
}): Promise<BackendNotifyResult> {
  if (params.alreadyNotified) {
    return { ok: true, alreadyHandled: true, message: 'WhatsApp already sent by backend' };
  }

  const to = toWhatsAppE164(params.customerPhone);
  if (!to) {
    return { ok: false, message: 'Invalid customer phone' };
  }

  const { invoiceData } = params;
  const status =
    invoiceData.paymentMethod === 'cash'
      ? invoiceData.kind === 'service'
        ? 'booking_reserved'
        : 'order_placed_cash'
      : invoiceData.kind === 'service'
        ? 'booking_confirmed'
        : 'order_paid';

  // Documented staff/status route — may require auth; try public body shapes first.
  const attempts: Array<{ path: string; body: Record<string, unknown> }> = [
    {
      path: '/api/send-status-update',
      body: {
        shopId: SHOP_ID,
        orderId: invoiceData.orderId,
        order_id: invoiceData.orderId,
        phone: to,
        status,
        paymentMethod: invoiceData.paymentMethod,
        kind: invoiceData.kind,
        amount: invoiceData.amount,
        customerName: invoiceData.customerName,
        channel: 'whatsapp',
        message:
          invoiceData.paymentMethod === 'cash'
            ? `DA SPORTZ: Your ${invoiceData.kind === 'service' ? 'booking' : 'order'} ${invoiceData.orderId} is reserved. Amount ${invoiceData.amount} — pay cash at the store.`
            : `DA SPORTZ: Payment received for ${invoiceData.orderId}. Amount ${invoiceData.amount}. Thank you!`,
      },
    },
  ];

  for (const attempt of attempts) {
    try {
      const res = await fetch(`${getApiBase()}${attempt.path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(attempt.body),
      });
      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        message?: string;
      };
      if (res.ok && data.success !== false) {
        return { ok: true, message: data.message };
      }
    } catch {
      // try next
    }
  }

  return {
    ok: false,
    message:
      'Backend Twilio notify endpoint unavailable. Cash service bookings still notify via create-order; UPI notifies via verify-payment/webhook.',
  };
}
