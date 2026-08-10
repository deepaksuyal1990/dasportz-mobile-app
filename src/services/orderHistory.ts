import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PastOrder } from '../types/auth';

const ORDERS_KEY = '@dasportz/past_orders';

export async function loadPastOrders(phone?: string): Promise<PastOrder[]> {
  const raw = await AsyncStorage.getItem(ORDERS_KEY);
  if (!raw) return [];
  try {
    const all = JSON.parse(raw) as PastOrder[];
    if (!Array.isArray(all)) return [];
    if (!phone) return all;
    const digits = phone.replace(/\D/g, '').slice(-10);
    return all.filter((o) => o.phone.replace(/\D/g, '').slice(-10) === digits);
  } catch {
    return [];
  }
}

export async function savePastOrder(order: PastOrder) {
  const raw = await AsyncStorage.getItem(ORDERS_KEY);
  let all: PastOrder[] = [];
  try {
    all = raw ? (JSON.parse(raw) as PastOrder[]) : [];
    if (!Array.isArray(all)) all = [];
  } catch {
    all = [];
  }
  const next = [order, ...all.filter((o) => o.orderId !== order.orderId)].slice(0, 100);
  await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(next));
}
