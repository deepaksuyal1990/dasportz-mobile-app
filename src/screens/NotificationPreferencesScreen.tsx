import { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, typography, radius } from '../constants/theme';
import { CloseButton } from '../components/CloseButton';
import { DEFAULT_NOTIFICATION_PREFS, type NotificationPreferences } from '../types/auth';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'NotificationPreferences'>;

const CHANNELS: Array<{
  key: keyof NotificationPreferences;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  {
    key: 'email',
    title: 'Email',
    subtitle: 'Order updates and offers by email',
    icon: 'mail-outline',
  },
  {
    key: 'whatsapp',
    title: 'WhatsApp',
    subtitle: 'Booking alerts and readiness messages',
    icon: 'logo-whatsapp',
  },
  {
    key: 'sms',
    title: 'SMS',
    subtitle: 'Text messages for important updates',
    icon: 'chatbubble-outline',
  },
];

export function NotificationPreferencesScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { user, updateProfile } = useAuth();

  const prefs = useMemo(
    () => ({ ...DEFAULT_NOTIFICATION_PREFS, ...user?.notificationPrefs }),
    [user?.notificationPrefs],
  );

  async function toggle(key: keyof NotificationPreferences, value: boolean) {
    if (!user) return;
    await updateProfile({
      notificationPrefs: { ...prefs, [key]: value },
    });
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Preferences</Text>
        <CloseButton />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>Notifications</Text>
        <Text style={styles.sectionHint}>
          Choose how DA SPORTZ can reach you about orders and bookings.
        </Text>

        <View style={styles.card}>
          {CHANNELS.map((channel, index) => (
            <View
              key={channel.key}
              style={[styles.row, index === CHANNELS.length - 1 && styles.rowLast]}
            >
              <View style={styles.iconWrap}>
                <Ionicons
                  name={channel.icon}
                  size={20}
                  color={channel.key === 'whatsapp' ? colors.whatsapp : colors.primary}
                />
              </View>
              <View style={styles.textWrap}>
                <Text style={styles.title}>{channel.title}</Text>
                <Text style={styles.subtitle}>{channel.subtitle}</Text>
              </View>
              <Switch
                value={prefs[channel.key]}
                onValueChange={(v) => void toggle(channel.key, v)}
                trackColor={{ false: colors.border, true: colors.primaryDark }}
                thumbColor={prefs[channel.key] ? colors.primary : colors.textMuted}
              />
            </View>
          ))}
        </View>
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
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  sectionLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  sectionHint: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: spacing.md,
  },
  rowLast: { borderBottomWidth: 0 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: { flex: 1 },
  title: { ...typography.bodySmall, color: colors.text, fontWeight: '700' },
  subtitle: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
});
