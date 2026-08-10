import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';
import { productCategories } from '../data/content';
import { colors, spacing, typography, radius } from '../constants/theme';
import { navigateToCategory } from '../utils/navigation';
import { openPhone, openWhatsApp } from '../utils/linking';
import type { ProductsStackScreenProps } from '../navigation/types';

type Props = ProductsStackScreenProps<'ProductsMain'>;

const { width: SCREEN_W } = Dimensions.get('window');
const GRID_GAP = spacing.sm;
const TILE_W = (SCREEN_W - spacing.lg * 2 - GRID_GAP) / 2;

const [featuredCategory, ...otherCategories] = productCategories;

const highlights = [
  { icon: 'shield-checkmark' as const, label: 'Official brands' },
  { icon: 'cube-outline' as const, label: 'Bulk orders' },
  { icon: 'flash-outline' as const, label: 'Fast delivery' },
];

export function ProductsScreen({ navigation }: Props) {
  return (
    <View style={styles.screen}>
      <AppHeader
        onSearchPress={() => navigation.navigate('Search')}
        searchPlaceholder="Search sports gear, trophies…"
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.pageIntro}>
          <Text style={styles.title}>Shop</Text>
          <Text style={styles.subtitle}>
            Cricket, trophies, training machines, and more — all genuine.
          </Text>
        </View>

        <View style={styles.highlightRow}>
          {highlights.map((item) => (
            <View key={item.label} style={styles.highlightChip}>
              <Ionicons name={item.icon} size={14} color={colors.primary} />
              <Text style={styles.highlightText}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionLabel}>COLLECTIONS</Text>
          <Text style={styles.sectionTitle}>Shop by Category</Text>

          {/* Featured full-width card */}
          <TouchableOpacity
            style={styles.featured}
            activeOpacity={0.92}
            onPress={() => navigateToCategory(navigation, featuredCategory.id)}
          >
            <ImageBackground
              source={featuredCategory.image}
              style={styles.featuredImage}
              imageStyle={styles.featuredImageStyle}
              resizeMode="cover"
            >
              <LinearGradient
                colors={['rgba(6,13,24,0.2)', 'rgba(6,13,24,0.9)']}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.featuredBadge}>
                <Text style={styles.featuredBadgeText}>Featured</Text>
              </View>
              <View style={styles.featuredIcon}>
                <Ionicons name={featuredCategory.icon} size={22} color={colors.white} />
              </View>
              <Text style={styles.featuredTitle}>{featuredCategory.title}</Text>
              <Text style={styles.featuredDesc} numberOfLines={2}>
                {featuredCategory.description}
              </Text>
              <View style={styles.featuredCta}>
                <Text style={styles.featuredCtaText}>Browse collection</Text>
                <Ionicons name="arrow-forward" size={16} color={colors.white} />
              </View>
            </ImageBackground>
          </TouchableOpacity>

          {/* Compact image grid for remaining collections */}
          <View style={styles.grid}>
            {otherCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[styles.tile, { width: TILE_W }]}
                activeOpacity={0.9}
                onPress={() => navigateToCategory(navigation, category.id)}
              >
                <ImageBackground
                  source={category.image}
                  style={styles.tileImage}
                  imageStyle={styles.tileImageStyle}
                  resizeMode="cover"
                >
                  <LinearGradient
                    colors={['rgba(6,13,24,0.25)', 'rgba(6,13,24,0.92)']}
                    style={StyleSheet.absoluteFill}
                  />
                  <LinearGradient
                    colors={[`${category.gradient[0]}55`, `${category.gradient[1]}22`]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={styles.tileIcon}>
                    <Ionicons name={category.icon} size={20} color={colors.white} />
                  </View>
                  <Text style={styles.tileTitle} numberOfLines={2}>
                    {category.title}
                  </Text>
                  <Text style={styles.tileMeta}>{category.items.length} items</Text>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.helpCard}>
            <View style={styles.helpCopy}>
              <Text style={styles.helpTitle}>Need help choosing?</Text>
              <Text style={styles.helpSub}>Talk to our team for sizing, stock & bulk quotes.</Text>
            </View>
            <View style={styles.helpActions}>
              <TouchableOpacity style={styles.helpBtn} onPress={() => openWhatsApp()} activeOpacity={0.85}>
                <Ionicons name="logo-whatsapp" size={18} color={colors.whatsapp} />
                <Text style={styles.helpBtnText}>WhatsApp</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.helpBtn} onPress={() => openPhone()} activeOpacity={0.85}>
                <Ionicons name="call-outline" size={18} color={colors.primary} />
                <Text style={styles.helpBtnText}>Call</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  pageIntro: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    ...typography.h1,
    color: colors.text,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  highlightRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  highlightChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  highlightText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sectionLabel: {
    ...typography.label,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
  },
  featured: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  featuredImage: {
    minHeight: 220,
    padding: spacing.lg,
    justifyContent: 'flex-end',
  },
  featuredImageStyle: {
    borderRadius: radius.xl,
  },
  featuredBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  featuredBadgeText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '800',
  },
  featuredIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  featuredTitle: {
    ...typography.h2,
    color: colors.white,
    marginBottom: spacing.xs,
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
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
    marginBottom: spacing.lg,
  },
  tile: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  tileImage: {
    minHeight: 168,
    padding: spacing.md,
    justifyContent: 'flex-end',
  },
  tileImageStyle: {
    borderRadius: radius.lg,
  },
  tileIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  tileTitle: {
    ...typography.bodySmall,
    color: colors.white,
    fontWeight: '800',
    lineHeight: 18,
  },
  tileMeta: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 6,
    fontWeight: '600',
  },
  helpCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  helpCopy: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  helpTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
    marginBottom: 4,
  },
  helpSub: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  helpActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  helpBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  helpBtnText: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
  },
});
