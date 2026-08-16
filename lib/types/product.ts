export type LensType = 'clear' | 'colored' | 'toric' | 'multifocal';
export type ReplacementSchedule = 'daily' | 'biweekly' | 'monthly';
export type ProductBadge = 'new' | 'bestseller' | 'sale';
export type Currency = 'VND' | 'USD';

export interface ProductSpecs {
  material: string;
  waterContent: string;
  baseCurve: string;
  diameter: string;
  uvProtection: boolean;
  manufacturer: string;
}

export interface Variant {
  id: string;
  sku: string;
  color?: string;
  colorLabel?: string;
  packSize: string;
  price: number;
  compareAtPrice?: number;
  currency: Currency;
  stock: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brandId: string;
  brandName: string;
  type: LensType;
  replacement: ReplacementSchedule;
  description: string;
  images: string[];
  badges: ProductBadge[];
  specs: ProductSpecs;
  variants: Variant[];
  rating: number;
  reviewCount: number;
}
