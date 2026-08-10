import { ScrollView, View, Text, StyleSheet, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../components/Button';
import { ServiceSportIcon } from '../components/ServiceSportIcon';
import { services } from '../data/content';
import { colors, spacing, typography, radius } from '../constants/theme';
import { openWhatsApp, openPhone } from '../utils/linking';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ServiceDetail'>;

export function ServiceDetailScreen({ route, navigation }: Props) {
  const service = services.find((s) => s.id === route.params.serviceId);
  const isStringing = service?.id === 'badminton-stringing';

  if (!service) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Service not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ImageBackground source={service.image} style={styles.hero} resizeMode="cover">
        <LinearGradient
          colors={['rgba(6,13,24,0.45)', 'rgba(6,13,24,0.92)']}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={[`${service.gradient[0]}99`, `${service.gradient[1]}55`, 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.heroIcon}>
          <ServiceSportIcon icon={service.icon} size={36} color={colors.white} />
        </View>
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{service.badge}</Text>
          </View>
          {service.pickup ? (
            <View style={styles.badge}>
              <Ionicons name="car-outline" size={14} color={colors.white} />
              <Text style={styles.badgeText}>Pickup Available</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.heroTitle}>{service.title}</Text>
        <Text style={styles.turnaround}>{service.turnaround}</Text>
      </ImageBackground>

      <View style={styles.content}>
        <Text style={styles.description}>{service.description}</Text>

        <Text style={styles.featuresTitle}>What's Included</Text>
        {service.features.map((feature) => (
          <View key={feature} style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}

        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color={colors.accent} />
          <Text style={styles.infoText}>
            Free pickup within 2km. Book your service via WhatsApp or call us directly.
          </Text>
        </View>

        <View style={styles.actions}>
          {isStringing ? (
            <Button
              title="Book Stringing Online"
              onPress={() => navigation.navigate('StringingForm')}
            />
          ) : null}
          <Button
            title="Book on WhatsApp"
            variant="whatsapp"
            onPress={() =>
              openWhatsApp(`Hi, I'd like to book ${service.title}. Please share available slots.`)
            }
          />
          <Button title="Call to Book" variant="outline" onPress={openPhone} />
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  errorText: {
    color: colors.textSecondary,
  },
  hero: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    minHeight: 240,
    justifyContent: 'flex-end',
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  badgeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },
  heroTitle: {
    ...typography.h1,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  turnaround: {
    ...typography.body,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  featuresTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  featureText: {
    ...typography.body,
    color: colors.text,
  },
  infoCard: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },
  actions: {
    gap: spacing.sm,
  },
});
