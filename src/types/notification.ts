import type { OrderTrackingStatus } from '../data/orderTracking';

export type NotificationType = 'order' | 'payment' | 'system';

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  type: NotificationType;
  orderId?: string;
  amount?: string;
  paymentMethod?: 'cash' | 'upi';
  /** Present on order status / system updates for color coding. */
  status?: OrderTrackingStatus;
};
