import { z } from 'zod';
import { EYE_ENLARGEMENT_BANDS } from '@/lib/products/eye-enlargement';

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
  // Whether the PDP prompts for a prescription. Cosmetic lenses sold plano-only
  // do not. Defaults to true: correction is the norm, so a fixture opts OUT.
  requiresRx: z.boolean().default(true),
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

// Comparison (spec §4 endpoint, §10 feature note). Request is capped at 4
// products — the same cap `useCompareStore` enforces client-side; enforced
// again here since the store cap is not a guarantee about the request body.
export const compareRequestSchema = z.object({
  productIds: z.array(z.string()).min(1).max(4),
});

// `eyeEnlargement` is computed by `eyeEnlargementBand()` at request time —
// see lib/products/eye-enlargement.ts. It is never stored on `ProductSpecs`.
export const comparisonRowSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  image: z.string(),
  color: z.string().optional(),
  colorLabel: z.string().optional(),
  diameter: z.string(),
  eyeEnlargement: z.enum(EYE_ENLARGEMENT_BANDS),
  // "Lifespan" (spec §10) is the existing replacement schedule under a
  // shopper-facing label — not a new field.
  lifespan: replacementScheduleSchema,
  price: z.number().int().nonnegative(),
  currency: currencySchema,
});

export const comparisonMatrixSchema = z.object({
  products: z.array(comparisonRowSchema),
});

// Lens Viewer (spec §10, §11). Image = a URL string, same shape as
// `Product.images`. `byEyeColor` is keyed by the model's natural eye color
// in the demo photo (e.g. "brown"), not the lens's own color variant.
export const lensGalleryContextsSchema = z.object({
  eye: z.array(z.string()),
  face: z.array(z.string()),
  withMakeup: z.array(z.string()),
  withoutMakeup: z.array(z.string()),
  byEyeColor: z.record(z.string(), z.array(z.string())),
});

export const lensGallerySchema = z.object({
  productId: z.string(),
  contexts: lensGalleryContextsSchema,
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

/**
 * Parses raw URL search params per-field, keeping every field that is
 * individually valid and dropping only the ones that aren't.
 *
 * `productQuerySchema.safeParse` is all-or-nothing: a single bad param (e.g.
 * an unrecognized `sort` value) fails the whole object, discarding otherwise
 * valid filters like `type`. That's correct for API route handlers, which
 * need to reject bad input and answer HTTP 400 naming the invalid field —
 * they should keep using `productQuerySchema` directly. Pages rendering a
 * user-facing URL should instead degrade gracefully per-field, so this is a
 * separate, additive entry point rather than a change to `productQuerySchema`.
 */
export function parseProductQueryLoose(input: Record<string, unknown>): ProductQuery {
  const kept: Record<string, unknown> = {};
  for (const [key, fieldSchema] of Object.entries(productQuerySchema.shape)) {
    if (fieldSchema.safeParse(input[key]).success) kept[key] = input[key];
  }
  return productQuerySchema.parse(kept);
}

export type LensType = z.infer<typeof lensTypeSchema>;
export type ReplacementSchedule = z.infer<typeof replacementScheduleSchema>;
export type ProductBadge = z.infer<typeof productBadgeSchema>;
export type Currency = z.infer<typeof currencySchema>;
export type ReviewSource = z.infer<typeof reviewSourceSchema>;
export type ProductSpecs = z.infer<typeof productSpecsSchema>;
export type Variant = z.infer<typeof variantSchema>;
export type Product = z.infer<typeof productSchema>;
export type Collection = z.infer<typeof collectionSchema>;
export type Review = z.infer<typeof reviewSchema>;
export type ProductQuery = z.infer<typeof productQuerySchema>;
export type CompareRequest = z.infer<typeof compareRequestSchema>;
export type ComparisonRow = z.infer<typeof comparisonRowSchema>;
export type ComparisonMatrix = z.infer<typeof comparisonMatrixSchema>;
export type LensGalleryContexts = z.infer<typeof lensGalleryContextsSchema>;
export type LensGallery = z.infer<typeof lensGallerySchema>;
