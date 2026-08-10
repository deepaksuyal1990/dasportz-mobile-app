import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
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
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProductCard } from '../components/ProductCard';
import { fetchCricketProducts, getBatSizes } from '../services/productsApi';
import type { CricketProduct, SortOption } from '../types/product';
import { buildBatCatalogueFilters } from '../utils/batFilters';
import { matchesPriceRange, type PriceRangeId } from '../utils/productPicks';
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

function toggleValue<T extends string>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function Chip({
  label,
  active,
  onPress,
  showCheck,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
  showCheck?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {showCheck && active ? (
        <Ionicons name="checkmark" size={12} color={colors.primary} style={styles.chipIcon} />
      ) : null}
      <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.sheetSection}>
      <Text style={styles.sheetSectionTitle}>{title}</Text>
      <View style={styles.chipWrap}>{children}</View>
    </View>
  );
}

export function CricketBatsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [products, setProducts] = useState<CricketProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [brandsSelected, setBrandsSelected] = useState<string[]>([]);
  const [pricesSelected, setPricesSelected] = useState<PriceRangeId[]>([]);
  const [sizesSelected, setSizesSelected] = useState<string[]>([]);
  const [sort, setSort] = useState<SortOption>('featured');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const hasCatalogueRef = useRef(false);

  const load = useCallback(async (mode: 'initial' | 'refresh' | 'silent' = 'initial') => {
    try {
      if (mode === 'refresh') setRefreshing(true);
      else if (mode === 'initial') setLoading(true);
      setError('');
      const data = await fetchCricketProducts();
      setProducts(data);
      hasCatalogueRef.current = data.length > 0;
    } catch {
      setError('Unable to load cricket bats. Pull to refresh.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Reload catalogue on focus so new brands/sizes from the API show up in filters.
  useFocusEffect(
    useCallback(() => {
      void load(hasCatalogueRef.current ? 'silent' : 'initial');
    }, [load]),
  );

  const { brands, sizes, priceRanges: priceOptions } = useMemo(
    () => buildBatCatalogueFilters(products),
    [products],
  );

  // Drop stale selections when the catalogue changes.
  useEffect(() => {
    setBrandsSelected((prev) => prev.filter((b) => brands.includes(b)));
    setSizesSelected((prev) => prev.filter((s) => sizes.includes(s)));
    setPricesSelected((prev) =>
      prev.filter((id) => priceOptions.some((p) => p.id === id)),
    );
  }, [brands, sizes, priceOptions]);

  const activeFilterCount =
    brandsSelected.length + pricesSelected.length + sizesSelected.length;

  const hasActiveFilters = activeFilterCount > 0 || search.trim().length > 0;

  const filtered = useMemo(() => {
    let list = [...products];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) => p.title.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q),
      );
    }

    if (brandsSelected.length > 0) {
      list = list.filter((p) => brandsSelected.includes(p.brand));
    }

    if (pricesSelected.length > 0) {
      list = list.filter((p) =>
        pricesSelected.some((rangeId) => matchesPriceRange(p.sellingPrice, rangeId)),
      );
    }

    if (sizesSelected.length > 0) {
      list = list.filter((p) => getBatSizes(p).some((s) => sizesSelected.includes(s)));
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
  }, [products, search, brandsSelected, pricesSelected, sizesSelected, sort]);

  function clearFilters() {
    setSearch('');
    setBrandsSelected([]);
    setPricesSelected([]);
    setSizesSelected([]);
    setSort('featured');
  }

  function clearSheetFilters() {
    setBrandsSelected([]);
    setPricesSelected([]);
    setSizesSelected([]);
  }

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
            onRefresh={() => load('refresh')}
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

            <View style={styles.toolbar}>
              <TouchableOpacity
                style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]}
                onPress={() => setFiltersOpen(true)}
                activeOpacity={0.85}
              >
                <Ionicons
                  name="options-outline"
                  size={18}
                  color={activeFilterCount > 0 ? colors.primary : colors.text}
                />
                <Text
                  style={[
                    styles.filterBtnText,
                    activeFilterCount > 0 && styles.filterBtnTextActive,
                  ]}
                >
                  Filters
                </Text>
                {activeFilterCount > 0 ? (
                  <View style={styles.filterBadge}>
                    <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                  </View>
                ) : null}
              </TouchableOpacity>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.sortScroll}
                style={styles.sortScrollWrap}
              >
                {sortOptions.map((opt) => (
                  <Chip
                    key={opt.id}
                    label={opt.label}
                    active={sort === opt.id}
                    onPress={() => setSort(opt.id)}
                  />
                ))}
              </ScrollView>
            </View>

            {activeFilterCount > 0 ? (
              <View style={styles.activeFilters}>
                {brandsSelected.map((brand) => (
                  <TouchableOpacity
                    key={`brand-${brand}`}
                    style={styles.activeChip}
                    onPress={() => setBrandsSelected((prev) => toggleValue(prev, brand))}
                  >
                    <Text style={styles.activeChipText}>{brand}</Text>
                    <Ionicons name="close" size={14} color={colors.primary} />
                  </TouchableOpacity>
                ))}
                {pricesSelected.map((id) => {
                  const label = priceOptions.find((p) => p.id === id)?.label ?? id;
                  return (
                    <TouchableOpacity
                      key={`price-${id}`}
                      style={styles.activeChip}
                      onPress={() => setPricesSelected((prev) => toggleValue(prev, id))}
                    >
                      <Text style={styles.activeChipText}>{label}</Text>
                      <Ionicons name="close" size={14} color={colors.primary} />
                    </TouchableOpacity>
                  );
                })}
                {sizesSelected.map((size) => (
                  <TouchableOpacity
                    key={`size-${size}`}
                    style={styles.activeChip}
                    onPress={() => setSizesSelected((prev) => toggleValue(prev, size))}
                  >
                    <Text style={styles.activeChipText}>Size {size}</Text>
                    <Ionicons name="close" size={14} color={colors.primary} />
                  </TouchableOpacity>
                ))}
                <TouchableOpacity onPress={clearSheetFilters} hitSlop={8}>
                  <Text style={styles.clearFilters}>Clear all</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            <View style={styles.resultRow}>
              <Text style={styles.resultCount}>
                {filtered.length} bat{filtered.length !== 1 ? 's' : ''} found
              </Text>
              {hasActiveFilters ? (
                <TouchableOpacity onPress={clearFilters}>
                  <Text style={styles.clearFilters}>Reset</Text>
                </TouchableOpacity>
              ) : null}
            </View>

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
            {hasActiveFilters ? (
              <TouchableOpacity onPress={clearFilters}>
                <Text style={styles.clearFilters}>Clear filters</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        }
      />

      <Modal
        visible={filtersOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setFiltersOpen(false)}
      >
        <View style={styles.sheetRoot}>
          <Pressable style={styles.sheetBackdrop} onPress={() => setFiltersOpen(false)} />
          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setFiltersOpen(false)} hitSlop={12}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.sheetBody}
              contentContainerStyle={styles.sheetBodyContent}
              showsVerticalScrollIndicator={false}
            >
              <FilterSection title="Brand">
                {brands.map((brand) => (
                  <Chip
                    key={brand}
                    label={brand}
                    active={brandsSelected.includes(brand)}
                    showCheck
                    onPress={() => setBrandsSelected((prev) => toggleValue(prev, brand))}
                  />
                ))}
              </FilterSection>

              <FilterSection title="Price">
                {priceOptions.map((item) => (
                  <Chip
                    key={item.id}
                    label={item.label}
                    active={pricesSelected.includes(item.id)}
                    showCheck
                    onPress={() => setPricesSelected((prev) => toggleValue(prev, item.id))}
                  />
                ))}
              </FilterSection>

              {sizes.length > 0 ? (
                <FilterSection title="Size">
                  {sizes.map((size) => (
                    <Chip
                      key={size}
                      label={size}
                      active={sizesSelected.includes(size)}
                      showCheck
                      onPress={() => setSizesSelected((prev) => toggleValue(prev, size))}
                    />
                  ))}
                </FilterSection>
              ) : null}
            </ScrollView>

            <View style={styles.sheetFooter}>
              <TouchableOpacity
                style={styles.sheetSecondaryBtn}
                onPress={clearSheetFilters}
                activeOpacity={0.85}
              >
                <Text style={styles.sheetSecondaryText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sheetPrimaryBtn}
                onPress={() => setFiltersOpen(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.sheetPrimaryText}>
                  Show {filtered.length} bat{filtered.length !== 1 ? 's' : ''}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  filterBtnActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  filterBtnText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '700',
  },
  filterBtnTextActive: {
    color: colors.primary,
  },
  filterBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    ...typography.caption,
    color: colors.background,
    fontWeight: '800',
    fontSize: 10,
  },
  sortScrollWrap: {
    flex: 1,
  },
  sortScroll: {
    gap: spacing.sm,
    alignItems: 'center',
    paddingRight: spacing.sm,
  },
  activeFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  activeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  activeChipText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
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
  chipIcon: {
    marginRight: 4,
  },
  chipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.primary,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  resultCount: {
    ...typography.caption,
    color: colors.textMuted,
  },
  clearFilters: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
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
  sheetRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.overlay,
  },
  sheet: {
    maxHeight: '82%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  sheetTitle: {
    ...typography.h3,
    color: colors.text,
  },
  sheetBody: {
    flexGrow: 0,
  },
  sheetBodyContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.lg,
  },
  sheetSection: {
    gap: spacing.sm,
  },
  sheetSectionTitle: {
    ...typography.label,
    color: colors.textMuted,
  },
  sheetFooter: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  sheetSecondaryBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceElevated,
  },
  sheetSecondaryText: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
  },
  sheetPrimaryBtn: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  sheetPrimaryText: {
    ...typography.bodySmall,
    color: colors.background,
    fontWeight: '800',
  },
});
