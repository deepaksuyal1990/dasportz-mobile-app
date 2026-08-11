import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { StepIndicator } from '../components/StepIndicator';
import { TextField } from '../components/TextField';
import { SelectField } from '../components/SelectField';
import { OptionPickerModal } from '../components/OptionPickerModal';
import { Button } from '../components/Button';
import { createCricketOrder, verifyPayment, SHOP_ID, wasCustomerNotifiedByBackend } from '../services/paymentsApi';
// Zoho native UPI disabled for localhost / web dev.
// import { runZohoUpiCheckout } from '../services/zohoPayments';
import { fetchProductById, getBatSizesForCheckout } from '../services/productsApi';
import { storeLocations } from '../data/stringing';
import type { CricketProduct } from '../types/product';
import type { PaymentMethod } from '../data/stringing';
import { formatPrice } from '../utils/pricing';
import { getProfileFormPrefill } from '../utils/profilePrefill';
import { colors, spacing, typography, radius } from '../constants/theme';
import { openWhatsApp } from '../utils/linking';
import { navigateToBookingSuccess } from '../utils/navHelpers';
import { wantsWhatsAppNotifications } from '../utils/notificationPrefs';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../navigation/types';

const checkoutSteps = ['Product', 'Details', 'Checkout'] as const;

type Props = NativeStackScreenProps<RootStackParamList, 'CricketCheckout'>;

export function CricketCheckoutScreen({ route, navigation }: Props) {
  const { user } = useAuth();
  const prefill = getProfileFormPrefill(user);
  const appliedUserId = useRef<string | null>(null);

  const [step, setStep] = useState(0);
  const [product, setProduct] = useState<CricketProduct | null>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [sizes, setSizes] = useState<string[]>([]);
  const [fullName, setFullName] = useState(prefill?.fullName ?? '');
  const [whatsapp, setWhatsapp] = useState(prefill?.phone ?? '');
  const [email, setEmail] = useState(prefill?.email ?? '');
  const [address, setAddress] = useState(prefill?.address ?? '');
  const [locationId, setLocationId] = useState(
    prefill?.preferredStoreId && storeLocations.some((l) => l.id === prefill.preferredStoreId)
      ? prefill.preferredStoreId
      : storeLocations[0].id,
  );
  const [knocking, setKnocking] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');
  const [showSizePicker, setShowSizePicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const phoneDigits = whatsapp.replace(/\D/g, '').slice(-10);
  const customerEmail = email.trim() || `${phoneDigits}@dasportz.com`;

  const applyProfilePrefill = useCallback(() => {
    const p = getProfileFormPrefill(user);
    if (!p || !user) return;

    const firstApply = appliedUserId.current !== user.id;
    appliedUserId.current = user.id;

    if (firstApply) {
      setFullName(p.fullName);
      setWhatsapp(p.phone);
      setEmail(p.email);
      setAddress(p.address);
      if (p.preferredStoreId && storeLocations.some((l) => l.id === p.preferredStoreId)) {
        setLocationId(p.preferredStoreId);
      }
      return;
    }

    setFullName((prev) => prev.trim() || p.fullName);
    setWhatsapp((prev) => prev.replace(/\D/g, '') || p.phone);
    setEmail((prev) => prev.trim() || p.email);
    setAddress((prev) => prev.trim() || p.address);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      applyProfilePrefill();
    }, [applyProfilePrefill]),
  );

  useEffect(() => {
    applyProfilePrefill();
  }, [applyProfilePrefill]);

  useEffect(() => {
    fetchProductById(route.params.productId).then((p) => {
      if (!p) return;
      setProduct(p);
      const batSizes = getBatSizesForCheckout(p);
      setSizes(batSizes);
      setSelectedSize(batSizes[0] ?? 'SH');
    });
  }, [route.params.productId]);

  const selectedLocation = storeLocations.find((l) => l.id === locationId);

  function validate(currentStep: number): boolean {
    const next: Record<string, string> = {};
    if (currentStep === 0 && !selectedSize) next.size = 'Please select a size';
    if (currentStep === 1) {
      if (!fullName.trim()) next.fullName = 'Full name is required';
      const phone = whatsapp.replace(/\D/g, '');
      if (phone.length < 10) next.whatsapp = 'Enter a valid 10-digit number';
      if (!address.trim() || address.trim().length < 10)
        next.address = 'Enter your complete delivery address';
    }
    if (currentStep === 2 && !paymentMethod) next.payment = 'Select a payment method';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleNext() {
    if (!validate(step)) return;
    if (step < checkoutSteps.length - 1) setStep((s) => s + 1);
    else submitOrder();
  }

  function buildMessage() {
    if (!product) return '';
    return [
      'Cricket Bat Order Request',
      '',
      '--- Product ---',
      `Bat: ${product.title}`,
      `Brand: ${product.brand}`,
      `Size: ${selectedSize}`,
      `Price: ${formatPrice(product.sellingPrice)}`,
      product.mrpPrice > product.sellingPrice
        ? `MRP: ${formatPrice(product.mrpPrice)}`
        : '',
      `Bat Knocking Service: ${knocking ? 'Yes' : 'No'}`,
      '',
      '--- Customer ---',
      `Name: ${fullName}`,
      `WhatsApp: +91 ${whatsapp.replace(/\D/g, '').slice(-10)}`,
      email ? `Email: ${email}` : '',
      `Delivery Address: ${address}`,
      `Preferred Store: ${selectedLocation?.name ?? ''}`,
      '',
      '--- Payment ---',
      `Method: ${paymentMethod === 'upi' ? 'UPI / Online' : 'Cash'}`,
      `Total: ${formatPrice(product.sellingPrice)}`,
      '',
      'Please confirm my order. Thank you!',
    ]
      .filter(Boolean)
      .join('\n');
  }

  function navigateToSuccess(
    orderId: string,
    amount: string,
    method: 'cash' | 'upi',
    backendAlreadyNotified = false,
  ) {
    if (!product) return;
    navigateToBookingSuccess(navigation, {
      kind: 'purchase',
      amount: `₹${Number(amount).toLocaleString('en-IN')}`,
      orderId,
      customerName: fullName.trim(),
      customerPhone: phoneDigits,
      paymentMethod: method,
      backendAlreadyNotified,
      details: [
        { label: 'Product', value: product.title },
        { label: 'Size', value: selectedSize },
        { label: 'Store', value: selectedLocation?.name ?? '' },
        ...(method === 'cash'
          ? [{ label: 'Payment', value: 'Cash at store' }]
          : [{ label: 'Payment', value: 'UPI / Online' }]),
      ],
    });
  }

  async function submitOrder() {
    if (!product) return;

    setSubmitting(true);
    try {
      const isCash = paymentMethod === 'cash';
      const allowWhatsApp = wantsWhatsAppNotifications(user);
      const response = await createCricketOrder({
        customerName: fullName.trim(),
        phone: phoneDigits,
        email: customerEmail,
        shopId: SHOP_ID,
        serviceType: 'cricket-product',
        productDetails: {
          id: product.id,
          title: product.title,
          brand: product.brand,
          category: product.category,
          selectedSize,
          mrpPrice: product.mrpPrice,
        },
        knockingService: knocking,
        deliveryAddress: address.trim(),
        shippingCost: 0,
        unlockedPrice: product.sellingPrice,
        mrpPrice: product.mrpPrice,
        dealToken: 'STANDARD',
        paymentMethod: isCash ? 'payatoutlet' : 'upi',
        notifyCustomer: allowWhatsApp,
        testMode: false,
      });

      if (!response.success || !response.data) {
        throw new Error(response.message ?? 'Could not create order');
      }

      const { order_id: orderId, amount, payments_session_id: sessionId } = response.data;
      const notified = allowWhatsApp && wasCustomerNotifiedByBackend(response);

      if (isCash) {
        navigateToSuccess(orderId, String(amount), 'cash', notified);
        return;
      }

      setSubmitting(false);

      // Zoho native UPI disabled — skip payment on web for local testing.
      if (Platform.OS === 'web') {
        navigateToSuccess(orderId, String(amount), 'upi', false);
        return;
      }

      /*
      const checkout = await runZohoUpiCheckout({
        paymentSessionId: sessionId,
        description: `Order ${orderId} — ${product.title}`,
        name: fullName.trim(),
        email: customerEmail,
        phone: phoneDigits,
      });

      if (checkout.cancelled) return;

      setSubmitting(true);
      const verified = await verifyPayment(checkout.paymentId);
      if (!verified.success) {
        throw new Error(verified.message ?? 'Payment verification failed');
      }
      navigateToSuccess(orderId, String(amount), 'upi', true);
      return;
      */
      void sessionId;
      throw new Error('UPI payments are disabled. Use cash checkout for local testing.');
    } catch (err) {
      Alert.alert(
        'Checkout Failed',
        err instanceof Error ? err.message : 'Please try again or contact us on WhatsApp.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'WhatsApp', onPress: () => openWhatsApp(buildMessage()) },
        ],
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!product) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Loading product...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StepIndicator steps={checkoutSteps} currentStep={step} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {step === 0 ? (
          <View>
            <Text style={styles.heading}>Review Product</Text>
            <View style={styles.productCard}>
              <Image source={{ uri: product.images[0] }} style={styles.productImage} />
              <View style={styles.productInfo}>
                <Text style={styles.productBrand}>{product.brand}</Text>
                <Text style={styles.productTitle}>{product.title}</Text>
                <Text style={styles.productPrice}>{formatPrice(product.sellingPrice)}</Text>
              </View>
            </View>

            <SelectField
              label="Select Size"
              required
              value={selectedSize}
              onPress={() => setShowSizePicker(true)}
              error={errors.size}
            />

            <TouchableOpacity
              style={[styles.knockingRow, knocking && styles.knockingActive]}
              onPress={() => setKnocking(!knocking)}
            >
              <View style={styles.knockingInfo}>
                <Text style={styles.knockingTitle}>Include Bat Knocking</Text>
                <Text style={styles.knockingSub}>
                  10,000+ stroke machine knocking — match ready
                </Text>
              </View>
              <Ionicons
                name={knocking ? 'checkbox' : 'square-outline'}
                size={24}
                color={knocking ? colors.primary : colors.textMuted}
              />
            </TouchableOpacity>
          </View>
        ) : null}

        {step === 1 ? (
          <View>
            <Text style={styles.heading}>Your Details</Text>
            <Text style={styles.subheading}>
              {user
                ? 'Prefilled from your profile — edit if needed'
                : 'For delivery updates and order confirmation'}
            </Text>

            <TextField
              label="Full Name"
              required
              value={fullName}
              onChangeText={setFullName}
              error={errors.fullName}
            />
            <TextField
              label="WhatsApp Number"
              required
              value={whatsapp}
              onChangeText={(t) => setWhatsapp(t.replace(/[^0-9]/g, '').slice(0, 10))}
              keyboardType="phone-pad"
              error={errors.whatsapp}
            />
            <TextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextField
              label="Delivery Address"
              required
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={3}
              error={errors.address}
              style={styles.addressInput}
            />
            <SelectField
              label="Preferred Store Location"
              value={selectedLocation?.name ?? ''}
              onPress={() => setShowLocationPicker(true)}
            />
          </View>
        ) : null}

        {step === 2 ? (
          <View>
            <Text style={styles.heading}>Review & Pay</Text>
            <Text style={styles.subheading}>Almost done!</Text>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>{product.title}</Text>
              <Text style={styles.summaryMeta}>
                {product.brand} · Size {selectedSize}
                {knocking ? ' · Bat knocking included' : ''}
              </Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>{formatPrice(product.sellingPrice)}</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatPrice(product.sellingPrice)}</Text>
              </View>
            </View>

            <Text style={styles.paymentLabel}>Pay Via</Text>
            <View style={styles.paymentOptions}>
              {(['upi', 'cash'] as PaymentMethod[]).map((method) => (
                <TouchableOpacity
                  key={method}
                  style={[
                    styles.paymentOption,
                    paymentMethod === method && styles.paymentOptionSelected,
                  ]}
                  onPress={() => setPaymentMethod(method)}
                >
                  <Ionicons
                    name={method === 'upi' ? 'card-outline' : 'cash-outline'}
                    size={22}
                    color={paymentMethod === method ? colors.primary : colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.paymentText,
                      paymentMethod === method && styles.paymentTextSelected,
                    ]}
                  >
                    {method === 'upi' ? 'UPI / Online' : 'Cash'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.payment ? <Text style={styles.paymentError}>{errors.payment}</Text> : null}

            <View style={styles.deliverySummary}>
              <Text style={styles.deliveryTitle}>Deliver to</Text>
              <Text style={styles.deliveryText}>{fullName}</Text>
              <Text style={styles.deliveryText}>+91 {whatsapp}</Text>
              <Text style={styles.deliveryText}>{address}</Text>
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        {step > 0 ? (
          <TouchableOpacity style={styles.backBtn} onPress={() => setStep((s) => s - 1)}>
            <Ionicons name="arrow-back" size={20} color={colors.text} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.backPlaceholder} />
        )}
        <Button
          title={
            submitting
              ? 'Processing…'
              : step === checkoutSteps.length - 1
                ? paymentMethod === 'upi'
                  ? 'Pay & Place Order'
                  : 'Place Order'
                : 'Next Step'
          }
          onPress={handleNext}
          style={styles.nextBtn}
          disabled={submitting}
        />
      </View>

      <OptionPickerModal
        visible={showSizePicker}
        title="Select Bat Size"
        options={sizes.map((s) => ({ id: s, label: s }))}
        selectedId={selectedSize}
        onSelect={setSelectedSize}
        onClose={() => setShowSizePicker(false)}
      />

      <OptionPickerModal
        visible={showLocationPicker}
        title="Preferred Store"
        options={storeLocations.map((l) => ({ id: l.id, label: l.name }))}
        selectedId={locationId}
        onSelect={setLocationId}
        onClose={() => setShowLocationPicker(false)}
      />

      {submitting ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  errorText: { color: colors.textSecondary },
  heading: { ...typography.h2, color: colors.text, marginBottom: spacing.xs },
  subheading: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  productCard: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.lg,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceLight,
  },
  productInfo: { flex: 1 },
  productBrand: { ...typography.caption, color: colors.primary, fontWeight: '700' },
  productTitle: { ...typography.bodySmall, color: colors.text, fontWeight: '600', marginVertical: 4 },
  productPrice: { ...typography.h3, color: colors.text },
  knockingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  knockingActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  knockingInfo: { flex: 1, paddingRight: spacing.md },
  knockingTitle: { ...typography.body, color: colors.text, fontWeight: '700' },
  knockingSub: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  addressInput: { minHeight: 80, textAlignVertical: 'top' },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.lg,
  },
  summaryTitle: { ...typography.body, color: colors.text, fontWeight: '700', marginBottom: 4 },
  summaryMeta: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.md },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  summaryLabel: { ...typography.bodySmall, color: colors.textSecondary },
  summaryValue: { ...typography.bodySmall, color: colors.text, fontWeight: '600' },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.md,
    marginTop: spacing.sm,
    marginBottom: 0,
  },
  totalLabel: { ...typography.h3, color: colors.text },
  totalValue: { ...typography.h3, color: colors.primary },
  paymentLabel: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  paymentOptions: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  paymentOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
  },
  paymentOptionSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  paymentText: { ...typography.bodySmall, color: colors.textMuted, fontWeight: '600' },
  paymentTextSelected: { color: colors.primary },
  paymentError: { ...typography.caption, color: colors.error, marginBottom: spacing.md },
  deliverySummary: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  deliveryTitle: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  deliveryText: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: 2 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, padding: spacing.sm },
  backPlaceholder: { width: 72 },
  backText: { ...typography.body, color: colors.text, fontWeight: '600' },
  nextBtn: { flex: 1 },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(6, 13, 24, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
