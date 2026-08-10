import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AppNotification } from '../types/notification';
import {
  appendNotification,
  loadNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../services/notificationStorage';

type NotificationContextValue = {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  addNotification: (notification: Omit<AppNotification, 'id' | 'read' | 'createdAt'> & { id?: string }) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refresh: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

function createId() {
  return `ntf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const items = await loadNotifications();
    setNotifications(items);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addNotification = useCallback(
    async (notification: Omit<AppNotification, 'id' | 'read' | 'createdAt'> & { id?: string }) => {
      const item: AppNotification = {
        id: notification.id ?? createId(),
        title: notification.title,
        body: notification.body,
        type: notification.type,
        orderId: notification.orderId,
        amount: notification.amount,
        paymentMethod: notification.paymentMethod,
        read: false,
        createdAt: new Date().toISOString(),
      };
      const next = await appendNotification(item);
      setNotifications(next);
    },
    [],
  );

  const markAsRead = useCallback(async (id: string) => {
    const next = await markNotificationRead(id);
    setNotifications(next);
  }, []);

  const markAllAsRead = useCallback(async () => {
    const next = await markAllNotificationsRead();
    setNotifications(next);
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications],
  );

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      loading,
      addNotification,
      markAsRead,
      markAllAsRead,
      refresh,
    }),
    [notifications, unreadCount, loading, addNotification, markAsRead, markAllAsRead, refresh],
  );

  return (
    <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
