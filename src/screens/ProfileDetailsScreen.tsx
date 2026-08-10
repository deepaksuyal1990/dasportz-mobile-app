import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../components/Button';
import { CloseButton } from '../components/CloseButton';
import { SelectField } from '../components/SelectField';
import { OptionPickerModal } from '../components/OptionPickerModal';
import { useAuth } from '../context/AuthContext';
import { COUNTRY_OPTIONS, DEFAULT_COUNTRY_ID, countryLabel } from '../data/countries';
import { storeLocations } from '../data/stringing';
import { colors, spacing, typography, radius } from '../constants/theme';
import { composeFullName, splitFullName } from '../utils/name';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileDetails'>;

const genderOptions = [
  { id: 'male', label: 'Male' },
  { id: 'female', label: 'Female' },
  { id: 'other', label: 'Other' },
  { id: 'prefer_not', label: 'Prefer not to say' },
];

export function ProfileDetailsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { user, updateProfile } = useAuth();

  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [countryCode, setCountryCode] = useState<string>(DEFAULT_COUNTRY_ID);
  const [address, setAddress] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [storeId, setStoreId] = useState('');
  const [showStorePicker, setShowStorePicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!user) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + spacing.lg }]}>
        <Text style={styles.empty}>Please log in to view profile details.</Text>
      </View>
    );
  }

  function startEdit() {
    const split = splitFullName(user!.fullName);
    setFirstName(user!.firstName || split.firstName);
    setMiddleName(user!.middleName || split.middleName);
    setLastName(user!.lastName || split.lastName);
    setEmail(user!.email);
    setCity(user!.city ?? '');
    setCountryCode(user!.countryCode || DEFAULT_COUNTRY_ID);
    setAddress(user!.address ?? '');
    setDateOfBirth(user!.dateOfBirth ?? '');
    setGender(user!.gender ?? '');
    setStoreId(user!.preferredStoreId ?? '');
    setEditing(true);
  }

  async function saveEdit() {
    if (saving) return;
    setSaving(true);
    try {
      const nextFirst = firstName.trim() || user!.firstName || splitFullName(user!.fullName).firstName;
      const nextMiddle = middleName.trim() || undefined;
      const nextLast = lastName.trim() || user!.lastName || splitFullName(user!.fullName).lastName;
      await updateProfile({
        firstName: nextFirst,
        middleName: nextMiddle,
        lastName: nextLast,
        fullName: composeFullName(nextFirst, nextMiddle, nextLast),
        email: email.trim() || user!.email,
        city: city.trim() || undefined,
        country: countryLabel(countryCode),
        countryCode,
        address: address.trim() || undefined,
        dateOfBirth: dateOfBirth.trim() || undefined,
        gender: gender || undefined,
        preferredStoreId: storeId || undefined,
      });
      setEditing(false);
    } catch (err) {
      Alert.alert('Update failed', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const storeName = storeLocations.find(
    (s) => s.id === (editing ? storeId : user.preferredStoreId),
  )?.name;
  const genderLabel = genderOptions.find((g) => g.id === (editing ? gender : user.gender))?.label;
  const viewCountry =
    user.country || countryLabel(user.countryCode) || '—';
  const viewNameParts = {
    first: user.firstName || splitFullName(user.fullName).firstName || '—',
    middle: user.middleName || splitFullName(user.fullName).middleName || '—',
    last: user.lastName || splitFullName(user.fullName).lastName || '—',
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile details</Text>
        <View style={styles.headerRight}>
          {!editing ? (
            <TouchableOpacity onPress={startEdit}>
              <Text style={styles.editLink}>Edit</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setEditing(false)}>
              <Text style={styles.editLink}>Cancel</Text>
            </TouchableOpacity>
          )}
          <CloseButton />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {editing ? (
            <>
              <Field label="First name" value={firstName} onChangeText={setFirstName} />
              <Field label="Middle name" value={middleName} onChangeText={setMiddleName} />
              <Field label="Last name" value={lastName} onChangeText={setLastName} />
              <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
              <ReadonlyRow label="Phone" value={`+91 ${user.phone}`} />
              <Field label="City" value={city} onChangeText={setCity} />
              <SelectField
                label="Country"
                value={countryLabel(countryCode)}
                placeholder="Select country"
                onPress={() => setShowCountryPicker(true)}
              />
              <Field label="Address" value={address} onChangeText={setAddress} multiline />
              <Field
                label="Date of birth"
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                placeholder="DD/MM/YYYY"
              />
              <SelectField
                label="Gender"
                value={genderLabel ?? ''}
                placeholder="Select"
                onPress={() => setShowGenderPicker(true)}
              />
              <SelectField
                label="Preferred store"
                value={storeName ?? ''}
                placeholder="Select store"
                onPress={() => setShowStorePicker(true)}
              />
              <Button
                title={saving ? 'Saving…' : 'Save changes'}
                onPress={saveEdit}
                disabled={saving}
                style={styles.saveBtn}
              />
            </>
          ) : (
            <>
              <ReadonlyRow label="First name" value={viewNameParts.first} />
              <ReadonlyRow label="Middle name" value={viewNameParts.middle} />
              <ReadonlyRow label="Last name" value={viewNameParts.last} />
              <ReadonlyRow label="Phone" value={`+91 ${user.phone}`} />
              <ReadonlyRow label="Email" value={user.email} />
              <ReadonlyRow label="City" value={user.city || '—'} />
              <ReadonlyRow label="Country" value={viewCountry} />
              <ReadonlyRow label="Address" value={user.address || '—'} />
              <ReadonlyRow label="Date of birth" value={user.dateOfBirth || '—'} />
              <ReadonlyRow label="Gender" value={genderLabel || '—'} />
              <ReadonlyRow label="Preferred store" value={storeName || '—'} />
            </>
          )}
        </View>
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
        visible={showGenderPicker}
        title="Gender"
        options={genderOptions}
        selectedId={gender || undefined}
        onSelect={setGender}
        onClose={() => setShowGenderPicker(false)}
      />
      <OptionPickerModal
        visible={showCountryPicker}
        title="Country"
        options={COUNTRY_OPTIONS.map((c) => ({ id: c.id, label: c.label }))}
        selectedId={countryCode}
        onSelect={setCountryCode}
        onClose={() => setShowCountryPicker(false)}
      />
    </View>
  );
}

function ReadonlyRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address';
  multiline?: boolean;
}) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.rowLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType}
        multiline={multiline}
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
  headerTitle: { ...typography.h3, color: colors.text, flex: 1, textAlign: 'center' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  editLink: { ...typography.bodySmall, color: colors.primary, fontWeight: '700' },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  empty: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  row: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  rowLabel: { ...typography.caption, color: colors.textMuted, marginBottom: 4 },
  rowValue: { ...typography.bodySmall, color: colors.text, fontWeight: '600' },
  fieldBlock: { paddingVertical: spacing.sm },
  input: {
    ...typography.bodySmall,
    color: colors.text,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  inputMultiline: { minHeight: 72, textAlignVertical: 'top' },
  saveBtn: { marginVertical: spacing.md },
});
