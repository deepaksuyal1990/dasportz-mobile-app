import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NotificationBell } from '../components/NotificationBell';
import { business, contact } from '../data/content';
import { colors, spacing, typography, radius } from '../constants/theme';
import { openPhone, openEmail, openWhatsApp, openMaps, openWebsite } from '../utils/linking';

const { width: SCREEN_W } = Dimensions.get('window');

const quickActions = [
  {
    key: 'call',
    label: 'Call',
    icon: 'call' as const,
    color: colors.primary,
    onPress: openPhone,
  },
  {
    key: 'whatsapp',
    label: 'WhatsApp',
    icon: 'logo-whatsapp' as const,
    color: colors.whatsapp,
    onPress: () => openWhatsApp(),
  },
  {
    key: 'maps',
    label: 'Directions',
    icon: 'navigate' as const,
    color: '#3B82F6',
    onPress: openMaps,
  },
  {
    key: 'email',
    label: 'Email',
    icon: 'mail' as const,
    color: colors.accent,
    onPress: () => openEmail(),
  },
];

export function ContactScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xxl }}
    >
      <View style={[styles.hero, { paddingTop: insets.top + spacing.sm }]}>
        <ImageBackground
          source={require('../../assets/quick-access/store.jpg')}
          style={styles.heroImage}
          imageStyle={styles.heroImageStyle}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(2,8,20,0.35)', 'rgba(6,13,24,0.92)']}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.heroTop}>
            <View style={styles.hoursPill}>
              <View style={styles.hoursDot} />
              <Text style={styles.hoursText}>{contact.hours}</Text>
            </View>
            <NotificationBell />
          </View>

          <View style={styles.heroBody}>
            <Text style={styles.heroEyebrow}>VISIT US</Text>
            <Text style={styles.heroTitle}>DA SPORTZ</Text>
            <Text style={styles.heroSub}>Gaur City Sports Complex</Text>
          </View>
        </ImageBackground>
      </View>

      <View style={styles.content}>
        <View style={styles.quickRow}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.key}
              style={styles.quickBtn}
              onPress={action.onPress}
              activeOpacity={0.85}
            >
              <View style={[styles.quickIcon, { backgroundColor: `${action.color}22` }]}>
                <Ionicons name={action.icon} size={20} color={action.color} />
              </View>
              <Text style={styles.quickLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.addressCard} onPress={openMaps} activeOpacity={0.88}>
          <View style={styles.addressIcon}>
            <Ionicons name="location" size={22} color={colors.primary} />
          </View>
          <View style={styles.addressCopy}>
            <Text style={styles.addressTitle}>Store address</Text>
            <Text style={styles.addressText}>{contact.address}</Text>
          </View>
          <Ionicons name="open-outline" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.detailList}>
          <TouchableOpacity style={styles.detailRow} onPress={openPhone} activeOpacity={0.85}>
            <Ionicons name="call-outline" size={18} color={colors.primary} />
            <View style={styles.detailCopy}>
              <Text style={styles.detailLabel}>Phone</Text>
              <Text style={styles.detailValue}>{contact.phoneDisplay}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.detailRow} onPress={() => openEmail()} activeOpacity={0.85}>
            <Ionicons name="mail-outline" size={18} color={colors.primary} />
            <View style={styles.detailCopy}>
              <Text style={styles.detailLabel}>Email</Text>
              <Text style={styles.detailValue}>{contact.email}</Text>
              <Text style={styles.detailHint}>{contact.emailReply}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.detailRow} onPress={openWebsite} activeOpacity={0.85}>
            <Ionicons name="globe-outline" size={18} color={colors.primary} />
            <View style={styles.detailCopy}>
              <Text style={styles.detailLabel}>Website</Text>
              <Text style={styles.detailValue}>{business.website.replace('https://', '')}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.aboutCard}>
          <Text style={styles.sectionLabel}>ABOUT</Text>
          <Text style={styles.aboutTitle}>Your local sports destination</Text>
          <Text style={styles.aboutText}>{business.description}</Text>
        </View>

        <Text style={styles.legal}>
          Platform & payment services by {business.poweredBy} · {business.legalEntity}
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
  hero: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  heroImage: {
    width: SCREEN_W - spacing.lg * 2,
    minHeight: 210,
    borderRadius: radius.xl,
    overflow: 'hidden',
    padding: spacing.lg,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  heroImageStyle: {
    borderRadius: radius.xl,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hoursPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(6,13,24,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.35)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm - 2,
    borderRadius: radius.full,
  },
  hoursDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  hoursText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '700',
  },
  heroBody: {
    marginTop: spacing.xl,
  },
  heroEyebrow: {
    ...typography.label,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  heroTitle: {
    ...typography.h1,
    color: colors.white,
    letterSpacing: 0.6,
  },
  heroSub: {
    ...typography.bodySmall,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
  quickRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  quickBtn: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingVertical: spacing.md,
  },
  quickIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '700',
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  addressIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressCopy: {
    flex: 1,
  },
  addressTitle: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    marginBottom: 2,
  },
  addressText: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
    lineHeight: 18,
  },
  detailList: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  detailCopy: {
    flex: 1,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    marginBottom: 2,
  },
  detailValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  detailHint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  aboutCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.lg,
  },
  sectionLabel: {
    ...typography.label,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  aboutTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  aboutText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  legal: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
    lineHeight: 18,
  },
});
