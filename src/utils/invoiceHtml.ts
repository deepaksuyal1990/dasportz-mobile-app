import { business, contact } from '../data/content';

export type InvoiceData = {
  kind: 'service' | 'purchase';
  orderId: string;
  customerName: string;
  amount: string;
  paymentMethod: 'cash' | 'upi';
  details?: Array<{ label: string; value: string }>;
};

type LineItem = {
  description: string;
  details: string;
  qty: number;
  unitPrice: string;
  lineTotal: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatInvoiceDate() {
  return new Date().toLocaleString('en-IN', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  });
}

function parseAmount(value: string) {
  const digits = value.replace(/[^\d.]/g, '');
  const parsed = Number(digits);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getDetail(details: Array<{ label: string; value: string }>, label: string) {
  return details.find((item) => item.label === label)?.value ?? '';
}

function buildLineItems(data: InvoiceData): LineItem[] {
  const details = data.details ?? [];
  const total = parseAmount(data.amount);
  const product = getDetail(details, 'Product');
  const service = getDetail(details, 'Service');
  const racketCount = Number(getDetail(details, 'Rackets')) || 1;
  const qty = data.kind === 'service' ? Math.max(racketCount, 1) : 1;
  const unitAmount = qty > 0 ? total / qty : total;

  const metaParts = details
    .filter((item) => !['Product', 'Service', 'Payment', 'Rackets'].includes(item.label))
    .map((item) => `${item.label}: ${item.value}`);

  const description = product || service || (data.kind === 'service' ? 'Service booking' : 'Product order');

  return [
    {
      description,
      details: metaParts.join(' · '),
      qty,
      unitPrice: formatCurrency(unitAmount),
      lineTotal: formatCurrency(total),
    },
  ];
}

export function buildInvoiceHtml(data: InvoiceData) {
  const isCash = data.paymentMethod === 'cash';
  const details = data.details ?? [];
  const lineItems = buildLineItems(data);
  const subtotal = parseAmount(data.amount);
  const invoiceTitle = data.kind === 'service' ? 'Service Tax Invoice' : 'Tax Invoice';
  const paymentLabel = isCash ? 'Cash at store' : 'UPI / Online';
  const paymentStatus = isCash ? 'Payment pending' : 'Paid';
  const statusClass = isCash ? 'status-pending' : 'status-paid';
  const store = getDetail(details, 'Store');
  const orderType = data.kind === 'service' ? 'Service booking' : 'Product order';

  const itemRows = lineItems
    .map(
      (item, index) => `
        <tr>
          <td class="col-num">${index + 1}</td>
          <td class="col-desc">
            <div class="item-title">${escapeHtml(item.description)}</div>
            ${item.details ? `<div class="item-meta">${escapeHtml(item.details)}</div>` : ''}
          </td>
          <td class="col-qty">${item.qty}</td>
          <td class="col-price">${escapeHtml(item.unitPrice)}</td>
          <td class="col-total">${escapeHtml(item.lineTotal)}</td>
        </tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Invoice ${escapeHtml(data.orderId)} — ${escapeHtml(business.name)}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: Arial, Helvetica, sans-serif;
      color: #111;
      margin: 0;
      padding: 28px 32px;
      background: #fff;
      font-size: 12px;
      line-height: 1.45;
    }
    .invoice-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 24px;
      padding-bottom: 18px;
      border-bottom: 2px solid #111;
      margin-bottom: 20px;
    }
    .brand-block .brand {
      font-size: 26px;
      font-weight: 700;
      letter-spacing: 0.04em;
      color: #111;
      margin-bottom: 4px;
    }
    .brand-block .tagline {
      font-size: 11px;
      color: #565959;
      max-width: 280px;
    }
    .invoice-meta {
      text-align: right;
      min-width: 220px;
    }
    .invoice-meta .title {
      font-size: 20px;
      font-weight: 700;
      color: #111;
      margin-bottom: 10px;
    }
    .meta-row {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-bottom: 4px;
      font-size: 11px;
    }
    .meta-row .label { color: #565959; min-width: 88px; text-align: right; }
    .meta-row .value { color: #111; font-weight: 600; min-width: 120px; text-align: right; }
    .status-badge {
      display: inline-block;
      margin-top: 8px;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .status-paid { background: #d5f5e3; color: #067d62; }
    .status-pending { background: #fef3c7; color: #92400e; }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 22px;
    }
    .info-card {
      border: 1px solid #d5d9d9;
      border-radius: 4px;
      padding: 14px 16px;
      background: #fafafa;
    }
    .info-card h3 {
      margin: 0 0 10px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #565959;
    }
    .info-card p {
      margin: 0 0 4px;
      font-size: 12px;
      color: #111;
    }
    .info-card .muted { color: #565959; font-size: 11px; }
    .order-summary {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 18px;
      padding: 12px 14px;
      background: #f7fafa;
      border: 1px solid #d5d9d9;
      border-radius: 4px;
    }
    .summary-item .label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #565959;
      margin-bottom: 4px;
    }
    .summary-item .value {
      font-size: 12px;
      font-weight: 600;
      color: #111;
    }
    .section-heading {
      font-size: 13px;
      font-weight: 700;
      color: #111;
      margin: 0 0 10px;
    }
    table.items {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 18px;
      border: 1px solid #d5d9d9;
    }
    table.items thead th {
      background: #f0f2f2;
      color: #111;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      padding: 10px 12px;
      border-bottom: 1px solid #d5d9d9;
      text-align: left;
    }
    table.items tbody td {
      padding: 12px;
      border-bottom: 1px solid #e7e7e7;
      vertical-align: top;
    }
    table.items tbody tr:last-child td { border-bottom: none; }
    .col-num { width: 36px; text-align: center; color: #565959; }
    .col-desc { width: auto; }
    .col-qty, .col-price, .col-total { width: 90px; text-align: right; white-space: nowrap; }
    .item-title { font-weight: 700; color: #111; margin-bottom: 4px; }
    .item-meta { font-size: 11px; color: #565959; }
    .totals-wrap {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 22px;
    }
    .totals {
      width: 280px;
      border: 1px solid #d5d9d9;
      border-radius: 4px;
      overflow: hidden;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 9px 14px;
      border-bottom: 1px solid #e7e7e7;
      font-size: 12px;
    }
    .totals-row:last-child { border-bottom: none; }
    .totals-row .label { color: #565959; }
    .totals-row .value { font-weight: 600; color: #111; }
    .totals-row.grand {
      background: #111;
      color: #fff;
      font-size: 14px;
      font-weight: 700;
    }
    .totals-row.grand .label,
    .totals-row.grand .value { color: #fff; }
    .notes {
      border-top: 1px solid #d5d9d9;
      padding-top: 14px;
      margin-bottom: 14px;
    }
    .notes h4 {
      margin: 0 0 6px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #565959;
    }
    .notes p {
      margin: 0;
      font-size: 11px;
      color: #565959;
      line-height: 1.55;
    }
    .footer {
      border-top: 1px solid #d5d9d9;
      padding-top: 12px;
      font-size: 10px;
      color: #888;
      text-align: center;
      line-height: 1.6;
    }
    @media print {
      body { padding: 16px; }
      .info-card, .order-summary { break-inside: avoid; }
      table.items { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="invoice-top">
    <div class="brand-block">
      <div class="brand">${escapeHtml(business.name)}</div>
      <div class="tagline">${escapeHtml(business.tagline)}</div>
    </div>
    <div class="invoice-meta">
      <div class="title">${invoiceTitle}</div>
      <div class="meta-row">
        <span class="label">Invoice No.</span>
        <span class="value">INV-${escapeHtml(data.orderId)}</span>
      </div>
      <div class="meta-row">
        <span class="label">Order ID</span>
        <span class="value">${escapeHtml(data.orderId)}</span>
      </div>
      <div class="meta-row">
        <span class="label">Invoice Date</span>
        <span class="value">${escapeHtml(formatInvoiceDate())}</span>
      </div>
      <span class="status-badge ${statusClass}">${paymentStatus}</span>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-card">
      <h3>Sold by</h3>
      <p><strong>${escapeHtml(business.legalEntity)}</strong></p>
      <p>${escapeHtml(contact.address)}</p>
      <p class="muted">${escapeHtml(contact.phoneDisplay)}</p>
      <p class="muted">${escapeHtml(contact.email)}</p>
      <p class="muted">${escapeHtml(contact.hours)}</p>
    </div>
    <div class="info-card">
      <h3>Bill to</h3>
      <p><strong>${escapeHtml(data.customerName)}</strong></p>
      ${store ? `<p class="muted">Pickup / service at: ${escapeHtml(store)}</p>` : ''}
      <p class="muted">Order type: ${escapeHtml(orderType)}</p>
    </div>
  </div>

  <div class="order-summary">
    <div class="summary-item">
      <div class="label">Order ID</div>
      <div class="value">${escapeHtml(data.orderId)}</div>
    </div>
    <div class="summary-item">
      <div class="label">Order date</div>
      <div class="value">${escapeHtml(formatInvoiceDate())}</div>
    </div>
    <div class="summary-item">
      <div class="label">Payment method</div>
      <div class="value">${escapeHtml(paymentLabel)}</div>
    </div>
    <div class="summary-item">
      <div class="label">Payment status</div>
      <div class="value">${escapeHtml(paymentStatus)}</div>
    </div>
  </div>

  <p class="section-heading">Order details</p>
  <table class="items">
    <thead>
      <tr>
        <th class="col-num">#</th>
        <th class="col-desc">Description</th>
        <th class="col-qty">Qty</th>
        <th class="col-price">Unit price</th>
        <th class="col-total">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
    </tbody>
  </table>

  <div class="totals-wrap">
    <div class="totals">
      <div class="totals-row">
        <span class="label">Subtotal</span>
        <span class="value">${escapeHtml(formatCurrency(subtotal))}</span>
      </div>
      <div class="totals-row">
        <span class="label">Discount</span>
        <span class="value">${formatCurrency(0)}</span>
      </div>
      <div class="totals-row">
        <span class="label">Shipping / pickup</span>
        <span class="value">${formatCurrency(0)}</span>
      </div>
      <div class="totals-row grand">
        <span class="label">${isCash ? 'Amount due' : 'Grand total'}</span>
        <span class="value">${escapeHtml(data.amount)}</span>
      </div>
    </div>
  </div>

  <div class="notes">
    <h4>Important information</h4>
    <p>
      ${
        isCash
          ? 'This is a provisional invoice. Please pay the amount due in cash at the DA SPORTZ store counter. Show this invoice or your order ID to collect your order or confirm your service booking.'
          : 'Payment has been received successfully. This invoice serves as confirmation of your order. For any queries regarding your order, contact us on WhatsApp or email.'
      }
    </p>
  </div>

  <div class="footer">
    ${escapeHtml(business.name)} · ${escapeHtml(contact.address)} · ${escapeHtml(contact.phoneDisplay)}<br />
    ${escapeHtml(business.website)} · Powered by ${escapeHtml(business.poweredBy)} · Computer-generated invoice, no signature required.
  </div>
</body>
</html>`;
}
