import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { ScreenHeader } from '../components/ScreenHeader';
import { ContactRow } from '../components/ContactRow';
import { Button } from '../components/Button';
import { business, contact } from '../data/content';
import { colors, spacing, typography, radius } from '../constants/theme';
import { openPhone, openEmail, openWhatsApp, openMaps, openWebsite } from '../utils/linking';

export function ContactScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ScreenHeader
        title="Contact Us"
        subtitle="We'd love to hear from you. Reach out for queries, bookings, or just to say hi."
      />

      <View style={styles.content}>
        <Text style={styles.sectionLabel}>GET IN TOUCH</Text>

        <ContactRow
          icon="location"
          title="Visit Us"
          subtitle={contact.address}
          onPress={openMaps}
        />
        <ContactRow
          icon="call"
          title="Call Us"
          subtitle={`${contact.phoneDisplay} · ${contact.hours}`}
          onPress={openPhone}
        />
        <ContactRow
          icon="mail"
          title="Email Us"
          subtitle={`${contact.email} · ${contact.emailReply}`}
          onPress={openEmail}
        />
        <ContactRow
          icon="logo-whatsapp"
          title="WhatsApp"
          subtitle="Instant support for products, repairs & quotes"
          onPress={() => openWhatsApp()}
          iconColor={colors.whatsapp}
        />
        <ContactRow
          icon="globe"
          title="Website"
          subtitle={business.website.replace('https://', '')}
          onPress={openWebsite}
        />

        <View style={styles.aboutSection}>
          <Text style={styles.sectionLabel}>ABOUT US</Text>
          <Text style={styles.aboutTitle}>Our Story</Text>
          <Text style={styles.aboutText}>{business.about}</Text>
          <Text style={styles.tagline}>{business.tagline}</Text>
          <Text style={styles.taglineSub}>{business.description}</Text>
        </View>

        <View style={styles.actions}>
          <Button title="Call Now" onPress={openPhone} />
          <Button title="WhatsApp Us" variant="whatsapp" onPress={() => openWhatsApp()} />
        </View>

        <Text style={styles.legal}>
          Platform & Payment Services provided by {business.poweredBy} (Legal Entity:{' '}
          {business.legalEntity})
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sectionLabel: {
    ...typography.label,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  aboutSection: {
    marginTop: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  aboutTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  aboutText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  tagline: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  taglineSub: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  legal: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
    lineHeight: 18,
  },
});
