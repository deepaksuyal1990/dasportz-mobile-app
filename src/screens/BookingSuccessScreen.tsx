import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, spacing, typography, radius } from '../constants/theme';
import { downloadInvoicePdf } from '../utils/invoicePdf';
import { useNotifications } from '../context/NotificationContext';
import { notifyOrderConfirmation } from '../services/orderConfirmation';
import { savePastOrder } from '../services/orderHistory';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingSuccess'>;

const GREEN = colors.primary;
const GREEN_DARK = colors.primaryDark;
const BLUE = '#3B82F6';
const BLUE_DARK = '#2563EB';

function getSuccessCopy(
  kind: 'service' | 'purchase',
  paymentMethod: 'cash' | 'upi',
  customerName: string,
) {
  const firstName = customerName.trim().split(' ')[0] || 'there';

  if (kind === 'service') {
    return {
      title: paymentMethod === 'cash' ? 'Booking Done!' : 'Booking Confirmed!',
      subtitle:
        paymentMethod === 'cash'
          ? 'Your service slot is reserved. Pay in cash when you visit the store.'
          : 'Payment received. We will notify you when your equipment is ready.',
      referenceLabel: 'Booking ID',
      thankYou: `Thank you, ${firstName}! We appreciate you choosing DA SPORTZ for your stringing and service needs. We will take great care of your equipment.`,
      cashNote:
        'Visit DA SPORTZ and pay in cash. Show this screen at the counter to confirm your booking.',
      paidNote:
        'Payment confirmed via Playnex. We will update you on WhatsApp when your service is complete.',
    };
  }

  return {
    title: paymentMethod === 'cash' ? 'Order Placed!' : 'Order Confirmed!',
    subtitle:
      paymentMethod === 'cash'
        ? 'Your order is reserved. Pay in cash when you collect your gear.'
        : 'Payment received. We will dispatch your order within 48 hours.',
    referenceLabel: 'Order ID',
    thankYou: `Thank you, ${firstName}! We are grateful for your purchase at DA SPORTZ. Our team is preparing your order with care.`,
    cashNote:
      'Visit DA SPORTZ and pay in cash. Show this screen at the counter to collect your order.',
    paidNote:
      'Payment confirmed via Playnex. We will process your order and notify you on WhatsApp.',
  };
}

export function BookingSuccessScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const {
    kind,
    amount,
    orderId,
    customerName,
    customerPhone,
    paymentMethod,
    details = [],
  } = route.params;

  const { addNotification } = useNotifications();
  const confirmationSent = useRef(false);

  const copy = getSuccessCopy(kind, paymentMethod, customerName);

  const scale = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.6)).current;
  const ringOpacity = useRef(new Animated.Value(0.8)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslate = useRef(new Animated.Value(24)).current;
  const checkDraw = useRef(new Animated.Value(0)).current;
  const blinkAnim = useRef(new Animated.Value(0)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;

  const isCash = paymentMethod === 'cash';
  const themeColor = isCash ? BLUE : GREEN;
  const themeColorDark = isCash ? BLUE_DARK : GREEN_DARK;
  const [downloading, setDownloading] = useState(false);

  const circleColor = colorAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [GREEN, BLUE, GREEN_DARK, BLUE_DARK, GREEN],
  });

  const tickOpacity = blinkAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.45, 1],
  });

  const tickScale = blinkAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.14, 1],
  });

  const glowOpacity = blinkAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.35, 0.85, 0.35],
  });

  useEffect(() => {
    if (confirmationSent.current) return;
    confirmationSent.current = true;

    const invoiceData = {
      kind,
      amount,
      orderId,
      customerName,
      paymentMethod,
      details,
    };

    const isCash = paymentMethod === 'cash';
    const title = isCash
      ? kind === 'service'
        ? 'Booking reserved'
        : 'Order placed'
      : kind === 'service'
        ? 'Booking confirmed'
        : 'Order confirmed';

    const body = isCash
      ? `${orderId} · ${amount} · Pay at store on visit`
      : `${orderId} · ${amount} · Payment received via UPI`;

    void addNotification({
      type: isCash ? 'order' : 'payment',
      title,
      body,
      orderId,
      amount,
      paymentMethod,
    });

    void savePastOrder({
      id: `po_${orderId}`,
      orderId,
      phone: customerPhone,
      kind,
      amount,
      paymentMethod,
      customerName,
      details,
      createdAt: new Date().toISOString(),
    });

    void notifyOrderConfirmation(invoiceData, customerPhone);
  }, [
    addNotification,
    amount,
    customerName,
    customerPhone,
    details,
    kind,
    orderId,
    paymentMethod,
  ]);

  useEffect(() => {
    const entrance = Animated.sequence([
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(ringScale, {
          toValue: 1.6,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(ringOpacity, {
          toValue: 0,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(checkDraw, {
        toValue: 1,
        duration: 350,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.timing(contentTranslate, {
          toValue: 0,
          duration: 450,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]);

    entrance.start(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(blinkAnim, {
            toValue: 1,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(blinkAnim, {
            toValue: 0,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start();

      Animated.loop(
        Animated.timing(colorAnim, {
          toValue: 1,
          duration: 3600,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
      ).start();
    });
  }, [scale, ringScale, ringOpacity, contentOpacity, contentTranslate, checkDraw, blinkAnim, colorAnim]);

  function goHome() {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs', params: { screen: 'Home', params: { screen: 'HomeMain' } } }],
    });
  }

  async function handleDownloadInvoice() {
    if (downloading) return;
    setDownloading(true);
    try {
      await downloadInvoicePdf({
        kind,
        orderId,
        customerName,
        amount,
        paymentMethod,
        details,
      });
    } catch (err) {
      Alert.alert(
        'Download failed',
        err instanceof Error ? err.message : 'Could not generate invoice PDF. Please try again.',
      );
    } finally {
      setDownloading(false);
    }
  }

  const summaryRows = [
    { label: copy.referenceLabel, value: orderId },
    { label: 'Customer', value: customerName },
    ...details,
  ];

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <LinearGradient
        colors={['#0C1A2E', colors.background, colors.background]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Animated.View
            style={[
              styles.ring,
              {
                borderColor: themeColor,
                opacity: ringOpacity,
                transform: [{ scale: ringScale }],
              },
            ]}
          />

          <View style={styles.iconStack}>
            <Animated.View
              pointerEvents="none"
              style={[
                styles.glowLayer,
                {
                  opacity: glowOpacity,
                  transform: [{ scale: tickScale }],
                },
              ]}
            >
              <Animated.View style={[styles.checkGlow, { borderColor: circleColor }]} />
            </Animated.View>

            <Animated.View style={{ transform: [{ scale }] }}>
              <Animated.View style={[styles.checkCircle, { backgroundColor: circleColor }]}>
                <Animated.View
                  style={{
                    opacity: Animated.multiply(checkDraw, tickOpacity),
                    transform: [{ scale: tickScale }],
                  }}
                >
                  <Ionicons name="checkmark" size={52} color={colors.white} />
                </Animated.View>
              </Animated.View>
            </Animated.View>
          </View>
        </View>

        <Animated.View
          style={{
            opacity: contentOpacity,
            transform: [{ translateY: contentTranslate }],
          }}
        >
          <Text style={[styles.badge, { color: themeColor }]}>
            {isCash ? 'CASH AT STORE' : 'PAID ONLINE'}
          </Text>
          <Text style={styles.title}>{copy.title}</Text>
          <Text style={styles.subtitle}>{copy.subtitle}</Text>

          <View style={styles.thankYouCard}>
            <Ionicons name="heart" size={18} color={colors.primary} />
            <Text style={styles.thankYouText}>{copy.thankYou}</Text>
          </View>

          <View style={styles.amountCard}>
            <Text style={styles.amountLabel}>{isCash ? 'Amount to pay' : 'Amount paid'}</Text>
            <Text style={[styles.amount, { color: themeColor }]}>{amount}</Text>
          </View>

          <View style={styles.detailsCard}>
            {summaryRows.map((item, index) => (
              <View key={item.label}>
                {index > 0 ? <View style={styles.divider} /> : null}
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{item.label}</Text>
                  <Text style={styles.detailValue}>{item.value}</Text>
                </View>
              </View>
            ))}
          </View>

          {isCash ? (
            <View style={styles.noteCard}>
              <View style={styles.noteIcon}>
                <Ionicons name="storefront-outline" size={20} color={BLUE} />
              </View>
              <Text style={styles.noteText}>{copy.cashNote}</Text>
            </View>
          ) : (
            <View style={styles.noteCard}>
              <View style={styles.noteIcon}>
                <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
              </View>
              <Text style={styles.noteText}>{copy.paidNote}</Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      <Animated.View style={[styles.footer, { opacity: contentOpacity }]}>
        <TouchableOpacity
          style={[styles.invoiceBtn, { borderColor: themeColor }]}
          onPress={handleDownloadInvoice}
          activeOpacity={0.85}
          disabled={downloading}
        >
          {downloading ? (
            <ActivityIndicator size="small" color={themeColor} />
          ) : (
            <>
              <Ionicons name="download-outline" size={20} color={themeColor} />
              <Text style={[styles.invoiceText, { color: themeColor }]}>Download Invoice (PDF)</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.doneBtn} onPress={goHome} activeOpacity={0.9}>
          <LinearGradient
            colors={[themeColor, themeColorDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.doneGradient}
          >
            <Text style={styles.doneText}>Back to Home</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  hero: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 160,
    marginBottom: spacing.xl,
  },
  iconStack: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowLayer: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
  },
  checkCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  checkGlow: {
    width: 116,
    height: 116,
    borderRadius: 58,
    borderWidth: 3,
  },
  badge: {
    ...typography.caption,
    fontWeight: '800',
    letterSpacing: 1.2,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  thankYouCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
    marginBottom: spacing.lg,
  },
  thankYouText: {
    ...typography.bodySmall,
    color: colors.text,
    flex: 1,
    lineHeight: 22,
    fontWeight: '500',
  },
  amountCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.lg,
  },
  amountLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
    marginBottom: spacing.xs,
    textAlign: 'center',
    width: '100%',
  },
  amount: {
    fontSize: 36,
    fontWeight: '800',
    textAlign: 'center',
    width: '100%',
  },
  detailsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.lg,
    paddingVertical: spacing.md,
  },
  detailLabel: {
    ...typography.bodySmall,
    color: colors.textMuted,
    width: 100,
    flexShrink: 0,
    paddingTop: 1,
    lineHeight: 20,
  },
  detailValue: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  noteIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  noteText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    gap: spacing.sm,
  },
  invoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 14,
    borderRadius: radius.md,
    borderWidth: 1.5,
    backgroundColor: colors.surface,
  },
  invoiceText: {
    ...typography.body,
    fontWeight: '700',
  },
  doneBtn: { borderRadius: radius.md, overflow: 'hidden' },
  doneGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  doneText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '800',
  },
});
