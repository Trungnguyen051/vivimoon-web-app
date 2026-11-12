# Graph Report - vivimoon-web-app  (2026-11-12)

## Corpus Check
- 463 files · ~244,675 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2088 nodes · 5310 edges · 154 communities (104 shown, 50 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 35 edges (avg confidence: 0.78)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `80530f60`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Product
- cart.ts
- Dictionary
- auth.ts
- rx.ts
- payments.ts
- mock/index.ts
- dependencies
- Vivimoon M2 — Purchase Core Implementation Plan
- schemas/orders.ts
- devDependencies
- Vivimoon — Client Scope Design Spec
- compilerOptions
- components.json
- catalog.ts
- articles/page.tsx
- Product domain type
- spec-table.tsx
- i18n seam (locale-prefixed routes, getDictionary)
- cart-reducer.test.ts
- Coolmate.me Feature & Structure Analysis
- discovery/mock.ts
- article-page.test.tsx
- en.ts
- Two-tier component architecture (ui/ vs commerce/)
- Product Detail Page (PDP) structure
- product/[slug]/page.tsx
- variant-selector.tsx
- editorial.ts
- account/mock.ts
- Vivimoon Storefront Baseline Design Spec
- parseProductQueryLoose
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
- Locale
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
- cart-store.ts
- sign-in.test.tsx
- triage-labels.md
- Vivimoon
- cart-view.tsx
- loyalty/page.tsx
- cn.ts
- api/config.ts
- lens-viewer.tsx
- account/route.ts
- Process
- Vivimoon M1 — Foundation Implementation Plan
- common.ts
- scripts
- lens-facets.ts
- editorial/mock.ts
- footer.tsx
- client.ts
- Vivimoon M4 — Discovery Implementation Plan
- auth/mock.ts
- 0001-proxy-seam-replaces-repository-interface.md
- 0002-server-components-self-fetch-mutable-state.md
- 0003-client-never-computes-money.md
- add-to-cart.tsx
- [locale]/page.tsx
- shadcn
- support/page.tsx
- apiOk
- cart/page.test.tsx
- 0016-ui-primitives-move-to-base-ui.md
- to-spec/SKILL.md
- 0017-expiry-is-shopper-facing-replacement-is-the-wire-name.md
- 0004-rx-schema-ships-cyl-axis-before-toric-ui.md
- 0005-eye-enlargement-computed-not-stored.md
- hub.test.tsx
- 5. Migration Strategy
- 0006-guest-order-tracking-via-emailed-link.md
- 0007-payment-ui-branches-on-intent-shape.md
- checkout.ts
- 0008-cart-hydration-gate-flag.md
- 0009-session-tokens-signed-and-expiring.md
- newsletter/route.ts
- 1. Overview
- order-history-card.test.tsx
- 3. Architecture — the proxy seam
- AccountInfo
- proxy.ts
- checkout-view.tsx
- sign-up.test.tsx
- Vivimoon.vn — Live Site Data-Model Audit
- cn
- cookie.ts
- vouchers/page.tsx
- ForgotPasswordForm
- guide.test.tsx
- addresses-manager.tsx
- 0010-product-line-excludes-correction-complexity.md
- 0011-eye-enlargement-derives-from-graphic-diameter.md
- order-detail-view.tsx
- button.tsx
- add-to-cart.test.tsx
- useSessionStore
- 0013-pages-own-their-width.md
- 0012-unavailable-cart-lines-are-reported-not-dropped.md
- Pages run full-bleed with 40px gutters; `PageContainer` no longer caps at `max-w-7xl`
- package.json
- @types/node
- account-shell.tsx
- dictionaries.ts
- An Article's inline products come from its Reading Theme, not from the Article
- A Guide is a fixed-layout document, and not an Article
- The Support search box filters FAQ Entries; it is not storefront search
- checkout-address-prefill.test.tsx
- @types/react
- 0014-image-optimization-is-on.md
- schemas/support.ts
- zustand
- prettier
- @vitejs/plugin-react
- OtpStage
- Order lookup is by order code alone, shown inline
- A phone sign-up is not an account until its OTP is verified
- lucide-react
- vitest

## God Nodes (most connected - your core abstractions)
1. `cn()` - 175 edges
2. `getDictionary()` - 94 edges
3. `apiOk()` - 75 edges
4. `Locale` - 59 edges
5. `apiFail()` - 57 edges
6. `isLocale()` - 54 edges
7. `Dictionary` - 51 edges
8. `readSessionUserId()` - 48 edges
9. `parseBody()` - 40 edges
10. `apiRequest()` - 32 edges

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

## Communities (154 total, 50 thin omitted)

### Community 0 - "Product"
Cohesion: 0.12
Nodes (15): QuizFlow(), definition, mockedApiRequest, CarouselNav(), CollectionCarousel(), ProductCard(), product, ProductGrid() (+7 more)

### Community 1 - "cart.ts"
Cohesion: 0.09
Nodes (22): BASELINE_LINES, RX, ADR-0012, cartLineSchema, cartStateSchema, MAX_LINE_QUANTITY, priceCartRequestSchema, pricedCartSchema (+14 more)

### Community 2 - "Dictionary"
Cohesion: 0.15
Nodes (21): Stage, Dict, ADR-0021, SocialAuth(), ADR-0022, Alert(), AlertAction(), AlertDescription() (+13 more)

### Community 3 - "auth.ts"
Cohesion: 0.14
Nodes (28): POST(), jar, POST(), POST(), POST(), POST(), POST(), POST() (+20 more)

### Community 4 - "rx.ts"
Cohesion: 0.12
Nodes (21): eyeSummary(), RxSummary(), AXIS_STEPS, defaultRxSchema, defaultSphSchema, Rx, RxEye, rxEyeSchema (+13 more)

### Community 5 - "payments.ts"
Cohesion: 0.14
Nodes (15): PaymentMethodPicker(), dict, payments, mockPayments, PaymentError, Payments, PaymentIntent, PaymentIntentRequest (+7 more)

### Community 6 - "mock/index.ts"
Cohesion: 0.07
Nodes (30): ProductPage(), renderProduct(), addresses, collections, favorites, galleries, HOME_ADDRESS, OFFICE_ADDRESS (+22 more)

### Community 7 - "dependencies"
Cohesion: 0.07
Nodes (27): @base-ui/react, class-variance-authority, clsx, embla-carousel-react, @hookform/resolvers, next, @next/third-parties, dependencies (+19 more)

### Community 8 - "Vivimoon M2 — Purchase Core Implementation Plan"
Cohesion: 0.11
Nodes (19): File Structure, Global Constraints, M2 Definition of Done, Scope note: why `cyl`/`axis` exist in the schema but not the UI, Task 10: Order placement, Task 11: Guest → member cart merge, Task 12: Buy Now, Task 13: M2 verification (+11 more)

### Community 9 - "schemas/orders.ts"
Cohesion: 0.09
Nodes (31): AccountLayout(), fetchData(), ADR-0002, fetchOrder(), OrderDetailPage(), fetchOrders(), OrderHistoryPage(), lookUpOrder() (+23 more)

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
Cohesion: 0.07
Nodes (33): mockedApiRequest, useComparisonMatrix(), UseComparisonMatrixResult, Collection, collectionSchema, CompareRequest, compareRequestSchema, ComparisonMatrix (+25 more)

### Community 15 - "articles/page.tsx"
Cohesion: 0.18
Nodes (13): renderIndex(), ArticlesPage(), readSort(), readTheme(), LeadArticle(), ReadingThemeChip, ReadingThemeChips(), chips (+5 more)

### Community 16 - "Product domain type"
Cohesion: 0.11
Nodes (20): Planned file structure (app/, lib/, content/, features/cart/, components/, tests/), Global constraints (Node 20+, TS strict, no hardcoded strings, no raw gtag, no data-fetching in ui/commerce components), Vivimoon Storefront Baseline Implementation Plan, Task 1: Scaffold project & tooling, Task 2: Testing setup (Vitest + RTL), Task 3: Utilities (cn, formatPrice), Task 4: Domain types, Task 5: Mock content (+12 more)

### Community 17 - "spec-table.tsx"
Cohesion: 0.38
Nodes (5): SpecTable(), baseSpecs, dict, ADR-0011, ProductSpecs

### Community 18 - "i18n seam (locale-prefixed routes, getDictionary)"
Cohesion: 0.11
Nodes (19): Multi-language/locale switcher (topbar), Utility topbar (Coolmate), Task 7: i18n seam (config, dictionaries, middleware), Task 8: Analytics seam (GA4), Analytics seam (GA4 via typed track() wrapper), GA4 ecommerce events (view_item_list, select_item, view_item, add_to_cart, remove_from_cart, view_cart, begin_checkout, purchase), getDictionary(locale) function, @next/third-parties GoogleAnalytics component (+11 more)

### Community 19 - "cart-reducer.test.ts"
Cohesion: 0.11
Nodes (21): addToCart(), dict, line, lineWithRx, rx, atA, atB, empty (+13 more)

### Community 20 - "Coolmate.me Feature & Structure Analysis"
Cohesion: 0.12
Nodes (16): Screen-reader-only accessible text investment, Announcement bar (Coolmate), Blog / content-marketing hub, Care & Share CSR program, Community Threads (UGC/community hub), Cookie consent banner + preference center, CXP by Coolmate (custom-print sub-brand), Footer (contact, link columns, address, certifications) (+8 more)

### Community 21 - "discovery/mock.ts"
Cohesion: 0.21
Nodes (10): quiz, QUIZ_MATCHES, Discovery, DiscoveryError, mockDiscovery, toComparisonRow(), QuizDefinition, eyeEnlargementBand (+2 more)

### Community 22 - "article-page.test.tsx"
Cohesion: 0.18
Nodes (15): matchCount(), renderArticle(), ArticlePage(), readingThemeSchema, countReadingTheme(), READING_THEME_ENTRIES, readingThemeDestination, readingThemeEntry (+7 more)

### Community 23 - "en.ts"
Cohesion: 0.06
Nodes (25): geistMono, geistSans, metadata, CompareToggle(), ComparisonDialog(), matrix, mockedApiRequest, items (+17 more)

### Community 24 - "Two-tier component architecture (ui/ vs commerce/)"
Cohesion: 0.15
Nodes (14): Task 12: Carousels & CategoryGrid, Task 13: Layout chrome (AnnouncementBar, Header, MegaNav, LocaleSwitcher, Footer), Task 14: Home page, Task 15: Collection listing page + filters, CartLineItem component, CategoryGrid component, CollectionCarousel component, Two-tier component architecture (ui/ vs commerce/) (+6 more)

### Community 25 - "Product Detail Page (PDP) structure"
Cohesion: 0.15
Nodes (13): Color variants as distinct URLs (?color=slug) for SEO/deep-linking, CoolClub loyalty program + CoolCash currency, Fabric-technology brand system (cross-cutting taxonomy: CoolDry, CoolSoft, CoolRib, CoolFlex, ZeroMark), Fit-feedback histogram (Tight/True-to-size/Loose) in reviews, Product Detail Page (PDP) structure, Task 16: PDP components (Gallery, VariantSelector, SpecTable, ReviewsList), Task 17: PDP page + Add-to-cart, Task 18: Cart page + line item + order summary (+5 more)

### Community 26 - "product/[slug]/page.tsx"
Cohesion: 0.20
Nodes (15): ADR-0018, renderFaq(), parseTopic(), SupportFaqPage(), ADR-0019, PageContainer(), ADR-0013, Breadcrumb() (+7 more)

### Community 27 - "variant-selector.tsx"
Cohesion: 0.26
Nodes (8): resolveVariant(), coloredProduct, colorlessProduct, dict, VariantSelector(), selectColor(), Variant, distinctColorVariants()

### Community 28 - "editorial.ts"
Cohesion: 0.12
Nodes (17): MakeupLookCard, MakeupLooks(), cards, ADR-0018, makeupLooks, Article, articleQuerySchema, articleSchema (+9 more)

### Community 29 - "account/mock.ts"
Cohesion: 0.07
Nodes (22): ADDRESS, jar, addressErrorResponse(), DELETE(), PATCH(), POST(), jar, account (+14 more)

### Community 30 - "Vivimoon Storefront Baseline Design Spec"
Cohesion: 0.24
Nodes (11): Gender filter toggle (in-place homepage filtering), Hero banner carousel (7 slides), Homepage structure (hero carousel, promo tiles, category grid), Product card component (hover-swap, swatches, badges, price), Themed collection sections with product carousels, Build sequence (13 high-level steps), Baseline goals (demoable bilingual storefront, clean seams, prop-driven components), Explicit non-goals (Rx upload, loyalty, real payment, real DB, auth, deferred with seams) (+3 more)

### Community 31 - "parseProductQueryLoose"
Cohesion: 0.15
Nodes (15): collectionListId(), MEMBERSHIP_FILTERS, normalizeColors(), COLLECTION_COLORS, idFor(), parseProductQueryLoose(), ProductQuery, DURATION_COLLECTION (+7 more)

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
Cohesion: 0.05
Nodes (27): jar, params(), post(), jar, ADDRESS, jar, LINES, RX (+19 more)

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

### Community 42 - "Locale"
Cohesion: 0.15
Nodes (12): LocaleLayout(), ComparisonTray(), OrderActions(), HistoryLine, ADR-0012, useBuyAgain(), AnnouncementBar(), BoundaryStrings (+4 more)

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
Cohesion: 0.10
Nodes (18): vouchers, pricing, bestVoucher(), mockPricing, Pricing, BASELINE_LINES, RX, ADR-0012 (+10 more)

### Community 64 - "Domain Docs"
Cohesion: 0.33
Nodes (5): Before exploring, read these, Domain Docs, File structure, Flag ADR conflicts, Use the glossary's vocabulary

### Community 65 - "cart-store.ts"
Cohesion: 0.15
Nodes (16): ORDER_RESPONSE, renderCheckoutPage(), makeLine(), renderSuccessPage(), seedLastOrder(), cartCount(), cartReducer(), CART_STORAGE (+8 more)

### Community 69 - "cart-view.tsx"
Cohesion: 0.14
Nodes (26): FavoritesGrid(), remove(), add, push, FavoritesPage(), fetchFavorites(), CartView(), ADR-0012 (+18 more)

### Community 70 - "loyalty/page.tsx"
Cohesion: 0.20
Nodes (12): fetchLoyalty(), formatDate(), LoyaltyPage(), dict, ADR-0012, Card(), CardAction(), CardContent() (+4 more)

### Community 71 - "cn.ts"
Cohesion: 0.20
Nodes (8): LocaleError(), LocaleNotFound(), useBoundaryStrings(), Header(), LocaleLinks(), LocaleSwitcher(), Logo(), ADR-0014

### Community 72 - "api/config.ts"
Cohesion: 0.05
Nodes (35): ADDRESS, jar, LINES, RX, loyaltyHistory, ApiMode, DEPENDS_ON, rawMode() (+27 more)

### Community 73 - "lens-viewer.tsx"
Cohesion: 0.29
Nodes (8): CONTEXT_KEYS, LensViewer(), ProductGallery(), Tabs(), TabsContent(), TabsList(), tabsListVariants, TabsTrigger()

### Community 74 - "account/route.ts"
Cohesion: 0.18
Nodes (7): jar, DELETE(), GET(), PATCH(), POST(), endSession(), accountPatchSchema

### Community 75 - "Process"
Cohesion: 0.15
Nodes (12): 1. Gather context, 2. Explore the codebase (optional), 3. Draft vertical slices, 4. Quiz the user, 5. Publish the tickets to the configured tracker, Acceptance criteria, Blocked by, <NN> — <Ticket title> (+4 more)

### Community 76 - "Vivimoon M1 — Foundation Implementation Plan"
Cohesion: 0.11
Nodes (18): File Structure, Global Constraints, M1 Definition of Done, Task 10: Browser API client, session sync, and the sign-in / sign-up pages, Task 11: Forgot-password OTP flow, Task 12: Account resource and route handlers, Task 13: Account page, route guards, and M1 verification, Task 1: API config and response envelope (+10 more)

### Community 77 - "common.ts"
Cohesion: 0.12
Nodes (13): POST(), GET(), req(), GET(), POST(), discovery, ApiError, apiErrorSchema (+5 more)

### Community 78 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, build, dev, lint, start, test, test:contract, test:contract:upstream (+2 more)

### Community 79 - "lens-facets.ts"
Cohesion: 0.06
Nodes (52): HomePage(), CollectionFilters(), DIAMETERS, MATERIALS, QUERY_KEYS, SORTS, colors, push (+44 more)

### Community 80 - "editorial/mock.ts"
Cohesion: 0.21
Nodes (13): Editorial, mockEditorial, searchable(), ArticleQuery, Topic, FaqQuery, filterFaqEntries(), searchable() (+5 more)

### Community 81 - "footer.tsx"
Cohesion: 0.33
Nodes (7): Footer(), CHANNELS, CONTACT_CHANNELS, ContactChannel, ContactChannelId, contactEmail(), contactHotline()

### Community 82 - "client.ts"
Cohesion: 0.13
Nodes (10): FavoriteButton(), toggle(), NewsletterSignup(), mockedApiRequest, mockedApiRequest, UsePricedCartResult, SessionStatus, apiRequest() (+2 more)

### Community 83 - "Vivimoon M4 — Discovery Implementation Plan"
Cohesion: 0.13
Nodes (15): File Structure, Global Constraints, M4 Definition of Done, Scope note: the §6/§10 eyeEnlargement conflict, Task 1: Mirrored reviews — source badge, Task 2: Comparison — eye-enlargement banding, schemas, discovery resource, Task 3: Comparison — store, toggle, persistent tray, Task 4: Comparison — matrix Dialog (+7 more)

### Community 84 - "auth/mock.ts"
Cohesion: 0.10
Nodes (18): Auth, findByIdentifier(), mockAuth, OtpRecord, otps, pendingSignups, resetMockAuthState(), ResetRecord (+10 more)

### Community 89 - "add-to-cart.tsx"
Cohesion: 0.15
Nodes (14): ADR-0010, emptyRxDraft, EyeFields(), RxDraft, RxEyeDraft, RxRanges, RxSelector(), dict (+6 more)

### Community 90 - "[locale]/page.tsx"
Cohesion: 0.09
Nodes (25): BRAND_STORY_IMAGES, TV_THUMBS, ArticleCard, ArticleCards(), BrandStory(), BrandStoryImage, CategoryGrid(), COLUMN_CLASSES (+17 more)

### Community 92 - "support/page.tsx"
Cohesion: 0.18
Nodes (12): FaqAccordion(), FaqAnswer, entries, PolicyId, TOPIC_ICONS, OrderLookupForm(), SearchForm(), ADR-0020 (+4 more)

### Community 93 - "apiOk"
Cohesion: 0.12
Nodes (30): GET(), DELETE(), GET(), POST(), GET(), POST(), GET(), GET() (+22 more)

### Community 94 - "cart/page.test.tsx"
Cohesion: 0.33
Nodes (5): mockedApiRequest, renderCartPage(), renderWithStaleLine(), track, ADR-0012

### Community 96 - "to-spec/SKILL.md"
Cohesion: 0.22
Nodes (8): Further Notes, Implementation Decisions, Out of Scope, Problem Statement, Process, Solution, Testing Decisions, User Stories

### Community 100 - "hub.test.tsx"
Cohesion: 0.12
Nodes (17): post(), featured, renderHub(), ADR-0020, SupportPage(), renderHub(), guides, ADR-0019 (+9 more)

### Community 101 - "5. Migration Strategy"
Cohesion: 0.33
Nodes (6): 5. Migration Strategy, Adapting drift, Conformance suite, Cutover order, Per-resource cutover, Runtime validation

### Community 104 - "checkout.ts"
Cohesion: 0.23
Nodes (8): POST(), ADDRESS, LINES, Address, shippingOptionSchema, ShippingQuoteRequest, shippingQuoteRequestSchema, shippingQuoteResponseSchema

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

### Community 115 - "checkout-view.tsx"
Cohesion: 0.18
Nodes (12): renderCheckoutPage(), CheckoutView(), ADR-0012, AlertTitle(), toPriceLines(), usePricedCart(), isPhone(), addressLabelSchema (+4 more)

### Community 117 - "sign-up.test.tsx"
Cohesion: 0.20
Nodes (5): SignUpForm(), authenticate(), done(), push, user

### Community 118 - "Vivimoon.vn — Live Site Data-Model Audit"
Cohesion: 0.40
Nodes (4): 1. Site structure, 2. Product detail page — data fields observed, 3. Open question — not acted on, Vivimoon.vn — Live Site Data-Model Audit

### Community 119 - "cn"
Cohesion: 0.10
Nodes (27): QuantityStepper(), RatingStars(), ITEM_CLASS, AspectRatio(), BreadcrumbEllipsis(), Label(), NavigationMenu(), NavigationMenuContent() (+19 more)

### Community 120 - "cookie.ts"
Cohesion: 0.13
Nodes (12): BASELINE_LINES, jar, RX, jar, jar, secret(), SESSION_COOKIE, sessionCookieOptions() (+4 more)

### Community 121 - "vouchers/page.tsx"
Cohesion: 0.17
Nodes (14): discountLabel(), fetchVouchers(), formatDate(), VouchersPage(), CartLineItem(), ADR-0012, steps, arrival() (+6 more)

### Community 122 - "ForgotPasswordForm"
Cohesion: 0.36
Nodes (6): ForgotPasswordForm(), reportServer(), requestCode(), submitPassword(), verifyCode(), push

### Community 123 - "guide.test.tsx"
Cohesion: 0.15
Nodes (16): renderGuide(), GuidePage(), ADR-0022, NavItem, articles, topicSchema, readingMinutes(), ADR-0005 (+8 more)

### Community 125 - "addresses-manager.tsx"
Cohesion: 0.14
Nodes (8): AddressDict, AddressesManager(), AddressForm(), EMPTY_FORM, FormState, NON_DEFAULT, toFormState(), SavedAddress

### Community 129 - "order-detail-view.tsx"
Cohesion: 0.13
Nodes (15): formatDate(), OrderDetailView(), dict, push, renderView(), Tone, TONE_CLASS, toneOf() (+7 more)

### Community 130 - "button.tsx"
Cohesion: 0.15
Nodes (17): GENDERS, fill(), OrderHistoryCard(), ADR-0012, PriceTag(), Button(), Dialog(), DialogContent() (+9 more)

### Community 131 - "add-to-cart.test.tsx"
Cohesion: 0.33
Nodes (3): dict, push, productLineSchema

### Community 132 - "useSessionStore"
Cohesion: 0.12
Nodes (13): push, user, fetchRoutingTo(), json(), PRICED_RESPONSE, renderCheckoutPage(), SessionStore, SessionUser (+5 more)

### Community 137 - "package.json"
Cohesion: 0.50
Nodes (3): name, private, version

### Community 141 - "account-shell.tsx"
Cohesion: 0.40
Nodes (3): AccountShell(), AccountShellDict, dict

### Community 142 - "dictionaries.ts"
Cohesion: 0.15
Nodes (19): AboutPage(), AddressesPage(), fetchAddresses(), AccountPage(), fetchAccount(), ForgotPasswordPage(), SignInPage(), SignUpPage() (+11 more)

### Community 149 - "checkout-address-prefill.test.tsx"
Cohesion: 0.33
Nodes (5): DEFAULT_ADDRESS, fetchRoutingTo(), json(), PRICED_RESPONSE, renderCheckoutPage()

### Community 153 - "schemas/support.ts"
Cohesion: 0.13
Nodes (13): faqEntries, ADR-0019, FaqEntry, faqEntrySchema, guideFeedbackSchema, guideSchema, GuideStep, guideStepSchema (+5 more)

### Community 157 - "OtpStage"
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
- **622 isolated node(s):** `npx`, `Stage`, `push`, `push`, `Dict` (+617 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **50 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

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