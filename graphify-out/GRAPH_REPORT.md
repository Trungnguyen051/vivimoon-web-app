# Graph Report - vivimoon-web-app  (2026-11-11)

## Corpus Check
- 408 files · ~214,587 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1840 nodes · 4517 edges · 155 communities (103 shown, 52 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 31 edges (avg confidence: 0.78)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b8c39587`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- i18n/config.ts
- checkout.ts
- addresses-manager.tsx
- parseBody
- rx.ts
- lens-facets.ts
- spec-table.tsx
- dependencies
- Vivimoon M2 — Purchase Core Implementation Plan
- orders/page.tsx
- devDependencies
- Vivimoon — Client Scope Design Spec
- compilerOptions
- components.json
- catalog.ts
- apiOk
- Product domain type
- comparison-tray.tsx
- i18n seam (locale-prefixed routes, getDictionary)
- cart-line-item.test.tsx
- Coolmate.me Feature & Structure Analysis
- lens-viewer.tsx
- Locale
- faq-accordion.tsx
- Two-tier component architecture (ui/ vs commerce/)
- Product Detail Page (PDP) structure
- pricing/mock.ts
- variant-selector.tsx
- checkout/page.tsx
- account/mock.ts
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
- discovery/mock.ts
- editorial.ts
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
- dictionaries.ts
- app/layout.tsx
- useCartStore
- loyalty/mock.ts
- cart-reducer.test.ts
- cart.ts
- Process
- Vivimoon M1 — Foundation Implementation Plan
- mock/index.ts
- scripts
- mobile-nav.tsx
- cart/page.tsx
- AddressForm
- articles/page.tsx
- Vivimoon M4 — Discovery Implementation Plan
- auth.ts
- 0001-proxy-seam-replaces-repository-interface.md
- 0002-server-components-self-fetch-mutable-state.md
- 0003-client-never-computes-money.md
- api/config.ts
- [locale]/page.tsx
- shadcn
- list-id.ts
- reading-theme-chips.tsx
- mega-nav.tsx
- 0016-ui-primitives-move-to-base-ui.md
- to-spec/SKILL.md
- 0017-expiry-is-shopper-facing-replacement-is-the-wire-name.md
- 0004-rx-schema-ships-cyl-axis-before-toric-ui.md
- 0005-eye-enlargement-computed-not-stored.md
- en.ts
- 5. Migration Strategy
- 0006-guest-order-tracking-via-emailed-link.md
- 0007-payment-ui-branches-on-intent-shape.md
- cookie.ts
- 0008-cart-hydration-gate-flag.md
- 0009-session-tokens-signed-and-expiring.md
- common.ts
- 1. Overview
- vouchers/mock.ts
- 3. Architecture — the proxy seam
- payments.ts
- page.test.tsx
- apiRequest
- intent/route.ts
- ForgotPasswordForm
- Vivimoon.vn — Live Site Data-Model Audit
- account-form.test.tsx
- collection-filters.tsx
- vouchers/page.tsx
- product/[slug]/page.tsx
- cn.ts
- lucide-react
- AddressesManager
- @testing-library/react
- 0010-product-line-excludes-correction-complexity.md
- 0011-eye-enlargement-derives-from-graphic-diameter.md
- jsdom
- react-dom
- tw-animate-css
- checkout-address-prefill.test.tsx
- 0013-pages-own-their-width.md
- 0012-unavailable-cart-lines-are-reported-not-dropped.md
- Pages run full-bleed with 40px gutters; `PageContainer` no longer caps at `max-w-7xl`
- Product
- shadcn
- orders-preferred-payment.test.ts
- checkout-price-preview.test.tsx
- @types/node
- nav-destinations.test.ts
- add-to-cart.tsx
- schemas/orders.ts
- order-summary.tsx
- An Article's inline products come from its Reading Theme, not from the Article
- A Guide is a fixed-layout document, and not an Article
- The Support search box filters FAQ Entries; it is not storefront search
- cn
- @types/react
- 0014-image-optimization-is-on.md
- Task 18: Cart page + line item + order summary
- favorites-routes.test.ts
- tracking-request-form.test.tsx

## God Nodes (most connected - your core abstractions)
1. `cn()` - 161 edges
2. `getDictionary()` - 76 edges
3. `apiOk()` - 68 edges
4. `isLocale()` - 56 edges
5. `Locale` - 52 edges
6. `apiFail()` - 48 edges
7. `readSessionUserId()` - 43 edges
8. `Dictionary` - 39 edges
9. `parseBody()` - 36 edges
10. `Product` - 28 edges

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

## Communities (155 total, 52 thin omitted)

### Community 0 - "i18n/config.ts"
Cohesion: 0.11
Nodes (15): LocaleLayout(), AnnouncementBar(), Footer(), Header(), LocaleSwitcher(), Logo(), ADR-0014, selectCartCount() (+7 more)

### Community 1 - "checkout.ts"
Cohesion: 0.12
Nodes (15): ADDRESS, LINES, defaultShippingOptions, shippingRates, shipping, mockShipping, Shipping, ShippingError (+7 more)

### Community 2 - "addresses-manager.tsx"
Cohesion: 0.19
Nodes (22): AddressDict, EMPTY_FORM, FormState, Stage, Stage, Alert(), AlertDescription(), alertVariants (+14 more)

### Community 3 - "parseBody"
Cohesion: 0.22
Nodes (15): jar, POST(), POST(), POST(), POST(), POST(), POST(), POST() (+7 more)

### Community 4 - "rx.ts"
Cohesion: 0.09
Nodes (30): emptyRxDraft, EyeFields(), RxDraft, RxEyeDraft, RxRanges, RxSelector(), dict, eyeSummary() (+22 more)

### Community 5 - "lens-facets.ts"
Cohesion: 0.17
Nodes (16): FacetBrowser(), Swatches(), valueLabel(), MobileNav(), LensEntry, LensEntryId, DiameterBucket, diameterBucketLabel() (+8 more)

### Community 6 - "spec-table.tsx"
Cohesion: 0.38
Nodes (5): SpecTable(), baseSpecs, dict, ADR-0011, ProductSpecs

### Community 7 - "dependencies"
Cohesion: 0.08
Nodes (25): @base-ui/react, class-variance-authority, clsx, embla-carousel-react, @hookform/resolvers, next, @next/third-parties, dependencies (+17 more)

### Community 8 - "Vivimoon M2 — Purchase Core Implementation Plan"
Cohesion: 0.11
Nodes (19): File Structure, Global Constraints, M2 Definition of Done, Scope note: why `cyl`/`axis` exist in the schema but not the UI, Task 10: Order placement, Task 11: Guest → member cart merge, Task 12: Buy Now, Task 13: M2 verification (+11 more)

### Community 9 - "orders/page.tsx"
Cohesion: 0.20
Nodes (15): AddressesPage(), fetchAddresses(), fetchLoyalty(), formatDate(), LoyaltyPage(), fetchOrders(), formatDate(), OrderHistoryPage() (+7 more)

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
Cohesion: 0.08
Nodes (27): req(), Collection, collectionSchema, CompareRequest, compareRequestSchema, ComparisonRow, comparisonRowSchema, Currency (+19 more)

### Community 15 - "apiOk"
Cohesion: 0.17
Nodes (14): GET(), GET(), GET(), POST(), GET(), POST(), GET(), GET() (+6 more)

### Community 16 - "Product domain type"
Cohesion: 0.13
Nodes (17): Planned file structure (app/, lib/, content/, features/cart/, components/, tests/), Global constraints (Node 20+, TS strict, no hardcoded strings, no raw gtag, no data-fetching in ui/commerce components), Vivimoon Storefront Baseline Implementation Plan, Task 1: Scaffold project & tooling, Task 2: Testing setup (Vitest + RTL), Task 3: Utilities (cn, formatPrice), Task 4: Domain types, Task 5: Mock content (+9 more)

### Community 17 - "comparison-tray.tsx"
Cohesion: 0.13
Nodes (14): CompareToggle(), ComparisonTray(), mockedApiRequest, COMPARE_CAP, COMPARE_STORAGE, CompareState, CompareStore, mergeIds() (+6 more)

### Community 18 - "i18n seam (locale-prefixed routes, getDictionary)"
Cohesion: 0.11
Nodes (19): Multi-language/locale switcher (topbar), Utility topbar (Coolmate), Task 7: i18n seam (config, dictionaries, middleware), Task 8: Analytics seam (GA4), Analytics seam (GA4 via typed track() wrapper), GA4 ecommerce events (view_item_list, select_item, view_item, add_to_cart, remove_from_cart, view_cart, begin_checkout, purchase), getDictionary(locale) function, @next/third-parties GoogleAnalytics component (+11 more)

### Community 19 - "cart-line-item.test.tsx"
Cohesion: 0.16
Nodes (13): dict, line, lineWithRx, rx, freshStore(), makeLine(), rxA, rxB (+5 more)

### Community 20 - "Coolmate.me Feature & Structure Analysis"
Cohesion: 0.12
Nodes (16): Screen-reader-only accessible text investment, Announcement bar (Coolmate), Blog / content-marketing hub, Care & Share CSR program, Community Threads (UGC/community hub), Cookie consent banner + preference center, CXP by Coolmate (custom-print sub-brand), Footer (contact, link columns, address, certifications) (+8 more)

### Community 21 - "lens-viewer.tsx"
Cohesion: 0.23
Nodes (10): CONTEXT_KEYS, LensViewer(), gallery, ProductGallery(), Tabs(), TabsContent(), TabsList(), tabsListVariants (+2 more)

### Community 22 - "Locale"
Cohesion: 0.36
Nodes (7): fetchOrder(), OrderDetailPage(), TrackedOrderPage(), formatDate(), OrderDetailView(), Order, Locale

### Community 23 - "faq-accordion.tsx"
Cohesion: 0.33
Nodes (7): FaqAccordion(), FaqAnswer, entries, Accordion(), AccordionContent(), AccordionItem(), AccordionTrigger()

### Community 24 - "Two-tier component architecture (ui/ vs commerce/)"
Cohesion: 0.15
Nodes (14): Task 12: Carousels & CategoryGrid, Task 13: Layout chrome (AnnouncementBar, Header, MegaNav, LocaleSwitcher, Footer), Task 14: Home page, Task 15: Collection listing page + filters, CartLineItem component, CategoryGrid component, CollectionCarousel component, Two-tier component architecture (ui/ vs commerce/) (+6 more)

### Community 25 - "Product Detail Page (PDP) structure"
Cohesion: 0.20
Nodes (10): Color variants as distinct URLs (?color=slug) for SEO/deep-linking, CoolClub loyalty program + CoolCash currency, Fabric-technology brand system (cross-cutting taxonomy: CoolDry, CoolSoft, CoolRib, CoolFlex, ZeroMark), Fit-feedback histogram (Tight/True-to-size/Loose) in reviews, Product Detail Page (PDP) structure, Task 16: PDP components (Gallery, VariantSelector, SpecTable, ReviewsList), Task 17: PDP page + Add-to-cart, Variant domain type (+2 more)

### Community 26 - "pricing/mock.ts"
Cohesion: 0.16
Nodes (12): bestVoucher(), mockPricing, Pricing, PricingError, BASELINE_LINES, ADR-0012, ADR-0012, voucherApplies() (+4 more)

### Community 27 - "variant-selector.tsx"
Cohesion: 0.26
Nodes (8): resolveVariant(), coloredProduct, colorlessProduct, dict, VariantSelector(), selectColor(), Variant, distinctColorVariants()

### Community 28 - "checkout/page.tsx"
Cohesion: 0.27
Nodes (8): ADR-0012, AlertTitle(), isPhone(), addressLabelSchema, CheckoutForm, CheckoutFormInput, checkoutSchema, VALID

### Community 29 - "account/mock.ts"
Cohesion: 0.08
Nodes (18): ADDRESS, jar, GET(), POST(), Account, AddressError, addressStore, favoriteStore (+10 more)

### Community 30 - "Vivimoon Storefront Baseline Design Spec"
Cohesion: 0.24
Nodes (11): Gender filter toggle (in-place homepage filtering), Hero banner carousel (7 slides), Homepage structure (hero carousel, promo tiles, category grid), Product card component (hover-swap, swatches, badges, price), Themed collection sections with product carousels, Build sequence (13 high-level steps), Baseline goals (demoable bilingual storefront, clean seams, prop-driven components), Explicit non-goals (Rx upload, loyalty, real payment, real DB, auth, deferred with seams) (+3 more)

### Community 31 - "apiFail"
Cohesion: 0.19
Nodes (18): addressErrorResponse(), DELETE(), PATCH(), DELETE(), GET(), POST(), GET(), PATCH() (+10 more)

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
Cohesion: 0.09
Nodes (19): jar, GUEST_ADDRESS, placeGuestOrder(), mockOrders, OrderError, Orders, randomId(), randomOrderCode() (+11 more)

### Community 38 - "Aqua Daily 2 (Placeholder Image)"
Cohesion: 0.50
Nodes (4): Aqua Daily 1 (placeholder image), Aqua Daily 2 (Placeholder Image), Blank Placeholder Graphic, Aqua Daily Product Line

### Community 39 - "Torica Biweekly Product Image (Blank Placeholder)"
Cohesion: 0.50
Nodes (4): Torica Biweekly Product Image (Blank Placeholder), Biweekly Variant/Frequency Concept, Empty/Unrendered Placeholder Asset, Torica Product Line

### Community 40 - "hazel-monthly-1.jpg (blank placeholder image)"
Cohesion: 0.67
Nodes (3): hazel-monthly-1.jpg (blank placeholder image), Hazel Monthly Product (inferred subscription/monthly product line), Placeholder / Blank Image Concept

### Community 41 - "discovery/mock.ts"
Cohesion: 0.07
Nodes (35): GET(), quiz, QUIZ_MATCHES, discovery, Discovery, DiscoveryError, mockDiscovery, toComparisonRow() (+27 more)

### Community 42 - "editorial.ts"
Cohesion: 0.05
Nodes (46): MakeupLookCard, MakeupLooks(), cards, articles, ADR-0018, makeupLooks, faqEntries, ADR-0019 (+38 more)

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
Cohesion: 0.32
Nodes (7): makeLine(), seedLastOrder(), CART_STORAGE, CartStore, CartAction, CartLine, CartState

### Community 69 - "dictionaries.ts"
Cohesion: 0.15
Nodes (22): AboutPage(), ForgotPasswordPage(), SignInPage(), SignUpPage(), CartPage(), SuccessPage(), CollectionPage(), resolveTitle() (+14 more)

### Community 70 - "app/layout.tsx"
Cohesion: 0.28
Nodes (5): geistMono, geistSans, metadata, CartHydrator(), CompareHydrator()

### Community 71 - "useCartStore"
Cohesion: 0.25
Nodes (4): ORDER_RESPONSE, cartReducer(), mergeLines(), useCartStore

### Community 72 - "loyalty/mock.ts"
Cohesion: 0.12
Nodes (11): ADDRESS, jar, LINES, loyaltyHistory, Loyalty, mockLoyalty, store, LoyaltyBalance (+3 more)

### Community 73 - "cart-reducer.test.ts"
Cohesion: 0.22
Nodes (8): cartCount(), atA, atB, empty, makeLine(), plain, rxA, rxB

### Community 74 - "cart.ts"
Cohesion: 0.12
Nodes (15): BASELINE_LINES, ADR-0012, cartLineSchema, cartStateSchema, priceCartRequestSchema, pricedCartSchema, PriceLineInput, ShippingSelection (+7 more)

### Community 75 - "Process"
Cohesion: 0.15
Nodes (12): 1. Gather context, 2. Explore the codebase (optional), 3. Draft vertical slices, 4. Quiz the user, 5. Publish the tickets to the configured tracker, Acceptance criteria, Blocked by, <NN> — <Ticket title> (+4 more)

### Community 76 - "Vivimoon M1 — Foundation Implementation Plan"
Cohesion: 0.11
Nodes (18): File Structure, Global Constraints, M1 Definition of Done, Task 10: Browser API client, session sync, and the sign-in / sign-up pages, Task 11: Forgot-password OTP flow, Task 12: Account resource and route handlers, Task 13: Account page, route guards, and M1 verification, Task 1: API config and response envelope (+10 more)

### Community 77 - "mock/index.ts"
Cohesion: 0.09
Nodes (21): addresses, collections, favorites, galleries, HOME_ADDRESS, OFFICE_ADDRESS, orders, products (+13 more)

### Community 78 - "scripts"
Cohesion: 0.15
Nodes (12): name, private, scripts, build, dev, lint, start, test (+4 more)

### Community 79 - "mobile-nav.tsx"
Cohesion: 0.29
Nodes (8): Sheet(), SheetClose(), SheetContent(), SheetDescription(), SheetHeader(), SheetOverlay(), SheetTitle(), SheetTrigger()

### Community 80 - "cart/page.tsx"
Cohesion: 0.24
Nodes (13): FavoritesPage(), fetchFavorites(), ADR-0012, PageContainer(), ADR-0013, Empty(), EmptyContent(), EmptyDescription() (+5 more)

### Community 82 - "articles/page.tsx"
Cohesion: 0.19
Nodes (12): renderIndex(), ArticlesPage(), first(), readSort(), readTheme(), QuizCta(), QuizStep, steps (+4 more)

### Community 83 - "Vivimoon M4 — Discovery Implementation Plan"
Cohesion: 0.13
Nodes (15): File Structure, Global Constraints, M4 Definition of Done, Scope note: the §6/§10 eyeEnlargement conflict, Task 1: Mirrored reviews — source badge, Task 2: Comparison — eye-enlargement banding, schemas, discovery resource, Task 3: Comparison — store, toggle, persistent tray, Task 4: Comparison — matrix Dialog (+7 more)

### Community 84 - "auth.ts"
Cohesion: 0.08
Nodes (27): Auth, mockAuth, OtpRecord, otps, resetMockAuthState(), ResetRecord, resets, store (+19 more)

### Community 89 - "api/config.ts"
Cohesion: 0.13
Nodes (18): ApiMode, DEPENDS_ON, isAnyUpstream(), rawMode(), readMode(), resolveMode(), ResourceName, RESOURCES (+10 more)

### Community 90 - "[locale]/page.tsx"
Cohesion: 0.13
Nodes (23): BRAND_STORY_IMAGES, HomePage(), TV_THUMBS, GLYPHS, TrustBadge, TrustBadges(), quizSocialProof(), parseProductQueryLoose() (+15 more)

### Community 92 - "list-id.ts"
Cohesion: 0.36
Nodes (6): collectionListId(), MEMBERSHIP_FILTERS, normalizeColors(), COLLECTION_COLORS, idFor(), ProductQuery

### Community 93 - "reading-theme-chips.tsx"
Cohesion: 0.50
Nodes (3): ReadingThemeChip, ReadingThemeChips(), chips

### Community 94 - "mega-nav.tsx"
Cohesion: 0.29
Nodes (10): ITEM_CLASS, NavigationMenu(), NavigationMenuContent(), NavigationMenuIndicator(), NavigationMenuItem(), NavigationMenuLink(), NavigationMenuList(), NavigationMenuPositioner() (+2 more)

### Community 96 - "to-spec/SKILL.md"
Cohesion: 0.22
Nodes (8): Further Notes, Implementation Decisions, Out of Scope, Problem Statement, Process, Solution, Testing Decisions, User Stories

### Community 100 - "en.ts"
Cohesion: 0.10
Nodes (13): QuizFlow(), definition, mockedApiRequest, ComparisonDialog(), matrix, items, ReviewSourceBadge(), ReviewsList() (+5 more)

### Community 101 - "5. Migration Strategy"
Cohesion: 0.33
Nodes (6): 5. Migration Strategy, Adapting drift, Conformance suite, Cutover order, Per-resource cutover, Runtime validation

### Community 104 - "cookie.ts"
Cohesion: 0.10
Nodes (13): jar, POST(), BASELINE_LINES, jar, jar, jar, secret(), SESSION_COOKIE (+5 more)

### Community 109 - "common.ts"
Cohesion: 0.13
Nodes (10): ADDRESS, BASELINE_LINES, jar, ADR-0012, ApiError, apiErrorSchema, ERROR_CODES, ErrorCode (+2 more)

### Community 110 - "1. Overview"
Cohesion: 0.50
Nodes (4): 1. Overview, Baseline non-goals now in scope, Goals, Non-goals

### Community 111 - "vouchers/mock.ts"
Cohesion: 0.31
Nodes (5): vouchers, vouchers, mockVouchers, Vouchers, Voucher

### Community 112 - "3. Architecture — the proxy seam"
Cohesion: 0.67
Nodes (3): 3. Architecture — the proxy seam, Configuration, Resource layout

### Community 113 - "payments.ts"
Cohesion: 0.13
Nodes (16): PaymentMethodPicker(), dict, payments, mockPayments, PaymentError, Payments, PaymentIntent, PaymentIntentRequest (+8 more)

### Community 114 - "page.test.tsx"
Cohesion: 0.33
Nodes (5): mockedApiRequest, renderCartPage(), renderWithStaleLine(), track, ADR-0012

### Community 115 - "apiRequest"
Cohesion: 0.12
Nodes (15): CheckoutPage(), FavoriteButton(), toggle(), mockedApiRequest, toPriceLines(), usePricedCart(), UsePricedCartResult, SessionStatus (+7 more)

### Community 117 - "ForgotPasswordForm"
Cohesion: 0.13
Nodes (10): ForgotPasswordForm(), reportServer(), requestCode(), submitPassword(), verifyCode(), push, SignUpForm(), goToAccount() (+2 more)

### Community 118 - "Vivimoon.vn — Live Site Data-Model Audit"
Cohesion: 0.40
Nodes (4): 1. Site structure, 2. Product detail page — data fields observed, 3. Open question — not acted on, Vivimoon.vn — Live Site Data-Model Audit

### Community 120 - "collection-filters.tsx"
Cohesion: 0.13
Nodes (14): CollectionFilters(), DIAMETERS, MATERIALS, QUERY_KEYS, SORTS, colors, push, pathname (+6 more)

### Community 121 - "vouchers/page.tsx"
Cohesion: 0.24
Nodes (11): discountLabel(), fetchVouchers(), formatDate(), VouchersPage(), ArticlePage(), CartLineItem(), ADR-0012, PriceTag() (+3 more)

### Community 122 - "product/[slug]/page.tsx"
Cohesion: 0.30
Nodes (10): parseTopic(), SupportFaqPage(), RatingStars(), Breadcrumb(), BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink(), BreadcrumbList() (+2 more)

### Community 123 - "cn.ts"
Cohesion: 0.11
Nodes (16): ArticleCard, ArticleCards(), BrandStory(), BrandStoryImage, CategoryGrid(), COLUMN_CLASSES, ContentCard, ContentCarousel() (+8 more)

### Community 125 - "AddressesManager"
Cohesion: 0.20
Nodes (4): AddressesManager(), NON_DEFAULT, toFormState(), SavedAddress

### Community 132 - "checkout-address-prefill.test.tsx"
Cohesion: 0.33
Nodes (4): DEFAULT_ADDRESS, fetchRoutingTo(), json(), PRICED_RESPONSE

### Community 136 - "Product"
Cohesion: 0.16
Nodes (14): CarouselNav(), CollectionCarousel(), ProductCard(), product, ProductGrid(), Gtag, product, track() (+6 more)

### Community 138 - "orders-preferred-payment.test.ts"
Cohesion: 0.29
Nodes (3): ADDRESS, jar, LINES

### Community 139 - "checkout-price-preview.test.tsx"
Cohesion: 0.40
Nodes (3): fetchRoutingTo(), json(), PRICED_RESPONSE

### Community 141 - "nav-destinations.test.ts"
Cohesion: 0.19
Nodes (14): MegaNav(), getNavItems(), NavItem, NavLink, facetDestinations(), facetHrefs(), segmentsOf(), ADR-0019 (+6 more)

### Community 142 - "add-to-cart.tsx"
Cohesion: 0.23
Nodes (7): AddToCart(), dict, push, ADR-0010, useBuyNow(), productLineSchema, rxSchemaForLensType()

### Community 143 - "schemas/orders.ts"
Cohesion: 0.12
Nodes (15): OrderStatusTimeline(), PROGRESSION, TERMINAL_DISTINCT, priceLineInputSchema, currencySchema, OrderLine, orderLineSchema, placeOrderRequestSchema (+7 more)

### Community 144 - "order-summary.tsx"
Cohesion: 0.29
Nodes (7): ADR-0012, CardAction(), CardDescription(), CardFooter(), CardHeader(), CardTitle(), Separator()

### Community 149 - "cn"
Cohesion: 0.13
Nodes (18): QuantityStepper(), HomeSection(), ADR-0013, AlertAction(), AspectRatio(), FieldTitle(), Label(), SelectContent() (+10 more)

### Community 152 - "Task 18: Cart page + line item + order summary"
Cohesion: 0.33
Nodes (6): Task 18: Cart page + line item + order summary, Task 19: Checkout + success (stubbed payment), Task 20: Final verification (responsive, a11y, build, tests), OrderSummary component, Pages table (Home, Collection, PDP, Cart, Checkout, Checkout success), Testing strategy (Vitest unit + RTL component tests)

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
- **548 isolated node(s):** `npx`, `Stage`, `push`, `push`, `Stage` (+543 more)
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