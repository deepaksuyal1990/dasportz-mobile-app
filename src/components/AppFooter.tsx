import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { business } from '../data/content';
import { colors, spacing, typography, radius } from '../constants/theme';
import { openMaps, openPhone, openEmail } from '../utils/linking';

const CURRENT_YEAR = new Date().getFullYear();

type Props = {
  showLinks?: boolean;
};

export function AppFooter({ showLinks = true }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.divider} />

      <View style={styles.brandRow}>
        <View style={styles.brandDot} />
        <Text style={styles.brandName}>{business.name}</Text>
      </View>

      <Text style={styles.tagline}>{business.tagline}</Text>

      {showLinks ? (
        <View style={styles.links}>
          <FooterLink icon="location-outline" label="Store" onPress={openMaps} />
          <View style={styles.linkDivider} />
          <FooterLink icon="call-outline" label="Call" onPress={openPhone} />
          <View style={styles.linkDivider} />
          <FooterLink icon="mail-outline" label="Email" onPress={() => openEmail()} />
        </View>
      ) : null}

      <Text style={styles.copyright}>
        © {CURRENT_YEAR} {business.legalEntity}. All rights reserved.
      </Text>
      <Text style={styles.powered}>Powered by {business.poweredBy}</Text>
    </View>
  );
}

function FooterLink({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.linkItem} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name={icon} size={14} color={colors.textMuted} />
      <Text style={styles.linkLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  divider: {
    width: 48,
    height: 3,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    marginBottom: spacing.lg,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  brandDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  brandName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tagline: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 18,
  },
  links: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
  },
  linkLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  linkDivider: {
    width: 1,
    height: 14,
    backgroundColor: colors.border,
  },
  copyright: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  powered: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
