import type { CricketProduct } from '../types/product';
import { getDiscountPercent } from './pricing';

function inStock(products: CricketProduct[]) {
  return products.filter((p) => p.inventory > 0 && p.images.length > 0);
}

/** Diversified featured picks across brands. */
export function pickFeaturedProducts(products: CricketProduct[], limit = 8): CricketProduct[] {
  const pool = inStock(products);
  const byBrand = new Map<string, CricketProduct[]>();

  for (const p of pool) {
    const list = byBrand.get(p.brand) ?? [];
    list.push(p);
    byBrand.set(p.brand, list);
  }

  const picks: CricketProduct[] = [];
  const brands = Array.from(byBrand.keys()).sort();

  // Round-robin brands so featured feels curated
  let guard = 0;
  while (picks.length < limit && guard < pool.length * 2) {
    for (const brand of brands) {
      if (picks.length >= limit) break;
      const list = byBrand.get(brand);
      const next = list?.shift();
      if (next) picks.push(next);
    }
    guard += 1;
  }

  return picks;
}

/** Bestsellers = strongest discounts (customers love deals). */
export function pickBestsellers(products: CricketProduct[], limit = 8): CricketProduct[] {
  return [...inStock(products)]
    .sort((a, b) => {
      const disc =
        getDiscountPercent(b.mrpPrice, b.sellingPrice) -
        getDiscountPercent(a.mrpPrice, a.sellingPrice);
      if (disc !== 0) return disc;
      return b.sellingPrice - a.sellingPrice;
    })
    .slice(0, limit);
}

export type PriceRangeId = 'all' | 'u5' | '5-10' | '10-15' | '15p';

export const PRICE_RANGES: Array<{
  id: PriceRangeId;
  label: string;
  min: number;
  max: number;
}> = [
  { id: 'all', label: 'All prices', min: 0, max: Number.POSITIVE_INFINITY },
  { id: 'u5', label: 'Under ₹5k', min: 0, max: 4999 },
  { id: '5-10', label: '₹5k–10k', min: 5000, max: 9999 },
  { id: '10-15', label: '₹10k–15k', min: 10000, max: 14999 },
  { id: '15p', label: '₹15k+', min: 15000, max: Number.POSITIVE_INFINITY },
];

export function matchesPriceRange(price: number, rangeId: PriceRangeId) {
  const range = PRICE_RANGES.find((r) => r.id === rangeId) ?? PRICE_RANGES[0];
  return price >= range.min && price <= range.max;
}
