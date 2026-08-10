import { useState } from 'react';
import {
  View,
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

type Props = NativeStackScreenProps<RootStackParamList, 'GuestLogin'>;

export function GuestLoginScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { guestLogin } = useAuth();
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleContinue() {
    if (phone.replace(/\D/g, '').length < 10) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await guestLogin({ phone, fullName: fullName.trim() || undefined });
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
        <Text style={styles.title}>Guest login</Text>
        <Text style={styles.subtitle}>
          Continue with your mobile number. You can add more details anytime from Profile.
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
        <TextField
          label="Name (optional)"
          value={fullName}
          onChangeText={setFullName}
          placeholder="How should we greet you?"
        />

        <Button
          title={submitting ? 'Continuing…' : 'Continue'}
          onPress={handleContinue}
          disabled={submitting}
          style={styles.submit}
        />

        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.link}>Create a full account instead →</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.linkMuted}>Already signed up? Log in</Text>
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
