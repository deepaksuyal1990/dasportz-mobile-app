import { useState } from 'react';
import {
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, typography } from '../constants/theme';
import { navigateAfterAuth } from '../utils/navHelpers';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { memberLogin } = useAuth();
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin() {
    if (phone.replace(/\D/g, '').length < 10) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await memberLogin({ phone });
      navigateAfterAuth(navigation);
    } catch (err) {
      Alert.alert('Login failed', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.xxl },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Log in</Text>
        <Text style={styles.subtitle}>
          Enter the mobile number you used when signing up to restore your profile and photo.
        </Text>

        <TextField
          label="Mobile number"
          required
          value={phone}
          onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, '').slice(0, 10))}
          keyboardType="phone-pad"
          placeholder="10-digit WhatsApp number"
          error={error}
        />

        <Button
          title={submitting ? 'Logging in…' : 'Log in'}
          onPress={handleLogin}
          disabled={submitting}
          style={styles.submit}
        />

        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.link}>New here? Create an account →</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('GuestLogin')}>
          <Text style={styles.linkMuted}>Continue as guest instead</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, flexGrow: 1 },
  title: { ...typography.h2, color: colors.text },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  submit: { marginTop: spacing.md },
  link: {
    ...typography.bodySmall,
    color: colors.primary,
    textAlign: 'center',
    marginTop: spacing.lg,
    fontWeight: '600',
  },
  linkMuted: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
