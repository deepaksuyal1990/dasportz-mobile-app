import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, radius } from '../constants/theme';

type Props = {
  steps: readonly string[];
  currentStep: number;
};

export function StepIndicator({ steps, currentStep }: Props) {
  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;

        return (
          <View key={step} style={styles.stepWrapper}>
            <View style={styles.stepRow}>
              <View
                style={[
                  styles.circle,
                  isActive && styles.circleActive,
                  isCompleted && styles.circleCompleted,
                ]}
              >
                <Text
                  style={[
                    styles.circleText,
                    (isActive || isCompleted) && styles.circleTextActive,
                  ]}
                >
                  {stepNumber}
                </Text>
              </View>
              {index < steps.length - 1 ? (
                <View style={[styles.line, isCompleted && styles.lineCompleted]} />
              ) : null}
            </View>
            <Text style={[styles.label, isActive && styles.labelActive]}>{step}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stepWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceLight,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  circleActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  circleCompleted: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryDark,
  },
  circleText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
  },
  circleTextActive: {
    color: colors.white,
  },
  line: {
    position: 'absolute',
    left: '60%',
    right: '-40%',
    height: 2,
    backgroundColor: colors.border,
    top: 15,
  },
  lineCompleted: {
    backgroundColor: colors.primary,
  },
  label: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.sm,
    fontWeight: '600',
  },
  labelActive: {
    color: colors.primary,
  },
});
