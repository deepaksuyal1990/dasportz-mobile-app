import { View, Text, TextInput, StyleSheet, TextInputProps, type StyleProp, type ViewStyle } from 'react-native';
import { colors, spacing, typography, radius } from '../constants/theme';

type Props = TextInputProps & {
  label: string;
  required?: boolean;
  error?: string;
  suffix?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

export function TextField({
  label,
  required,
  error,
  suffix,
  style,
  containerStyle,
  ...props
}: Props) {
  const showLabel = label.trim().length > 0;

  return (
    <View style={[styles.container, containerStyle]}>
      {showLabel ? (
        <Text style={styles.label}>
          {label}
          {required ? <Text style={styles.required}> *</Text> : null}
        </Text>
      ) : null}
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, suffix ? styles.inputWithSuffix : null, style]}
          placeholderTextColor={colors.textMuted}
          {...props}
        />
        {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  required: {
    color: colors.error,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minWidth: 0,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    color: colors.text,
    ...typography.body,
  },
  inputWithSuffix: {
    paddingRight: spacing.sm,
  },
  suffix: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginLeft: spacing.sm,
    fontWeight: '600',
  },
  error: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
});
