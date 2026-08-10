import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../constants/theme';
import { ServiceSportIcon } from './ServiceSportIcon';
import type { Service } from '../data/content';

const { width: SCREEN_W } = Dimensions.get('window');

type Props = {
  service: Service;
  onPress: () => void;
  variant?: 'featured' | 'compact';
  width?: number;
};

export function ServiceCard({ service, onPress, variant = 'featured', width }: Props) {
  if (variant === 'compact') {
    return (
      <TouchableOpacity
        style={[styles.compact, width ? { width } : null]}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <ImageBackground
          source={service.image}
          style={styles.compactImage}
          imageStyle={styles.compactImageStyle}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(6,13,24,0.2)', 'rgba(6,13,24,0.92)']}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={[`${service.gradient[0]}55`, `${service.gradient[1]}22`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.compactIcon, { backgroundColor: service.gradient[1] }]}>
            <ServiceSportIcon icon={service.icon} size={18} color={colors.white} />
          </View>
          <Text style={styles.compactTitle} numberOfLines={2}>
            {service.title}
          </Text>
          <Text style={styles.compactMeta}>{service.turnaround}</Text>
        </ImageBackground>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.featured} onPress={onPress} activeOpacity={0.92}>
      <ImageBackground
        source={service.image}
        style={styles.featuredImage}
        imageStyle={styles.featuredImageStyle}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(6,13,24,0.15)', 'rgba(6,13,24,0.88)']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.featuredTop}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{service.badge}</Text>
          </View>
          {service.pickup ? (
            <View style={[styles.badge, styles.pickupBadge]}>
              <Ionicons name="car-outline" size={12} color={colors.accent} />
              <Text style={[styles.badgeText, styles.pickupText]}>Free pickup</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.featuredBody}>
          <View style={[styles.featuredIcon, { backgroundColor: service.gradient[1] }]}>
            <ServiceSportIcon icon={service.icon} size={24} color={colors.white} />
          </View>
          <Text style={styles.featuredTitle}>{service.title}</Text>
          <Text style={styles.featuredTurnaround}>{service.turnaround}</Text>
          <Text style={styles.featuredDesc} numberOfLines={2}>
            {service.description}
          </Text>
          <View style={styles.featuredCta}>
            <Text style={styles.featuredCtaText}>Book now</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.white} />
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  featured: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.sm,
  },
  featuredImage: {
    minHeight: 240,
    width: SCREEN_W - spacing.lg * 2,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  featuredImageStyle: {
    borderRadius: radius.xl,
  },
  featuredTop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  badge: {
    backgroundColor: 'rgba(6,13,24,0.72)',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  pickupBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '700',
  },
  pickupText: {
    color: colors.accent,
  },
  featuredBody: {
    marginTop: spacing.xl,
  },
  featuredIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  featuredTitle: {
    ...typography.h2,
    color: colors.white,
    marginBottom: 4,
  },
  featuredTurnaround: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  featuredDesc: {
    ...typography.bodySmall,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  featuredCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  featuredCtaText: {
    ...typography.bodySmall,
    color: colors.white,
    fontWeight: '800',
  },
  compact: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  compactImage: {
    minHeight: 156,
    padding: spacing.md,
    justifyContent: 'flex-end',
  },
  compactImageStyle: {
    borderRadius: radius.lg,
  },
  compactIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  compactTitle: {
    ...typography.bodySmall,
    color: colors.white,
    fontWeight: '800',
    lineHeight: 18,
  },
  compactMeta: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
    marginTop: 6,
  },
});
