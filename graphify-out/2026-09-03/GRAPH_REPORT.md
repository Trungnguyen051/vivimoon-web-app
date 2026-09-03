# Graph Report - vivimoon-web-app  (2026-09-02)

## Corpus Check
- 211 files · ~94,145 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1085 nodes · 2337 edges · 66 communities (51 shown, 15 thin omitted)
- Extraction: 98% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 27 edges (avg confidence: 0.76)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `69e663d4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- dictionaries.ts
- apiOk
- checkout/page.tsx
- payments.ts
- checkout.ts
- cart-store.ts
- auth.ts
- dependencies
- Vivimoon M2 — Purchase Core Implementation Plan
- rx.ts
- devDependencies
- Vivimoon — Client Scope Design Spec
- compilerOptions
- components.json
- catalog.ts
- mock/index.ts
- Product domain type
- cn
- i18n seam (locale-prefixed routes, getDictionary)
- collection-filters.tsx
- Coolmate.me Feature & Structure Analysis
- pricing/mock.ts
- product/[slug]/page.tsx
- cart.ts
- Two-tier component architecture (ui/ vs commerce/)
- Product Detail Page (PDP) structure
- mobile-nav.tsx
- common.ts
- cn.ts
- dialog.tsx
- Vivimoon Storefront Baseline Design Spec
- order-summary.tsx
- Placeholder/Empty Image Asset
- Cart (CartProvider context+reducer, localStorage persistence)
- Blank Placeholder Image Concept
- AGENTS.md: This is NOT the Next.js you know
- FocalPro Monthly Product Image (Blank Placeholder)
- M1 Foundation — progress ledger
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
- orders/mock.ts
- api/config.ts
- payment-method-picker.tsx
- orders/route.test.ts
- validate.ts

## God Nodes (most connected - your core abstractions)
1. `cn()` - 103 edges
2. `apiOk()` - 38 edges
3. `getDictionary()` - 33 edges
4. `parseBody()` - 24 edges
5. `Locale` - 24 edges
6. `isLocale()` - 24 edges
7. `apiFail()` - 23 edges
8. `Dictionary` - 23 edges
9. `Vivimoon M2 — Purchase Core Implementation Plan` - 19 edges
10. `Vivimoon M1 — Foundation Implementation Plan` - 18 edges

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

## Communities (66 total, 15 thin omitted)

### Community 0 - "dictionaries.ts"
Cohesion: 0.05
Nodes (65): AccountPage(), fetchAccount(), ForgotPasswordPage(), SignInPage(), SignUpPage(), CartPage(), CheckoutPage(), SuccessPage() (+57 more)

### Community 1 - "apiOk"
Cohesion: 0.09
Nodes (40): jar, GET(), PATCH(), jar, POST(), POST(), POST(), POST() (+32 more)

### Community 2 - "checkout/page.tsx"
Cohesion: 0.07
Nodes (39): AccountForm(), user, ForgotPasswordForm(), reportServer(), requestCode(), submitPassword(), verifyCode(), Stage (+31 more)

### Community 3 - "payments.ts"
Cohesion: 0.16
Nodes (11): payments, mockPayments, PaymentError, Payments, PaymentIntent, PaymentIntentRequest, paymentIntentRequestSchema, paymentIntentSchema (+3 more)

### Community 4 - "checkout.ts"
Cohesion: 0.13
Nodes (13): ADDRESS, LINES, defaultShippingOptions, mockShipping, Shipping, ShippingError, Address, addressSchema (+5 more)

### Community 5 - "cart-store.ts"
Cohesion: 0.06
Nodes (39): geistMono, geistSans, metadata, mockedApiRequest, track, ORDER_RESPONSE, makeLine(), seedLastOrder() (+31 more)

### Community 6 - "auth.ts"
Cohesion: 0.05
Nodes (40): account, Account, mockAccount, Auth, mockAuth, OtpRecord, otps, resetMockAuthState() (+32 more)

### Community 7 - "dependencies"
Cohesion: 0.06
Nodes (33): class-variance-authority, clsx, embla-carousel-react, @hookform/resolvers, lucide-react, next, @next/third-parties, dependencies (+25 more)

### Community 8 - "Vivimoon M2 — Purchase Core Implementation Plan"
Cohesion: 0.05
Nodes (37): File Structure, Global Constraints, M1 Definition of Done, Task 10: Browser API client, session sync, and the sign-in / sign-up pages, Task 11: Forgot-password OTP flow, Task 12: Account resource and route handlers, Task 13: Account page, route guards, and M1 verification, Task 1: API config and response envelope (+29 more)

### Community 9 - "rx.ts"
Cohesion: 0.09
Nodes (27): emptyRxDraft, EyeFields(), RxDraft, RxEyeDraft, RxRanges, RxSelector(), dict, eyeSummary() (+19 more)

### Community 10 - "devDependencies"
Cohesion: 0.04
Nodes (45): eslint, eslint-config-next, jsdom, devDependencies, eslint, eslint-config-next, jsdom, prettier (+37 more)

### Community 11 - "Vivimoon — Client Scope Design Spec"
Cohesion: 0.06
Nodes (31): 10. Feature Notes, 11. Blocked Items, 12. Testing, 13. Milestones, 14. Files Removed or Changed, 15. Decisions and Open Questions, 1. Overview, 2. Feature Scope (+23 more)

### Community 12 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 13 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 14 - "catalog.ts"
Cohesion: 0.11
Nodes (20): SpecTable(), Collection, collectionSchema, Currency, LensType, lensTypeSchema, ProductBadge, productBadgeSchema (+12 more)

### Community 15 - "mock/index.ts"
Cohesion: 0.15
Nodes (14): collections, products, reviews, shippingRates, MockUser, users, vouchers, Catalog (+6 more)

### Community 16 - "Product domain type"
Cohesion: 0.11
Nodes (20): Planned file structure (app/, lib/, content/, features/cart/, components/, tests/), Global constraints (Node 20+, TS strict, no hardcoded strings, no raw gtag, no data-fetching in ui/commerce components), Vivimoon Storefront Baseline Implementation Plan, Task 1: Scaffold project & tooling, Task 2: Testing setup (Vitest + RTL), Task 3: Utilities (cn, formatPrice), Task 4: Domain types, Task 5: Mock content (+12 more)

### Community 17 - "cn"
Cohesion: 0.17
Nodes (17): Accordion(), AccordionContent(), AccordionItem(), AccordionTrigger(), AlertAction(), FieldContent(), FieldDescription(), FieldSeparator() (+9 more)

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
Cohesion: 0.18
Nodes (11): pricing, bestVoucher(), mockPricing, Pricing, PricingError, BASELINE_LINES, voucherApplies(), voucherDiscount() (+3 more)

### Community 22 - "product/[slug]/page.tsx"
Cohesion: 0.23
Nodes (10): ProductGallery(), RatingStars(), ReviewsList(), Breadcrumb(), BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink(), BreadcrumbList() (+2 more)

### Community 23 - "cart.ts"
Cohesion: 0.08
Nodes (23): BASELINE_LINES, cartLineSchema, cartStateSchema, priceCartRequestSchema, pricedCartSchema, pricedLineSchema, PriceLineInput, priceLineInputSchema (+15 more)

### Community 24 - "Two-tier component architecture (ui/ vs commerce/)"
Cohesion: 0.15
Nodes (14): Task 12: Carousels & CategoryGrid, Task 13: Layout chrome (AnnouncementBar, Header, MegaNav, LocaleSwitcher, Footer), Task 14: Home page, Task 15: Collection listing page + filters, CartLineItem component, CategoryGrid component, CollectionCarousel component, Two-tier component architecture (ui/ vs commerce/) (+6 more)

### Community 25 - "Product Detail Page (PDP) structure"
Cohesion: 0.15
Nodes (13): Color variants as distinct URLs (?color=slug) for SEO/deep-linking, CoolClub loyalty program + CoolCash currency, Fabric-technology brand system (cross-cutting taxonomy: CoolDry, CoolSoft, CoolRib, CoolFlex, ZeroMark), Fit-feedback histogram (Tight/True-to-size/Loose) in reviews, Product Detail Page (PDP) structure, Task 16: PDP components (Gallery, VariantSelector, SpecTable, ReviewsList), Task 17: PDP page + Add-to-cart, Task 18: Cart page + line item + order summary (+5 more)

### Community 26 - "mobile-nav.tsx"
Cohesion: 0.18
Nodes (13): MegaNav(), MobileNav(), getNavItems(), NavItem, Sheet(), SheetClose(), SheetContent(), SheetDescription() (+5 more)

### Community 27 - "common.ts"
Cohesion: 0.16
Nodes (12): upstreamBaseUrl(), upstreamTimeoutMs(), ApiError, apiErrorSchema, envelopeSchema(), ERROR_CODES, ErrorCode, HTTP_STATUS (+4 more)

### Community 28 - "cn.ts"
Cohesion: 0.25
Nodes (5): HeroCarousel(), Slide, Badge(), badgeVariants, Skeleton()

### Community 29 - "dialog.tsx"
Cohesion: 0.18
Nodes (6): DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogOverlay(), DialogTitle()

### Community 30 - "Vivimoon Storefront Baseline Design Spec"
Cohesion: 0.24
Nodes (11): Gender filter toggle (in-place homepage filtering), Hero banner carousel (7 slides), Homepage structure (hero carousel, promo tiles, category grid), Product card component (hover-swap, swatches, badges, price), Themed collection sections with product carousels, Build sequence (13 high-level steps), Baseline goals (demoable bilingual storefront, clean seams, prop-driven components), Explicit non-goals (Rx upload, loyalty, real payment, real DB, auth, deferred with seams) (+3 more)

### Community 31 - "order-summary.tsx"
Cohesion: 0.24
Nodes (9): Footer(), Card(), CardAction(), CardContent(), CardDescription(), CardFooter(), CardHeader(), CardTitle() (+1 more)

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

### Community 37 - "M1 Foundation — progress ledger"
Cohesion: 0.25
Nodes (7): M1 Foundation — progress ledger, M2 Task 11 — Guest → member cart merge (2026-09-02), M2 Task 12 — Buy Now (2026-09-02), M2 Task 13 — M2 verification (2026-09-02), M2 Task 5 — RxSelector and Rx-aware add-to-cart (2026-08-31), M2 Task 6 — Server-owned pricing and auto-voucher (2026-08-31), M2 Task 7 — Cart page renders server prices (2026-08-31)

### Community 38 - "Aqua Daily 2 (Placeholder Image)"
Cohesion: 0.50
Nodes (4): Aqua Daily 1 (placeholder image), Aqua Daily 2 (Placeholder Image), Blank Placeholder Graphic, Aqua Daily Product Line

### Community 39 - "Torica Biweekly Product Image (Blank Placeholder)"
Cohesion: 0.50
Nodes (4): Torica Biweekly Product Image (Blank Placeholder), Biweekly Variant/Frequency Concept, Empty/Unrendered Placeholder Asset, Torica Product Line

### Community 40 - "hazel-monthly-1.jpg (blank placeholder image)"
Cohesion: 0.67
Nodes (3): hazel-monthly-1.jpg (blank placeholder image), Hazel Monthly Product (inferred subscription/monthly product line), Placeholder / Blank Image Concept

### Community 61 - "orders/mock.ts"
Cohesion: 0.21
Nodes (10): orders, mockOrders, OrderError, Orders, randomId(), randomOrderCode(), randomSuffix(), ADDRESS (+2 more)

### Community 62 - "api/config.ts"
Cohesion: 0.27
Nodes (9): ApiMode, DEPENDS_ON, isAnyUpstream(), rawMode(), readMode(), resolveMode(), ResourceName, RESOURCES (+1 more)

### Community 63 - "payment-method-picker.tsx"
Cohesion: 0.46
Nodes (5): PaymentMethodPicker(), dict, PaymentMethodType, PaymentMethodOption, paymentMethods

### Community 64 - "orders/route.test.ts"
Cohesion: 0.29
Nodes (3): ADDRESS, BASELINE_LINES, jar

### Community 65 - "validate.ts"
Cohesion: 0.47
Nodes (3): parseOrThrow(), schema, UpstreamShapeError

## Ambiguous Edges - Review These
- `Placeholder Product Image` → `Breeze Daily 1 (Placeholder Image)`  [AMBIGUOUS]
  public/images/products/breeze-daily-1.jpg · relation: conceptually_related_to
- `Cat Product Imagery (implied by filename)` → `Cat Colored (blank placeholder image)`  [AMBIGUOUS]
  public/images/cat-colored.jpg · relation: conceptually_related_to
- `Placeholder/Empty Image Asset` → `Mystic Daily Product Image (Placeholder)`  [AMBIGUOUS]
  public/images/products/mystic-daily-1.jpg · relation: semantically_similar_to
- `FocalPro Daily Product Image (Placeholder)` → `Blank Placeholder Image Concept`  [AMBIGUOUS]
  public/images/products/focalpro-daily-1.jpg · relation: conceptually_related_to
- `Ocean Biweekly Product` → `Ocean Biweekly Product Image 1 (Blank Placeholder)`  [AMBIGUOUS]
  public/images/products/ocean-biweekly-1.jpg · relation: conceptually_related_to
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
- **335 isolated node(s):** `Stage`, `push`, `push`, `user`, `mockedApiRequest` (+330 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Placeholder Product Image` and `Breeze Daily 1 (Placeholder Image)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Cat Product Imagery (implied by filename)` and `Cat Colored (blank placeholder image)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Placeholder/Empty Image Asset` and `Mystic Daily Product Image (Placeholder)`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **What is the exact relationship between `FocalPro Daily Product Image (Placeholder)` and `Blank Placeholder Image Concept`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Ocean Biweekly Product` and `Ocean Biweekly Product Image 1 (Blank Placeholder)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Empty/Unrendered Placeholder Asset` and `Torica Biweekly Product Image (Blank Placeholder)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Placeholder / Blank Image Concept` and `hazel-monthly-1.jpg (blank placeholder image)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._