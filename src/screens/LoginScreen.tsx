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
  Modal,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, typography, radius } from '../constants/theme';
import { navigateAfterAuth } from '../utils/navHelpers';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { memberLogin } = useAuth();
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showNotFound, setShowNotFound] = useState(false);

  async function handleLogin() {
    if (phone.replace(/\D/g, '').length < 10) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setShowNotFound(false);
    setSubmitting(true);
    try {
      await memberLogin({ phone });
      navigateAfterAuth(navigation);
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      if (message === 'ACCOUNT_NOT_FOUND') {
        setError('Unable to find any account for this number.');
        setShowNotFound(true);
      } else {
        setError(message || 'Login failed. Please try again.');
        Alert.alert('Login failed', message || 'Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  function goSignUp() {
    setShowNotFound(false);
    navigation.navigate('SignUp');
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
          onChangeText={(t) => {
            setPhone(t.replace(/[^0-9]/g, '').slice(0, 10));
            if (showNotFound) setShowNotFound(false);
            if (error) setError('');
          }}
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

      <Modal
        visible={showNotFound}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNotFound(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowNotFound(false)} />
          <View style={styles.modalCard}>
            <View style={styles.modalIconWrap}>
              <Ionicons name="person-outline" size={28} color={colors.primary} />
            </View>
            <Text style={styles.modalTitle}>Unable to find any account</Text>
            <Text style={styles.modalBody}>
              We could not find an account for this mobile number. Please sign up to continue.
            </Text>
            <Button title="Sign up" onPress={goSignUp} style={styles.modalPrimary} />
            <TouchableOpacity onPress={() => setShowNotFound(false)} style={styles.modalCancel}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.lg,
    alignItems: 'center',
    zIndex: 1,
  },
  modalIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  modalBody: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  modalPrimary: {
    alignSelf: 'stretch',
  },
  modalCancel: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  modalCancelText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    fontWeight: '600',
  },
});
