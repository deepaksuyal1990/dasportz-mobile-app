import type { CricketProduct } from '../types/product';
import { getBatSizes } from '../services/productsApi';
import {
  matchesPriceRange,
  PRICE_RANGES,
  type PriceRangeId,
} from './productPicks';

export type BatCatalogueFilters = {
  brands: string[];
  sizes: string[];
  priceRanges: Array<{ id: Exclude<PriceRangeId, 'all'>; label: string }>;
};

function sortSizes(a: string, b: string) {
  const na = Number(a);
  const nb = Number(b);
  const aNum = !Number.isNaN(na) && String(na) === a;
  const bNum = !Number.isNaN(nb) && String(nb) === b;
  if (aNum && bNum) return na - nb;
  if (aNum) return -1;
  if (bNum) return 1;
  return a.localeCompare(b);
}

/**
 * Build filter options from the live catalogue.
 * Brands / sizes / price buckets appear only when at least one product has them.
 * Adding a new bat (e.g. Size: 4 or brand "DSC") updates filters on next fetch.
 */
export function buildBatCatalogueFilters(products: CricketProduct[]): BatCatalogueFilters {
  const brands = new Set<string>();
  const sizes = new Set<string>();

  for (const product of products) {
    if (product.brand?.trim()) brands.add(product.brand.trim());
    for (const size of getBatSizes(product)) sizes.add(size);
  }

  const priceRanges = PRICE_RANGES.filter(
    (range) =>
      range.id !== 'all' &&
      products.some((p) => matchesPriceRange(p.sellingPrice, range.id)),
  ).map((range) => ({
    id: range.id as Exclude<PriceRangeId, 'all'>,
    label: range.label,
  }));

  return {
    brands: Array.from(brands).sort((a, b) => a.localeCompare(b)),
    sizes: Array.from(sizes).sort(sortSizes),
    priceRanges,
  };
}
