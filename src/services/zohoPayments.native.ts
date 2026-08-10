// Zoho native SDK disabled for localhost / web dev.
// import { initialize, showCheckout } from 'zoho-payments-react-native-sdk';
// import { ZOHO_PAY_CONFIG } from './paymentsApi';

export type ZohoCheckoutParams = {
  paymentSessionId: string;
  description: string;
  name: string;
  email: string;
  phone: string;
};

export function initZohoPayments() {
  // Native Zoho SDK disabled.
}

export async function runZohoUpiCheckout(
  _params: ZohoCheckoutParams,
): Promise<{ paymentId: string } | { cancelled: true }> {
  throw new Error('UPI payments are disabled. Re-enable Zoho native SDK for production builds.');
}

/*
let initialized = false;

export function initZohoPayments() {
  if (initialized) return;
  initialize(ZOHO_PAY_CONFIG.apiKey, ZOHO_PAY_CONFIG.accountId, 'india', 'live');
  initialized = true;
}

function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, '').slice(-10);
  return digits.length === 10 ? `+91${digits}` : phone;
}

function isCheckoutCancelled(error: unknown) {
  if (typeof error !== 'object' || error === null) return false;
  const code = 'code' in error ? String((error as { code: string }).code) : '';
  const message = 'message' in error ? String((error as { message: string }).message) : '';
  const combined = `${code} ${message}`.toLowerCase();
  return (
    combined.includes('cancel') ||
    combined.includes('widget_closed') ||
    combined.includes('closed')
  );
}

export async function runZohoUpiCheckout(
  params: ZohoCheckoutParams,
): Promise<{ paymentId: string } | { cancelled: true }> {
  initZohoPayments();

  try {
    const result = await showCheckout({
      paymentSessionId: params.paymentSessionId,
      description: params.description,
      name: params.name,
      email: params.email,
      phone: formatPhone(params.phone),
      paymentMethod: 'upi',
    });
    return { paymentId: result.paymentId };
  } catch (error) {
    if (isCheckoutCancelled(error)) {
      return { cancelled: true };
    }
    throw error;
  }
}
*/
