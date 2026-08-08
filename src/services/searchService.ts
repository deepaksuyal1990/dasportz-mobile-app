import { productCategories, services } from '../data/content';
import { stringOptions } from '../data/stringing';
import { fetchCricketProducts } from './productsApi';
import type { CricketProduct } from '../types/product';

export type SearchResultType = 'cricket' | 'catalog' | 'service' | 'category' | 'string';

export type SearchResult = {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle: string;
  priceLabel?: string;
  imageUrl?: string;
  score: number;
};

let cricketCache: CricketProduct[] | null = null;
let cricketLoadPromise: Promise<CricketProduct[]> | null = null;

export async function preloadSearchIndex(): Promise<void> {
  if (cricketCache) return;
  if (!cricketLoadPromise) {
    cricketLoadPromise = fetchCricketProducts()
      .then((products) => {
        cricketCache = products;
        return products;
      })
      .catch(() => {
        cricketCache = [];
        return [];
      });
  }
  await cricketLoadPromise;
}

function scoreMatch(text: string, query: string): number {
  const hay = text.toLowerCase();
  if (hay === query) return 100;
  if (hay.startsWith(query)) return 80;
  if (hay.includes(query)) return 50;
  const words = query.split(/\s+/).filter(Boolean);
  if (words.every((w) => hay.includes(w))) return 40;
  return 0;
}

function buildStaticResults(query: string): SearchResult[] {
  const results: SearchResult[] = [];

  for (const category of productCategories) {
    const catScore = Math.max(
      scoreMatch(category.title, query),
      scoreMatch(category.description, query),
    );
    if (catScore > 0) {
      results.push({
        id: `cat-${category.id}`,
        type: 'category',
        title: category.title,
        subtitle: category.description,
        score: catScore,
      });
    }

    for (const item of category.items) {
      const text = [item.name, item.brand, item.description, category.title].filter(Boolean).join(' ');
      const itemScore = scoreMatch(text, query);
      if (itemScore > 0) {
        results.push({
          id: `catalog-${item.id}`,
          type: 'catalog',
          title: item.name,
          subtitle: [item.brand, category.title, item.description].filter(Boolean).join(' · '),
          priceLabel: item.priceNote,
          score: itemScore,
        });
      }
    }
  }

  for (const service of services) {
    const text = [service.title, service.description, service.badge, ...service.features].join(' ');
    const serviceScore = scoreMatch(text, query);
    if (serviceScore > 0) {
      results.push({
        id: `service-${service.id}`,
        type: 'service',
        title: service.title,
        subtitle: `${service.turnaround} · ${service.description}`,
        score: serviceScore,
      });
    }
  }

  for (const stringOption of stringOptions) {
    const stringScore = scoreMatch(stringOption.name, query);
    if (stringScore > 0) {
      results.push({
        id: `string-${stringOption.id}`,
        type: 'string',
        title: stringOption.name,
        subtitle: 'Badminton string · Book stringing service',
        priceLabel: `₹${stringOption.price.toLocaleString('en-IN')}`,
        score: stringScore - 5,
      });
    }
  }

  return results;
}

function buildCricketResults(query: string, products: CricketProduct[]): SearchResult[] {
  const results: SearchResult[] = [];
  for (const product of products) {
    const text = [
      product.title,
      product.brand,
      product.category,
      product.description,
      ...product.specifications,
    ].join(' ');
    const productScore = scoreMatch(text, query);
    if (productScore <= 0) continue;
    results.push({
      id: product.id,
      type: 'cricket',
      title: product.title,
      subtitle: `${product.brand} · ${product.category}`,
      priceLabel: `₹${product.sellingPrice.toLocaleString('en-IN')}`,
      imageUrl: product.images[0],
      score: productScore + 10,
    });
  }
  return results;
}

export async function searchAll(query: string): Promise<SearchResult[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  await preloadSearchIndex();
  const cricketResults = buildCricketResults(q, cricketCache ?? []);
  const staticResults = buildStaticResults(q);

  const merged = new Map<string, SearchResult>();
  for (const result of [...cricketResults, ...staticResults]) {
    const existing = merged.get(result.id);
    if (!existing || result.score > existing.score) {
      merged.set(result.id, result);
    }
  }

  return Array.from(merged.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 40);
}
