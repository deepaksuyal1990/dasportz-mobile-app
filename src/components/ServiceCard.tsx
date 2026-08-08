import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../constants/theme';
import type { Service } from '../data/content';

type Props = {
  service: Service;
  onPress: () => void;
};

const iconMap: Record<Service['icon'], keyof typeof Ionicons.glyphMap> = {
  tennisball: 'tennisball',
  hammer: 'hammer',
  'hand-left': 'hand-left',
  construct: 'construct',
};

export function ServiceCard({ service, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: `${service.gradient[1]}33` }]}>
          <Ionicons name={iconMap[service.icon]} size={24} color={service.gradient[1]} />
        </View>
        <View style={styles.badges}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{service.badge}</Text>
          </View>
          {service.pickup ? (
            <View style={[styles.badge, styles.pickupBadge]}>
              <Ionicons name="car-outline" size={12} color={colors.accent} />
              <Text style={[styles.badgeText, styles.pickupText]}>Pickup</Text>
            </View>
          ) : null}
        </View>
      </View>
      <Text style={styles.title}>{service.title}</Text>
      <Text style={styles.turnaround}>{service.turnaround}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {service.description}
      </Text>
      <View style={styles.features}>
        {service.features.slice(0, 2).map((feature) => (
          <View key={feature} style={styles.featureChip}>
            <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badges: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  badge: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  pickupBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  pickupText: {
    color: colors.accent,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  turnaround: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  featureText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
