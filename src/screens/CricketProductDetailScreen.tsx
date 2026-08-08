import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../components/Button';
import { fetchProductById } from '../services/productsApi';
import type { CricketProduct } from '../types/product';
import { formatPrice, getDiscountPercent } from '../utils/pricing';
import { colors, spacing, typography, radius } from '../constants/theme';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CricketProductDetail'>;

const { width } = Dimensions.get('window');

export function CricketProductDetailScreen({ route, navigation }: Props) {
  const [product, setProduct] = useState<CricketProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    fetchProductById(route.params.productId)
      .then(setProduct)
      .finally(() => setLoading(false));
  }, [route.params.productId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Product not found.</Text>
      </View>
    );
  }

  const discount = getDiscountPercent(product.mrpPrice, product.sellingPrice);
  const outOfStock = product.inventory <= 0;

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            setActiveImage(index);
          }}
        >
          {product.images.map((uri, i) => (
            <Image key={uri} source={{ uri }} style={styles.heroImage} resizeMode="contain" />
          ))}
        </ScrollView>

        <View style={styles.dots}>
          {product.images.map((_, i) => (
            <View key={i} style={[styles.dot, i === activeImage && styles.dotActive]} />
          ))}
        </View>

        <View style={styles.content}>
          <View style={styles.brandRow}>
            <Text style={styles.brand}>{product.brand}</Text>
            {discount > 0 ? (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{discount}% OFF</Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.title}>{product.title}</Text>

          <View style={styles.priceBlock}>
            <Text style={styles.price}>{formatPrice(product.sellingPrice)}</Text>
            {product.mrpPrice > product.sellingPrice ? (
              <Text style={styles.mrp}>MRP {formatPrice(product.mrpPrice)}</Text>
            ) : null}
          </View>

          <View style={styles.trustRow}>
            <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
            <Text style={styles.trustText}>100% Genuine · Official Brand</Text>
          </View>

          {outOfStock ? (
            <View style={styles.stockBanner}>
              <Text style={styles.stockText}>Currently out of stock</Text>
            </View>
          ) : (
            <View style={styles.stockBannerIn}>
              <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
              <Text style={styles.stockInText}>In stock — {product.inventory} available</Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>Specifications</Text>
          {product.specifications.map((spec, i) => (
            <View key={i} style={styles.specRow}>
              <Ionicons name="checkmark" size={14} color={colors.primary} />
              <Text style={styles.specText}>{spec.replace(/&amp;/g, '&')}</Text>
            </View>
          ))}

          {product.description ? (
            <>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{product.description.replace(/&amp;/g, '&')}</Text>
            </>
          ) : null}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={outOfStock ? 'Out of Stock' : 'Buy Now — Checkout'}
          onPress={() =>
            navigation.navigate('CricketCheckout', { productId: product.id })
          }
          style={styles.buyBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
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
  heroImage: {
    width,
    height: width * 0.9,
    backgroundColor: colors.surface,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 18,
    backgroundColor: colors.primary,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  brand: {
    ...typography.label,
    color: colors.primary,
  },
  discountBadge: {
    backgroundColor: colors.accentSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  discountText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.accent,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
  },
  priceBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  price: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  mrp: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  trustText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  stockBanner: {
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  stockText: {
    ...typography.bodySmall,
    color: colors.error,
    fontWeight: '600',
    textAlign: 'center',
  },
  stockBannerIn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  stockInText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  specRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    paddingRight: spacing.md,
  },
  specText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  description: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  buyBtn: {
    width: '100%',
  },
});
