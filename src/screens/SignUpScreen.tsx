import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { TextField } from '../components/TextField';
import { SelectField } from '../components/SelectField';
import { OptionPickerModal } from '../components/OptionPickerModal';
import { ProfileAvatar } from '../components/ProfileAvatar';
import { SignUpCompleteModal } from '../components/SignUpCompleteModal';
import { useAuth } from '../context/AuthContext';
import { COUNTRY_OPTIONS, DEFAULT_COUNTRY_ID, countryLabel } from '../data/countries';
import { storeLocations } from '../data/stringing';
import { colors, spacing, typography, radius } from '../constants/theme';
import { composeFullName } from '../utils/name';
import {
  isValidEmail,
  isValidNamePart,
  isValidPhone,
  isValidRequiredText,
} from '../utils/name';
import { pickProfilePhotoUri } from '../utils/pickProfilePhoto';
import { getProfileFormPrefill } from '../utils/profilePrefill';
import { navigateAfterAuth } from '../utils/navHelpers';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

const BENEFITS = [
  { icon: 'receipt-outline' as const, label: 'Order history' },
  { icon: 'location-outline' as const, label: 'Saved addresses' },
  { icon: 'flash-outline' as const, label: 'Faster checkout' },
];

export function SignUpScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { signUp, user } = useAuth();
  const prefill = getProfileFormPrefill(user);

  const [firstName, setFirstName] = useState(prefill?.firstName ?? '');
  const [middleName, setMiddleName] = useState(prefill?.middleName ?? '');
  const [lastName, setLastName] = useState(prefill?.lastName ?? '');
  const [phone, setPhone] = useState(prefill?.phone ?? '');
  const [email, setEmail] = useState(prefill?.email ?? '');
  const [city, setCity] = useState(prefill?.city || 'Greater Noida West');
  const [countryCode, setCountryCode] = useState(prefill?.countryCode || DEFAULT_COUNTRY_ID);
  const [storeId, setStoreId] = useState(
    prefill?.preferredStoreId && storeLocations.some((l) => l.id === prefill.preferredStoreId)
      ? prefill.preferredStoreId
      : '',
  );
  const [photoUri, setPhotoUri] = useState<string | undefined>(user?.photoUri);
  const [showStorePicker, setShowStorePicker] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const p = getProfileFormPrefill(user);
    if (!p) return;
    setFirstName((prev) => prev.trim() || p.firstName);
    setMiddleName((prev) => prev.trim() || p.middleName);
    setLastName((prev) => prev.trim() || p.lastName);
    setPhone((prev) => prev.replace(/\D/g, '') || p.phone);
    setEmail((prev) => prev.trim() || p.email);
    setCity((prev) => prev.trim() || p.city || 'Greater Noida West');
    setCountryCode((prev) => prev || p.countryCode || DEFAULT_COUNTRY_ID);
    if (p.preferredStoreId && storeLocations.some((l) => l.id === p.preferredStoreId)) {
      setStoreId((prev) => prev || p.preferredStoreId!);
    }
    if (user?.photoUri) setPhotoUri((prev) => prev || user.photoUri);
  }, [user]);

  async function pickPhoto() {
    const uri = await pickProfilePhotoUri();
    if (uri) setPhotoUri(uri);
  }

  function validate() {
    const next: Record<string, string> = {};
    const firstErr = isValidNamePart(firstName, { required: true });
    const middleErr = isValidNamePart(middleName, { required: false });
    const lastErr = isValidNamePart(lastName, { required: false });
    const phoneErr = isValidPhone(phone);
    const emailErr = isValidEmail(email);
    const cityErr = isValidRequiredText(city, 'City');
    if (firstErr) next.firstName = firstErr;
    if (middleErr) next.middleName = middleErr;
    if (lastErr) next.lastName = lastErr;
    if (phoneErr) next.phone = phoneErr;
    if (emailErr) next.email = emailErr;
    if (cityErr) next.city = cityErr;
    if (!countryCode) next.country = 'Country is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit() {
    if (!validate() || submitting) return;
    setSubmitting(true);
    try {
      await signUp({
        firstName,
        middleName: middleName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        phone,
        email,
        city,
        country: countryLabel(countryCode),
        countryCode,
        preferredStoreId: storeId || undefined,
        photoUri,
      });
      setShowComplete(true);
    } catch (err) {
      Alert.alert('Sign up failed', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function finishSignUp() {
    setShowComplete(false);
    navigateAfterAuth(navigation);
  }

  const selectedStore = storeLocations.find((s) => s.id === storeId);
  const displayName = composeFullName(firstName, middleName, lastName);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xxl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <Text style={styles.eyebrow}>JOIN DA SPORTZ</Text>
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>
            Save your details once for faster bookings, orders, and updates.
          </Text>
          <View style={styles.benefitRow}>
            {BENEFITS.map((item) => (
              <View key={item.label} style={styles.benefitChip}>
                <Ionicons name={item.icon} size={13} color={colors.primary} />
                <Text style={styles.benefitText}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.photoCard}>
          <ProfileAvatar uri={photoUri} size={88} editable onPress={pickPhoto} />
          <View style={styles.photoCopy}>
            <Text style={styles.photoTitle}>Profile photo</Text>
            <Text style={styles.photoSub}>Optional — helps our team recognise you in-store.</Text>
            <TouchableOpacity onPress={pickPhoto} activeOpacity={0.85}>
              <Text style={styles.photoLink}>{photoUri ? 'Change photo' : 'Add photo'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionLabel}>YOUR DETAILS</Text>
        <View style={styles.formCard}>
          <TextField
            label="First name"
            required
            value={firstName}
            onChangeText={setFirstName}
            placeholder="First name"
            autoCapitalize="words"
            error={errors.firstName}
            containerStyle={styles.fieldTight}
          />
          <TextField
            label="Middle name"
            value={middleName}
            onChangeText={setMiddleName}
            placeholder="Optional"
            autoCapitalize="words"
            error={errors.middleName}
            containerStyle={styles.fieldTight}
          />
          <TextField
            label="Last name"
            value={lastName}
            onChangeText={setLastName}
            placeholder="Optional"
            autoCapitalize="words"
            error={errors.lastName}
            containerStyle={styles.fieldTight}
          />
          <TextField
            label="Mobile number"
            required
            value={phone}
            onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, '').slice(0, 10))}
            keyboardType="phone-pad"
            placeholder="10-digit WhatsApp number"
            error={errors.phone}
            containerStyle={styles.fieldTight}
          />
          <TextField
            label="Email"
            required
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="you@email.com"
            error={errors.email}
            containerStyle={styles.fieldLast}
          />
        </View>

        <Text style={styles.sectionLabel}>PREFERENCES</Text>
        <View style={styles.formCard}>
          <TextField
            label="City / area"
            required
            value={city}
            onChangeText={setCity}
            placeholder="Greater Noida West"
            error={errors.city}
            containerStyle={styles.fieldTight}
          />
          <SelectField
            label="Country"
            required
            value={countryLabel(countryCode)}
            placeholder="Select country"
            onPress={() => setShowCountryPicker(true)}
            error={errors.country}
            containerStyle={styles.fieldTight}
          />
          <SelectField
            label="Preferred store"
            value={selectedStore?.name ?? ''}
            placeholder="Optional"
            onPress={() => setShowStorePicker(true)}
          />
        </View>

        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSubmit}
          activeOpacity={0.9}
          disabled={submitting}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.submitGradient, submitting && styles.submitDisabled]}
          >
            <Text style={styles.submitText}>{submitting ? 'Creating…' : 'Create account'}</Text>
            {!submitting ? (
              <Ionicons name="arrow-forward" size={18} color={colors.background} />
            ) : null}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginRow}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.85}
        >
          <Text style={styles.loginText}>Already have an account?</Text>
          <Text style={styles.loginLink}> Log in</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.guestBtn}
          onPress={() => navigation.navigate('GuestLogin')}
          activeOpacity={0.85}
        >
          <Ionicons name="phone-portrait-outline" size={15} color={colors.textMuted} />
          <Text style={styles.guestText}>Continue as guest with mobile</Text>
        </TouchableOpacity>
      </ScrollView>

      <OptionPickerModal
        visible={showStorePicker}
        title="Preferred Store"
        options={storeLocations.map((l) => ({ id: l.id, label: l.name }))}
        selectedId={storeId}
        onSelect={setStoreId}
        onClose={() => setShowStorePicker(false)}
      />
      <OptionPickerModal
        visible={showCountryPicker}
        title="Country"
        options={COUNTRY_OPTIONS.map((c) => ({ id: c.id, label: c.label }))}
        selectedId={countryCode}
        onSelect={setCountryCode}
        onClose={() => setShowCountryPicker(false)}
      />

      <SignUpCompleteModal
        visible={showComplete}
        customerName={displayName}
        onContinue={finishSignUp}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  screen: { flex: 1 },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  intro: {
    marginBottom: spacing.lg,
  },
  eyebrow: {
    ...typography.label,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.h1,
    color: colors.text,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  benefitRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  benefitChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.sm - 2,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.22)',
  },
  benefitText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '700',
  },
  photoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  photoCopy: {
    flex: 1,
  },
  photoTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
  },
  photoSub: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: spacing.sm,
    lineHeight: 16,
  },
  photoLink: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '800',
  },
  sectionLabel: {
    ...typography.label,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  fieldTight: {
    marginBottom: spacing.md,
  },
  fieldLast: {
    marginBottom: 0,
  },
  submitBtn: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md + 2,
  },
  submitDisabled: {
    opacity: 0.7,
  },
  submitText: {
    ...typography.body,
    color: colors.background,
    fontWeight: '800',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  loginText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  loginLink: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '800',
  },
  guestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  guestText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
  },
});
