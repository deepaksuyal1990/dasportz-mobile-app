/** TypeScript entry; Metro resolves `.native` / `.web` at runtime. */
export type { InvoiceData } from './invoiceHtml';
export { createInvoicePdfUri, downloadInvoicePdf } from './invoicePdf.native';
