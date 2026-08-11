import type { CricketProduct } from '../types/product';
import fallbackData from '../data/cricketProducts.fallback.json';
import { getApiBase } from './apiBase';

const SHOP_ID = 'dasportz';
const REQUEST_TIMEOUT_MS = 15000;

type ApiProduct = {
  _id: string;
  shopId: string;
  title: string;
  brand: string;
  category: string;
  mrpPrice: number;
  sellingPrice: number;
  inventory: number;
  status: string;
  images: string[];
  specifications: string[];
  description: string;
  productUrl?: string;
};

type ApiResponse = {
  success: boolean;
  products: ApiProduct[];
};

function mapProduct(p: ApiProduct): CricketProduct {
  return {
    id: p._id,
    shopId: p.shopId,
    title: p.title,
    brand: p.brand,
    category: p.category,
    mrpPrice: p.mrpPrice,
    sellingPrice: p.sellingPrice,
    inventory: p.inventory,
    status: p.status,
    images: p.images ?? [],
    specifications: p.specifications ?? [],
    description: p.description ?? '',
    productUrl: p.productUrl,
  };
}

function filterBats(products: ApiProduct[]): CricketProduct[] {
  return products
    .map(mapProduct)
    .filter((p) => p.category === 'Bats' && p.images.length > 0);
}

function getFallbackProducts(): CricketProduct[] {
  const data = fallbackData as ApiResponse;
  if (!data.success || !Array.isArray(data.products)) return [];
  return filterBats(data.products);
}

async function fetchFromApi(): Promise<CricketProduct[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(
      `${getApiBase()}/api/products?shopId=${SHOP_ID}&status=live`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      },
    );

    if (!res.ok) {
      throw new Error(`API responded with ${res.status}`);
    }

    const data: ApiResponse = await res.json();
    if (!data.success || !Array.isArray(data.products)) {
      throw new Error('Invalid product response');
    }

    const bats = filterBats(data.products);
    if (bats.length === 0) {
      throw new Error('No bats in API response');
    }

    return bats;
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchCricketProducts(): Promise<CricketProduct[]> {
  try {
    return await fetchFromApi();
  } catch {
    const fallback = getFallbackProducts();
    if (fallback.length > 0) return fallback;
    throw new Error('Unable to load cricket bats');
  }
}

export async function fetchProductById(id: string): Promise<CricketProduct | null> {
  const products = await fetchCricketProducts();
  return products.find((p) => p.id === id) ?? null;
}

/** Normalize a raw Size: value into a short filter/checkout label. */
function normalizeBatSize(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;

  // Prefer the leading size token before any explanation in parentheses.
  const beforeParen = value.split('(')[0].trim();
  const token =
    beforeParen.match(/^(SH|LH|Harrow)\b/i)?.[1] ??
    beforeParen.match(/^Full[- ]?Size\b/i)?.[0] ??
    beforeParen.match(/^(?:Size\s*)?(\d+)\b/i)?.[1] ??
    null;

  if (!token) {
    // Fall back to the short phrase before punctuation, if it looks like a size.
    const fallback = beforeParen.split(/[,/&]/)[0]?.trim();
    return fallback || null;
  }

  if (/^full[- ]?size$/i.test(token)) return 'Full Size';
  if (/^\d+$/.test(token)) return token;
  return token.toUpperCase();
}

/**
 * Sizes from product specifications only — entries that start with "Size:".
 * Does not invent sizes from description/marketing copy.
 */
export function getBatSizes(product: CricketProduct): string[] {
  const sizes = new Set<string>();

  for (const raw of product.specifications ?? []) {
    const text = String(raw).trim();
    const match = text.match(/^Size:\s*(.+)$/i);
    if (!match) continue;

    // Allow "Size: SH / 5" style lists, but only from the Size: field.
    match[1]
      .split(/[,/&]/)
      .map((part) => normalizeBatSize(part))
      .filter((s): s is string => Boolean(s))
      .forEach((s) => sizes.add(s));
  }

  return Array.from(sizes);
}

/** Checkout helper — falls back to SH when specs omit Size:. */
export function getBatSizesForCheckout(product: CricketProduct): string[] {
  const sizes = getBatSizes(product);
  return sizes.length > 0 ? sizes : ['SH'];
}
