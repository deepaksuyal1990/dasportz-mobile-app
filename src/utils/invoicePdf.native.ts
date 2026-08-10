import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';
import { buildInvoiceHtml, type InvoiceData } from './invoiceHtml';

export type { InvoiceData } from './invoiceHtml';

export async function createInvoicePdfUri(data: InvoiceData): Promise<string> {
  const html = buildInvoiceHtml(data);
  const result = await Print.printToFileAsync({ html });

  if (!result?.uri) {
    throw new Error('Could not generate invoice PDF.');
  }

  return result.uri;
}

export async function downloadInvoicePdf(data: InvoiceData) {
  const uri = await createInvoicePdfUri(data);

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    Alert.alert(
      'Invoice saved',
      Platform.OS === 'android'
        ? `Your invoice PDF was created at:\n${uri}`
        : 'Sharing is not available on this device.',
    );
    return;
  }

  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: `Invoice ${data.orderId}`,
    UTI: 'com.adobe.pdf',
  });
}
