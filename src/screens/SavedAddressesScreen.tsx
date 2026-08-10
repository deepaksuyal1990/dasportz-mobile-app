import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../components/Button';
import { CloseButton } from '../components/CloseButton';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, typography, radius } from '../constants/theme';
import type { SavedAddress } from '../types/auth';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'SavedAddresses'>;

function createAddressId() {
  return `addr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

export function SavedAddressesScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { user, updateProfile } = useAuth();
  const addresses = user?.savedAddresses ?? [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [label, setLabel] = useState('Home');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [saving, setSaving] = useState(false);

  function openAdd() {
    setEditingId(null);
    setLabel('Home');
    setLine1(user?.address ?? '');
    setLine2('');
    setCity(user?.city ?? 'Greater Noida West');
    setPincode('');
    setModalOpen(true);
  }

  function openEdit(addr: SavedAddress) {
    setEditingId(addr.id);
    setLabel(addr.label);
    setLine1(addr.line1);
    setLine2(addr.line2 ?? '');
    setCity(addr.city);
    setPincode(addr.pincode ?? '');
    setModalOpen(true);
  }

  async function saveAddress() {
    if (!user) return;
    if (!line1.trim() || !city.trim()) {
      Alert.alert('Missing details', 'Address line and city are required.');
      return;
    }
    setSaving(true);
    try {
      const next: SavedAddress = {
        id: editingId ?? createAddressId(),
        label: label.trim() || 'Address',
        line1: line1.trim(),
        line2: line2.trim() || undefined,
        city: city.trim(),
        pincode: pincode.trim() || undefined,
        isDefault: editingId
          ? addresses.find((a) => a.id === editingId)?.isDefault
          : addresses.length === 0,
      };

      const list = editingId
        ? addresses.map((a) => (a.id === editingId ? next : a))
        : [...addresses, next];

      await updateProfile({ savedAddresses: list });
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function setDefault(id: string) {
    if (!user) return;
    await updateProfile({
      savedAddresses: addresses.map((a) => ({ ...a, isDefault: a.id === id })),
    });
  }

  function confirmDelete(id: string) {
    Alert.alert('Delete address', 'Remove this saved address?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (!user) return;
          await updateProfile({
            savedAddresses: addresses.filter((a) => a.id !== id),
          });
        },
      },
    ]);
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved addresses</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={openAdd} hitSlop={12}>
            <Ionicons name="add" size={26} color={colors.primary} />
          </TouchableOpacity>
          <CloseButton />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {addresses.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="location-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No saved addresses</Text>
            <Text style={styles.emptyText}>
              Add a home or office address for faster checkout and delivery.
            </Text>
            <Button title="Add address" onPress={openAdd} style={styles.emptyBtn} />
          </View>
        ) : (
          addresses.map((addr) => (
            <View key={addr.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>{addr.label}</Text>
                  {addr.isDefault ? (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>DEFAULT</Text>
                    </View>
                  ) : null}
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity onPress={() => openEdit(addr)} hitSlop={8}>
                    <Ionicons name="create-outline" size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => confirmDelete(addr.id)} hitSlop={8}>
                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.line}>{addr.line1}</Text>
              {addr.line2 ? <Text style={styles.line}>{addr.line2}</Text> : null}
              <Text style={styles.line}>
                {addr.city}
                {addr.pincode ? ` · ${addr.pincode}` : ''}
              </Text>
              {!addr.isDefault ? (
                <TouchableOpacity onPress={() => void setDefault(addr.id)}>
                  <Text style={styles.setDefault}>Set as default</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={modalOpen} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setModalOpen(false)}>
          <Pressable style={[styles.modalSheet, { paddingBottom: insets.bottom + spacing.lg }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingId ? 'Edit address' : 'Add address'}</Text>
              <CloseButton onPress={() => setModalOpen(false)} />
            </View>
            <Field label="Label" value={label} onChangeText={setLabel} placeholder="Home / Office" />
            <Field label="Address line 1" value={line1} onChangeText={setLine1} />
            <Field label="Address line 2" value={line2} onChangeText={setLine2} placeholder="Optional" />
            <Field label="City" value={city} onChangeText={setCity} />
            <Field
              label="Pincode"
              value={pincode}
              onChangeText={setPincode}
              placeholder="Optional"
              keyboardType="number-pad"
            />
            <Button
              title={saving ? 'Saving…' : 'Save address'}
              onPress={saveAddress}
              disabled={saving}
              style={styles.saveBtn}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'number-pad';
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType}
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
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl, flexGrow: 1 },
  empty: { alignItems: 'center', paddingTop: spacing.xxl },
  emptyTitle: { ...typography.h3, color: colors.text, marginTop: spacing.md },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  emptyBtn: { minWidth: 180 },
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
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  label: { ...typography.bodySmall, color: colors.text, fontWeight: '800' },
  defaultBadge: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  defaultText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  actions: { flexDirection: 'row', gap: spacing.md },
  line: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
  setDefault: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
  },
  modalTitle: { ...typography.h3, color: colors.text },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  field: { marginBottom: spacing.md },
  fieldLabel: { ...typography.caption, color: colors.textMuted, marginBottom: 6 },
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
  saveBtn: { marginTop: spacing.sm },
});
