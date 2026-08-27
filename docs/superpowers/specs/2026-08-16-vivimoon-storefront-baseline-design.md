# Vivimoon Storefront — Baseline Design Spec

**Date:** 2026-08-16
**Status:** ⚠️ **Superseded** on 2026-08-27 by [`2026-08-27-vivimoon-client-scope-design.md`](./2026-08-27-vivimoon-client-scope-design.md).
> The baseline described here was delivered. The client scope converts most of its non-goals (§1) into requirements. Kept as history — do not build from it.

**Original status:** Approved (design), pending implementation plan
**Related:** [`docs/research/coolmate-website-analysis.md`](../../research/coolmate-website-analysis.md)

---

## 1. Overview

Vivimoon is an e-commerce webapp for selling high-quality contact lenses. It takes visual and structural inspiration from [coolmate.me](https://www.coolmate.me/) (hero carousel, themed product carousels, product-card interactions, PDP layout, mega-nav, footer trust signals) but models a **contact-lens** catalog rather than apparel.

This spec defines the **baseline**: a scalable, component-driven storefront with a complete Browse → Product → Cart → Checkout flow (stubbed payment), built so that deferred features drop in later without a rewrite.

### Goals
- A demoable, good-looking bilingual (EN/VI) storefront.
- Clean architectural seams: **data layer**, **theming/design tokens**, **i18n**, so future work is additive, not a refactor.
- Reusable, prop-driven components (the "scalable & changeable components" requirement).

### Explicit non-goals (deferred, seams left in place)
- Prescription/Rx upload & power-based ordering.
- Loyalty program / store credit.
- Real payment gateway.
- Real database / headless CMS (mock data now, interface designed for swap).
- Blog / community hub / store locator / write-a-review flow.
- Authentication / user accounts.

---

## 2. Tech Stack

| Concern | Choice |
|---|---|
| Framework | Next.js (App Router, latest) + React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Component primitives | shadcn/ui (Radix-based) |
| Icons | lucide-react |
| Carousel | embla-carousel-react |
| Cart state | React Context + reducer, persisted to `localStorage` |
| Forms + validation | react-hook-form + zod |
| Analytics | Google Analytics 4 via `@next/third-parties`, behind a typed analytics seam |
| i18n | Lightweight custom dictionary approach (locale-prefixed routes) |
| Unit tests | Vitest |
| Component tests | @testing-library/react + jsdom |
| Lint/format | ESLint (next config) + Prettier |
| Deploy target | Vercel |

**Rationale for lightweight i18n:** the baseline needs only string dictionaries + a locale switcher, not runtime message formatting infrastructure. A custom `getDictionary(locale)` keeps the bundle small and the seam obvious; it can be replaced by `next-intl` later if plural/date formatting is needed.

---

## 3. Packages to Install

### Runtime dependencies
```
next
react
react-dom
tailwindcss @tailwindcss/postcss postcss
class-variance-authority        # shadcn variant styling
clsx tailwind-merge             # className composition (cn helper)
lucide-react                    # icon set
embla-carousel-react            # hero + product carousels
@radix-ui/react-slot            # shadcn primitive dep
@radix-ui/react-dropdown-menu   # account/locale/mega-nav menus
@radix-ui/react-dialog          # size/spec guide + cart drawer modals
@radix-ui/react-accordion       # PDP spec sections / mobile nav
@radix-ui/react-tabs            # PDP content tabs
react-hook-form                 # checkout form
@hookform/resolvers zod         # form validation schema
@next/third-parties             # official GA4 (GoogleAnalytics) component for Next.js
```

### Dev dependencies
```
typescript @types/react @types/react-dom @types/node
eslint eslint-config-next
prettier prettier-plugin-tailwindcss
vitest @vitejs/plugin-react jsdom
@testing-library/react @testing-library/jest-dom @testing-library/user-event
```

> Note: shadcn/ui is not a runtime dependency — its CLI (`npx shadcn@latest`) copies component source into `components/ui/`. The Radix packages above are the primitives those copied components import.

---

## 4. Directory Structure

```
app/
  [locale]/
    layout.tsx              # locale-aware root layout (Header + Footer)
    page.tsx                # Home
    collection/[slug]/page.tsx
    product/[slug]/page.tsx
    cart/page.tsx
    checkout/page.tsx
    checkout/success/page.tsx
  layout.tsx                # <html> shell, fonts, global providers
  globals.css               # Tailwind + design tokens (CSS variables)

components/
  ui/                       # shadcn primitives: button, badge, dialog, input, select, tabs, accordion, sheet…
  layout/                   # AnnouncementBar, Header, MegaNav, Footer, LocaleSwitcher, MobileNav
  commerce/                 # ProductCard, ProductGrid, ProductGallery, VariantSelector,
                            #   PriceTag, RatingStars, CollectionCarousel, HeroCarousel,
                            #   CategoryGrid, CartLineItem, OrderSummary, ReviewsList, SpecTable

features/
  cart/
    cart-context.tsx        # provider + reducer
    use-cart.ts             # hook
    cart-storage.ts         # localStorage persistence
    cart.types.ts

lib/
  types/                    # domain types: product.ts, collection.ts, review.ts, index.ts
  data/
    product-repository.ts   # INTERFACE (ProductRepository)
    mock-product-repository.ts
    index.ts                # exports the active repository instance (swap point)
  i18n/
    config.ts               # locales, defaultLocale
    dictionaries.ts         # getDictionary(locale)
    dictionaries/en.ts
    dictionaries/vi.ts
  analytics/
    events.ts               # typed GA4 ecommerce event definitions + payload types
    analytics.ts            # track() wrapper over gtag (no-op if GA id unset)
    use-analytics.ts        # client hook for firing events from components
  utils/
    cn.ts                   # clsx + tailwind-merge helper
    format.ts               # currency/number formatting per locale

content/
  products.ts               # mock catalog (typed)
  collections.ts
  reviews.ts

middleware.ts               # locale detection/redirect to /[locale]

tests/                      # or co-located *.test.ts(x)
```

---

## 5. Domain Model

```ts
// lib/types/product.ts
export type LensType = 'clear' | 'colored' | 'toric' | 'multifocal';
export type ReplacementSchedule = 'daily' | 'biweekly' | 'monthly';
export type ProductBadge = 'new' | 'bestseller' | 'sale';

export interface ProductSpecs {
  material: string;
  waterContent: string;   // e.g. "38%"
  baseCurve: string;      // e.g. "8.6mm"
  diameter: string;       // e.g. "14.2mm"
  uvProtection: boolean;
  manufacturer: string;
}

export interface Variant {
  id: string;
  sku: string;
  color?: string;         // slug, present for cosmetic lenses -> drives swatches
  colorLabel?: string;    // display name
  packSize: string;       // e.g. "10 lenses", "30 lenses"
  price: number;          // whole-currency units (VND has no minor unit; USD stored as whole dollars) — formatting handled by Intl.NumberFormat
  compareAtPrice?: number;
  currency: 'VND' | 'USD';
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
  rating: number;         // 0–5
  reviewCount: number;
}
```

```ts
// lib/types/collection.ts
export interface Collection {
  slug: string;
  title: string;          // dictionary key or literal
  description?: string;
  bannerImage?: string;
  productIds: string[];
}
```

**Variant axes for the baseline:** `color` (cosmetic lenses only) × `packSize`. Power/diopter is *not* a purchasable axis yet — when Rx is added later, it becomes a third axis on `Variant` and a third control in `VariantSelector`, which is designed to render N option groups generically.

---

## 6. Data Layer (the swap seam)

```ts
// lib/data/product-repository.ts
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
```

- `MockProductRepository` implements this against `content/*.ts`. All async (returns Promises) so a future DB/CMS impl is a drop-in.
- `lib/data/index.ts` exports a single `productRepository` instance — **the only place** that names the concrete implementation. UI and pages import the interface-typed instance, never the mock directly.

---

## 7. Component Architecture

Two tiers, strictly separated:

1. **`components/ui/`** — design-system primitives from shadcn/ui, themed exclusively through design tokens. No business logic.
2. **`components/commerce/`** — domain components composed from `ui`. **Prop-driven and presentational** — they receive typed data and callbacks, never fetch data themselves. This makes them unit-testable in isolation and reusable across pages.

Data fetching happens in **page/server components** (`app/**`), which call the repository and pass plain props down.

Key commerce components and their responsibilities:
- `ProductCard` — hover image-swap, badges, inline color swatches (swatch click swaps preview + link), `PriceTag`.
- `VariantSelector` — renders one control group per variant axis (color swatches, pack-size buttons); emits selected variant. Generic over axes.
- `ProductGallery` — thumbnail rail + main image, lightbox via Radix dialog.
- `HeroCarousel` / `CollectionCarousel` — embla-based, with prev/next controls.
- `CategoryGrid`, `ProductGrid` (with filter sidebar), `SpecTable`, `RatingStars`, `ReviewsList` (read-only), `CartLineItem`, `OrderSummary`.

---

## 8. Theming Seam

- All brand values (color palette, radius, font family, spacing scale) defined as **CSS custom properties** in `globals.css` and mapped into Tailwind v4's `@theme`.
- Components reference semantic tokens (`bg-primary`, `text-muted-foreground`, `rounded-md`) — never raw hex.
- Rebrand / restyle = edit the token block in one file. Supports light/dark via `prefers-color-scheme` + a `data-theme` override hook (baseline ships light; dark is token-ready).

---

## 9. i18n Seam

- Locales: `['en', 'vi']`, default `en`. Locale-prefixed routes: `/en/...`, `/vi/...`.
- `middleware.ts` redirects `/` → `/{defaultLocale}` and detects locale from the path.
- `getDictionary(locale)` returns a typed nested dictionary; server components pass the dictionary (or needed slices) into components as props.
- No hardcoded user-facing strings anywhere in components — all copy flows from dictionaries.
- `LocaleSwitcher` (in the topbar, mirroring Coolmate's VN toggle) swaps the locale segment while preserving the current path.
- Currency/number formatting via `Intl.NumberFormat` keyed on locale (VI→VND, EN→USD as configured per product/currency field).

---

## 9a. Analytics Seam (GA4)

Analytics is treated as a swappable seam, not scattered `gtag` calls.

- **Injection:** the official `<GoogleAnalytics gaId={GA_ID} />` from `@next/third-parties/google` is mounted once in the root `app/layout.tsx`. It only renders when `NEXT_PUBLIC_GA_ID` is set, so local/dev and preview builds without an ID produce zero tracking.
- **Config:** measurement ID via `NEXT_PUBLIC_GA_ID` (e.g. `G-XXXXXXX`) in `.env.local` (documented in `.env.example`). Never hardcoded.
- **Typed wrapper:** `lib/analytics/analytics.ts` exposes `track(event)` that forwards to `window.gtag('event', name, params)` and is a **no-op when GA is not configured or during SSR**. Components/pages call `track()` / the `useAnalytics()` hook — never `gtag` directly. This means GA4 can later be swapped or supplemented (e.g. server-side Measurement Protocol, a second provider) by editing one file.
- **Ecommerce events** (GA4 recommended event names, `lib/analytics/events.ts`):
  - `view_item_list` — collection/listing page load.
  - `select_item` — product card click.
  - `view_item` — PDP load.
  - `add_to_cart` / `remove_from_cart` — cart mutations.
  - `view_cart` — cart page/drawer open.
  - `begin_checkout` — checkout page load.
  - `purchase` — successful (stubbed) order placement on the success page, with order id + items + value.
  - Automatic `page_view` on route change is handled by the `@next/third-parties` component.
- **Payload mapping:** a helper maps our `Product`/`Variant`/cart line items into GA4 `items[]` shape (item_id, item_name, item_brand, item_category, price, quantity), keeping the mapping in one place.
- **Privacy:** GA loads regardless in the baseline, but the mapping/consent hook is left as a seam so a future cookie-consent gate (Coolmate has one) can suppress tracking until opt-in.

---

## 10. Cart

- `CartProvider` (React Context + reducer) holds line items `{ productId, variantId, quantity, unitPrice, currency, snapshot }`.
- Actions: `ADD`, `UPDATE_QTY`, `REMOVE`, `CLEAR`.
- Persisted to `localStorage` (`cart-storage.ts`), hydrated on mount (guarded against SSR mismatch).
- `useCart()` exposes items, totals, and mutators. Header cart badge subscribes to count.
- A cart drawer (Radix sheet) for quick view, plus the full `/cart` page.

---

## 11. Pages

| Route | Contents |
|---|---|
| `/[locale]` (Home) | AnnouncementBar, Hero carousel, CategoryGrid, themed CollectionCarousels, promo banners, footer. |
| `/[locale]/collection/[slug]` | Filterable `ProductGrid` (type, replacement, brand, color, sort) + collection banner. |
| `/[locale]/product/[slug]` | Breadcrumb, `ProductGallery`, title, `PriceTag`, `VariantSelector`, qty stepper, add-to-cart, trust bullets, `SpecTable`, related-products carousel, read-only `ReviewsList`. Color variants deep-linked via `?color=`. |
| `/[locale]/cart` | `CartLineItem` list, qty controls, `OrderSummary`, checkout CTA. Empty state. |
| `/[locale]/checkout` | react-hook-form + zod shipping form, `OrderSummary`, **stubbed** "Place order". |
| `/[locale]/checkout/success` | Order confirmation (reads a just-placed order snapshot; clears cart). |

---

## 12. Testing

- **Vitest unit tests:** `MockProductRepository` (query filtering/sorting), cart reducer (all actions + totals), `format.ts` currency formatting, variant-selection logic.
- **RTL component tests:** `ProductCard` (swatch swap, badge/discount render), `VariantSelector` (option selection + emitted variant), `CartLineItem` (qty change/remove callbacks).
- Checkout form validation (zod schema) unit-tested.
- Analytics wrapper: unit test that `track()` is a no-op when `NEXT_PUBLIC_GA_ID` is unset and that the `Product`→GA4 `items[]` mapping is correct.
- No full E2E in the baseline.

---

## 13. Build Sequence (high level — detailed plan follows separately)

1. Scaffold Next.js + TS + Tailwind v4; init shadcn/ui; set up ESLint/Prettier/Vitest.
2. Design tokens + `globals.css` + `cn` helper.
3. Domain types + mock content + `ProductRepository` interface + mock impl (with unit tests).
4. i18n config, dictionaries, middleware, `LocaleSwitcher`.
5. Analytics seam: `@next/third-parties` GA4 mount (env-gated), typed `track()` wrapper + event/payload mapping (unit-tested no-op behavior). Wire events as each page/feature lands in later steps.
6. Layout chrome: AnnouncementBar, Header + MegaNav + search stub, Footer.
7. Commerce primitives: `PriceTag`, `RatingStars`, `ProductCard`, carousels.
8. Home page.
9. Collection/listing page + filters (fires `view_item_list` / `select_item`).
10. PDP (gallery, variant selector, specs, related, reviews; fires `view_item`).
11. Cart (context, drawer, page; fires `add_to_cart` / `remove_from_cart` / `view_cart`) with tests.
12. Checkout (form, stubbed payment; fires `begin_checkout`) + success page (fires `purchase`).
13. Polish, responsive pass, a11y pass, final verification.

---

## 14. Open Items / Future Seams
- **Rx flow:** add `power` axis to `Variant` + selector; add prescription capture step in checkout.
- **Loyalty:** additive UI widgets + a `LoyaltyRepository`; no impact on cart/checkout core.
- **Real backend:** implement `ProductRepository` (and an `OrderRepository`) against Postgres/CMS; replace the instance in `lib/data/index.ts`.
- **Payments:** replace the stubbed checkout submit with a real gateway integration.
- **Auth/accounts:** wrap with a session provider; gate account/order-history routes.
