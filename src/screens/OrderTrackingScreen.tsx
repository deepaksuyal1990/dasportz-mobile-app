import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
  RefreshControl,
  LayoutAnimation,
  Platform,
  UIManager,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CloseButton } from '../components/CloseButton';
import { getPastOrderById, markOrderDelivered } from '../services/orderHistory';
import { notifyOrderStatusNow, syncOrderStatusNotifications } from '../services/orderStatusNotify';
import {
  ORDER_TRACKING_STEPS,
  estimatedReachedAt,
  formatTrackingTime,
  getStatusTheme,
  resolveOrderTrackingStatus,
  statusIndex,
  trackingProgressPercent,
  type OrderTrackingStatus,
} from '../data/orderTracking';
import { colors, spacing, typography, radius } from '../constants/theme';
import { openWhatsApp, openPhone } from '../utils/linking';
import { contact } from '../data/content';
import { useNotifications } from '../context/NotificationContext';
import type { PastOrder } from '../types/auth';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderTracking'>;

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function StepNode({
  active,
  done,
  current,
  pulse,
  color,
}: {
  active: boolean;
  done: boolean;
  current: boolean;
  pulse: Animated.Value;
  color: string;
}) {
  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.28],
  });
  const opacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.55, 0],
  });

  return (
    <View style={styles.nodeWrap}>
      {current ? (
        <Animated.View
          style={[
            styles.nodePulse,
            { opacity, transform: [{ scale }], borderColor: color },
          ]}
        />
      ) : null}
      <View
        style={[
          styles.node,
          done && { backgroundColor: color, borderColor: color },
          current && { backgroundColor: colors.surface, borderColor: color },
          !active && styles.nodeUpcoming,
        ]}
      >
        {done ? (
          <Ionicons name="checkmark" size={16} color={colors.white} />
        ) : current ? (
          <View style={[styles.nodeDot, { backgroundColor: color }]} />
        ) : (
          <View style={styles.nodeDotMuted} />
        )}
      </View>
    </View>
  );
}

export function OrderTrackingScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { orderId } = route.params;
  const { addNotification } = useNotifications();
  const [order, setOrder] = useState<PastOrder | null>(null);
  const [status, setStatus] = useState<OrderTrackingStatus>('received');
  const [expanded, setExpanded] = useState<OrderTrackingStatus | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [markingDelivered, setMarkingDelivered] = useState(false);
  const [nowTick, setNowTick] = useState(Date.now());
  const pulse = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const load = useCallback(async () => {
    await syncOrderStatusNotifications(undefined, addNotification);
    const found = await getPastOrderById(orderId);
    setOrder(found);
    if (found) {
      const next = resolveOrderTrackingStatus(found);
      setStatus(next);
      setExpanded((prev) => prev ?? next);
    }
  }, [orderId, addNotification]);

  useFocusEffect(
    useCallback(() => {
      void load();
      const interval = setInterval(() => setNowTick(Date.now()), 8000);
      return () => clearInterval(interval);
    }, [load]),
  );

  useEffect(() => {
    if (!order) return;
    setStatus(resolveOrderTrackingStatus(order, nowTick));
  }, [order, nowTick]);

  useEffect(() => {
    if (status === 'delivered') {
      pulse.stopAnimation();
      pulse.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1100,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, status]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: trackingProgressPercent(status) / 100,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [status, progressAnim]);

  const currentStep = useMemo(
    () => ORDER_TRACKING_STEPS.find((s) => s.id === status) ?? ORDER_TRACKING_STEPS[0],
    [status],
  );

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  async function onRefresh() {
    setRefreshing(true);
    setNowTick(Date.now());
    await load();
    setRefreshing(false);
  }

  function toggleExpand(id: OrderTrackingStatus) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => (prev === id ? null : id));
  }

  function confirmPickup() {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm('Mark this order as picked up / delivered?')) {
        void handleMarkDelivered();
      }
      return;
    }
    Alert.alert('Confirm pickup', 'Have you picked up this order from the store?', [
      { text: 'Not yet', style: 'cancel' },
      { text: 'Yes, delivered', style: 'default', onPress: () => void handleMarkDelivered() },
    ]);
  }

  async function handleMarkDelivered() {
    if (markingDelivered) return;
    setMarkingDelivered(true);
    try {
      const updated = await markOrderDelivered(orderId);
      if (!updated) {
        Alert.alert('Could not update', 'Order was not found. Please try again.');
        return;
      }
      await notifyOrderStatusNow(updated, 'delivered', addNotification);
      setOrder(updated);
      setStatus('delivered');
      setExpanded('delivered');
    } finally {
      setMarkingDelivered(false);
    }
  }

  const currentIdx = statusIndex(status);
  const isReady = status === 'ready_for_pickup';
  const isDelivered = status === 'delivered';
  const statusTheme = getStatusTheme(status);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#0C1A2E', colors.background]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Track order</Text>
        <CloseButton />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + spacing.xxl }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {!order ? (
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Order not found</Text>
            <Text style={styles.emptyText}>
              We could not find {orderId} on this device. Complete a booking first, then track it
              from Profile → Orders.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.heroCard}>
              <View style={styles.heroTop}>
                <View
                  style={[
                    styles.statusPill,
                    { backgroundColor: statusTheme.soft, borderColor: statusTheme.border },
                  ]}
                >
                  <Ionicons
                    name={
                      isDelivered
                        ? 'checkmark-done-circle'
                        : isReady
                          ? 'bag-check'
                          : currentStep.icon
                    }
                    size={14}
                    color={statusTheme.color}
                  />
                  <Text style={[styles.statusPillText, { color: statusTheme.color }]}>
                    {currentStep.title}
                  </Text>
                </View>
                <Text style={[styles.amount, { color: statusTheme.color }]}>{order.amount}</Text>
              </View>

              <Text style={styles.orderId}>{order.orderId}</Text>
              <Text style={styles.meta}>
                {order.kind === 'service' ? 'Service booking' : 'Purchase'} ·{' '}
                {order.paymentMethod === 'cash' ? 'Cash at store' : 'Paid online'} ·{' '}
                {formatTrackingTime(order.createdAt)}
              </Text>

              <View style={styles.progressTrack}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    { width: progressWidth, backgroundColor: statusTheme.color },
                  ]}
                />
              </View>
              <Text style={styles.progressLabel}>
                {trackingProgressPercent(status)}% complete · tap a step for details
              </Text>
            </View>

            <Text style={styles.sectionLabel}>STATUS</Text>

            <View style={styles.timeline}>
              {ORDER_TRACKING_STEPS.map((step, index) => {
                const done = index < currentIdx;
                const current = index === currentIdx;
                const upcoming = index > currentIdx;
                const isExpanded = expanded === step.id;
                const reached = done || current ? estimatedReachedAt(order, step.id) : null;
                const stepTheme = getStatusTheme(step.id);
                const accent = upcoming ? colors.textMuted : stepTheme.color;

                return (
                  <View key={step.id} style={styles.stepRow}>
                    <View style={styles.rail}>
                      <StepNode
                        active={!upcoming}
                        done={done}
                        current={current}
                        pulse={pulse}
                        color={stepTheme.color}
                      />
                      {index < ORDER_TRACKING_STEPS.length - 1 ? (
                        <View
                          style={[
                            styles.railLine,
                            done && { backgroundColor: stepTheme.color },
                          ]}
                        />
                      ) : null}
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.stepCard,
                        current && {
                          borderColor: stepTheme.border,
                          backgroundColor: stepTheme.soft,
                        },
                        done && !current && styles.stepCardDone,
                      ]}
                      onPress={() => toggleExpand(step.id)}
                      activeOpacity={0.85}
                    >
                      <View style={styles.stepHeader}>
                        <View style={styles.stepTitleRow}>
                          <Ionicons name={step.icon} size={18} color={accent} />
                          <Text
                            style={[
                              styles.stepTitle,
                              { color: upcoming ? colors.textMuted : colors.text },
                              current && { color: stepTheme.color },
                            ]}
                          >
                            {step.title}
                          </Text>
                        </View>
                        <Ionicons
                          name={isExpanded ? 'chevron-up' : 'chevron-down'}
                          size={16}
                          color={colors.textMuted}
                        />
                      </View>

                      {reached && (done || current) ? (
                        <Text style={styles.stepTime}>{formatTrackingTime(reached)}</Text>
                      ) : (
                        <Text style={styles.stepTime}>Upcoming</Text>
                      )}

                      {isExpanded ? (
                        <Text style={styles.stepDesc}>{step.description}</Text>
                      ) : null}

                      {current && !isReady && !isDelivered ? (
                        <View style={styles.liveRow}>
                          <View style={[styles.liveDot, { backgroundColor: stepTheme.color }]} />
                          <Text style={[styles.liveText, { color: stepTheme.color }]}>
                            Live · pull to refresh
                          </Text>
                        </View>
                      ) : null}
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>

            {order.details.length > 0 ? (
              <View style={styles.detailsCard}>
                <Text style={styles.detailsTitle}>Order details</Text>
                {order.details.slice(0, 6).map((d) => (
                  <View key={d.label} style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{d.label}</Text>
                    <Text style={styles.detailValue}>{d.value}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            {isReady ? (
              <View
                style={[
                  styles.readyBanner,
                  {
                    backgroundColor: statusTheme.soft,
                    borderColor: statusTheme.border,
                  },
                ]}
              >
                <Ionicons name="storefront" size={22} color={statusTheme.color} />
                <View style={styles.readyCopy}>
                  <Text style={[styles.readyTitle, { color: statusTheme.color }]}>
                    Ready at the store
                  </Text>
                  <Text style={styles.readySub}>{contact.address}</Text>
                </View>
              </View>
            ) : null}

            {isDelivered ? (
              <View
                style={[
                  styles.readyBanner,
                  {
                    backgroundColor: statusTheme.soft,
                    borderColor: statusTheme.border,
                  },
                ]}
              >
                <Ionicons name="checkmark-done-circle" size={22} color={statusTheme.color} />
                <View style={styles.readyCopy}>
                  <Text style={[styles.readyTitle, { color: statusTheme.color }]}>Delivered</Text>
                  <Text style={styles.readySub}>
                    Picked up
                    {order.deliveredAt ? ` · ${formatTrackingTime(order.deliveredAt)}` : ''}. Enjoy
                    your game!
                  </Text>
                </View>
              </View>
            ) : null}

            {isReady ? (
              <TouchableOpacity
                style={[styles.pickupBtn, { backgroundColor: statusTheme.color }]}
                onPress={confirmPickup}
                activeOpacity={0.9}
                disabled={markingDelivered}
              >
                {markingDelivered ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <>
                    <Ionicons name="bag-check" size={20} color={colors.white} />
                    <Text style={styles.pickupBtnText}>I’ve picked up — mark delivered</Text>
                  </>
                )}
              </TouchableOpacity>
            ) : null}

            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionPrimary} onPress={() => openWhatsApp()} activeOpacity={0.9}>
                <Ionicons name="logo-whatsapp" size={20} color={colors.white} />
                <Text style={styles.actionPrimaryText}>WhatsApp store</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionSecondary} onPress={() => openPhone()} activeOpacity={0.9}>
                <Ionicons name="call-outline" size={18} color={colors.text} />
                <Text style={styles.actionSecondaryText}>Call</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
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
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  empty: { alignItems: 'center', paddingTop: spacing.xxl, paddingHorizontal: spacing.md },
  emptyTitle: { ...typography.h3, color: colors.text, marginTop: spacing.md },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  statusPillText: { ...typography.caption, fontWeight: '800' },
  amount: { ...typography.h3 },
  orderId: { ...typography.body, color: colors.text, fontWeight: '700' },
  meta: { ...typography.caption, color: colors.textMuted, marginTop: 4, marginBottom: spacing.md },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceLight,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  sectionLabel: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  timeline: { marginBottom: spacing.lg },
  stepRow: { flexDirection: 'row', gap: spacing.md, minHeight: 88 },
  rail: { width: 28, alignItems: 'center' },
  nodeWrap: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodePulse: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
  },
  node: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceLight,
    borderWidth: 2,
    borderColor: colors.border,
  },
  nodeUpcoming: {
    opacity: 0.55,
  },
  nodeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  nodeDotMuted: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textMuted,
  },
  railLine: {
    flex: 1,
    width: 2,
    marginVertical: 4,
    backgroundColor: colors.border,
  },
  stepCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  stepCardDone: {
    opacity: 0.92,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  stepTitle: { ...typography.bodySmall, fontWeight: '700', flexShrink: 1 },
  stepTime: { ...typography.caption, color: colors.textMuted, marginTop: 6 },
  stepDesc: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  liveText: { ...typography.caption, fontWeight: '700' },
  detailsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  detailsTitle: { ...typography.bodySmall, color: colors.text, fontWeight: '700', marginBottom: spacing.sm },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: 6,
  },
  detailLabel: { ...typography.caption, color: colors.textMuted },
  detailValue: { ...typography.caption, color: colors.text, fontWeight: '600', flex: 1, textAlign: 'right' },
  readyBanner: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  readyCopy: { flex: 1 },
  readyTitle: { ...typography.bodySmall, fontWeight: '800' },
  readySub: { ...typography.caption, color: colors.textSecondary, marginTop: 2, lineHeight: 18 },
  pickupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radius.md,
    paddingVertical: 15,
    marginBottom: spacing.md,
  },
  pickupBtnText: { ...typography.bodySmall, color: colors.white, fontWeight: '800' },
  actions: { flexDirection: 'row', gap: spacing.sm },
  actionPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.whatsapp,
    borderRadius: radius.md,
    paddingVertical: 14,
  },
  actionPrimaryText: { ...typography.bodySmall, color: colors.white, fontWeight: '800' },
  actionSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  actionSecondaryText: { ...typography.bodySmall, color: colors.text, fontWeight: '700' },
});
