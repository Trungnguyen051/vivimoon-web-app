# Vivimoon M1 — Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the in-process `ProductRepository` with an HTTP API seam backed by mock endpoints, and ship authentication and account info against it.

**Architecture:** Every resource resolves through `lib/api/resources/<name>/index.ts`, which picks a mock or upstream implementation from per-resource env config. Server Components import that module directly; Client Components call `/api/*` route handlers that delegate to the same module. Zod schemas define every wire shape, generate the TypeScript types, validate fixtures in tests, and validate live responses at proxy time.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, zod 3.25, zustand, Vitest + React Testing Library.

**Spec:** [`../specs/2026-08-27-vivimoon-client-scope-design.md`](../specs/2026-08-27-vivimoon-client-scope-design.md)

## Global Constraints

- **TypeScript `strict: true`.** No `any` in committed code; use `unknown` plus narrowing.
- **No hardcoded user-facing strings** in components — all copy comes from `lib/i18n` dictionaries. Both `en` and `vi` must be updated together; `Dictionary` is typed from `en`, so a missing `vi` key is a compile error.
- **No raw `gtag` calls** — analytics goes through `lib/analytics`.
- **No component in `components/` fetches data.** Data is fetched in `app/**` or in client components via `/api/*`, then passed as props.
- **Zod schemas are the single source of truth for domain types.** `lib/types/*` re-exports `z.infer<>`; never hand-write an interface that a schema already describes.
- **Server Components import `lib/api/resources/*` directly.** Never `fetch()` our own `/api/*` from a Server Component — it needs an absolute URL and costs a pointless HTTP hop.
- **Prices are whole-currency units.** VND has no minor unit. Format via `Intl.NumberFormat` in `lib/utils/format.ts`.
- **Locales** are `['en', 'vi']`, default `en`. All app routes live under `app/[locale]/`.
- **Package manager:** npm. **Commits:** conventional style, one per task minimum.
- **Cart stays on React Context in M1.** The zustand cart migration lands in M2 alongside the Rx line-identity change. M1 adds `useSessionStore` only.

---

## File Structure

**Created**

```
lib/api/
  config.ts                      # per-resource mode resolution
  response.ts                    # ok()/fail() helpers for route handlers
  route-helpers.ts               # body parsing, error mapping, session start/end
  client.ts                      # browser-side fetch wrapper (Client Components only)
  schemas/
    common.ts                    # envelope, error, shared primitives
    catalog.ts                   # Product, Variant, Collection, Review, specs
    auth.ts                      # register/login/otp/reset payloads, User
    account.ts                   # Account patch (Address is M3)
  upstream/
    fetch.ts                     # base client for proxy mode
    validate.ts                  # zod parse with located diagnostics
  resources/
    catalog/{index.ts,mock.ts}
    auth/{index.ts,mock.ts}
    account/{index.ts,mock.ts}

app/api/
  products/route.ts
  products/[slug]/route.ts
  products/[slug]/reviews/route.ts
  collections/route.ts
  collections/[slug]/route.ts
  auth/register/route.ts
  auth/login/route.ts
  auth/logout/route.ts
  auth/session/route.ts
  auth/otp/request/route.ts
  auth/otp/verify/route.ts
  auth/password/reset/route.ts
  account/route.ts

app/[locale]/
  (auth)/layout.tsx
  (auth)/sign-in/{page.tsx,sign-in-form.tsx}
  (auth)/sign-up/{page.tsx,sign-up-form.tsx}
  (auth)/forgot-password/{page.tsx,forgot-password-form.tsx}
  account/{page.tsx,account-form.tsx}

features/session/session-store.ts
features/session/session-sync.tsx
lib/auth/cookie.ts               # httpOnly session cookie read/write
content/mock/{products,collections,reviews,users}.ts
tests/contract/{fixtures,upstream}.test.ts
```

**Deleted**

```
lib/data/product-repository.ts
lib/data/mock-product-repository.ts
lib/data/mock-product-repository.test.ts
lib/data/index.ts
content/{products,collections,reviews}.ts     # moved under content/mock/
```

**Modified**

```
lib/types/{product,collection,review}.ts      # become z.infer re-exports
app/[locale]/page.tsx
app/[locale]/collection/[slug]/page.tsx
app/[locale]/product/[slug]/page.tsx
middleware.ts                                 # + auth guards
lib/i18n/dictionaries/{en,vi}.ts              # + auth/account copy
package.json                                  # + zustand, + test:contract
.env.example
```

---

## Task 1: API config and response envelope

**Files:**
- Create: `lib/api/config.ts`, `lib/api/config.test.ts`, `lib/api/schemas/common.ts`, `lib/api/response.ts`
- Modify: `.env.example`

**Interfaces:**
- Produces: `resolveMode(resource: ResourceName): ApiMode`, `RESOURCES`, `upstreamBaseUrl()`, `upstreamTimeoutMs()`
- Produces: `apiOk<T>(data: T): Response`, `apiFail(code, message, opts?): Response`
- Produces: `envelopeSchema<T>(inner: T)`, `apiErrorSchema`

- [ ] **Step 1: Write the failing test**

Create `lib/api/config.test.ts`:

```ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { resolveMode, upstreamBaseUrl, upstreamTimeoutMs, RESOURCES } from './config';

const saved = { ...process.env };
beforeEach(() => { process.env = { ...saved }; });
afterEach(() => { process.env = { ...saved }; });

describe('resolveMode', () => {
  it('defaults to mock when nothing is set', () => {
    delete process.env.API_MODE_DEFAULT;
    expect(resolveMode('catalog')).toBe('mock');
  });

  it('honours API_MODE_DEFAULT', () => {
    process.env.API_MODE_DEFAULT = 'upstream';
    process.env.UPSTREAM_API_BASE_URL = 'https://api.example.com';
    expect(resolveMode('catalog')).toBe('upstream');
  });

  it('lets a per-resource override beat the default', () => {
    process.env.API_MODE_DEFAULT = 'mock';
    process.env.API_MODE_CATALOG = 'upstream';
    process.env.UPSTREAM_API_BASE_URL = 'https://api.example.com';
    expect(resolveMode('catalog')).toBe('upstream');
    expect(resolveMode('identity')).toBe('mock');
  });

  it('rejects an unknown mode value loudly', () => {
    process.env.API_MODE_CATALOG = 'somethingelse';
    expect(() => resolveMode('catalog')).toThrow(/API_MODE_CATALOG/);
  });

  it('refuses upstream mode without a base URL', () => {
    process.env.API_MODE_CATALOG = 'upstream';
    delete process.env.UPSTREAM_API_BASE_URL;
    expect(() => resolveMode('catalog')).toThrow(/UPSTREAM_API_BASE_URL/);
  });

  it('refuses commerce upstream while catalog is still mocked', () => {
    process.env.UPSTREAM_API_BASE_URL = 'https://api.example.com';
    process.env.API_MODE_COMMERCE = 'upstream';
    process.env.API_MODE_CATALOG = 'mock';
    expect(() => resolveMode('commerce')).toThrow(/catalog/i);
  });

  it('exposes every resource name', () => {
    expect(RESOURCES).toEqual(['catalog', 'identity', 'discovery', 'commerce']);
  });

  it('reads timeout with a default', () => {
    delete process.env.UPSTREAM_API_TIMEOUT_MS;
    expect(upstreamTimeoutMs()).toBe(10000);
    process.env.UPSTREAM_API_TIMEOUT_MS = '2500';
    expect(upstreamTimeoutMs()).toBe(2500);
  });

  it('returns the trimmed base URL without a trailing slash', () => {
    process.env.UPSTREAM_API_BASE_URL = 'https://api.example.com/';
    expect(upstreamBaseUrl()).toBe('https://api.example.com');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/api/config.test.ts`
Expected: FAIL — `Failed to resolve import "./config"`

- [ ] **Step 3: Write the implementation**

Create `lib/api/config.ts`:

```ts
/**
 * Per-resource mock/upstream resolution.
 *
 * Resources migrate to Vivimoon's real API one at a time. Mixed mode is only
 * safe within dependency boundaries: `commerce` references catalog products and
 * identity users, so it must not go upstream while either is still mocked —
 * fixture IDs will not match real ones and references dangle.
 */
export const RESOURCES = ['catalog', 'identity', 'discovery', 'commerce'] as const;
export type ResourceName = (typeof RESOURCES)[number];

export type ApiMode = 'mock' | 'upstream';

/** Resources that must already be upstream before the key may go upstream. */
const DEPENDS_ON: Partial<Record<ResourceName, ResourceName[]>> = {
  discovery: ['catalog'],
  commerce: ['catalog', 'identity'],
};

function readMode(envKey: string): ApiMode | undefined {
  const raw = process.env[envKey];
  if (raw === undefined || raw === '') return undefined;
  if (raw !== 'mock' && raw !== 'upstream') {
    throw new Error(`${envKey} must be "mock" or "upstream", received "${raw}"`);
  }
  return raw;
}

/** Resolve without dependency checking, to avoid infinite recursion. */
function rawMode(resource: ResourceName): ApiMode {
  return (
    readMode(`API_MODE_${resource.toUpperCase()}`) ??
    readMode('API_MODE_DEFAULT') ??
    'mock'
  );
}

export function resolveMode(resource: ResourceName): ApiMode {
  const mode = rawMode(resource);
  if (mode === 'mock') return 'mock';

  if (!process.env.UPSTREAM_API_BASE_URL) {
    throw new Error(
      `${resource} is set to upstream but UPSTREAM_API_BASE_URL is not set`,
    );
  }

  for (const dep of DEPENDS_ON[resource] ?? []) {
    if (rawMode(dep) !== 'upstream') {
      throw new Error(
        `${resource} cannot go upstream while ${dep} is still mocked — ` +
          `fixture IDs will not match real ones. Migrate ${dep} first.`,
      );
    }
  }
  return 'upstream';
}

export function upstreamBaseUrl(): string {
  const raw = process.env.UPSTREAM_API_BASE_URL;
  if (!raw) throw new Error('UPSTREAM_API_BASE_URL is not set');
  return raw.trim().replace(/\/+$/, '');
}

export function upstreamTimeoutMs(): number {
  const raw = process.env.UPSTREAM_API_TIMEOUT_MS;
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 10000;
}

/** True when any resource is live. Gates dev-only affordances. */
export function isAnyUpstream(): boolean {
  return RESOURCES.some((r) => rawMode(r) === 'upstream');
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/api/config.test.ts`
Expected: PASS — 8 tests

- [ ] **Step 5: Create the response envelope**

Create `lib/api/schemas/common.ts`:

```ts
import { z } from 'zod';

export const apiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  field: z.string().optional(),
});
export type ApiError = z.infer<typeof apiErrorSchema>;

/** Wraps any payload schema in the shared success/failure envelope. */
export function envelopeSchema<T extends z.ZodTypeAny>(inner: T) {
  return z.discriminatedUnion('ok', [
    z.object({ ok: z.literal(true), data: inner }),
    z.object({ ok: z.literal(false), error: apiErrorSchema }),
  ]);
}

export const okEnvelopeSchema = z.object({ ok: z.literal(true) });

/** Error codes the frontend branches on. Anything else is treated as unknown. */
export const ERROR_CODES = [
  'validation_failed',
  'not_found',
  'unauthorized',
  'conflict',
  'rate_limited',
  'upstream_unavailable',
  'internal',
] as const;
export type ErrorCode = (typeof ERROR_CODES)[number];

export const HTTP_STATUS: Record<ErrorCode, number> = {
  validation_failed: 400,
  not_found: 404,
  unauthorized: 401,
  conflict: 409,
  rate_limited: 429,
  upstream_unavailable: 502,
  internal: 500,
};
```

- [ ] **Step 6: Create the route-handler helpers**

Create `lib/api/response.ts`:

```ts
import { NextResponse } from 'next/server';
import { HTTP_STATUS, type ErrorCode } from './schemas/common';

export function apiOk<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json({ ok: true as const, data }, init);
}

export function apiFail(
  code: ErrorCode,
  message: string,
  opts: { field?: string; status?: number } = {},
): NextResponse {
  return NextResponse.json(
    { ok: false as const, error: { code, message, field: opts.field } },
    { status: opts.status ?? HTTP_STATUS[code] },
  );
}
```

- [ ] **Step 7: Document the env vars**

Replace `.env.example` with:

```bash
# Google Analytics 4 measurement ID (leave empty to disable tracking)
NEXT_PUBLIC_GA_ID=

# API seam ------------------------------------------------------------------
# Each resource resolves to "mock" (local fixtures) or "upstream" (Vivimoon's
# API). Per-resource keys override API_MODE_DEFAULT.
#
# Migration order — never break it, the config will refuse:
#   catalog, identity  ->  discovery  ->  commerce
API_MODE_DEFAULT=mock
# API_MODE_CATALOG=upstream
# API_MODE_IDENTITY=upstream
# API_MODE_DISCOVERY=upstream
# API_MODE_COMMERCE=upstream

# Required whenever any resource is set to "upstream".
UPSTREAM_API_BASE_URL=
UPSTREAM_API_TIMEOUT_MS=10000

# Secret used to sign the session cookie in mock mode.
# In upstream mode Vivimoon's API issues the token and this is unused.
AUTH_COOKIE_SECRET=dev-only-not-a-real-secret
```

- [ ] **Step 8: Run the full suite**

Run: `npm test`
Expected: PASS — 11 test files, 34 tests

- [ ] **Step 9: Commit**

```bash
git add lib/api .env.example
git commit -m "feat: add per-resource API mode config and response envelope"
```

---

## Task 2: Catalog schemas become the source of truth

Domain types are currently hand-written interfaces in `lib/types/`. They become `z.infer` of the wire schemas, so there is exactly one definition of a `Product`. Every existing import of `@/lib/types` keeps working.

**Files:**
- Create: `lib/api/schemas/catalog.ts`, `lib/api/schemas/catalog.test.ts`
- Modify: `lib/types/product.ts`, `lib/types/collection.ts`, `lib/types/review.ts`

**Interfaces:**
- Consumes: `envelopeSchema` from Task 1
- Produces: `productSchema`, `variantSchema`, `productSpecsSchema`, `collectionSchema`, `reviewSchema`, `productQuerySchema`, and the inferred types `Product`, `Variant`, `ProductSpecs`, `Collection`, `Review`, `ProductQuery`, `LensType`, `ReplacementSchedule`, `ProductBadge`, `Currency`, `ReviewSource`

- [ ] **Step 1: Write the failing test**

Create `lib/api/schemas/catalog.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { productSchema, reviewSchema, productQuerySchema } from './catalog';

const validProduct = {
  id: 'p1', slug: 'aqua', name: 'Aqua', brandId: 'b1', brandName: 'Brand',
  type: 'colored', replacement: 'daily', description: 'd', images: ['/a.jpg'],
  badges: ['new'],
  specs: {
    material: 'Hydrogel', waterContent: '38%', baseCurve: '8.6mm',
    diameter: '14.2mm', uvProtection: true, manufacturer: 'M',
  },
  variants: [{
    id: 'v1', sku: 'S1', packSize: '10 lenses', price: 250000,
    currency: 'VND', stock: 5,
  }],
  rating: 4.5, reviewCount: 10,
};

describe('productSchema', () => {
  it('accepts a valid product', () => {
    expect(productSchema.parse(validProduct).slug).toBe('aqua');
  });

  it('rejects an unknown lens type', () => {
    const bad = { ...validProduct, type: 'banana' };
    expect(() => productSchema.parse(bad)).toThrow();
  });

  it('rejects a rating outside 0-5', () => {
    expect(() => productSchema.parse({ ...validProduct, rating: 9 })).toThrow();
  });

  it('rejects a product with no variants', () => {
    expect(() => productSchema.parse({ ...validProduct, variants: [] })).toThrow();
  });

  it('rejects a non-integer price, since VND has no minor unit', () => {
    const bad = { ...validProduct, variants: [{ ...validProduct.variants[0], price: 1.5 }] };
    expect(() => productSchema.parse(bad)).toThrow();
  });
});

describe('reviewSchema', () => {
  it('defaults source to vivimoon when absent', () => {
    const r = reviewSchema.parse({
      id: 'r1', productId: 'p1', author: 'A', rating: 5,
      title: 't', body: 'b', createdAt: '2026-01-01', hasImages: false,
    });
    expect(r.source).toBe('vivimoon');
  });

  it('accepts a mirrored marketplace review', () => {
    const r = reviewSchema.parse({
      id: 'r2', productId: 'p1', author: 'B', rating: 4,
      title: 't', body: 'b', createdAt: '2026-01-01', hasImages: true,
      source: 'shopee', sourceUrl: 'https://shopee.vn/x',
    });
    expect(r.source).toBe('shopee');
  });
});

describe('productQuerySchema', () => {
  it('parses URL search params, ignoring blanks', () => {
    const q = productQuerySchema.parse({ type: 'colored', color: '', sort: 'price-asc' });
    expect(q).toEqual({ type: 'colored', sort: 'price-asc' });
  });

  it('rejects an unknown sort', () => {
    expect(() => productQuerySchema.parse({ sort: 'cheapest' })).toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/api/schemas/catalog.test.ts`
Expected: FAIL — `Failed to resolve import "./catalog"`

- [ ] **Step 3: Write the schemas**

Create `lib/api/schemas/catalog.ts`:

```ts
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
export type Review = z.infer<typeof reviewSchema>;
export type ProductQuery = z.infer<typeof productQuerySchema>;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/api/schemas/catalog.test.ts`
Expected: PASS — 9 tests

- [ ] **Step 5: Re-point the domain types at the schemas**

Replace `lib/types/product.ts` entirely:

```ts
/**
 * Domain types are inferred from the wire schemas so there is exactly one
 * definition of a Product. Edit `lib/api/schemas/catalog.ts`, not this file.
 */
export type {
  LensType,
  ReplacementSchedule,
  ProductBadge,
  Currency,
  ProductSpecs,
  Variant,
  Product,
} from '@/lib/api/schemas/catalog';
```

Replace `lib/types/collection.ts` entirely:

```ts
export type { Collection } from '@/lib/api/schemas/catalog';
```

Replace `lib/types/review.ts` entirely:

```ts
export type { Review, ReviewSource } from '@/lib/api/schemas/catalog';
```

- [ ] **Step 6: Typecheck and run the full suite**

Run: `npx tsc --noEmit && npm test`
Expected: no type errors; all tests pass. `content/products.ts` and `content/collections.ts` still typecheck because the inferred `Product` and `Collection` are structurally identical to the old interfaces.

`content/reviews.ts` is the exception and needs one change. `z.infer` yields zod's **output** type, and `.default('vivimoon')` makes `source` **required** there — the default guarantees the field is populated after a parse. Add `source: 'vivimoon'` to every entry in `content/reviews.ts`.

Do not reach for `z.input` to dodge this. The mock path returns fixtures **unparsed**, so an optional `source` would be `undefined` at runtime for every seed review, and M4's source badge would render nothing. Typing the fixture array with a required `source` makes TypeScript enforce the field whenever a review is added. The schema keeps its `.default()` to tolerate an upstream API that omits it.

- [ ] **Step 7: Commit**

```bash
git add lib/api/schemas lib/types
git commit -m "feat: derive domain types from zod wire schemas"
```

---

## Task 3: Move fixtures under content/mock and add the conformance harness

**Files:**
- Create: `content/mock/products.ts`, `content/mock/collections.ts`, `content/mock/reviews.ts`, `content/mock/index.ts`, `tests/contract/fixtures.test.ts`
- Delete: `content/products.ts`, `content/collections.ts`, `content/reviews.ts`
- Modify: `package.json`, `lib/data/mock-product-repository.ts`

**Interfaces:**
- Consumes: `productSchema`, `collectionSchema`, `reviewSchema` from Task 2
- Produces: `content/mock/index.ts` exporting `products`, `collections`, `reviews`
- Produces: npm script `test:contract`

- [ ] **Step 1: Move the fixture files**

```bash
mkdir -p content/mock
git mv content/products.ts content/mock/products.ts
git mv content/collections.ts content/mock/collections.ts
git mv content/reviews.ts content/mock/reviews.ts
```

- [ ] **Step 2: Add the barrel**

Create `content/mock/index.ts`:

```ts
export { products } from './products';
export { collections } from './collections';
export { reviews } from './reviews';
```

- [ ] **Step 3: Repoint the only importer**

In `lib/data/mock-product-repository.ts`, replace the three content imports:

```ts
import { products } from '@/content/products';
import { collections } from '@/content/collections';
import { reviews } from '@/content/reviews';
```

with:

```ts
import { products, collections, reviews } from '@/content/mock';
```

- [ ] **Step 4: Write the conformance test**

Create `tests/contract/fixtures.test.ts`:

```ts
/**
 * Contract conformance — mock side.
 *
 * Every fixture must satisfy the same schema the real API will be held to.
 * This is what stops mock data drifting from the contract we handed Vivimoon's
 * backend developer, and it is the local half of `npm run test:contract`.
 */
import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { products, collections, reviews } from '@/content/mock';
import { productSchema, collectionSchema, reviewSchema } from '@/lib/api/schemas/catalog';

function expectAllValid<T extends z.ZodTypeAny>(schema: T, rows: unknown[], label: string) {
  const failures: string[] = [];
  rows.forEach((row, i) => {
    const result = schema.safeParse(row);
    if (!result.success) {
      failures.push(`${label}[${i}]: ${result.error.issues.map((x) => `${x.path.join('.')} ${x.message}`).join('; ')}`);
    }
  });
  expect(failures, failures.join('\n')).toEqual([]);
}

describe('fixture conformance', () => {
  it('has fixtures to check', () => {
    expect(products.length).toBeGreaterThan(0);
    expect(collections.length).toBeGreaterThan(0);
    expect(reviews.length).toBeGreaterThan(0);
  });

  it('every product satisfies productSchema', () => {
    expectAllValid(productSchema, products, 'product');
  });

  it('every collection satisfies collectionSchema', () => {
    expectAllValid(collectionSchema, collections, 'collection');
  });

  it('every review satisfies reviewSchema', () => {
    expectAllValid(reviewSchema, reviews, 'review');
  });

  it('collection productIds all resolve to a real product', () => {
    const ids = new Set(products.map((p) => p.id));
    const dangling = collections.flatMap((c) =>
      c.productIds.filter((id) => !ids.has(id)).map((id) => `${c.slug} -> ${id}`),
    );
    expect(dangling).toEqual([]);
  });

  it('review productIds all resolve to a real product', () => {
    const ids = new Set(products.map((p) => p.id));
    const dangling = reviews.filter((r) => !ids.has(r.productId)).map((r) => r.id);
    expect(dangling).toEqual([]);
  });

  it('variant ids are globally unique', () => {
    const all = products.flatMap((p) => p.variants.map((v) => v.id));
    expect(all.length).toBe(new Set(all).size);
  });

  it('product slugs are unique', () => {
    const slugs = products.map((p) => p.slug);
    expect(slugs.length).toBe(new Set(slugs).size);
  });
});
```

- [ ] **Step 5: Run the conformance test**

Run: `npx vitest run tests/contract/fixtures.test.ts`
Expected: PASS — 8 tests. If a fixture fails, fix the fixture, not the schema: the schema is the contract.

- [ ] **Step 6: Add the test:contract script**

In `package.json`, add to `scripts`:

```json
"test:contract": "vitest run tests/contract"
```

- [ ] **Step 7: Verify both suites**

Run: `npm run test:contract && npm test`
Expected: contract suite passes; full suite passes.

- [ ] **Step 8: Commit**

```bash
git add content package.json lib/data tests/contract
git commit -m "feat: move fixtures under content/mock with schema conformance tests"
```

---

## Task 4: Catalog resource module, and delete ProductRepository

The `ProductRepository` interface existed to swap mock↔real in-process. That job now belongs to the network boundary, so the interface goes and its logic moves into the catalog resource's mock implementation.

**Files:**
- Create: `lib/api/resources/catalog/mock.ts`, `lib/api/resources/catalog/index.ts`, `lib/api/resources/catalog/mock.test.ts`
- Delete: `lib/data/product-repository.ts`, `lib/data/mock-product-repository.ts`, `lib/data/mock-product-repository.test.ts`, `lib/data/index.ts`
- Modify: `app/[locale]/page.tsx`, `app/[locale]/collection/[slug]/page.tsx`, `app/[locale]/product/[slug]/page.tsx`

**Interfaces:**
- Consumes: `resolveMode` (Task 1), catalog schemas (Task 2), `content/mock` (Task 3)
- Produces: `catalog` — an object with `getProductBySlug(slug)`, `listProducts(query?)`, `getCollection(slug)`, `listCollections()`, `getProductsByIds(ids)`, `getRelatedProducts(product, limit?)`, `getReviews(productId)`, all returning Promises
- Produces: `minPrice(product: Product): number`

- [ ] **Step 1: Write the failing test**

Create `lib/api/resources/catalog/mock.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { mockCatalog } from './mock';

describe('mockCatalog', () => {
  it('finds a product by slug', async () => {
    const p = await mockCatalog.getProductBySlug('aqua-daily-clear');
    expect(p?.name).toBe('Aqua Daily Clear');
  });

  it('returns null for an unknown slug', async () => {
    expect(await mockCatalog.getProductBySlug('nope')).toBeNull();
  });

  it('filters by lens type', async () => {
    const list = await mockCatalog.listProducts({ type: 'colored' });
    expect(list.length).toBeGreaterThan(0);
    expect(list.every((p) => p.type === 'colored')).toBe(true);
  });

  it('filters by replacement schedule', async () => {
    const list = await mockCatalog.listProducts({ replacement: 'daily' });
    expect(list.every((p) => p.replacement === 'daily')).toBe(true);
  });

  it('filters by variant color', async () => {
    const all = await mockCatalog.listProducts();
    const color = all.flatMap((p) => p.variants.map((v) => v.color)).find(Boolean)!;
    const list = await mockCatalog.listProducts({ color });
    expect(list.every((p) => p.variants.some((v) => v.color === color))).toBe(true);
  });

  it('sorts by price ascending', async () => {
    const list = await mockCatalog.listProducts({ sort: 'price-asc' });
    const prices = list.map((p) => Math.min(...p.variants.map((v) => v.price)));
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  it('sorts by price descending', async () => {
    const list = await mockCatalog.listProducts({ sort: 'price-desc' });
    const prices = list.map((p) => Math.min(...p.variants.map((v) => v.price)));
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });

  it('does not mutate the fixture array when sorting', async () => {
    const before = (await mockCatalog.listProducts()).map((p) => p.id);
    await mockCatalog.listProducts({ sort: 'price-desc' });
    const after = (await mockCatalog.listProducts()).map((p) => p.id);
    expect(after).toEqual(before);
  });

  it('resolves products by id, dropping unknown ids', async () => {
    const all = await mockCatalog.listProducts();
    const list = await mockCatalog.getProductsByIds([all[0].id, 'ghost']);
    expect(list.map((p) => p.id)).toEqual([all[0].id]);
  });

  it('excludes the source product from related products', async () => {
    const p = (await mockCatalog.listProducts())[0];
    const related = await mockCatalog.getRelatedProducts(p);
    expect(related.some((r) => r.id === p.id)).toBe(false);
  });

  it('honours the related-products limit', async () => {
    const p = (await mockCatalog.listProducts())[0];
    expect((await mockCatalog.getRelatedProducts(p, 2)).length).toBeLessThanOrEqual(2);
  });

  it('returns only reviews for the requested product', async () => {
    const all = await mockCatalog.listProducts();
    const withReviews = await Promise.all(
      all.map(async (p) => ({ product: p, reviews: await mockCatalog.getReviews(p.id) })),
    );
    const target = withReviews.find((x) => x.reviews.length > 0);
    if (!target) throw new Error('fixtures have no product with reviews');
    expect(target.reviews.every((r) => r.productId === target.product.id)).toBe(true);
  });

  it('lists collections', async () => {
    expect((await mockCatalog.listCollections()).length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/api/resources/catalog/mock.test.ts`
Expected: FAIL — `Failed to resolve import "./mock"`

- [ ] **Step 3: Write the mock implementation**

Create `lib/api/resources/catalog/mock.ts`:

```ts
import { products, collections, reviews } from '@/content/mock';
import type { Collection, Product, ProductQuery, Review } from '@/lib/api/schemas/catalog';

/** Lowest variant price, used for sorting. */
export function minPrice(product: Product): number {
  return Math.min(...product.variants.map((v) => v.price));
}

export const mockCatalog = {
  async getProductBySlug(slug: string): Promise<Product | null> {
    return products.find((p) => p.slug === slug) ?? null;
  },

  async listProducts(query: ProductQuery = {}): Promise<Product[]> {
    let list = [...products];
    if (query.type) list = list.filter((p) => p.type === query.type);
    if (query.replacement) list = list.filter((p) => p.replacement === query.replacement);
    if (query.brandId) list = list.filter((p) => p.brandId === query.brandId);
    if (query.color) list = list.filter((p) => p.variants.some((v) => v.color === query.color));

    switch (query.sort) {
      case 'price-asc': list.sort((a, b) => minPrice(a) - minPrice(b)); break;
      case 'price-desc': list.sort((a, b) => minPrice(b) - minPrice(a)); break;
      case 'bestselling': list.sort((a, b) => b.reviewCount - a.reviewCount); break;
      case 'newest':
        list.sort((a, b) => Number(b.badges.includes('new')) - Number(a.badges.includes('new')));
        break;
      default: break;
    }
    return list;
  },

  async getCollection(slug: string): Promise<Collection | null> {
    return collections.find((c) => c.slug === slug) ?? null;
  },

  async listCollections(): Promise<Collection[]> {
    return [...collections];
  },

  async getProductsByIds(ids: string[]): Promise<Product[]> {
    return ids
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is Product => Boolean(p));
  },

  async getRelatedProducts(product: Product, limit = 8): Promise<Product[]> {
    return products
      .filter(
        (p) =>
          p.id !== product.id &&
          (p.type === product.type || p.replacement === product.replacement),
      )
      .slice(0, limit);
  },

  async getReviews(productId: string): Promise<Review[]> {
    return reviews.filter((r) => r.productId === productId);
  },
};

export type Catalog = typeof mockCatalog;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/api/resources/catalog/mock.test.ts`
Expected: PASS — 13 tests

- [ ] **Step 5: Write the resolver**

Create `lib/api/resources/catalog/index.ts`:

```ts
import { resolveMode } from '@/lib/api/config';
import { mockCatalog, type Catalog } from './mock';

/**
 * Server Components import this directly. Client Components go through
 * `/api/*`, whose route handlers also land here.
 *
 * When catalog migrates, add `./upstream.ts` exporting an object of the same
 * shape and return it below. Until then there is no identity-mapping code to
 * maintain.
 */
export const catalog: Catalog =
  resolveMode('catalog') === 'mock'
    ? mockCatalog
    : (() => {
        throw new Error(
          'catalog is set to upstream but lib/api/resources/catalog/upstream.ts does not exist yet',
        );
      })();

export { minPrice } from './mock';
```

- [ ] **Step 6: Migrate the home page**

In `app/[locale]/page.tsx`, replace:

```ts
import { productRepository } from '@/lib/data';
```

with:

```ts
import { catalog } from '@/lib/api/resources/catalog';
```

and replace the four data lines:

```ts
  const bestsellers = await productRepository.getCollection('bestsellers');
  const colored = await productRepository.getCollection('colored-lenses');
  const bestProducts = bestsellers ? await productRepository.getProductsByIds(bestsellers.productIds) : [];
  const coloredProducts = colored ? await productRepository.getProductsByIds(colored.productIds) : [];
```

with:

```ts
  const [bestsellers, colored] = await Promise.all([
    catalog.getCollection('bestsellers'),
    catalog.getCollection('colored-lenses'),
  ]);
  const [bestProducts, coloredProducts] = await Promise.all([
    bestsellers ? catalog.getProductsByIds(bestsellers.productIds) : [],
    colored ? catalog.getProductsByIds(colored.productIds) : [],
  ]);
```

- [ ] **Step 7: Migrate the collection and product pages**

In `app/[locale]/collection/[slug]/page.tsx`, replace both imports:

```ts
import { productRepository } from '@/lib/data';
import type { ProductQuery } from '@/lib/data';
```

with:

```ts
import { catalog } from '@/lib/api/resources/catalog';
import type { ProductQuery } from '@/lib/api/schemas/catalog';
```

Then replace every remaining `productRepository.` with `catalog.` in that file.

In `app/[locale]/product/[slug]/page.tsx`, apply the same import swap (it imports only `productRepository`) and replace every `productRepository.` with `catalog.`.

- [ ] **Step 8: Delete the repository layer**

```bash
git rm lib/data/product-repository.ts lib/data/mock-product-repository.ts \
       lib/data/mock-product-repository.test.ts lib/data/index.ts
```

- [ ] **Step 9: Verify nothing references it**

Run: `grep -rn "productRepository\|lib/data" app components features lib content`
Expected: no output.

- [ ] **Step 10: Typecheck, test, and build**

Run: `npx tsc --noEmit && npm test && npm run build`
Expected: no type errors; all tests pass; build succeeds.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "refactor: replace ProductRepository with catalog resource module"
```

---

## Task 5: Catalog route handlers

The browser's only door into the catalog. Server Components bypass these and call `catalog` directly.

**Files:**
- Create: `app/api/products/route.ts`, `app/api/products/[slug]/route.ts`, `app/api/products/[slug]/reviews/route.ts`, `app/api/collections/route.ts`, `app/api/collections/[slug]/route.ts`, `app/api/products/route.test.ts`
- Modify: `middleware.ts`

**Interfaces:**
- Consumes: `catalog` (Task 4), `apiOk`/`apiFail` (Task 1), `productQuerySchema` (Task 2)
- Produces: `GET /api/products`, `GET /api/products/:slug`, `GET /api/products/:slug/reviews`, `GET /api/collections`, `GET /api/collections/:slug`

> Reviews hang off the product **slug**, not the id, so the browser never needs an id it does not already have from a URL.

- [ ] **Step 1: Exclude /api from the locale redirect**

The locale middleware currently rewrites everything without a locale prefix, which would redirect `/api/products` to `/en/api/products`. In `middleware.ts`, change the matcher:

```ts
export const config = {
  matcher: ['/((?!api|_next|images|favicon.ico|.*\\..*).*)'],
};
```

- [ ] **Step 2: Write the failing test**

Create `app/api/products/route.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { GET as listProducts } from './route';
import { GET as getProduct } from './[slug]/route';
import { GET as getReviews } from './[slug]/reviews/route';

function req(url: string): Request {
  return new Request(`http://localhost${url}`);
}

describe('GET /api/products', () => {
  it('returns a success envelope with a product array', async () => {
    const body = await (await listProducts(req('/api/products'))).json();
    expect(body.ok).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
  });

  it('applies the type filter from search params', async () => {
    const body = await (await listProducts(req('/api/products?type=colored'))).json();
    expect(body.data.every((p: { type: string }) => p.type === 'colored')).toBe(true);
  });

  it('rejects an invalid sort with validation_failed', async () => {
    const res = await listProducts(req('/api/products?sort=cheapest'));
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe('validation_failed');
  });

  it('ignores blank params rather than rejecting them', async () => {
    const res = await listProducts(req('/api/products?type=&color='));
    expect(res.status).toBe(200);
  });
});

describe('GET /api/products/:slug', () => {
  it('returns the product', async () => {
    const res = await getProduct(req('/api/products/aqua-daily-clear'), {
      params: Promise.resolve({ slug: 'aqua-daily-clear' }),
    });
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.data.slug).toBe('aqua-daily-clear');
  });

  it('404s an unknown slug', async () => {
    const res = await getProduct(req('/api/products/ghost'), {
      params: Promise.resolve({ slug: 'ghost' }),
    });
    expect(res.status).toBe(404);
    expect((await res.json()).error.code).toBe('not_found');
  });
});

describe('GET /api/products/:slug/reviews', () => {
  it('returns reviews for a known product', async () => {
    const res = await getReviews(req('/api/products/aqua-daily-clear/reviews'), {
      params: Promise.resolve({ slug: 'aqua-daily-clear' }),
    });
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  it('404s reviews for an unknown product', async () => {
    const res = await getReviews(req('/api/products/ghost/reviews'), {
      params: Promise.resolve({ slug: 'ghost' }),
    });
    expect(res.status).toBe(404);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run app/api/products/route.test.ts`
Expected: FAIL — `Failed to resolve import "./route"`

- [ ] **Step 4: Write the list handler**

Create `app/api/products/route.ts`:

```ts
import { catalog } from '@/lib/api/resources/catalog';
import { productQuerySchema } from '@/lib/api/schemas/catalog';
import { apiOk, apiFail } from '@/lib/api/response';

export async function GET(request: Request) {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = productQuerySchema.safeParse(params);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return apiFail('validation_failed', first.message, { field: first.path.join('.') });
  }
  return apiOk(await catalog.listProducts(parsed.data));
}
```

- [ ] **Step 5: Write the detail handler**

Create `app/api/products/[slug]/route.ts`:

```ts
import { catalog } from '@/lib/api/resources/catalog';
import { apiOk, apiFail } from '@/lib/api/response';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const product = await catalog.getProductBySlug(slug);
  if (!product) return apiFail('not_found', `No product with slug "${slug}"`);
  return apiOk(product);
}
```

- [ ] **Step 6: Write the reviews handler**

Create `app/api/products/[slug]/reviews/route.ts`:

```ts
import { catalog } from '@/lib/api/resources/catalog';
import { apiOk, apiFail } from '@/lib/api/response';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const product = await catalog.getProductBySlug(slug);
  if (!product) return apiFail('not_found', `No product with slug "${slug}"`);
  return apiOk(await catalog.getReviews(product.id));
}
```

- [ ] **Step 7: Write the collection handlers**

Create `app/api/collections/route.ts`:

```ts
import { catalog } from '@/lib/api/resources/catalog';
import { apiOk } from '@/lib/api/response';

export async function GET() {
  return apiOk(await catalog.listCollections());
}
```

Create `app/api/collections/[slug]/route.ts`:

```ts
import { catalog } from '@/lib/api/resources/catalog';
import { apiOk, apiFail } from '@/lib/api/response';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const collection = await catalog.getCollection(slug);
  if (!collection) return apiFail('not_found', `No collection with slug "${slug}"`);
  return apiOk(collection);
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npx vitest run app/api/products/route.test.ts`
Expected: PASS — 8 tests

- [ ] **Step 9: Verify the route is reachable in the browser**

Run: `npm run dev` then in a second terminal:

```bash
curl -s localhost:3000/api/products?type=colored | head -c 200
curl -s -o /dev/null -w '%{http_code}\n' localhost:3000/api/products/ghost
```

Expected: a JSON envelope beginning `{"ok":true,"data":[`; then `404`. Stop the dev server.

- [ ] **Step 10: Commit**

```bash
git add app/api middleware.ts
git commit -m "feat: add catalog route handlers"
```

---

## Task 6: Upstream client and the --upstream conformance run

This is the machinery that makes the migration verifiable. No resource uses it yet; the conformance harness does.

**Files:**
- Create: `lib/api/upstream/fetch.ts`, `lib/api/upstream/validate.ts`, `lib/api/upstream/validate.test.ts`, `tests/contract/upstream.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `upstreamBaseUrl`, `upstreamTimeoutMs` (Task 1), `envelopeSchema` (Task 1)
- Produces: `upstreamFetch<T>(path, schema, init?): Promise<T>`
- Produces: `parseOrThrow<T>(schema, value, context): T`
- Produces: npm script `test:contract:upstream`

- [ ] **Step 1: Write the failing test**

Create `lib/api/upstream/validate.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { parseOrThrow, UpstreamShapeError } from './validate';

const schema = z.object({ id: z.string(), price: z.number().int() });

describe('parseOrThrow', () => {
  it('returns parsed data when the shape matches', () => {
    expect(parseOrThrow(schema, { id: 'a', price: 1 }, 'GET /x')).toEqual({ id: 'a', price: 1 });
  });

  it('throws UpstreamShapeError naming the endpoint and field', () => {
    try {
      parseOrThrow(schema, { id: 'a', price: '1' }, 'GET /products');
      throw new Error('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(UpstreamShapeError);
      const e = err as UpstreamShapeError;
      expect(e.message).toContain('GET /products');
      expect(e.message).toContain('price');
      expect(e.issues[0].path).toEqual(['price']);
    }
  });

  it('reports several bad fields at once', () => {
    try {
      parseOrThrow(schema, { id: 1, price: '1' }, 'GET /products');
      throw new Error('should have thrown');
    } catch (err) {
      expect((err as UpstreamShapeError).issues).toHaveLength(2);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/api/upstream/validate.test.ts`
Expected: FAIL — `Failed to resolve import "./validate"`

- [ ] **Step 3: Write the validator**

Create `lib/api/upstream/validate.ts`:

```ts
import type { z } from 'zod';

/**
 * A live response did not match the contract. Carries enough detail to tell
 * Vivimoon's backend developer exactly which field on which endpoint is wrong.
 */
export class UpstreamShapeError extends Error {
  constructor(
    message: string,
    readonly issues: z.ZodIssue[],
    readonly context: string,
  ) {
    super(message);
    this.name = 'UpstreamShapeError';
  }
}

export function parseOrThrow<T extends z.ZodTypeAny>(
  schema: T,
  value: unknown,
  context: string,
): z.infer<T> {
  const result = schema.safeParse(value);
  if (result.success) return result.data;

  const detail = result.error.issues
    .map((i) => `  ${i.path.join('.') || '(root)'}: ${i.message}`)
    .join('\n');
  throw new UpstreamShapeError(
    `Response from ${context} does not match the contract:\n${detail}`,
    result.error.issues,
    context,
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/api/upstream/validate.test.ts`
Expected: PASS — 3 tests

- [ ] **Step 5: Write the upstream client**

Create `lib/api/upstream/fetch.ts`:

```ts
import type { z } from 'zod';
import { upstreamBaseUrl, upstreamTimeoutMs } from '@/lib/api/config';
import { envelopeSchema } from '@/lib/api/schemas/common';
import { parseOrThrow } from './validate';

export class UpstreamRequestError extends Error {
  constructor(message: string, readonly status: number, readonly context: string) {
    super(message);
    this.name = 'UpstreamRequestError';
  }
}

/**
 * Server-to-server call to Vivimoon's API. Never called from the browser —
 * the browser talks to our route handlers, which call this.
 */
export async function upstreamFetch<T extends z.ZodTypeAny>(
  path: string,
  schema: T,
  init: RequestInit & { token?: string } = {},
): Promise<z.infer<T>> {
  const { token, ...rest } = init;
  const context = `${rest.method ?? 'GET'} ${path}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), upstreamTimeoutMs());

  let response: Response;
  try {
    response = await fetch(`${upstreamBaseUrl()}${path}`, {
      ...rest,
      signal: controller.signal,
      headers: {
        'content-type': 'application/json',
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...rest.headers,
      },
    });
  } catch (cause) {
    const reason = cause instanceof Error && cause.name === 'AbortError'
      ? `timed out after ${upstreamTimeoutMs()}ms`
      : 'network error';
    throw new UpstreamRequestError(`${context} ${reason}`, 0, context);
  } finally {
    clearTimeout(timer);
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    throw new UpstreamRequestError(
      `${context} returned ${response.status} with a non-JSON body`,
      response.status,
      context,
    );
  }

  const envelope = parseOrThrow(envelopeSchema(schema), json, context);
  if (!envelope.ok) {
    throw new UpstreamRequestError(
      `${context} failed: ${envelope.error.code} — ${envelope.error.message}`,
      response.status,
      context,
    );
  }
  return envelope.data;
}
```

- [ ] **Step 6: Write the upstream conformance suite**

Create `tests/contract/upstream.test.ts`:

```ts
/**
 * Contract conformance — upstream side.
 *
 * Skipped unless UPSTREAM_API_BASE_URL is set, so CI stays green without a
 * live backend. Run this against Vivimoon's API before flipping a resource to
 * upstream: green here means that resource is safe to cut over, and red names
 * the exact endpoint and field that disagrees with the contract.
 *
 *   UPSTREAM_API_BASE_URL=https://api.vivimoon.vn npm run test:contract:upstream
 */
import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { upstreamFetch } from '@/lib/api/upstream/fetch';
import { productSchema, collectionSchema, reviewSchema } from '@/lib/api/schemas/catalog';

const configured = Boolean(process.env.UPSTREAM_API_BASE_URL);
const describeUpstream = configured ? describe : describe.skip;

describeUpstream('catalog contract against the live API', () => {
  it('GET /products returns products matching the contract', async () => {
    const list = await upstreamFetch('/products', z.array(productSchema));
    expect(list.length).toBeGreaterThan(0);
  });

  it('GET /products supports the type filter', async () => {
    const list = await upstreamFetch('/products?type=colored', z.array(productSchema));
    expect(list.every((p) => p.type === 'colored')).toBe(true);
  });

  it('GET /products/:slug returns one product matching the contract', async () => {
    const [first] = await upstreamFetch('/products', z.array(productSchema));
    const one = await upstreamFetch(`/products/${first.slug}`, productSchema);
    expect(one.slug).toBe(first.slug);
  });

  it('GET /products/:slug/reviews matches the contract', async () => {
    const [first] = await upstreamFetch('/products', z.array(productSchema));
    await upstreamFetch(`/products/${first.slug}/reviews`, z.array(reviewSchema));
  });

  it('GET /collections matches the contract', async () => {
    const list = await upstreamFetch('/collections', z.array(collectionSchema));
    expect(list.length).toBeGreaterThan(0);
  });

  it('collection productIds resolve against the live catalogue', async () => {
    const [collection] = await upstreamFetch('/collections', z.array(collectionSchema));
    const products = await upstreamFetch('/products', z.array(productSchema));
    const ids = new Set(products.map((p) => p.id));
    expect(collection.productIds.filter((id) => !ids.has(id))).toEqual([]);
  });
});
```

- [ ] **Step 7: Add the script**

In `package.json`, add to `scripts`:

```json
"test:contract:upstream": "vitest run tests/contract/upstream.test.ts"
```

- [ ] **Step 8: Verify both modes**

Run: `npm run test:contract`
Expected: fixtures pass; upstream suite reports as skipped.

Run: `UPSTREAM_API_BASE_URL=http://127.0.0.1:9 npm run test:contract:upstream`
Expected: FAIL with `network error` — proving the suite actually attempts the call rather than silently passing.

- [ ] **Step 9: Commit**

```bash
git add lib/api/upstream tests/contract package.json
git commit -m "feat: add upstream client and live-API conformance suite"
```

---

## Task 7: zustand and the session store

**Files:**
- Create: `features/session/session-store.ts`, `features/session/session-store.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `useSessionStore` with state `{ user: SessionUser | null; status: 'unknown' | 'authenticated' | 'anonymous' }` and actions `setUser(user)`, `clear()`
- Produces: `SessionUser = { id: string; name: string; phone: string; email?: string; avatarUrl?: string }`

> Deliberately **not persisted.** The httpOnly cookie is the source of truth; this store is a render convenience for the header, hydrated from `GET /api/auth/session`. Persisting it would let a stale client copy outlive a revoked session.

- [ ] **Step 1: Install zustand**

Run: `npm install zustand`
Expected: `zustand` appears in `dependencies`.

- [ ] **Step 2: Write the failing test**

Create `features/session/session-store.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useSessionStore } from './session-store';

const user = { id: 'u1', name: 'Mai', phone: '0900000000' };

describe('useSessionStore', () => {
  beforeEach(() => { useSessionStore.setState({ user: null, status: 'unknown' }); });

  it('starts in the unknown state', () => {
    expect(useSessionStore.getState().status).toBe('unknown');
    expect(useSessionStore.getState().user).toBeNull();
  });

  it('setUser with a user authenticates', () => {
    useSessionStore.getState().setUser(user);
    expect(useSessionStore.getState().status).toBe('authenticated');
    expect(useSessionStore.getState().user?.name).toBe('Mai');
  });

  it('setUser with null resolves to anonymous, not unknown', () => {
    useSessionStore.getState().setUser(null);
    expect(useSessionStore.getState().status).toBe('anonymous');
  });

  it('clear returns to anonymous', () => {
    useSessionStore.getState().setUser(user);
    useSessionStore.getState().clear();
    expect(useSessionStore.getState().status).toBe('anonymous');
    expect(useSessionStore.getState().user).toBeNull();
  });

  it('does not write to storage', () => {
    useSessionStore.getState().setUser(user);
    expect(window.localStorage.getItem('vivimoon-session')).toBeNull();
    expect(window.sessionStorage.getItem('vivimoon-session')).toBeNull();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run features/session/session-store.test.ts`
Expected: FAIL — `Failed to resolve import "./session-store"`

- [ ] **Step 4: Write the store**

Create `features/session/session-store.ts`:

```ts
'use client';
import { create } from 'zustand';

export interface SessionUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatarUrl?: string;
}

/** `unknown` means the session has not been checked yet, so the header can
 *  render a neutral placeholder instead of flashing a signed-out state. */
export type SessionStatus = 'unknown' | 'authenticated' | 'anonymous';

interface SessionStore {
  user: SessionUser | null;
  status: SessionStatus;
  setUser: (user: SessionUser | null) => void;
  clear: () => void;
}

/**
 * Not persisted. The httpOnly session cookie is the source of truth; this is a
 * render convenience hydrated from GET /api/auth/session.
 */
export const useSessionStore = create<SessionStore>((set) => ({
  user: null,
  status: 'unknown',
  setUser: (user) => set({ user, status: user ? 'authenticated' : 'anonymous' }),
  clear: () => set({ user: null, status: 'anonymous' }),
}));
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run features/session/session-store.test.ts`
Expected: PASS — 5 tests

- [ ] **Step 6: Commit**

```bash
git add features/session package.json package-lock.json
git commit -m "feat: add zustand session store"
```

---

## Task 8: Auth schemas, user fixtures, and the mock identity resource

**Files:**
- Create: `lib/api/schemas/auth.ts`, `lib/api/schemas/auth.test.ts`, `content/mock/users.ts`, `lib/api/resources/auth/mock.ts`, `lib/api/resources/auth/index.ts`, `lib/api/resources/auth/mock.test.ts`
- Modify: `content/mock/index.ts`, `tests/contract/fixtures.test.ts`

**Interfaces:**
- Consumes: envelope schemas (Task 1)
- Produces: `userSchema`, `registerSchema`, `loginSchema`, `otpRequestSchema`, `otpVerifySchema`, `passwordResetSchema`, `identifierSchema`, and types `User`, `RegisterInput`, `LoginInput`, `OtpPurpose`
- Produces: `auth` with `register(input)`, `login(input)`, `loginWithGoogle(idToken)`, `requestOtp(input)`, `verifyOtp(input)`, `resetPassword(input)`, `getUserById(id)`

- [ ] **Step 1: Write the failing schema test**

Create `lib/api/schemas/auth.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { identifierSchema, registerSchema, otpVerifySchema, passwordResetSchema } from './auth';

describe('identifierSchema', () => {
  it('accepts a Vietnamese mobile number', () => {
    expect(identifierSchema.parse('0912345678')).toBe('0912345678');
  });

  it('accepts +84 form', () => {
    expect(identifierSchema.parse('+84912345678')).toBe('+84912345678');
  });

  it('accepts an email', () => {
    expect(identifierSchema.parse('a@b.vn')).toBe('a@b.vn');
  });

  it('rejects a string that is neither', () => {
    expect(() => identifierSchema.parse('not-a-contact')).toThrow();
  });
});

describe('registerSchema', () => {
  it('accepts phone plus name with no password', () => {
    const r = registerSchema.parse({ identifier: '0912345678', name: 'Mai' });
    expect(r.name).toBe('Mai');
  });

  it('rejects an empty name', () => {
    expect(() => registerSchema.parse({ identifier: '0912345678', name: '' })).toThrow();
  });

  it('imposes no password complexity rule, only a minimum length', () => {
    expect(registerSchema.parse({ identifier: 'a@b.vn', name: 'Mai', password: 'abcdefgh' }).password)
      .toBe('abcdefgh');
    expect(() => registerSchema.parse({ identifier: 'a@b.vn', name: 'Mai', password: 'short' })).toThrow();
  });
});

describe('otpVerifySchema', () => {
  it('accepts a six-digit code', () => {
    expect(otpVerifySchema.parse({ otpId: 'o1', code: '123456' }).code).toBe('123456');
  });

  it('rejects a five-digit code', () => {
    expect(() => otpVerifySchema.parse({ otpId: 'o1', code: '12345' })).toThrow();
  });

  it('rejects a non-numeric code', () => {
    expect(() => otpVerifySchema.parse({ otpId: 'o1', code: 'abcdef' })).toThrow();
  });
});

describe('passwordResetSchema', () => {
  it('requires a reset token and a new password', () => {
    const r = passwordResetSchema.parse({ resetToken: 't', newPassword: 'abcdefgh' });
    expect(r.resetToken).toBe('t');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/api/schemas/auth.test.ts`
Expected: FAIL — `Failed to resolve import "./auth"`

- [ ] **Step 3: Write the auth schemas**

Create `lib/api/schemas/auth.ts`:

```ts
import { z } from 'zod';

/** Vietnamese mobile: local 0-prefixed 9 digits, or +84 international form. */
const VN_PHONE = /^(0\d{9}|\+84\d{9})$/;

export const identifierSchema = z
  .string()
  .trim()
  .refine(
    (v) => VN_PHONE.test(v) || z.string().email().safeParse(v).success,
    'Enter a valid phone number or email address',
  );

export function isPhone(identifier: string): boolean {
  return VN_PHONE.test(identifier);
}

export const userSchema = z.object({
  id: z.string(),
  phone: z.string(),
  email: z.string().email().optional(),
  name: z.string(),
  dob: z.string().optional(),
  avatarUrl: z.string().optional(),
  createdAt: z.string(),
});

/**
 * No password complexity rules, per the client checklist — only a minimum
 * length, without which the field is not a password at all.
 */
const passwordSchema = z.string().min(8, 'Use at least 8 characters');

export const registerSchema = z.object({
  identifier: identifierSchema,
  name: z.string().trim().min(1, 'Enter your name'),
  password: passwordSchema.optional(),
});

export const loginSchema = z.object({
  identifier: identifierSchema,
  password: z.string().min(1, 'Enter your password'),
});

export const googleLoginSchema = z.object({ idToken: z.string().min(1) });

export const otpPurposeSchema = z.enum(['signup', 'login', 'reset']);

export const otpRequestSchema = z.object({
  identifier: identifierSchema,
  purpose: otpPurposeSchema,
});

export const otpChallengeSchema = z.object({
  otpId: z.string(),
  expiresAt: z.string(),
  /** Mock mode only — the code that would have been sent. Never set upstream. */
  devCode: z.string().optional(),
});

export const otpVerifySchema = z.object({
  otpId: z.string().min(1),
  code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code'),
});

export const otpVerifyResultSchema = z.union([
  z.object({ kind: z.literal('session'), user: userSchema }),
  z.object({ kind: z.literal('reset'), resetToken: z.string() }),
]);

export const passwordResetSchema = z.object({
  resetToken: z.string().min(1),
  newPassword: passwordSchema,
});

export const sessionSchema = z.object({ user: userSchema.nullable() });

export type User = z.infer<typeof userSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type OtpPurpose = z.infer<typeof otpPurposeSchema>;
export type OtpRequestInput = z.infer<typeof otpRequestSchema>;
export type OtpChallenge = z.infer<typeof otpChallengeSchema>;
export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;
export type OtpVerifyResult = z.infer<typeof otpVerifyResultSchema>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/api/schemas/auth.test.ts`
Expected: PASS — 11 tests

- [ ] **Step 5: Add user fixtures**

Create `content/mock/users.ts`:

```ts
import type { User } from '@/lib/api/schemas/auth';

/** Mock accounts. `password` is plaintext because nothing here is real. */
export interface MockUser extends User {
  password?: string;
}

export const users: MockUser[] = [
  {
    id: 'u-001',
    phone: '0912345678',
    email: 'mai@example.vn',
    name: 'Nguyễn Thị Mai',
    dob: '1998-04-12',
    createdAt: '2026-01-15T09:00:00.000Z',
    password: 'vivimoon123',
  },
  {
    id: 'u-002',
    phone: '0987654321',
    email: 'linh@example.vn',
    name: 'Trần Khánh Linh',
    createdAt: '2026-03-02T14:30:00.000Z',
    password: 'vivimoon123',
  },
];
```

Add to `content/mock/index.ts`:

```ts
export { users, type MockUser } from './users';
```

- [ ] **Step 6: Extend the conformance suite to cover users**

In `tests/contract/fixtures.test.ts`, add `users` to the `content/mock` import, add `userSchema` imported from `@/lib/api/schemas/auth`, and append this test inside the `describe`:

```ts
  it('every user satisfies userSchema', () => {
    expectAllValid(userSchema, users, 'user');
  });

  it('user phones are unique', () => {
    const phones = users.map((u) => u.phone);
    expect(phones.length).toBe(new Set(phones).size);
  });
```

- [ ] **Step 7: Write the failing mock-auth test**

Create `lib/api/resources/auth/mock.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { mockAuth, resetMockAuthState } from './mock';

describe('mockAuth', () => {
  beforeEach(() => { resetMockAuthState(); });

  it('logs in with a known phone and password', async () => {
    const user = await mockAuth.login({ identifier: '0912345678', password: 'vivimoon123' });
    expect(user.name).toBe('Nguyễn Thị Mai');
  });

  it('logs in by email as well as phone', async () => {
    const user = await mockAuth.login({ identifier: 'mai@example.vn', password: 'vivimoon123' });
    expect(user.id).toBe('u-001');
  });

  it('rejects a wrong password', async () => {
    await expect(mockAuth.login({ identifier: '0912345678', password: 'nope' })).rejects.toThrow(/invalid/i);
  });

  it('rejects an unknown identifier with the same message as a wrong password', async () => {
    // Identical wording both ways, so the form cannot be used to enumerate accounts.
    const unknown = await mockAuth.login({ identifier: '0900000000', password: 'x' }).catch((e) => e.message);
    const wrong = await mockAuth.login({ identifier: '0912345678', password: 'x' }).catch((e) => e.message);
    expect(unknown).toBe(wrong);
  });

  it('registers a new account', async () => {
    const user = await mockAuth.register({ identifier: '0911111111', name: 'Mới', password: 'abcdefgh' });
    expect(user.phone).toBe('0911111111');
    expect(await mockAuth.getUserById(user.id)).not.toBeNull();
  });

  it('refuses to register an identifier already in use', async () => {
    await expect(
      mockAuth.register({ identifier: '0912345678', name: 'Dup', password: 'abcdefgh' }),
    ).rejects.toThrow(/already/i);
  });

  it('stores an email identifier on the email field, not the phone field', async () => {
    const user = await mockAuth.register({ identifier: 'new@example.vn', name: 'E' });
    expect(user.email).toBe('new@example.vn');
    expect(user.phone).toBe('');
  });

  it('issues an OTP challenge carrying a dev code in mock mode', async () => {
    const c = await mockAuth.requestOtp({ identifier: '0912345678', purpose: 'reset' });
    expect(c.otpId).toBeTruthy();
    expect(c.devCode).toMatch(/^\d{6}$/);
  });

  it('issues a challenge for an unknown identifier too, revealing nothing', async () => {
    const c = await mockAuth.requestOtp({ identifier: '0900000000', purpose: 'reset' });
    expect(c.otpId).toBeTruthy();
  });

  it('verifies a reset OTP into a reset token', async () => {
    const c = await mockAuth.requestOtp({ identifier: '0912345678', purpose: 'reset' });
    const result = await mockAuth.verifyOtp({ otpId: c.otpId, code: c.devCode! });
    expect(result.kind).toBe('reset');
  });

  it('verifies a signup OTP into a session', async () => {
    const c = await mockAuth.requestOtp({ identifier: '0912345678', purpose: 'login' });
    const result = await mockAuth.verifyOtp({ otpId: c.otpId, code: c.devCode! });
    expect(result.kind).toBe('session');
  });

  it('rejects a wrong code', async () => {
    const c = await mockAuth.requestOtp({ identifier: '0912345678', purpose: 'reset' });
    const wrong = c.devCode === '000000' ? '111111' : '000000';
    await expect(mockAuth.verifyOtp({ otpId: c.otpId, code: wrong })).rejects.toThrow(/invalid|expired/i);
  });

  it('consumes an OTP so it cannot be replayed', async () => {
    const c = await mockAuth.requestOtp({ identifier: '0912345678', purpose: 'reset' });
    await mockAuth.verifyOtp({ otpId: c.otpId, code: c.devCode! });
    await expect(mockAuth.verifyOtp({ otpId: c.otpId, code: c.devCode! })).rejects.toThrow(/invalid|expired/i);
  });

  it('resets a password and lets the new one log in', async () => {
    const c = await mockAuth.requestOtp({ identifier: '0912345678', purpose: 'reset' });
    const result = await mockAuth.verifyOtp({ otpId: c.otpId, code: c.devCode! });
    if (result.kind !== 'reset') throw new Error('expected a reset token');
    await mockAuth.resetPassword({ resetToken: result.resetToken, newPassword: 'brandnew1' });
    const user = await mockAuth.login({ identifier: '0912345678', password: 'brandnew1' });
    expect(user.id).toBe('u-001');
  });
});
```

- [ ] **Step 8: Run test to verify it fails**

Run: `npx vitest run lib/api/resources/auth/mock.test.ts`
Expected: FAIL — `Failed to resolve import "./mock"`

- [ ] **Step 9: Write the mock identity resource**

Create `lib/api/resources/auth/mock.ts`:

```ts
import { users as seedUsers, type MockUser } from '@/content/mock';
import { isPhone, type LoginInput, type OtpChallenge, type OtpPurpose, type OtpRequestInput, type OtpVerifyInput, type OtpVerifyResult, type PasswordResetInput, type RegisterInput, type User } from '@/lib/api/schemas/auth';

/** Thrown by the mock so route handlers can map to an error code. */
export class AuthError extends Error {
  constructor(message: string, readonly code: 'unauthorized' | 'conflict' | 'not_found') {
    super(message);
    this.name = 'AuthError';
  }
}

interface OtpRecord { identifier: string; code: string; purpose: OtpPurpose; expiresAt: number }
interface ResetRecord { userId: string; expiresAt: number }

// In-memory state. Resets on every server restart, which is correct for a mock.
let store: MockUser[] = seedUsers.map((u) => ({ ...u }));
const otps = new Map<string, OtpRecord>();
const resets = new Map<string, ResetRecord>();

/** Test helper — restores the fixture state between cases. */
export function resetMockAuthState(): void {
  store = seedUsers.map((u) => ({ ...u }));
  otps.clear();
  resets.clear();
}

const OTP_TTL_MS = 5 * 60 * 1000;
const RESET_TTL_MS = 15 * 60 * 1000;

function publicUser(u: MockUser): User {
  const { password: _password, ...rest } = u;
  return rest;
}

function findByIdentifier(identifier: string): MockUser | undefined {
  const v = identifier.trim().toLowerCase();
  return store.find((u) => u.phone.toLowerCase() === v || u.email?.toLowerCase() === v);
}

function randomId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function randomCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export const mockAuth = {
  async register(input: RegisterInput): Promise<User> {
    if (findByIdentifier(input.identifier)) {
      throw new AuthError('That phone or email is already registered', 'conflict');
    }
    const phoneLike = isPhone(input.identifier);
    const user: MockUser = {
      id: randomId('u'),
      phone: phoneLike ? input.identifier : '',
      email: phoneLike ? undefined : input.identifier,
      name: input.name,
      createdAt: new Date().toISOString(),
      password: input.password,
    };
    store.push(user);
    return publicUser(user);
  },

  async login({ identifier, password }: LoginInput): Promise<User> {
    const user = findByIdentifier(identifier);
    // Identical failure for unknown account and wrong password: a differing
    // message would turn the sign-in form into an account-enumeration oracle.
    if (!user || user.password !== password) {
      throw new AuthError('Invalid phone/email or password', 'unauthorized');
    }
    return publicUser(user);
  },

  async loginWithGoogle(idToken: string): Promise<User> {
    // The mock treats the token as an email. Real verification is Vivimoon's.
    const existing = findByIdentifier(idToken);
    if (existing) return publicUser(existing);
    const user: MockUser = {
      id: randomId('u'),
      phone: '',
      email: idToken,
      name: idToken.split('@')[0] || 'Google user',
      createdAt: new Date().toISOString(),
    };
    store.push(user);
    return publicUser(user);
  },

  async requestOtp({ identifier, purpose }: OtpRequestInput): Promise<OtpChallenge> {
    // A challenge is issued whether or not the account exists, so the caller
    // learns nothing about which identifiers are registered.
    const otpId = randomId('otp');
    const code = randomCode();
    const expiresAt = Date.now() + OTP_TTL_MS;
    otps.set(otpId, { identifier, code, purpose, expiresAt });
    return {
      otpId,
      expiresAt: new Date(expiresAt).toISOString(),
      devCode: code,
    };
  },

  async verifyOtp({ otpId, code }: OtpVerifyInput): Promise<OtpVerifyResult> {
    const record = otps.get(otpId);
    if (!record || record.code !== code || record.expiresAt < Date.now()) {
      throw new AuthError('That code is invalid or has expired', 'unauthorized');
    }
    otps.delete(otpId); // single use — no replay

    const user = findByIdentifier(record.identifier);
    if (!user) throw new AuthError('That code is invalid or has expired', 'unauthorized');

    if (record.purpose === 'reset') {
      const resetToken = randomId('rst');
      resets.set(resetToken, { userId: user.id, expiresAt: Date.now() + RESET_TTL_MS });
      return { kind: 'reset', resetToken };
    }
    return { kind: 'session', user: publicUser(user) };
  },

  async resetPassword({ resetToken, newPassword }: PasswordResetInput): Promise<User> {
    const record = resets.get(resetToken);
    if (!record || record.expiresAt < Date.now()) {
      throw new AuthError('That reset link is invalid or has expired', 'unauthorized');
    }
    resets.delete(resetToken);
    const user = store.find((u) => u.id === record.userId);
    if (!user) throw new AuthError('Account not found', 'not_found');
    user.password = newPassword;
    return publicUser(user);
  },

  async getUserById(id: string): Promise<User | null> {
    const user = store.find((u) => u.id === id);
    return user ? publicUser(user) : null;
  },

  /** Used by the account resource, which shares this store. */
  async updateUser(id: string, patch: Partial<Pick<MockUser, 'name' | 'email' | 'dob' | 'password'>>): Promise<User> {
    const user = store.find((u) => u.id === id);
    if (!user) throw new AuthError('Account not found', 'not_found');
    Object.assign(user, patch);
    return publicUser(user);
  },
};

export type Auth = typeof mockAuth;
```

- [ ] **Step 10: Run test to verify it passes**

Run: `npx vitest run lib/api/resources/auth/mock.test.ts`
Expected: PASS — 14 tests

- [ ] **Step 11: Write the resolver**

Create `lib/api/resources/auth/index.ts`:

```ts
import { resolveMode } from '@/lib/api/config';
import { mockAuth, type Auth } from './mock';

export const auth: Auth =
  resolveMode('identity') === 'mock'
    ? mockAuth
    : (() => {
        throw new Error(
          'identity is set to upstream but lib/api/resources/auth/upstream.ts does not exist yet',
        );
      })();

export { AuthError } from './mock';
```

- [ ] **Step 12: Run the full suite and commit**

Run: `npm test`
Expected: all tests pass.

```bash
git add lib/api/schemas/auth.ts lib/api/schemas/auth.test.ts lib/api/resources/auth content/mock tests/contract
git commit -m "feat: add auth schemas and mock identity resource"
```

---

## Task 9: Session cookie and auth route handlers

**Files:**
- Create: `lib/auth/cookie.ts`, `lib/auth/cookie.test.ts`, `app/api/auth/register/route.ts`, `app/api/auth/login/route.ts`, `app/api/auth/google/route.ts`, `app/api/auth/logout/route.ts`, `app/api/auth/session/route.ts`, `app/api/auth/otp/request/route.ts`, `app/api/auth/otp/verify/route.ts`, `app/api/auth/password/reset/route.ts`, `app/api/auth/auth-routes.test.ts`
- Modify: none

**Interfaces:**
- Consumes: `auth`, `AuthError` (Task 8), `apiOk`/`apiFail` (Task 1), `isAnyUpstream` (Task 1)
- Produces: `signSession(userId)`, `verifySession(value)`, `SESSION_COOKIE`, `sessionCookieOptions()`
- Produces: `readSessionUserId()` — reads and verifies the cookie in a Server Component or route handler
- Produces: the eight `/api/auth/*` endpoints

- [ ] **Step 1: Write the failing cookie test**

Create `lib/auth/cookie.test.ts`:

```ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { signSession, verifySession, SESSION_COOKIE } from './cookie';

const saved = { ...process.env };
beforeEach(() => { process.env = { ...saved, AUTH_COOKIE_SECRET: 'test-secret' }; });
afterEach(() => { process.env = { ...saved }; });

describe('session cookie', () => {
  it('round-trips a user id', () => {
    expect(verifySession(signSession('u-001'))).toBe('u-001');
  });

  it('rejects a tampered payload', () => {
    const [, sig] = signSession('u-001').split('.');
    expect(verifySession(`u-999.${sig}`)).toBeNull();
  });

  it('rejects a bad signature', () => {
    expect(verifySession('u-001.deadbeef')).toBeNull();
  });

  it('rejects a malformed value', () => {
    expect(verifySession('nonsense')).toBeNull();
    expect(verifySession('')).toBeNull();
  });

  it('produces a different signature under a different secret', () => {
    const a = signSession('u-001');
    process.env.AUTH_COOKIE_SECRET = 'other-secret';
    expect(verifySession(a)).toBeNull();
  });

  it('names the cookie', () => {
    expect(SESSION_COOKIE).toBe('vivimoon_session');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/auth/cookie.test.ts`
Expected: FAIL — `Failed to resolve import "./cookie"`

- [ ] **Step 3: Write the cookie module**

Create `lib/auth/cookie.ts`:

```ts
import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

export const SESSION_COOKIE = 'vivimoon_session';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function secret(): string {
  const value = process.env.AUTH_COOKIE_SECRET;
  if (!value) throw new Error('AUTH_COOKIE_SECRET is not set');
  return value;
}

function sign(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('hex');
}

/** `<userId>.<hmac>` — opaque to the browser, which never reads it anyway. */
export function signSession(userId: string): string {
  return `${userId}.${sign(userId)}`;
}

export function verifySession(value: string | undefined): string | null {
  if (!value) return null;
  const index = value.lastIndexOf('.');
  if (index <= 0) return null;

  const payload = value.slice(0, index);
  const provided = Buffer.from(value.slice(index + 1), 'hex');
  const expected = Buffer.from(sign(payload), 'hex');
  if (provided.length !== expected.length) return null;
  return timingSafeEqual(provided, expected) ? payload : null;
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  };
}

/** Reads the verified user id in a Server Component or route handler. */
export async function readSessionUserId(): Promise<string | null> {
  const jar = await cookies();
  return verifySession(jar.get(SESSION_COOKIE)?.value);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/auth/cookie.test.ts`
Expected: PASS — 6 tests

- [ ] **Step 5: Write the failing route test**

Create `app/api/auth/auth-routes.test.ts`:

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest';

const jar = new Map<string, string>();
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => (jar.has(name) ? { name, value: jar.get(name) } : undefined),
    set: (name: string, value: string) => { jar.set(name, value); },
    delete: (name: string) => { jar.delete(name); },
  }),
}));

process.env.AUTH_COOKIE_SECRET = 'test-secret';

const { POST: login } = await import('./login/route');
const { POST: register } = await import('./register/route');
const { GET: session } = await import('./session/route');
const { POST: logout } = await import('./logout/route');
const { POST: otpRequest } = await import('./otp/request/route');
const { POST: otpVerify } = await import('./otp/verify/route');
const { resetMockAuthState } = await import('@/lib/api/resources/auth/mock');

function post(body: unknown): Request {
  return new Request('http://localhost/api/auth', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('auth routes', () => {
  beforeEach(() => { jar.clear(); resetMockAuthState(); });

  it('logs in and sets the session cookie', async () => {
    const res = await login(post({ identifier: '0912345678', password: 'vivimoon123' }));
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.data.user.name).toBe('Nguyễn Thị Mai');
    expect(jar.get('vivimoon_session')).toBeTruthy();
  });

  it('never returns the session token in the body', async () => {
    const res = await login(post({ identifier: '0912345678', password: 'vivimoon123' }));
    expect(JSON.stringify(await res.json())).not.toContain(jar.get('vivimoon_session')!);
  });

  it('401s a wrong password without setting a cookie', async () => {
    const res = await login(post({ identifier: '0912345678', password: 'wrong' }));
    expect(res.status).toBe(401);
    expect((await res.json()).error.code).toBe('unauthorized');
    expect(jar.has('vivimoon_session')).toBe(false);
  });

  it('400s a malformed identifier', async () => {
    const res = await login(post({ identifier: 'nope', password: 'x' }));
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe('validation_failed');
  });

  it('409s a duplicate registration', async () => {
    const res = await register(post({ identifier: '0912345678', name: 'Dup', password: 'abcdefgh' }));
    expect(res.status).toBe(409);
  });

  it('returns the current user from the session cookie', async () => {
    await login(post({ identifier: '0912345678', password: 'vivimoon123' }));
    const body = await (await session()).json();
    expect(body.data.user.id).toBe('u-001');
  });

  it('returns a null user with no cookie', async () => {
    const body = await (await session()).json();
    expect(body.data.user).toBeNull();
  });

  it('clears the cookie on logout', async () => {
    await login(post({ identifier: '0912345678', password: 'vivimoon123' }));
    await logout();
    expect(jar.has('vivimoon_session')).toBe(false);
  });

  it('issues and verifies an OTP end to end', async () => {
    const challenge = (await (await otpRequest(post({ identifier: '0912345678', purpose: 'login' }))).json()).data;
    const res = await otpVerify(post({ otpId: challenge.otpId, code: challenge.devCode }));
    expect((await res.json()).data.kind).toBe('session');
    expect(jar.get('vivimoon_session')).toBeTruthy();
  });

  it('strips devCode when any resource is upstream', async () => {
    process.env.API_MODE_CATALOG = 'upstream';
    process.env.UPSTREAM_API_BASE_URL = 'https://api.example.com';
    const body = await (await otpRequest(post({ identifier: '0912345678', purpose: 'login' }))).json();
    expect(body.data.devCode).toBeUndefined();
    delete process.env.API_MODE_CATALOG;
    delete process.env.UPSTREAM_API_BASE_URL;
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npx vitest run app/api/auth/auth-routes.test.ts`
Expected: FAIL — cannot resolve `./login/route`

- [ ] **Step 7: Write a shared route helper**

Create `lib/api/route-helpers.ts`:

```ts
import type { z } from 'zod';
import { cookies } from 'next/headers';
import { apiFail } from './response';
import { AuthError } from './resources/auth';
import { SESSION_COOKIE, sessionCookieOptions, signSession } from '@/lib/auth/cookie';

/** Parses a JSON body against a schema, returning a 400 envelope on failure. */
export async function parseBody<T extends z.ZodTypeAny>(
  request: Request,
  schema: T,
): Promise<{ ok: true; data: z.infer<T> } | { ok: false; response: Response }> {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return { ok: false, response: apiFail('validation_failed', 'Expected a JSON body') };
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return {
      ok: false,
      response: apiFail('validation_failed', first.message, { field: first.path.join('.') }),
    };
  }
  return { ok: true, data: parsed.data };
}

/** Maps a thrown AuthError to its envelope; rethrows anything unexpected. */
export function authErrorResponse(error: unknown): Response {
  if (error instanceof AuthError) return apiFail(error.code, error.message);
  throw error;
}

export async function startSession(userId: string): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, signSession(userId), sessionCookieOptions());
}

export async function endSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}
```

- [ ] **Step 8: Write the login, register, and Google handlers**

Create `app/api/auth/login/route.ts`:

```ts
import { auth } from '@/lib/api/resources/auth';
import { loginSchema } from '@/lib/api/schemas/auth';
import { apiOk } from '@/lib/api/response';
import { authErrorResponse, parseBody, startSession } from '@/lib/api/route-helpers';

export async function POST(request: Request) {
  const parsed = await parseBody(request, loginSchema);
  if (!parsed.ok) return parsed.response;
  try {
    const user = await auth.login(parsed.data);
    await startSession(user.id);
    return apiOk({ user });
  } catch (error) {
    return authErrorResponse(error);
  }
}
```

Create `app/api/auth/register/route.ts`:

```ts
import { auth } from '@/lib/api/resources/auth';
import { registerSchema } from '@/lib/api/schemas/auth';
import { apiOk } from '@/lib/api/response';
import { authErrorResponse, parseBody, startSession } from '@/lib/api/route-helpers';

export async function POST(request: Request) {
  const parsed = await parseBody(request, registerSchema);
  if (!parsed.ok) return parsed.response;
  try {
    const user = await auth.register(parsed.data);
    await startSession(user.id);
    return apiOk({ user });
  } catch (error) {
    return authErrorResponse(error);
  }
}
```

Create `app/api/auth/google/route.ts`:

```ts
import { auth } from '@/lib/api/resources/auth';
import { googleLoginSchema } from '@/lib/api/schemas/auth';
import { apiOk } from '@/lib/api/response';
import { authErrorResponse, parseBody, startSession } from '@/lib/api/route-helpers';

export async function POST(request: Request) {
  const parsed = await parseBody(request, googleLoginSchema);
  if (!parsed.ok) return parsed.response;
  try {
    const user = await auth.loginWithGoogle(parsed.data.idToken);
    await startSession(user.id);
    return apiOk({ user });
  } catch (error) {
    return authErrorResponse(error);
  }
}
```

- [ ] **Step 9: Write the session and logout handlers**

Create `app/api/auth/session/route.ts`:

```ts
import { auth } from '@/lib/api/resources/auth';
import { apiOk } from '@/lib/api/response';
import { readSessionUserId } from '@/lib/auth/cookie';

export async function GET() {
  const userId = await readSessionUserId();
  const user = userId ? await auth.getUserById(userId) : null;
  return apiOk({ user });
}
```

Create `app/api/auth/logout/route.ts`:

```ts
import { apiOk } from '@/lib/api/response';
import { endSession } from '@/lib/api/route-helpers';

export async function POST() {
  await endSession();
  return apiOk({ ok: true });
}
```

- [ ] **Step 10: Write the OTP and reset handlers**

Create `app/api/auth/otp/request/route.ts`:

```ts
import { auth } from '@/lib/api/resources/auth';
import { otpRequestSchema } from '@/lib/api/schemas/auth';
import { apiOk } from '@/lib/api/response';
import { authErrorResponse, parseBody } from '@/lib/api/route-helpers';
import { isAnyUpstream } from '@/lib/api/config';

export async function POST(request: Request) {
  const parsed = await parseBody(request, otpRequestSchema);
  if (!parsed.ok) return parsed.response;
  try {
    const challenge = await auth.requestOtp(parsed.data);
    // devCode is a local convenience. Strip it the moment anything is live so
    // it can never reach a real user's browser.
    const { devCode, ...rest } = challenge;
    return apiOk(isAnyUpstream() ? rest : challenge);
  } catch (error) {
    return authErrorResponse(error);
  }
}
```

Create `app/api/auth/otp/verify/route.ts`:

```ts
import { auth } from '@/lib/api/resources/auth';
import { otpVerifySchema } from '@/lib/api/schemas/auth';
import { apiOk } from '@/lib/api/response';
import { authErrorResponse, parseBody, startSession } from '@/lib/api/route-helpers';

export async function POST(request: Request) {
  const parsed = await parseBody(request, otpVerifySchema);
  if (!parsed.ok) return parsed.response;
  try {
    const result = await auth.verifyOtp(parsed.data);
    if (result.kind === 'session') await startSession(result.user.id);
    return apiOk(result);
  } catch (error) {
    return authErrorResponse(error);
  }
}
```

Create `app/api/auth/password/reset/route.ts`:

```ts
import { auth } from '@/lib/api/resources/auth';
import { passwordResetSchema } from '@/lib/api/schemas/auth';
import { apiOk } from '@/lib/api/response';
import { authErrorResponse, parseBody, startSession } from '@/lib/api/route-helpers';

export async function POST(request: Request) {
  const parsed = await parseBody(request, passwordResetSchema);
  if (!parsed.ok) return parsed.response;
  try {
    const user = await auth.resetPassword(parsed.data);
    await startSession(user.id);
    return apiOk({ user });
  } catch (error) {
    return authErrorResponse(error);
  }
}
```

- [ ] **Step 11: Run test to verify it passes**

Run: `npx vitest run app/api/auth/auth-routes.test.ts`
Expected: PASS — 11 tests

- [ ] **Step 12: Run the full suite and commit**

Run: `npm test && npx tsc --noEmit`
Expected: all tests pass, no type errors.

```bash
git add lib/auth lib/api/route-helpers.ts app/api/auth
git commit -m "feat: add session cookie and auth route handlers"
```

---

## Task 10: Browser API client, session sync, and the sign-in / sign-up pages

**Files:**
- Create: `lib/api/client.ts`, `lib/api/client.test.ts`, `features/session/session-sync.tsx`, `app/[locale]/(auth)/layout.tsx`, `app/[locale]/(auth)/sign-in/page.tsx`, `app/[locale]/(auth)/sign-up/page.tsx`, `app/[locale]/(auth)/sign-in/sign-in.test.tsx`
- Modify: `lib/i18n/dictionaries/en.ts`, `lib/i18n/dictionaries/vi.ts`, `app/[locale]/layout.tsx`

**Interfaces:**
- Consumes: auth route handlers (Task 9), `useSessionStore` (Task 7)
- Produces: `apiRequest<T>(path, init?): Promise<ApiResult<T>>` — returns the envelope, never throws on a 4xx
- Produces: `<SessionSync />` — hydrates the session store once on mount
- Produces: routes `/[locale]/sign-in`, `/[locale]/sign-up`

- [ ] **Step 1: Write the failing client test**

Create `lib/api/client.test.ts`:

```ts
import { describe, it, expect, vi, afterEach } from 'vitest';
import { apiRequest } from './client';

function mockFetch(body: unknown, status = 200) {
  return vi.fn().mockResolvedValue(
    new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } }),
  );
}

afterEach(() => { vi.unstubAllGlobals(); });

describe('apiRequest', () => {
  it('returns data on a success envelope', async () => {
    vi.stubGlobal('fetch', mockFetch({ ok: true, data: { id: 'u1' } }));
    const result = await apiRequest<{ id: string }>('/api/x');
    expect(result).toEqual({ ok: true, data: { id: 'u1' } });
  });

  it('returns the error envelope on a 4xx rather than throwing', async () => {
    vi.stubGlobal('fetch', mockFetch({ ok: false, error: { code: 'unauthorized', message: 'nope' } }, 401));
    const result = await apiRequest('/api/x');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('unauthorized');
  });

  it('normalizes a non-JSON response into an internal error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html>502</html>', { status: 502 })));
    const result = await apiRequest('/api/x');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('internal');
  });

  it('normalizes a network failure into an internal error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    const result = await apiRequest('/api/x');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('internal');
  });

  it('sends JSON and the same-origin credentials the session cookie needs', async () => {
    const spy = mockFetch({ ok: true, data: null });
    vi.stubGlobal('fetch', spy);
    await apiRequest('/api/x', { method: 'POST', body: { a: 1 } });
    const [, init] = spy.mock.calls[0];
    expect(init.method).toBe('POST');
    expect(init.body).toBe('{"a":1}');
    expect(init.credentials).toBe('same-origin');
    expect(init.headers['content-type']).toBe('application/json');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/api/client.test.ts`
Expected: FAIL — `Failed to resolve import "./client"`

- [ ] **Step 3: Write the browser client**

Create `lib/api/client.ts`:

```ts
'use client';
import type { ApiError } from './schemas/common';

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiError };

const INTERNAL: ApiError = {
  code: 'internal',
  message: 'Something went wrong. Please try again.',
};

/**
 * Browser-side call to our own route handlers. Returns the envelope instead of
 * throwing, so forms branch on `result.ok` rather than wrapping every call in
 * try/catch. Server Components do not use this — they import the resource
 * module directly.
 */
export async function apiRequest<T>(
  path: string,
  init: Omit<RequestInit, 'body'> & { body?: unknown } = {},
): Promise<ApiResult<T>> {
  const { body, headers, ...rest } = init;
  try {
    const response = await fetch(path, {
      ...rest,
      credentials: 'same-origin', // the session cookie rides on this
      headers: { 'content-type': 'application/json', ...(headers as Record<string, string>) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });

    const json: unknown = await response.json();
    if (
      typeof json === 'object' && json !== null && 'ok' in json &&
      typeof (json as { ok: unknown }).ok === 'boolean'
    ) {
      return json as ApiResult<T>;
    }
    return { ok: false, error: INTERNAL };
  } catch {
    // Network failure, or a non-JSON body such as an HTML error page.
    return { ok: false, error: INTERNAL };
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/api/client.test.ts`
Expected: PASS — 5 tests

- [ ] **Step 5: Add the auth and account copy to the English dictionary**

In `lib/i18n/dictionaries/en.ts`, add these two keys to the exported object, after `checkout`:

```ts
  auth: {
    signInTitle: 'Sign in', signUpTitle: 'Create your account', signOut: 'Sign out',
    identifier: 'Phone or email', password: 'Password', name: 'Full name',
    continueWithGoogle: 'Continue with Google', or: 'or',
    forgotPassword: 'Forgot your password?',
    noAccount: 'New to Vivimoon?', createOne: 'Create an account',
    hasAccount: 'Already have an account?', signInInstead: 'Sign in',
    submitSignIn: 'Sign in', submitSignUp: 'Create account',
    resetTitle: 'Reset your password',
    resetIntro: 'Enter your phone or email and we will send you a 6-digit code.',
    sendCode: 'Send code', otpTitle: 'Enter your code',
    otpIntro: 'We sent a 6-digit code. It expires in 5 minutes.',
    otpCode: 'Verification code', verify: 'Verify',
    newPassword: 'New password', updatePassword: 'Update password',
    devCodeNotice: 'Development mode — your code is',
    errors: {
      identifier: 'Enter a valid phone number or email address',
      password: 'Use at least 8 characters',
      passwordRequired: 'Enter your password',
      name: 'Enter your name',
      code: 'Enter the 6-digit code',
      summary: 'Please fix the following before continuing.',
    },
  },
  account: {
    title: 'My account', infoTitle: 'Account information',
    phone: 'Phone', phoneLocked: 'Your phone number cannot be changed.',
    email: 'Email', name: 'Full name', dob: 'Date of birth',
    newPassword: 'New password',
    passwordHint: 'Leave blank to keep your current password.',
    save: 'Save changes', saved: 'Your changes have been saved.',
    errors: {
      email: 'Enter a valid email address',
      name: 'Enter your name',
      password: 'Use at least 8 characters',
      summary: 'Please fix the following before saving.',
    },
  },
```

- [ ] **Step 6: Add the matching Vietnamese copy**

In `lib/i18n/dictionaries/vi.ts`, add the same two keys with Vietnamese values:

```ts
  auth: {
    signInTitle: 'Đăng nhập', signUpTitle: 'Tạo tài khoản', signOut: 'Đăng xuất',
    identifier: 'Số điện thoại hoặc email', password: 'Mật khẩu', name: 'Họ và tên',
    continueWithGoogle: 'Tiếp tục với Google', or: 'hoặc',
    forgotPassword: 'Quên mật khẩu?',
    noAccount: 'Bạn chưa có tài khoản?', createOne: 'Tạo tài khoản',
    hasAccount: 'Bạn đã có tài khoản?', signInInstead: 'Đăng nhập',
    submitSignIn: 'Đăng nhập', submitSignUp: 'Tạo tài khoản',
    resetTitle: 'Đặt lại mật khẩu',
    resetIntro: 'Nhập số điện thoại hoặc email, chúng tôi sẽ gửi mã gồm 6 chữ số.',
    sendCode: 'Gửi mã', otpTitle: 'Nhập mã xác minh',
    otpIntro: 'Chúng tôi đã gửi mã gồm 6 chữ số. Mã có hiệu lực trong 5 phút.',
    otpCode: 'Mã xác minh', verify: 'Xác minh',
    newPassword: 'Mật khẩu mới', updatePassword: 'Cập nhật mật khẩu',
    devCodeNotice: 'Chế độ phát triển — mã của bạn là',
    errors: {
      identifier: 'Nhập số điện thoại hoặc email hợp lệ',
      password: 'Dùng ít nhất 8 ký tự',
      passwordRequired: 'Nhập mật khẩu',
      name: 'Nhập họ và tên',
      code: 'Nhập mã gồm 6 chữ số',
      summary: 'Vui lòng sửa các mục sau để tiếp tục.',
    },
  },
  account: {
    title: 'Tài khoản của tôi', infoTitle: 'Thông tin tài khoản',
    phone: 'Số điện thoại', phoneLocked: 'Không thể thay đổi số điện thoại.',
    email: 'Email', name: 'Họ và tên', dob: 'Ngày sinh',
    newPassword: 'Mật khẩu mới',
    passwordHint: 'Để trống nếu bạn muốn giữ mật khẩu hiện tại.',
    save: 'Lưu thay đổi', saved: 'Đã lưu thay đổi của bạn.',
    errors: {
      email: 'Nhập địa chỉ email hợp lệ',
      name: 'Nhập họ và tên',
      password: 'Dùng ít nhất 8 ký tự',
      summary: 'Vui lòng sửa các mục sau để lưu.',
    },
  },
```

- [ ] **Step 7: Typecheck the dictionaries**

Run: `npx tsc --noEmit`
Expected: no errors. `Dictionary` is inferred from `en`, so any key missing from `vi` fails here.

- [ ] **Step 8: Add the session sync component**

Create `features/session/session-sync.tsx`:

```tsx
'use client';
import { useEffect } from 'react';
import { apiRequest } from '@/lib/api/client';
import { useSessionStore, type SessionUser } from './session-store';

/**
 * Hydrates the session store once per mount from the httpOnly cookie, which
 * JavaScript cannot read directly. Renders nothing.
 */
export function SessionSync() {
  const setUser = useSessionStore((s) => s.setUser);

  useEffect(() => {
    let cancelled = false;
    apiRequest<{ user: SessionUser | null }>('/api/auth/session').then((result) => {
      if (cancelled) return;
      setUser(result.ok ? result.data.user : null);
    });
    return () => { cancelled = true; };
  }, [setUser]);

  return null;
}
```

- [ ] **Step 9: Mount it in the locale layout**

In `app/[locale]/layout.tsx`, add the import:

```tsx
import { SessionSync } from '@/features/session/session-sync';
```

and render `<SessionSync />` as the first child inside the layout's outermost returned element.

- [ ] **Step 10: Write the failing sign-in test**

Create `app/[locale]/(auth)/sign-in/sign-in.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { SignInForm } from './sign-in-form';

const push = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(''),
}));

// The real dictionary, not a stub: a partial literal would not satisfy
// Dictionary['auth'], and using the real copy catches drift between the
// dictionary and what the form renders.
const dict = getDictionary('en').auth;

function ok(data: unknown) {
  return new Response(JSON.stringify({ ok: true, data }), {
    status: 200, headers: { 'content-type': 'application/json' },
  });
}
function fail(code: string, message: string, status: number) {
  return new Response(JSON.stringify({ ok: false, error: { code, message } }), {
    status, headers: { 'content-type': 'application/json' },
  });
}

beforeEach(() => { push.mockReset(); });
afterEach(() => { vi.unstubAllGlobals(); });

describe('SignInForm', () => {
  it('shows a validation error for a malformed identifier', async () => {
    vi.stubGlobal('fetch', vi.fn());
    render(<SignInForm locale="en" dict={dict} />);
    await userEvent.type(screen.getByLabelText('Phone or email'), 'nonsense');
    await userEvent.type(screen.getByLabelText('Password'), 'whatever');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByText(dict.errors.identifier)).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('posts credentials and redirects on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok({ user: { id: 'u1', name: 'Mai', phone: '0912345678' } })));
    render(<SignInForm locale="en" dict={dict} />);
    await userEvent.type(screen.getByLabelText('Phone or email'), '0912345678');
    await userEvent.type(screen.getByLabelText('Password'), 'vivimoon123');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    await waitFor(() => expect(push).toHaveBeenCalledWith('/en/account'));
  });

  it('surfaces the server error message without clearing the form', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(fail('unauthorized', 'Invalid phone/email or password', 401)));
    render(<SignInForm locale="en" dict={dict} />);
    const id = screen.getByLabelText('Phone or email');
    await userEvent.type(id, '0912345678');
    await userEvent.type(screen.getByLabelText('Password'), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByText('Invalid phone/email or password')).toBeInTheDocument();
    expect(id).toHaveValue('0912345678');
    expect(push).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 11: Run test to verify it fails**

Run: `npx vitest run "app/[locale]/(auth)/sign-in/sign-in.test.tsx"`
Expected: FAIL — cannot resolve `./sign-in-form`

- [ ] **Step 12: Write the sign-in form**

Create `app/[locale]/(auth)/sign-in/sign-in-form.tsx`:

```tsx
'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput, type User } from '@/lib/api/schemas/auth';
import { apiRequest } from '@/lib/api/client';
import { useSessionStore } from '@/features/session/session-store';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function SignInForm({ locale, dict }: { locale: Locale; dict: Dictionary['auth'] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useSessionStore((s) => s.setUser);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register, handleSubmit, formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const next = searchParams.get('next');

  async function onSubmit(values: LoginInput) {
    setServerError(null);
    const result = await apiRequest<{ user: User }>('/api/auth/login', {
      method: 'POST', body: values,
    });
    if (!result.ok) {
      setServerError(result.error.message);
      return;
    }
    setUser(result.data.user);
    router.push(next && next.startsWith(`/${locale}`) ? next : `/${locale}/account`);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      {serverError ? (
        <Alert variant="destructive" className="border-destructive/40">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      ) : null}

      <FieldGroup>
        <Field data-invalid={Boolean(errors.identifier) || undefined}>
          <FieldLabel htmlFor="identifier">{dict.identifier}</FieldLabel>
          <Input
            id="identifier" type="text" autoComplete="username" className="h-11"
            aria-invalid={Boolean(errors.identifier)}
            aria-describedby={errors.identifier ? 'identifier-error' : undefined}
            {...register('identifier')}
          />
          {errors.identifier ? (
            <FieldError id="identifier-error">{dict.errors.identifier}</FieldError>
          ) : null}
        </Field>

        <Field data-invalid={Boolean(errors.password) || undefined}>
          <FieldLabel htmlFor="password">{dict.password}</FieldLabel>
          <Input
            id="password" type="password" autoComplete="current-password" className="h-11"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'password-error' : undefined}
            {...register('password')}
          />
          {errors.password ? (
            <FieldError id="password-error">{dict.errors.passwordRequired}</FieldError>
          ) : null}
        </Field>
      </FieldGroup>

      <Button type="submit" disabled={isSubmitting} className="h-12 w-full text-base">
        {dict.submitSignIn}
      </Button>

      <div className="flex flex-col gap-2 text-sm">
        <Link href={`/${locale}/forgot-password`} className="underline underline-offset-4">
          {dict.forgotPassword}
        </Link>
        <p className="text-muted-foreground">
          {dict.noAccount}{' '}
          <Link href={`/${locale}/sign-up`} className="underline underline-offset-4">
            {dict.createOne}
          </Link>
        </p>
      </div>
    </form>
  );
}
```

- [ ] **Step 13: Run test to verify it passes**

Run: `npx vitest run "app/[locale]/(auth)/sign-in/sign-in.test.tsx"`
Expected: PASS — 3 tests

- [ ] **Step 14: Add the auth route-group layout and the two pages**

Create `app/[locale]/(auth)/layout.tsx`:

```tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col justify-center px-4 py-16">
      {children}
    </div>
  );
}
```

Create `app/[locale]/(auth)/sign-in/page.tsx`:

```tsx
import { notFound } from 'next/navigation';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { SignInForm } from './sign-in-form';

export default async function SignInPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-semibold tracking-tight">{dict.auth.signInTitle}</h1>
      <SignInForm locale={locale} dict={dict.auth} />
    </div>
  );
}
```

Create `app/[locale]/(auth)/sign-up/sign-up-form.tsx`:

```tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput, type User } from '@/lib/api/schemas/auth';
import { apiRequest } from '@/lib/api/client';
import { useSessionStore } from '@/features/session/session-store';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function SignUpForm({ locale, dict }: { locale: Locale; dict: Dictionary['auth'] }) {
  const router = useRouter();
  const setUser = useSessionStore((s) => s.setUser);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register, handleSubmit, formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterInput) {
    setServerError(null);
    const result = await apiRequest<{ user: User }>('/api/auth/register', {
      method: 'POST', body: values,
    });
    if (!result.ok) {
      setServerError(result.error.message);
      return;
    }
    setUser(result.data.user);
    router.push(`/${locale}/account`);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      {serverError ? (
        <Alert variant="destructive" className="border-destructive/40">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      ) : null}

      <FieldGroup>
        <Field data-invalid={Boolean(errors.name) || undefined}>
          <FieldLabel htmlFor="name">{dict.name}</FieldLabel>
          <Input
            id="name" type="text" autoComplete="name" className="h-11"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'name-error' : undefined}
            {...register('name')}
          />
          {errors.name ? <FieldError id="name-error">{dict.errors.name}</FieldError> : null}
        </Field>

        <Field data-invalid={Boolean(errors.identifier) || undefined}>
          <FieldLabel htmlFor="identifier">{dict.identifier}</FieldLabel>
          <Input
            id="identifier" type="text" autoComplete="username" className="h-11"
            aria-invalid={Boolean(errors.identifier)}
            aria-describedby={errors.identifier ? 'identifier-error' : undefined}
            {...register('identifier')}
          />
          {errors.identifier ? (
            <FieldError id="identifier-error">{dict.errors.identifier}</FieldError>
          ) : null}
        </Field>

        <Field data-invalid={Boolean(errors.password) || undefined}>
          <FieldLabel htmlFor="password">{dict.password}</FieldLabel>
          <Input
            id="password" type="password" autoComplete="new-password" className="h-11"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'password-error' : undefined}
            {...register('password')}
          />
          {errors.password ? (
            <FieldError id="password-error">{dict.errors.password}</FieldError>
          ) : null}
        </Field>
      </FieldGroup>

      <Button type="submit" disabled={isSubmitting} className="h-12 w-full text-base">
        {dict.submitSignUp}
      </Button>

      <p className="text-sm text-muted-foreground">
        {dict.hasAccount}{' '}
        <Link href={`/${locale}/sign-in`} className="underline underline-offset-4">
          {dict.signInInstead}
        </Link>
      </p>
    </form>
  );
}
```

Create `app/[locale]/(auth)/sign-up/page.tsx`:

```tsx
import { notFound } from 'next/navigation';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { SignUpForm } from './sign-up-form';

export default async function SignUpPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-semibold tracking-tight">{dict.auth.signUpTitle}</h1>
      <SignUpForm locale={locale} dict={dict.auth} />
    </div>
  );
}
```

- [ ] **Step 15: Verify in the browser**

Run: `npm run dev`, open `http://localhost:3000/en/sign-in`, sign in with `0912345678` / `vivimoon123`.
Expected: redirect to `/en/account` (404 until Task 13 — the redirect itself is what you are checking). Confirm in DevTools → Application → Cookies that `vivimoon_session` exists and is flagged HttpOnly. Stop the dev server.

- [ ] **Step 16: Run the full suite and commit**

Run: `npm test && npx tsc --noEmit`

```bash
git add lib/api/client.ts lib/api/client.test.ts features/session "app/[locale]" lib/i18n
git commit -m "feat: add browser API client, session sync, and sign-in/sign-up pages"
```

---

## Task 11: Forgot-password OTP flow

A three-stage form on one route: request a code, verify it, set a new password. State lives in the component; nothing is persisted between stages except the ids the server returns.

**Files:**
- Create: `app/[locale]/(auth)/forgot-password/page.tsx`, `app/[locale]/(auth)/forgot-password/forgot-password-form.tsx`, `app/[locale]/(auth)/forgot-password/forgot-password.test.tsx`

**Interfaces:**
- Consumes: `/api/auth/otp/request`, `/api/auth/otp/verify`, `/api/auth/password/reset` (Task 9); `apiRequest` (Task 10)
- Produces: route `/[locale]/forgot-password`

- [ ] **Step 1: Write the failing test**

Create `app/[locale]/(auth)/forgot-password/forgot-password.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { ForgotPasswordForm } from './forgot-password-form';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push, refresh: vi.fn() }) }));

const dict = getDictionary('en').auth;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { 'content-type': 'application/json' },
  });
}

beforeEach(() => { push.mockReset(); });
afterEach(() => { vi.unstubAllGlobals(); });

describe('ForgotPasswordForm', () => {
  it('walks request -> verify -> reset and lands on sign-in', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(json({ ok: true, data: { otpId: 'o1', expiresAt: 'x', devCode: '123456' } }))
      .mockResolvedValueOnce(json({ ok: true, data: { kind: 'reset', resetToken: 'rt1' } }))
      .mockResolvedValueOnce(json({ ok: true, data: { user: { id: 'u1', name: 'Mai', phone: '0912345678' } } }));
    vi.stubGlobal('fetch', fetchMock);

    render(<ForgotPasswordForm locale="en" dict={dict} />);

    await userEvent.type(screen.getByLabelText('Phone or email'), '0912345678');
    await userEvent.click(screen.getByRole('button', { name: 'Send code' }));

    const code = await screen.findByLabelText('Verification code');
    await userEvent.type(code, '123456');
    await userEvent.click(screen.getByRole('button', { name: 'Verify' }));

    const password = await screen.findByLabelText('New password');
    await userEvent.type(password, 'brandnew1');
    await userEvent.click(screen.getByRole('button', { name: 'Update password' }));

    await waitFor(() => expect(push).toHaveBeenCalledWith('/en/account'));
    expect(fetchMock.mock.calls[0][0]).toBe('/api/auth/otp/request');
    expect(fetchMock.mock.calls[1][0]).toBe('/api/auth/otp/verify');
    expect(fetchMock.mock.calls[2][0]).toBe('/api/auth/password/reset');
  });

  it('shows the dev code only when the server sends one', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      json({ ok: true, data: { otpId: 'o1', expiresAt: 'x' } }),
    ));
    render(<ForgotPasswordForm locale="en" dict={dict} />);
    await userEvent.type(screen.getByLabelText('Phone or email'), '0912345678');
    await userEvent.click(screen.getByRole('button', { name: 'Send code' }));
    await screen.findByLabelText('Verification code');
    expect(screen.queryByText(/Development mode/)).not.toBeInTheDocument();
  });

  it('stays on the verify stage when the code is rejected', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(json({ ok: true, data: { otpId: 'o1', expiresAt: 'x' } }))
      .mockResolvedValueOnce(json({ ok: false, error: { code: 'unauthorized', message: 'That code is invalid or has expired' } }, 401)));

    render(<ForgotPasswordForm locale="en" dict={dict} />);
    await userEvent.type(screen.getByLabelText('Phone or email'), '0912345678');
    await userEvent.click(screen.getByRole('button', { name: 'Send code' }));
    await userEvent.type(await screen.findByLabelText('Verification code'), '000000');
    await userEvent.click(screen.getByRole('button', { name: 'Verify' }));

    expect(await screen.findByText('That code is invalid or has expired')).toBeInTheDocument();
    expect(screen.getByLabelText('Verification code')).toBeInTheDocument();
    expect(screen.queryByLabelText('New password')).not.toBeInTheDocument();
  });

  it('validates the identifier before calling the API', async () => {
    vi.stubGlobal('fetch', vi.fn());
    render(<ForgotPasswordForm locale="en" dict={dict} />);
    await userEvent.type(screen.getByLabelText('Phone or email'), 'nope');
    await userEvent.click(screen.getByRole('button', { name: 'Send code' }));
    expect(await screen.findByText(dict.errors.identifier)).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run "app/[locale]/(auth)/forgot-password/forgot-password.test.tsx"`
Expected: FAIL — cannot resolve `./forgot-password-form`

- [ ] **Step 3: Write the form**

Create `app/[locale]/(auth)/forgot-password/forgot-password-form.tsx`:

```tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { identifierSchema, type OtpChallenge, type OtpVerifyResult, type User } from '@/lib/api/schemas/auth';
import { apiRequest } from '@/lib/api/client';
import { useSessionStore } from '@/features/session/session-store';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Alert, AlertDescription } from '@/components/ui/alert';

type Stage =
  | { name: 'request' }
  | { name: 'verify'; otpId: string; devCode?: string }
  | { name: 'reset'; resetToken: string };

export function ForgotPasswordForm({ locale, dict }: { locale: Locale; dict: Dictionary['auth'] }) {
  const router = useRouter();
  const setUser = useSessionStore((s) => s.setUser);
  const [stage, setStage] = useState<Stage>({ name: 'request' });
  const [identifier, setIdentifier] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function reportServer(message: string) {
    setServerError(message);
    setBusy(false);
  }

  async function requestCode(event: React.FormEvent) {
    event.preventDefault();
    setFieldError(null);
    setServerError(null);
    if (!identifierSchema.safeParse(identifier).success) {
      setFieldError(dict.errors.identifier);
      return;
    }
    setBusy(true);
    const result = await apiRequest<OtpChallenge>('/api/auth/otp/request', {
      method: 'POST', body: { identifier, purpose: 'reset' },
    });
    if (!result.ok) return reportServer(result.error.message);
    setBusy(false);
    setStage({ name: 'verify', otpId: result.data.otpId, devCode: result.data.devCode });
  }

  async function verifyCode(event: React.FormEvent) {
    event.preventDefault();
    if (stage.name !== 'verify') return;
    setFieldError(null);
    setServerError(null);
    if (!/^\d{6}$/.test(code)) {
      setFieldError(dict.errors.code);
      return;
    }
    setBusy(true);
    const result = await apiRequest<OtpVerifyResult>('/api/auth/otp/verify', {
      method: 'POST', body: { otpId: stage.otpId, code },
    });
    if (!result.ok) return reportServer(result.error.message);
    setBusy(false);
    if (result.data.kind !== 'reset') {
      // A reset-purpose OTP always returns a reset token; anything else is a
      // contract violation worth surfacing rather than silently ignoring.
      setServerError(dict.errors.code);
      return;
    }
    setStage({ name: 'reset', resetToken: result.data.resetToken });
  }

  async function submitPassword(event: React.FormEvent) {
    event.preventDefault();
    if (stage.name !== 'reset') return;
    setFieldError(null);
    setServerError(null);
    if (password.length < 8) {
      setFieldError(dict.errors.password);
      return;
    }
    setBusy(true);
    const result = await apiRequest<{ user: User }>('/api/auth/password/reset', {
      method: 'POST', body: { resetToken: stage.resetToken, newPassword: password },
    });
    if (!result.ok) return reportServer(result.error.message);
    setUser(result.data.user);
    router.push(`/${locale}/account`);
  }

  const alert = serverError ? (
    <Alert variant="destructive" className="border-destructive/40">
      <AlertDescription>{serverError}</AlertDescription>
    </Alert>
  ) : null;

  if (stage.name === 'request') {
    return (
      <form onSubmit={requestCode} noValidate className="flex flex-col gap-6">
        <p className="text-muted-foreground">{dict.resetIntro}</p>
        {alert}
        <FieldGroup>
          <Field data-invalid={Boolean(fieldError) || undefined}>
            <FieldLabel htmlFor="identifier">{dict.identifier}</FieldLabel>
            <Input
              id="identifier" type="text" autoComplete="username" className="h-11"
              value={identifier} onChange={(e) => setIdentifier(e.target.value)}
              aria-invalid={Boolean(fieldError)}
              aria-describedby={fieldError ? 'identifier-error' : undefined}
            />
            {fieldError ? <FieldError id="identifier-error">{fieldError}</FieldError> : null}
          </Field>
        </FieldGroup>
        <Button type="submit" disabled={busy} className="h-12 w-full text-base">{dict.sendCode}</Button>
      </form>
    );
  }

  if (stage.name === 'verify') {
    return (
      <form onSubmit={verifyCode} noValidate className="flex flex-col gap-6">
        <p className="text-muted-foreground">{dict.otpIntro}</p>
        {stage.devCode ? (
          <Alert><AlertDescription>{dict.devCodeNotice} {stage.devCode}</AlertDescription></Alert>
        ) : null}
        {alert}
        <FieldGroup>
          <Field data-invalid={Boolean(fieldError) || undefined}>
            <FieldLabel htmlFor="code">{dict.otpCode}</FieldLabel>
            <Input
              id="code" type="text" inputMode="numeric" autoComplete="one-time-code"
              maxLength={6} className="h-11"
              value={code} onChange={(e) => setCode(e.target.value)}
              aria-invalid={Boolean(fieldError)}
              aria-describedby={fieldError ? 'code-error' : undefined}
            />
            {fieldError ? <FieldError id="code-error">{fieldError}</FieldError> : null}
          </Field>
        </FieldGroup>
        <Button type="submit" disabled={busy} className="h-12 w-full text-base">{dict.verify}</Button>
      </form>
    );
  }

  return (
    <form onSubmit={submitPassword} noValidate className="flex flex-col gap-6">
      {alert}
      <FieldGroup>
        <Field data-invalid={Boolean(fieldError) || undefined}>
          <FieldLabel htmlFor="new-password">{dict.newPassword}</FieldLabel>
          <Input
            id="new-password" type="password" autoComplete="new-password" className="h-11"
            value={password} onChange={(e) => setPassword(e.target.value)}
            aria-invalid={Boolean(fieldError)}
            aria-describedby={fieldError ? 'new-password-error' : undefined}
          />
          {fieldError ? <FieldError id="new-password-error">{fieldError}</FieldError> : null}
        </Field>
      </FieldGroup>
      <Button type="submit" disabled={busy} className="h-12 w-full text-base">{dict.updatePassword}</Button>
    </form>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run "app/[locale]/(auth)/forgot-password/forgot-password.test.tsx"`
Expected: PASS — 4 tests

- [ ] **Step 5: Add the page**

Create `app/[locale]/(auth)/forgot-password/page.tsx`:

```tsx
import { notFound } from 'next/navigation';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { ForgotPasswordForm } from './forgot-password-form';

export default async function ForgotPasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-semibold tracking-tight">{dict.auth.resetTitle}</h1>
      <ForgotPasswordForm locale={locale} dict={dict.auth} />
    </div>
  );
}
```

- [ ] **Step 6: Run the full suite and commit**

Run: `npm test && npx tsc --noEmit`

```bash
git add "app/[locale]/(auth)/forgot-password"
git commit -m "feat: add forgot-password OTP flow"
```

---

## Task 12: Account resource and route handlers

Account **info** only. Saved addresses, favorites, vouchers, and loyalty are M3.

**Files:**
- Create: `lib/api/schemas/account.ts`, `lib/api/resources/account/mock.ts`, `lib/api/resources/account/index.ts`, `app/api/account/route.ts`, `app/api/account/account-routes.test.ts`

**Interfaces:**
- Consumes: `auth.getUserById`, `auth.updateUser` (Task 8); `readSessionUserId` (Task 9)
- Produces: `accountPatchSchema`, type `AccountPatch`
- Produces: `account` with `get(userId)`, `update(userId, patch)`
- Produces: `GET /api/account`, `PATCH /api/account`

- [ ] **Step 1: Write the account schema**

Create `lib/api/schemas/account.ts`:

```ts
import { z } from 'zod';

/**
 * Phone is deliberately absent: the client checklist specifies it as the one
 * immutable field, so it is not expressible in a patch at all rather than
 * being accepted and then ignored.
 */
export const accountPatchSchema = z
  .object({
    name: z.string().trim().min(1, 'Enter your name').optional(),
    email: z.string().email('Enter a valid email address').optional(),
    dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the format YYYY-MM-DD').optional(),
    password: z.string().min(8, 'Use at least 8 characters').optional(),
  })
  .refine((v) => Object.values(v).some((x) => x !== undefined), {
    message: 'Nothing to update',
  });

export type AccountPatch = z.infer<typeof accountPatchSchema>;
```

- [ ] **Step 2: Write the account resource**

Create `lib/api/resources/account/mock.ts`:

```ts
import { mockAuth, AuthError } from '@/lib/api/resources/auth/mock';
import type { AccountPatch } from '@/lib/api/schemas/account';
import type { User } from '@/lib/api/schemas/auth';

/** Shares the identity store — an account is the same record as its user. */
export const mockAccount = {
  async get(userId: string): Promise<User> {
    const user = await mockAuth.getUserById(userId);
    if (!user) throw new AuthError('Account not found', 'not_found');
    return user;
  },

  async update(userId: string, patch: AccountPatch): Promise<User> {
    return mockAuth.updateUser(userId, patch);
  },
};

export type Account = typeof mockAccount;
```

Create `lib/api/resources/account/index.ts`:

```ts
import { resolveMode } from '@/lib/api/config';
import { mockAccount, type Account } from './mock';

export const account: Account =
  resolveMode('identity') === 'mock'
    ? mockAccount
    : (() => {
        throw new Error(
          'identity is set to upstream but lib/api/resources/account/upstream.ts does not exist yet',
        );
      })();
```

- [ ] **Step 3: Write the failing route test**

Create `app/api/account/account-routes.test.ts`:

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest';

const jar = new Map<string, string>();
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => (jar.has(name) ? { name, value: jar.get(name) } : undefined),
    set: (name: string, value: string) => { jar.set(name, value); },
    delete: (name: string) => { jar.delete(name); },
  }),
}));

process.env.AUTH_COOKIE_SECRET = 'test-secret';

const { GET, PATCH } = await import('./route');
const { signSession } = await import('@/lib/auth/cookie');
const { resetMockAuthState } = await import('@/lib/api/resources/auth/mock');

function patch(body: unknown): Request {
  return new Request('http://localhost/api/account', {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function signIn(userId = 'u-001') { jar.set('vivimoon_session', signSession(userId)); }

describe('account routes', () => {
  beforeEach(() => { jar.clear(); resetMockAuthState(); });

  it('401s GET without a session', async () => {
    const res = await GET();
    expect(res.status).toBe(401);
    expect((await res.json()).error.code).toBe('unauthorized');
  });

  it('401s PATCH without a session', async () => {
    expect((await PATCH(patch({ name: 'X' }))).status).toBe(401);
  });

  it('returns the signed-in user', async () => {
    signIn();
    const body = await (await GET()).json();
    expect(body.data.id).toBe('u-001');
    expect(body.data.name).toBe('Nguyễn Thị Mai');
  });

  it('never returns the password', async () => {
    signIn();
    expect(JSON.stringify(await (await GET()).json())).not.toContain('vivimoon123');
  });

  it('updates the name', async () => {
    signIn();
    const body = await (await PATCH(patch({ name: 'Mai Nguyễn' }))).json();
    expect(body.data.name).toBe('Mai Nguyễn');
  });

  it('rejects an invalid email', async () => {
    signIn();
    const res = await PATCH(patch({ email: 'not-an-email' }));
    expect(res.status).toBe(400);
    expect((await res.json()).error.field).toBe('email');
  });

  it('rejects an empty patch', async () => {
    signIn();
    expect((await PATCH(patch({}))).status).toBe(400);
  });

  it('ignores an attempt to change the phone', async () => {
    signIn();
    const body = await (await PATCH(patch({ name: 'Mai', phone: '0999999999' }))).json();
    expect(body.data.phone).toBe('0912345678');
  });

  it('401s a tampered session cookie', async () => {
    jar.set('vivimoon_session', 'u-001.deadbeef');
    expect((await GET()).status).toBe(401);
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npx vitest run app/api/account/account-routes.test.ts`
Expected: FAIL — cannot resolve `./route`

- [ ] **Step 5: Write the route handlers**

Create `app/api/account/route.ts`:

```ts
import { account } from '@/lib/api/resources/account';
import { accountPatchSchema } from '@/lib/api/schemas/account';
import { apiOk, apiFail } from '@/lib/api/response';
import { authErrorResponse, parseBody } from '@/lib/api/route-helpers';
import { readSessionUserId } from '@/lib/auth/cookie';

export async function GET() {
  const userId = await readSessionUserId();
  if (!userId) return apiFail('unauthorized', 'Sign in to view your account');
  try {
    return apiOk(await account.get(userId));
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function PATCH(request: Request) {
  const userId = await readSessionUserId();
  if (!userId) return apiFail('unauthorized', 'Sign in to update your account');

  // Unknown keys — `phone` among them — are stripped by the schema, so an
  // attempt to change the immutable field simply has no effect.
  const parsed = await parseBody(request, accountPatchSchema);
  if (!parsed.ok) return parsed.response;

  try {
    return apiOk(await account.update(userId, parsed.data));
  } catch (error) {
    return authErrorResponse(error);
  }
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run app/api/account/account-routes.test.ts`
Expected: PASS — 9 tests

- [ ] **Step 7: Commit**

```bash
git add lib/api/schemas/account.ts lib/api/resources/account app/api/account
git commit -m "feat: add account resource and route handlers"
```

---

## Task 13: Account page, route guards, and M1 verification

**Files:**
- Create: `app/[locale]/account/page.tsx`, `app/[locale]/account/account-form.tsx`, `app/[locale]/account/account-form.test.tsx`
- Modify: `middleware.ts`, `components/layout/header.tsx`

**Interfaces:**
- Consumes: `account` resource (Task 12), `readSessionUserId` (Task 9), `apiRequest` (Task 10)
- Produces: route `/[locale]/account`, guarded

- [ ] **Step 1: Add the route guard to middleware**

Replace `middleware.ts` entirely:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from '@/lib/i18n/config';

const SESSION_COOKIE = 'vivimoon_session';

/** Path segments that require a session, checked after the locale prefix. */
const GUARDED = ['account'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const locale = locales.find((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (!locale) {
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}${pathname === '/' ? '' : pathname}`;
    return NextResponse.redirect(url);
  }

  const rest = pathname.slice(`/${locale}`.length);
  const needsSession = GUARDED.some((seg) => rest === `/${seg}` || rest.startsWith(`/${seg}/`));

  // Presence check only. The signature is verified by the page via
  // readSessionUserId(); this is a redirect optimisation that spares signed-out
  // visitors a render, not the security boundary.
  if (needsSession && !request.cookies.has(SESSION_COOKIE)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/sign-in`;
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|images|favicon.ico|.*\\..*).*)'],
};
```

- [ ] **Step 2: Write the failing account-form test**

Create `app/[locale]/account/account-form.test.tsx`:

```tsx
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { AccountForm } from './account-form';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));

const user = { id: 'u-001', phone: '0912345678', email: 'mai@example.vn', name: 'Mai', createdAt: '2026-01-15T09:00:00.000Z' };

const dict = getDictionary('en').account;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

afterEach(() => { vi.unstubAllGlobals(); });

describe('AccountForm', () => {
  it('renders the phone as read-only with an explanation', () => {
    vi.stubGlobal('fetch', vi.fn());
    render(<AccountForm user={user} dict={dict} />);
    const phone = screen.getByLabelText('Phone');
    expect(phone).toHaveValue('0912345678');
    expect(phone).toHaveAttribute('readonly');
    expect(screen.getByText(dict.phoneLocked)).toBeInTheDocument();
  });

  it('saves changed fields and confirms', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json({ ok: true, data: { ...user, name: 'Mai Nguyễn' } }));
    vi.stubGlobal('fetch', fetchMock);
    render(<AccountForm user={user} dict={dict} />);

    const name = screen.getByLabelText('Full name');
    await userEvent.clear(name);
    await userEvent.type(name, 'Mai Nguyễn');
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText(dict.saved)).toBeInTheDocument();
    const [path, init] = fetchMock.mock.calls[0];
    expect(path).toBe('/api/account');
    expect(init.method).toBe('PATCH');
    expect(JSON.parse(init.body)).toEqual({ name: 'Mai Nguyễn', email: 'mai@example.vn' });
  });

  it('omits a blank password rather than sending an empty string', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json({ ok: true, data: user }));
    vi.stubGlobal('fetch', fetchMock);
    render(<AccountForm user={user} dict={dict} />);
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).not.toHaveProperty('password');
  });

  it('surfaces a server error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      json({ ok: false, error: { code: 'validation_failed', message: 'Enter a valid email address' } }, 400),
    ));
    render(<AccountForm user={user} dict={dict} />);
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument();
    expect(screen.queryByText(dict.saved)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run "app/[locale]/account/account-form.test.tsx"`
Expected: FAIL — cannot resolve `./account-form`

- [ ] **Step 4: Write the account form**

Create `app/[locale]/account/account-form.tsx`:

```tsx
'use client';
import { useState } from 'react';
import { apiRequest } from '@/lib/api/client';
import { useSessionStore } from '@/features/session/session-store';
import type { User } from '@/lib/api/schemas/auth';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function AccountForm({ user, dict }: { user: User; dict: Dictionary['account'] }) {
  const setUser = useSessionStore((s) => s.setUser);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email ?? '');
  const [dob, setDob] = useState(user.dob ?? '');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setServerError(null);
    setSaved(false);

    const next: Record<string, string> = {};
    if (!name.trim()) next.name = dict.errors.name;
    if (password && password.length < 8) next.password = dict.errors.password;
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    // Only send what has a value — a blank password must not be sent at all,
    // or it would be read as an intent to set an empty one.
    const patch: Record<string, string> = { name: name.trim() };
    if (email) patch.email = email;
    if (dob) patch.dob = dob;
    if (password) patch.password = password;

    setBusy(true);
    const result = await apiRequest<User>('/api/account', { method: 'PATCH', body: patch });
    setBusy(false);
    if (!result.ok) {
      setServerError(result.error.message);
      return;
    }
    setUser(result.data);
    setPassword('');
    setSaved(true);
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      {serverError ? (
        <Alert variant="destructive" className="border-destructive/40">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      ) : null}
      {saved ? <Alert><AlertDescription>{dict.saved}</AlertDescription></Alert> : null}

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="phone">{dict.phone}</FieldLabel>
          <Input id="phone" type="tel" readOnly value={user.phone} className="h-11 bg-muted" />
          <p className="text-sm text-muted-foreground">{dict.phoneLocked}</p>
        </Field>

        <Field data-invalid={Boolean(errors.name) || undefined}>
          <FieldLabel htmlFor="name">{dict.name}</FieldLabel>
          <Input
            id="name" type="text" autoComplete="name" className="h-11"
            value={name} onChange={(e) => setName(e.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name ? <FieldError id="name-error">{errors.name}</FieldError> : null}
        </Field>

        <Field>
          <FieldLabel htmlFor="email">{dict.email}</FieldLabel>
          <Input
            id="email" type="email" autoComplete="email" className="h-11"
            value={email} onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="dob">{dict.dob}</FieldLabel>
          <Input
            id="dob" type="date" autoComplete="bday" className="h-11"
            value={dob} onChange={(e) => setDob(e.target.value)}
          />
        </Field>

        <Field data-invalid={Boolean(errors.password) || undefined}>
          <FieldLabel htmlFor="new-password">{dict.newPassword}</FieldLabel>
          <Input
            id="new-password" type="password" autoComplete="new-password" className="h-11"
            value={password} onChange={(e) => setPassword(e.target.value)}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'password-error' : undefined}
          />
          <p className="text-sm text-muted-foreground">{dict.passwordHint}</p>
          {errors.password ? <FieldError id="password-error">{errors.password}</FieldError> : null}
        </Field>
      </FieldGroup>

      <Button type="submit" disabled={busy} className="h-12 w-full text-base sm:w-auto sm:px-10">
        {dict.save}
      </Button>
    </form>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run "app/[locale]/account/account-form.test.tsx"`
Expected: PASS — 4 tests

- [ ] **Step 6: Write the account page**

Create `app/[locale]/account/page.tsx`:

```tsx
import { notFound, redirect } from 'next/navigation';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { account } from '@/lib/api/resources/account';
import { readSessionUserId } from '@/lib/auth/cookie';
import { AccountForm } from './account-form';

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  // The real check. Middleware only tested that a cookie existed; this
  // verifies the signature and is what actually protects the page.
  const userId = await readSessionUserId();
  if (!userId) redirect(`/${locale}/sign-in?next=${encodeURIComponent(`/${locale}/account`)}`);

  const user = await account.get(userId);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">{dict.account.title}</h1>
      <h2 className="text-lg font-medium">{dict.account.infoTitle}</h2>
      <AccountForm user={user} dict={dict.account} />
    </div>
  );
}
```

- [ ] **Step 7: Add the header account link**

`components/layout/header.tsx` already renders a dead account `<button>` with a `User` icon. Replace it with a real link — same classes, so the header's visual rhythm is unchanged:

```tsx
          <Link
            href={`/${locale}/account`}
            aria-label={dict.account.title}
            className="hidden size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:flex"
          >
            <User className="size-5" />
          </Link>
```

`Link` and `User` are already imported in that file, so no import changes are needed.

- [ ] **Step 8: Verify the guard end to end**

Run: `npm run dev`, then:

1. Visit `http://localhost:3000/en/account` while signed out.
   Expected: redirect to `/en/sign-in?next=%2Fen%2Faccount`.
2. Sign in with `0912345678` / `vivimoon123`.
   Expected: redirect back to `/en/account`, showing "Nguyễn Thị Mai" with the phone read-only.
3. Change the name, save.
   Expected: the confirmation message appears; reloading shows the new name.
4. In DevTools, delete the `vivimoon_session` cookie and reload.
   Expected: redirect to sign-in.
5. In DevTools, set `vivimoon_session` to `u-001.deadbeef` and reload.
   Expected: still redirected to sign-in — middleware lets it through, the page's signature check rejects it. **This is the important one:** it proves the guard does not rest on cookie presence alone.
6. Visit `http://localhost:3000/vi/sign-in`.
   Expected: Vietnamese copy throughout.

Stop the dev server.

- [ ] **Step 9: Full M1 verification**

Run each and confirm before claiming M1 complete:

```bash
npx tsc --noEmit          # no type errors
npm run lint              # clean
npm test                  # all suites pass
npm run test:contract     # fixtures conform; upstream suite reports skipped
npm run build             # production build succeeds
```

Then confirm the seam is genuinely swappable:

```bash
API_MODE_CATALOG=upstream npm test 2>&1 | grep -i "upstream.*does not exist"
```

Expected: the catalog resolver throws its explanatory error. This proves the resolver branches on config rather than silently falling back to the mock.

```bash
API_MODE_COMMERCE=upstream UPSTREAM_API_BASE_URL=https://x.test npx vitest run lib/api/config.test.ts
```

Expected: passes — including the case asserting that commerce refuses to go upstream while catalog is mocked.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: add account page and route guards"
```

---

## M1 Definition of Done

- [ ] `lib/data/` is gone; nothing imports `productRepository`.
- [ ] Every domain type derives from a zod schema; no hand-written duplicate interfaces.
- [ ] `npm run test:contract` passes, and every fixture conforms to its schema.
- [ ] `npm run test:contract -- --upstream` is wired and skips cleanly with no base URL.
- [ ] A user can sign up, sign in, sign out, reset a password by OTP, and edit account info.
- [ ] The session token never appears in a response body or in `document.cookie`.
- [ ] `/[locale]/account` is unreachable without a valid signed session, verified by the page and not only by middleware.
- [ ] Both `en` and `vi` render every new screen with no hardcoded strings.
- [ ] `npm run build` succeeds.

## What M1 deliberately does not do

- **No cart changes.** The cart stays on React Context; the zustand migration lands in M2 with the Rx line-identity change, so that code is rewritten once rather than twice.
- **No `upstream.ts` for any resource.** Those arrive at cutover. The client and conformance harness exist so cutover is verifiable, but shipping identity-mapping code today would be maintaining a no-op.
- **No addresses, favorites, vouchers, loyalty, or orders.** Account *info* only; the rest is M3.
- **No Google OAuth.** The endpoint is mocked; real OAuth is Vivimoon's backend concern, absorbed at proxy time.
