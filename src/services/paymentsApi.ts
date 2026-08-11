import { getApiBase } from './apiBase';

export const SHOP_ID = 'dasportz';

export const ZOHO_PAY_CONFIG = {
  accountId: '60044148024',
  domain: 'IN',
  apiKey:
    '1003.b03980822c145cb80d00b97288514519.783c4164ef793ebfbe77bf1098160aad',
};

export type ZpayConfig = {
  account_id: string;
  domain: string;
};

export type CreateOrderData = {
  payments_session_id: string;
  amount: string | number;
  currency: string;
  order_id: string;
  shopId: string;
  zpayConfig?: ZpayConfig;
  /** Present for cash / pay-at-outlet when Twilio already messaged the customer. */
  message?: string;
};

export type CreateOrderResponse = {
  success: boolean;
  data?: CreateOrderData;
  message?: string;
};

export type VerifyPaymentResponse = {
  success: boolean;
  message?: string;
};

export type CricketOrderPayload = {
  customerName: string;
  phone: string;
  email: string;
  shopId: string;
  serviceType: 'cricket-product';
  productDetails: {
    id: string;
    title: string;
    brand: string;
    category: string;
    selectedSize?: string;
    mrpPrice: number;
  };
  knockingService: boolean;
  deliveryAddress: string;
  shippingCost: number;
  unlockedPrice: number;
  mrpPrice: number;
  dealToken: string;
  /** cash / payatoutlet for store payment; omit or upi for Zoho session. */
  paymentMethod?: 'upi' | 'payatoutlet' | 'cash';
  testMode?: boolean;
  notifyCustomer?: boolean;
};

export type StringingOrderPayload = {
  customerName: string;
  phone: string;
  email: string;
  shopId: string;
  store: string;
  racketDetails: Array<{
    id: string;
    racketName: string;
    string: string;
    tension: number;
    qty: number;
    cost: number;
  }>;
  express: boolean;
  _ts: number;
  paymentMethod: 'upi' | 'payatoutlet' | 'cash';
  pickupDrop: boolean;
  testMode: boolean;
  notifyCustomer?: boolean;
  payment: {
    originalAmount: number;
    discount: { couponCode: string | null; couponDiscount: number };
    finalAmount: number;
  };
};

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${getApiBase()}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as T;
  return data;
}

/** True when PlayNex Lambda already sent the Twilio WhatsApp confirmation. */
export function wasCustomerNotifiedByBackend(response: CreateOrderResponse): boolean {
  const session = response.data?.payments_session_id ?? '';
  const msg = `${response.data?.message ?? ''} ${response.message ?? ''}`.toLowerCase();
  if (String(session).toUpperCase().startsWith('CASH-')) return true;
  return msg.includes('customer notified') || msg.includes('notified');
}

export async function createCricketOrder(
  payload: CricketOrderPayload,
): Promise<CreateOrderResponse> {
  return postJson<CreateOrderResponse>('/api/create-order', payload);
}

export async function createStringingOrder(
  payload: StringingOrderPayload,
): Promise<CreateOrderResponse> {
  return postJson<CreateOrderResponse>('/api/create-order', payload);
}

/**
 * After Zoho UPI success — backend verifies payment and sends Twilio WhatsApp.
 */
export async function verifyPayment(paymentId: string): Promise<VerifyPaymentResponse> {
  return postJson<VerifyPaymentResponse>('/api/verify-payment', { payment_id: paymentId });
}

export { getApiBase };
export { getApiBase as API_BASE };
