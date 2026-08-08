export type CricketProduct = {
  id: string;
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

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'discount';

export type BrandFilter = 'All' | string;
