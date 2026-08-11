import type { PastOrder } from '../types/auth';
import type { AppNotification } from '../types/notification';
import {
  ORDER_TRACKING_STATUSES,
  resolveOrderTrackingStatus,
  statusIndex,
  statusNotificationCopy,
  type OrderTrackingStatus,
} from '../data/orderTracking';
import { loadPastOrders, patchPastOrder } from './orderHistory';
import { showOrderNotification } from './localNotifications';

type AddNotification = (
  notification: Omit<AppNotification, 'id' | 'read' | 'createdAt'> & { id?: string },
) => Promise<void>;

function statusesAfter(
  fromExclusive: OrderTrackingStatus | undefined,
  throughInclusive: OrderTrackingStatus,
): OrderTrackingStatus[] {
  const start = fromExclusive ? statusIndex(fromExclusive) + 1 : 0;
  const end = statusIndex(throughInclusive);
  if (start < 0 || end < 0 || start > end) return [];
  return ORDER_TRACKING_STATUSES.slice(start, end + 1);
}

async function notifyStatusesForOrder(
  order: PastOrder,
  statuses: OrderTrackingStatus[],
  addNotification: AddNotification,
) {
  for (const status of statuses) {
    // Checkout already posts a confirmation for "received".
    if (status === 'received') continue;
    const copy = statusNotificationCopy(status, order.orderId);
    await addNotification({
      id: `ntf_${order.orderId}_${status}`,
      type: 'system',
      title: copy.title,
      body: copy.body,
      orderId: order.orderId,
      amount: order.amount,
      paymentMethod: order.paymentMethod,
      status,
    });
    await showOrderNotification({
      title: copy.title,
      body: copy.body,
      orderId: order.orderId,
      status,
    });
  }
}

/**
 * Compares each order's live status with lastNotifiedStatus and posts in-app
 * notifications for any newly reached steps.
 */
export async function syncOrderStatusNotifications(
  phone: string | undefined,
  addNotification: AddNotification,
): Promise<void> {
  const orders = await loadPastOrders(phone);
  for (const order of orders) {
    const current = resolveOrderTrackingStatus(order);
    const pending = statusesAfter(order.lastNotifiedStatus, current);
    if (pending.length === 0) continue;

    await notifyStatusesForOrder(order, pending, addNotification);
    await patchPastOrder(order.orderId, { lastNotifiedStatus: current });
  }
}

/** Notify immediately for a single status (e.g. user marked delivered). */
export async function notifyOrderStatusNow(
  order: PastOrder,
  status: OrderTrackingStatus,
  addNotification: AddNotification,
): Promise<void> {
  await notifyStatusesForOrder(order, [status], addNotification);
  await patchPastOrder(order.orderId, { lastNotifiedStatus: status });
}
