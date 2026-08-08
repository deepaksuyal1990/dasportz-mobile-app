import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { ScreenHeader } from '../components/ScreenHeader';
import { ServiceCard } from '../components/ServiceCard';
import { Button } from '../components/Button';
import { services, highlights } from '../data/content';
import { colors, spacing, typography, radius } from '../constants/theme';
import { openWhatsApp } from '../utils/linking';
import type { TabScreenProps } from '../navigation/types';

type Props = TabScreenProps<'Services'>;

export function ServicesScreen({ navigation }: Props) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ScreenHeader
        title="Services"
        subtitle="Professional equipment care with pickup and fast turnaround."
      />

      <View style={styles.highlights}>
        {highlights.map((item) => (
          <View key={item.title} style={styles.highlightPill}>
            <Text style={styles.highlightText}>{item.title}</Text>
          </View>
        ))}
      </View>

      <View style={styles.content}>
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onPress={() =>
              service.id === 'badminton-stringing'
                ? navigation.navigate('StringingForm')
                : navigation.navigate('ServiceDetail', { serviceId: service.id })
            }
          />
        ))}

        <View style={styles.quoteCard}>
          <Text style={styles.quoteTitle}>Need a quick quote?</Text>
          <Text style={styles.quoteText}>
            Send a photo of your equipment on WhatsApp and get instant guidance from our team.
          </Text>
          <Button title="Get Instant Support" variant="whatsapp" onPress={() => openWhatsApp()} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  highlights: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  highlightPill: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
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
  quoteCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  quoteTitle: {
    ...typography.h3,
    color: colors.text,
  },
  quoteText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
});
