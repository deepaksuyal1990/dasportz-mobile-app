import {
  DEFAULT_NOTIFICATION_PREFS,
  type CustomerProfile,
  type NotificationPreferences,
} from '../types/auth';

export function resolveNotificationPrefs(
  user: CustomerProfile | null | undefined,
): NotificationPreferences {
  return {
    ...DEFAULT_NOTIFICATION_PREFS,
    ...user?.notificationPrefs,
  };
}

/** Whether the logged-in (or guest) profile allows WhatsApp order messages. */
export function wantsWhatsAppNotifications(
  user: CustomerProfile | null | undefined,
): boolean {
  return resolveNotificationPrefs(user).whatsapp !== false;
}
