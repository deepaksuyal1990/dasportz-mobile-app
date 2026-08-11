import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PastOrder } from '../types/auth';
import {
  isActiveTrackingStatus,
  resolveOrderTrackingStatus,
  type OrderTrackingStatus,
} from '../data/orderTracking';

const ORDERS_KEY = '@dasportz/past_orders';

async function readAll(): Promise<PastOrder[]> {
  const raw = await AsyncStorage.getItem(ORDERS_KEY);
  if (!raw) return [];
  try {
    const all = JSON.parse(raw) as PastOrder[];
    return Array.isArray(all) ? all : [];
  } catch {
    return [];
  }
}

async function writeAll(all: PastOrder[]) {
  await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(all));
}

export async function loadPastOrders(phone?: string): Promise<PastOrder[]> {
  const all = await readAll();
  if (!phone) return all;
  const digits = phone.replace(/\D/g, '').slice(-10);
  return all.filter((o) => o.phone.replace(/\D/g, '').slice(-10) === digits);
}

export async function savePastOrder(order: PastOrder) {
  const all = await readAll();
  const next = [order, ...all.filter((o) => o.orderId !== order.orderId)].slice(0, 100);
  await writeAll(next);
}

export async function patchPastOrder(
  orderId: string,
  patch: Partial<PastOrder>,
): Promise<PastOrder | null> {
  const all = await readAll();
  const idx = all.findIndex((o) => o.orderId === orderId);
  if (idx < 0) return null;
  const updated = { ...all[idx], ...patch };
  const next = [...all];
  next[idx] = updated;
  await writeAll(next);
  return updated;
}

export async function getPastOrderById(orderId: string): Promise<PastOrder | null> {
  const all = await readAll();
  return all.find((o) => o.orderId === orderId) ?? null;
}

export async function markOrderDelivered(orderId: string): Promise<PastOrder | null> {
  const now = new Date().toISOString();
  return patchPastOrder(orderId, {
    trackingStatus: 'delivered' satisfies OrderTrackingStatus,
    deliveredAt: now,
  });
}

/** Most recent non-delivered order for Home track card. */
export async function getLatestTrackableOrder(phone?: string): Promise<PastOrder | null> {
  const list = await loadPastOrders(phone);
  return (
    list.find((o) => isActiveTrackingStatus(resolveOrderTrackingStatus(o))) ?? null
  );
}
