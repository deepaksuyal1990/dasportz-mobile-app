import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radius } from '../constants/theme';
import { ServiceSportIcon } from './ServiceSportIcon';
import type { Service } from '../data/content';

type Props = {
  service: Service;
  onPress: () => void;
};

export function ServiceRow({ service, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.85}>
      <ImageBackground
        source={service.image}
        style={styles.icon}
        imageStyle={styles.iconImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={[`${service.gradient[0]}CC`, `${service.gradient[1]}EE`]}
          style={styles.iconOverlay}
        >
          <ServiceSportIcon icon={service.icon} size={22} color={colors.white} />
        </LinearGradient>
      </ImageBackground>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{service.title}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{service.badge}</Text>
          </View>
        </View>
        <Text style={styles.meta}>{service.turnaround}</Text>
      </View>
      <Ionicons name="arrow-forward-circle" size={28} color={colors.surfaceLight} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: spacing.md,
  },
  icon: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  iconImage: {
    borderRadius: radius.md,
  },
  iconOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
    marginBottom: 2,
  },
  title: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
  },
  badge: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  meta: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
});
