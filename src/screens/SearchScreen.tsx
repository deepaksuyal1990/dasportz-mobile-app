import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Keyboard,
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { searchAll, preloadSearchIndex, type SearchResult } from '../services/searchService';
import { productCategories } from '../data/content';
import { navigateToCategory } from '../utils/navigation';
import { navigateToTab } from '../utils/navHelpers';
import { colors, spacing, typography, radius } from '../constants/theme';
import { CloseButton } from '../components/CloseButton';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Search'>;

const TYPE_META: Record<
  SearchResult['type'],
  { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }
> = {
  cricket: { label: 'Cricket Bat', icon: 'baseball', color: colors.primary },
  catalog: { label: 'Product', icon: 'cube-outline', color: colors.accent },
  service: { label: 'Service', icon: 'construct-outline', color: '#3B82F6' },
  category: { label: 'Collection', icon: 'grid-outline', color: '#8B5CF6' },
  string: { label: 'String', icon: 'tennisball-outline', color: '#10B981' },
};

export function SearchScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState(route.params?.query ?? '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [indexReady, setIndexReady] = useState(false);

  useEffect(() => {
    preloadSearchIndex().then(() => setIndexReady(true));
    const timer = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, []);

  const runSearch = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }
    setLoading(true);
    const hits = await searchAll(trimmed);
    setResults(hits);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => runSearch(query), 200);
    return () => clearTimeout(timer);
  }, [query, runSearch]);

  function openResult(item: SearchResult) {
    Keyboard.dismiss();
    switch (item.type) {
      case 'cricket':
        navigation.navigate('CricketProductDetail', { productId: item.id });
        break;
      case 'service': {
        const serviceId = item.id.replace('service-', '');
        if (serviceId === 'badminton-stringing') navigation.navigate('StringingForm');
        else navigation.navigate('ServiceDetail', { serviceId });
        break;
      }
      case 'category': {
        const categoryId = item.id.replace('cat-', '');
        navigateToCategory(navigation, categoryId);
        break;
      }
      case 'catalog': {
        const catalogId = item.id.replace('catalog-', '');
        const parent = productCategories.find((c) => c.items.some((i) => i.id === catalogId));
        if (parent?.id === 'cricket-bats-gear') navigation.navigate('CricketBats');
        else if (parent) navigateToCategory(navigation, parent.id);
        else navigateToTab(navigation, 'Products');
        break;
      }
      case 'string':
        navigation.navigate('StringingForm');
        break;
    }
  }

  function renderItem({ item }: { item: SearchResult }) {
    const meta = TYPE_META[item.type];
    return (
      <TouchableOpacity style={styles.resultRow} onPress={() => openResult(item)} activeOpacity={0.85}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.thumb} />
        ) : (
          <View style={[styles.thumb, styles.thumbPlaceholder]}>
            <Ionicons name={meta.icon} size={20} color={meta.color} />
          </View>
        )}
        <View style={styles.resultBody}>
          <View style={styles.resultTop}>
            <Text style={styles.resultTitle} numberOfLines={1}>
              {item.title}
            </Text>
            {item.priceLabel ? <Text style={styles.resultPrice}>{item.priceLabel}</Text> : null}
          </View>
          <Text style={styles.resultSub} numberOfLines={2}>
            {item.subtitle}
          </Text>
          <View style={styles.badge}>
            <Text style={[styles.badgeText, { color: meta.color }]}>{meta.label}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder="Search products, bats, stringing, services..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
            underlineColorAndroid="transparent"
            selectionColor={colors.primary}
          />
          {query.length > 0 ? (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
        <CloseButton />
      </View>

      {!indexReady ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.hint}>Loading catalogue…</Text>
        </View>
      ) : loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : query.trim() && results.length === 0 ? (
        <View style={styles.centered}>
          <MaterialCommunityIcons name="magnify-close" size={48} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No results for "{query.trim()}"</Text>
          <Text style={styles.hint}>Try bats, SG, stringing, trophies, or repairs</Text>
        </View>
      ) : !query.trim() ? (
        <ScrollView contentContainerStyle={styles.suggestions} showsVerticalScrollIndicator={false}>
          <View style={styles.suggestionsInner}>
            <Text style={styles.suggestLabel}>POPULAR SEARCHES</Text>
            {['Cricket bats', 'Badminton stringing', 'SG', 'Bat knocking', 'Trophies', 'Freebowler'].map(
              (term) => (
                <TouchableOpacity
                  key={term}
                  style={styles.suggestChip}
                  onPress={() => setQuery(term)}
                >
                  <Ionicons name="search" size={14} color={colors.primary} />
                  <Text style={styles.suggestText}>{term}</Text>
                </TouchableOpacity>
              ),
            )}
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.md,
    height: 46,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    paddingVertical: 0,
    outlineStyle: 'none',
  } as object,
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  hint: { ...typography.bodySmall, color: colors.textMuted, textAlign: 'center' },
  emptyTitle: { ...typography.body, color: colors.text, fontWeight: '700', textAlign: 'center' },
  suggestions: { padding: spacing.lg },
  suggestionsInner: { gap: spacing.sm },
  suggestLabel: { ...typography.label, color: colors.textMuted, marginBottom: spacing.xs },
  suggestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  suggestText: { ...typography.bodySmall, color: colors.text, fontWeight: '600' },
  list: { paddingVertical: spacing.sm },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceLight,
  },
  thumbPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  resultBody: { flex: 1, gap: 2 },
  resultTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  resultTitle: { ...typography.body, color: colors.text, fontWeight: '700', flex: 1 },
  resultPrice: { ...typography.bodySmall, color: colors.primary, fontWeight: '700' },
  resultSub: { ...typography.caption, color: colors.textSecondary, lineHeight: 17 },
  badge: { alignSelf: 'flex-start', marginTop: 4 },
  badgeText: { ...typography.caption, fontWeight: '700' },
  separator: { height: 1, backgroundColor: colors.borderLight, marginLeft: spacing.lg + 52 + spacing.md },
});
