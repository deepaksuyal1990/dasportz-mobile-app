import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';
import { ServiceCard } from '../components/ServiceCard';
import { services, highlights } from '../data/content';
import { colors, spacing, typography, radius } from '../constants/theme';
import { openPhone, openWhatsApp } from '../utils/linking';
import type { ServicesStackScreenProps } from '../navigation/types';

type Props = ServicesStackScreenProps<'ServicesMain'>;

const { width: SCREEN_W } = Dimensions.get('window');
const GRID_GAP = spacing.sm;
const TILE_W = (SCREEN_W - spacing.lg * 2 - GRID_GAP) / 2;

const [featuredService, ...otherServices] = services;

const trustChips = [
  { icon: 'flash-outline' as const, label: highlights[0].title.replace('Express ', '') },
  { icon: 'car-outline' as const, label: 'Free 2km pickup' },
  { icon: 'shield-checkmark-outline' as const, label: 'Quality checked' },
];

export function ServicesScreen({ navigation }: Props) {
  function openService(serviceId: string) {
    if (serviceId === 'badminton-stringing') {
      navigation.navigate('StringingForm');
      return;
    }
    navigation.navigate('ServiceDetail', { serviceId });
  }

  return (
    <View style={styles.screen}>
      <AppHeader
        onSearchPress={() => navigation.navigate('Search')}
        searchPlaceholder="Search stringing, repairs…"
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.pageIntro}>
          <Text style={styles.title}>Care</Text>
          <Text style={styles.subtitle}>
            Expert stringing, repairs & knocking — pickup available near you.
          </Text>
        </View>

        <View style={styles.trustRow}>
          {trustChips.map((chip) => (
            <View key={chip.label} style={styles.trustChip}>
              <Ionicons name={chip.icon} size={14} color={colors.primary} />
              <Text style={styles.trustText}>{chip.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionLabel}>MOST BOOKED</Text>
          <ServiceCard
            service={featuredService}
            variant="featured"
            onPress={() => openService(featuredService.id)}
          />

          <Text style={[styles.sectionLabel, styles.sectionSpacer]}>ALL SERVICES</Text>
          <View style={styles.grid}>
            {otherServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                variant="compact"
                width={TILE_W}
                onPress={() => openService(service.id)}
              />
            ))}
          </View>

          <View style={styles.helpCard}>
            <View style={styles.helpCopy}>
              <Text style={styles.helpTitle}>Need a quick quote?</Text>
              <Text style={styles.helpSub}>
                Send a photo of your gear — we’ll guide turnaround and pricing.
              </Text>
            </View>
            <View style={styles.helpActions}>
              <TouchableOpacity
                style={styles.helpBtn}
                onPress={() => openWhatsApp()}
                activeOpacity={0.85}
              >
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
  trustRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  trustChip: {
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
  trustText: {
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
    marginBottom: spacing.sm,
  },
  sectionSpacer: {
    marginTop: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
    marginBottom: spacing.lg,
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
