import type { CricketProduct } from '../types/product';
import fallbackData from '../data/cricketProducts.fallback.json';

const API_BASE = 'https://kg7kg65ok2hvfox6l4gtniqhsi0ckmox.lambda-url.ap-south-1.on.aws';
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
      `${API_BASE}/api/products?shopId=${SHOP_ID}&status=live`,
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

export function getBatSizes(product: CricketProduct): string[] {
  const sizes = new Set<string>();
  const sources = [...product.specifications, product.description];

  for (const text of sources) {
    const match = text.match(/Size:\s*([^\n]+)/i);
    if (match) {
      match[1]
        .split(/[,/&]/)
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((s) => sizes.add(s));
    }
  }

  if (sizes.size === 0) sizes.add('SH');
  return Array.from(sizes);
}
