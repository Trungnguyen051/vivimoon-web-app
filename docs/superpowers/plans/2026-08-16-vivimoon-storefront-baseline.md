# Vivimoon Storefront Baseline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> ⚠️ **Delivered and superseded** on 2026-08-27. All 20 tasks were implemented — the checkboxes were never marked off, so do not read this as a to-do list. Succeeded by the milestone plans for [`2026-08-27-vivimoon-client-scope-design.md`](../specs/2026-08-27-vivimoon-client-scope-design.md).

**Goal:** Build a bilingual (EN/VI) contact-lens e-commerce storefront with a complete Browse → Product → Cart → Checkout (stubbed payment) flow, scalable component architecture, and GA4 analytics.

**Architecture:** Next.js App Router with thin route files that compose prop-driven components. Four swappable seams isolate volatility: a `ProductRepository` data interface (mock impl now), design tokens for theming, dictionary-based i18n, and a typed analytics wrapper over GA4. Domain (commerce) components never fetch data — pages fetch via the repository and pass typed props down.

**Tech Stack:** Next.js (App Router) + React 19, TypeScript (strict), Tailwind CSS v4, shadcn/ui (Radix), embla-carousel, react-hook-form + zod, `@next/third-parties` (GA4), Vitest + React Testing Library.

## Global Constraints

- **Node:** 20+ (Next.js latest requirement floor). Use Node 24 LTS if available.
- **TypeScript:** `strict: true`. No `any` in committed code; use `unknown` + narrowing.
- **No hardcoded user-facing strings** in components — all copy comes from `lib/i18n` dictionaries.
- **No raw `gtag` calls** in components — all analytics go through `lib/analytics`.
- **No component in `components/commerce/` or `components/ui/` fetches data** — data is fetched in `app/**` and passed as props.
- **Concrete data implementation is named only in `lib/data/index.ts`** — everything else imports the interface-typed instance.
- **Prices are whole-currency units** (VND has no minor unit; USD stored as whole dollars). Format via `Intl.NumberFormat`.
- **Locales:** `['en', 'vi']`, default `en`. All app routes live under `app/[locale]/`.
- **Commits:** one per task minimum, conventional-commit style (`feat:`, `test:`, `chore:`).
- **Package manager:** npm (lockfile `package-lock.json`).

---

## File Structure

```
app/
  layout.tsx                    # <html>, fonts, CartProvider, GA4 mount
  globals.css                   # Tailwind import + design tokens
  [locale]/
    layout.tsx                  # Header + Footer chrome; validates locale param
    page.tsx                    # Home
    collection/[slug]/page.tsx  # Listing + filters
    product/[slug]/page.tsx     # PDP
    cart/page.tsx               # Cart
    checkout/page.tsx           # Checkout form (stubbed)
    checkout/success/page.tsx   # Order confirmation
middleware.ts                   # redirect `/` and locale-less paths to /[locale]

lib/
  utils/cn.ts                   # clsx + tailwind-merge
  utils/format.ts               # formatPrice(amount, currency, locale)
  types/product.ts              # Product, Variant, specs, enums
  types/collection.ts           # Collection
  types/review.ts               # Review
  types/index.ts                # re-exports
  data/product-repository.ts    # ProductRepository interface + ProductQuery
  data/mock-product-repository.ts
  data/index.ts                 # exports productRepository (swap point)
  i18n/config.ts                # locales, defaultLocale, Locale type
  i18n/dictionaries.ts          # getDictionary(locale)
  i18n/dictionaries/en.ts
  i18n/dictionaries/vi.ts
  analytics/events.ts           # GA4 event names + payload types + item mapper
  analytics/analytics.ts        # track() wrapper (SSR/unconfigured no-op)
  analytics/use-analytics.ts    # client hook

content/
  products.ts                   # mock catalog
  collections.ts
  reviews.ts

features/cart/
  cart.types.ts                 # CartLine, CartState, CartAction
  cart-reducer.ts               # pure reducer + selectors
  cart-storage.ts               # localStorage load/save
  cart-context.tsx              # CartProvider + context
  use-cart.ts                   # useCart hook

components/
  ui/                           # shadcn: button, badge, input, select, dialog, sheet, tabs, accordion
  layout/announcement-bar.tsx
  layout/header.tsx
  layout/mega-nav.tsx
  layout/locale-switcher.tsx
  layout/footer.tsx
  commerce/price-tag.tsx
  commerce/rating-stars.tsx
  commerce/product-card.tsx
  commerce/product-grid.tsx
  commerce/collection-filters.tsx
  commerce/hero-carousel.tsx
  commerce/collection-carousel.tsx
  commerce/category-grid.tsx
  commerce/product-gallery.tsx
  commerce/variant-selector.tsx
  commerce/spec-table.tsx
  commerce/reviews-list.tsx
  commerce/cart-line-item.tsx
  commerce/order-summary.tsx

tests/                          # co-located *.test.ts(x) preferred; setup in vitest.setup.ts
```

---

## Task 1: Scaffold project & tooling

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `app/globals.css`, `app/layout.tsx`, `app/page.tsx`, `.gitignore`, `.env.example`, `eslint.config.mjs`, `.prettierrc`

**Interfaces:**
- Produces: a running Next.js dev server; `cn` not yet (Task 3).

- [ ] **Step 1: Scaffold Next.js app in place**

Run:
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias "@/*" --use-npm --yes
```
Expected: project files created; `npm run dev` works. (If the directory is non-empty due to `docs/`, pass `--yes` and accept scaffolding alongside existing files; move/keep `docs/` intact.)

- [ ] **Step 2: Add Prettier + Tailwind plugin**

Run:
```bash
npm install -D prettier prettier-plugin-tailwindcss
```
Create `.prettierrc`:
```json
{ "plugins": ["prettier-plugin-tailwindcss"], "singleQuote": true, "semi": true }
```

- [ ] **Step 3: Create `.env.example`**

```bash
# Google Analytics 4 measurement ID (leave empty to disable tracking)
NEXT_PUBLIC_GA_ID=
```

- [ ] **Step 4: Verify dev server + typecheck**

Run: `npm run build`
Expected: build succeeds with the default template.

- [ ] **Step 5: Commit**

```bash
git init
git add -A
git commit -m "chore: scaffold Next.js app with TS, Tailwind, Prettier"
```

---

## Task 2: Testing setup (Vitest + RTL)

**Files:**
- Create: `vitest.config.ts`, `vitest.setup.ts`
- Modify: `package.json` (scripts)

**Interfaces:**
- Produces: `npm test` runs Vitest with jsdom + RTL matchers.

- [ ] **Step 1: Install test deps**

Run:
```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
});
```

- [ ] **Step 3: Create `vitest.setup.ts`**

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 4: Add scripts to `package.json`**

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 5: Add a smoke test `tests/smoke.test.ts`**

```ts
import { describe, it, expect } from 'vitest';

describe('test harness', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 6: Run and verify**

Run: `npm test`
Expected: 1 passing test.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: add Vitest + React Testing Library setup"
```

---

## Task 3: Utilities (`cn`, `formatPrice`)

**Files:**
- Create: `lib/utils/cn.ts`, `lib/utils/format.ts`, `lib/utils/format.test.ts`

**Interfaces:**
- Produces:
  - `cn(...inputs: ClassValue[]): string`
  - `formatPrice(amount: number, currency: 'VND' | 'USD', locale: 'en' | 'vi'): string`

- [ ] **Step 1: Install class helpers**

Run: `npm install clsx tailwind-merge`

- [ ] **Step 2: Create `lib/utils/cn.ts`**

```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 3: Write failing test `lib/utils/format.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { formatPrice } from './format';

describe('formatPrice', () => {
  it('formats VND with no decimals and đ suffix', () => {
    expect(formatPrice(399000, 'VND', 'vi')).toContain('399.000');
  });
  it('formats USD with dollar sign for en', () => {
    expect(formatPrice(25, 'USD', 'en')).toBe('$25.00');
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npm test -- format`
Expected: FAIL ("formatPrice is not a function" / module not found).

- [ ] **Step 5: Implement `lib/utils/format.ts`**

```ts
export function formatPrice(
  amount: number,
  currency: 'VND' | 'USD',
  locale: 'en' | 'vi',
): string {
  const intlLocale = locale === 'vi' ? 'vi-VN' : 'en-US';
  return new Intl.NumberFormat(intlLocale, {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'VND' ? 0 : 2,
  }).format(amount);
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm test -- format`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add lib/utils
git commit -m "feat: add cn and formatPrice utilities"
```

---

## Task 4: Domain types

**Files:**
- Create: `lib/types/product.ts`, `lib/types/collection.ts`, `lib/types/review.ts`, `lib/types/index.ts`

**Interfaces:**
- Produces: `Product`, `Variant`, `ProductSpecs`, `LensType`, `ReplacementSchedule`, `ProductBadge`, `Collection`, `Review` (exact shapes below). Consumed by nearly every later task.

- [ ] **Step 1: Create `lib/types/product.ts`**

```ts
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
```

- [ ] **Step 2: Create `lib/types/collection.ts`**

```ts
export interface Collection {
  slug: string;
  title: string;
  description?: string;
  bannerImage?: string;
  productIds: string[];
}
```

- [ ] **Step 3: Create `lib/types/review.ts`**

```ts
export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number; // 0–5
  title: string;
  body: string;
  createdAt: string; // ISO date
  hasImages: boolean;
}
```

- [ ] **Step 4: Create `lib/types/index.ts`**

```ts
export * from './product';
export * from './collection';
export * from './review';
```

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add lib/types
git commit -m "feat: add domain types"
```

---

## Task 5: Mock content

**Files:**
- Create: `content/products.ts`, `content/collections.ts`, `content/reviews.ts`

**Interfaces:**
- Consumes: types from Task 4.
- Produces: `products: Product[]`, `collections: Collection[]`, `reviews: Review[]`. At least 8 products spanning all `LensType` values, at least one `colored` product with ≥2 color variants and ≥2 pack sizes, at least one product with `compareAtPrice` (sale). At least 3 collections (`new`, `bestsellers`, `sale`). At least 2 reviews for one product.

- [ ] **Step 1: Create `content/products.ts`**

Provide a typed array. Example first entry (replicate the shape for ≥8 products; use placeholder image paths under `/images/products/...`):

```ts
import type { Product } from '@/lib/types';

export const products: Product[] = [
  {
    id: 'p-aqua-daily',
    slug: 'aqua-daily-clear',
    name: 'Aqua Daily Clear',
    brandId: 'vivimoon',
    brandName: 'Vivimoon',
    type: 'clear',
    replacement: 'daily',
    description:
      'Ultra-breathable daily disposable lenses with high moisture retention for all-day comfort.',
    images: ['/images/products/aqua-daily-1.jpg', '/images/products/aqua-daily-2.jpg'],
    badges: ['bestseller'],
    specs: {
      material: 'Silicone Hydrogel',
      waterContent: '55%',
      baseCurve: '8.6mm',
      diameter: '14.2mm',
      uvProtection: true,
      manufacturer: 'Vivimoon Labs',
    },
    variants: [
      { id: 'p-aqua-daily-30', sku: 'AQD-30', packSize: '30 lenses', price: 25, currency: 'USD', stock: 120 },
      { id: 'p-aqua-daily-90', sku: 'AQD-90', packSize: '90 lenses', price: 65, compareAtPrice: 75, currency: 'USD', stock: 60 },
    ],
    rating: 4.6,
    reviewCount: 2,
  },
  // ... add ≥7 more, including one 'colored' product with color variants:
  // variants each carry color + colorLabel + packSize, e.g.
  // { id:'p-hazel-10-brown', sku:'HZL-BR-10', color:'brown', colorLabel:'Hazel Brown', packSize:'10 lenses', price: 22, currency:'USD', stock: 40 }
];
```

Requirements to satisfy in the full array: ≥8 products; cover `clear`, `colored`, `toric`, `multifocal`; cover `daily`, `biweekly`, `monthly`; ≥1 product with `badges: ['new']`; ≥1 with `badges: ['sale']` and a `compareAtPrice`; the `colored` product must have ≥2 distinct `color` values and ≥2 pack sizes.

- [ ] **Step 2: Create `content/collections.ts`**

```ts
import type { Collection } from '@/lib/types';
import { products } from './products';

const byBadge = (badge: string) =>
  products.filter((p) => p.badges.includes(badge as never)).map((p) => p.id);

export const collections: Collection[] = [
  { slug: 'new-arrivals', title: 'collection.newArrivals', productIds: byBadge('new') },
  { slug: 'bestsellers', title: 'collection.bestsellers', productIds: byBadge('bestseller') },
  { slug: 'sale', title: 'collection.sale', productIds: byBadge('sale') },
  { slug: 'colored-lenses', title: 'collection.colored', productIds: products.filter((p) => p.type === 'colored').map((p) => p.id) },
  { slug: 'daily-lenses', title: 'collection.daily', productIds: products.filter((p) => p.replacement === 'daily').map((p) => p.id) },
];
```

- [ ] **Step 3: Create `content/reviews.ts`**

```ts
import type { Review } from '@/lib/types';

export const reviews: Review[] = [
  {
    id: 'r1', productId: 'p-aqua-daily', author: 'Mai N.', rating: 5,
    title: 'Super comfortable', body: 'No dryness even after 12 hours.',
    createdAt: '2026-06-01', hasImages: false,
  },
  {
    id: 'r2', productId: 'p-aqua-daily', author: 'John D.', rating: 4,
    title: 'Good value', body: 'Great for daily wear, slightly tricky to insert.',
    createdAt: '2026-06-10', hasImages: true,
  },
];
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add content
git commit -m "feat: add mock catalog content"
```

---

## Task 6: ProductRepository interface + mock implementation

**Files:**
- Create: `lib/data/product-repository.ts`, `lib/data/mock-product-repository.ts`, `lib/data/mock-product-repository.test.ts`, `lib/data/index.ts`

**Interfaces:**
- Consumes: types (Task 4), content (Task 5).
- Produces:
  - `interface ProductRepository` with methods: `getProductBySlug(slug: string): Promise<Product | null>`, `listProducts(query?: ProductQuery): Promise<Product[]>`, `getCollection(slug: string): Promise<Collection | null>`, `listCollections(): Promise<Collection[]>`, `getProductsByIds(ids: string[]): Promise<Product[]>`, `getRelatedProducts(product: Product, limit?: number): Promise<Product[]>`, `getReviews(productId: string): Promise<Review[]>`.
  - `interface ProductQuery { type?; replacement?; brandId?; color?; badges?; sort? }`.
  - `const productRepository: ProductRepository` (from `index.ts`).

- [ ] **Step 1: Create `lib/data/product-repository.ts`**

```ts
import type {
  Product, Collection, Review, LensType, ReplacementSchedule, ProductBadge,
} from '@/lib/types';

export interface ProductQuery {
  type?: LensType;
  replacement?: ReplacementSchedule;
  brandId?: string;
  color?: string;
  badges?: ProductBadge[];
  sort?: 'newest' | 'price-asc' | 'price-desc' | 'bestselling';
}

export interface ProductRepository {
  getProductBySlug(slug: string): Promise<Product | null>;
  listProducts(query?: ProductQuery): Promise<Product[]>;
  getCollection(slug: string): Promise<Collection | null>;
  listCollections(): Promise<Collection[]>;
  getProductsByIds(ids: string[]): Promise<Product[]>;
  getRelatedProducts(product: Product, limit?: number): Promise<Product[]>;
  getReviews(productId: string): Promise<Review[]>;
}

/** Lowest variant price, used for sorting. */
export function minPrice(product: Product): number {
  return Math.min(...product.variants.map((v) => v.price));
}
```

- [ ] **Step 2: Write failing test `lib/data/mock-product-repository.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { MockProductRepository } from './mock-product-repository';

const repo = new MockProductRepository();

describe('MockProductRepository', () => {
  it('finds a product by slug', async () => {
    const p = await repo.getProductBySlug('aqua-daily-clear');
    expect(p?.name).toBe('Aqua Daily Clear');
  });

  it('returns null for unknown slug', async () => {
    expect(await repo.getProductBySlug('nope')).toBeNull();
  });

  it('filters by lens type', async () => {
    const list = await repo.listProducts({ type: 'colored' });
    expect(list.every((p) => p.type === 'colored')).toBe(true);
    expect(list.length).toBeGreaterThan(0);
  });

  it('sorts by price ascending', async () => {
    const list = await repo.listProducts({ sort: 'price-asc' });
    const prices = list.map((p) => Math.min(...p.variants.map((v) => v.price)));
    const sorted = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sorted);
  });

  it('excludes the source product from related', async () => {
    const p = await repo.getProductBySlug('aqua-daily-clear');
    const related = await repo.getRelatedProducts(p!, 4);
    expect(related.find((r) => r.id === p!.id)).toBeUndefined();
    expect(related.length).toBeLessThanOrEqual(4);
  });

  it('returns reviews for a product', async () => {
    const rs = await repo.getReviews('p-aqua-daily');
    expect(rs.length).toBeGreaterThanOrEqual(2);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -- mock-product-repository`
Expected: FAIL (module not found).

- [ ] **Step 4: Implement `lib/data/mock-product-repository.ts`**

```ts
import type { Product, Collection, Review } from '@/lib/types';
import { products } from '@/content/products';
import { collections } from '@/content/collections';
import { reviews } from '@/content/reviews';
import { minPrice, type ProductQuery, type ProductRepository } from './product-repository';

export class MockProductRepository implements ProductRepository {
  async getProductBySlug(slug: string): Promise<Product | null> {
    return products.find((p) => p.slug === slug) ?? null;
  }

  async listProducts(query: ProductQuery = {}): Promise<Product[]> {
    let list = [...products];
    if (query.type) list = list.filter((p) => p.type === query.type);
    if (query.replacement) list = list.filter((p) => p.replacement === query.replacement);
    if (query.brandId) list = list.filter((p) => p.brandId === query.brandId);
    if (query.color) list = list.filter((p) => p.variants.some((v) => v.color === query.color));
    if (query.badges?.length) {
      list = list.filter((p) => query.badges!.some((b) => p.badges.includes(b)));
    }
    switch (query.sort) {
      case 'price-asc': list.sort((a, b) => minPrice(a) - minPrice(b)); break;
      case 'price-desc': list.sort((a, b) => minPrice(b) - minPrice(a)); break;
      case 'bestselling': list.sort((a, b) => b.reviewCount - a.reviewCount); break;
      case 'newest': list.sort((a, b) => Number(b.badges.includes('new')) - Number(a.badges.includes('new'))); break;
      default: break;
    }
    return list;
  }

  async getCollection(slug: string): Promise<Collection | null> {
    return collections.find((c) => c.slug === slug) ?? null;
  }

  async listCollections(): Promise<Collection[]> {
    return [...collections];
  }

  async getProductsByIds(ids: string[]): Promise<Product[]> {
    return ids
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is Product => Boolean(p));
  }

  async getRelatedProducts(product: Product, limit = 8): Promise<Product[]> {
    return products
      .filter((p) => p.id !== product.id && (p.type === product.type || p.replacement === product.replacement))
      .slice(0, limit);
  }

  async getReviews(productId: string): Promise<Review[]> {
    return reviews.filter((r) => r.productId === productId);
  }
}
```

- [ ] **Step 5: Create `lib/data/index.ts` (the swap point)**

```ts
import { MockProductRepository } from './mock-product-repository';
import type { ProductRepository } from './product-repository';

export const productRepository: ProductRepository = new MockProductRepository();
export type { ProductRepository, ProductQuery } from './product-repository';
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm test -- mock-product-repository`
Expected: all PASS.

- [ ] **Step 7: Commit**

```bash
git add lib/data
git commit -m "feat: add ProductRepository interface + mock impl"
```

---

## Task 7: i18n seam (config, dictionaries, middleware)

**Files:**
- Create: `lib/i18n/config.ts`, `lib/i18n/dictionaries.ts`, `lib/i18n/dictionaries/en.ts`, `lib/i18n/dictionaries/vi.ts`, `middleware.ts`, `lib/i18n/config.test.ts`

**Interfaces:**
- Produces:
  - `type Locale = 'en' | 'vi'`, `locales: Locale[]`, `defaultLocale: Locale`, `isLocale(x): x is Locale`.
  - `getDictionary(locale: Locale): Dictionary` (sync — dictionaries are static imports).
  - `type Dictionary` — the shape of `en.ts`.

- [ ] **Step 1: Create `lib/i18n/config.ts`**

```ts
export const locales = ['en', 'vi'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
```

- [ ] **Step 2: Create `lib/i18n/dictionaries/en.ts`**

```ts
export const en = {
  nav: { new: 'New', men: 'Men', women: 'Women', sport: 'Sport', accessories: 'Accessories', sale: 'Sale' },
  common: { shopNow: 'Shop Now', seeMore: 'See more', addToCart: 'Add to cart', search: 'Search...' },
  announcement: { freeShipping: 'Free shipping on orders over $50' },
  collection: {
    newArrivals: 'New Arrivals', bestsellers: 'Bestsellers', sale: 'Sale',
    colored: 'Colored Lenses', daily: 'Daily Lenses',
  },
  filters: { type: 'Lens type', replacement: 'Replacement', color: 'Color', sort: 'Sort', clear: 'Clear filters' },
  pdp: {
    specs: 'Specifications', related: 'You might also like', reviews: 'Reviews',
    material: 'Material', waterContent: 'Water content', baseCurve: 'Base curve',
    diameter: 'Diameter', uvProtection: 'UV protection', manufacturer: 'Manufacturer',
    packSize: 'Pack size', color: 'Color', quantity: 'Quantity', freeship: 'Freeship',
  },
  cart: {
    title: 'Your Cart', empty: 'Your cart is empty', subtotal: 'Subtotal',
    checkout: 'Checkout', remove: 'Remove',
  },
  checkout: {
    title: 'Checkout', fullName: 'Full name', email: 'Email', address: 'Address',
    city: 'City', phone: 'Phone', placeOrder: 'Place order', payNote: 'Payment is simulated in this demo.',
    success: 'Thank you! Your order is confirmed.', orderId: 'Order ID',
  },
  footer: { policies: 'Policies', about: 'About Vivimoon', customerCare: 'Customer Care' },
} as const;

export type Dictionary = typeof en;
```

- [ ] **Step 3: Create `lib/i18n/dictionaries/vi.ts`**

```ts
import type { Dictionary } from './en';

export const vi: Dictionary = {
  nav: { new: 'Mới', men: 'Nam', women: 'Nữ', sport: 'Thể thao', accessories: 'Phụ kiện', sale: 'Giảm giá' },
  common: { shopNow: 'Mua ngay', seeMore: 'Xem thêm', addToCart: 'Thêm vào giỏ', search: 'Tìm kiếm...' },
  announcement: { freeShipping: 'Miễn phí vận chuyển cho đơn từ 1.000.000đ' },
  collection: {
    newArrivals: 'Hàng mới về', bestsellers: 'Bán chạy', sale: 'Giảm giá',
    colored: 'Lens màu', daily: 'Lens hằng ngày',
  },
  filters: { type: 'Loại lens', replacement: 'Thời gian dùng', color: 'Màu', sort: 'Sắp xếp', clear: 'Xóa bộ lọc' },
  pdp: {
    specs: 'Thông số', related: 'Gợi ý cho bạn', reviews: 'Đánh giá',
    material: 'Chất liệu', waterContent: 'Độ ẩm', baseCurve: 'Độ cong',
    diameter: 'Đường kính', uvProtection: 'Chống tia UV', manufacturer: 'Nhà sản xuất',
    packSize: 'Quy cách', color: 'Màu', quantity: 'Số lượng', freeship: 'Miễn phí ship',
  },
  cart: {
    title: 'Giỏ hàng', empty: 'Giỏ hàng trống', subtotal: 'Tạm tính',
    checkout: 'Thanh toán', remove: 'Xóa',
  },
  checkout: {
    title: 'Thanh toán', fullName: 'Họ tên', email: 'Email', address: 'Địa chỉ',
    city: 'Thành phố', phone: 'Số điện thoại', placeOrder: 'Đặt hàng', payNote: 'Thanh toán được mô phỏng trong bản demo.',
    success: 'Cảm ơn bạn! Đơn hàng đã được xác nhận.', orderId: 'Mã đơn hàng',
  },
  footer: { policies: 'Chính sách', about: 'Về Vivimoon', customerCare: 'Chăm sóc khách hàng' },
};
```

- [ ] **Step 4: Create `lib/i18n/dictionaries.ts`**

```ts
import type { Locale } from './config';
import { en, type Dictionary } from './dictionaries/en';
import { vi } from './dictionaries/vi';

const dictionaries: Record<Locale, Dictionary> = { en, vi };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export type { Dictionary };
```

- [ ] **Step 5: Write failing test `lib/i18n/config.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { isLocale } from './config';
import { getDictionary } from './dictionaries';

describe('i18n', () => {
  it('validates locales', () => {
    expect(isLocale('en')).toBe(true);
    expect(isLocale('fr')).toBe(false);
  });
  it('returns matching dictionaries with the same keys', () => {
    const en = getDictionary('en');
    const vi = getDictionary('vi');
    expect(Object.keys(en.nav)).toEqual(Object.keys(vi.nav));
    expect(vi.common.shopNow).toBe('Mua ngay');
  });
});
```

- [ ] **Step 6: Run test to verify pass**

Run: `npm test -- i18n/config`
Expected: PASS (types guarantee key parity; test asserts it).

- [ ] **Step 7: Create `middleware.ts`**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from '@/lib/i18n/config';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLocale = locales.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );
  if (hasLocale) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next|images|favicon.ico|.*\\..*).*)'],
};
```

- [ ] **Step 8: Commit**

```bash
git add lib/i18n middleware.ts
git commit -m "feat: add i18n dictionaries, config, and locale middleware"
```

---

## Task 8: Analytics seam (GA4)

**Files:**
- Create: `lib/analytics/events.ts`, `lib/analytics/analytics.ts`, `lib/analytics/use-analytics.ts`, `lib/analytics/analytics.test.ts`
- Modify: `app/layout.tsx` (mount GA4)

**Interfaces:**
- Consumes: `Product`, `Variant` (Task 4); `formatPrice` not needed.
- Produces:
  - `toGa4Items(entries: { product: Product; variant?: Variant; quantity?: number }[]): Ga4Item[]`
  - `cartLinesToGa4Items(lines: { sku: string; name: string; unitPrice: number; quantity: number }[]): Ga4Item[]` (maps cart-line snapshots that lack a full `Product`; used by cart/checkout/success)
  - `track(event: AnalyticsEvent): void` (no-op if `window`/`gtag`/GA id absent)
  - `useAnalytics(): { track: typeof track }`
  - `AnalyticsEvent` union with names: `view_item_list`, `select_item`, `view_item`, `add_to_cart`, `remove_from_cart`, `view_cart`, `begin_checkout`, `purchase`.

- [ ] **Step 1: Create `lib/analytics/events.ts`**

```ts
import type { Product, Variant } from '@/lib/types';

export interface Ga4Item {
  item_id: string;
  item_name: string;
  item_brand: string;
  item_category: string;
  price: number;
  quantity: number;
}

export function toGa4Items(
  entries: { product: Product; variant?: Variant; quantity?: number }[],
): Ga4Item[] {
  return entries.map(({ product, variant, quantity }) => ({
    item_id: variant?.sku ?? product.id,
    item_name: product.name,
    item_brand: product.brandName,
    item_category: product.type,
    price: variant?.price ?? Math.min(...product.variants.map((v) => v.price)),
    quantity: quantity ?? 1,
  }));
}

/** Map cart-line snapshots (which lack a full Product) to GA4 items. */
export function cartLinesToGa4Items(
  lines: { sku: string; name: string; unitPrice: number; quantity: number }[],
): Ga4Item[] {
  return lines.map((l) => ({
    item_id: l.sku,
    item_name: l.name,
    item_brand: 'Vivimoon',
    item_category: '',
    price: l.unitPrice,
    quantity: l.quantity,
  }));
}

export type AnalyticsEvent =
  | { name: 'view_item_list'; params: { item_list_id: string; items: Ga4Item[] } }
  | { name: 'select_item'; params: { item_list_id: string; items: Ga4Item[] } }
  | { name: 'view_item'; params: { items: Ga4Item[] } }
  | { name: 'add_to_cart'; params: { currency: string; value: number; items: Ga4Item[] } }
  | { name: 'remove_from_cart'; params: { currency: string; value: number; items: Ga4Item[] } }
  | { name: 'view_cart'; params: { currency: string; value: number; items: Ga4Item[] } }
  | { name: 'begin_checkout'; params: { currency: string; value: number; items: Ga4Item[] } }
  | { name: 'purchase'; params: { transaction_id: string; currency: string; value: number; items: Ga4Item[] } };
```

- [ ] **Step 2: Create `lib/analytics/analytics.ts`**

```ts
import type { AnalyticsEvent } from './events';

type Gtag = (command: 'event', name: string, params: Record<string, unknown>) => void;

export function track(event: AnalyticsEvent): void {
  if (typeof window === 'undefined') return;
  if (!process.env.NEXT_PUBLIC_GA_ID) return;
  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  if (typeof gtag !== 'function') return;
  gtag('event', event.name, event.params);
}
```

- [ ] **Step 3: Create `lib/analytics/use-analytics.ts`**

```ts
'use client';
import { track } from './analytics';

export function useAnalytics() {
  return { track };
}
```

- [ ] **Step 4: Write failing test `lib/analytics/analytics.test.ts`**

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { toGa4Items } from './events';
import { track } from './analytics';
import type { Product } from '@/lib/types';

const product = {
  id: 'p1', slug: 'p1', name: 'Aqua', brandId: 'v', brandName: 'Vivimoon',
  type: 'clear', replacement: 'daily', description: '', images: [], badges: [],
  specs: { material: '', waterContent: '', baseCurve: '', diameter: '', uvProtection: false, manufacturer: '' },
  variants: [{ id: 'v1', sku: 'SKU1', packSize: '30', price: 25, currency: 'USD', stock: 10 }],
  rating: 5, reviewCount: 1,
} as Product;

describe('toGa4Items', () => {
  it('maps product+variant to GA4 item shape', () => {
    const [item] = toGa4Items([{ product, variant: product.variants[0], quantity: 2 }]);
    expect(item).toEqual({
      item_id: 'SKU1', item_name: 'Aqua', item_brand: 'Vivimoon',
      item_category: 'clear', price: 25, quantity: 2,
    });
  });
});

describe('track', () => {
  const original = process.env.NEXT_PUBLIC_GA_ID;
  afterEach(() => { process.env.NEXT_PUBLIC_GA_ID = original; });
  beforeEach(() => { (window as unknown as { gtag?: unknown }).gtag = vi.fn(); });

  it('is a no-op when GA id is unset', () => {
    process.env.NEXT_PUBLIC_GA_ID = '';
    const spy = (window as unknown as { gtag: ReturnType<typeof vi.fn> }).gtag;
    track({ name: 'view_item', params: { items: [] } });
    expect(spy).not.toHaveBeenCalled();
  });

  it('forwards to gtag when GA id is set', () => {
    process.env.NEXT_PUBLIC_GA_ID = 'G-TEST';
    const spy = (window as unknown as { gtag: ReturnType<typeof vi.fn> }).gtag;
    track({ name: 'view_item', params: { items: [] } });
    expect(spy).toHaveBeenCalledWith('event', 'view_item', { items: [] });
  });
});
```

- [ ] **Step 5: Run test to verify fail then implement to pass**

Run: `npm test -- analytics`
Expected: initially FAIL (module not found), then PASS after Steps 1–3 exist. Re-run to confirm PASS.

- [ ] **Step 6: Mount GA4 in `app/layout.tsx`**

Edit `app/layout.tsx` to conditionally render the GA component:

```tsx
import { GoogleAnalytics } from '@next/third-parties/google';
// ...inside <body> ... {children}
{process.env.NEXT_PUBLIC_GA_ID ? (
  <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
) : null}
```

Install: `npm install @next/third-parties`

- [ ] **Step 7: Commit**

```bash
git add lib/analytics app/layout.tsx package.json package-lock.json
git commit -m "feat: add GA4 analytics seam (env-gated, typed track wrapper)"
```

---

## Task 9: Cart feature (reducer, storage, context, hook)

**Files:**
- Create: `features/cart/cart.types.ts`, `features/cart/cart-reducer.ts`, `features/cart/cart-reducer.test.ts`, `features/cart/cart-storage.ts`, `features/cart/cart-context.tsx`, `features/cart/use-cart.ts`
- Modify: `app/layout.tsx` (wrap with `CartProvider`)

**Interfaces:**
- Produces:
  - `CartLine { productId; variantId; name; sku; color?; packSize; unitPrice; currency; quantity; image? }`
  - `CartState { lines: CartLine[] }`
  - `CartAction` union: `{type:'ADD'; line: CartLine}`, `{type:'UPDATE_QTY'; variantId; quantity}`, `{type:'REMOVE'; variantId}`, `{type:'CLEAR'}`
  - `cartReducer(state, action): CartState`
  - `cartCount(state): number`, `cartSubtotal(state): number`
  - `useCart(): { lines; count; subtotal; currency; add; updateQty; remove; clear }`

- [ ] **Step 1: Create `features/cart/cart.types.ts`**

```ts
import type { Currency } from '@/lib/types';

export interface CartLine {
  productId: string;
  variantId: string;
  name: string;
  sku: string;
  color?: string;
  packSize: string;
  unitPrice: number;
  currency: Currency;
  quantity: number;
  image?: string;
}

export interface CartState {
  lines: CartLine[];
}

export type CartAction =
  | { type: 'ADD'; line: CartLine }
  | { type: 'UPDATE_QTY'; variantId: string; quantity: number }
  | { type: 'REMOVE'; variantId: string }
  | { type: 'CLEAR' };
```

- [ ] **Step 2: Write failing test `features/cart/cart-reducer.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { cartReducer, cartCount, cartSubtotal } from './cart-reducer';
import type { CartLine, CartState } from './cart.types';

const line: CartLine = {
  productId: 'p1', variantId: 'v1', name: 'Aqua', sku: 'SKU1',
  packSize: '30', unitPrice: 25, currency: 'USD', quantity: 1,
};
const empty: CartState = { lines: [] };

describe('cartReducer', () => {
  it('adds a new line', () => {
    const s = cartReducer(empty, { type: 'ADD', line });
    expect(s.lines).toHaveLength(1);
  });
  it('merges quantity when adding an existing variant', () => {
    const s1 = cartReducer(empty, { type: 'ADD', line });
    const s2 = cartReducer(s1, { type: 'ADD', line: { ...line, quantity: 2 } });
    expect(s2.lines).toHaveLength(1);
    expect(s2.lines[0].quantity).toBe(3);
  });
  it('updates quantity', () => {
    const s1 = cartReducer(empty, { type: 'ADD', line });
    const s2 = cartReducer(s1, { type: 'UPDATE_QTY', variantId: 'v1', quantity: 5 });
    expect(s2.lines[0].quantity).toBe(5);
  });
  it('removes a line', () => {
    const s1 = cartReducer(empty, { type: 'ADD', line });
    const s2 = cartReducer(s1, { type: 'REMOVE', variantId: 'v1' });
    expect(s2.lines).toHaveLength(0);
  });
  it('clears', () => {
    const s1 = cartReducer(empty, { type: 'ADD', line });
    expect(cartReducer(s1, { type: 'CLEAR' }).lines).toHaveLength(0);
  });
  it('computes count and subtotal', () => {
    const s = cartReducer(empty, { type: 'ADD', line: { ...line, quantity: 2 } });
    expect(cartCount(s)).toBe(2);
    expect(cartSubtotal(s)).toBe(50);
  });
});
```

- [ ] **Step 3: Run test to verify fail**

Run: `npm test -- cart-reducer`
Expected: FAIL (module not found).

- [ ] **Step 4: Implement `features/cart/cart-reducer.ts`**

```ts
import type { CartAction, CartState } from './cart.types';

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD': {
      const existing = state.lines.find((l) => l.variantId === action.line.variantId);
      if (existing) {
        return {
          lines: state.lines.map((l) =>
            l.variantId === action.line.variantId
              ? { ...l, quantity: l.quantity + action.line.quantity }
              : l,
          ),
        };
      }
      return { lines: [...state.lines, action.line] };
    }
    case 'UPDATE_QTY':
      return {
        lines: state.lines.map((l) =>
          l.variantId === action.variantId ? { ...l, quantity: Math.max(1, action.quantity) } : l,
        ),
      };
    case 'REMOVE':
      return { lines: state.lines.filter((l) => l.variantId !== action.variantId) };
    case 'CLEAR':
      return { lines: [] };
    default:
      return state;
  }
}

export function cartCount(state: CartState): number {
  return state.lines.reduce((sum, l) => sum + l.quantity, 0);
}

export function cartSubtotal(state: CartState): number {
  return state.lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
}
```

- [ ] **Step 5: Run test to verify pass**

Run: `npm test -- cart-reducer`
Expected: all PASS.

- [ ] **Step 6: Implement `features/cart/cart-storage.ts`**

```ts
import type { CartState } from './cart.types';

const KEY = 'vivimoon-cart';

export function loadCart(): CartState {
  if (typeof window === 'undefined') return { lines: [] };
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CartState) : { lines: [] };
  } catch {
    return { lines: [] };
  }
}

export function saveCart(state: CartState): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, JSON.stringify(state));
}
```

- [ ] **Step 7: Implement `features/cart/cart-context.tsx`**

```tsx
'use client';
import { createContext, useEffect, useReducer, type ReactNode } from 'react';
import { cartReducer } from './cart-reducer';
import { loadCart, saveCart } from './cart-storage';
import type { CartAction, CartState } from './cart.types';

export const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
} | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { lines: [] });

  useEffect(() => {
    const stored = loadCart();
    if (stored.lines.length) {
      stored.lines.forEach((line) => dispatch({ type: 'ADD', line }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    saveCart(state);
  }, [state]);

  return <CartContext.Provider value={{ state, dispatch }}>{children}</CartContext.Provider>;
}
```

- [ ] **Step 8: Implement `features/cart/use-cart.ts`**

```ts
'use client';
import { useContext } from 'react';
import { CartContext } from './cart-context';
import { cartCount, cartSubtotal } from './cart-reducer';
import type { CartLine } from './cart.types';

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  const { state, dispatch } = ctx;
  return {
    lines: state.lines,
    count: cartCount(state),
    subtotal: cartSubtotal(state),
    currency: state.lines[0]?.currency ?? 'USD',
    add: (line: CartLine) => dispatch({ type: 'ADD', line }),
    updateQty: (variantId: string, quantity: number) => dispatch({ type: 'UPDATE_QTY', variantId, quantity }),
    remove: (variantId: string) => dispatch({ type: 'REMOVE', variantId }),
    clear: () => dispatch({ type: 'CLEAR' }),
  };
}
```

- [ ] **Step 9: Wrap `app/layout.tsx` with `CartProvider`**

Import `CartProvider` and wrap `{children}` (inside `<body>`, around the GA mount and children).

- [ ] **Step 10: Commit**

```bash
git add features/cart app/layout.tsx
git commit -m "feat: add cart reducer, storage, context, and hook"
```

---

## Task 10: shadcn/ui primitives

**Files:**
- Create (via CLI): `components/ui/button.tsx`, `badge.tsx`, `input.tsx`, `select.tsx`, `dialog.tsx`, `sheet.tsx`, `tabs.tsx`, `accordion.tsx`
- Modify: `app/globals.css` (design tokens), `components.json`

**Interfaces:**
- Produces: shadcn primitives importable as `@/components/ui/*`.

- [ ] **Step 1: Init shadcn**

Run: `npx shadcn@latest init --yes`
Choose defaults (New York style, CSS variables). This writes `components.json` and design tokens into `globals.css`.

- [ ] **Step 2: Add primitives**

Run:
```bash
npx shadcn@latest add button badge input select dialog sheet tabs accordion --yes
```
Expected: files created under `components/ui/`.

- [ ] **Step 3: Customize brand tokens in `app/globals.css`**

Set the primary brand color (Vivimoon accent) in the `:root` and `.dark` token blocks (e.g. a teal/violet `--primary`). Keep all component styling referencing semantic tokens.

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add components/ui components.json app/globals.css
git commit -m "feat: add shadcn/ui primitives and brand tokens"
```

---

## Task 11: Commerce primitives (PriceTag, RatingStars, ProductCard)

**Files:**
- Create: `components/commerce/price-tag.tsx`, `components/commerce/rating-stars.tsx`, `components/commerce/product-card.tsx`, `components/commerce/product-card.test.tsx`

**Interfaces:**
- Consumes: `Product` (Task 4), `formatPrice` (Task 3), `Locale` (Task 7).
- Produces:
  - `<PriceTag price currency locale compareAtPrice? />`
  - `<RatingStars rating />`
  - `<ProductCard product locale onSelect? />` — links to `/{locale}/product/{slug}`, shows first image with hover-swap to second, badge, inline color swatches (for products with colored variants), PriceTag (min variant price + optional compareAt).

- [ ] **Step 1: Create `components/commerce/price-tag.tsx`**

```tsx
import { formatPrice } from '@/lib/utils/format';
import type { Currency } from '@/lib/types';
import type { Locale } from '@/lib/i18n/config';
import { cn } from '@/lib/utils/cn';

export function PriceTag({
  price, currency, locale, compareAtPrice, className,
}: {
  price: number; currency: Currency; locale: Locale; compareAtPrice?: number; className?: string;
}) {
  const discount = compareAtPrice ? Math.round((1 - price / compareAtPrice) * 100) : 0;
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="font-semibold">{formatPrice(price, currency, locale)}</span>
      {compareAtPrice ? (
        <>
          <span className="text-sm text-muted-foreground line-through">
            {formatPrice(compareAtPrice, currency, locale)}
          </span>
          <span className="text-xs font-medium text-red-600">-{discount}%</span>
        </>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 2: Create `components/commerce/rating-stars.tsx`**

```tsx
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function RatingStars({ rating, className }: { rating: number; className?: string }) {
  return (
    <div className={cn('flex', className)} aria-label={`Rating ${rating} of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn('h-4 w-4', i <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground')}
        />
      ))}
    </div>
  );
}
```

Install icons if not present: `npm install lucide-react`

- [ ] **Step 3: Write failing test `components/commerce/product-card.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductCard } from './product-card';
import type { Product } from '@/lib/types';

const product: Product = {
  id: 'p1', slug: 'aqua', name: 'Aqua Daily', brandId: 'v', brandName: 'Vivimoon',
  type: 'clear', replacement: 'daily', description: '', images: ['/a.jpg', '/b.jpg'], badges: ['sale'],
  specs: { material: '', waterContent: '', baseCurve: '', diameter: '', uvProtection: false, manufacturer: '' },
  variants: [{ id: 'v1', sku: 'S1', packSize: '30', price: 20, compareAtPrice: 25, currency: 'USD', stock: 5 }],
  rating: 4, reviewCount: 3,
};

describe('ProductCard', () => {
  it('renders name, sale badge, discounted price, and a link to the PDP', () => {
    render(<ProductCard product={product} locale="en" />);
    expect(screen.getByText('Aqua Daily')).toBeInTheDocument();
    expect(screen.getByText('$20.00')).toBeInTheDocument();
    expect(screen.getByText('$25.00')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /Aqua Daily/i });
    expect(link).toHaveAttribute('href', '/en/product/aqua');
  });
});
```

- [ ] **Step 4: Run test to verify fail**

Run: `npm test -- product-card`
Expected: FAIL (module not found).

- [ ] **Step 5: Implement `components/commerce/product-card.tsx`**

```tsx
'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import type { Product } from '@/lib/types';
import type { Locale } from '@/lib/i18n/config';
import { PriceTag } from './price-tag';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';

function minVariant(product: Product) {
  return product.variants.reduce((min, v) => (v.price < min.price ? v : min), product.variants[0]);
}

export function ProductCard({
  product, locale, onSelect,
}: {
  product: Product; locale: Locale; onSelect?: () => void;
}) {
  const [hover, setHover] = useState(false);
  const v = minVariant(product);
  const secondary = product.images[1] ?? product.images[0];
  const src = hover ? secondary : product.images[0];
  const colors = product.variants.filter((x) => x.color);

  return (
    <div className="group flex flex-col gap-2" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <Link
        href={`/${locale}/product/${product.slug}`}
        onClick={onSelect}
        className="relative block aspect-square overflow-hidden rounded-md bg-muted"
      >
        {src ? <Image src={src} alt={product.name} fill className="object-cover" sizes="(max-width:768px) 50vw, 25vw" /> : null}
        {product.badges[0] ? <Badge className="absolute left-2 top-2 capitalize">{product.badges[0]}</Badge> : null}
      </Link>
      {colors.length > 0 ? (
        <div className="flex gap-1">
          {Array.from(new Map(colors.map((c) => [c.color, c])).values()).map((c) => (
            <span key={c.color} title={c.colorLabel} className={cn('h-4 w-4 rounded-full border')} style={{ backgroundColor: c.color }} />
          ))}
        </div>
      ) : null}
      <Link href={`/${locale}/product/${product.slug}`} onClick={onSelect} className="font-medium hover:underline">
        {product.name}
      </Link>
      <PriceTag price={v.price} compareAtPrice={v.compareAtPrice} currency={v.currency} locale={locale} />
    </div>
  );
}
```

- [ ] **Step 6: Run test to verify pass**

Run: `npm test -- product-card`
Expected: PASS. (If Next `Image` errors in jsdom, the test asserts text/link which render regardless; ensure `next.config.ts` allows unoptimized images in tests is not required since we assert non-image nodes.)

- [ ] **Step 7: Commit**

```bash
git add components/commerce package.json package-lock.json
git commit -m "feat: add PriceTag, RatingStars, ProductCard"
```

---

## Task 12: Carousels & CategoryGrid

**Files:**
- Create: `components/commerce/hero-carousel.tsx`, `components/commerce/collection-carousel.tsx`, `components/commerce/category-grid.tsx`

**Interfaces:**
- Consumes: `ProductCard` (Task 11), `Product`, `Locale`.
- Produces:
  - `<HeroCarousel slides={{ image; href; alt }[]} />`
  - `<CollectionCarousel title products locale seeMoreHref />` — horizontally scrollable ProductCards with prev/next.
  - `<CategoryGrid items={{ label; href; image }[]} />`

- [ ] **Step 1: Install embla**

Run: `npm install embla-carousel-react`

- [ ] **Step 2: Implement `components/commerce/hero-carousel.tsx`**

```tsx
'use client';
import Image from 'next/image';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function HeroCarousel({ slides }: { slides: { image: string; href: string; alt: string }[] }) {
  const [ref, embla] = useEmblaCarousel({ loop: true });
  return (
    <div className="relative">
      <div className="overflow-hidden" ref={ref}>
        <div className="flex">
          {slides.map((s) => (
            <Link key={s.href} href={s.href} className="relative min-w-0 flex-[0_0_100%]">
              <div className="relative aspect-[21/9] w-full">
                <Image src={s.image} alt={s.alt} fill className="object-cover" priority />
              </div>
            </Link>
          ))}
        </div>
      </div>
      <button aria-label="Previous slide" onClick={() => embla?.scrollPrev()} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2">
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button aria-label="Next slide" onClick={() => embla?.scrollNext()} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2">
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Implement `components/commerce/collection-carousel.tsx`**

```tsx
'use client';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '@/lib/types';
import type { Locale } from '@/lib/i18n/config';
import { ProductCard } from './product-card';

export function CollectionCarousel({
  title, products, locale, seeMoreHref, seeMoreLabel,
}: {
  title: string; products: Product[]; locale: Locale; seeMoreHref: string; seeMoreLabel: string;
}) {
  const [ref, embla] = useEmblaCarousel({ align: 'start', dragFree: true });
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Link href={seeMoreHref} className="text-sm hover:underline">{seeMoreLabel}</Link>
      </div>
      <div className="relative">
        <div className="overflow-hidden" ref={ref}>
          <div className="flex gap-4">
            {products.map((p) => (
              <div key={p.id} className="min-w-0 flex-[0_0_60%] sm:flex-[0_0_40%] lg:flex-[0_0_23%]">
                <ProductCard product={p} locale={locale} />
              </div>
            ))}
          </div>
        </div>
        <button aria-label="Previous slide" onClick={() => embla?.scrollPrev()} className="absolute -left-3 top-1/3 rounded-full bg-white/90 p-2 shadow"><ChevronLeft className="h-5 w-5" /></button>
        <button aria-label="Next slide" onClick={() => embla?.scrollNext()} className="absolute -right-3 top-1/3 rounded-full bg-white/90 p-2 shadow"><ChevronRight className="h-5 w-5" /></button>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Implement `components/commerce/category-grid.tsx`**

```tsx
import Link from 'next/link';
import Image from 'next/image';

export function CategoryGrid({ items }: { items: { label: string; href: string; image: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      {items.map((it) => (
        <Link key={it.href} href={it.href} className="group flex flex-col items-center gap-2">
          <div className="relative aspect-square w-full overflow-hidden rounded-full bg-muted">
            <Image src={it.image} alt={it.label} fill className="object-cover" sizes="120px" />
          </div>
          <span className="text-sm font-medium">{it.label}</span>
        </Link>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 6: Commit**

```bash
git add components/commerce package.json package-lock.json
git commit -m "feat: add hero/collection carousels and category grid"
```

---

## Task 13: Layout chrome (AnnouncementBar, Header, MegaNav, LocaleSwitcher, Footer)

**Files:**
- Create: `components/layout/announcement-bar.tsx`, `components/layout/locale-switcher.tsx`, `components/layout/mega-nav.tsx`, `components/layout/header.tsx`, `components/layout/footer.tsx`
- Create: `app/[locale]/layout.tsx`

**Interfaces:**
- Consumes: `getDictionary` (Task 7), `useCart` (Task 9), `isLocale`, `locales`.
- Produces: `<Header locale dict />`, `<Footer locale dict />`, `<AnnouncementBar text />`, `<LocaleSwitcher currentLocale />`, and the locale layout that renders them around `{children}`.

- [ ] **Step 1: Implement `components/layout/announcement-bar.tsx`**

```tsx
export function AnnouncementBar({ text }: { text: string }) {
  return <div className="bg-primary py-2 text-center text-sm text-primary-foreground">{text}</div>;
}
```

- [ ] **Step 2: Implement `components/layout/locale-switcher.tsx`**

```tsx
'use client';
import { usePathname, useRouter } from 'next/navigation';
import { locales, type Locale } from '@/lib/i18n/config';

export function LocaleSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const pathname = usePathname();
  const router = useRouter();
  const switchTo = (locale: Locale) => {
    const rest = pathname.replace(new RegExp(`^/(${locales.join('|')})`), '');
    router.push(`/${locale}${rest || ''}`);
  };
  return (
    <select
      aria-label="Language"
      value={currentLocale}
      onChange={(e) => switchTo(e.target.value as Locale)}
      className="rounded border bg-transparent px-2 py-1 text-sm"
    >
      {locales.map((l) => <option key={l} value={l}>{l.toUpperCase()}</option>)}
    </select>
  );
}
```

- [ ] **Step 3: Implement `components/layout/mega-nav.tsx`**

Keep it simple (contact-lens shallow nav): top-level links to key collections. Accept `locale` and `dict`.

```tsx
import Link from 'next/link';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';

export function MegaNav({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const items = [
    { label: dict.collection.newArrivals, slug: 'new-arrivals' },
    { label: dict.collection.bestsellers, slug: 'bestsellers' },
    { label: dict.collection.colored, slug: 'colored-lenses' },
    { label: dict.collection.daily, slug: 'daily-lenses' },
    { label: dict.nav.sale, slug: 'sale' },
  ];
  return (
    <nav className="flex gap-6">
      {items.map((it) => (
        <Link key={it.slug} href={`/${locale}/collection/${it.slug}`} className="text-sm font-medium hover:text-primary">
          {it.label}
        </Link>
      ))}
    </nav>
  );
}
```

- [ ] **Step 4: Implement `components/layout/header.tsx`**

```tsx
'use client';
import Link from 'next/link';
import { ShoppingCart, User, Search } from 'lucide-react';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { MegaNav } from './mega-nav';
import { LocaleSwitcher } from './locale-switcher';
import { useCart } from '@/features/cart/use-cart';

export function Header({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const { count } = useCart();
  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-4">
        <Link href={`/${locale}`} className="text-xl font-bold">Vivimoon</Link>
        <MegaNav locale={locale} dict={dict} />
        <div className="ml-auto flex items-center gap-4">
          <div className="hidden items-center gap-2 rounded border px-2 md:flex">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input aria-label={dict.common.search} placeholder={dict.common.search} className="bg-transparent py-1 text-sm outline-none" />
          </div>
          <button aria-label="Account"><User className="h-5 w-5" /></button>
          <Link href={`/${locale}/cart`} aria-label={dict.cart.title} className="relative">
            <ShoppingCart className="h-5 w-5" />
            {count > 0 ? <span className="absolute -right-2 -top-2 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">{count}</span> : null}
          </Link>
          <LocaleSwitcher currentLocale={locale} />
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 5: Implement `components/layout/footer.tsx`**

```tsx
import Link from 'next/link';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';

export function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <footer className="mt-16 border-t bg-muted/30">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <h3 className="mb-3 font-semibold">{dict.footer.about}</h3>
          <p className="text-sm text-muted-foreground">Vivimoon — high-quality contact lenses.</p>
        </div>
        <div>
          <h3 className="mb-3 font-semibold">{dict.footer.policies}</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li><Link href={`/${locale}`}>Shipping</Link></li>
            <li><Link href={`/${locale}`}>Returns</Link></li>
            <li><Link href={`/${locale}`}>Privacy</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 font-semibold">{dict.footer.customerCare}</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>hello@vivimoon.com</li>
            <li>Hotline: 1900 0000</li>
          </ul>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">© 2026 Vivimoon</div>
    </footer>
  );
}
```

- [ ] **Step 6: Implement `app/[locale]/layout.tsx`**

```tsx
import { notFound } from 'next/navigation';
import { isLocale, locales, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { AnnouncementBar } from '@/components/layout/announcement-bar';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children, params,
}: {
  children: React.ReactNode; params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale as Locale);
  return (
    <>
      <AnnouncementBar text={dict.announcement.freeShipping} />
      <Header locale={locale as Locale} dict={dict} />
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
      <Footer locale={locale as Locale} dict={dict} />
    </>
  );
}
```

- [ ] **Step 7: Verify build & manual smoke**

Run: `npm run build && npm run dev`
Visit `/` → expect redirect to `/en` with header/footer rendering.

- [ ] **Step 8: Commit**

```bash
git add components/layout app/[locale]/layout.tsx
git commit -m "feat: add layout chrome (announcement, header, mega-nav, footer)"
```

---

## Task 14: Home page

**Files:**
- Create: `app/[locale]/page.tsx`
- Add placeholder images under `public/images/` (hero + products + categories). Use simple solid-color placeholder JPGs or SVGs; real art comes later.

**Interfaces:**
- Consumes: `productRepository` (Task 6), carousels/grid (Task 12), `getDictionary`.

- [ ] **Step 1: Implement `app/[locale]/page.tsx`**

```tsx
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { productRepository } from '@/lib/data';
import { HeroCarousel } from '@/components/commerce/hero-carousel';
import { CategoryGrid } from '@/components/commerce/category-grid';
import { CollectionCarousel } from '@/components/commerce/collection-carousel';
import { notFound } from 'next/navigation';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const l = locale as Locale;
  const dict = getDictionary(l);

  const bestsellers = await productRepository.getCollection('bestsellers');
  const colored = await productRepository.getCollection('colored-lenses');
  const bestProducts = bestsellers ? await productRepository.getProductsByIds(bestsellers.productIds) : [];
  const coloredProducts = colored ? await productRepository.getProductsByIds(colored.productIds) : [];

  return (
    <div className="space-y-12">
      <HeroCarousel
        slides={[
          { image: '/images/hero-1.jpg', href: `/${l}/collection/new-arrivals`, alt: dict.collection.newArrivals },
          { image: '/images/hero-2.jpg', href: `/${l}/collection/sale`, alt: dict.collection.sale },
        ]}
      />
      <CategoryGrid
        items={[
          { label: dict.collection.daily, href: `/${l}/collection/daily-lenses`, image: '/images/cat-daily.jpg' },
          { label: dict.collection.colored, href: `/${l}/collection/colored-lenses`, image: '/images/cat-colored.jpg' },
          { label: dict.collection.bestsellers, href: `/${l}/collection/bestsellers`, image: '/images/cat-best.jpg' },
        ]}
      />
      <CollectionCarousel title={dict.collection.bestsellers} products={bestProducts} locale={l} seeMoreHref={`/${l}/collection/bestsellers`} seeMoreLabel={dict.common.seeMore} />
      <CollectionCarousel title={dict.collection.colored} products={coloredProducts} locale={l} seeMoreHref={`/${l}/collection/colored-lenses`} seeMoreLabel={dict.common.seeMore} />
    </div>
  );
}
```

- [ ] **Step 2: Add placeholder images**

Create minimal placeholder files (e.g. 1200×600 solid JPGs) at the referenced paths in `public/images/` plus product/category images referenced in `content/products.ts`. Set `next.config.ts` `images: { unoptimized: true }` for the baseline to avoid loader setup.

- [ ] **Step 3: Manual smoke**

Run: `npm run dev` → `/en` shows hero, categories, two product carousels.

- [ ] **Step 4: Commit**

```bash
git add app/[locale]/page.tsx public/images next.config.ts
git commit -m "feat: add home page"
```

---

## Task 15: Collection listing page + filters

**Files:**
- Create: `components/commerce/product-grid.tsx`, `components/commerce/collection-filters.tsx`, `app/[locale]/collection/[slug]/page.tsx`

**Interfaces:**
- Consumes: `productRepository`, `ProductCard`, `ProductQuery`, `toGa4Items` + `track` for `view_item_list`/`select_item`.
- Produces:
  - `<ProductGrid products locale onSelectProduct? />`
  - `<CollectionFilters locale dict />` — reads/writes URL search params (`?type=&replacement=&color=&sort=`).

- [ ] **Step 1: Implement `components/commerce/product-grid.tsx`**

```tsx
'use client';
import { useEffect } from 'react';
import type { Product } from '@/lib/types';
import type { Locale } from '@/lib/i18n/config';
import { ProductCard } from './product-card';
import { useAnalytics } from '@/lib/analytics/use-analytics';
import { toGa4Items } from '@/lib/analytics/events';

export function ProductGrid({ products, locale, listId }: { products: Product[]; locale: Locale; listId: string }) {
  const { track } = useAnalytics();
  useEffect(() => {
    track({ name: 'view_item_list', params: { item_list_id: listId, items: toGa4Items(products.map((p) => ({ product: p }))) } });
  }, [listId, products, track]);

  return (
    <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard
          key={p.id}
          product={p}
          locale={locale}
          onSelect={() => track({ name: 'select_item', params: { item_list_id: listId, items: toGa4Items([{ product: p }]) } })}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Implement `components/commerce/collection-filters.tsx`**

```tsx
'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Dictionary } from '@/lib/i18n/dictionaries';

const TYPES = ['clear', 'colored', 'toric', 'multifocal'];
const REPLACEMENTS = ['daily', 'biweekly', 'monthly'];
const SORTS = ['newest', 'price-asc', 'price-desc', 'bestselling'];

export function CollectionFilters({ dict }: { dict: Dictionary }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value); else next.delete(key);
    router.push(`${pathname}?${next.toString()}`);
  };

  return (
    <div className="mb-6 flex flex-wrap gap-3">
      <select aria-label={dict.filters.type} value={params.get('type') ?? ''} onChange={(e) => setParam('type', e.target.value)} className="rounded border px-2 py-1 text-sm">
        <option value="">{dict.filters.type}</option>
        {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>
      <select aria-label={dict.filters.replacement} value={params.get('replacement') ?? ''} onChange={(e) => setParam('replacement', e.target.value)} className="rounded border px-2 py-1 text-sm">
        <option value="">{dict.filters.replacement}</option>
        {REPLACEMENTS.map((r) => <option key={r} value={r}>{r}</option>)}
      </select>
      <select aria-label={dict.filters.sort} value={params.get('sort') ?? ''} onChange={(e) => setParam('sort', e.target.value)} className="rounded border px-2 py-1 text-sm">
        <option value="">{dict.filters.sort}</option>
        {SORTS.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <button onClick={() => router.push(pathname)} className="text-sm underline">{dict.filters.clear}</button>
    </div>
  );
}
```

- [ ] **Step 3: Implement `app/[locale]/collection/[slug]/page.tsx`**

```tsx
import { notFound } from 'next/navigation';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { productRepository } from '@/lib/data';
import type { ProductQuery } from '@/lib/data';
import { ProductGrid } from '@/components/commerce/product-grid';
import { CollectionFilters } from '@/components/commerce/collection-filters';
import type { LensType, ReplacementSchedule } from '@/lib/types';

export default async function CollectionPage({
  params, searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { locale, slug } = await params;
  const sp = await searchParams;
  if (!isLocale(locale)) notFound();
  const l = locale as Locale;
  const dict = getDictionary(l);

  const collection = await productRepository.getCollection(slug);
  if (!collection) notFound();

  // Start from the collection's products, then apply URL filters via listProducts intersection.
  const base = await productRepository.getProductsByIds(collection.productIds);
  const query: ProductQuery = {
    type: sp.type as LensType | undefined,
    replacement: sp.replacement as ReplacementSchedule | undefined,
    color: sp.color,
    sort: sp.sort as ProductQuery['sort'],
  };
  const filtered = await productRepository.listProducts(query);
  const ids = new Set(base.map((p) => p.id));
  const products = filtered.filter((p) => ids.has(p.id));

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">{dict.collection[collection.slug.replace(/-.*/, '') as keyof typeof dict.collection] ?? collection.title}</h1>
      <CollectionFilters dict={dict} />
      <ProductGrid products={products} locale={l} listId={collection.slug} />
    </div>
  );
}
```

> Note: title resolution — since `collection.title` holds a dictionary key like `collection.bestsellers`, resolve it by splitting on `.` and indexing `dict`. Simpler: store the resolved label. For the baseline, render `collection.title` if the key lookup is empty. (Adjust the title line to: look up `dict` by the two key segments; fall back to `collection.title`.)

- [ ] **Step 4: Manual smoke**

Visit `/en/collection/bestsellers` and `/en/collection/colored-lenses?type=colored&sort=price-asc`. Filters change the grid.

- [ ] **Step 5: Commit**

```bash
git add components/commerce app/[locale]/collection
git commit -m "feat: add collection listing page with filters + list analytics"
```

---

## Task 16: PDP components (Gallery, VariantSelector, SpecTable, ReviewsList)

**Files:**
- Create: `components/commerce/product-gallery.tsx`, `components/commerce/variant-selector.tsx`, `components/commerce/variant-selector.test.tsx`, `components/commerce/spec-table.tsx`, `components/commerce/reviews-list.tsx`

**Interfaces:**
- Consumes: `Product`, `Variant`, `Review`, `Dictionary`, `RatingStars`.
- Produces:
  - `<ProductGallery images alt />`
  - `<VariantSelector product dict onVariantChange />` — renders color swatches (if any) + pack-size buttons; emits the selected `Variant`. Selecting the first valid variant on mount.
  - `<SpecTable specs dict />`
  - `<ReviewsList reviews dict />`

- [ ] **Step 1: Write failing test `components/commerce/variant-selector.test.tsx`**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VariantSelector } from './variant-selector';
import { getDictionary } from '@/lib/i18n/dictionaries';
import type { Product } from '@/lib/types';

const dict = getDictionary('en');
const product: Product = {
  id: 'p1', slug: 'hazel', name: 'Hazel', brandId: 'v', brandName: 'Vivimoon',
  type: 'colored', replacement: 'monthly', description: '', images: ['/a.jpg'], badges: [],
  specs: { material: '', waterContent: '', baseCurve: '', diameter: '', uvProtection: false, manufacturer: '' },
  variants: [
    { id: 'v1', sku: 'H-BR-10', color: '#8a5a2b', colorLabel: 'Brown', packSize: '10 lenses', price: 22, currency: 'USD', stock: 5 },
    { id: 'v2', sku: 'H-BR-30', color: '#8a5a2b', colorLabel: 'Brown', packSize: '30 lenses', price: 55, currency: 'USD', stock: 5 },
  ],
  rating: 4, reviewCount: 0,
};

describe('VariantSelector', () => {
  it('emits a variant when a pack size is chosen', async () => {
    const onChange = vi.fn();
    render(<VariantSelector product={product} dict={dict} onVariantChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: '30 lenses' }));
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'v2' }));
  });
});
```

- [ ] **Step 2: Run test to verify fail**

Run: `npm test -- variant-selector`
Expected: FAIL.

- [ ] **Step 3: Implement `components/commerce/variant-selector.tsx`**

```tsx
'use client';
import { useEffect, useMemo, useState } from 'react';
import type { Product, Variant } from '@/lib/types';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { cn } from '@/lib/utils/cn';

export function VariantSelector({
  product, dict, onVariantChange,
}: {
  product: Product; dict: Dictionary; onVariantChange: (v: Variant) => void;
}) {
  const colors = useMemo(
    () => Array.from(new Map(product.variants.filter((v) => v.color).map((v) => [v.color, v])).values()),
    [product.variants],
  );
  const [color, setColor] = useState<string | undefined>(colors[0]?.color);
  const packs = product.variants.filter((v) => (color ? v.color === color : true));
  const [variantId, setVariantId] = useState<string>(packs[0]?.id ?? product.variants[0].id);

  useEffect(() => {
    const v = product.variants.find((x) => x.id === variantId) ?? product.variants[0];
    onVariantChange(v);
  }, [variantId, product.variants, onVariantChange]);

  return (
    <div className="space-y-4">
      {colors.length > 0 ? (
        <div>
          <p className="mb-2 text-sm font-medium">{dict.pdp.color}</p>
          <div className="flex gap-2">
            {colors.map((c) => (
              <button
                key={c.color}
                aria-label={c.colorLabel}
                title={c.colorLabel}
                onClick={() => { setColor(c.color); const first = product.variants.find((v) => v.color === c.color); if (first) setVariantId(first.id); }}
                className={cn('h-8 w-8 rounded-full border-2', color === c.color ? 'border-primary' : 'border-transparent')}
                style={{ backgroundColor: c.color }}
              />
            ))}
          </div>
        </div>
      ) : null}
      <div>
        <p className="mb-2 text-sm font-medium">{dict.pdp.packSize}</p>
        <div className="flex flex-wrap gap-2">
          {packs.map((v) => (
            <button
              key={v.id}
              onClick={() => setVariantId(v.id)}
              className={cn('rounded border px-4 py-2 text-sm', variantId === v.id ? 'border-primary bg-primary/10' : 'border-input')}
            >
              {v.packSize}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify pass**

Run: `npm test -- variant-selector`
Expected: PASS.

- [ ] **Step 5: Implement `components/commerce/product-gallery.tsx`**

```tsx
'use client';
import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils/cn';

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-2">
        {images.map((src, i) => (
          <button key={src} onClick={() => setActive(i)} className={cn('relative h-16 w-16 overflow-hidden rounded border', active === i && 'ring-2 ring-primary')}>
            <Image src={src} alt={`${alt} ${i + 1}`} fill className="object-cover" sizes="64px" />
          </button>
        ))}
      </div>
      <div className="relative aspect-square flex-1 overflow-hidden rounded-lg bg-muted">
        {images[active] ? <Image src={images[active]} alt={alt} fill className="object-cover" sizes="(max-width:768px) 100vw, 50vw" priority /> : null}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Implement `components/commerce/spec-table.tsx`**

```tsx
import type { ProductSpecs } from '@/lib/types';
import type { Dictionary } from '@/lib/i18n/dictionaries';

export function SpecTable({ specs, dict }: { specs: ProductSpecs; dict: Dictionary }) {
  const rows: [string, string][] = [
    [dict.pdp.material, specs.material],
    [dict.pdp.waterContent, specs.waterContent],
    [dict.pdp.baseCurve, specs.baseCurve],
    [dict.pdp.diameter, specs.diameter],
    [dict.pdp.uvProtection, specs.uvProtection ? '✓' : '—'],
    [dict.pdp.manufacturer, specs.manufacturer],
  ];
  return (
    <table className="w-full text-sm">
      <tbody>
        {rows.map(([k, v]) => (
          <tr key={k} className="border-b">
            <th scope="row" className="py-2 text-left font-medium text-muted-foreground">{k}</th>
            <td className="py-2 text-right">{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

- [ ] **Step 7: Implement `components/commerce/reviews-list.tsx`**

```tsx
import type { Review } from '@/lib/types';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { RatingStars } from './rating-stars';

export function ReviewsList({ reviews, dict }: { reviews: Review[]; dict: Dictionary }) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">{dict.pdp.reviews}</h2>
      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">—</p>
      ) : (
        reviews.map((r) => (
          <div key={r.id} className="border-b pb-4">
            <div className="flex items-center gap-2">
              <RatingStars rating={r.rating} />
              <span className="text-sm font-medium">{r.author}</span>
              <span className="text-xs text-muted-foreground">{r.createdAt}</span>
            </div>
            <p className="mt-1 font-medium">{r.title}</p>
            <p className="text-sm text-muted-foreground">{r.body}</p>
          </div>
        ))
      )}
    </section>
  );
}
```

- [ ] **Step 8: Commit**

```bash
git add components/commerce
git commit -m "feat: add PDP components (gallery, variant selector, specs, reviews)"
```

---

## Task 17: PDP page + Add-to-cart

**Files:**
- Create: `app/[locale]/product/[slug]/page.tsx`, `components/commerce/add-to-cart.tsx`

**Interfaces:**
- Consumes: `productRepository`, PDP components (Task 16), `useCart` (Task 9), analytics (`view_item`, `add_to_cart`), `PriceTag`, `CollectionCarousel`.
- Produces: `<AddToCart product locale dict />` (client) — owns selected variant + quantity, fires `view_item` on mount, `add_to_cart` on click.

- [ ] **Step 1: Implement `components/commerce/add-to-cart.tsx`**

```tsx
'use client';
import { useEffect, useState } from 'react';
import type { Product, Variant } from '@/lib/types';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { VariantSelector } from './variant-selector';
import { PriceTag } from './price-tag';
import { Button } from '@/components/ui/button';
import { useCart } from '@/features/cart/use-cart';
import { useAnalytics } from '@/lib/analytics/use-analytics';
import { toGa4Items } from '@/lib/analytics/events';

export function AddToCart({ product, locale, dict }: { product: Product; locale: Locale; dict: Dictionary }) {
  const { add } = useCart();
  const { track } = useAnalytics();
  const [variant, setVariant] = useState<Variant>(product.variants[0]);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    track({ name: 'view_item', params: { items: toGa4Items([{ product, variant: product.variants[0] }]) } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  const onAdd = () => {
    add({
      productId: product.id, variantId: variant.id, name: product.name, sku: variant.sku,
      color: variant.colorLabel, packSize: variant.packSize, unitPrice: variant.price,
      currency: variant.currency, quantity: qty, image: product.images[0],
    });
    track({ name: 'add_to_cart', params: { currency: variant.currency, value: variant.price * qty, items: toGa4Items([{ product, variant, quantity: qty }]) } });
  };

  return (
    <div className="space-y-6">
      <PriceTag price={variant.price} compareAtPrice={variant.compareAtPrice} currency={variant.currency} locale={locale} className="text-2xl" />
      <VariantSelector product={product} dict={dict} onVariantChange={setVariant} />
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">{dict.pdp.quantity}</span>
        <div className="flex items-center rounded border">
          <button aria-label="Decrease" onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-1">-</button>
          <span className="w-8 text-center">{qty}</span>
          <button aria-label="Increase" onClick={() => setQty((q) => q + 1)} className="px-3 py-1">+</button>
        </div>
      </div>
      <Button onClick={onAdd} className="w-full">{dict.common.addToCart}</Button>
    </div>
  );
}
```

- [ ] **Step 2: Implement `app/[locale]/product/[slug]/page.tsx`**

```tsx
import { notFound } from 'next/navigation';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { productRepository } from '@/lib/data';
import { ProductGallery } from '@/components/commerce/product-gallery';
import { AddToCart } from '@/components/commerce/add-to-cart';
import { SpecTable } from '@/components/commerce/spec-table';
import { ReviewsList } from '@/components/commerce/reviews-list';
import { CollectionCarousel } from '@/components/commerce/collection-carousel';
import { RatingStars } from '@/components/commerce/rating-stars';

export default async function ProductPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const l = locale as Locale;
  const dict = getDictionary(l);

  const product = await productRepository.getProductBySlug(slug);
  if (!product) notFound();

  const related = await productRepository.getRelatedProducts(product, 8);
  const reviews = await productRepository.getReviews(product.id);

  return (
    <div className="space-y-16">
      <div className="grid gap-8 md:grid-cols-2">
        <ProductGallery images={product.images} alt={product.name} />
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <div className="flex items-center gap-2">
            <RatingStars rating={product.rating} />
            <span className="text-sm text-muted-foreground">({product.reviewCount})</span>
          </div>
          <AddToCart product={product} locale={l} dict={dict} />
          <p className="text-sm text-muted-foreground">{product.description}</p>
        </div>
      </div>

      <section>
        <h2 className="mb-4 text-xl font-semibold">{dict.pdp.specs}</h2>
        <SpecTable specs={product.specs} dict={dict} />
      </section>

      <CollectionCarousel title={dict.pdp.related} products={related} locale={l} seeMoreHref={`/${l}/collection/bestsellers`} seeMoreLabel={dict.common.seeMore} />

      <ReviewsList reviews={reviews} dict={dict} />
    </div>
  );
}
```

- [ ] **Step 3: Manual smoke**

Visit `/en/product/aqua-daily-clear`; select variant, add to cart → header badge increments.

- [ ] **Step 4: Commit**

```bash
git add app/[locale]/product components/commerce/add-to-cart.tsx
git commit -m "feat: add PDP page with add-to-cart and view_item/add_to_cart analytics"
```

---

## Task 18: Cart page + line item + order summary

**Files:**
- Create: `components/commerce/cart-line-item.tsx`, `components/commerce/cart-line-item.test.tsx`, `components/commerce/order-summary.tsx`, `app/[locale]/cart/page.tsx`

**Interfaces:**
- Consumes: `useCart`, `CartLine`, `formatPrice`, analytics (`view_cart`, `remove_from_cart`).
- Produces:
  - `<CartLineItem line locale dict onQty onRemove />` (presentational; callbacks passed in).
  - `<OrderSummary subtotal currency locale dict ctaHref ctaLabel />`

- [ ] **Step 1: Write failing test `components/commerce/cart-line-item.test.tsx`**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartLineItem } from './cart-line-item';
import { getDictionary } from '@/lib/i18n/dictionaries';
import type { CartLine } from '@/features/cart/cart.types';

const dict = getDictionary('en');
const line: CartLine = {
  productId: 'p1', variantId: 'v1', name: 'Aqua', sku: 'S1',
  packSize: '30 lenses', unitPrice: 25, currency: 'USD', quantity: 2,
};

describe('CartLineItem', () => {
  it('shows line total and fires remove', async () => {
    const onRemove = vi.fn();
    render(<CartLineItem line={line} locale="en" dict={dict} onQty={vi.fn()} onRemove={onRemove} />);
    expect(screen.getByText('$50.00')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: dict.cart.remove }));
    expect(onRemove).toHaveBeenCalledWith('v1');
  });
});
```

- [ ] **Step 2: Run to verify fail**

Run: `npm test -- cart-line-item`
Expected: FAIL.

- [ ] **Step 3: Implement `components/commerce/cart-line-item.tsx`**

```tsx
import Image from 'next/image';
import type { CartLine } from '@/features/cart/cart.types';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { formatPrice } from '@/lib/utils/format';

export function CartLineItem({
  line, locale, dict, onQty, onRemove,
}: {
  line: CartLine; locale: Locale; dict: Dictionary;
  onQty: (variantId: string, qty: number) => void;
  onRemove: (variantId: string) => void;
}) {
  return (
    <div className="flex items-center gap-4 border-b py-4">
      <div className="relative h-20 w-20 overflow-hidden rounded bg-muted">
        {line.image ? <Image src={line.image} alt={line.name} fill className="object-cover" sizes="80px" /> : null}
      </div>
      <div className="flex-1">
        <p className="font-medium">{line.name}</p>
        <p className="text-sm text-muted-foreground">{line.packSize}{line.color ? ` · ${line.color}` : ''}</p>
        <div className="mt-2 flex items-center rounded border w-fit">
          <button aria-label="Decrease" onClick={() => onQty(line.variantId, line.quantity - 1)} className="px-2">-</button>
          <span className="w-8 text-center">{line.quantity}</span>
          <button aria-label="Increase" onClick={() => onQty(line.variantId, line.quantity + 1)} className="px-2">+</button>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold">{formatPrice(line.unitPrice * line.quantity, line.currency, locale)}</p>
        <button onClick={() => onRemove(line.variantId)} className="text-sm text-muted-foreground underline">{dict.cart.remove}</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test -- cart-line-item`
Expected: PASS.

- [ ] **Step 5: Implement `components/commerce/order-summary.tsx`**

```tsx
import Link from 'next/link';
import type { Currency } from '@/lib/types';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { formatPrice } from '@/lib/utils/format';
import { Button } from '@/components/ui/button';

export function OrderSummary({
  subtotal, currency, locale, dict, ctaHref, ctaLabel,
}: {
  subtotal: number; currency: Currency; locale: Locale; dict: Dictionary; ctaHref: string; ctaLabel: string;
}) {
  return (
    <div className="space-y-4 rounded-lg border p-6">
      <div className="flex justify-between">
        <span>{dict.cart.subtotal}</span>
        <span className="font-semibold">{formatPrice(subtotal, currency, locale)}</span>
      </div>
      <Button asChild className="w-full"><Link href={ctaHref}>{ctaLabel}</Link></Button>
    </div>
  );
}
```

- [ ] **Step 6: Implement `app/[locale]/cart/page.tsx`**

```tsx
'use client';
import { use, useEffect } from 'react';
import Link from 'next/link';
import { isLocale, type Locale, defaultLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { useCart } from '@/features/cart/use-cart';
import { CartLineItem } from '@/components/commerce/cart-line-item';
import { OrderSummary } from '@/components/commerce/order-summary';
import { useAnalytics } from '@/lib/analytics/use-analytics';
import { cartLinesToGa4Items } from '@/lib/analytics/events';

export default function CartPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = use(params);
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  const dict = getDictionary(locale);
  const { lines, subtotal, currency, updateQty, remove } = useCart();
  const { track } = useAnalytics();

  useEffect(() => {
    track({ name: 'view_cart', params: { currency, value: subtotal, items: cartLinesToGa4Items(lines) } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (lines.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="mb-4 text-lg">{dict.cart.empty}</p>
        <Link href={`/${locale}`} className="underline">{dict.common.shopNow}</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-2">
        <h1 className="mb-4 text-2xl font-bold">{dict.cart.title}</h1>
        {lines.map((l) => (
          <CartLineItem key={l.variantId} line={l} locale={locale} dict={dict}
            onQty={(id, q) => (q < 1 ? remove(id) : updateQty(id, q))}
            onRemove={remove} />
        ))}
      </div>
      <OrderSummary subtotal={subtotal} currency={currency} locale={locale} dict={dict} ctaHref={`/${locale}/checkout`} ctaLabel={dict.cart.checkout} />
    </div>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add components/commerce app/[locale]/cart
git commit -m "feat: add cart page, line item, order summary with view_cart analytics"
```

---

## Task 19: Checkout + success (stubbed payment)

**Files:**
- Create: `lib/checkout/schema.ts`, `lib/checkout/schema.test.ts`, `app/[locale]/checkout/page.tsx`, `app/[locale]/checkout/success/page.tsx`

**Interfaces:**
- Consumes: `useCart`, `react-hook-form`, `zod`, analytics (`begin_checkout`, `purchase`).
- Produces: `checkoutSchema` (zod) + `CheckoutForm` type; success page clears cart and fires `purchase`.

- [ ] **Step 1: Install form deps**

Run: `npm install react-hook-form @hookform/resolvers zod`

- [ ] **Step 2: Write failing test `lib/checkout/schema.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { checkoutSchema } from './schema';

describe('checkoutSchema', () => {
  it('rejects invalid email', () => {
    const r = checkoutSchema.safeParse({ fullName: 'A', email: 'bad', address: 'x', city: 'y', phone: '123' });
    expect(r.success).toBe(false);
  });
  it('accepts valid input', () => {
    const r = checkoutSchema.safeParse({ fullName: 'Alice', email: 'a@b.com', address: '1 St', city: 'HN', phone: '0900000000' });
    expect(r.success).toBe(true);
  });
});
```

- [ ] **Step 3: Run to verify fail**

Run: `npm test -- checkout/schema`
Expected: FAIL.

- [ ] **Step 4: Implement `lib/checkout/schema.ts`**

```ts
import { z } from 'zod';

export const checkoutSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  address: z.string().min(1),
  city: z.string().min(1),
  phone: z.string().min(6),
});

export type CheckoutForm = z.infer<typeof checkoutSchema>;
```

- [ ] **Step 5: Run to verify pass**

Run: `npm test -- checkout/schema`
Expected: PASS.

- [ ] **Step 6: Implement `app/[locale]/checkout/page.tsx`**

```tsx
'use client';
import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { isLocale, type Locale, defaultLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { useCart } from '@/features/cart/use-cart';
import { checkoutSchema, type CheckoutForm } from '@/lib/checkout/schema';
import { OrderSummary } from '@/components/commerce/order-summary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAnalytics } from '@/lib/analytics/use-analytics';
import { cartLinesToGa4Items } from '@/lib/analytics/events';

export default function CheckoutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = use(params);
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  const dict = getDictionary(locale);
  const router = useRouter();
  const { lines, subtotal, currency } = useCart();
  const { track } = useAnalytics();
  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutForm>({ resolver: zodResolver(checkoutSchema) });

  useEffect(() => {
    track({ name: 'begin_checkout', params: { currency, value: subtotal, items: cartLinesToGa4Items(lines) } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = () => {
    const orderId = `VVM-${Date.now()}`;
    // Persist a minimal order snapshot for the success page.
    sessionStorage.setItem('vivimoon-last-order', JSON.stringify({ orderId, currency, value: subtotal, lines }));
    router.push(`/${locale}/checkout/success`);
  };

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:col-span-2">
        <h1 className="text-2xl font-bold">{dict.checkout.title}</h1>
        <div><Input placeholder={dict.checkout.fullName} {...register('fullName')} />{errors.fullName && <p className="text-xs text-red-600">Required</p>}</div>
        <div><Input placeholder={dict.checkout.email} {...register('email')} />{errors.email && <p className="text-xs text-red-600">Invalid email</p>}</div>
        <div><Input placeholder={dict.checkout.address} {...register('address')} />{errors.address && <p className="text-xs text-red-600">Required</p>}</div>
        <div><Input placeholder={dict.checkout.city} {...register('city')} />{errors.city && <p className="text-xs text-red-600">Required</p>}</div>
        <div><Input placeholder={dict.checkout.phone} {...register('phone')} />{errors.phone && <p className="text-xs text-red-600">Required</p>}</div>
        <p className="text-sm text-muted-foreground">{dict.checkout.payNote}</p>
        <Button type="submit" className="w-full">{dict.checkout.placeOrder}</Button>
      </form>
      <OrderSummary subtotal={subtotal} currency={currency} locale={locale} dict={dict} ctaHref="#" ctaLabel={dict.checkout.placeOrder} />
    </div>
  );
}
```

- [ ] **Step 7: Implement `app/[locale]/checkout/success/page.tsx`**

```tsx
'use client';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { isLocale, type Locale, defaultLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { useCart } from '@/features/cart/use-cart';
import { useAnalytics } from '@/lib/analytics/use-analytics';
import { cartLinesToGa4Items } from '@/lib/analytics/events';

export default function SuccessPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = use(params);
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  const dict = getDictionary(locale);
  const { clear } = useCart();
  const { track } = useAnalytics();
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    const raw = sessionStorage.getItem('vivimoon-last-order');
    if (raw) {
      const order = JSON.parse(raw) as { orderId: string; currency: string; value: number; lines: { sku: string; name: string; unitPrice: number; quantity: number }[] };
      setOrderId(order.orderId);
      track({ name: 'purchase', params: { transaction_id: order.orderId, currency: order.currency, value: order.value, items: cartLinesToGa4Items(order.lines) } });
      sessionStorage.removeItem('vivimoon-last-order');
      clear();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="py-16 text-center">
      <h1 className="mb-2 text-2xl font-bold">{dict.checkout.success}</h1>
      {orderId ? <p className="text-muted-foreground">{dict.checkout.orderId}: {orderId}</p> : null}
      <Link href={`/${locale}`} className="mt-6 inline-block underline">{dict.common.shopNow}</Link>
    </div>
  );
}
```

- [ ] **Step 8: Manual smoke (full flow)**

`/en/product/...` → add to cart → `/en/cart` → checkout → fill valid form → success page shows order id, cart clears.

- [ ] **Step 9: Commit**

```bash
git add lib/checkout app/[locale]/checkout package.json package-lock.json
git commit -m "feat: add checkout (stubbed) + success with begin_checkout/purchase analytics"
```

---

## Task 20: Final verification (responsive, a11y, build, tests)

**Files:**
- Modify: any files needing responsive/a11y fixes discovered here.

**Interfaces:** none new.

- [ ] **Step 1: Run full test suite**

Run: `npm test`
Expected: all tests PASS.

- [ ] **Step 2: Typecheck + lint + build**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: no type errors, no lint errors, build succeeds.

- [ ] **Step 3: Manual responsive pass**

Run `npm run dev`; check home, collection, PDP, cart, checkout at 375px and 1280px widths. Fix obvious overflow/stacking issues (grids already responsive; verify header wraps acceptably on mobile — if not, hide search on small screens with `hidden md:flex`, already applied).

- [ ] **Step 4: Manual a11y spot-check**

Verify: images have alt text, buttons have aria-labels, locale switcher labeled, color/pack buttons reachable by keyboard. Fix gaps.

- [ ] **Step 5: Verify GA4 gating**

With `NEXT_PUBLIC_GA_ID` empty, confirm no `gtag` network calls in devtools. (Optional) Set a real ID in `.env.local` and confirm `page_view` fires.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: final responsive/a11y polish and verification"
```

---

## Self-Review Notes (addressed)

- **Spec coverage:** Home, collection+filters, PDP, cart, checkout(stub)+success — Tasks 14–19. Data seam — Task 6. Theming — Task 10. i18n seam — Task 7. Analytics seam + all 8 GA4 events — Tasks 8, 15, 17, 18, 19. Component tiers (ui vs commerce) — Tasks 10–12, 16. Tests — Tasks 3, 6, 8, 9, 11, 16, 18, 19. Deferred items intentionally omitted.
- **Types consistency:** `ProductRepository` method names identical across interface (Task 6) and consumers (Tasks 14–19); `CartLine`/`useCart` shape consistent across Tasks 9, 17, 18, 19; GA4 `AnalyticsEvent` names consistent across Tasks 8, 15, 17, 18, 19.
- **Note on `view_cart`/`begin_checkout`/`purchase` item mapping:** those pages map GA4 items via the shared `cartLinesToGa4Items` helper (Task 8) rather than `toGa4Items` (which needs a full `Product`). Cart lines are snapshots that lack `item_category`, which is sent empty there; acceptable for the baseline. The helper keeps the mapping in one place (no duplication).
