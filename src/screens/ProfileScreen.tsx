import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { ProfileAvatar } from '../components/ProfileAvatar';
import { NotificationBell } from '../components/NotificationBell';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, typography, radius } from '../constants/theme';
import { pickProfilePhotoUri } from '../utils/pickProfilePhoto';
import type { ProfileStackParamList, RootStackParamList, TabParamList } from '../navigation/types';

type ProfileNav = CompositeNavigationProp<
  NativeStackNavigationProp<ProfileStackParamList>,
  CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList>,
    NativeStackNavigationProp<RootStackParamList>
  >
>;

type MenuItem = {
  key: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: keyof ProfileStackParamList;
};

const MENU: MenuItem[] = [
  {
    key: 'details',
    title: 'Profile details',
    subtitle: 'Name, email, store & personal info',
    icon: 'person-outline',
    route: 'ProfileDetails',
  },
  {
    key: 'orders',
    title: 'Orders',
    subtitle: 'Past orders & bookings',
    icon: 'receipt-outline',
    route: 'PastOrders',
  },
  {
    key: 'prefs',
    title: 'Preferences',
    subtitle: 'Email, WhatsApp & SMS',
    icon: 'notifications-outline',
    route: 'NotificationPreferences',
  },
  {
    key: 'addresses',
    title: 'Saved addresses',
    subtitle: 'Delivery & pickup locations',
    icon: 'location-outline',
    route: 'SavedAddresses',
  },
];

const QUICK_LINKS: Array<{
  key: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: keyof ProfileStackParamList;
}> = [
  { key: 'orders', title: 'Orders', icon: 'receipt-outline', route: 'PastOrders' },
  { key: 'addresses', title: 'Addresses', icon: 'location-outline', route: 'SavedAddresses' },
  { key: 'prefs', title: 'Alerts', icon: 'notifications-outline', route: 'NotificationPreferences' },
];

function formatMemberSince(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, '').slice(-10);
  if (digits.length < 10) return phone;
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
}

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<ProfileNav>();
  const { user, isAuthenticated, updateProfile, logout } = useAuth();

  async function changePhoto() {
    if (!user) return;
    const uri = await pickProfilePhotoUri();
    if (uri) await updateProfile({ photoUri: uri });
  }

  async function performLogout() {
    await logout();
    navigation.navigate('AuthWelcome');
  }

  function handleLogout() {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm('Are you sure you want to log out?')) {
        void performLogout();
      }
      return;
    }

    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: () => {
          void performLogout();
        },
      },
    ]);
  }

  function openMenuRoute(route: keyof ProfileStackParamList) {
    if (route === 'ProfileDetails') navigation.navigate('ProfileDetails');
    else if (route === 'PastOrders') navigation.navigate('PastOrders');
    else if (route === 'NotificationPreferences') navigation.navigate('NotificationPreferences');
    else if (route === 'SavedAddresses') navigation.navigate('SavedAddresses');
  }

  if (!isAuthenticated || !user) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <ScrollView
          contentContainerStyle={[
            styles.loggedOutScroll,
            { paddingBottom: insets.bottom + spacing.xxl },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.loggedOutHero}>
            <ImageBackground
              source={require('../../assets/quick-access/store.jpg')}
              style={styles.loggedOutHeroImage}
              imageStyle={styles.loggedOutHeroImageStyle}
              resizeMode="cover"
            >
              <LinearGradient
                colors={['rgba(2,8,20,0.35)', 'rgba(6,13,24,0.92)']}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.loggedOutHeroTop}>
                <Text style={styles.loggedOutEyebrow}>ACCOUNT</Text>
                <NotificationBell />
              </View>
              <Text style={styles.loggedOutHeroTitle}>Your profile</Text>
              <Text style={styles.loggedOutHeroSub}>
                Track orders, save addresses, and get faster checkout.
              </Text>
            </ImageBackground>
          </View>

          <View style={styles.authCard}>
            <Text style={styles.authTitle}>Join DA SPORTZ</Text>
            <Text style={styles.authSub}>
              Save your details once — book stringing and shop gear faster next time.
            </Text>

            <View style={styles.benefitRow}>
              {[
                { icon: 'receipt-outline' as const, label: 'Order history' },
                { icon: 'location-outline' as const, label: 'Saved addresses' },
                { icon: 'flash-outline' as const, label: 'Faster checkout' },
              ].map((item) => (
                <View key={item.label} style={styles.benefitChip}>
                  <Ionicons name={item.icon} size={14} color={colors.primary} />
                  <Text style={styles.benefitText}>{item.label}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.primaryAuthBtn}
              onPress={() => navigation.navigate('SignUp')}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryAuthGradient}
              >
                <Ionicons name="person-add-outline" size={18} color={colors.background} />
                <View style={styles.primaryAuthCopy}>
                  <Text style={styles.primaryAuthTitle}>Create account</Text>
                  <Text style={styles.primaryAuthSub}>Recommended · takes under a minute</Text>
                </View>
                <Ionicons name="arrow-forward" size={18} color={colors.background} />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryAuthBtn}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.85}
            >
              <View style={styles.secondaryAuthIcon}>
                <Ionicons name="log-in-outline" size={18} color={colors.primary} />
              </View>
              <View style={styles.secondaryAuthCopy}>
                <Text style={styles.secondaryAuthTitle}>I already have an account</Text>
                <Text style={styles.secondaryAuthSub}>Log in with your mobile number</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <View style={styles.guestDivider}>
              <View style={styles.guestLine} />
              <Text style={styles.guestDividerText}>or</Text>
              <View style={styles.guestLine} />
            </View>

            <TouchableOpacity
              style={styles.guestBtn}
              onPress={() => navigation.navigate('GuestLogin')}
              activeOpacity={0.85}
            >
              <Ionicons name="phone-portrait-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.guestBtnText}>Continue as guest with mobile</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <View>
            <Text style={styles.eyebrow}>ACCOUNT</Text>
            <Text style={styles.screenTitle}>Profile</Text>
          </View>
          <NotificationBell />
        </View>

        <View style={styles.heroCard}>
          <LinearGradient
            colors={['rgba(34,197,94,0.16)', 'rgba(15,28,46,0.95)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroRow}>
            <ProfileAvatar uri={user.photoUri} size={84} editable onPress={changePhoto} />
            <View style={styles.heroCopy}>
              <Text style={styles.name} numberOfLines={1}>
                {user.fullName || 'Sports fan'}
              </Text>
              <Text style={styles.phone}>{formatPhone(user.phone)}</Text>
              <View style={styles.badgeRow}>
                <View
                  style={[
                    styles.badge,
                    user.mode === 'guest' ? styles.badgeGuest : styles.badgeMember,
                  ]}
                >
                  <Text style={styles.badgeText}>
                    {user.mode === 'guest' ? 'GUEST' : 'MEMBER'}
                  </Text>
                </View>
                <Text style={styles.memberSince}>Since {formatMemberSince(user.createdAt)}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate('ProfileDetails')}
            activeOpacity={0.85}
          >
            <Ionicons name="create-outline" size={16} color={colors.primary} />
            <Text style={styles.editBtnText}>Edit profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quickRow}>
          {QUICK_LINKS.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={styles.quickBtn}
              onPress={() => openMenuRoute(item.route)}
              activeOpacity={0.85}
            >
              <View style={styles.quickIcon}>
                <Ionicons name={item.icon} size={20} color={colors.primary} />
              </View>
              <Text style={styles.quickLabel}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>SETTINGS</Text>
        <View style={styles.menu}>
          {MENU.map((item, index) => (
            <TouchableOpacity
              key={item.key}
              style={[styles.menuRow, index === MENU.length - 1 && styles.menuRowLast]}
              onPress={() => openMenuRoute(item.route)}
              activeOpacity={0.7}
            >
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon} size={20} color={colors.primary} />
              </View>
              <View style={styles.menuText}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSub}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {user.mode === 'guest' ? (
          <TouchableOpacity
            style={styles.upgradeCard}
            onPress={() => navigation.navigate('SignUp')}
            activeOpacity={0.88}
          >
            <View style={styles.upgradeIcon}>
              <Ionicons name="sparkles" size={18} color={colors.primary} />
            </View>
            <View style={styles.upgradeText}>
              <Text style={styles.upgradeTitle}>Upgrade to full account</Text>
              <Text style={styles.upgradeSub}>Add email and unlock a complete profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={18} color={colors.error} />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  topBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  eyebrow: {
    ...typography.label,
    color: colors.primary,
    marginBottom: 4,
  },
  screenTitle: { ...typography.h1, color: colors.text },
  heroCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  heroCopy: { flex: 1, minWidth: 0 },
  name: { ...typography.h3, color: colors.text },
  phone: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  badgeMember: { backgroundColor: 'rgba(34,197,94,0.18)' },
  badgeGuest: { backgroundColor: 'rgba(59,130,246,0.18)' },
  badgeText: {
    ...typography.caption,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: colors.text,
  },
  memberSince: { ...typography.caption, color: colors.textMuted },
  editBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.28)',
  },
  editBtnText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '800',
  },
  quickRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
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
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '700',
  },
  sectionLabel: {
    ...typography.label,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  menu: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: spacing.md,
  },
  menuRowLast: { borderBottomWidth: 0 },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: { flex: 1 },
  menuTitle: { ...typography.bodySmall, color: colors.text, fontWeight: '700' },
  menuSub: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  upgradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.25)',
  },
  upgradeIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: 'rgba(34,197,94,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeText: { flex: 1 },
  upgradeTitle: { ...typography.bodySmall, color: colors.text, fontWeight: '700' },
  upgradeSub: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.35)',
    backgroundColor: 'rgba(239,68,68,0.08)',
  },
  logoutText: {
    ...typography.bodySmall,
    color: colors.error,
    fontWeight: '800',
  },
  loggedOutScroll: { flexGrow: 1, paddingHorizontal: spacing.lg },
  loggedOutHero: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  loggedOutHeroImage: {
    minHeight: 200,
    borderRadius: radius.xl,
    overflow: 'hidden',
    padding: spacing.lg,
    justifyContent: 'flex-end',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  loggedOutHeroImageStyle: {
    borderRadius: radius.xl,
  },
  loggedOutHeroTop: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  loggedOutEyebrow: {
    ...typography.label,
    color: colors.primary,
  },
  loggedOutHeroTitle: {
    ...typography.h1,
    color: colors.white,
    marginBottom: 4,
  },
  loggedOutHeroSub: {
    ...typography.bodySmall,
    color: 'rgba(255,255,255,0.82)',
    lineHeight: 20,
  },
  authCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.lg,
  },
  authTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  authSub: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  benefitRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  benefitChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.sm - 2,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.22)',
  },
  benefitText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '700',
  },
  primaryAuthBtn: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  primaryAuthGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  primaryAuthCopy: {
    flex: 1,
  },
  primaryAuthTitle: {
    ...typography.body,
    color: colors.background,
    fontWeight: '800',
  },
  primaryAuthSub: {
    ...typography.caption,
    color: 'rgba(6,13,24,0.72)',
    marginTop: 2,
    fontWeight: '600',
  },
  secondaryAuthBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceElevated,
  },
  secondaryAuthIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryAuthCopy: {
    flex: 1,
  },
  secondaryAuthTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
  },
  secondaryAuthSub: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  guestDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.md,
  },
  guestLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  guestDividerText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
  },
  guestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  guestBtnText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '700',
  },
});
