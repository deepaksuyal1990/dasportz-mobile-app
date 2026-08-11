export const ORDER_TRACKING_STATUSES = [
  'received',
  'in_progress',
  'completed',
  'ready_for_pickup',
  'delivered',
] as const;

export type OrderTrackingStatus = (typeof ORDER_TRACKING_STATUSES)[number];

export type OrderTrackingStep = {
  id: OrderTrackingStatus;
  title: string;
  shortTitle: string;
  description: string;
  icon: 'checkmark-circle' | 'construct' | 'ribbon' | 'bag-check' | 'checkmark-done-circle';
};

export const ORDER_TRACKING_STEPS: OrderTrackingStep[] = [
  {
    id: 'received',
    title: 'Order received',
    shortTitle: 'Received',
    description: 'We have your booking. Our team will start preparing your racket shortly.',
    icon: 'checkmark-circle',
  },
  {
    id: 'in_progress',
    title: 'In progress',
    shortTitle: 'In progress',
    description: 'Your racket is on the stringing machine. Tension and stringing are underway.',
    icon: 'construct',
  },
  {
    id: 'completed',
    title: 'Completed',
    shortTitle: 'Completed',
    description: 'Stringing is finished. We are doing a final quality check before handover.',
    icon: 'ribbon',
  },
  {
    id: 'ready_for_pickup',
    title: 'Ready for pick up',
    shortTitle: 'Ready',
    description: 'Your racket is ready at the store. Show your order ID at the counter.',
    icon: 'bag-check',
  },
  {
    id: 'delivered',
    title: 'Delivered',
    shortTitle: 'Delivered',
    description: 'You have picked up your order. Thanks for choosing DA SPORTZ!',
    icon: 'checkmark-done-circle',
  },
];

/** Auto progression until ready for pickup (seconds after createdAt). Delivered is manual. */
const DEMO_THRESHOLDS_SEC: Record<Exclude<OrderTrackingStatus, 'delivered'>, number> = {
  received: 0,
  in_progress: 45,
  completed: 120,
  ready_for_pickup: 210,
};

export type TrackableOrderLike = {
  createdAt: string;
  trackingStatus?: OrderTrackingStatus;
  deliveredAt?: string;
};

export function statusIndex(status: OrderTrackingStatus): number {
  return ORDER_TRACKING_STATUSES.indexOf(status);
}

function resolveFromElapsed(createdAtIso: string, nowMs: number): Exclude<OrderTrackingStatus, 'delivered'> {
  const created = new Date(createdAtIso).getTime();
  if (Number.isNaN(created)) return 'received';
  const elapsedSec = Math.max(0, (nowMs - created) / 1000);

  let current: Exclude<OrderTrackingStatus, 'delivered'> = 'received';
  (Object.keys(DEMO_THRESHOLDS_SEC) as Array<Exclude<OrderTrackingStatus, 'delivered'>>).forEach(
    (status) => {
      if (elapsedSec >= DEMO_THRESHOLDS_SEC[status]) current = status;
    },
  );
  return current;
}

export function resolveOrderTrackingStatus(
  orderOrCreatedAt: TrackableOrderLike | string,
  nowMs = Date.now(),
): OrderTrackingStatus {
  if (typeof orderOrCreatedAt === 'string') {
    return resolveFromElapsed(orderOrCreatedAt, nowMs);
  }
  if (orderOrCreatedAt.trackingStatus === 'delivered' || orderOrCreatedAt.deliveredAt) {
    return 'delivered';
  }
  if (orderOrCreatedAt.trackingStatus) {
    return orderOrCreatedAt.trackingStatus;
  }
  return resolveFromElapsed(orderOrCreatedAt.createdAt, nowMs);
}

export function estimatedReachedAt(
  order: TrackableOrderLike,
  status: OrderTrackingStatus,
): Date | null {
  if (status === 'delivered') {
    if (!order.deliveredAt) return null;
    const d = new Date(order.deliveredAt);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const created = new Date(order.createdAt).getTime();
  if (Number.isNaN(created)) return null;
  return new Date(created + DEMO_THRESHOLDS_SEC[status] * 1000);
}

export function formatTrackingTime(isoOrDate: string | Date): string {
  const d = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate;
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function trackingProgressPercent(status: OrderTrackingStatus): number {
  const i = statusIndex(status);
  if (i < 0) return 0;
  return Math.round(((i + 1) / ORDER_TRACKING_STATUSES.length) * 100);
}

export function isActiveTrackingStatus(status: OrderTrackingStatus): boolean {
  return status !== 'delivered';
}

export type StatusColorTheme = {
  color: string;
  soft: string;
  border: string;
  label: string;
  /** Android notification accent (same as color). */
  androidColor: string;
  channelId: string;
  channelName: string;
};

/** Distinct color coding per tracking status (UI + system notifications). */
export const STATUS_COLORS: Record<OrderTrackingStatus, StatusColorTheme> = {
  received: {
    color: '#3B82F6',
    soft: 'rgba(59,130,246,0.16)',
    border: 'rgba(59,130,246,0.45)',
    label: 'Blue',
    androidColor: '#3B82F6',
    channelId: 'order-status-received',
    channelName: 'Order received',
  },
  in_progress: {
    color: '#F59E0B',
    soft: 'rgba(245,158,11,0.16)',
    border: 'rgba(245,158,11,0.45)',
    label: 'Amber',
    androidColor: '#F59E0B',
    channelId: 'order-status-in-progress',
    channelName: 'Order in progress',
  },
  completed: {
    color: '#A855F7',
    soft: 'rgba(168,85,247,0.16)',
    border: 'rgba(168,85,247,0.45)',
    label: 'Purple',
    androidColor: '#A855F7',
    channelId: 'order-status-completed',
    channelName: 'Order completed',
  },
  ready_for_pickup: {
    color: '#06B6D4',
    soft: 'rgba(6,182,212,0.16)',
    border: 'rgba(6,182,212,0.45)',
    label: 'Cyan',
    androidColor: '#06B6D4',
    channelId: 'order-status-ready',
    channelName: 'Ready for pickup',
  },
  delivered: {
    color: '#22C55E',
    soft: 'rgba(34,197,94,0.16)',
    border: 'rgba(34,197,94,0.45)',
    label: 'Green',
    androidColor: '#22C55E',
    channelId: 'order-status-delivered',
    channelName: 'Order delivered',
  },
};

export function getStatusTheme(status: OrderTrackingStatus): StatusColorTheme {
  return STATUS_COLORS[status];
}

export function statusNotificationCopy(
  status: OrderTrackingStatus,
  orderId: string,
): { title: string; body: string } {
  switch (status) {
    case 'received':
      return {
        title: 'Order received',
        body: `${orderId} · We’ve got your booking and will start soon.`,
      };
    case 'in_progress':
      return {
        title: 'Order in progress',
        body: `${orderId} · Your racket is being strung now.`,
      };
    case 'completed':
      return {
        title: 'Order completed',
        body: `${orderId} · Stringing finished — final checks underway.`,
      };
    case 'ready_for_pickup':
      return {
        title: 'Ready for pick up',
        body: `${orderId} · Your order is ready at the DA SPORTZ store.`,
      };
    case 'delivered':
      return {
        title: 'Order delivered',
        body: `${orderId} · Marked as picked up. Thanks for choosing DA SPORTZ!`,
      };
  }
}
