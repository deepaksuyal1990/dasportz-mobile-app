import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../components/Button';
import { productCategories } from '../data/content';
import { colors, spacing, typography, radius } from '../constants/theme';
import { openWhatsApp } from '../utils/linking';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductCategory'>;

const iconMap = {
  baseball: 'baseball' as const,
  trophy: 'trophy' as const,
  speedometer: 'speedometer' as const,
};

export function ProductCategoryScreen({ route }: Props) {
  const category = productCategories.find((c) => c.id === route.params.categoryId);

  if (!category) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Category not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={category.gradient} style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name={iconMap[category.icon]} size={36} color={colors.white} />
        </View>
        <Text style={styles.heroTitle}>{category.title}</Text>
        <Text style={styles.heroDescription}>{category.description}</Text>
      </LinearGradient>

      <View style={styles.content}>
        {category.items.map((item) => (
          <View key={item.id} style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemName}>{item.name}</Text>
              {item.brand ? (
                <View style={styles.brandBadge}>
                  <Text style={styles.brandText}>{item.brand}</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.itemDescription}>{item.description}</Text>
            <Text style={styles.priceNote}>{item.priceNote}</Text>
            <Button
              title="Enquire on WhatsApp"
              variant="whatsapp"
              onPress={() =>
                openWhatsApp(`Hi, I'm interested in ${item.name}. Please share pricing and availability.`)
              }
              style={styles.enquireBtn}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  errorText: {
    color: colors.textSecondary,
  },
  hero: {
    padding: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  heroTitle: {
    ...typography.h1,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  heroDescription: {
    ...typography.body,
    color: 'rgba(255,255,255,0.9)',
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  itemCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  itemName: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
  },
  brandBadge: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  brandText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
  },
  itemDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  priceNote: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  enquireBtn: {
    marginTop: spacing.xs,
  },
});
