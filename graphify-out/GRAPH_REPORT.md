# Graph Report - vivimoon-web-app  (2026-08-31)

## Corpus Check
- 179 files · ~81,942 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 957 nodes · 1992 edges · 77 communities (59 shown, 18 thin omitted)
- Extraction: 98% EXTRACTED · 1% INFERRED · 1% AMBIGUOUS · INFERRED: 24 edges (avg confidence: 0.75)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5b07afaa`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- rx-selector.tsx
- forgot-password-form.tsx
- auth.ts
- dependencies
- rx.ts
- devDependencies
- compilerOptions
- components.json
- Product domain type
- dialog.tsx
- Coolmate.me Feature & Structure Analysis
- i18n seam (locale-prefixed routes, getDictionary)
- Vivimoon Storefront Baseline Design Spec
- Cart (CartProvider context+reducer, localStorage persistence)
- Product Detail Page (PDP) structure
- Two-tier component architecture (ui/ vs commerce/)
- Vivimoon — Client Scope Design Spec
- Vivimoon M2 — Purchase Core Implementation Plan
- AGENTS.md: This is NOT the Next.js you know
- Torica Biweekly Product Image (Blank Placeholder)
- Cat Colored (blank placeholder image)
- Aqua Daily 2 (Placeholder Image)
- Breeze Daily 1 (Placeholder Image)
- Breeze Daily 2 (Blank Placeholder Image)
- FocalPro Monthly Product Image (Blank Placeholder)
- hazel-monthly-1.jpg (blank placeholder image)
- Ocean Biweekly Product Image 1 (Blank Placeholder)
- Ocean Biweekly Product Image 2 (Blank Placeholder)
- Torica Monthly Product Photo 2 (blank placeholder)
- Hazel Monthly Product Line
- Placeholder/Blank Product Image
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs
- cat-daily.jpg (blank placeholder image)
- Hero 1 Placeholder Image
- Hero 2 Placeholder Image
- Placeholder Image (Solid Light Blue-Gray)
- Aqua Daily 1 (placeholder image)
- FocalPro Daily Product Image (Placeholder)
- FocalPro Monthly Product Image 2 (Blank Placeholder)
- Mystic Daily Product Image (Placeholder)
- Theming seam (CSS custom properties, Tailwind v4 @theme)
- cat-best.jpg (blank placeholder image)
- FocalPro Daily 2 (Blank Placeholder Image)
- Mystic Daily Product Image 2 (Blank Placeholder)
- Torica Biweekly Product Image 2 (Blank Placeholder)
- Vivimoon M1 — Foundation Implementation Plan
- cart-store.test.ts
- cart-reducer.test.ts
- sheet.tsx
- catalog.ts
- common.ts
- dictionaries.ts
- fetch.ts
- api/config.ts
- app/layout.tsx
- pricing/mock.ts
- cn.ts
- collection-filters.tsx
- product/[slug]/page.tsx
- cart.ts
- M1 Foundation — progress ledger
- cn
- order-summary.tsx
- rx-summary.tsx
- tabs.tsx
- 5. Migration Strategy
- 1. Overview
- 15. Decisions and Open Questions
- 3. Architecture — the proxy seam

## God Nodes (most connected - your core abstractions)
1. `cn()` - 101 edges
2. `apiOk()` - 32 edges
3. `getDictionary()` - 31 edges
4. `Locale` - 24 edges
5. `isLocale()` - 24 edges
6. `Dictionary` - 22 edges
7. `Vivimoon M2 — Purchase Core Implementation Plan` - 19 edges
8. `parseBody()` - 18 edges
9. `Vivimoon M1 — Foundation Implementation Plan` - 18 edges
10. `apiFail()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `README.md: Vivimoon Next.js project README` --semantically_similar_to--> `Tech stack (Next.js App Router, React 19, TS strict, Tailwind v4, shadcn/ui, embla, RHF+zod, GA4, Vitest)`  [INFERRED] [semantically similar]
  README.md → docs/superpowers/specs/2026-08-16-vivimoon-storefront-baseline-design.md
- `BreadcrumbEllipsis()` --calls--> `cn()`  [EXTRACTED]
  components/ui/breadcrumb.tsx → lib/utils/cn.ts
- `CardDescription()` --calls--> `cn()`  [EXTRACTED]
  components/ui/card.tsx → lib/utils/cn.ts
- `CardAction()` --calls--> `cn()`  [EXTRACTED]
  components/ui/card.tsx → lib/utils/cn.ts
- `DialogOverlay()` --calls--> `cn()`  [EXTRACTED]
  components/ui/dialog.tsx → lib/utils/cn.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Cart feature data flow: reducer, storage, context, hook composing CartProvider** — docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_cartprovider, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_usecart, docs_superpowers_plans_2026_08_16_vivimoon_storefront_baseline_task9_cart_feature [EXTRACTED 1.00]
- **Four swappable architecture seams (data, theming, i18n, analytics) isolating volatility** — docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_productrepository, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_theming_seam, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_i18n_seam, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_analytics_seam [EXTRACTED 1.00]
- **Coolmate apparel patterns re-modeled for Vivimoon contact-lens domain** — docs_research_coolmate_website_analysis_product_card, docs_research_coolmate_website_analysis_pdp, docs_research_coolmate_website_analysis_color_variant_url_pattern, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_productcard, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_variant [INFERRED 0.85]

## Communities (77 total, 18 thin omitted)

### Community 0 - "rx-selector.tsx"
Cohesion: 0.23
Nodes (8): emptyRxDraft, RxDraft, RxEyeDraft, RxRanges, RxSelector(), dict, LensType, AddBand

### Community 2 - "forgot-password-form.tsx"
Cohesion: 0.08
Nodes (37): AccountForm(), user, ForgotPasswordForm(), reportServer(), requestCode(), submitPassword(), verifyCode(), Stage (+29 more)

### Community 3 - "auth.ts"
Cohesion: 0.05
Nodes (70): jar, GET(), PATCH(), jar, POST(), POST(), POST(), POST() (+62 more)

### Community 4 - "dependencies"
Cohesion: 0.04
Nodes (45): class-variance-authority, clsx, embla-carousel-react, @hookform/resolvers, lucide-react, next, @next/third-parties, dependencies (+37 more)

### Community 5 - "rx.ts"
Cohesion: 0.18
Nodes (14): lensTypeSchema, AXIS_STEPS, LensType, rxEyeSchema, rxSchema, rxSchemaForLensType(), SPH_STEPS, ok (+6 more)

### Community 6 - "devDependencies"
Cohesion: 0.06
Nodes (33): eslint, eslint-config-next, jsdom, devDependencies, eslint, eslint-config-next, jsdom, prettier (+25 more)

### Community 7 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 8 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 9 - "Product domain type"
Cohesion: 0.11
Nodes (20): Planned file structure (app/, lib/, content/, features/cart/, components/, tests/), Global constraints (Node 20+, TS strict, no hardcoded strings, no raw gtag, no data-fetching in ui/commerce components), Vivimoon Storefront Baseline Implementation Plan, Task 1: Scaffold project & tooling, Task 2: Testing setup (Vitest + RTL), Task 3: Utilities (cn, formatPrice), Task 4: Domain types, Task 5: Mock content (+12 more)

### Community 10 - "dialog.tsx"
Cohesion: 0.18
Nodes (6): DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogOverlay(), DialogTitle()

### Community 11 - "Coolmate.me Feature & Structure Analysis"
Cohesion: 0.12
Nodes (16): Screen-reader-only accessible text investment, Announcement bar (Coolmate), Blog / content-marketing hub, Care & Share CSR program, Community Threads (UGC/community hub), Cookie consent banner + preference center, CXP by Coolmate (custom-print sub-brand), Footer (contact, link columns, address, certifications) (+8 more)

### Community 12 - "i18n seam (locale-prefixed routes, getDictionary)"
Cohesion: 0.11
Nodes (19): Multi-language/locale switcher (topbar), Utility topbar (Coolmate), Task 7: i18n seam (config, dictionaries, middleware), Task 8: Analytics seam (GA4), Analytics seam (GA4 via typed track() wrapper), GA4 ecommerce events (view_item_list, select_item, view_item, add_to_cart, remove_from_cart, view_cart, begin_checkout, purchase), getDictionary(locale) function, @next/third-parties GoogleAnalytics component (+11 more)

### Community 13 - "Vivimoon Storefront Baseline Design Spec"
Cohesion: 0.24
Nodes (11): Gender filter toggle (in-place homepage filtering), Hero banner carousel (7 slides), Homepage structure (hero carousel, promo tiles, category grid), Product card component (hover-swap, swatches, badges, price), Themed collection sections with product carousels, Build sequence (13 high-level steps), Baseline goals (demoable bilingual storefront, clean seams, prop-driven components), Explicit non-goals (Rx upload, loyalty, real payment, real DB, auth, deferred with seams) (+3 more)

### Community 14 - "Cart (CartProvider context+reducer, localStorage persistence)"
Cohesion: 0.33
Nodes (7): Cart page (/cart route), Task 10: shadcn/ui primitives, Task 11: Commerce primitives (PriceTag, RatingStars, ProductCard), Task 9: Cart feature (reducer, storage, context, hook), Cart (CartProvider context+reducer, localStorage persistence), CartProvider, useCart() hook

### Community 15 - "Product Detail Page (PDP) structure"
Cohesion: 0.15
Nodes (13): Color variants as distinct URLs (?color=slug) for SEO/deep-linking, CoolClub loyalty program + CoolCash currency, Fabric-technology brand system (cross-cutting taxonomy: CoolDry, CoolSoft, CoolRib, CoolFlex, ZeroMark), Fit-feedback histogram (Tight/True-to-size/Loose) in reviews, Product Detail Page (PDP) structure, Task 16: PDP components (Gallery, VariantSelector, SpecTable, ReviewsList), Task 17: PDP page + Add-to-cart, Task 18: Cart page + line item + order summary (+5 more)

### Community 16 - "Two-tier component architecture (ui/ vs commerce/)"
Cohesion: 0.15
Nodes (14): Task 12: Carousels & CategoryGrid, Task 13: Layout chrome (AnnouncementBar, Header, MegaNav, LocaleSwitcher, Footer), Task 14: Home page, Task 15: Collection listing page + filters, CartLineItem component, CategoryGrid component, CollectionCarousel component, Two-tier component architecture (ui/ vs commerce/) (+6 more)

### Community 17 - "Vivimoon — Client Scope Design Spec"
Cohesion: 0.13
Nodes (15): 10. Feature Notes, 11. Blocked Items, 12. Testing, 13. Milestones, 14. Files Removed or Changed, 2. Feature Scope, 4. API Contract, 6. Domain Model Additions (+7 more)

### Community 18 - "Vivimoon M2 — Purchase Core Implementation Plan"
Cohesion: 0.11
Nodes (19): File Structure, Global Constraints, M2 Definition of Done, Scope note: why `cyl`/`axis` exist in the schema but not the UI, Task 10: Order placement, Task 11: Guest → member cart merge, Task 12: Buy Now, Task 13: M2 verification (+11 more)

### Community 19 - "AGENTS.md: This is NOT the Next.js you know"
Cohesion: 0.40
Nodes (5): Breaking-changes warning for this Next.js version, node_modules/next/dist/server/lib/generate-agent-files.js, node_modules/next/dist/docs/ (Next.js version-specific docs), AGENTS.md: This is NOT the Next.js you know, Project CLAUDE.md (imports AGENTS.md)

### Community 20 - "Torica Biweekly Product Image (Blank Placeholder)"
Cohesion: 0.50
Nodes (4): Torica Biweekly Product Image (Blank Placeholder), Biweekly Variant/Frequency Concept, Empty/Unrendered Placeholder Asset, Torica Product Line

### Community 21 - "Cat Colored (blank placeholder image)"
Cohesion: 0.67
Nodes (3): Cat Colored (blank placeholder image), Cat Product Imagery (implied by filename), Placeholder/Empty Image Asset

### Community 22 - "Aqua Daily 2 (Placeholder Image)"
Cohesion: 0.67
Nodes (3): Aqua Daily 2 (Placeholder Image), Blank Placeholder Graphic, Aqua Daily Product Line

### Community 23 - "Breeze Daily 1 (Placeholder Image)"
Cohesion: 0.67
Nodes (3): Breeze Daily 1 (Placeholder Image), Placeholder Product Image, Breeze Daily Product Line

### Community 24 - "Breeze Daily 2 (Blank Placeholder Image)"
Cohesion: 0.67
Nodes (3): Breeze Daily 2 (Blank Placeholder Image), Breeze Daily Product Line, Placeholder/Empty Image Asset

### Community 25 - "FocalPro Monthly Product Image (Blank Placeholder)"
Cohesion: 0.67
Nodes (3): FocalPro Monthly Product Image (Blank Placeholder), FocalPro Product (Monthly Plan), Blank Placeholder Image Asset

### Community 26 - "hazel-monthly-1.jpg (blank placeholder image)"
Cohesion: 0.67
Nodes (3): hazel-monthly-1.jpg (blank placeholder image), Hazel Monthly Product (inferred subscription/monthly product line), Placeholder / Blank Image Concept

### Community 27 - "Ocean Biweekly Product Image 1 (Blank Placeholder)"
Cohesion: 0.67
Nodes (3): Ocean Biweekly Product Image 1 (Blank Placeholder), Ocean Biweekly Product, Blank Placeholder Image Concept

### Community 28 - "Ocean Biweekly Product Image 2 (Blank Placeholder)"
Cohesion: 0.67
Nodes (3): Ocean Biweekly Product Image 2 (Blank Placeholder), Ocean Product Line (Biweekly Variant), Blank/Placeholder Image Concept

### Community 29 - "Torica Monthly Product Photo 2 (blank placeholder)"
Cohesion: 0.67
Nodes (3): Torica Monthly Product Photo 2 (blank placeholder), Blank Placeholder Image Asset, Torica Monthly Product

### Community 52 - "Vivimoon M1 — Foundation Implementation Plan"
Cohesion: 0.11
Nodes (18): File Structure, Global Constraints, M1 Definition of Done, Task 10: Browser API client, session sync, and the sign-in / sign-up pages, Task 11: Forgot-password OTP flow, Task 12: Account resource and route handlers, Task 13: Account page, route guards, and M1 verification, Task 1: API config and response envelope (+10 more)

### Community 53 - "cart-store.test.ts"
Cohesion: 0.21
Nodes (10): makeLine(), freshStore(), makeLine(), rxA, rxB, RxInput, EYE_FIELDS, eyeToken() (+2 more)

### Community 54 - "cart-reducer.test.ts"
Cohesion: 0.20
Nodes (15): cartCount(), cartReducer(), atA, atB, empty, plain, rxA, rxB (+7 more)

### Community 55 - "sheet.tsx"
Cohesion: 0.18
Nodes (9): Sheet(), SheetClose(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle() (+1 more)

### Community 56 - "catalog.ts"
Cohesion: 0.06
Nodes (39): dict, dict, product, VariantSelector(), collections, products, reviews, MockUser (+31 more)

### Community 57 - "common.ts"
Cohesion: 0.18
Nodes (8): BASELINE_LINES, pricedCartSchema, ApiError, apiErrorSchema, ERROR_CODES, ErrorCode, HTTP_STATUS, okEnvelopeSchema

### Community 58 - "dictionaries.ts"
Cohesion: 0.06
Nodes (57): AccountPage(), fetchAccount(), ForgotPasswordPage(), SignInPage(), SignUpPage(), CartPage(), SuccessPage(), CollectionPage() (+49 more)

### Community 59 - "fetch.ts"
Cohesion: 0.22
Nodes (9): upstreamBaseUrl(), upstreamTimeoutMs(), envelopeSchema(), Envelope, upstreamFetch(), UpstreamRequestError, parseOrThrow(), schema (+1 more)

### Community 60 - "api/config.ts"
Cohesion: 0.27
Nodes (9): ApiMode, DEPENDS_ON, isAnyUpstream(), rawMode(), readMode(), resolveMode(), ResourceName, RESOURCES (+1 more)

### Community 61 - "app/layout.tsx"
Cohesion: 0.33
Nodes (4): geistMono, geistSans, metadata, CartHydrator()

### Community 62 - "pricing/mock.ts"
Cohesion: 0.19
Nodes (11): pricing, bestVoucher(), mockPricing, Pricing, PricingError, BASELINE_LINES, voucherApplies(), voucherDiscount() (+3 more)

### Community 63 - "cn.ts"
Cohesion: 0.20
Nodes (6): HeroCarousel(), Slide, QuantityStepper(), Badge(), badgeVariants, Skeleton()

### Community 64 - "collection-filters.tsx"
Cohesion: 0.17
Nodes (14): CollectionFilters(), REPLACEMENTS, SORTS, TYPES, Select(), SelectContent(), SelectGroup(), SelectItem() (+6 more)

### Community 65 - "product/[slug]/page.tsx"
Cohesion: 0.20
Nodes (11): ProductGallery(), RatingStars(), ReviewsList(), SpecTable(), Breadcrumb(), BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink() (+3 more)

### Community 66 - "cart.ts"
Cohesion: 0.14
Nodes (13): cartLineSchema, cartStateSchema, priceCartRequestSchema, pricedLineSchema, PriceLineInput, priceLineInputSchema, Voucher, voucherSchema (+5 more)

### Community 67 - "M1 Foundation — progress ledger"
Cohesion: 0.50
Nodes (3): M1 Foundation — progress ledger, M2 Task 5 — RxSelector and Rx-aware add-to-cart (2026-08-31), M2 Task 6 — Server-owned pricing and auto-voucher (2026-08-31)

### Community 68 - "cn"
Cohesion: 0.20
Nodes (15): Accordion(), AccordionContent(), AccordionItem(), AccordionTrigger(), AlertAction(), FieldContent(), FieldDescription(), FieldLegend() (+7 more)

### Community 69 - "order-summary.tsx"
Cohesion: 0.36
Nodes (7): Card(), CardAction(), CardContent(), CardDescription(), CardFooter(), CardHeader(), CardTitle()

### Community 70 - "rx-summary.tsx"
Cohesion: 0.38
Nodes (6): EyeFields(), eyeSummary(), RxSummary(), Rx, RxEye, formatSph()

### Community 71 - "tabs.tsx"
Cohesion: 0.40
Nodes (5): Tabs(), TabsContent(), TabsList(), tabsListVariants, TabsTrigger()

### Community 72 - "5. Migration Strategy"
Cohesion: 0.33
Nodes (6): 5. Migration Strategy, Adapting drift, Conformance suite, Cutover order, Per-resource cutover, Runtime validation

### Community 73 - "1. Overview"
Cohesion: 0.50
Nodes (4): 1. Overview, Baseline non-goals now in scope, Goals, Non-goals

### Community 75 - "15. Decisions and Open Questions"
Cohesion: 0.67
Nodes (3): 15. Decisions and Open Questions, Resolved — 2026-08-27, Resolved — 2026-08-30

### Community 76 - "3. Architecture — the proxy seam"
Cohesion: 0.67
Nodes (3): 3. Architecture — the proxy seam, Configuration, Resource layout

## Ambiguous Edges - Review These
- `Empty/Unrendered Placeholder Asset` → `Torica Biweekly Product Image (Blank Placeholder)`  [AMBIGUOUS]
  public/images/products/torica-biweekly-1.jpg · relation: conceptually_related_to
- `Cat Product Imagery (implied by filename)` → `Cat Colored (blank placeholder image)`  [AMBIGUOUS]
  public/images/cat-colored.jpg · relation: conceptually_related_to
- `Placeholder Product Image` → `Breeze Daily 1 (Placeholder Image)`  [AMBIGUOUS]
  public/images/products/breeze-daily-1.jpg · relation: conceptually_related_to
- `Placeholder / Blank Image Concept` → `hazel-monthly-1.jpg (blank placeholder image)`  [AMBIGUOUS]
  public/images/products/hazel-monthly-1.jpg · relation: conceptually_related_to
- `Ocean Biweekly Product` → `Ocean Biweekly Product Image 1 (Blank Placeholder)`  [AMBIGUOUS]
  public/images/products/ocean-biweekly-1.jpg · relation: conceptually_related_to
- `Hazel Monthly Product Line` → `Hazel Monthly Product Photo 2 (Blank/Placeholder)`  [AMBIGUOUS]
  public/images/products/hazel-monthly-2.jpg · relation: conceptually_related_to
- `Placeholder/Blank Product Image` → `Torica Monthly Product Image (Blank Placeholder)`  [AMBIGUOUS]
  public/images/products/torica-monthly-1.jpg · relation: conceptually_related_to
- `Placeholder/Empty Image Content` → `cat-daily.jpg (blank placeholder image)`  [AMBIGUOUS]
  public/images/cat-daily.jpg · relation: conceptually_related_to
- `Blank Placeholder Image Concept` → `FocalPro Daily Product Image (Placeholder)`  [AMBIGUOUS]
  public/images/products/focalpro-daily-1.jpg · relation: conceptually_related_to
- `Placeholder/Empty Image Asset` → `Mystic Daily Product Image (Placeholder)`  [AMBIGUOUS]
  public/images/products/mystic-daily-1.jpg · relation: semantically_similar_to

## Knowledge Gaps
- **316 isolated node(s):** `Stage`, `push`, `push`, `user`, `jar` (+311 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Empty/Unrendered Placeholder Asset` and `Torica Biweekly Product Image (Blank Placeholder)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Cat Product Imagery (implied by filename)` and `Cat Colored (blank placeholder image)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Placeholder Product Image` and `Breeze Daily 1 (Placeholder Image)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Placeholder / Blank Image Concept` and `hazel-monthly-1.jpg (blank placeholder image)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Ocean Biweekly Product` and `Ocean Biweekly Product Image 1 (Blank Placeholder)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Hazel Monthly Product Line` and `Hazel Monthly Product Photo 2 (Blank/Placeholder)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Placeholder/Blank Product Image` and `Torica Monthly Product Image (Blank Placeholder)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._