import { z } from 'zod';
import { EYE_ENLARGEMENT_BANDS } from '@/lib/products/eye-enlargement';
import { distinctColorVariants } from '@/lib/products/variant-colors';

export const lensTypeSchema = z.enum(['clear', 'colored', 'toric', 'multifocal']);
export const replacementScheduleSchema = z.enum(['daily', 'monthly', 'threeMonth', 'sixMonth']);
export const productBadgeSchema = z.enum(['new', 'bestseller', 'sale']);
export const currencySchema = z.enum(['VND', 'USD']);
export const reviewSourceSchema = z.enum(['shopee', 'tiktok', 'vivimoon']);

export const productSpecsSchema = z.object({
  material: z.string(),
  waterContent: z.string(),
  baseCurve: z.string(),
  diameter: z.string(),
  // The colored/graphic-zone diameter, distinct from total `diameter` — what
  // actually drives the visual enlargement effect (ADR-0011). Absent for any
  // lens with no colored zone (clear, toric, multifocal).
  graphicDiameter: z.string().optional(),
  origin: z.string(),
});

export const variantSchema = z.object({
  id: z.string(),
  sku: z.string(),
  color: z.string().optional(),
  colorLabel: z.string().optional(),
  // Whole-currency units: VND has no minor unit, USD is stored as whole dollars.
  price: z.number().int().nonnegative(),
  compareAtPrice: z.number().int().nonnegative().optional(),
  currency: currencySchema,
  stock: z.number().int().nonnegative(),
}).superRefine((v, ctx) => {
  // CartLine.color is built from colorLabel (add-to-cart.tsx), not color —
  // if only color were set, the cart line would silently lose its color.
  // Falsy (not just `undefined`) so an empty-string value counts as absent,
  // matching distinctColorVariants' truthy filter.
  if (Boolean(v.color) !== Boolean(v.colorLabel)) {
    ctx.addIssue({
      code: 'custom',
      message: 'color and colorLabel must both be present or both be absent',
      // Points at whichever field is actually missing.
      path: [v.color ? 'colorLabel' : 'color'],
    });
  }
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
}).superRefine((p, ctx) => {
  // Now that packSize is gone, color is the only thing VariantSelector uses to
  // pick a variant — enforcing these here (construction/validation boundary)
  // means every consumer (compare, spec table, cart) can trust the invariant
  // instead of each re-deriving or silently mishandling bad data.
  // Reuses distinctColorVariants' own (truthy) definition of "has a color"
  // rather than a second, independent dedup, so the two can't diverge.
  const coloredVariants = p.variants.filter((v) => v.color);
  if (distinctColorVariants(p.variants).length !== coloredVariants.length) {
    ctx.addIssue({
      code: 'custom',
      // A repeated color would make the second variant unreachable in the UI
      // — there is no other selector left to disambiguate it.
      message: 'variants must not repeat the same color',
      path: ['variants'],
    });
  }
  const hasColorlessVariant = p.variants.some((v) => !v.color);
  if (hasColorlessVariant && p.variants.length > 1) {
    ctx.addIssue({
      code: 'custom',
      // A colorless variant can't be disambiguated from any other variant by
      // the UI, so it must be the product's only one.
      message: 'a colorless variant must be the product’s only variant',
      path: ['variants'],
    });
  }
  if (p.type === 'colored' && !p.specs.graphicDiameter) {
    ctx.addIssue({
      code: 'custom',
      // eyeEnlargementBand(undefined) bands 'natural', which is correct for a
      // colorless lens (ADR-0011) but wrong for a colored product that's
      // simply missing data — enforced here so every consumer can rely on it
      // rather than each guessing or guarding separately.
      message: 'a colored product must specify specs.graphicDiameter',
      path: ['specs', 'graphicDiameter'],
    });
  }
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
