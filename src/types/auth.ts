export type CustomerProfile = {
  id: string;
  mode: 'member' | 'guest';
  fullName: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  phone: string;
  email: string;
  city?: string;
  country?: string;
  countryCode?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  preferredStoreId?: string;
  photoUri?: string;
  createdAt: string;
  notificationPrefs?: NotificationPreferences;
  savedAddresses?: SavedAddress[];
};

export type NotificationPreferences = {
  email: boolean;
  whatsapp: boolean;
  sms: boolean;
};

export type SavedAddress = {
  id: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  pincode?: string;
  isDefault?: boolean;
};

export type SignUpInput = {
  firstName: string;
  middleName?: string;
  lastName?: string;
  phone: string;
  email: string;
  city: string;
  country: string;
  countryCode: string;
  preferredStoreId?: string;
  photoUri?: string;
};

export type GuestLoginInput = {
  phone: string;
  fullName?: string;
};

export type MemberLoginInput = {
  phone: string;
};

export const DEFAULT_NOTIFICATION_PREFS: NotificationPreferences = {
  email: true,
  whatsapp: true,
  sms: false,
};

export type PastOrder = {
  id: string;
  orderId: string;
  phone: string;
  kind: 'service' | 'purchase';
  amount: string;
  paymentMethod: 'cash' | 'upi';
  customerName: string;
  details: Array<{ label: string; value: string }>;
  createdAt: string;
};
