import { Linking, Alert, Platform } from 'react-native';
import { contact } from '../data/content';

/** Normalize to Indian E.164 digits without +: 91XXXXXXXXXX */
export function toWhatsAppE164(phone: string, defaultCountryCode = '91'): string | null {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return null;

  // Already includes country code (12+ digits starting with 91)
  if (digits.length >= 12 && digits.startsWith(defaultCountryCode)) {
    return digits.slice(0, 12);
  }

  // 10-digit Indian mobile
  const local = digits.slice(-10);
  if (local.length === 10 && /^[6-9]\d{9}$/.test(local)) {
    return `${defaultCountryCode}${local}`;
  }

  // Other international: keep as-is if long enough
  if (digits.length >= 10 && digits.length <= 15) {
    return digits;
  }

  return null;
}

function storeWhatsAppE164(): string {
  return toWhatsAppE164(contact.phone) ?? contact.phone.replace(/\D/g, '');
}

export async function openPhone() {
  const digits = storeWhatsAppE164();
  await tryOpenUrls(
    [`tel:${contact.phone}`, `tel:+${digits}`, `tel:${digits}`],
    'Unable to open phone dialer.',
  );
}

export async function openEmail(subject = 'Enquiry from DA SPORTZ App') {
  const url = `mailto:${contact.email}?subject=${encodeURIComponent(subject)}`;
  await tryOpenUrls([url], 'Unable to open email app.');
}

/** Opens WhatsApp chat with the DA SPORTZ store number. */
export async function openWhatsApp(
  message = 'Hi DA SPORTZ, I would like to enquire about your products and services.',
) {
  return openWhatsAppChat(storeWhatsAppE164(), message);
}

/**
 * Opens WhatsApp chat with a customer's real mobile number
 * (uses +91 for 10-digit Indian numbers).
 */
export async function openWhatsAppToCustomer(phone: string, message: string) {
  const e164 = toWhatsAppE164(phone);
  if (!e164) {
    Alert.alert('Invalid number', 'A valid customer WhatsApp number is required.');
    return false;
  }
  return openWhatsAppChat(e164, message);
}

async function openWhatsAppChat(e164: string, message: string) {
  const text = encodeURIComponent(message);
  const urls =
    Platform.OS === 'ios'
      ? [
          `whatsapp://send?phone=${e164}&text=${text}`,
          `https://wa.me/${e164}?text=${text}`,
        ]
      : [
          `whatsapp://send?phone=${e164}&text=${text}`,
          `https://api.whatsapp.com/send?phone=${e164}&text=${text}`,
          `https://wa.me/${e164}?text=${text}`,
        ];

  return tryOpenUrls(
    urls,
    'Unable to open WhatsApp. Please install WhatsApp and try again.',
  );
}

export async function openMaps() {
  const query = encodeURIComponent(contact.mapsQuery);
  await tryOpenUrls(
    [
      `https://www.google.com/maps/search/?api=1&query=${query}`,
      Platform.OS === 'ios'
        ? `maps:0,0?q=${query}`
        : `geo:0,0?q=${query}`,
    ],
    'Unable to open maps.',
  );
}

export async function openWebsite() {
  await tryOpenUrls(['https://dasportz.com'], 'Unable to open website.');
}

async function tryOpenUrls(urls: string[], errorMessage: string): Promise<boolean> {
  for (const url of urls) {
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported && url.startsWith('whatsapp://')) {
        continue;
      }
      await Linking.openURL(url);
      return true;
    } catch {
      // Try the next URL scheme.
    }
  }

  Alert.alert('Cannot Open Link', errorMessage);
  return false;
}
