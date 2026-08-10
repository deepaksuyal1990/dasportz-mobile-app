import { Linking, Alert, Platform } from 'react-native';
import { contact } from '../data/content';

function whatsAppPhone(): string {
  return contact.phone.replace(/\D/g, '');
}

export async function openPhone() {
  const digits = whatsAppPhone();
  await tryOpenUrls(
    [`tel:${contact.phone}`, `tel:+${digits}`, `tel:${digits}`],
    'Unable to open phone dialer.',
  );
}

export async function openEmail(subject = 'Enquiry from DA SPORTZ App') {
  const url = `mailto:${contact.email}?subject=${encodeURIComponent(subject)}`;
  await tryOpenUrls([url], 'Unable to open email app.');
}

export async function openWhatsApp(
  message = 'Hi DA SPORTZ, I would like to enquire about your products and services.',
) {
  await openWhatsAppToCustomer(contact.phone.replace(/\D/g, '').slice(-10), message);
}

export async function openWhatsAppToCustomer(phone: string, message: string) {
  const digits = phone.replace(/\D/g, '').slice(-10);
  if (digits.length < 10) {
    Alert.alert('Invalid number', 'A valid customer WhatsApp number is required.');
    return false;
  }

  const e164 = `91${digits}`;
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
    'Unable to open WhatsApp. Please install WhatsApp or share the invoice manually.',
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
      await Linking.openURL(url);
      return true;
    } catch {
      // Try the next URL scheme.
    }
  }

  Alert.alert('Cannot Open Link', errorMessage);
  return false;
}
