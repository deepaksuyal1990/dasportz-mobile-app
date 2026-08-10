import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator, TouchableOpacity } from 'react-native';
import { ProductCard } from './ProductCard';
import type { CricketProduct } from '../types/product';
import { colors, spacing, typography } from '../constants/theme';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = Math.min(168, SCREEN_W * 0.42);

type Props = {
  title: string;
  label: string;
  products: CricketProduct[];
  loading?: boolean;
  onPressProduct: (product: CricketProduct) => void;
  emptyText?: string;
  /** Optional link in the rail header (e.g. Browse all). */
  headerActionLabel?: string;
  onHeaderAction?: () => void;
};

export function ProductRail({
  title,
  label,
  products,
  loading,
  onPressProduct,
  emptyText = 'No products yet',
  headerActionLabel,
  onHeaderAction,
}: Props) {
  const head = (
    <View style={styles.head}>
      <View style={styles.headText}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
      {headerActionLabel && onHeaderAction ? (
        <TouchableOpacity onPress={onHeaderAction} hitSlop={8}>
          <Text style={styles.headerAction}>{headerActionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );

  if (loading) {
    return (
      <View>
        {head}
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </View>
    );
  }

  if (products.length === 0) {
    return (
      <View>
        {head}
        <View style={styles.empty}>
          <Text style={styles.emptyText}>{emptyText}</Text>
        </View>
      </View>
    );
  }

  return (
    <View>
      {head}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rail}
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            width={CARD_W}
            onPress={() => onPressProduct(product)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  head: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  headText: {
    flex: 1,
  },
  label: {
    ...typography.label,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  headerAction: {
    ...typography.bodySmall,
    color: colors.textMuted,
    fontWeight: '600',
    marginBottom: 2,
  },
  rail: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  loading: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  empty: {
    paddingVertical: spacing.md,
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
});
