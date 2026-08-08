import { View, Text, StyleSheet, TouchableOpacity, Animated, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radius } from '../constants/theme';
import { openWhatsApp, openPhone } from '../utils/linking';

const DELIVERY_LOCATION = 'Gaur City 1, Greater Noida West';

type Props = {
  scrollY: Animated.Value;
  onSearchPress: () => void;
  onLocationPress?: () => void;
};

export function HomeHeader({ scrollY, onSearchPress, onLocationPress }: Props) {
  const insets = useSafeAreaInsets();

  const backgroundOpacity = scrollY.interpolate({
    inputRange: [0, 60, 120],
    outputRange: [0, 0.92, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top }]} pointerEvents="box-none">
      <Animated.View style={[styles.solidBg, { opacity: backgroundOpacity }]} />

      <View style={styles.content}>
        <View style={styles.topRow}>
          <TouchableOpacity
            style={styles.locationBlock}
            onPress={onLocationPress}
            activeOpacity={0.8}
          >
            <Text style={styles.deliverLabel}>Service Location</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={14} color={colors.primary} />
              <Text style={styles.locationText} numberOfLines={1}>
                {DELIVERY_LOCATION}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => openWhatsApp()}>
              <Ionicons name="logo-whatsapp" size={19} color={colors.whatsapp} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={openPhone}>
              <Ionicons name="call" size={18} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.searchWrap, pressed && styles.searchPressed]}
          onPress={onSearchPress}
          accessibilityRole="search"
          accessibilityLabel="Search products and services"
        >
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <Text style={styles.searchPlaceholder}>Search bats, stringing, gear, services…</Text>
        </Pressable>
      </View>
    </View>
  );
}

export const HOME_HEADER_HEIGHT = 118;

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  solidBg: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.overlay,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm + 4,
    gap: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  locationBlock: {
    flex: 1,
  },
  deliverLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
    marginBottom: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.md,
    height: 44,
  },
  searchPressed: {
    backgroundColor: colors.surfaceLight,
    borderColor: colors.primary,
  },
  searchPlaceholder: {
    flex: 1,
    ...typography.body,
    color: colors.textMuted,
  },
});
