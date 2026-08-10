import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeHeader, HOME_HEADER_HEIGHT } from '../components/AppHeader';
import { CategoryCard } from '../components/CategoryCard';
import { ServiceRow } from '../components/ServiceRow';
import { QuickActionCard } from '../components/QuickActionCard';
import { ProductRail } from '../components/ProductRail';
import { AppFooter } from '../components/AppFooter';
import { business, contact, productCategories, services } from '../data/content';
import { colors, spacing, typography, radius } from '../constants/theme';
import { openPhone, openWhatsApp } from '../utils/linking';
import { navigateToCategory } from '../utils/navigation';
import { preloadSearchIndex } from '../services/searchService';
import { fetchCricketProducts } from '../services/productsApi';
import { pickBestsellers } from '../utils/productPicks';
import type { CricketProduct } from '../types/product';
import { navigateToTab } from '../utils/navHelpers';
import type { HomeStackScreenProps } from '../navigation/types';

type Props = HomeStackScreenProps<'HomeMain'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ACTION_CARD_WIDTH = (SCREEN_WIDTH - spacing.lg * 2 - spacing.sm) / 2;
const HOME_SERVICES = services.slice(0, 3);
const HOME_CATEGORIES = productCategories.slice(0, 3);

const primaryActions = [
  {
    id: 'stringing',
    label: 'Book Stringing',
    sublabel: '25 min turnaround',
    icon: { set: 'material' as const, name: 'badminton' as const },
    image: require('../../assets/quick-access/stringing.jpg'),
    gradient: ['#047857', '#10B981'] as [string, string],
  },
  {
    id: 'shop',
    label: 'Shop Gear',
    sublabel: 'Official brands',
    icon: { set: 'ionicons' as const, name: 'bag-handle' as const },
    image: require('../../assets/quick-access/shop.jpg'),
    gradient: ['#B45309', '#F59E0B'] as [string, string],
  },
  {
    id: 'services',
    label: 'Repairs',
    sublabel: 'Bat & glove care',
    icon: { set: 'ionicons' as const, name: 'construct' as const },
    image: require('../../assets/quick-access/repairs.jpg'),
    gradient: ['#1D4ED8', '#3B82F6'] as [string, string],
  },
  {
    id: 'contact',
    label: 'Visit Store',
    sublabel: 'Greater Noida',
    icon: { set: 'ionicons' as const, name: 'location' as const },
    image: require('../../assets/quick-access/store.jpg'),
    gradient: ['#6D28D9', '#8B5CF6'] as [string, string],
  },
];

export function HomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerSpace = insets.top + HOME_HEADER_HEIGHT;
  const [bestsellers, setBestsellers] = useState<CricketProduct[]>([]);
  const [picksLoading, setPicksLoading] = useState(true);

  useEffect(() => {
    preloadSearchIndex();
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        setPicksLoading(true);
        const products = await fetchCricketProducts();
        if (cancelled) return;
        setBestsellers(pickBestsellers(products, 8));
      } catch {
        if (!cancelled) setBestsellers([]);
      } finally {
        if (!cancelled) setPicksLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function handleAction(id: string) {
    switch (id) {
      case 'stringing':
        navigation.navigate('StringingForm');
        break;
      case 'shop':
        navigateToTab(navigation, 'Products');
        break;
      case 'services':
        navigateToTab(navigation, 'Services');
        break;
      case 'contact':
        navigateToTab(navigation, 'Contact');
        break;
    }
  }

  function openProduct(product: CricketProduct) {
    navigation.navigate('CricketProductDetail', { productId: product.id });
  }

  function openCricketBats() {
    navigation.navigate('CricketBats');
  }

  return (
    <View style={styles.screen}>
      <HomeHeader
        scrollY={scrollY}
        onSearchPress={() => navigation.navigate('Search')}
      />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
      >
        {/* Full-bleed photo hero */}
        <View style={[styles.heroSection, { paddingTop: headerSpace + spacing.md }]}>
          <Image
            source={require('../../assets/splash-background.jpg')}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={[
              'rgba(2,8,20,0.55)',
              'rgba(6,13,24,0.45)',
              'rgba(6,13,24,0.88)',
              colors.background,
            ]}
            locations={[0, 0.35, 0.75, 1]}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.heroInner}>
            <View style={styles.heroBrandRow}>
              <Text style={styles.heroBrand}>{business.name}</Text>
              <Image
                source={require('../../assets/icon.png')}
                style={styles.heroLogo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.heroSub}>
              Genuine gear & expert stringing — train, compete, win.
            </Text>
            <TouchableOpacity
              style={styles.heroCta}
              onPress={() => navigateToTab(navigation, 'Products')}
              activeOpacity={0.9}
            >
              <Text style={styles.heroCtaText}>Shop Sports Gear</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.background} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Access */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>QUICK ACCESS</Text>
          <View style={styles.actionGrid}>
            {primaryActions.map((action) => (
              <QuickActionCard
                key={action.id}
                label={action.label}
                sublabel={action.sublabel}
                icon={action.icon}
                image={action.image}
                gradient={action.gradient}
                width={ACTION_CARD_WIDTH}
                onPress={() => handleAction(action.id)}
              />
            ))}
          </View>
        </View>

        {/* Single product rail */}
        <View style={styles.section}>
          <ProductRail
            label="HOT DEALS"
            title="English Willow bats"
            products={bestsellers}
            loading={picksLoading}
            onPressProduct={openProduct}
            headerActionLabel="Browse all →"
            onHeaderAction={openCricketBats}
            emptyText="Bats will appear here once the catalogue loads"
          />
        </View>

        {/* Compact categories */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <View>
              <Text style={styles.sectionLabel}>COLLECTIONS</Text>
              <Text style={styles.sectionTitle}>Shop by Category</Text>
            </View>
            <TouchableOpacity onPress={() => navigateToTab(navigation, 'Products')}>
              <Text style={styles.seeAll}>See all →</Text>
            </TouchableOpacity>
          </View>

          {HOME_CATEGORIES.map((category) => (
            <CategoryCard
              key={category.id}
              title={category.title}
              description={category.description}
              icon={category.icon}
              gradient={category.gradient}
              image={category.image}
              onPress={() => navigateToCategory(navigation, category.id)}
            />
          ))}
        </View>

        {/* Top services */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <View>
              <Text style={styles.sectionLabel}>SERVICES</Text>
              <Text style={styles.sectionTitle}>Equipment Care</Text>
            </View>
            <TouchableOpacity onPress={() => navigateToTab(navigation, 'Services')}>
              <Text style={styles.seeAll}>See all →</Text>
            </TouchableOpacity>
          </View>

          {HOME_SERVICES.map((service) => (
            <ServiceRow
              key={service.id}
              service={service}
              onPress={() =>
                service.id === 'badminton-stringing'
                  ? navigation.navigate('StringingForm')
                  : navigation.navigate('ServiceDetail', { serviceId: service.id })
              }
            />
          ))}
        </View>

        {/* Visit store + WhatsApp / Call */}
        <View style={styles.section}>
          <View style={styles.trustCard}>
            <TouchableOpacity
              style={styles.trustMain}
              onPress={() => navigateToTab(navigation, 'Contact')}
              activeOpacity={0.85}
            >
              <View style={styles.trustIcon}>
                <Ionicons name="storefront-outline" size={22} color={colors.primary} />
              </View>
              <View style={styles.trustCopy}>
                <Text style={styles.trustTitle}>Visit our store</Text>
                <Text style={styles.trustSub} numberOfLines={2}>
                  {contact.address}
                </Text>
                <Text style={styles.trustHours}>{contact.hours}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <View style={styles.trustActions}>
              <TouchableOpacity
                style={styles.trustActionBtn}
                onPress={() => openWhatsApp()}
                activeOpacity={0.85}
              >
                <Ionicons name="logo-whatsapp" size={18} color={colors.whatsapp} />
                <Text style={styles.trustActionText}>WhatsApp</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.trustActionBtn}
                onPress={() => openPhone()}
                activeOpacity={0.85}
              >
                <Ionicons name="call-outline" size={18} color={colors.primary} />
                <Text style={styles.trustActionText}>Call</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <AppFooter />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing.md,
  },
  heroSection: {
    minHeight: 320,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    justifyContent: 'flex-end',
  },
  heroImage: {
    ...StyleSheet.absoluteFill,
    width: SCREEN_WIDTH,
    height: '100%',
  },
  heroInner: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  heroBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  heroBrand: {
    ...typography.hero,
    color: colors.text,
    letterSpacing: 0.5,
    flexShrink: 1,
  },
  heroLogo: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#fff',
  },
  heroSub: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
    maxWidth: SCREEN_WIDTH * 0.88,
    marginBottom: spacing.lg,
  },
  heroCta: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md - 2,
    borderRadius: radius.md,
  },
  heroCtaText: {
    ...typography.bodySmall,
    color: colors.background,
    fontWeight: '800',
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.md,
  },
  sectionLabel: {
    ...typography.label,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text,
  },
  seeAll: {
    ...typography.bodySmall,
    color: colors.textMuted,
    fontWeight: '600',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  trustCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  trustMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  trustIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustCopy: {
    flex: 1,
  },
  trustTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
    marginBottom: 2,
  },
  trustSub: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  trustHours: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  trustActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  trustActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  trustActionText: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
  },
});
