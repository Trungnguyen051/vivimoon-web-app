# Graph Report - vivimoon-web-app  (2026-10-31)

## Corpus Check
- 376 files · ~187,706 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1705 nodes · 4107 edges · 149 communities (97 shown, 52 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 32 edges (avg confidence: 0.78)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `da72f50d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- vi.ts
- shipping/mock.ts
- addresses-manager.tsx
- cookie.ts
- rx.ts
- vouchers/route.test.ts
- Dictionary
- dependencies
- Vivimoon M2 — Purchase Core Implementation Plan
- getDictionary
- devDependencies
- Vivimoon — Client Scope Design Spec
- compilerOptions
- components.json
- catalog.ts
- apiOk
- Product domain type
- en.ts
- i18n seam (locale-prefixed routes, getDictionary)
- cart-line-item.test.tsx
- Coolmate.me Feature & Structure Analysis
- rx-selector.tsx
- discovery/mock.ts
- api/config.ts
- Two-tier component architecture (ui/ vs commerce/)
- Product Detail Page (PDP) structure
- pricing/mock.ts
- variant-selector.tsx
- client.ts
- account/mock.ts
- Vivimoon Storefront Baseline Design Spec
- dictionaries.ts
- Placeholder/Empty Image Asset
- Cart (CartProvider context+reducer, localStorage persistence)
- Blank Placeholder Image Concept
- AGENTS.md: This is NOT the Next.js you know
- FocalPro Monthly Product Image (Blank Placeholder)
- orders/mock.ts
- Aqua Daily 2 (Placeholder Image)
- Torica Biweekly Product Image (Blank Placeholder)
- hazel-monthly-1.jpg (blank placeholder image)
- discovery.ts
- orders/page.tsx
- Hazel Monthly Product Line
- Placeholder/Blank Product Image
- eslint.config.mjs
- source-files.ts
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
- NoopObserver
- M1 Foundation — progress ledger
- Issue tracker: GitHub
- comparison-dialog.tsx
- Domain Docs
- cart-store.ts
- sign-in.test.tsx
- triage-labels.md
- Vivimoon
- lens-viewer.tsx
- editorial/index.ts
- use-comparison.test.ts
- loyalty/mock.ts
- mobile-nav.tsx
- cart.ts
- Process
- Vivimoon M1 — Foundation Implementation Plan
- mock/index.ts
- scripts
- mega-nav.tsx
- vouchers/page.tsx
- AddressForm
- [locale]/layout.tsx
- Vivimoon M4 — Discovery Implementation Plan
- auth.ts
- 0001-proxy-seam-replaces-repository-interface.md
- 0002-server-components-self-fetch-mutable-state.md
- 0003-client-never-computes-money.md
- common.ts
- duration-tiles.ts
- shadcn
- nav-destinations.test.ts
- ForgotPasswordForm
- checkout/page.tsx
- 0016-ui-primitives-move-to-base-ui.md
- to-spec/SKILL.md
- 0017-expiry-is-shopper-facing-replacement-is-the-wire-name.md
- 0004-rx-schema-ships-cyl-axis-before-toric-ui.md
- 0005-eye-enlargement-computed-not-stored.md
- cn.ts
- 5. Migration Strategy
- 0006-guest-order-tracking-via-emailed-link.md
- 0007-payment-ui-branches-on-intent-shape.md
- price/route.ts
- 0008-cart-hydration-gate-flag.md
- 0009-session-tokens-signed-and-expiring.md
- orders/route.test.ts
- 1. Overview
- Task 18: Cart page + line item + order summary
- 3. Architecture — the proxy seam
- payments.ts
- page.test.tsx
- checkout-address-prefill.test.tsx
- intent/route.ts
- SignUpForm
- Vivimoon.vn — Live Site Data-Model Audit
- account-form.test.tsx
- logout/route.ts
- tracking-request-form.test.tsx
- cn
- [locale]/page.tsx
- lucide-react
- AddressesManager
- @testing-library/react
- 0010-product-line-excludes-correction-complexity.md
- 0011-eye-enlargement-derives-from-graphic-diameter.md
- jsdom
- react-dom
- tw-animate-css
- loyalty/route.test.ts
- 0013-pages-own-their-width.md
- 0012-unavailable-cart-lines-are-reported-not-dropped.md
- Pages run full-bleed with 40px gutters; `PageContainer` no longer caps at `max-w-7xl`
- Product
- shadcn
- orders-preferred-payment.test.ts
- checkout.ts
- @types/node
- @types/react
- add-to-cart.tsx
- schemas/orders.ts
- forgot-password.test.tsx
- cart/page.tsx
- collection-filters.tsx
- 0014-image-optimization-is-on.md

## God Nodes (most connected - your core abstractions)
1. `cn()` - 149 edges
2. `getDictionary()` - 71 edges
3. `apiOk()` - 68 edges
4. `isLocale()` - 54 edges
5. `apiFail()` - 48 edges
6. `Locale` - 47 edges
7. `readSessionUserId()` - 43 edges
8. `Dictionary` - 37 edges
9. `parseBody()` - 36 edges
10. `Product` - 26 edges

## Surprising Connections (you probably didn't know these)
- `README.md: Vivimoon Next.js project README` --semantically_similar_to--> `Tech stack (Next.js App Router, React 19, TS strict, Tailwind v4, shadcn/ui, embla, RHF+zod, GA4, Vitest)`  [INFERRED] [semantically similar]
  README.md → docs/superpowers/specs/2026-08-16-vivimoon-storefront-baseline-design.md
- `DialogOverlay()` --calls--> `cn()`  [EXTRACTED]
  components/ui/dialog.tsx → lib/utils/cn.ts
- `DialogDescription()` --calls--> `cn()`  [EXTRACTED]
  components/ui/dialog.tsx → lib/utils/cn.ts
- `NavigationMenuPositioner()` --calls--> `cn()`  [EXTRACTED]
  components/ui/navigation-menu.tsx → lib/utils/cn.ts
- `NavigationMenuIndicator()` --calls--> `cn()`  [EXTRACTED]
  components/ui/navigation-menu.tsx → lib/utils/cn.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Cart feature data flow: reducer, storage, context, hook composing CartProvider** — docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_cartprovider, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_usecart, docs_superpowers_plans_2026_08_16_vivimoon_storefront_baseline_task9_cart_feature [EXTRACTED 1.00]
- **Four swappable architecture seams (data, theming, i18n, analytics) isolating volatility** — docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_productrepository, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_theming_seam, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_i18n_seam, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_analytics_seam [EXTRACTED 1.00]
- **Coolmate apparel patterns re-modeled for Vivimoon contact-lens domain** — docs_research_coolmate_website_analysis_product_card, docs_research_coolmate_website_analysis_pdp, docs_research_coolmate_website_analysis_color_variant_url_pattern, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_productcard, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_variant [INFERRED 0.85]

## Communities (149 total, 52 thin omitted)

### Community 0 - "vi.ts"
Cohesion: 0.17
Nodes (8): ContentCard, ContentCarousel(), items, Header(), MegaNav(), pathname, MobileNav(), vi

### Community 1 - "shipping/mock.ts"
Cohesion: 0.29
Nodes (6): defaultShippingOptions, shippingRates, mockShipping, Shipping, ShippingError, ShippingOption

### Community 2 - "addresses-manager.tsx"
Cohesion: 0.24
Nodes (18): AddressDict, EMPTY_FORM, FormState, Stage, Stage, Alert(), AlertDescription(), alertVariants (+10 more)

### Community 3 - "cookie.ts"
Cohesion: 0.19
Nodes (19): jar, POST(), POST(), POST(), POST(), POST(), POST(), auth (+11 more)

### Community 4 - "rx.ts"
Cohesion: 0.14
Nodes (20): EyeFields(), eyeSummary(), RxSummary(), AXIS_STEPS, Rx, RxEye, rxEyeSchema, rxLensTypeSchema (+12 more)

### Community 6 - "Dictionary"
Cohesion: 0.13
Nodes (16): CarouselNav(), CollectionCarousel(), PriceTag(), ProductCard(), ProductGrid(), ReviewSourceBadge(), SpecTable(), baseSpecs (+8 more)

### Community 7 - "dependencies"
Cohesion: 0.08
Nodes (25): @base-ui/react, class-variance-authority, clsx, embla-carousel-react, @hookform/resolvers, next, @next/third-parties, dependencies (+17 more)

### Community 8 - "Vivimoon M2 — Purchase Core Implementation Plan"
Cohesion: 0.11
Nodes (19): File Structure, Global Constraints, M2 Definition of Done, Scope note: why `cyl`/`axis` exist in the schema but not the UI, Task 10: Order placement, Task 11: Guest → member cart merge, Task 12: Buy Now, Task 13: M2 verification (+11 more)

### Community 9 - "getDictionary"
Cohesion: 0.16
Nodes (22): AboutPage(), FavoritesPage(), ArticlesPage(), ArticlePage(), ForgotPasswordPage(), SignInPage(), SignUpPage(), CartPage() (+14 more)

### Community 10 - "devDependencies"
Cohesion: 0.08
Nodes (25): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, prettier, prettier-plugin-tailwindcss, tailwindcss (+17 more)

### Community 11 - "Vivimoon — Client Scope Design Spec"
Cohesion: 0.11
Nodes (18): 10. Feature Notes, 11. Blocked Items, 12. Testing, 13. Milestones, 14. Files Removed or Changed, 15. Decisions and Open Questions, 2. Feature Scope, 4. API Contract (+10 more)

### Community 12 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 13 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 14 - "catalog.ts"
Cohesion: 0.09
Nodes (24): req(), Collection, collectionSchema, CompareRequest, compareRequestSchema, ComparisonRow, comparisonRowSchema, LensGalleryContexts (+16 more)

### Community 15 - "apiOk"
Cohesion: 0.16
Nodes (23): GET(), POST(), DELETE(), GET(), GET(), GET(), GET(), GET() (+15 more)

### Community 16 - "Product domain type"
Cohesion: 0.13
Nodes (17): Planned file structure (app/, lib/, content/, features/cart/, components/, tests/), Global constraints (Node 20+, TS strict, no hardcoded strings, no raw gtag, no data-fetching in ui/commerce components), Vivimoon Storefront Baseline Implementation Plan, Task 1: Scaffold project & tooling, Task 2: Testing setup (Vitest + RTL), Task 3: Utilities (cn, formatPrice), Task 4: Domain types, Task 5: Mock content (+9 more)

### Community 17 - "en.ts"
Cohesion: 0.06
Nodes (22): geistMono, geistSans, metadata, QuizFlow(), definition, mockedApiRequest, CompareToggle(), ComparisonDialog() (+14 more)

### Community 18 - "i18n seam (locale-prefixed routes, getDictionary)"
Cohesion: 0.11
Nodes (19): Multi-language/locale switcher (topbar), Utility topbar (Coolmate), Task 7: i18n seam (config, dictionaries, middleware), Task 8: Analytics seam (GA4), Analytics seam (GA4 via typed track() wrapper), GA4 ecommerce events (view_item_list, select_item, view_item, add_to_cart, remove_from_cart, view_cart, begin_checkout, purchase), getDictionary(locale) function, @next/third-parties GoogleAnalytics component (+11 more)

### Community 19 - "cart-line-item.test.tsx"
Cohesion: 0.15
Nodes (14): dict, line, lineWithRx, rx, makeLine(), freshStore(), makeLine(), rxA (+6 more)

### Community 20 - "Coolmate.me Feature & Structure Analysis"
Cohesion: 0.12
Nodes (16): Screen-reader-only accessible text investment, Announcement bar (Coolmate), Blog / content-marketing hub, Care & Share CSR program, Community Threads (UGC/community hub), Cookie consent banner + preference center, CXP by Coolmate (custom-print sub-brand), Footer (contact, link columns, address, certifications) (+8 more)

### Community 21 - "rx-selector.tsx"
Cohesion: 0.19
Nodes (10): emptyRxDraft, RxDraft, RxEyeDraft, RxRanges, RxSelector(), dict, FieldLegend(), FieldSet() (+2 more)

### Community 22 - "discovery/mock.ts"
Cohesion: 0.25
Nodes (8): quiz, ADR-0005, DiscoveryError, mockDiscovery, QuizDefinition, EYE_ENLARGEMENT_BANDS, eyeEnlargementBand, ADR-0011

### Community 23 - "api/config.ts"
Cohesion: 0.11
Nodes (17): POST(), GUEST_ADDRESS, placeGuestOrder(), POST(), GET(), POST(), ApiMode, DEPENDS_ON (+9 more)

### Community 24 - "Two-tier component architecture (ui/ vs commerce/)"
Cohesion: 0.15
Nodes (14): Task 12: Carousels & CategoryGrid, Task 13: Layout chrome (AnnouncementBar, Header, MegaNav, LocaleSwitcher, Footer), Task 14: Home page, Task 15: Collection listing page + filters, CartLineItem component, CategoryGrid component, CollectionCarousel component, Two-tier component architecture (ui/ vs commerce/) (+6 more)

### Community 25 - "Product Detail Page (PDP) structure"
Cohesion: 0.20
Nodes (10): Color variants as distinct URLs (?color=slug) for SEO/deep-linking, CoolClub loyalty program + CoolCash currency, Fabric-technology brand system (cross-cutting taxonomy: CoolDry, CoolSoft, CoolRib, CoolFlex, ZeroMark), Fit-feedback histogram (Tight/True-to-size/Loose) in reviews, Product Detail Page (PDP) structure, Task 16: PDP components (Gallery, VariantSelector, SpecTable, ReviewsList), Task 17: PDP page + Add-to-cart, Variant domain type (+2 more)

### Community 26 - "pricing/mock.ts"
Cohesion: 0.14
Nodes (14): pricing, bestVoucher(), mockPricing, Pricing, PricingError, BASELINE_LINES, ADR-0012, ADR-0012 (+6 more)

### Community 27 - "variant-selector.tsx"
Cohesion: 0.26
Nodes (8): resolveVariant(), coloredProduct, colorlessProduct, dict, VariantSelector(), selectColor(), Variant, distinctColorVariants()

### Community 28 - "client.ts"
Cohesion: 0.14
Nodes (13): FavoriteButton(), toggle(), mockedApiRequest, UsePricedCartResult, SessionStatus, SessionStore, SessionUser, user (+5 more)

### Community 29 - "account/mock.ts"
Cohesion: 0.07
Nodes (25): ADDRESS, jar, addressErrorResponse(), DELETE(), PATCH(), jar, POST(), GET() (+17 more)

### Community 30 - "Vivimoon Storefront Baseline Design Spec"
Cohesion: 0.24
Nodes (11): Gender filter toggle (in-place homepage filtering), Hero banner carousel (7 slides), Homepage structure (hero carousel, promo tiles, category grid), Product card component (hover-swap, swatches, badges, price), Themed collection sections with product carousels, Build sequence (13 high-level steps), Baseline goals (demoable bilingual storefront, clean seams, prop-driven components), Explicit non-goals (Rx upload, loyalty, real payment, real DB, auth, deferred with seams) (+3 more)

### Community 31 - "dictionaries.ts"
Cohesion: 0.28
Nodes (7): PageContainer(), ADR-0013, ADR-0015, editorial, defaultLocale, Locale, dictionaries

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
Cohesion: 0.11
Nodes (15): jar, mockOrders, Orders, randomId(), randomOrderCode(), randomSuffix(), resetMockOrdersState(), store (+7 more)

### Community 38 - "Aqua Daily 2 (Placeholder Image)"
Cohesion: 0.50
Nodes (4): Aqua Daily 1 (placeholder image), Aqua Daily 2 (Placeholder Image), Blank Placeholder Graphic, Aqua Daily Product Line

### Community 39 - "Torica Biweekly Product Image (Blank Placeholder)"
Cohesion: 0.50
Nodes (4): Torica Biweekly Product Image (Blank Placeholder), Biweekly Variant/Frequency Concept, Empty/Unrendered Placeholder Asset, Torica Product Line

### Community 40 - "hazel-monthly-1.jpg (blank placeholder image)"
Cohesion: 0.67
Nodes (3): hazel-monthly-1.jpg (blank placeholder image), Hazel Monthly Product (inferred subscription/monthly product line), Placeholder / Blank Image Concept

### Community 41 - "discovery.ts"
Cohesion: 0.10
Nodes (22): QuizAnswer, quizAnswerSchema, quizDefinitionSchema, QuizOption, quizOptionSchema, QuizQuestion, quizQuestionSchema, QuizSubmitRequest (+14 more)

### Community 42 - "orders/page.tsx"
Cohesion: 0.20
Nodes (14): AddressesPage(), fetchAddresses(), fetchFavorites(), fetchOrder(), OrderDetailPage(), fetchOrders(), formatDate(), OrderHistoryPage() (+6 more)

### Community 46 - "source-files.ts"
Cohesion: 0.20
Nodes (9): ADR-0016, nextConfig, ADR-0014, isTest(), isVendored(), SKIP, sourceFiles(), withoutComments() (+1 more)

### Community 61 - "M1 Foundation — progress ledger"
Cohesion: 0.22
Nodes (8): M1 Foundation — progress ledger, M2 Task 11 — Guest → member cart merge (2026-09-02), M2 Task 12 — Buy Now (2026-09-02), M2 Task 13 — M2 verification (2026-09-02), M2 Task 5 — RxSelector and Rx-aware add-to-cart (2026-08-31), M2 Task 6 — Server-owned pricing and auto-voucher (2026-08-31), M2 Task 7 — Cart page renders server prices (2026-08-31), M4 Task 9 — M4 verification (2026-09-05)

### Community 62 - "Issue tracker: GitHub"
Cohesion: 0.29
Nodes (6): Conventions, Issue tracker: GitHub, Pull requests as a triage surface, Wayfinding operations, When a skill says "fetch the relevant ticket", When a skill says "publish to the issue tracker"

### Community 63 - "comparison-dialog.tsx"
Cohesion: 0.23
Nodes (6): Dialog(), DialogContent(), DialogDescription(), DialogHeader(), DialogOverlay(), DialogTitle()

### Community 64 - "Domain Docs"
Cohesion: 0.33
Nodes (5): Before exploring, read these, Domain Docs, File structure, Flag ADR conflicts, Use the glossary's vocabulary

### Community 65 - "cart-store.ts"
Cohesion: 0.12
Nodes (17): ORDER_RESPONSE, makeLine(), seedLastOrder(), cartCount(), cartReducer(), atA, atB, empty (+9 more)

### Community 69 - "lens-viewer.tsx"
Cohesion: 0.24
Nodes (9): CONTEXT_KEYS, LensViewer(), gallery, ProductGallery(), Tabs(), TabsContent(), TabsList(), tabsListVariants (+1 more)

### Community 70 - "editorial/index.ts"
Cohesion: 0.24
Nodes (8): articles, Editorial, mockEditorial, Article, articleSchema, localizedBodySchema, LocalizedText, localizedTextSchema

### Community 71 - "use-comparison.test.ts"
Cohesion: 0.38
Nodes (3): mockedApiRequest, UseComparisonMatrixResult, ComparisonMatrix

### Community 72 - "loyalty/mock.ts"
Cohesion: 0.12
Nodes (11): ADDRESS, jar, LINES, loyaltyHistory, Loyalty, mockLoyalty, store, LoyaltyBalance (+3 more)

### Community 73 - "mobile-nav.tsx"
Cohesion: 0.21
Nodes (12): Accordion(), AccordionContent(), AccordionItem(), AccordionTrigger(), Sheet(), SheetClose(), SheetContent(), SheetDescription() (+4 more)

### Community 74 - "cart.ts"
Cohesion: 0.11
Nodes (17): vouchers, vouchers, mockVouchers, Vouchers, cartLineSchema, cartStateSchema, priceCartRequestSchema, PriceLineInput (+9 more)

### Community 75 - "Process"
Cohesion: 0.15
Nodes (12): 1. Gather context, 2. Explore the codebase (optional), 3. Draft vertical slices, 4. Quiz the user, 5. Publish the tickets to the configured tracker, Acceptance criteria, Blocked by, <NN> — <Ticket title> (+4 more)

### Community 76 - "Vivimoon M1 — Foundation Implementation Plan"
Cohesion: 0.11
Nodes (18): File Structure, Global Constraints, M1 Definition of Done, Task 10: Browser API client, session sync, and the sign-in / sign-up pages, Task 11: Forgot-password OTP flow, Task 12: Account resource and route handlers, Task 13: Account page, route guards, and M1 verification, Task 1: API config and response envelope (+10 more)

### Community 77 - "mock/index.ts"
Cohesion: 0.12
Nodes (18): collections, favorites, galleries, HOME_ADDRESS, OFFICE_ADDRESS, orders, products, reviews (+10 more)

### Community 78 - "scripts"
Cohesion: 0.15
Nodes (12): name, private, scripts, build, dev, lint, start, test (+4 more)

### Community 79 - "mega-nav.tsx"
Cohesion: 0.29
Nodes (10): ITEM_CLASS, NavigationMenu(), NavigationMenuContent(), NavigationMenuIndicator(), NavigationMenuItem(), NavigationMenuLink(), NavigationMenuList(), NavigationMenuPositioner() (+2 more)

### Community 80 - "vouchers/page.tsx"
Cohesion: 0.17
Nodes (18): fetchLoyalty(), formatDate(), LoyaltyPage(), discountLabel(), fetchVouchers(), formatDate(), VouchersPage(), CartLineItem() (+10 more)

### Community 82 - "[locale]/layout.tsx"
Cohesion: 0.17
Nodes (8): ComparisonTray(), AnnouncementBar(), Footer(), Separator(), useComparisonMatrix(), locales, config, GUARDED

### Community 83 - "Vivimoon M4 — Discovery Implementation Plan"
Cohesion: 0.13
Nodes (15): File Structure, Global Constraints, M4 Definition of Done, Scope note: the §6/§10 eyeEnlargement conflict, Task 1: Mirrored reviews — source badge, Task 2: Comparison — eye-enlargement banding, schemas, discovery resource, Task 3: Comparison — store, toggle, persistent tray, Task 4: Comparison — matrix Dialog (+7 more)

### Community 84 - "auth.ts"
Cohesion: 0.07
Nodes (30): jar, Auth, mockAuth, OtpRecord, otps, resetMockAuthState(), ResetRecord, resets (+22 more)

### Community 89 - "common.ts"
Cohesion: 0.09
Nodes (21): BASELINE_LINES, ADR-0012, RESOURCES, saved, upstreamBaseUrl(), upstreamTimeoutMs(), pricedCartSchema, comparisonMatrixSchema (+13 more)

### Community 90 - "duration-tiles.ts"
Cohesion: 0.15
Nodes (14): collectionListId(), MEMBERSHIP_FILTERS, normalizeColors(), COLLECTION_COLORS, idFor(), parseProductQueryLoose(), ProductQuery, ReplacementSchedule (+6 more)

### Community 92 - "nav-destinations.test.ts"
Cohesion: 0.27
Nodes (7): getCollectionLinks(), getNavItems(), NavItem, NavLink, hrefsOf(), navHrefs(), SEGMENT_ROOT

### Community 93 - "ForgotPasswordForm"
Cohesion: 0.70
Nodes (5): ForgotPasswordForm(), reportServer(), requestCode(), submitPassword(), verifyCode()

### Community 94 - "checkout/page.tsx"
Cohesion: 0.13
Nodes (14): fetchRoutingTo(), json(), PRICED_RESPONSE, CheckoutPage(), ADR-0012, AlertTitle(), toPriceLines(), usePricedCart() (+6 more)

### Community 96 - "to-spec/SKILL.md"
Cohesion: 0.22
Nodes (8): Further Notes, Implementation Decisions, Out of Scope, Problem Statement, Process, Solution, Testing Decisions, User Stories

### Community 100 - "cn.ts"
Cohesion: 0.29
Nodes (5): HomeSection(), ADR-0013, LocaleSwitcher(), Logo(), ADR-0014

### Community 101 - "5. Migration Strategy"
Cohesion: 0.33
Nodes (6): 5. Migration Strategy, Adapting drift, Conformance suite, Cutover order, Per-resource cutover, Runtime validation

### Community 104 - "price/route.ts"
Cohesion: 0.29
Nodes (3): POST(), BASELINE_LINES, jar

### Community 109 - "orders/route.test.ts"
Cohesion: 0.25
Nodes (4): ADDRESS, BASELINE_LINES, jar, ADR-0012

### Community 110 - "1. Overview"
Cohesion: 0.50
Nodes (4): 1. Overview, Baseline non-goals now in scope, Goals, Non-goals

### Community 111 - "Task 18: Cart page + line item + order summary"
Cohesion: 0.33
Nodes (6): Task 18: Cart page + line item + order summary, Task 19: Checkout + success (stubbed payment), Task 20: Final verification (responsive, a11y, build, tests), OrderSummary component, Pages table (Home, Collection, PDP, Cart, Checkout, Checkout success), Testing strategy (Vitest unit + RTL component tests)

### Community 112 - "3. Architecture — the proxy seam"
Cohesion: 0.67
Nodes (3): 3. Architecture — the proxy seam, Configuration, Resource layout

### Community 113 - "payments.ts"
Cohesion: 0.13
Nodes (16): PaymentMethodPicker(), dict, payments, mockPayments, PaymentError, Payments, PaymentIntent, PaymentIntentRequest (+8 more)

### Community 114 - "page.test.tsx"
Cohesion: 0.33
Nodes (5): mockedApiRequest, renderCartPage(), renderWithStaleLine(), track, ADR-0012

### Community 115 - "checkout-address-prefill.test.tsx"
Cohesion: 0.33
Nodes (4): DEFAULT_ADDRESS, fetchRoutingTo(), json(), PRICED_RESPONSE

### Community 117 - "SignUpForm"
Cohesion: 0.22
Nodes (4): SignUpForm(), goToAccount(), verifyCode(), push

### Community 118 - "Vivimoon.vn — Live Site Data-Model Audit"
Cohesion: 0.40
Nodes (4): 1. Site structure, 2. Product detail page — data fields observed, 3. Open question — not acted on, Vivimoon.vn — Live Site Data-Model Audit

### Community 122 - "cn"
Cohesion: 0.12
Nodes (20): QuantityStepper(), RatingStars(), AlertAction(), AspectRatio(), Breadcrumb(), BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink() (+12 more)

### Community 123 - "[locale]/page.tsx"
Cohesion: 0.08
Nodes (30): BRAND_STORY_IMAGES, HomePage(), TV_THUMBS, ArticleCard, ArticleCards(), BrandStory(), BrandStoryImage, CategoryGrid() (+22 more)

### Community 125 - "AddressesManager"
Cohesion: 0.20
Nodes (4): AddressesManager(), NON_DEFAULT, toFormState(), SavedAddress

### Community 136 - "Product"
Cohesion: 0.21
Nodes (10): Gtag, product, track(), AnalyticsEvent, Ga4Item, toGa4Items(), minPrice(), toComparisonRow() (+2 more)

### Community 138 - "orders-preferred-payment.test.ts"
Cohesion: 0.29
Nodes (3): ADDRESS, jar, LINES

### Community 139 - "checkout.ts"
Cohesion: 0.18
Nodes (9): ADDRESS, LINES, pricedLineSchema, Address, addressSchema, shippingOptionSchema, ShippingQuoteRequest, shippingQuoteRequestSchema (+1 more)

### Community 142 - "add-to-cart.tsx"
Cohesion: 0.21
Nodes (10): AddToCart(), dict, push, ADR-0010, selectCartCount(), useCartStore, useBuyNow(), useCart() (+2 more)

### Community 143 - "schemas/orders.ts"
Cohesion: 0.12
Nodes (15): OrderStatusTimeline(), PROGRESSION, TERMINAL_DISTINCT, priceLineInputSchema, currencySchema, OrderLine, orderLineSchema, placeOrderRequestSchema (+7 more)

### Community 147 - "cart/page.tsx"
Cohesion: 0.31
Nodes (11): ADR-0012, resolveTitle(), ReviewsList(), Empty(), EmptyContent(), EmptyDescription(), EmptyHeader(), EmptyMedia() (+3 more)

### Community 149 - "collection-filters.tsx"
Cohesion: 0.15
Nodes (14): CollectionFilters(), SORTS, colors, push, SelectContent(), SelectGroup(), SelectItem(), SelectLabel() (+6 more)

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
- **515 isolated node(s):** `npx`, `Stage`, `push`, `push`, `Stage` (+510 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **52 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

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