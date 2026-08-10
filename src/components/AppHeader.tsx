import { View, Text, StyleSheet, TouchableOpacity, Animated, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radius } from '../constants/theme';
import { openWhatsApp } from '../utils/linking';
import { useUserLocationLabel } from '../hooks/useUserLocationLabel';
import { NotificationBell } from './NotificationBell';
import type { RootStackParamList } from '../navigation/types';

/** Content height below safe-area inset (location row + search + gaps). */
export const APP_HEADER_CONTENT_HEIGHT = 112;

type Props = {
  /** Home hero uses scroll fade; other pages use a solid bar. */
  variant?: 'overlay' | 'solid';
  scrollY?: Animated.Value;
  onSearchPress?: () => void;
  /** Override search field hint (Products / Services / Home). */
  searchPlaceholder?: string;
};

/**
 * Shared app header — user location, actions, search.
 * Used on Home / Products / Services — not Profile or Contact.
 */
export function AppHeader({
  variant = 'solid',
  scrollY,
  onSearchPress,
  searchPlaceholder = 'Search sports gear & services…',
}: Props) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { label: locationLabel, loading: locating, refresh: refreshLocation } =
    useUserLocationLabel();

  const openSearch = onSearchPress ?? (() => navigation.navigate('Search'));

  const backgroundOpacity =
    variant === 'overlay' && scrollY
      ? scrollY.interpolate({
          inputRange: [0, 60, 120],
          outputRange: [0, 0.92, 1],
          extrapolate: 'clamp',
        })
      : undefined;

  return (
    <View
      style={[
        styles.wrapper,
        variant === 'solid' && styles.wrapperSolid,
        { paddingTop: insets.top },
      ]}
      pointerEvents="box-none"
    >
      {variant === 'overlay' && backgroundOpacity ? (
        <Animated.View style={[styles.fadeBg, { opacity: backgroundOpacity }]} />
      ) : null}
      {variant === 'solid' ? <View style={styles.solidBg} /> : null}

      <View style={styles.content}>
        <View style={styles.topRow}>
          <TouchableOpacity
            style={styles.locationChip}
            onPress={refreshLocation}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`Your location, ${locationLabel}. Tap to refresh.`}
          >
            <Ionicons
              name={locating ? 'navigate-circle-outline' : 'locate'}
              size={14}
              color={colors.primary}
            />
            <Text style={styles.locationText} numberOfLines={1}>
              {locationLabel}
            </Text>
            <Ionicons name="refresh" size={12} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.actions}>
            <NotificationBell />
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => openWhatsApp()}
              accessibilityRole="button"
              accessibilityLabel="WhatsApp"
            >
              <Ionicons name="logo-whatsapp" size={18} color={colors.whatsapp} />
            </TouchableOpacity>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.searchWrap, pressed && styles.searchPressed]}
          onPress={openSearch}
          accessibilityRole="search"
          accessibilityLabel={searchPlaceholder}
        >
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <Text style={styles.searchPlaceholder} numberOfLines={1}>
            {searchPlaceholder}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

/** @deprecated Prefer AppHeader — kept for existing Home imports. */
export function HomeHeader(props: Props) {
  return <AppHeader variant="overlay" {...props} />;
}

export const HOME_HEADER_HEIGHT = APP_HEADER_CONTENT_HEIGHT;

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  wrapperSolid: {
    position: 'relative',
  },
  fadeBg: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.overlay,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  solidBg: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm + 2,
    gap: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    minHeight: 38,
  },
  locationChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },
  locationText: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
    flexShrink: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
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
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.md,
    height: 42,
  },
  searchPressed: {
    backgroundColor: colors.surfaceLight,
    borderColor: colors.primary,
  },
  searchPlaceholder: {
    flex: 1,
    ...typography.bodySmall,
    color: colors.textMuted,
  },
});
