import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProductCard } from '../components/ProductCard';
import { fetchCricketProducts } from '../services/productsApi';
import type { CricketProduct, SortOption } from '../types/product';
import { colors, spacing, typography, radius } from '../constants/theme';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CricketBats'>;

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.lg * 2 - spacing.sm) / 2;

const sortOptions: { id: SortOption; label: string }[] = [
  { id: 'featured', label: 'Featured' },
  { id: 'price-asc', label: 'Price ↑' },
  { id: 'price-desc', label: 'Price ↓' },
  { id: 'discount', label: 'Best Deal' },
];

export function CricketBatsScreen({ navigation }: Props) {
  const [products, setProducts] = useState<CricketProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [brand, setBrand] = useState('All');
  const [sort, setSort] = useState<SortOption>('featured');

  const load = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError('');
      const data = await fetchCricketProducts();
      setProducts(data);
    } catch {
      setError('Unable to load cricket bats. Pull to refresh.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const brands = useMemo(() => {
    const set = new Set(products.map((p) => p.brand));
    return ['All', ...Array.from(set).sort()];
  }, [products]);

  const filtered = useMemo(() => {
    let list = [...products];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q),
      );
    }

    if (brand !== 'All') {
      list = list.filter((p) => p.brand === brand);
    }

    switch (sort) {
      case 'price-asc':
        list.sort((a, b) => a.sellingPrice - b.sellingPrice);
        break;
      case 'price-desc':
        list.sort((a, b) => b.sellingPrice - a.sellingPrice);
        break;
      case 'discount':
        list.sort(
          (a, b) =>
            (b.mrpPrice - b.sellingPrice) / b.mrpPrice -
            (a.mrpPrice - a.sellingPrice) / a.mrpPrice,
        );
        break;
      default:
        break;
    }

    return list;
  }, [products, search, brand, sort]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Unleashing Match-Ready Willow...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(true)}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.heroTag}>⚡ Unleashing Match-Ready Willow</Text>
            <Text style={styles.heroTitle}>Cricket Bats</Text>
            <Text style={styles.heroSub}>
              Official SG, SS & DSC English Willow bats — 100% genuine gear.
            </Text>

            <View style={styles.searchWrap}>
              <Ionicons name="search" size={18} color={colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search bats, brands..."
                placeholderTextColor={colors.textMuted}
                value={search}
                onChangeText={setSearch}
              />
              {search ? (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              ) : null}
            </View>

            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Brand</Text>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={brands}
                keyExtractor={(b) => b}
                contentContainerStyle={styles.chips}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.chip, brand === item && styles.chipActive]}
                    onPress={() => setBrand(item)}
                  >
                    <Text style={[styles.chipText, brand === item && styles.chipTextActive]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>

            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Sort</Text>
              <View style={styles.sortRow}>
                {sortOptions.map((opt) => (
                  <TouchableOpacity
                    key={opt.id}
                    style={[styles.chip, sort === opt.id && styles.chipActive]}
                    onPress={() => setSort(opt.id)}
                  >
                    <Text style={[styles.chipText, sort === opt.id && styles.chipTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Text style={styles.resultCount}>
              {filtered.length} bat{filtered.length !== 1 ? 's' : ''} found
            </Text>

            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>
        }
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            width={CARD_WIDTH}
            onPress={() => navigation.navigate('CricketProductDetail', { productId: item.id })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="baseball-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>No bats match your filters</Text>
          </View>
        }
      />
    </View>
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
    gap: spacing.md,
  },
  loadingText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  row: {
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: spacing.md,
    paddingTop: spacing.sm,
  },
  heroTag: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  heroTitle: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  heroSub: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    paddingVertical: spacing.sm + 4,
  },
  filterRow: {
    marginBottom: spacing.sm,
  },
  filterLabel: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  chips: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  sortRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  chipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.primary,
  },
  resultCount: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  error: {
    ...typography.caption,
    color: colors.error,
    marginBottom: spacing.sm,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
  },
});
