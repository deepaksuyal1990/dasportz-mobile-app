import { buildInvoiceHtml, type InvoiceData } from './invoiceHtml';

export type { InvoiceData } from './invoiceHtml';

export async function createInvoicePdfUri(_data: InvoiceData): Promise<string> {
  throw new Error('PDF file generation is not available on web.');
}

export async function downloadInvoicePdf(data: InvoiceData) {
  const html = buildInvoiceHtml(data);

  if (typeof document === 'undefined') {
    throw new Error('Invoice download is not available in this environment.');
  }

  await new Promise<void>((resolve, reject) => {
    const frame = document.createElement('iframe');
    frame.setAttribute('title', `Invoice ${data.orderId}`);
    frame.style.cssText =
      'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      window.setTimeout(() => {
        if (frame.parentNode) {
          document.body.removeChild(frame);
        }
      }, 300);
      resolve();
    };

    frame.onload = () => {
      const win = frame.contentWindow;
      if (!win) {
        finish();
        reject(new Error('Could not open print preview.'));
        return;
      }

      win.onafterprint = finish;
      win.focus();
      win.print();

      // Fallback if onafterprint is not fired (some browsers).
      window.setTimeout(finish, 2000);
    };

    frame.onerror = () => {
      if (frame.parentNode) {
        document.body.removeChild(frame);
      }
      reject(new Error('Could not open print preview.'));
    };

    document.body.appendChild(frame);
    frame.srcdoc = html;
  });
}
