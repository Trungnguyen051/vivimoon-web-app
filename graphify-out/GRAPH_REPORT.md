# Graph Report - agent-a9da890e043e68aaa  (2026-11-12)

## Corpus Check
- 487 files · ~266,960 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2273 nodes · 5857 edges · 175 communities (121 shown, 54 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 40 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a5a36f6c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- variant-selector.tsx
- cart.ts
- checkout-view.tsx
- apiOk
- rx.ts
- api/config.ts
- mini-cart.tsx
- dependencies
- Vivimoon M2 — Purchase Core Implementation Plan
- mock/index.ts
- devDependencies
- Vivimoon — Client Scope Design Spec
- compilerOptions
- components.json
- catalog.ts
- types/index.ts
- Product domain type
- articles/page.tsx
- i18n seam (locale-prefixed routes, getDictionary)
- line-summary.tsx
- Coolmate.me Feature & Structure Analysis
- index-shape.test.tsx
- article-page.test.tsx
- comparison-tray.tsx
- Two-tier component architecture (ui/ vs commerce/)
- Product Detail Page (PDP) structure
- product/[slug]/page.tsx
- discovery/mock.ts
- editorial.ts
- account/mock.ts
- Vivimoon Storefront Baseline Design Spec
- cart-store.ts
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
- reviews-list.tsx
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
- pricing/mock.ts
- Domain Docs
- vouchers/page.tsx
- sign-in.test.tsx
- triage-labels.md
- Vivimoon
- Locale
- cart-line-item.tsx
- orders-preferred-payment.test.ts
- parseProductQueryLoose
- purchaseUnitOf
- en.ts
- Process
- Vivimoon M1 — Foundation Implementation Plan
- rx-selector.tsx
- scripts
- lens-facets.ts
- editorial/mock.ts
- proxy.ts
- order-detail-view.tsx
- Vivimoon M4 — Discovery Implementation Plan
- auth.ts
- 0001-proxy-seam-replaces-repository-interface.md
- 0002-server-components-self-fetch-mutable-state.md
- 0003-client-never-computes-money.md
- payments.ts
- [locale]/page.tsx
- shadcn
- accordion.tsx
- readSessionUserId
- mega-nav.tsx
- 0016-ui-primitives-move-to-base-ui.md
- to-spec/SKILL.md
- 0017-expiry-is-shopper-facing-replacement-is-the-wire-name.md
- 0004-rx-schema-ships-cyl-axis-before-toric-ui.md
- 0005-eye-enlargement-computed-not-stored.md
- schemas/support.ts
- 5. Migration Strategy
- 0006-guest-order-tracking-via-emailed-link.md
- 0007-payment-ui-branches-on-intent-shape.md
- collection-filters.tsx
- 0008-cart-hydration-gate-flag.md
- 0009-session-tokens-signed-and-expiring.md
- newsletter.ts
- 1. Overview
- order-history-card.test.tsx
- 3. Architecture — the proxy seam
- AccountInfo
- checkout-address-prefill.test.tsx
- schema.ts
- orders/route.test.ts
- sign-up.test.tsx
- Vivimoon.vn — Live Site Data-Model Audit
- cn
- rx-ranges.ts
- track/page.tsx
- ForgotPasswordForm
- guide.test.tsx
- loyalty/mock.ts
- AddressesManager
- lens-viewer.tsx
- 0010-product-line-excludes-correction-complexity.md
- 0011-eye-enlargement-derives-from-graphic-diameter.md
- response.ts
- button.tsx
- checkout.ts
- apiFail
- 0013-pages-own-their-width.md
- 0012-unavailable-cart-lines-are-reported-not-dropped.md
- Pages run full-bleed with 40px gutters; `PageContainer` no longer caps at `max-w-7xl`
- app/layout.tsx
- package.json
- Cart Lines carry a Purchase Unit; a lens is priced per single lens
- Guest orders earn Held Points, credited when an account verifies the phone
- orders-loyalty-award.test.ts
- vouchers/mock.ts
- dictionaries.ts
- client.ts
- Checkout offers QR transfer, cash on delivery and e-wallet; email becomes optional
- An Article's inline products come from its Reading Theme, not from the Article
- A Guide is a fixed-layout document, and not an Article
- The Support search box filters FAQ Entries; it is not storefront search
- list-id.ts
- @types/react
- 0014-image-optimization-is-on.md
- catalog/mock.ts
- schemas/orders.ts
- zustand
- cart/page.test.tsx
- @vitejs/plugin-react
- checkout-price-preview.test.tsx
- Order lookup is by order code alone, shown inline
- A phone sign-up is not an account until its OTP is verified
- lucide-react
- vitest
- mini-cart.test.tsx
- products/reviews.ts
- fixtures.test.ts
- cancel/route.test.ts
- useSessionStore
- QuizFlow
- add-to-cart.tsx
- favorites-grid.tsx
- prettier
- OtpStage
- AddressForm
- shadcn

## God Nodes (most connected - your core abstractions)
1. `cn()` - 185 edges
2. `getDictionary()` - 97 edges
3. `apiOk()` - 75 edges
4. `Locale` - 63 edges
5. `Dictionary` - 58 edges
6. `apiFail()` - 57 edges
7. `isLocale()` - 54 edges
8. `readSessionUserId()` - 48 edges
9. `parseBody()` - 40 edges
10. `buttonVariants` - 34 edges

## Surprising Connections (you probably didn't know these)
- `README.md: Vivimoon Next.js project README` --semantically_similar_to--> `Tech stack (Next.js App Router, React 19, TS strict, Tailwind v4, shadcn/ui, embla, RHF+zod, GA4, Vitest)`  [INFERRED] [semantically similar]
  README.md → docs/superpowers/specs/2026-08-16-vivimoon-storefront-baseline-design.md
- `remove()` --calls--> `apiRequest()`  [EXTRACTED]
  app/[locale]/account/favorites/favorites-grid.tsx → lib/api/client.ts
- `renderCheckoutPage()` --calls--> `getDictionary()`  [EXTRACTED]
  app/[locale]/checkout/checkout-address-prefill.test.tsx → lib/i18n/dictionaries.ts
- `renderCheckoutPage()` --calls--> `getDictionary()`  [EXTRACTED]
  app/[locale]/checkout/checkout-buy-now.test.tsx → lib/i18n/dictionaries.ts
- `renderCheckoutPage()` --calls--> `getDictionary()`  [EXTRACTED]
  app/[locale]/checkout/checkout-preferred-payment.test.tsx → lib/i18n/dictionaries.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Cart feature data flow: reducer, storage, context, hook composing CartProvider** — docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_cartprovider, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_usecart, docs_superpowers_plans_2026_08_16_vivimoon_storefront_baseline_task9_cart_feature [EXTRACTED 1.00]
- **Four swappable architecture seams (data, theming, i18n, analytics) isolating volatility** — docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_productrepository, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_theming_seam, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_i18n_seam, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_analytics_seam [EXTRACTED 1.00]
- **Coolmate apparel patterns re-modeled for Vivimoon contact-lens domain** — docs_research_coolmate_website_analysis_product_card, docs_research_coolmate_website_analysis_pdp, docs_research_coolmate_website_analysis_color_variant_url_pattern, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_productcard, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_variant [INFERRED 0.85]

## Communities (175 total, 54 thin omitted)

### Community 0 - "variant-selector.tsx"
Cohesion: 0.26
Nodes (8): resolveVariant(), coloredProduct, colorlessProduct, dict, VariantSelector(), selectColor(), Variant, distinctColorVariants()

### Community 1 - "cart.ts"
Cohesion: 0.07
Nodes (28): BASELINE_LINES, RX, ADR-0012, bundleTagSchema, cartLineSchema, cartStateSchema, giftLineSchema, MAX_LINE_QUANTITY (+20 more)

### Community 2 - "checkout-view.tsx"
Cohesion: 0.12
Nodes (30): AddressDict, EMPTY_FORM, FormState, Stage, Dict, ADR-0021, SocialAuth(), ADR-0012 (+22 more)

### Community 3 - "apiOk"
Cohesion: 0.18
Nodes (23): DELETE(), GET(), PATCH(), POST(), jar, POST(), POST(), POST() (+15 more)

### Community 4 - "rx.ts"
Cohesion: 0.12
Nodes (18): AXIS_STEPS, defaultSphSchema, LensType, LineRxInput, Rx, RX_LENS_TYPE, RxEye, rxEyeSchema (+10 more)

### Community 5 - "api/config.ts"
Cohesion: 0.08
Nodes (24): POST(), BASELINE_LINES, jar, SINGLE, ADR-0023, ApiMode, DEPENDS_ON, rawMode() (+16 more)

### Community 6 - "mini-cart.tsx"
Cohesion: 0.17
Nodes (16): BundleOffer(), bundleAccessories, dict, mockedApiRequest, singleLens, ADR-0003, describe(), MiniCart() (+8 more)

### Community 7 - "dependencies"
Cohesion: 0.07
Nodes (27): @base-ui/react, class-variance-authority, clsx, embla-carousel-react, @hookform/resolvers, next, @next/third-parties, dependencies (+19 more)

### Community 8 - "Vivimoon M2 — Purchase Core Implementation Plan"
Cohesion: 0.11
Nodes (19): File Structure, Global Constraints, M2 Definition of Done, Scope note: why `cyl`/`axis` exist in the schema but not the UI, Task 10: Order placement, Task 11: Guest → member cart merge, Task 12: Buy Now, Task 13: M2 verification (+11 more)

### Community 9 - "mock/index.ts"
Cohesion: 0.18
Nodes (8): renderProduct(), addresses, favorites, products, defaultShippingOptions, shippingRates, mockShipping, ShippingOption

### Community 10 - "devDependencies"
Cohesion: 0.08
Nodes (25): eslint, eslint-config-next, jsdom, devDependencies, eslint, eslint-config-next, jsdom, prettier-plugin-tailwindcss (+17 more)

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
Cohesion: 0.06
Nodes (34): accessoryOptionSchema, comfortSchema, CompareRequest, compareRequestSchema, comparisonMatrixSchema, ComparisonRow, comparisonRowSchema, csvOf() (+26 more)

### Community 15 - "types/index.ts"
Cohesion: 0.20
Nodes (7): SpecTable(), baseSpecs, dict, ADR-0011, collections, Collection, ProductSpecs

### Community 16 - "Product domain type"
Cohesion: 0.11
Nodes (20): Planned file structure (app/, lib/, content/, features/cart/, components/, tests/), Global constraints (Node 20+, TS strict, no hardcoded strings, no raw gtag, no data-fetching in ui/commerce components), Vivimoon Storefront Baseline Implementation Plan, Task 1: Scaffold project & tooling, Task 2: Testing setup (Vitest + RTL), Task 3: Utilities (cn, formatPrice), Task 4: Domain types, Task 5: Mock content (+12 more)

### Community 17 - "articles/page.tsx"
Cohesion: 0.10
Nodes (24): ArticlesPage(), readSort(), readTheme(), LocaleError(), LocaleNotFound(), PolicyId, TOPIC_ICONS, ArticleCard (+16 more)

### Community 18 - "i18n seam (locale-prefixed routes, getDictionary)"
Cohesion: 0.11
Nodes (19): Multi-language/locale switcher (topbar), Utility topbar (Coolmate), Task 7: i18n seam (config, dictionaries, middleware), Task 8: Analytics seam (GA4), Analytics seam (GA4 via typed track() wrapper), GA4 ecommerce events (view_item_list, select_item, view_item, add_to_cart, remove_from_cart, view_cart, begin_checkout, purchase), getDictionary(locale) function, @next/third-parties GoogleAnalytics component (+11 more)

### Community 19 - "line-summary.tsx"
Cohesion: 0.29
Nodes (8): formatLineSummary(), formatPower(), formatPowers(), LineSummary(), power(), SummaryLine, vi, ADR-0023

### Community 20 - "Coolmate.me Feature & Structure Analysis"
Cohesion: 0.12
Nodes (16): Screen-reader-only accessible text investment, Announcement bar (Coolmate), Blog / content-marketing hub, Care & Share CSR program, Community Threads (UGC/community hub), Cookie consent banner + preference center, CXP by Coolmate (custom-print sub-brand), Footer (contact, link columns, address, certifications) (+8 more)

### Community 21 - "index-shape.test.tsx"
Cohesion: 0.23
Nodes (5): renderIndex(), articles, CARDS_PER_PAGE, knowledgeIndexLayout, ADR-0005

### Community 22 - "article-page.test.tsx"
Cohesion: 0.18
Nodes (15): matchCount(), renderArticle(), ArticlePage(), readingThemeSchema, countReadingTheme(), READING_THEME_ENTRIES, readingThemeDestination, readingThemeEntry (+7 more)

### Community 23 - "comparison-tray.tsx"
Cohesion: 0.11
Nodes (15): ComparisonDialog(), matrix, ComparisonTray(), mockedApiRequest, COMPARE_CAP, COMPARE_STORAGE, CompareState, CompareStore (+7 more)

### Community 24 - "Two-tier component architecture (ui/ vs commerce/)"
Cohesion: 0.15
Nodes (14): Task 12: Carousels & CategoryGrid, Task 13: Layout chrome (AnnouncementBar, Header, MegaNav, LocaleSwitcher, Footer), Task 14: Home page, Task 15: Collection listing page + filters, CartLineItem component, CategoryGrid component, CollectionCarousel component, Two-tier component architecture (ui/ vs commerce/) (+6 more)

### Community 25 - "Product Detail Page (PDP) structure"
Cohesion: 0.15
Nodes (13): Color variants as distinct URLs (?color=slug) for SEO/deep-linking, CoolClub loyalty program + CoolCash currency, Fabric-technology brand system (cross-cutting taxonomy: CoolDry, CoolSoft, CoolRib, CoolFlex, ZeroMark), Fit-feedback histogram (Tight/True-to-size/Loose) in reviews, Product Detail Page (PDP) structure, Task 16: PDP components (Gallery, VariantSelector, SpecTable, ReviewsList), Task 17: PDP page + Add-to-cart, Task 18: Cart page + line item + order summary (+5 more)

### Community 26 - "product/[slug]/page.tsx"
Cohesion: 0.20
Nodes (17): ADR-0018, renderFaq(), parseTopic(), SupportFaqPage(), GuidePage(), ADR-0019, Breadcrumb(), BreadcrumbItem() (+9 more)

### Community 27 - "discovery/mock.ts"
Cohesion: 0.20
Nodes (11): quiz, QUIZ_MATCHES, Discovery, DiscoveryError, mockDiscovery, toComparisonRow(), QuizDefinition, EYE_ENLARGEMENT_BANDS (+3 more)

### Community 28 - "editorial.ts"
Cohesion: 0.12
Nodes (17): MakeupLookCard, MakeupLooks(), cards, ADR-0018, makeupLooks, Article, articleQuerySchema, articleSchema (+9 more)

### Community 29 - "account/mock.ts"
Cohesion: 0.08
Nodes (20): ADDRESS, jar, addressErrorResponse(), DELETE(), PATCH(), GET(), POST(), Account (+12 more)

### Community 30 - "Vivimoon Storefront Baseline Design Spec"
Cohesion: 0.24
Nodes (11): Gender filter toggle (in-place homepage filtering), Hero banner carousel (7 slides), Homepage structure (hero carousel, promo tiles, category grid), Product card component (hover-swap, swatches, badges, price), Themed collection sections with product carousels, Build sequence (13 high-level steps), Baseline goals (demoable bilingual storefront, clean seams, prop-driven components), Explicit non-goals (Rx upload, loyalty, real payment, real DB, auth, deferred with seams) (+3 more)

### Community 31 - "cart-store.ts"
Cohesion: 0.10
Nodes (25): ORDER_RESPONSE, renderCheckoutPage(), renderCheckoutPage(), makeLine(), renderSuccessPage(), seedLastOrder(), cartCount(), cartReducer() (+17 more)

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
Nodes (17): jar, ADR-0022, mockOrders, Orders, randomId(), randomSuffix(), resetMockOrdersState(), store (+9 more)

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

### Community 42 - "reviews-list.tsx"
Cohesion: 0.20
Nodes (10): RatingStars(), ReviewSourceBadge(), fill(), ReviewCard(), ReviewsList(), ReviewsSummary(), SUB_RATINGS, TAGS (+2 more)

### Community 46 - "source-files.ts"
Cohesion: 0.20
Nodes (9): ADR-0016, nextConfig, ADR-0014, isTest(), isVendored(), SKIP, sourceFiles(), withoutComments() (+1 more)

### Community 61 - "M1 Foundation — progress ledger"
Cohesion: 0.22
Nodes (8): M1 Foundation — progress ledger, M2 Task 11 — Guest → member cart merge (2026-09-02), M2 Task 12 — Buy Now (2026-09-02), M2 Task 13 — M2 verification (2026-09-02), M2 Task 5 — RxSelector and Rx-aware add-to-cart (2026-08-31), M2 Task 6 — Server-owned pricing and auto-voucher (2026-08-31), M2 Task 7 — Cart page renders server prices (2026-08-31), M4 Task 9 — M4 verification (2026-09-05)

### Community 62 - "Issue tracker: GitHub"
Cohesion: 0.29
Nodes (6): Conventions, Issue tracker: GitHub, Pull requests as a triage surface, Wayfinding operations, When a skill says "fetch the relevant ticket", When a skill says "publish to the issue tracker"

### Community 63 - "pricing/mock.ts"
Cohesion: 0.09
Nodes (21): bestVoucher(), mockPricing, Pricing, BASELINE_LINES, SINGLE, ADR-0012, ADR-0023, UNDER_FREESHIP_LINES (+13 more)

### Community 64 - "Domain Docs"
Cohesion: 0.33
Nodes (5): Before exploring, read these, Domain Docs, File structure, Flag ADR conflicts, Use the glossary's vocabulary

### Community 65 - "vouchers/page.tsx"
Cohesion: 0.12
Nodes (20): discountLabel(), fetchVouchers(), formatDate(), VouchersPage(), ProductPage(), CarouselNav(), CartLineItem(), CollectionCarousel() (+12 more)

### Community 69 - "Locale"
Cohesion: 0.17
Nodes (22): fetchLoyalty(), formatDate(), LoyaltyPage(), CartView(), ADR-0003, ADR-0012, SuccessView(), CollectionPage() (+14 more)

### Community 70 - "cart-line-item.tsx"
Cohesion: 0.19
Nodes (10): ADR-0012, STEPS, SelectContent(), SelectItem(), SelectLabel(), SelectScrollDownButton(), SelectScrollUpButton(), SelectSeparator() (+2 more)

### Community 71 - "orders-preferred-payment.test.ts"
Cohesion: 0.25
Nodes (4): ADDRESS, jar, LINES, RX

### Community 72 - "parseProductQueryLoose"
Cohesion: 0.21
Nodes (10): parseProductQueryLoose(), ReplacementSchedule, DURATION_COLLECTION, DURATION_TILES, DurationTile, durationTileHref(), DurationTileId, followTile() (+2 more)

### Community 73 - "purchaseUnitOf"
Cohesion: 0.31
Nodes (10): LensChips(), isSingleRx(), lensesIn(), PurchaseUnit, purchaseUnitOf(), refineUnitMatchesRx(), editLens(), Eye (+2 more)

### Community 74 - "en.ts"
Cohesion: 0.10
Nodes (19): definition, mockedApiRequest, featured, renderHub(), ADR-0020, ComfortHighlight(), items, product (+11 more)

### Community 75 - "Process"
Cohesion: 0.15
Nodes (12): 1. Gather context, 2. Explore the codebase (optional), 3. Draft vertical slices, 4. Quiz the user, 5. Publish the tickets to the configured tracker, Acceptance criteria, Blocked by, <NN> — <Ticket title> (+4 more)

### Community 76 - "Vivimoon M1 — Foundation Implementation Plan"
Cohesion: 0.11
Nodes (18): File Structure, Global Constraints, M1 Definition of Done, Task 10: Browser API client, session sync, and the sign-in / sign-up pages, Task 11: Forgot-password OTP flow, Task 12: Account resource and route handlers, Task 13: Account page, route guards, and M1 verification, Task 1: API config and response envelope (+10 more)

### Community 77 - "rx-selector.tsx"
Cohesion: 0.17
Nodes (9): chipPower(), defaultRxDraft, PowerField(), RxDraft, RxSelector(), dict, ADR-0023, LineRx (+1 more)

### Community 78 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, build, dev, lint, start, test, test:contract, test:contract:upstream (+2 more)

### Community 79 - "lens-facets.ts"
Cohesion: 0.12
Nodes (23): FacetBrowser(), Swatches(), valueLabel(), pathname, MobileNav(), mockCatalog, diameterMm(), replacementScheduleSchema (+15 more)

### Community 80 - "editorial/mock.ts"
Cohesion: 0.21
Nodes (13): Editorial, mockEditorial, searchable(), ArticleQuery, Topic, FaqQuery, filterFaqEntries(), searchable() (+5 more)

### Community 82 - "order-detail-view.tsx"
Cohesion: 0.08
Nodes (27): ADR-0012, withProducts(), OrderActions(), formatDate(), OrderDetailView(), dict, push, renderView() (+19 more)

### Community 83 - "Vivimoon M4 — Discovery Implementation Plan"
Cohesion: 0.13
Nodes (15): File Structure, Global Constraints, M4 Definition of Done, Scope note: the §6/§10 eyeEnlargement conflict, Task 1: Mirrored reviews — source badge, Task 2: Comparison — eye-enlargement banding, schemas, discovery resource, Task 3: Comparison — store, toggle, persistent tray, Task 4: Comparison — matrix Dialog (+7 more)

### Community 84 - "auth.ts"
Cohesion: 0.06
Nodes (35): jar, MockUser, users, Auth, findByIdentifier(), mockAuth, OtpRecord, otps (+27 more)

### Community 89 - "payments.ts"
Cohesion: 0.13
Nodes (16): PaymentMethodPicker(), dict, payments, mockPayments, PaymentError, Payments, PaymentIntent, PaymentIntentRequest (+8 more)

### Community 90 - "[locale]/page.tsx"
Cohesion: 0.09
Nodes (28): BRAND_STORY_IMAGES, HomePage(), TV_THUMBS, BrandStory(), BrandStoryImage, CategoryGrid(), COLUMN_CLASSES, ContentCard (+20 more)

### Community 92 - "accordion.tsx"
Cohesion: 0.27
Nodes (9): FaqAccordion(), FaqAnswer, entries, BeginnerFaq(), ProductReassurance(), Accordion(), AccordionContent(), AccordionItem() (+1 more)

### Community 93 - "readSessionUserId"
Cohesion: 0.08
Nodes (26): jar, DELETE(), GET(), POST(), GET(), GET(), jar, POST() (+18 more)

### Community 94 - "mega-nav.tsx"
Cohesion: 0.16
Nodes (17): ITEM_CLASS, MegaNav(), getNavItems(), NavItem, NavLink, NavigationMenu(), NavigationMenuContent(), NavigationMenuIndicator() (+9 more)

### Community 96 - "to-spec/SKILL.md"
Cohesion: 0.22
Nodes (8): Further Notes, Implementation Decisions, Out of Scope, Problem Statement, Process, Solution, Testing Decisions, User Stories

### Community 100 - "schemas/support.ts"
Cohesion: 0.09
Nodes (24): post(), guides, ADR-0019, faqEntries, ADR-0019, ADR-0019, guideFeedback, mockSupport (+16 more)

### Community 101 - "5. Migration Strategy"
Cohesion: 0.33
Nodes (6): 5. Migration Strategy, Adapting drift, Conformance suite, Cutover order, Per-resource cutover, Runtime validation

### Community 104 - "collection-filters.tsx"
Cohesion: 0.08
Nodes (28): CheckRow(), Chip(), CollectionFilters(), CollectionFiltersSheet(), CollectionLoadMore(), CollectionSort(), FILTER_KEYS, GROUPS (+20 more)

### Community 109 - "newsletter.ts"
Cohesion: 0.31
Nodes (7): newsletter, mockNewsletter, Newsletter, SubscribeRequest, subscribeRequestSchema, SubscriptionAck, subscriptionAckSchema

### Community 110 - "1. Overview"
Cohesion: 0.50
Nodes (4): 1. Overview, Baseline non-goals now in scope, Goals, Non-goals

### Community 111 - "order-history-card.test.tsx"
Cohesion: 0.24
Nodes (8): dict, line(), order(), product(), push, refresh, renderCard(), RX

### Community 112 - "3. Architecture — the proxy seam"
Cohesion: 0.67
Nodes (3): 3. Architecture — the proxy seam, Configuration, Resource layout

### Community 113 - "AccountInfo"
Cohesion: 0.28
Nodes (6): AccountInfo(), patch(), saveAccount(), savePersonal(), fmtDob(), fmtRx()

### Community 114 - "checkout-address-prefill.test.tsx"
Cohesion: 0.33
Nodes (5): DEFAULT_ADDRESS, fetchRoutingTo(), json(), PRICED_RESPONSE, renderCheckoutPage()

### Community 115 - "schema.ts"
Cohesion: 0.29
Nodes (6): isPhone(), addressLabelSchema, CheckoutForm, CheckoutFormInput, checkoutSchema, VALID

### Community 116 - "orders/route.test.ts"
Cohesion: 0.22
Nodes (5): ADDRESS, BASELINE_LINES, jar, RX, ADR-0012

### Community 117 - "sign-up.test.tsx"
Cohesion: 0.20
Nodes (5): SignUpForm(), authenticate(), done(), push, user

### Community 118 - "Vivimoon.vn — Live Site Data-Model Audit"
Cohesion: 0.40
Nodes (4): 1. Site structure, 2. Product detail page — data fields observed, 3. Open question — not acted on, Vivimoon.vn — Live Site Data-Model Audit

### Community 119 - "cn"
Cohesion: 0.09
Nodes (29): LensViewer(), OrderSummary(), dict, ADR-0012, QuantityStepper(), HomeSection(), ADR-0013, LocaleLinks() (+21 more)

### Community 120 - "rx-ranges.ts"
Cohesion: 0.33
Nodes (7): AddBand, addBands, axisSteps(), cylValues, hundredths(), RX_RANGES, sphSteps()

### Community 121 - "track/page.tsx"
Cohesion: 0.09
Nodes (22): AccountShell(), AccountShellDict, dict, fetchFavorites(), AccountLayout(), fetchData(), ADR-0002, fetchOrder() (+14 more)

### Community 122 - "ForgotPasswordForm"
Cohesion: 0.36
Nodes (6): ForgotPasswordForm(), reportServer(), requestCode(), submitPassword(), verifyCode(), push

### Community 123 - "guide.test.tsx"
Cohesion: 0.14
Nodes (18): renderGuide(), SupportPage(), renderHub(), ADR-0022, Footer(), topicSchema, locales, CHANNELS (+10 more)

### Community 124 - "loyalty/mock.ts"
Cohesion: 0.19
Nodes (8): loyaltyHistory, Loyalty, mockLoyalty, store, LoyaltyBalance, loyaltyBalanceSchema, LoyaltyEntry, loyaltyEntrySchema

### Community 125 - "AddressesManager"
Cohesion: 0.22
Nodes (3): AddressesManager(), NON_DEFAULT, toFormState()

### Community 126 - "lens-viewer.tsx"
Cohesion: 0.14
Nodes (10): Slide, Tab, TABS, gallery, tones, videos, ViewerVideo, galleries (+2 more)

### Community 129 - "response.ts"
Cohesion: 0.15
Nodes (11): POST(), POST(), GET(), POST(), discovery, apiErrorSchema, envelopeSchema(), ERROR_CODES (+3 more)

### Community 130 - "button.tsx"
Cohesion: 0.17
Nodes (14): GENDERS, fill(), ADR-0012, Button(), Dialog(), DialogContent(), DialogDescription(), DialogHeader() (+6 more)

### Community 131 - "checkout.ts"
Cohesion: 0.15
Nodes (12): POST(), ADDRESS, LINES, shipping, Shipping, ShippingError, Address, addressSchema (+4 more)

### Community 132 - "apiFail"
Cohesion: 0.16
Nodes (14): GET(), GET(), GET(), ADR-0022, GET(), GET(), req(), GET() (+6 more)

### Community 136 - "app/layout.tsx"
Cohesion: 0.28
Nodes (5): geistMono, geistSans, metadata, CartHydrator(), CompareHydrator()

### Community 137 - "package.json"
Cohesion: 0.50
Nodes (3): name, private, version

### Community 140 - "orders-loyalty-award.test.ts"
Cohesion: 0.25
Nodes (4): ADDRESS, jar, LINES, RX

### Community 141 - "vouchers/mock.ts"
Cohesion: 0.31
Nodes (5): vouchers, vouchers, mockVouchers, Vouchers, Voucher

### Community 142 - "dictionaries.ts"
Cohesion: 0.11
Nodes (25): AboutPage(), AddressesPage(), fetchAddresses(), FavoritesPage(), OrderHistoryPage(), AccountPage(), fetchAccount(), ForgotPasswordPage() (+17 more)

### Community 143 - "client.ts"
Cohesion: 0.11
Nodes (13): CheckoutView(), FavoriteButton(), toggle(), GuideFeedback(), mockedApiRequest, NewsletterSignup(), mockedApiRequest, mockedApiRequest (+5 more)

### Community 149 - "list-id.ts"
Cohesion: 0.36
Nodes (6): collectionListId(), MEMBERSHIP_FILTERS, normalizeColors(), COLLECTION_COLORS, idFor(), ProductQuery

### Community 152 - "catalog/mock.ts"
Cohesion: 0.14
Nodes (18): reviews, applies(), Catalog, FacetCounts, FacetDef, FacetKey, inPriceRange(), matchesValue() (+10 more)

### Community 153 - "schemas/orders.ts"
Cohesion: 0.14
Nodes (13): HOME_ADDRESS, OFFICE_ADDRESS, orders, currencySchema, Order, orderLineSchema, placeOrderRequestSchema, publicOrderSchema (+5 more)

### Community 155 - "cart/page.test.tsx"
Cohesion: 0.25
Nodes (7): mockedApiRequest, renderCartPage(), renderWithStaleLine(), track, ADR-0012, UsePricedCartResult, PricedCart

### Community 157 - "checkout-price-preview.test.tsx"
Cohesion: 0.40
Nodes (4): fetchRoutingTo(), json(), PRICED_RESPONSE, renderCheckoutPage()

### Community 162 - "mini-cart.test.tsx"
Cohesion: 0.10
Nodes (18): dict, line, lineWithRx, rx, dict, mockedApiRequest, sandkiss(), accessories (+10 more)

### Community 164 - "products/reviews.ts"
Cohesion: 0.32
Nodes (6): filterReviews(), reviewStats(), SUB_RATINGS, SubRatings, base, reviews

### Community 165 - "fixtures.test.ts"
Cohesion: 0.11
Nodes (15): base, reviews, userSchema, voucherSchema, accessorySchema, collectionSchema, lensGallerySchema, productLineSchema (+7 more)

### Community 166 - "cancel/route.test.ts"
Cohesion: 0.50
Nodes (3): jar, params(), post()

### Community 167 - "useSessionStore"
Cohesion: 0.16
Nodes (9): push, user, SessionStore, SessionUser, user, useSessionStore, SessionSync(), base (+1 more)

### Community 169 - "add-to-cart.tsx"
Cohesion: 0.23
Nodes (6): AddToCart(), dict, push, ADR-0023, draftToRx(), useBuyNow()

### Community 170 - "favorites-grid.tsx"
Cohesion: 0.18
Nodes (10): FavoritesGrid(), addToCart(), remove(), add, push, Gtag, product, AnalyticsEvent (+2 more)

### Community 172 - "OtpStage"
Cohesion: 0.67
Nodes (3): OtpStage(), fill(), resend()

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
- **694 isolated node(s):** `npx`, `Stage`, `push`, `push`, `Dict` (+689 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **54 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

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