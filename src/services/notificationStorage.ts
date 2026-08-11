import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppNotification } from '../types/notification';

const STORAGE_KEY = '@dasportz/notifications';

export async function loadNotifications(): Promise<AppNotification[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as AppNotification[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveNotifications(notifications: AppNotification[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
}

export async function appendNotification(notification: AppNotification) {
  const existing = await loadNotifications();
  if (existing.some((item) => item.id === notification.id)) {
    return existing;
  }
  const next = [notification, ...existing].slice(0, 100);
  await saveNotifications(next);
  return next;
}

export async function markNotificationRead(id: string) {
  const existing = await loadNotifications();
  const next = existing.map((item) => (item.id === id ? { ...item, read: true } : item));
  await saveNotifications(next);
  return next;
}

export async function markAllNotificationsRead() {
  const existing = await loadNotifications();
  const next = existing.map((item) => ({ ...item, read: true }));
  await saveNotifications(next);
  return next;
}

export async function deleteNotification(id: string) {
  const existing = await loadNotifications();
  const next = existing.filter((item) => item.id !== id);
  await saveNotifications(next);
  return next;
}

export async function clearAllNotifications() {
  await saveNotifications([]);
  return [] as AppNotification[];
}
