import { buildInvoiceHtml, type InvoiceData } from './invoiceHtml';
import { buildInvoiceFileName } from './invoiceFileName';

export type { InvoiceData } from './invoiceHtml';

export async function createInvoicePdfUri(_data: InvoiceData): Promise<string> {
  throw new Error('PDF file generation is not available on web.');
}

export async function downloadInvoicePdf(data: InvoiceData) {
  if (typeof document === 'undefined') {
    throw new Error('Invoice download is not available in this environment.');
  }

  const html = buildInvoiceHtml(data);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const fileName = buildInvoiceFileName(data).replace(/\.pdf$/i, '.html');

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}
