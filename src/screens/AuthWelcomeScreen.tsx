import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../components/Button';
import { CloseButton, closeCurrentScreen } from '../components/CloseButton';
import { colors, spacing, typography, radius } from '../constants/theme';
import { business } from '../data/content';
import { navigateToTab } from '../utils/navHelpers';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'AuthWelcome'>;

export function AuthWelcomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.lg },
      ]}
    >
      <View style={styles.topBar}>
        <View style={{ width: 32 }} />
        <CloseButton onPress={() => closeCurrentScreen(navigation)} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['rgba(34,197,94,0.18)', 'transparent']}
          style={styles.heroGlow}
        />
        <View style={styles.logoMark}>
          <Ionicons name="fitness" size={36} color={colors.primary} />
        </View>
        <Text style={styles.brand}>{business.name}</Text>
        <Text style={styles.tagline}>{business.tagline}</Text>
        <Text style={styles.heading}>Welcome</Text>
        <Text style={styles.subtitle}>
          Sign up for a full profile, log in to an existing account, or continue as a guest.
        </Text>

        <View style={styles.actions}>
          <Button title="Sign Up" onPress={() => navigation.navigate('SignUp')} />
          <Button
            title="Log in"
            variant="outline"
            onPress={() => navigation.navigate('Login')}
          />
          <Button
            title="Guest Login with Mobile"
            variant="outline"
            onPress={() => navigation.navigate('GuestLogin')}
          />
          <Button
            title="Browse without login"
            variant="secondary"
            onPress={() => navigateToTab(navigation, 'Home')}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    paddingBottom: spacing.xxl,
  },
  heroGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 220,
  },
  logoMark: {
    width: 72,
    height: 72,
    borderRadius: radius.xl,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  brand: { ...typography.h2, color: colors.text, fontWeight: '800' },
  tagline: { ...typography.bodySmall, color: colors.textMuted, marginTop: spacing.xs },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.xl,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  actions: { gap: spacing.md },
});
