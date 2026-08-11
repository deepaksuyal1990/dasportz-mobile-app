import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { StepIndicator } from '../components/StepIndicator';
import { TextField } from '../components/TextField';
import { SelectField } from '../components/SelectField';
import { OptionPickerModal } from '../components/OptionPickerModal';
import { StringSpecsModal } from '../components/StringSpecsModal';
import { Button } from '../components/Button';
import { createStringingOrder, verifyPayment, SHOP_ID, wasCustomerNotifiedByBackend } from '../services/paymentsApi';
// Zoho native UPI disabled for localhost / web dev.
// import { runZohoUpiCheckout } from '../services/zohoPayments';
import {
  formSteps,
  stringOptions,
  storeLocations,
  EXPRESS_FEE_PER_RACKET,
  createEmptyRacket,
  getStringById,
  formatPrice,
  calculateOrderTotal,
  resolveStringingCoupon,
  STRINGING_TEST_COUPON_CODE,
  type RacketFormEntry,
  type PaymentMethod,
} from '../data/stringing';
import { colors, spacing, typography, radius } from '../constants/theme';
import { openWhatsApp } from '../utils/linking';
import { getProfileFormPrefill } from '../utils/profilePrefill';
import { navigateToBookingSuccess } from '../utils/navHelpers';
import { wantsWhatsAppNotifications } from '../utils/notificationPrefs';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../navigation/types';


type Props = NativeStackScreenProps<RootStackParamList, 'StringingForm'>;

type PickerTarget =
  | { type: 'string'; racketId: string }
  | { type: 'location' }
  | null;

type FormErrors = {
  rackets?: Record<string, Partial<Record<keyof RacketFormEntry, string>>>;
  whatsapp?: string;
  fullName?: string;
  location?: string;
  payment?: string;
};

export function StringingFormScreen({ navigation }: Props) {
  const { user } = useAuth();
  const prefill = getProfileFormPrefill(user);
  const appliedUserId = useRef<string | null>(null);

  const [step, setStep] = useState(0);
  const [rackets, setRackets] = useState<RacketFormEntry[]>([createEmptyRacket()]);
  const [whatsapp, setWhatsapp] = useState(prefill?.phone ?? '');
  const [fullName, setFullName] = useState(prefill?.fullName ?? '');
  const [locationId, setLocationId] = useState(
    prefill?.preferredStoreId && storeLocations.some((l) => l.id === prefill.preferredStoreId)
      ? prefill.preferredStoreId
      : storeLocations[0].id,
  );
  const [express, setExpress] = useState(false);
  const [pickupDrop, setPickupDrop] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);
  const [showSpecs, setShowSpecs] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const couponDiscount = couponApplied ? resolveStringingCoupon(couponCode) : 0;
  const totals = calculateOrderTotal(rackets, express, couponDiscount);
  const selectedLocation = storeLocations.find((l) => l.id === locationId);
  const phoneDigits = whatsapp.replace(/\D/g, '').slice(-10);
  const customerEmail = getProfileFormPrefill(user)?.email || `${phoneDigits}@dasportz.com`;

  const applyProfilePrefill = useCallback(() => {
    const p = getProfileFormPrefill(user);
    if (!p || !user) return;

    const firstApply = appliedUserId.current !== user.id;
    appliedUserId.current = user.id;

    if (firstApply) {
      setFullName(p.fullName);
      setWhatsapp(p.phone);
      if (p.preferredStoreId && storeLocations.some((l) => l.id === p.preferredStoreId)) {
        setLocationId(p.preferredStoreId);
      }
      return;
    }

    setFullName((prev) => prev.trim() || p.fullName);
    setWhatsapp((prev) => prev.replace(/\D/g, '') || p.phone);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      applyProfilePrefill();
    }, [applyProfilePrefill]),
  );

  useEffect(() => {
    applyProfilePrefill();
  }, [applyProfilePrefill]);

  function updateRacket(id: string, updates: Partial<RacketFormEntry>) {
    setRackets((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  }

  function removeRacket(id: string) {
    if (rackets.length === 1) return;
    setRackets((prev) => prev.filter((r) => r.id !== id));
  }

  function validateStep(currentStep: number): boolean {
    const nextErrors: FormErrors = {};

    if (currentStep === 0) {
      const racketErrors: FormErrors['rackets'] = {};
      rackets.forEach((racket) => {
        const fieldErrors: Partial<Record<keyof RacketFormEntry, string>> = {};
        if (!racket.model.trim()) fieldErrors.model = 'Racket model is required';
        if (!racket.stringId) fieldErrors.stringId = 'Please select a string';
        if (!racket.tension.trim()) {
          fieldErrors.tension = 'Tension is required';
        } else {
          const tension = Number(racket.tension);
          if (Number.isNaN(tension) || tension < 18 || tension > 35) {
            fieldErrors.tension = 'Enter tension between 18–35 lbs';
          }
        }
        if (racket.quantity < 1) fieldErrors.quantity = 'Min quantity is 1';
        if (Object.keys(fieldErrors).length > 0) racketErrors[racket.id] = fieldErrors;
      });
      if (Object.keys(racketErrors).length > 0) nextErrors.rackets = racketErrors;
    }

    if (currentStep === 1) {
      const phone = whatsapp.replace(/\D/g, '');
      if (phone.length < 10) nextErrors.whatsapp = 'Enter a valid 10-digit WhatsApp number';
      if (!fullName.trim()) nextErrors.fullName = 'Full name is required';
      if (!locationId) nextErrors.location = 'Please select a store location';
    }

    if (currentStep === 2) {
      if (!paymentMethod) nextErrors.payment = 'Please select a payment method';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleNext() {
    if (!validateStep(step)) return;
    if (step < formSteps.length - 1) {
      setStep((s) => s + 1);
    } else {
      submitOrder();
    }
  }

  function handleBack() {
    if (step > 0) setStep((s) => s - 1);
  }

  function applyCoupon() {
    const code = couponCode.trim();
    if (!code) {
      setCouponApplied(false);
      setCouponError('Please enter a coupon code.');
      return;
    }
    const discount = resolveStringingCoupon(code);
    if (!discount) {
      setCouponApplied(false);
      setCouponError('Invalid coupon code.');
      Alert.alert('Invalid coupon', 'This coupon code is not valid for racket stringing.');
      return;
    }
    setCouponCode(code.toUpperCase());
    setCouponApplied(true);
    setCouponError('');
    Alert.alert(
      'Coupon applied',
      `${STRINGING_TEST_COUPON_CODE} — ${formatPrice(discount)} off applied to your stringing order.`,
    );
  }

  function buildOrderMessage() {
    const racketLines = rackets
      .map((racket, index) => {
        const stringOption = getStringById(racket.stringId);
        return [
          `Racket ${index + 1}:`,
          `  Model: ${racket.model}`,
          `  String: ${stringOption?.name ?? 'N/A'} (${formatPrice(stringOption?.price ?? 0)})`,
          `  Qty: ${racket.quantity}`,
          `  Tension: ${racket.tension} lbs`,
        ].join('\n');
      })
      .join('\n\n');

    return [
      'Badminton Stringing Booking Request',
      '',
      '--- Rackets ---',
      racketLines,
      '',
      '--- Customer Details ---',
      `Name: ${fullName}`,
      `WhatsApp: +91 ${whatsapp.replace(/\D/g, '').slice(-10)}`,
      `Store: ${selectedLocation?.name ?? ''}`,
      '',
      '--- Order Summary ---',
      `Subtotal: ${formatPrice(totals.subtotal)}`,
      express ? `Express (1 Hour): ${formatPrice(totals.expressFee)}` : 'Express: No',
      pickupDrop ? 'Pickup & Drop: Yes (porter charges apply)' : 'Pickup & Drop: No',
      couponApplied && totals.discount > 0
        ? `Coupon (${couponCode.toUpperCase()}): -${formatPrice(totals.discount)}`
        : '',
      `Total: ${formatPrice(totals.total)}`,
      `Payment: ${paymentMethod === 'upi' ? 'UPI / Online' : 'Cash'}`,
      '',
      'Please confirm my booking. Thank you!',
    ]
      .filter(Boolean)
      .join('\n');
  }

  function navigateToSuccess(
    orderId: string,
    amount: number,
    method: 'cash' | 'upi',
    backendAlreadyNotified = false,
  ) {
    navigateToBookingSuccess(navigation, {
      kind: 'service',
      amount: formatPrice(amount),
      orderId,
      customerName: fullName.trim(),
      customerPhone: phoneDigits,
      paymentMethod: method,
      backendAlreadyNotified,
      details: [
        { label: 'Service', value: 'Badminton Stringing' },
        { label: 'Rackets', value: String(totals.racketCount) },
        { label: 'Store', value: selectedLocation?.name ?? '' },
        { label: 'Express', value: express ? 'Yes (+1 hr)' : 'Standard' },
        ...(method === 'cash'
          ? [{ label: 'Payment', value: 'Cash at store' }]
          : [{ label: 'Payment', value: 'UPI / Online' }]),
        ...(couponApplied && totals.discount > 0
          ? [{ label: 'Coupon', value: `${couponCode.toUpperCase()} (−${formatPrice(totals.discount)})` }]
          : []),
      ],
    });
  }

  async function submitOrder() {
    setSubmitting(true);
    try {
      const isCash = paymentMethod === 'cash';
      const allowWhatsApp = wantsWhatsAppNotifications(user);
      const response = await createStringingOrder({
        customerName: fullName.trim(),
        phone: phoneDigits,
        email: customerEmail,
        shopId: SHOP_ID,
        store: locationId,
        racketDetails: rackets.map((racket) => {
          const stringOption = getStringById(racket.stringId);
          return {
            id: `RQ_${racket.id}`,
            racketName: racket.model.trim() || 'Unknown Model',
            string: stringOption?.name ?? '',
            tension: Number(racket.tension),
            qty: racket.quantity,
            cost: stringOption?.price ?? 0,
          };
        }),
        express,
        _ts: Date.now(),
        paymentMethod: isCash ? 'payatoutlet' : 'upi',
        pickupDrop,
        testMode: false,
        notifyCustomer: allowWhatsApp,
        payment: {
          originalAmount: totals.subtotal + totals.expressFee,
          discount: {
            couponCode: couponApplied && totals.discount > 0 ? couponCode.trim().toUpperCase() : null,
            couponDiscount: totals.discount,
          },
          finalAmount: totals.total,
        },
      });

      if (!response.success || !response.data) {
        throw new Error(response.message ?? 'Could not create booking');
      }

      const { order_id: orderId, amount, payments_session_id: sessionId } = response.data;
      const notified = allowWhatsApp && wasCustomerNotifiedByBackend(response);
      // Prefer our payable total when a test coupon was applied (backend may ignore discount).
      const payableAmount = totals.discount > 0 ? totals.total : Number(amount);

      if (isCash) {
        navigateToSuccess(orderId, payableAmount, 'cash', notified);
        return;
      }

      setSubmitting(false);

      // Zoho native UPI disabled — skip payment on web for local testing.
      if (Platform.OS === 'web') {
        navigateToSuccess(orderId, payableAmount, 'upi', false);
        return;
      }

      /*
      const checkout = await runZohoUpiCheckout({
        paymentSessionId: sessionId,
        description: `Stringing order ${orderId}`,
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
      navigateToSuccess(orderId, Number(amount), 'upi', true);
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
          { text: 'WhatsApp', onPress: () => openWhatsApp(buildOrderMessage()) },
        ],
      );
    } finally {
      setSubmitting(false);
    }
  }

  const stringPickerOptions = stringOptions.map((s) => ({
    id: s.id,
    label: s.name,
    subtitle: formatPrice(s.price),
  }));

  const locationPickerOptions = storeLocations.map((l) => ({
    id: l.id,
    label: l.name,
  }));

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StepIndicator steps={formSteps} currentStep={step} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {step === 0 ? (
          <View>
            <Text style={styles.heading}>Configure Your Rackets</Text>
            <Text style={styles.subheading}>Select string & tension for each racket</Text>

            {rackets.map((racket, index) => {
              const racketErrors = errors.rackets?.[racket.id];
              const stringOption = getStringById(racket.stringId);

              return (
                <View key={racket.id} style={styles.racketCard}>
                  <View style={styles.racketHeader}>
                    <Text style={styles.racketTitle}>Racket {index + 1}</Text>
                    {rackets.length > 1 ? (
                      <TouchableOpacity onPress={() => removeRacket(racket.id)}>
                        <Ionicons name="trash-outline" size={20} color={colors.error} />
                      </TouchableOpacity>
                    ) : null}
                  </View>

                  <TextField
                    label="Racket Model"
                    required
                    placeholder="e.g. Yonex Astrox 99 Pro"
                    value={racket.model}
                    onChangeText={(text) => updateRacket(racket.id, { model: text })}
                    error={racketErrors?.model}
                  />

                  <SelectField
                    label="String"
                    required
                    value={stringOption ? `${stringOption.name} — ${formatPrice(stringOption.price)}` : ''}
                    onPress={() => setPickerTarget({ type: 'string', racketId: racket.id })}
                    error={racketErrors?.stringId}
                  />

                  <View style={styles.row}>
                    <View style={styles.half}>
                      <Text style={styles.inlineLabel}>Qty</Text>
                      <View style={styles.qtyRow}>
                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={() =>
                            updateRacket(racket.id, {
                              quantity: Math.max(1, racket.quantity - 1),
                            })
                          }
                        >
                          <Ionicons name="remove" size={18} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={styles.qtyValue}>{racket.quantity}</Text>
                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={() =>
                            updateRacket(racket.id, { quantity: racket.quantity + 1 })
                          }
                        >
                          <Ionicons name="add" size={18} color={colors.text} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.half}>
                      <TextField
                        label="Tension"
                        required
                        placeholder="26"
                        value={racket.tension}
                        onChangeText={(text) =>
                          updateRacket(racket.id, { tension: text.replace(/[^0-9]/g, '') })
                        }
                        keyboardType="number-pad"
                        suffix="lbs"
                        error={racketErrors?.tension}
                      />
                    </View>
                  </View>
                </View>
              );
            })}

            <TouchableOpacity
              style={styles.addRacketBtn}
              onPress={() => setRackets((prev) => [...prev, createEmptyRacket()])}
            >
              <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
              <Text style={styles.addRacketText}>Add Another Racket</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.specsBtn} onPress={() => setShowSpecs(true)}>
              <Ionicons name="bar-chart-outline" size={18} color={colors.accent} />
              <View>
                <Text style={styles.specsTitle}>Compare String Specs</Text>
                <Text style={styles.specsSubtitle}>Durability, Power & Control ratings</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        ) : null}

        {step === 1 ? (
          <View>
            <Text style={styles.heading}>Your Details</Text>
            <Text style={styles.subheading}>
              {user
                ? 'Prefilled from your profile — edit if needed'
                : 'To send you live status updates'}
            </Text>

            <TextField
              label="WhatsApp Number"
              required
              placeholder="9876543210"
              value={whatsapp}
              onChangeText={(text) => setWhatsapp(text.replace(/[^0-9]/g, '').slice(0, 10))}
              keyboardType="phone-pad"
              error={errors.whatsapp}
            />

            <TextField
              label="Full Name"
              required
              placeholder="Your full name"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              error={errors.fullName}
            />

            <SelectField
              label="Preferred Store Location"
              value={selectedLocation?.name ?? ''}
              onPress={() => setPickerTarget({ type: 'location' })}
              error={errors.location}
            />
          </View>
        ) : null}

        {step === 2 ? (
          <View>
            <Text style={styles.heading}>Review & Pay</Text>
            <Text style={styles.subheading}>Almost done!</Text>

            {rackets.map((racket, index) => {
              const stringOption = getStringById(racket.stringId);
              const lineTotal = (stringOption?.price ?? 0) * racket.quantity;
              return (
                <View key={racket.id} style={styles.summaryItem}>
                  <View style={styles.summaryItemHeader}>
                    <Text style={styles.summaryIndex}>{index + 1}.</Text>
                    <Text style={styles.summaryItemTitle}>{racket.model}</Text>
                    <Text style={styles.summaryPrice}>{formatPrice(lineTotal)}</Text>
                  </View>
                  <Text style={styles.summaryMeta}>
                    {stringOption?.name} · {racket.tension} lbs · Qty {racket.quantity}
                  </Text>
                </View>
              );
            })}

            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>{formatPrice(totals.subtotal)}</Text>
              </View>

              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleTitle}>Express (1 Hour)</Text>
                  <Text style={styles.toggleSubtitle}>
                    +{formatPrice(EXPRESS_FEE_PER_RACKET)} per racket
                  </Text>
                </View>
                <Switch
                  value={express}
                  onValueChange={setExpress}
                  trackColor={{ false: colors.border, true: colors.primaryDark }}
                  thumbColor={express ? colors.primary : colors.textMuted}
                />
              </View>

              {express ? (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Express Fee</Text>
                  <Text style={styles.summaryValue}>{formatPrice(totals.expressFee)}</Text>
                </View>
              ) : null}

              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleTitle}>Pickup & Drop</Text>
                  <Text style={styles.toggleSubtitle}>Porter charges apply</Text>
                </View>
                <Switch
                  value={pickupDrop}
                  onValueChange={setPickupDrop}
                  trackColor={{ false: colors.border, true: colors.primaryDark }}
                  thumbColor={pickupDrop ? colors.primary : colors.textMuted}
                />
              </View>

              <View style={styles.couponRow}>
                <TextField
                  label=""
                  placeholder={`Coupon code`}
                  value={couponCode}
                  onChangeText={(t) => {
                    setCouponCode(t);
                    setCouponApplied(false);
                    setCouponError('');
                  }}
                  autoCapitalize="characters"
                  containerStyle={styles.couponField}
                  error={couponError}
                />
                <TouchableOpacity style={styles.applyBtn} onPress={applyCoupon}>
                  <Text style={styles.applyText}>{couponApplied ? 'Applied' : 'Apply'}</Text>
                </TouchableOpacity>
              </View>

              {totals.discount > 0 ? (
                <View style={styles.summaryRow}>
                  <Text style={styles.discountLabel}>
                    Coupon ({STRINGING_TEST_COUPON_CODE})
                  </Text>
                  <Text style={styles.discountValue}>-{formatPrice(totals.discount)}</Text>
                </View>
              ) : null}

              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatPrice(totals.total)}</Text>
              </View>
            </View>

            <Text style={styles.paymentLabel}>Pay Via</Text>
            <View style={styles.paymentOptions}>
              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  paymentMethod === 'upi' && styles.paymentOptionSelected,
                ]}
                onPress={() => setPaymentMethod('upi')}
              >
                <Ionicons
                  name="card-outline"
                  size={22}
                  color={paymentMethod === 'upi' ? colors.primary : colors.textMuted}
                />
                <Text
                  style={[
                    styles.paymentText,
                    paymentMethod === 'upi' && styles.paymentTextSelected,
                  ]}
                >
                  UPI / Online
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  paymentMethod === 'cash' && styles.paymentOptionSelected,
                ]}
                onPress={() => setPaymentMethod('cash')}
              >
                <Ionicons
                  name="cash-outline"
                  size={22}
                  color={paymentMethod === 'cash' ? colors.primary : colors.textMuted}
                />
                <Text
                  style={[
                    styles.paymentText,
                    paymentMethod === 'cash' && styles.paymentTextSelected,
                  ]}
                >
                  Cash
                </Text>
              </TouchableOpacity>
            </View>
            {errors.payment ? <Text style={styles.paymentError}>{errors.payment}</Text> : null}

            <View style={styles.customerSummary}>
              <Text style={styles.customerSummaryTitle}>Delivery Details</Text>
              <Text style={styles.customerSummaryText}>{fullName}</Text>
              <Text style={styles.customerSummaryText}>+91 {whatsapp}</Text>
              <Text style={styles.customerSummaryText}>{selectedLocation?.name}</Text>
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        {step > 0 ? (
          <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
            <Ionicons name="arrow-back" size={20} color={colors.text} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.backBtnPlaceholder} />
        )}
        <Button
          title={
            submitting
              ? 'Processing…'
              : step === formSteps.length - 1
                ? paymentMethod === 'upi'
                  ? 'Pay & Book'
                  : 'Confirm Booking'
                : 'Next Step'
          }
          onPress={handleNext}
          style={styles.nextBtn}
          disabled={submitting}
        />
      </View>

      <OptionPickerModal
        visible={pickerTarget?.type === 'string'}
        title="Select String"
        options={stringPickerOptions}
        selectedId={
          pickerTarget?.type === 'string'
            ? rackets.find((r) => r.id === pickerTarget.racketId)?.stringId
            : undefined
        }
        onSelect={(id) => {
          if (pickerTarget?.type === 'string') {
            updateRacket(pickerTarget.racketId, { stringId: id });
          }
        }}
        onClose={() => setPickerTarget(null)}
      />

      <OptionPickerModal
        visible={pickerTarget?.type === 'location'}
        title="Preferred Store Location"
        options={locationPickerOptions}
        selectedId={locationId}
        onSelect={setLocationId}
        onClose={() => setPickerTarget(null)}
      />

      <StringSpecsModal visible={showSpecs} onClose={() => setShowSpecs(false)} />

      {submitting ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  heading: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subheading: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  racketCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  racketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  racketTitle: {
    ...typography.h3,
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  half: {
    flex: 1,
  },
  inlineLabel: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignSelf: 'flex-start',
  },
  qtyBtn: {
    padding: spacing.sm + 2,
  },
  qtyValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
    minWidth: 28,
    textAlign: 'center',
  },
  addRacketBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radius.md,
    borderStyle: 'dashed',
    marginBottom: spacing.md,
  },
  addRacketText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '700',
  },
  specsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  specsTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
  },
  specsSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
  },
  summaryItem: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  summaryIndex: {
    ...typography.body,
    color: colors.textMuted,
    fontWeight: '700',
  },
  summaryItemTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    flex: 1,
  },
  summaryPrice: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '700',
  },
  summaryMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginLeft: spacing.lg,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  summaryValue: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.sm,
  },
  toggleInfo: {
    flex: 1,
    paddingRight: spacing.md,
  },
  toggleTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  toggleSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  couponRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  couponField: {
    flex: 1,
    minWidth: 0,
    marginBottom: 0,
  },
  applyBtn: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  applyText: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
  },
  discountLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  discountValue: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '700',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    marginTop: spacing.sm,
    marginBottom: 0,
  },
  totalLabel: {
    ...typography.h3,
    color: colors.text,
  },
  totalValue: {
    ...typography.h3,
    color: colors.primary,
  },
  paymentLabel: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  paymentOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
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
    borderColor: colors.border,
  },
  paymentOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceLight,
  },
  paymentText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    fontWeight: '600',
  },
  paymentTextSelected: {
    color: colors.primary,
  },
  paymentError: {
    ...typography.caption,
    color: colors.error,
    marginBottom: spacing.md,
  },
  customerSummary: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  customerSummaryTitle: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
    marginBottom: spacing.sm,
    letterSpacing: 0.5,
  },
  customerSummaryText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  backBtnPlaceholder: {
    width: 72,
  },
  backText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  nextBtn: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(6, 13, 24, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
