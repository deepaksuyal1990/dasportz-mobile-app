import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system/legacy';
import { Alert, Platform } from 'react-native';
import { buildInvoiceHtml, type InvoiceData } from './invoiceHtml';
import { buildInvoiceFileName } from './invoiceFileName';

export type { InvoiceData } from './invoiceHtml';

async function ensureInvoiceDir(): Promise<string> {
  const root = FileSystem.documentDirectory;
  if (!root) {
    throw new Error('Document storage is not available on this device.');
  }
  const dir = `${root}invoices/`;
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
  return dir;
}

/** Generate a PDF and store it under a professional filename in app documents. */
export async function createInvoicePdfUri(data: InvoiceData): Promise<string> {
  const html = buildInvoiceHtml(data);
  const result = await Print.printToFileAsync({ html });

  if (!result?.uri) {
    throw new Error('Could not generate invoice PDF.');
  }

  const fileName = buildInvoiceFileName(data);
  const dir = await ensureInvoiceDir();
  const dest = `${dir}${fileName}`;

  const existing = await FileSystem.getInfoAsync(dest);
  if (existing.exists) {
    await FileSystem.deleteAsync(dest, { idempotent: true });
  }

  await FileSystem.copyAsync({ from: result.uri, to: dest });
  return dest;
}

async function saveToAndroidDownloads(tempOrLocalUri: string, fileName: string): Promise<string | null> {
  try {
    const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
    if (!permissions.granted) return null;

    const baseName = fileName.replace(/\.pdf$/i, '');
    const safUri = await FileSystem.StorageAccessFramework.createFileAsync(
      permissions.directoryUri,
      baseName,
      'application/pdf',
    );
    const base64 = await FileSystem.readAsStringAsync(tempOrLocalUri, {
      encoding: 'base64',
    });
    await FileSystem.writeAsStringAsync(safUri, base64, {
      encoding: 'base64',
    });
    return safUri;
  } catch {
    return null;
  }
}

/**
 * Save invoice PDF to local device storage (does NOT open WhatsApp / share sheet).
 * Android: prompts for a folder (pick Downloads once) and writes the PDF there.
 * iOS / fallback: saves into the app Documents/invoices folder.
 */
export async function downloadInvoicePdf(data: InvoiceData): Promise<string> {
  const localUri = await createInvoicePdfUri(data);
  const fileName = buildInvoiceFileName(data);

  if (Platform.OS === 'android') {
    const publicUri = await saveToAndroidDownloads(localUri, fileName);
    if (publicUri) {
      Alert.alert('Invoice downloaded', `Saved as:\n${fileName}`);
      return publicUri;
    }
  }

  Alert.alert(
    'Invoice saved',
    Platform.OS === 'ios'
      ? `Saved as ${fileName} in the DA SPORTZ app documents.\n\nYou can find it in the Files app under On My iPhone → DA SPORTZ.`
      : `Saved as ${fileName} on this device.`,
  );
  return localUri;
}
