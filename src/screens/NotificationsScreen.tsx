import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, spacing, typography, radius } from '../constants/theme';
import { useNotifications } from '../context/NotificationContext';
import { CloseButton } from '../components/CloseButton';
import { navigateToOrderTracking } from '../utils/navHelpers';
import { getStatusTheme } from '../data/orderTracking';
import type { AppNotification } from '../types/notification';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  });
}

function iconForNotification(item: AppNotification): keyof typeof Ionicons.glyphMap {
  if (item.status) {
    switch (item.status) {
      case 'received':
        return 'checkmark-circle-outline';
      case 'in_progress':
        return 'construct-outline';
      case 'completed':
        return 'ribbon-outline';
      case 'ready_for_pickup':
        return 'bag-check-outline';
      case 'delivered':
        return 'checkmark-done-circle-outline';
    }
  }
  switch (item.type) {
    case 'payment':
      return 'card-outline';
    case 'order':
      return 'receipt-outline';
    case 'system':
      return 'notifications-outline';
    default:
      return 'notifications-outline';
  }
}

function accentForNotification(item: AppNotification) {
  if (item.status) return getStatusTheme(item.status);
  if (item.type === 'payment') {
    return {
      color: colors.primary,
      soft: colors.primarySoft,
      border: 'rgba(34,197,94,0.35)',
    };
  }
  if (item.type === 'system') {
    return {
      color: '#94A3B8',
      soft: 'rgba(148,163,184,0.14)',
      border: 'rgba(148,163,184,0.35)',
    };
  }
  return {
    color: '#3B82F6',
    soft: 'rgba(59,130,246,0.14)',
    border: 'rgba(59,130,246,0.35)',
  };
}

export function NotificationsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotificationById,
    clearNotifications,
  } = useNotifications();

  function handlePress(item: AppNotification) {
    if (!item.read) {
      void markAsRead(item.id);
    }
    if (item.orderId) {
      navigateToOrderTracking(navigation, item.orderId);
    }
  }

  function confirmDeleteOne(item: AppNotification) {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(`Delete “${item.title}”?`)) {
        void deleteNotificationById(item.id);
      }
      return;
    }
    Alert.alert('Delete notification', `Remove “${item.title}”?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => void deleteNotificationById(item.id),
      },
    ]);
  }

  function confirmClearAll() {
    if (notifications.length === 0) return;
    if (Platform.OS === 'web') {
      if (
        typeof window !== 'undefined' &&
        window.confirm('Clear all notifications? This cannot be undone.')
      ) {
        void clearNotifications();
      }
      return;
    }
    Alert.alert('Clear all', 'Delete every notification? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear all',
        style: 'destructive',
        onPress: () => void clearNotifications(),
      },
    ]);
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.subtitle}>
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </Text>
        </View>
        <View style={styles.headerActions}>
          {unreadCount > 0 ? (
            <TouchableOpacity onPress={() => void markAllAsRead()}>
              <Text style={styles.markAll}>Mark all</Text>
            </TouchableOpacity>
          ) : null}
          {notifications.length > 0 ? (
            <TouchableOpacity onPress={confirmClearAll} hitSlop={8}>
              <Text style={styles.clearAll}>Clear</Text>
            </TouchableOpacity>
          ) : null}
          <CloseButton />
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="notifications-off-outline" size={42} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No notifications yet</Text>
              <Text style={styles.emptyText}>
                System alerts and order status updates will appear here.
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const theme = accentForNotification(item);
            return (
              <View
                style={[
                  styles.card,
                  !item.read && {
                    borderColor: theme.border,
                    backgroundColor: colors.surfaceElevated,
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.cardMain}
                  onPress={() => handlePress(item)}
                  activeOpacity={0.85}
                >
                  <View style={[styles.iconWrap, { backgroundColor: theme.soft }]}>
                    <Ionicons name={iconForNotification(item)} size={20} color={theme.color} />
                  </View>
                  <View style={styles.cardBody}>
                    <View style={styles.cardTop}>
                      <Text style={styles.cardTitle}>{item.title}</Text>
                      {!item.read ? (
                        <View style={[styles.unreadDot, { backgroundColor: theme.color }]} />
                      ) : null}
                    </View>
                    {item.type === 'system' || item.status ? (
                      <Text style={[styles.typeChip, { color: theme.color }]}>
                        {item.status ? item.status.replace(/_/g, ' ') : 'system'}
                      </Text>
                    ) : null}
                    <Text style={styles.cardBodyText}>{item.body}</Text>
                    <Text style={styles.cardTime}>{formatWhen(item.createdAt)}</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => confirmDeleteOne(item)}
                  hitSlop={10}
                  accessibilityLabel="Delete notification"
                >
                  <Ionicons name="trash-outline" size={18} color={colors.error} />
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { ...typography.h2, color: colors.text },
  subtitle: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  markAll: { ...typography.caption, color: colors.primary, fontWeight: '700' },
  clearAll: { ...typography.caption, color: colors.error, fontWeight: '700' },
  list: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.sm },
  card: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  cardMain: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    paddingRight: spacing.sm,
  },
  deleteBtn: {
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderLeftWidth: 1,
    borderLeftColor: colors.borderLight,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1 },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  cardTitle: { ...typography.body, color: colors.text, fontWeight: '700', flex: 1 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typeChip: {
    ...typography.caption,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 4,
  },
  cardBodyText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 20,
  },
  cardTime: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  emptyTitle: { ...typography.h3, color: colors.text, marginTop: spacing.sm },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
