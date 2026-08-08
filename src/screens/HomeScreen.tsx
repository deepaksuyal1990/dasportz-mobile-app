import { useEffect, useRef } from 'react';
import {
  Animated,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeHeader, HOME_HEADER_HEIGHT } from '../components/HomeHeader';
import { CategoryRow } from '../components/CategoryRow';
import { ServiceRow } from '../components/ServiceRow';
import { QuickActionCard } from '../components/QuickActionCard';
import { AppFooter } from '../components/AppFooter';
import { business, highlights, productCategories, services } from '../data/content';
import { colors, spacing, typography, radius, shadows } from '../constants/theme';
import { openWhatsApp } from '../utils/linking';
import { navigateToCategory } from '../utils/navigation';
import { preloadSearchIndex } from '../services/searchService';
import type { TabScreenProps } from '../navigation/types';

type Props = TabScreenProps<'Home'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const statDisplay = [
  { value: '25 min', label: 'Stringing' },
  { value: '2 km', label: 'Free Pickup' },
  { value: '10K+', label: 'Serviced' },
  { value: '100%', label: 'Quality' },
];

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

const ACTION_CARD_WIDTH = (SCREEN_WIDTH - spacing.lg * 2 - spacing.sm) / 2;

export function HomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerSpace = insets.top + HOME_HEADER_HEIGHT;

  useEffect(() => {
    preloadSearchIndex();
  }, []);

  function handleAction(id: string) {
    switch (id) {
      case 'stringing':
        navigation.navigate('StringingForm');
        break;
      case 'shop':
        navigation.navigate('Products');
        break;
      case 'services':
        navigation.navigate('Services');
        break;
      case 'contact':
        navigation.navigate('Contact');
        break;
    }
  }

  return (
    <View style={styles.screen}>
      <HomeHeader
        scrollY={scrollY}
        onSearchPress={() => navigation.navigate('Search')}
        onLocationPress={() => navigation.navigate('Contact')}
      />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
      >
        {/* Hero */}
        <View style={[styles.heroSection, { paddingTop: headerSpace + spacing.md }]}>
          <LinearGradient
            colors={['#0C2A1E', '#0A1628', colors.background]}
            locations={[0, 0.5, 1]}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.heroOrb1} />
          <View style={styles.heroOrb2} />

          <View style={styles.heroInner}>
            <View style={styles.pill}>
              <View style={styles.pillDot} />
              <Text style={styles.pillText}>100% Genuine · Official Brands</Text>
            </View>

            <Text style={styles.heroTitle}>
              Your sports{'\n'}
              <Text style={styles.heroAccent}>destination</Text>
            </Text>

            <Text style={styles.heroSub}>{business.description}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsCard}>
          {statDisplay.map((item, i) => (
            <View
              key={item.label}
              style={[styles.statItem, i < statDisplay.length - 1 && styles.statBorder]}
            >
              <Ionicons name={highlights[i].icon} size={20} color={colors.primary} />
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Primary actions grid */}
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

        {/* Featured promo */}
        <View style={styles.section}>
          <TouchableOpacity
            activeOpacity={0.92}
            onPress={() => navigation.navigate('StringingForm')}
          >
            <LinearGradient
              colors={['#064E3B', '#059669', '#10B981']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.promoCard}
            >
              <View style={styles.promoDecor}>
                <MaterialCommunityIcons name="badminton" size={120} color="rgba(255,255,255,0.06)" />
              </View>
              <View style={styles.promoBadge}>
                <Text style={styles.promoBadgeText}>⚡ Most Popular</Text>
              </View>
              <Text style={styles.promoTitle}>Expert Badminton{'\n'}Stringing Service</Text>
              <Text style={styles.promoDesc}>
                Electronic tensioning · Original Yonex strings · Ready in 25–30 mins
              </Text>
              <View style={styles.promoFooter}>
                <Text style={styles.promoCta}>Book online</Text>
                <View style={styles.promoArrow}>
                  <Ionicons name="arrow-forward" size={16} color="#059669" />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <View>
              <Text style={styles.sectionLabel}>COLLECTIONS</Text>
              <Text style={styles.sectionTitle}>Shop by Category</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Products')}>
              <Text style={styles.seeAll}>See all →</Text>
            </TouchableOpacity>
          </View>

          {productCategories.map((category) => (
            <CategoryRow
              key={category.id}
              title={category.title}
              description={category.description}
              icon={category.icon}
              gradient={category.gradient}
              itemCount={category.items.length}
              onPress={() => navigateToCategory(navigation, category.id)}
            />
          ))}
        </View>

        {/* Services */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <View>
              <Text style={styles.sectionLabel}>SERVICES</Text>
              <Text style={styles.sectionTitle}>Equipment Care</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Services')}>
              <Text style={styles.seeAll}>See all →</Text>
            </TouchableOpacity>
          </View>

          {services.map((service) => (
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

        {/* WhatsApp CTA */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.whatsappCard}
            onPress={() => openWhatsApp()}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['rgba(37,211,102,0.15)', 'rgba(37,211,102,0.05)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.whatsappIcon}>
              <Ionicons name="logo-whatsapp" size={28} color={colors.whatsapp} />
            </View>
            <View style={styles.whatsappContent}>
              <Text style={styles.whatsappTitle}>Need help choosing?</Text>
              <Text style={styles.whatsappSub}>
                Chat with our experts on WhatsApp for instant advice
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.whatsapp} />
          </TouchableOpacity>
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
    minHeight: 220,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  heroOrb1: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
  },
  heroOrb2: {
    position: 'absolute',
    bottom: 20,
    left: -80,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(59, 130, 246, 0.06)',
  },
  heroInner: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.25)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    marginBottom: spacing.lg,
  },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  pillText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  heroTitle: {
    ...typography.hero,
    color: colors.text,
    marginBottom: spacing.md,
  },
  heroAccent: {
    color: colors.primary,
  },
  heroSub: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
    maxWidth: SCREEN_WIDTH * 0.85,
  },
  statsCard: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginTop: -spacing.xl,
    marginBottom: spacing.xl,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingVertical: spacing.md,
    ...shadows.card,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    gap: 4,
  },
  statBorder: {
    borderRightWidth: 1,
    borderRightColor: colors.borderLight,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginTop: 2,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 13,
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
  promoCard: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    overflow: 'hidden',
    minHeight: 200,
    ...shadows.card,
  },
  promoDecor: {
    position: 'absolute',
    right: -20,
    bottom: -20,
  },
  promoBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    marginBottom: spacing.md,
  },
  promoBadgeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
  },
  promoTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.white,
    lineHeight: 30,
    marginBottom: spacing.sm,
  },
  promoDesc: {
    ...typography.bodySmall,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
    marginBottom: spacing.lg,
    maxWidth: '80%',
  },
  promoFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  promoCta: {
    ...typography.body,
    color: colors.white,
    fontWeight: '700',
  },
  promoArrow: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whatsappCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(37, 211, 102, 0.25)',
    overflow: 'hidden',
  },
  whatsappIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(37, 211, 102, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  whatsappContent: {
    flex: 1,
  },
  whatsappTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
    marginBottom: 2,
  },
  whatsappSub: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 17,
  },
});
