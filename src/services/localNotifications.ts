import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import {
  ORDER_TRACKING_STATUSES,
  getStatusTheme,
  type OrderTrackingStatus,
} from '../data/orderTracking';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

let channelsReady = false;

export async function ensureNotificationPermissions() {
  if (Platform.OS === 'web') return false;

  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    await ensureStatusChannels();
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  const ok =
    requested.granted ||
    requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  if (ok) await ensureStatusChannels();
  return ok;
}

/** Android channels — one per status so system tray can group / color accents. */
export async function ensureStatusChannels() {
  if (Platform.OS !== 'android' || channelsReady) return;

  for (const status of ORDER_TRACKING_STATUSES) {
    const theme = getStatusTheme(status);
    await Notifications.setNotificationChannelAsync(theme.channelId, {
      name: theme.channelName,
      description: `DA SPORTZ updates when an order is ${theme.channelName.toLowerCase()}`,
      importance:
        status === 'ready_for_pickup' || status === 'delivered'
          ? Notifications.AndroidImportance.HIGH
          : Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 120, 250],
      lightColor: theme.androidColor,
      enableLights: true,
      enableVibrate: true,
      showBadge: true,
    });
  }

  channelsReady = true;
}

export async function showOrderNotification(params: {
  title: string;
  body: string;
  orderId: string;
  status?: OrderTrackingStatus;
}) {
  if (Platform.OS === 'web') return;

  const allowed = await ensureNotificationPermissions();
  if (!allowed) return;

  const status = params.status ?? 'received';
  const theme = getStatusTheme(status);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: params.title,
      body: params.body,
      data: {
        orderId: params.orderId,
        status,
        type: 'system',
      },
      sound: true,
      ...(Platform.OS === 'android'
        ? {
            color: theme.androidColor,
            channelId: theme.channelId,
            priority: Notifications.AndroidNotificationPriority.HIGH,
          }
        : {
            // iOS — interruption level hints importance for ready/delivered
            interruptionLevel:
              status === 'ready_for_pickup' || status === 'delivered' ? 'timeSensitive' : 'active',
          }),
    },
    trigger: null,
  });
}

export function getOrderIdFromNotificationResponse(
  response: Notifications.NotificationResponse,
): string | null {
  const data = response.notification.request.content.data as {
    orderId?: string;
  };
  return typeof data?.orderId === 'string' ? data.orderId : null;
}

export function subscribeToNotificationResponses(
  onOrderId: (orderId: string) => void,
): { remove: () => void } {
  if (Platform.OS === 'web') {
    return { remove: () => undefined };
  }

  const sub = Notifications.addNotificationResponseReceivedListener((response) => {
    const orderId = getOrderIdFromNotificationResponse(response);
    if (orderId) onOrderId(orderId);
  });

  void Notifications.getLastNotificationResponseAsync().then((response) => {
    if (!response) return;
    const orderId = getOrderIdFromNotificationResponse(response);
    if (orderId) onOrderId(orderId);
  });

  return sub;
}
