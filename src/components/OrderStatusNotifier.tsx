import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { syncOrderStatusNotifications } from '../services/orderStatusNotify';
import { subscribeToNotificationResponses } from '../services/localNotifications';
import { navigateToOrderTrackingRoot } from '../navigation/rootNavigation';

const SYNC_INTERVAL_MS = 12_000;

/** Polls order status and posts in-app + system notifications on changes. */
export function OrderStatusNotifier() {
  const { user } = useAuth();
  const { addNotification, refresh } = useNotifications();

  useEffect(() => {
    let cancelled = false;

    async function runSync() {
      await syncOrderStatusNotifications(user?.phone, addNotification);
      if (!cancelled) await refresh();
    }

    void runSync();
    const interval = setInterval(() => {
      if (AppState.currentState === 'active') void runSync();
    }, SYNC_INTERVAL_MS);

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void runSync();
    });

    return () => {
      cancelled = true;
      clearInterval(interval);
      sub.remove();
    };
  }, [user?.phone, addNotification, refresh]);

  useEffect(() => {
    const sub = subscribeToNotificationResponses((orderId) => {
      // Slight delay so NavigationContainer is ready after cold start.
      setTimeout(() => navigateToOrderTrackingRoot(orderId), 350);
    });
    return () => sub.remove();
  }, []);

  return null;
}
