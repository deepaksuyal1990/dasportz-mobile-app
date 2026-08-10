import type { InvoiceData } from './invoiceHtml';

export function buildOrderThankYouMessage(data: InvoiceData) {
  const firstName = data.customerName.trim().split(' ')[0] || 'there';
  const referenceLabel = data.kind === 'service' ? 'Booking ID' : 'Order ID';
  const paymentLabel =
    data.paymentMethod === 'cash' ? 'Cash at store (pay on visit)' : 'Paid online via UPI';

  const detailLines = (data.details ?? [])
    .filter((item) => item.label !== 'Payment' && item.value.trim())
    .map((item) => `• ${item.label}: ${item.value}`)
    .join('\n');

  return [
    `Hi ${firstName}! 🏸`,
    '',
    'Thank you for choosing *DA SPORTZ*!',
    '',
    `Your ${data.kind === 'service' ? 'service booking' : 'order'} is confirmed.`,
    '',
    `*${referenceLabel}:* ${data.orderId}`,
    `*Amount:* ${data.amount}`,
    `*Payment:* ${paymentLabel}`,
    detailLines ? '' : null,
    detailLines || null,
    '',
    'Your invoice PDF is attached in the next step.',
    '',
    'Team DA SPORTZ',
    'Gaur City, Greater Noida West',
    '📞 +91 88005 05769',
  ]
    .filter((line) => line !== null)
    .join('\n');
}
