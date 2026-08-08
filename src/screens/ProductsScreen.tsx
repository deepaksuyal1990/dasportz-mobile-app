import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { ScreenHeader } from '../components/ScreenHeader';
import { CategoryCard } from '../components/CategoryCard';
import { productCategories } from '../data/content';
import { colors, spacing, typography } from '../constants/theme';
import { navigateToCategory } from '../utils/navigation';
import type { TabScreenProps } from '../navigation/types';

type Props = TabScreenProps<'Products'>;

export function ProductsScreen({ navigation }: Props) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ScreenHeader
        title="Products"
        subtitle="100% genuine sports equipment from official brand manufacturers."
      />

      <View style={styles.content}>
        {productCategories.map((category) => (
          <CategoryCard
            key={category.id}
            title={category.title}
            description={category.description}
            icon={category.icon}
            gradient={category.gradient}
            onPress={() => navigateToCategory(navigation, category.id)}
          />
        ))}

        <View style={styles.note}>
          <Text style={styles.noteTitle}>Express Nationwide Delivery</Text>
          <Text style={styles.noteText}>
            All products are sourced directly from official brand manufacturers. Contact us for
            pricing, availability, and bulk orders.
          </Text>
        </View>
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
  note: {
    marginTop: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noteTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  noteText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});
