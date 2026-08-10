import { Platform } from 'react-native';
import * as Sharing from 'expo-sharing';
import { buildOrderThankYouMessage } from '../utils/orderThankYou';
import { createInvoicePdfUri, type InvoiceData } from '../utils/invoicePdf';
import { openWhatsAppToCustomer } from '../utils/linking';
import { showOrderNotification } from './localNotifications';

export async function sendOrderConfirmationWhatsApp(
  customerPhone: string,
  invoiceData: InvoiceData,
) {
  const message = buildOrderThankYouMessage(invoiceData);

  if (Platform.OS === 'web') {
    await openWhatsAppToCustomer(customerPhone, message);
    return;
  }

  const pdfUri = await createInvoicePdfUri(invoiceData);
  await openWhatsAppToCustomer(customerPhone, message);

  // WhatsApp deep links cannot attach files — open share sheet for the PDF right after.
  await new Promise((resolve) => setTimeout(resolve, 900));

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(pdfUri, {
      mimeType: 'application/pdf',
      dialogTitle: `Attach invoice ${invoiceData.orderId}`,
      UTI: 'com.adobe.pdf',
    });
  }
}

export async function notifyOrderConfirmation(
  invoiceData: InvoiceData,
  customerPhone: string,
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

  try {
    await sendOrderConfirmationWhatsApp(customerPhone, invoiceData);
  } catch {
    // WhatsApp/share may be cancelled by the user — order still succeeded.
  }
}
