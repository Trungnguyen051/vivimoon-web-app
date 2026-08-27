import { z } from 'zod';

export const lensTypeSchema = z.enum(['clear', 'colored', 'toric', 'multifocal']);
export const replacementScheduleSchema = z.enum(['daily', 'biweekly', 'monthly']);
export const productBadgeSchema = z.enum(['new', 'bestseller', 'sale']);
export const currencySchema = z.enum(['VND', 'USD']);
export const reviewSourceSchema = z.enum(['shopee', 'tiktok', 'vivimoon']);

export const productSpecsSchema = z.object({
  material: z.string(),
  waterContent: z.string(),
  baseCurve: z.string(),
  diameter: z.string(),
  uvProtection: z.boolean(),
  manufacturer: z.string(),
});

export const variantSchema = z.object({
  id: z.string(),
  sku: z.string(),
  color: z.string().optional(),
  colorLabel: z.string().optional(),
  packSize: z.string(),
  // Whole-currency units: VND has no minor unit, USD is stored as whole dollars.
  price: z.number().int().nonnegative(),
  compareAtPrice: z.number().int().nonnegative().optional(),
  currency: currencySchema,
  stock: z.number().int().nonnegative(),
});

export const productSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  brandId: z.string(),
  brandName: z.string(),
  type: lensTypeSchema,
  replacement: replacementScheduleSchema,
  description: z.string(),
  images: z.array(z.string()).min(1),
  badges: z.array(productBadgeSchema),
  specs: productSpecsSchema,
  variants: z.array(variantSchema).min(1),
  rating: z.number().min(0).max(5),
  reviewCount: z.number().int().nonnegative(),
});

export const collectionSchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string().optional(),
  bannerImage: z.string().optional(),
  productIds: z.array(z.string()),
});

export const reviewSchema = z.object({
  id: z.string(),
  productId: z.string(),
  author: z.string(),
  rating: z.number().min(0).max(5),
  title: z.string(),
  body: z.string(),
  createdAt: z.string(),
  hasImages: z.boolean(),
  // Reviews are mirrored from marketplace listings; provenance drives the badge.
  source: reviewSourceSchema.default('vivimoon'),
  sourceUrl: z.string().url().optional(),
});

const blankToUndefined = <T extends z.ZodTypeAny>(inner: T) =>
  z.preprocess((v) => (v === '' || v === null ? undefined : v), inner.optional());

/** Parses raw URL search params, so pages can hand `searchParams` straight in. */
export const productQuerySchema = z.object({
  type: blankToUndefined(lensTypeSchema),
  replacement: blankToUndefined(replacementScheduleSchema),
  brandId: blankToUndefined(z.string()),
  color: blankToUndefined(z.string()),
  sort: blankToUndefined(z.enum(['newest', 'price-asc', 'price-desc', 'bestselling'])),
});

export type LensType = z.infer<typeof lensTypeSchema>;
export type ReplacementSchedule = z.infer<typeof replacementScheduleSchema>;
export type ProductBadge = z.infer<typeof productBadgeSchema>;
export type Currency = z.infer<typeof currencySchema>;
export type ReviewSource = z.infer<typeof reviewSourceSchema>;
export type ProductSpecs = z.infer<typeof productSpecsSchema>;
export type Variant = z.infer<typeof variantSchema>;
export type Product = z.infer<typeof productSchema>;
export type Collection = z.infer<typeof collectionSchema>;
// z.input, not z.infer: `source` has a `.default()`, so it's optional on the
// way in (hand-authored fixtures may omit it) even though `.parse()` always
// fills it in on the way out.
export type Review = z.input<typeof reviewSchema>;
export type ProductQuery = z.infer<typeof productQuerySchema>;
