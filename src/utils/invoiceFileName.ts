import type { InvoiceData } from './invoiceHtml';

/** Safe filesystem token from order/booking id. */
function sanitizeOrderId(orderId: string): string {
  return orderId
    .trim()
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toUpperCase()
    .slice(0, 48);
}

function invoiceDateStamp(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

/**
 * Professional invoice PDF filename, e.g.
 * DA-SPORTZ_Tax-Invoice_ORD-ABC123_20260811.pdf
 */
export function buildInvoiceFileName(data: InvoiceData, date = new Date()): string {
  const docType = data.kind === 'service' ? 'Service-Invoice' : 'Tax-Invoice';
  const orderPart = sanitizeOrderId(data.orderId) || 'ORDER';
  return `DA-SPORTZ_${docType}_${orderPart}_${invoiceDateStamp(date)}.pdf`;
}
