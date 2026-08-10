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
};
