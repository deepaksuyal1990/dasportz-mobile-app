import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, typography } from '../constants/theme';

type Props = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'whatsapp' | 'outline';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
};

export function Button({ title, onPress, variant = 'primary', style, textStyle, disabled }: Props) {
  if (variant === 'outline') {
    return (
      <TouchableOpacity
        style={[styles.outline, disabled && styles.disabled, style]}
        onPress={onPress}
        activeOpacity={0.8}
        disabled={disabled}
      >
        <Text style={[styles.outlineText, textStyle]}>{title}</Text>
      </TouchableOpacity>
    );
  }

  const gradientColors =
    variant === 'whatsapp'
      ? ([colors.whatsapp, '#128C7E'] as [string, string])
      : variant === 'secondary'
        ? ([colors.surfaceLight, colors.surface] as [string, string])
        : ([colors.primary, colors.primaryDark] as [string, string]);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={style} disabled={disabled}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, disabled && styles.disabled]}
      >
        <Text style={[styles.text, textStyle]}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gradient: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  text: {
    ...typography.body,
    color: colors.white,
    fontWeight: '700',
  },
  outline: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: radius.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  outlineText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.5,
  },
});
