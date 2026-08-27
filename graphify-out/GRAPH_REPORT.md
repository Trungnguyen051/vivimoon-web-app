# Graph Report - vivimoon-web-app  (2026-08-25)

## Corpus Check
- Corpus is ~30,298 words - fits in a single context window. You may not need a graph.

## Summary
- 581 nodes · 1112 edges · 52 communities (34 shown, 18 thin omitted)
- Extraction: 97% EXTRACTED · 2% INFERRED · 1% AMBIGUOUS · INFERRED: 22 edges (avg confidence: 0.75)
- Token cost: 2,949,882 input · 0 output

## Community Hubs (Navigation)
- Home & PDP Components
- Collection Listing Page
- Cart & Checkout Flow
- Layout Chrome & PDP Specs
- NPM Dependencies
- Root Layout & Cart Line Item
- Lint & Test Tooling Config
- TypeScript Config
- shadcn/ui Config
- Storefront Plan: Scaffold & Types
- Collection Filters UI
- Coolmate Site Chrome Research
- i18n & Analytics Seams
- Homepage Design Spec
- Cart Feature & UI Primitives Tasks
- PDP Design & Tasks
- Commerce Component Inventory
- Layout & Content Tasks
- Checkout Tasks & Testing Strategy
- Next.js Agent Docs Warning
- Torica Biweekly Product Photos
- Cat Colored Product Photo
- Aqua Daily Product Photos
- Breeze Daily Product Photo 1
- Breeze Daily Product Photo 2
- FocalPro Monthly Product Photo
- Hazel Monthly Product Photo
- Ocean Biweekly Product Photo 1
- Ocean Biweekly Product Photo 2
- Torica Monthly Product Photo 2
- Hazel Monthly Product Photo 2
- Torica Monthly Product Photo
- ESLint Config File
- Next.js Config File
- PostCSS Config File
- Cat Daily Product Photo
- Hero Image 1 Placeholder
- Hero Image 2 Placeholder
- Generic Placeholder Image
- Aqua Daily Product Photo 1
- FocalPro Daily Product Photo
- FocalPro Monthly Product Photo 2
- Mystic Daily Product Photo
- Theming Seam
- Cat Best Product Photo
- FocalPro Daily Product Photo 2
- Mystic Daily Product Photo 2
- Torica Biweekly Product Photo 2

## God Nodes (most connected - your core abstractions)
1. `cn()` - 101 edges
2. `Locale` - 21 edges
3. `Product` - 21 edges
4. `getDictionary()` - 18 edges
5. `Coolmate.me Feature & Structure Analysis` - 17 edges
6. `isLocale()` - 16 edges
7. `Dictionary` - 16 edges
8. `compilerOptions` - 16 edges
9. `Vivimoon Storefront Baseline Design Spec` - 16 edges
10. `useCart()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `README.md: Vivimoon Next.js project README` --semantically_similar_to--> `Tech stack (Next.js App Router, React 19, TS strict, Tailwind v4, shadcn/ui, embla, RHF+zod, GA4, Vitest)`  [INFERRED] [semantically similar]
  README.md → docs/superpowers/specs/2026-08-16-vivimoon-storefront-baseline-design.md
- `SelectLabel()` --calls--> `cn()`  [EXTRACTED]
  components/ui/select.tsx → lib/utils/cn.ts
- `SelectSeparator()` --calls--> `cn()`  [EXTRACTED]
  components/ui/select.tsx → lib/utils/cn.ts
- `SelectScrollUpButton()` --calls--> `cn()`  [EXTRACTED]
  components/ui/select.tsx → lib/utils/cn.ts
- `SelectScrollDownButton()` --calls--> `cn()`  [EXTRACTED]
  components/ui/select.tsx → lib/utils/cn.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Four swappable architecture seams (data, theming, i18n, analytics) isolating volatility** — docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_productrepository, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_theming_seam, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_i18n_seam, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_analytics_seam [EXTRACTED 1.00]
- **Coolmate apparel patterns re-modeled for Vivimoon contact-lens domain** — docs_research_coolmate_website_analysis_product_card, docs_research_coolmate_website_analysis_pdp, docs_research_coolmate_website_analysis_color_variant_url_pattern, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_productcard, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_variant [INFERRED 0.85]
- **Cart feature data flow: reducer, storage, context, hook composing CartProvider** — docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_cartprovider, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_usecart, docs_superpowers_plans_2026_08_16_vivimoon_storefront_baseline_task9_cart_feature [EXTRACTED 1.00]

## Communities (52 total, 18 thin omitted)

### Community 0 - "Home & PDP Components"
Cohesion: 0.05
Nodes (57): HeroCarousel(), Slide, ProductGallery(), RatingStars(), ReviewsList(), Accordion(), AccordionContent(), AccordionItem() (+49 more)

### Community 1 - "Collection Listing Page"
Cohesion: 0.07
Nodes (26): CollectionPage(), resolveTitle(), CategoryGrid(), CollectionCarousel(), minVariant(), ProductCard(), product, ProductGrid() (+18 more)

### Community 2 - "Cart & Checkout Flow"
Cohesion: 0.12
Nodes (33): CartPage(), CheckoutPage(), generateOrderId(), SuccessPage(), LocaleLayout(), HomePage(), ProductPage(), AddToCart() (+25 more)

### Community 3 - "Layout Chrome & PDP Specs"
Cohesion: 0.10
Nodes (26): SpecTable(), AnnouncementBar(), Footer(), Header(), LocaleSwitcher(), MegaNav(), MobileNav(), getNavItems() (+18 more)

### Community 4 - "NPM Dependencies"
Cohesion: 0.05
Nodes (41): class-variance-authority, clsx, embla-carousel-react, @hookform/resolvers, lucide-react, next, @next/third-parties, dependencies (+33 more)

### Community 5 - "Root Layout & Cart Line Item"
Cohesion: 0.12
Nodes (22): geistMono, geistSans, metadata, CartLineItem(), dict, line, PriceTag(), QuantityStepper() (+14 more)

### Community 6 - "Lint & Test Tooling Config"
Cohesion: 0.06
Nodes (33): eslint, eslint-config-next, jsdom, devDependencies, eslint, eslint-config-next, jsdom, prettier (+25 more)

### Community 7 - "TypeScript Config"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 8 - "shadcn/ui Config"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 9 - "Storefront Plan: Scaffold & Types"
Cohesion: 0.12
Nodes (18): Planned file structure (app/, lib/, content/, features/cart/, components/, tests/), Global constraints (Node 20+, TS strict, no hardcoded strings, no raw gtag, no data-fetching in ui/commerce components), Vivimoon Storefront Baseline Implementation Plan, Task 1: Scaffold project & tooling, Task 2: Testing setup (Vitest + RTL), Task 3: Utilities (cn, formatPrice), Task 4: Domain types, Collection domain type (+10 more)

### Community 10 - "Collection Filters UI"
Cohesion: 0.17
Nodes (14): CollectionFilters(), REPLACEMENTS, SORTS, TYPES, Select(), SelectContent(), SelectGroup(), SelectItem() (+6 more)

### Community 11 - "Coolmate Site Chrome Research"
Cohesion: 0.12
Nodes (16): Screen-reader-only accessible text investment, Announcement bar (Coolmate), Blog / content-marketing hub, Care & Share CSR program, Community Threads (UGC/community hub), Cookie consent banner + preference center, CXP by Coolmate (custom-print sub-brand), Footer (contact, link columns, address, certifications) (+8 more)

### Community 12 - "i18n & Analytics Seams"
Cohesion: 0.13
Nodes (16): Task 7: i18n seam (config, dictionaries, middleware), Task 8: Analytics seam (GA4), Analytics seam (GA4 via typed track() wrapper), GA4 ecommerce events (view_item_list, select_item, view_item, add_to_cart, remove_from_cart, view_cart, begin_checkout, purchase), getDictionary(locale) function, @next/third-parties GoogleAnalytics component, Rationale for lightweight custom i18n over next-intl, i18n seam (locale-prefixed routes, getDictionary) (+8 more)

### Community 13 - "Homepage Design Spec"
Cohesion: 0.24
Nodes (11): Gender filter toggle (in-place homepage filtering), Hero banner carousel (7 slides), Homepage structure (hero carousel, promo tiles, category grid), Product card component (hover-swap, swatches, badges, price), Themed collection sections with product carousels, Build sequence (13 high-level steps), Baseline goals (demoable bilingual storefront, clean seams, prop-driven components), Explicit non-goals (Rx upload, loyalty, real payment, real DB, auth, deferred with seams) (+3 more)

### Community 14 - "Cart Feature & UI Primitives Tasks"
Cohesion: 0.25
Nodes (9): Cart page (/cart route), Task 10: shadcn/ui primitives, Task 11: Commerce primitives (PriceTag, RatingStars, ProductCard), Task 12: Carousels & CategoryGrid, Task 9: Cart feature (reducer, storage, context, hook), Cart (CartProvider context+reducer, localStorage persistence), CartProvider, HeroCarousel component (+1 more)

### Community 15 - "PDP Design & Tasks"
Cohesion: 0.22
Nodes (9): Color variants as distinct URLs (?color=slug) for SEO/deep-linking, CoolClub loyalty program + CoolCash currency, Fabric-technology brand system (cross-cutting taxonomy: CoolDry, CoolSoft, CoolRib, CoolFlex, ZeroMark), Fit-feedback histogram (Tight/True-to-size/Loose) in reviews, Product Detail Page (PDP) structure, Task 15: Collection listing page + filters, Task 16: PDP components (Gallery, VariantSelector, SpecTable, ReviewsList), Task 17: PDP page + Add-to-cart (+1 more)

### Community 16 - "Commerce Component Inventory"
Cohesion: 0.25
Nodes (8): CartLineItem component, CategoryGrid component, CollectionCarousel component, Two-tier component architecture (ui/ vs commerce/), ProductGallery component, RatingStars component, ReviewsList component (read-only), SpecTable component

### Community 17 - "Layout & Content Tasks"
Cohesion: 0.29
Nodes (7): Multi-language/locale switcher (topbar), Utility topbar (Coolmate), Task 13: Layout chrome (AnnouncementBar, Header, MegaNav, LocaleSwitcher, Footer), Task 14: Home page, Task 5: Mock content, Task 6: ProductRepository interface + mock implementation, LocaleSwitcher component

### Community 18 - "Checkout Tasks & Testing Strategy"
Cohesion: 0.33
Nodes (6): Task 18: Cart page + line item + order summary, Task 19: Checkout + success (stubbed payment), Task 20: Final verification (responsive, a11y, build, tests), OrderSummary component, Pages table (Home, Collection, PDP, Cart, Checkout, Checkout success), Testing strategy (Vitest unit + RTL component tests)

### Community 19 - "Next.js Agent Docs Warning"
Cohesion: 0.40
Nodes (5): Breaking-changes warning for this Next.js version, node_modules/next/dist/server/lib/generate-agent-files.js, node_modules/next/dist/docs/ (Next.js version-specific docs), AGENTS.md: This is NOT the Next.js you know, Project CLAUDE.md (imports AGENTS.md)

### Community 20 - "Torica Biweekly Product Photos"
Cohesion: 0.50
Nodes (4): Torica Biweekly Product Image (Blank Placeholder), Biweekly Variant/Frequency Concept, Empty/Unrendered Placeholder Asset, Torica Product Line

### Community 21 - "Cat Colored Product Photo"
Cohesion: 0.67
Nodes (3): Cat Colored (blank placeholder image), Cat Product Imagery (implied by filename), Placeholder/Empty Image Asset

### Community 22 - "Aqua Daily Product Photos"
Cohesion: 0.67
Nodes (3): Aqua Daily 2 (Placeholder Image), Blank Placeholder Graphic, Aqua Daily Product Line

### Community 23 - "Breeze Daily Product Photo 1"
Cohesion: 0.67
Nodes (3): Breeze Daily 1 (Placeholder Image), Placeholder Product Image, Breeze Daily Product Line

### Community 24 - "Breeze Daily Product Photo 2"
Cohesion: 0.67
Nodes (3): Breeze Daily 2 (Blank Placeholder Image), Breeze Daily Product Line, Placeholder/Empty Image Asset

### Community 25 - "FocalPro Monthly Product Photo"
Cohesion: 0.67
Nodes (3): FocalPro Monthly Product Image (Blank Placeholder), FocalPro Product (Monthly Plan), Blank Placeholder Image Asset

### Community 26 - "Hazel Monthly Product Photo"
Cohesion: 0.67
Nodes (3): hazel-monthly-1.jpg (blank placeholder image), Hazel Monthly Product (inferred subscription/monthly product line), Placeholder / Blank Image Concept

### Community 27 - "Ocean Biweekly Product Photo 1"
Cohesion: 0.67
Nodes (3): Ocean Biweekly Product Image 1 (Blank Placeholder), Ocean Biweekly Product, Blank Placeholder Image Concept

### Community 28 - "Ocean Biweekly Product Photo 2"
Cohesion: 0.67
Nodes (3): Ocean Biweekly Product Image 2 (Blank Placeholder), Ocean Product Line (Biweekly Variant), Blank/Placeholder Image Concept

### Community 29 - "Torica Monthly Product Photo 2"
Cohesion: 0.67
Nodes (3): Torica Monthly Product Photo 2 (blank placeholder), Blank Placeholder Image Asset, Torica Monthly Product

## Ambiguous Edges - Review These
- `Cat Colored (blank placeholder image)` → `Cat Product Imagery (implied by filename)`  [AMBIGUOUS]
  public/images/cat-colored.jpg · relation: conceptually_related_to
- `cat-daily.jpg (blank placeholder image)` → `Placeholder/Empty Image Content`  [AMBIGUOUS]
  public/images/cat-daily.jpg · relation: conceptually_related_to
- `Breeze Daily 1 (Placeholder Image)` → `Placeholder Product Image`  [AMBIGUOUS]
  public/images/products/breeze-daily-1.jpg · relation: conceptually_related_to
- `FocalPro Daily Product Image (Placeholder)` → `Blank Placeholder Image Concept`  [AMBIGUOUS]
  public/images/products/focalpro-daily-1.jpg · relation: conceptually_related_to
- `hazel-monthly-1.jpg (blank placeholder image)` → `Placeholder / Blank Image Concept`  [AMBIGUOUS]
  public/images/products/hazel-monthly-1.jpg · relation: conceptually_related_to
- `Hazel Monthly Product Photo 2 (Blank/Placeholder)` → `Hazel Monthly Product Line`  [AMBIGUOUS]
  public/images/products/hazel-monthly-2.jpg · relation: conceptually_related_to
- `Mystic Daily Product Image (Placeholder)` → `Placeholder/Empty Image Asset`  [AMBIGUOUS]
  public/images/products/mystic-daily-1.jpg · relation: semantically_similar_to
- `Ocean Biweekly Product Image 1 (Blank Placeholder)` → `Ocean Biweekly Product`  [AMBIGUOUS]
  public/images/products/ocean-biweekly-1.jpg · relation: conceptually_related_to
- `Torica Biweekly Product Image (Blank Placeholder)` → `Empty/Unrendered Placeholder Asset`  [AMBIGUOUS]
  public/images/products/torica-biweekly-1.jpg · relation: conceptually_related_to
- `Torica Monthly Product Image (Blank Placeholder)` → `Placeholder/Blank Product Image`  [AMBIGUOUS]
  public/images/products/torica-monthly-1.jpg · relation: conceptually_related_to

## Knowledge Gaps
- **188 isolated node(s):** `geistSans`, `geistMono`, `metadata`, `$schema`, `style` (+183 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Cat Colored (blank placeholder image)` and `Cat Product Imagery (implied by filename)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `cat-daily.jpg (blank placeholder image)` and `Placeholder/Empty Image Content`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Breeze Daily 1 (Placeholder Image)` and `Placeholder Product Image`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `FocalPro Daily Product Image (Placeholder)` and `Blank Placeholder Image Concept`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `hazel-monthly-1.jpg (blank placeholder image)` and `Placeholder / Blank Image Concept`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Hazel Monthly Product Photo 2 (Blank/Placeholder)` and `Hazel Monthly Product Line`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Mystic Daily Product Image (Placeholder)` and `Placeholder/Empty Image Asset`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._