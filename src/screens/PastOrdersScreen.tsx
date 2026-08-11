import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { loadPastOrders } from '../services/orderHistory';
import { CloseButton } from '../components/CloseButton';
import { navigateToOrderTracking } from '../utils/navHelpers';
import {
  ORDER_TRACKING_STEPS,
  getStatusTheme,
  resolveOrderTrackingStatus,
} from '../data/orderTracking';
import { colors, spacing, typography, radius } from '../constants/theme';
import type { PastOrder } from '../types/auth';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'PastOrders'>;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusLabel(order: PastOrder) {
  const status = resolveOrderTrackingStatus(order);
  return ORDER_TRACKING_STEPS.find((s) => s.id === status)?.shortTitle ?? 'Received';
}

export function PastOrdersScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [orders, setOrders] = useState<PastOrder[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const list = await loadPastOrders(user?.phone);
      setOrders(list);
    } finally {
      setRefreshing(false);
    }
  }, [user?.phone]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Orders</Text>
        <CloseButton />
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="receipt-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptyText}>
              Orders and bookings will show up here after you complete a checkout. Tap any order to
              track its status.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const status = resolveOrderTrackingStatus(item);
          const theme = getStatusTheme(status);
          const trackLabel = statusLabel(item);
          return (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => navigateToOrderTracking(navigation, item.orderId)}
            >
              <View style={styles.cardTop}>
                <View
                  style={[
                    styles.kindBadge,
                    item.kind === 'service' ? styles.kindService : styles.kindPurchase,
                  ]}
                >
                  <Text style={styles.kindText}>
                    {item.kind === 'service' ? 'SERVICE' : 'PURCHASE'}
                  </Text>
                </View>
                <Text style={styles.amount}>{item.amount}</Text>
              </View>
              <View style={styles.orderIdRow}>
                <Text style={styles.orderId}>{item.orderId}</Text>
                <View
                  style={[
                    styles.trackBadge,
                    { backgroundColor: theme.soft, borderColor: theme.border },
                  ]}
                >
                  <Ionicons name="navigate-outline" size={12} color={theme.color} />
                  <Text style={[styles.trackBadgeText, { color: theme.color }]}>{trackLabel}</Text>
                </View>
              </View>
              <Text style={styles.meta}>
                {item.paymentMethod === 'cash' ? 'Cash at store' : 'Paid via UPI'} ·{' '}
                {formatDate(item.createdAt)}
              </Text>
              {item.details.slice(0, 3).map((d) => (
                <Text key={d.label} style={styles.detailLine}>
                  {d.label}: {d.value}
                </Text>
              ))}
              <Text style={[styles.trackHint, { color: theme.color }]}>Tap to track status →</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: { ...typography.h3, color: colors.text },
  list: { padding: spacing.lg, paddingBottom: spacing.xxl, flexGrow: 1 },
  empty: { alignItems: 'center', paddingTop: spacing.xxl, paddingHorizontal: spacing.lg },
  emptyTitle: { ...typography.h3, color: colors.text, marginTop: spacing.md },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  kindBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  kindService: { backgroundColor: 'rgba(59,130,246,0.18)' },
  kindPurchase: { backgroundColor: 'rgba(34,197,94,0.18)' },
  kindText: {
    ...typography.caption,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: colors.text,
  },
  amount: { ...typography.bodySmall, color: colors.primary, fontWeight: '800' },
  orderIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  orderId: { ...typography.bodySmall, color: colors.text, fontWeight: '700', flex: 1 },
  trackBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  trackBadgeText: { ...typography.caption, fontWeight: '800' },
  meta: { ...typography.caption, color: colors.textMuted, marginTop: 4, marginBottom: spacing.sm },
  detailLine: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  trackHint: {
    ...typography.caption,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
});
