import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { CricketProduct } from '../types/product';
import { formatPrice, getDiscountPercent } from '../utils/pricing';
import { colors, spacing, typography, radius } from '../constants/theme';

type Props = {
  product: CricketProduct;
  onPress: () => void;
  width: number;
};

export function ProductCard({ product, onPress, width }: Props) {
  const discount = getDiscountPercent(product.mrpPrice, product.sellingPrice);
  const outOfStock = product.inventory <= 0;

  return (
    <TouchableOpacity
      style={[styles.card, { width }]}
      onPress={onPress}
      activeOpacity={0.9}
      disabled={outOfStock}
    >
      <View style={styles.imageWrap}>
        <Image source={{ uri: product.images[0] }} style={styles.image} resizeMode="cover" />
        {discount > 0 ? (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discount}% OFF</Text>
          </View>
        ) : null}
        {outOfStock ? (
          <View style={styles.soldOverlay}>
            <Text style={styles.soldText}>Sold Out</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.body}>
        <Text style={styles.brand}>{product.brand}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatPrice(product.sellingPrice)}</Text>
          {product.mrpPrice > product.sellingPrice ? (
            <Text style={styles.mrp}>{formatPrice(product.mrpPrice)}</Text>
          ) : null}
        </View>
        <View style={styles.footer}>
          <Ionicons name="shield-checkmark" size={12} color={colors.primary} />
          <Text style={styles.genuine}>100% Genuine</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.md,
  },
  imageWrap: {
    aspectRatio: 1,
    backgroundColor: colors.surfaceLight,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  discountText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.white,
  },
  soldOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(6,13,24,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  soldText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
  },
  body: {
    padding: spacing.sm + 2,
  },
  brand: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
    marginBottom: 2,
  },
  title: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
    minHeight: 40,
    marginBottom: spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  price: {
    ...typography.body,
    color: colors.text,
    fontWeight: '800',
  },
  mrp: {
    ...typography.caption,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  genuine: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
  },
});
