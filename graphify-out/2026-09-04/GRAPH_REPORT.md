# Graph Report - vivimoon-web-app  (2026-09-03)

## Corpus Check
- 253 files · ~105,373 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1269 nodes · 2958 edges · 96 communities (69 shown, 27 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 27 edges (avg confidence: 0.76)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1d56c59f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- dictionaries.ts
- response.ts
- checkout/page.tsx
- payments.ts
- shipping/index.ts
- cart-store.ts
- auth.ts
- dependencies
- Vivimoon M2 — Purchase Core Implementation Plan
- rx-selector.tsx
- devDependencies
- Vivimoon — Client Scope Design Spec
- compilerOptions
- components.json
- catalog.ts
- mock/index.ts
- Product domain type
- tabs.tsx
- i18n seam (locale-prefixed routes, getDictionary)
- collection-filters.tsx
- Coolmate.me Feature & Structure Analysis
- pricing/mock.ts
- product/[slug]/page.tsx
- schemas/orders.ts
- Two-tier component architecture (ui/ vs commerce/)
- Product Detail Page (PDP) structure
- sheet.tsx
- common.ts
- cn
- dialog.tsx
- Vivimoon Storefront Baseline Design Spec
- apiFail
- Placeholder/Empty Image Asset
- Cart (CartProvider context+reducer, localStorage persistence)
- Blank Placeholder Image Concept
- AGENTS.md: This is NOT the Next.js you know
- FocalPro Monthly Product Image (Blank Placeholder)
- orders/mock.ts
- Aqua Daily 2 (Placeholder Image)
- Torica Biweekly Product Image (Blank Placeholder)
- hazel-monthly-1.jpg (blank placeholder image)
- Hazel Monthly Product Line
- Placeholder/Blank Product Image
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs
- cat-daily.jpg (blank placeholder image)
- Hero 1 Placeholder Image
- Hero 2 Placeholder Image
- Placeholder Image (Solid Light Blue-Gray)
- FocalPro Monthly Product Image 2 (Blank Placeholder)
- Theming seam (CSS custom properties, Tailwind v4 @theme)
- cat-best.jpg (blank placeholder image)
- FocalPro Daily 2 (Blank Placeholder Image)
- Mystic Daily Product Image 2 (Blank Placeholder)
- Torica Biweekly Product Image 2 (Blank Placeholder)
- M1 Foundation — progress ledger
- Issue tracker: GitHub
- rx.ts
- Domain Docs
- orders/route.test.ts
- cn.ts
- triage-labels.md
- Vivimoon
- account/mock.ts
- add-to-cart.tsx
- cookie.ts
- loyalty/mock.ts
- api/config.ts
- cart.ts
- checkout.ts
- Vivimoon M1 — Foundation Implementation Plan
- apiOk
- scripts
- events.ts
- order-status-timeline.tsx
- addresses-routes.test.ts
- 5. Migration Strategy
- intent/route.ts
- 1. Overview
- 15. Decisions and Open Questions
- 3. Architecture — the proxy seam
- embla-carousel-react
- lucide-react
- radix-ui
- react-hook-form
- prettier
- @testing-library/react
- @types/node
- @vitejs/plugin-react

## God Nodes (most connected - your core abstractions)
1. `cn()` - 107 edges
2. `apiOk()` - 60 edges
3. `getDictionary()` - 49 edges
4. `apiFail()` - 44 edges
5. `readSessionUserId()` - 43 edges
6. `isLocale()` - 40 edges
7. `Locale` - 33 edges
8. `parseBody()` - 32 edges
9. `Dictionary` - 29 edges
10. `Vivimoon M2 — Purchase Core Implementation Plan` - 19 edges

## Surprising Connections (you probably didn't know these)
- `README.md: Vivimoon Next.js project README` --semantically_similar_to--> `Tech stack (Next.js App Router, React 19, TS strict, Tailwind v4, shadcn/ui, embla, RHF+zod, GA4, Vitest)`  [INFERRED] [semantically similar]
  README.md → docs/superpowers/specs/2026-08-16-vivimoon-storefront-baseline-design.md
- `BreadcrumbEllipsis()` --calls--> `cn()`  [EXTRACTED]
  components/ui/breadcrumb.tsx → lib/utils/cn.ts
- `DialogOverlay()` --calls--> `cn()`  [EXTRACTED]
  components/ui/dialog.tsx → lib/utils/cn.ts
- `DialogContent()` --calls--> `cn()`  [EXTRACTED]
  components/ui/dialog.tsx → lib/utils/cn.ts
- `DialogHeader()` --calls--> `cn()`  [EXTRACTED]
  components/ui/dialog.tsx → lib/utils/cn.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Cart feature data flow: reducer, storage, context, hook composing CartProvider** — docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_cartprovider, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_usecart, docs_superpowers_plans_2026_08_16_vivimoon_storefront_baseline_task9_cart_feature [EXTRACTED 1.00]
- **Four swappable architecture seams (data, theming, i18n, analytics) isolating volatility** — docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_productrepository, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_theming_seam, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_i18n_seam, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_analytics_seam [EXTRACTED 1.00]
- **Coolmate apparel patterns re-modeled for Vivimoon contact-lens domain** — docs_research_coolmate_website_analysis_product_card, docs_research_coolmate_website_analysis_pdp, docs_research_coolmate_website_analysis_color_variant_url_pattern, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_productcard, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_variant [INFERRED 0.85]

## Communities (96 total, 27 thin omitted)

### Community 0 - "dictionaries.ts"
Cohesion: 0.06
Nodes (80): AddressesPage(), fetchAddresses(), FavoritesPage(), fetchFavorites(), fetchLoyalty(), formatDate(), LoyaltyPage(), fetchOrder() (+72 more)

### Community 1 - "response.ts"
Cohesion: 0.22
Nodes (15): jar, POST(), POST(), POST(), POST(), POST(), POST(), POST() (+7 more)

### Community 2 - "checkout/page.tsx"
Cohesion: 0.06
Nodes (47): AccountForm(), user, AddressDict, AddressesManager(), AddressForm(), EMPTY_FORM, FormState, ForgotPasswordForm() (+39 more)

### Community 3 - "payments.ts"
Cohesion: 0.13
Nodes (16): PaymentMethodPicker(), dict, payments, mockPayments, PaymentError, Payments, PaymentIntent, PaymentIntentRequest (+8 more)

### Community 4 - "shipping/index.ts"
Cohesion: 0.26
Nodes (7): defaultShippingOptions, shippingRates, shipping, mockShipping, Shipping, ShippingError, ShippingOption

### Community 5 - "cart-store.ts"
Cohesion: 0.07
Nodes (37): geistMono, geistSans, metadata, ORDER_RESPONSE, makeLine(), seedLastOrder(), dict, line (+29 more)

### Community 6 - "auth.ts"
Cohesion: 0.07
Nodes (30): jar, Auth, mockAuth, OtpRecord, otps, resetMockAuthState(), ResetRecord, resets (+22 more)

### Community 7 - "dependencies"
Cohesion: 0.08
Nodes (25): class-variance-authority, clsx, @hookform/resolvers, next, @next/third-parties, dependencies, class-variance-authority, clsx (+17 more)

### Community 8 - "Vivimoon M2 — Purchase Core Implementation Plan"
Cohesion: 0.11
Nodes (19): File Structure, Global Constraints, M2 Definition of Done, Scope note: why `cyl`/`axis` exist in the schema but not the UI, Task 10: Order placement, Task 11: Guest → member cart merge, Task 12: Buy Now, Task 13: M2 verification (+11 more)

### Community 9 - "rx-selector.tsx"
Cohesion: 0.17
Nodes (11): emptyRxDraft, EyeFields(), RxDraft, RxEyeDraft, RxRanges, RxSelector(), dict, FieldLegend() (+3 more)

### Community 10 - "devDependencies"
Cohesion: 0.08
Nodes (25): eslint, eslint-config-next, jsdom, devDependencies, eslint, eslint-config-next, jsdom, prettier-plugin-tailwindcss (+17 more)

### Community 11 - "Vivimoon — Client Scope Design Spec"
Cohesion: 0.13
Nodes (15): 10. Feature Notes, 11. Blocked Items, 12. Testing, 13. Milestones, 14. Files Removed or Changed, 2. Feature Scope, 4. API Contract, 6. Domain Model Additions (+7 more)

### Community 12 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 13 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 14 - "catalog.ts"
Cohesion: 0.10
Nodes (21): SpecTable(), Collection, collectionSchema, Currency, currencySchema, LensType, ProductBadge, productBadgeSchema (+13 more)

### Community 15 - "mock/index.ts"
Cohesion: 0.20
Nodes (10): collections, favorites, products, reviews, MockUser, users, Catalog, minPrice() (+2 more)

### Community 16 - "Product domain type"
Cohesion: 0.11
Nodes (20): Planned file structure (app/, lib/, content/, features/cart/, components/, tests/), Global constraints (Node 20+, TS strict, no hardcoded strings, no raw gtag, no data-fetching in ui/commerce components), Vivimoon Storefront Baseline Implementation Plan, Task 1: Scaffold project & tooling, Task 2: Testing setup (Vitest + RTL), Task 3: Utilities (cn, formatPrice), Task 4: Domain types, Task 5: Mock content (+12 more)

### Community 17 - "tabs.tsx"
Cohesion: 0.40
Nodes (5): Tabs(), TabsContent(), TabsList(), tabsListVariants, TabsTrigger()

### Community 18 - "i18n seam (locale-prefixed routes, getDictionary)"
Cohesion: 0.11
Nodes (19): Multi-language/locale switcher (topbar), Utility topbar (Coolmate), Task 7: i18n seam (config, dictionaries, middleware), Task 8: Analytics seam (GA4), Analytics seam (GA4 via typed track() wrapper), GA4 ecommerce events (view_item_list, select_item, view_item, add_to_cart, remove_from_cart, view_cart, begin_checkout, purchase), getDictionary(locale) function, @next/third-parties GoogleAnalytics component (+11 more)

### Community 19 - "collection-filters.tsx"
Cohesion: 0.17
Nodes (14): CollectionFilters(), REPLACEMENTS, SORTS, TYPES, Select(), SelectContent(), SelectGroup(), SelectItem() (+6 more)

### Community 20 - "Coolmate.me Feature & Structure Analysis"
Cohesion: 0.12
Nodes (16): Screen-reader-only accessible text investment, Announcement bar (Coolmate), Blog / content-marketing hub, Care & Share CSR program, Community Threads (UGC/community hub), Cookie consent banner + preference center, CXP by Coolmate (custom-print sub-brand), Footer (contact, link columns, address, certifications) (+8 more)

### Community 21 - "pricing/mock.ts"
Cohesion: 0.19
Nodes (10): pricing, bestVoucher(), mockPricing, Pricing, PricingError, BASELINE_LINES, voucherApplies(), voucherDiscount() (+2 more)

### Community 22 - "product/[slug]/page.tsx"
Cohesion: 0.20
Nodes (11): FavoriteButton(), ProductGallery(), RatingStars(), ReviewsList(), Breadcrumb(), BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink() (+3 more)

### Community 23 - "schemas/orders.ts"
Cohesion: 0.12
Nodes (15): HOME_ADDRESS, OFFICE_ADDRESS, orders, userSchema, priceLineInputSchema, voucherSchema, OrderLine, orderLineSchema (+7 more)

### Community 24 - "Two-tier component architecture (ui/ vs commerce/)"
Cohesion: 0.15
Nodes (14): Task 12: Carousels & CategoryGrid, Task 13: Layout chrome (AnnouncementBar, Header, MegaNav, LocaleSwitcher, Footer), Task 14: Home page, Task 15: Collection listing page + filters, CartLineItem component, CategoryGrid component, CollectionCarousel component, Two-tier component architecture (ui/ vs commerce/) (+6 more)

### Community 25 - "Product Detail Page (PDP) structure"
Cohesion: 0.15
Nodes (13): Color variants as distinct URLs (?color=slug) for SEO/deep-linking, CoolClub loyalty program + CoolCash currency, Fabric-technology brand system (cross-cutting taxonomy: CoolDry, CoolSoft, CoolRib, CoolFlex, ZeroMark), Fit-feedback histogram (Tight/True-to-size/Loose) in reviews, Product Detail Page (PDP) structure, Task 16: PDP components (Gallery, VariantSelector, SpecTable, ReviewsList), Task 17: PDP page + Add-to-cart, Task 18: Cart page + line item + order summary (+5 more)

### Community 26 - "sheet.tsx"
Cohesion: 0.18
Nodes (9): Sheet(), SheetClose(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle() (+1 more)

### Community 27 - "common.ts"
Cohesion: 0.10
Nodes (19): BASELINE_LINES, RESOURCES, saved, upstreamBaseUrl(), upstreamTimeoutMs(), pricedCartSchema, ApiError, apiErrorSchema (+11 more)

### Community 28 - "cn"
Cohesion: 0.15
Nodes (17): Accordion(), AccordionContent(), AccordionItem(), AccordionTrigger(), AlertAction(), CardAction(), CardDescription(), CardFooter() (+9 more)

### Community 29 - "dialog.tsx"
Cohesion: 0.18
Nodes (6): DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogOverlay(), DialogTitle()

### Community 30 - "Vivimoon Storefront Baseline Design Spec"
Cohesion: 0.24
Nodes (11): Gender filter toggle (in-place homepage filtering), Hero banner carousel (7 slides), Homepage structure (hero carousel, promo tiles, category grid), Product card component (hover-swap, swatches, badges, price), Themed collection sections with product carousels, Build sequence (13 high-level steps), Baseline goals (demoable bilingual storefront, clean seams, prop-driven components), Explicit non-goals (Rx upload, loyalty, real payment, real DB, auth, deferred with seams) (+3 more)

### Community 31 - "apiFail"
Cohesion: 0.18
Nodes (19): addressErrorResponse(), DELETE(), PATCH(), GET(), POST(), DELETE(), GET(), POST() (+11 more)

### Community 32 - "Placeholder/Empty Image Asset"
Cohesion: 0.25
Nodes (8): Cat Colored (blank placeholder image), Cat Product Imagery (implied by filename), Placeholder/Empty Image Asset, Breeze Daily 1 (Placeholder Image), Placeholder Product Image, Breeze Daily Product Line, Breeze Daily 2 (Blank Placeholder Image), Mystic Daily Product Image (Placeholder)

### Community 33 - "Cart (CartProvider context+reducer, localStorage persistence)"
Cohesion: 0.33
Nodes (7): Cart page (/cart route), Task 10: shadcn/ui primitives, Task 11: Commerce primitives (PriceTag, RatingStars, ProductCard), Task 9: Cart feature (reducer, storage, context, hook), Cart (CartProvider context+reducer, localStorage persistence), CartProvider, useCart() hook

### Community 34 - "Blank Placeholder Image Concept"
Cohesion: 0.33
Nodes (6): FocalPro Daily Product Image (Placeholder), Ocean Biweekly Product Image 1 (Blank Placeholder), Ocean Biweekly Product, Blank Placeholder Image Concept, Ocean Biweekly Product Image 2 (Blank Placeholder), Ocean Product Line (Biweekly Variant)

### Community 35 - "AGENTS.md: This is NOT the Next.js you know"
Cohesion: 0.40
Nodes (5): Breaking-changes warning for this Next.js version, node_modules/next/dist/server/lib/generate-agent-files.js, node_modules/next/dist/docs/ (Next.js version-specific docs), AGENTS.md: This is NOT the Next.js you know, Project CLAUDE.md (imports AGENTS.md)

### Community 36 - "FocalPro Monthly Product Image (Blank Placeholder)"
Cohesion: 0.40
Nodes (5): FocalPro Monthly Product Image (Blank Placeholder), FocalPro Product (Monthly Plan), Blank Placeholder Image Asset, Torica Monthly Product Photo 2 (blank placeholder), Torica Monthly Product

### Community 37 - "orders/mock.ts"
Cohesion: 0.13
Nodes (14): jar, mockOrders, Orders, randomId(), randomOrderCode(), randomSuffix(), randomTrackingToken(), resetMockOrdersState() (+6 more)

### Community 38 - "Aqua Daily 2 (Placeholder Image)"
Cohesion: 0.50
Nodes (4): Aqua Daily 1 (placeholder image), Aqua Daily 2 (Placeholder Image), Blank Placeholder Graphic, Aqua Daily Product Line

### Community 39 - "Torica Biweekly Product Image (Blank Placeholder)"
Cohesion: 0.50
Nodes (4): Torica Biweekly Product Image (Blank Placeholder), Biweekly Variant/Frequency Concept, Empty/Unrendered Placeholder Asset, Torica Product Line

### Community 40 - "hazel-monthly-1.jpg (blank placeholder image)"
Cohesion: 0.67
Nodes (3): hazel-monthly-1.jpg (blank placeholder image), Hazel Monthly Product (inferred subscription/monthly product line), Placeholder / Blank Image Concept

### Community 61 - "M1 Foundation — progress ledger"
Cohesion: 0.25
Nodes (7): M1 Foundation — progress ledger, M2 Task 11 — Guest → member cart merge (2026-09-02), M2 Task 12 — Buy Now (2026-09-02), M2 Task 13 — M2 verification (2026-09-02), M2 Task 5 — RxSelector and Rx-aware add-to-cart (2026-08-31), M2 Task 6 — Server-owned pricing and auto-voucher (2026-08-31), M2 Task 7 — Cart page renders server prices (2026-08-31)

### Community 62 - "Issue tracker: GitHub"
Cohesion: 0.29
Nodes (6): Conventions, Issue tracker: GitHub, Pull requests as a triage surface, Wayfinding operations, When a skill says "fetch the relevant ticket", When a skill says "publish to the issue tracker"

### Community 63 - "rx.ts"
Cohesion: 0.16
Nodes (15): lensTypeSchema, AXIS_STEPS, LensType, Rx, RxEye, rxEyeSchema, rxSchema, SPH_STEPS (+7 more)

### Community 64 - "Domain Docs"
Cohesion: 0.33
Nodes (5): Before exploring, read these, Domain Docs, File structure, Flag ADR conflicts, Use the glossary's vocabulary

### Community 65 - "orders/route.test.ts"
Cohesion: 0.29
Nodes (3): ADDRESS, BASELINE_LINES, jar

### Community 66 - "cn.ts"
Cohesion: 0.20
Nodes (6): HeroCarousel(), Slide, QuantityStepper(), Badge(), badgeVariants, Label()

### Community 69 - "account/mock.ts"
Cohesion: 0.10
Nodes (16): GET(), PATCH(), addresses, Account, AddressError, addressStore, favoriteStore, mockAccount (+8 more)

### Community 70 - "add-to-cart.tsx"
Cohesion: 0.16
Nodes (14): AddToCart(), dict, push, PriceTag(), minVariant(), ProductCard(), product, dict (+6 more)

### Community 71 - "cookie.ts"
Cohesion: 0.11
Nodes (12): jar, POST(), BASELINE_LINES, jar, jar, secret(), SESSION_COOKIE, sessionCookieOptions() (+4 more)

### Community 72 - "loyalty/mock.ts"
Cohesion: 0.10
Nodes (12): jar, ADDRESS, jar, LINES, loyaltyHistory, Loyalty, mockLoyalty, store (+4 more)

### Community 73 - "api/config.ts"
Cohesion: 0.14
Nodes (14): GET(), POST(), GET(), GUEST_ADDRESS, placeGuestOrder(), ApiMode, DEPENDS_ON, isAnyUpstream() (+6 more)

### Community 74 - "cart.ts"
Cohesion: 0.13
Nodes (15): vouchers, vouchers, mockVouchers, Vouchers, cartLineSchema, cartStateSchema, priceCartRequestSchema, PriceLineInput (+7 more)

### Community 75 - "checkout.ts"
Cohesion: 0.12
Nodes (14): ADDRESS, LINES, pricedLineSchema, Address, addressLabelSchema, addressSchema, shippingOptionSchema, ShippingQuoteRequest (+6 more)

### Community 76 - "Vivimoon M1 — Foundation Implementation Plan"
Cohesion: 0.11
Nodes (18): File Structure, Global Constraints, M1 Definition of Done, Task 10: Browser API client, session sync, and the sign-in / sign-up pages, Task 11: Forgot-password OTP flow, Task 12: Account resource and route handlers, Task 13: Account page, route guards, and M1 verification, Task 1: API config and response envelope (+10 more)

### Community 77 - "apiOk"
Cohesion: 0.31
Nodes (7): GET(), GET(), GET(), GET(), GET(), catalog, apiOk()

### Community 78 - "scripts"
Cohesion: 0.15
Nodes (12): name, private, scripts, build, dev, lint, start, test (+4 more)

### Community 79 - "events.ts"
Cohesion: 0.36
Nodes (5): Gtag, product, track(), AnalyticsEvent, Ga4Item

### Community 80 - "order-status-timeline.tsx"
Cohesion: 0.33
Nodes (5): OrderStatusTimeline(), PROGRESSION, TERMINAL_DISTINCT, ORDER_STATUSES, OrderStatus

### Community 82 - "5. Migration Strategy"
Cohesion: 0.33
Nodes (6): 5. Migration Strategy, Adapting drift, Conformance suite, Cutover order, Per-resource cutover, Runtime validation

### Community 84 - "1. Overview"
Cohesion: 0.50
Nodes (4): 1. Overview, Baseline non-goals now in scope, Goals, Non-goals

### Community 86 - "15. Decisions and Open Questions"
Cohesion: 0.67
Nodes (3): 15. Decisions and Open Questions, Resolved — 2026-08-27, Resolved — 2026-08-30

### Community 87 - "3. Architecture — the proxy seam"
Cohesion: 0.67
Nodes (3): 3. Architecture — the proxy seam, Configuration, Resource layout

## Ambiguous Edges - Review These
- `Cat Product Imagery (implied by filename)` → `Cat Colored (blank placeholder image)`  [AMBIGUOUS]
  public/images/cat-colored.jpg · relation: conceptually_related_to
- `Placeholder/Empty Image Asset` → `Mystic Daily Product Image (Placeholder)`  [AMBIGUOUS]
  public/images/products/mystic-daily-1.jpg · relation: semantically_similar_to
- `Placeholder Product Image` → `Breeze Daily 1 (Placeholder Image)`  [AMBIGUOUS]
  public/images/products/breeze-daily-1.jpg · relation: conceptually_related_to
- `Ocean Biweekly Product` → `Ocean Biweekly Product Image 1 (Blank Placeholder)`  [AMBIGUOUS]
  public/images/products/ocean-biweekly-1.jpg · relation: conceptually_related_to
- `Blank Placeholder Image Concept` → `FocalPro Daily Product Image (Placeholder)`  [AMBIGUOUS]
  public/images/products/focalpro-daily-1.jpg · relation: conceptually_related_to
- `Empty/Unrendered Placeholder Asset` → `Torica Biweekly Product Image (Blank Placeholder)`  [AMBIGUOUS]
  public/images/products/torica-biweekly-1.jpg · relation: conceptually_related_to
- `Placeholder / Blank Image Concept` → `hazel-monthly-1.jpg (blank placeholder image)`  [AMBIGUOUS]
  public/images/products/hazel-monthly-1.jpg · relation: conceptually_related_to
- `Hazel Monthly Product Line` → `Hazel Monthly Product Photo 2 (Blank/Placeholder)`  [AMBIGUOUS]
  public/images/products/hazel-monthly-2.jpg · relation: conceptually_related_to
- `Placeholder/Blank Product Image` → `Torica Monthly Product Image (Blank Placeholder)`  [AMBIGUOUS]
  public/images/products/torica-monthly-1.jpg · relation: conceptually_related_to
- `Placeholder/Empty Image Content` → `cat-daily.jpg (blank placeholder image)`  [AMBIGUOUS]
  public/images/cat-daily.jpg · relation: conceptually_related_to

## Knowledge Gaps
- **373 isolated node(s):** `Stage`, `push`, `push`, `user`, `AddressDict` (+368 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **27 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Cat Product Imagery (implied by filename)` and `Cat Colored (blank placeholder image)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Placeholder/Empty Image Asset` and `Mystic Daily Product Image (Placeholder)`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **What is the exact relationship between `Placeholder Product Image` and `Breeze Daily 1 (Placeholder Image)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Ocean Biweekly Product` and `Ocean Biweekly Product Image 1 (Blank Placeholder)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Blank Placeholder Image Concept` and `FocalPro Daily Product Image (Placeholder)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Empty/Unrendered Placeholder Asset` and `Torica Biweekly Product Image (Blank Placeholder)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Placeholder / Blank Image Concept` and `hazel-monthly-1.jpg (blank placeholder image)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._