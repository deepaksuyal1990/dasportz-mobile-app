const API_BASE =
  'https://kg7kg65ok2hvfox6l4gtniqhsi0ckmox.lambda-url.ap-south-1.on.aws';

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
  amount: string;
  currency: string;
  order_id: string;
  shopId: string;
  zpayConfig?: ZpayConfig;
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
  paymentMethod: 'upi' | 'payatoutlet';
  pickupDrop: boolean;
  testMode: boolean;
  payment: {
    originalAmount: number;
    discount: { couponCode: string | null; couponDiscount: number };
    finalAmount: number;
  };
};

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as T;
  return data;
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

export async function verifyPayment(paymentId: string): Promise<VerifyPaymentResponse> {
  return postJson<VerifyPaymentResponse>('/api/verify-payment', { payment_id: paymentId });
}
