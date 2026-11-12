# Graph Report - agent-a942991ef4d6f4950  (2026-11-13)

## Corpus Check
- 503 files · ~283,122 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2386 nodes · 6324 edges · 175 communities (123 shown, 52 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 44 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `94e9c60a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- dictionaries.ts
- cart.ts
- addresses-manager.tsx
- parseBody
- mini-cart.test.tsx
- payments.ts
- add-to-cart.tsx
- dependencies
- Vivimoon M2 — Purchase Core Implementation Plan
- apiOk
- devDependencies
- Vivimoon — Client Scope Design Spec
- compilerOptions
- components.json
- catalog.ts
- vi.ts
- Product domain type
- fixtures.test.ts
- i18n seam (locale-prefixed routes, getDictionary)
- rx.ts
- Coolmate.me Feature & Structure Analysis
- mock/index.ts
- reading-themes.ts
- cart-line-item.tsx
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
- checkout-view.tsx
- Domain Docs
- cn.ts
- order-detail-view.tsx
- triage-labels.md
- Vivimoon
- collection/[slug]/page.tsx
- schemas/orders.ts
- quick-add.tsx
- fetchViaSelf
- support/mock.ts
- client.ts
- Process
- Vivimoon M1 — Foundation Implementation Plan
- catalog
- scripts
- lens-facets.ts
- editorial/mock.ts
- plp-card.ts
- cart-view.tsx
- Vivimoon M4 — Discovery Implementation Plan
- auth.ts
- 0001-proxy-seam-replaces-repository-interface.md
- 0002-server-components-self-fetch-mutable-state.md
- 0003-client-never-computes-money.md
- response.ts
- [locale]/page.tsx
- shadcn
- accordion.tsx
- cookie.ts
- price/route.ts
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
- newsletter/route.ts
- 1. Overview
- order-history-card.test.tsx
- 3. Architecture — the proxy seam
- submit/route.ts
- checkout-guest-member.test.tsx
- order-detail-view.test.tsx
- orders-preferred-payment.test.ts
- sign-up.test.tsx
- Vivimoon.vn — Live Site Data-Model Audit
- cn
- cart/page.test.tsx
- account/layout.tsx
- ForgotPasswordForm
- support/page.tsx
- loyalty/mock.ts
- AddressesManager
- lens-viewer.tsx
- 0010-product-line-excludes-correction-complexity.md
- 0011-eye-enlargement-derives-from-graphic-diameter.md
- quiz-card.tsx
- account-info.tsx
- track/page.tsx
- spec-table.tsx
- 0013-pages-own-their-width.md
- 0012-unavailable-cart-lines-are-reported-not-dropped.md
- Pages run full-bleed with 40px gutters; `PageContainer` no longer caps at `max-w-7xl`
- compare-store.ts
- package.json
- Cart Lines carry a Purchase Unit; a lens is priced per single lens
- Guest orders earn Held Points, credited when an account verifies the phone
- track/route.ts
- vouchers/route.ts
- getDictionary
- useSessionStore
- Checkout offers QR transfer, cash on delivery and e-wallet; email becomes optional
- An Article's inline products come from its Reading Theme, not from the Article
- A Guide is a fixed-layout document, and not an Article
- The Support search box filters FAQ Entries; it is not storefront search
- list-id.ts
- @types/react
- 0014-image-optimization-is-on.md
- catalog/mock.ts
- mini-cart.tsx
- zustand
- cancel/route.test.ts
- @vitejs/plugin-react
- locales
- Order lookup is by order code alone, shown inline
- A phone sign-up is not an account until its OTP is verified
- articles/page.tsx
- vitest
- index-shape.test.tsx
- mobile-nav.tsx
- orders-loyalty-award.test.ts
- use-comparison.test.ts
- orders/route.test.ts
- sign-in.test.tsx
- SupportFaqPage
- product-videos.tsx
- prettier
- site-chrome.tsx
- @types/node
- lucide-react

## God Nodes (most connected - your core abstractions)
1. `cn()` - 201 edges
2. `getDictionary()` - 100 edges
3. `apiOk()` - 75 edges
4. `Locale` - 68 edges
5. `Dictionary` - 66 edges
6. `apiFail()` - 57 edges
7. `isLocale()` - 56 edges
8. `readSessionUserId()` - 48 edges
9. `buttonVariants` - 42 edges
10. `parseBody()` - 40 edges

## Surprising Connections (you probably didn't know these)
- `README.md: Vivimoon Next.js project README` --semantically_similar_to--> `Tech stack (Next.js App Router, React 19, TS strict, Tailwind v4, shadcn/ui, embla, RHF+zod, GA4, Vitest)`  [INFERRED] [semantically similar]
  README.md → docs/superpowers/specs/2026-08-16-vivimoon-storefront-baseline-design.md
- `renderCheckoutPage()` --calls--> `getDictionary()`  [EXTRACTED]
  app/[locale]/checkout/(flow)/checkout-buy-now.test.tsx → lib/i18n/dictionaries.ts
- `renderCheckoutPage()` --calls--> `getDictionary()`  [EXTRACTED]
  app/[locale]/checkout/(flow)/checkout-guest-member.test.tsx → lib/i18n/dictionaries.ts
- `renderCheckoutPage()` --calls--> `getDictionary()`  [EXTRACTED]
  app/[locale]/checkout/(flow)/checkout-price-preview.test.tsx → lib/i18n/dictionaries.ts
- `signOut()` --calls--> `apiRequest()`  [EXTRACTED]
  app/[locale]/checkout/(flow)/checkout-view.tsx → lib/api/client.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Cart feature data flow: reducer, storage, context, hook composing CartProvider** — docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_cartprovider, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_usecart, docs_superpowers_plans_2026_08_16_vivimoon_storefront_baseline_task9_cart_feature [EXTRACTED 1.00]
- **Four swappable architecture seams (data, theming, i18n, analytics) isolating volatility** — docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_productrepository, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_theming_seam, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_i18n_seam, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_analytics_seam [EXTRACTED 1.00]
- **Coolmate apparel patterns re-modeled for Vivimoon contact-lens domain** — docs_research_coolmate_website_analysis_product_card, docs_research_coolmate_website_analysis_pdp, docs_research_coolmate_website_analysis_color_variant_url_pattern, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_productcard, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_variant [INFERRED 0.85]

## Communities (175 total, 52 thin omitted)

### Community 0 - "dictionaries.ts"
Cohesion: 0.14
Nodes (17): CarouselNav(), CollectionCarousel(), ADR-0022, AnnouncementBar(), CheckoutHeader(), Footer(), Header(), LocaleLinks() (+9 more)

### Community 1 - "cart.ts"
Cohesion: 0.06
Nodes (41): vouchers, bestVoucher(), chosenVoucher(), ADR-0012, ADR-0023, validVouchers(), voucherApplies(), voucherDiscount() (+33 more)

### Community 2 - "addresses-manager.tsx"
Cohesion: 0.09
Nodes (33): AddressDict, EMPTY_FORM, FormState, Stage, Dict, OtpStage(), fill(), resend() (+25 more)

### Community 3 - "parseBody"
Cohesion: 0.17
Nodes (22): POST(), jar, POST(), POST(), POST(), POST(), POST(), POST() (+14 more)

### Community 4 - "mini-cart.test.tsx"
Cohesion: 0.12
Nodes (15): MiniCart(), dict, mockedApiRequest, sandkiss(), freshStore(), makeLine(), rxA, rxB (+7 more)

### Community 5 - "payments.ts"
Cohesion: 0.13
Nodes (15): payments, mockPayments, PaymentError, Payments, ADR-0025, IntentMethod, intentMethodSchema, PaymentIntent (+7 more)

### Community 6 - "add-to-cart.tsx"
Cohesion: 0.06
Nodes (36): FavoritesGrid(), addToCart(), add, push, CartView(), SuccessView(), AddToCart(), dict (+28 more)

### Community 7 - "dependencies"
Cohesion: 0.07
Nodes (27): @base-ui/react, class-variance-authority, clsx, embla-carousel-react, @hookform/resolvers, next, @next/third-parties, dependencies (+19 more)

### Community 8 - "Vivimoon M2 — Purchase Core Implementation Plan"
Cohesion: 0.11
Nodes (19): File Structure, Global Constraints, M2 Definition of Done, Scope note: why `cyl`/`axis` exist in the schema but not the UI, Task 10: Order placement, Task 11: Guest → member cart merge, Task 12: Buy Now, Task 13: M2 verification (+11 more)

### Community 9 - "apiOk"
Cohesion: 0.15
Nodes (28): addressErrorResponse(), DELETE(), PATCH(), GET(), POST(), DELETE(), GET(), POST() (+20 more)

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
Nodes (36): accessoryOptionSchema, Collection, COLLECTION_PAGE_SIZE, comfortSchema, CompareRequest, compareRequestSchema, ComparisonRow, comparisonRowSchema (+28 more)

### Community 15 - "vi.ts"
Cohesion: 0.08
Nodes (22): ProductPage(), renderProduct(), definition, mockedApiRequest, featured, renderHub(), ADR-0020, SupportPage() (+14 more)

### Community 16 - "Product domain type"
Cohesion: 0.11
Nodes (20): Planned file structure (app/, lib/, content/, features/cart/, components/, tests/), Global constraints (Node 20+, TS strict, no hardcoded strings, no raw gtag, no data-fetching in ui/commerce components), Vivimoon Storefront Baseline Implementation Plan, Task 1: Scaffold project & tooling, Task 2: Testing setup (Vitest + RTL), Task 3: Utilities (cn, formatPrice), Task 4: Domain types, Task 5: Mock content (+12 more)

### Community 17 - "fixtures.test.ts"
Cohesion: 0.12
Nodes (14): collections, voucherSchema, accessorySchema, collectionSchema, productLineSchema, productSchema, reviewSchema, validProduct (+6 more)

### Community 18 - "i18n seam (locale-prefixed routes, getDictionary)"
Cohesion: 0.11
Nodes (19): Multi-language/locale switcher (topbar), Utility topbar (Coolmate), Task 7: i18n seam (config, dictionaries, middleware), Task 8: Analytics seam (GA4), Analytics seam (GA4 via typed track() wrapper), GA4 ecommerce events (view_item_list, select_item, view_item, add_to_cart, remove_from_cart, view_cart, begin_checkout, purchase), getDictionary(locale) function, @next/third-parties GoogleAnalytics component (+11 more)

### Community 19 - "rx.ts"
Cohesion: 0.10
Nodes (26): AXIS_STEPS, defaultSphSchema, LensType, lineRxSchema, Rx, RX_LENS_TYPE, RxEye, rxEyeSchema (+18 more)

### Community 20 - "Coolmate.me Feature & Structure Analysis"
Cohesion: 0.12
Nodes (16): Screen-reader-only accessible text investment, Announcement bar (Coolmate), Blog / content-marketing hub, Care & Share CSR program, Community Threads (UGC/community hub), Cookie consent banner + preference center, CXP by Coolmate (custom-print sub-brand), Footer (contact, link columns, address, certifications) (+8 more)

### Community 21 - "mock/index.ts"
Cohesion: 0.12
Nodes (16): accessories, articles, ADR-0018, favorites, defaultShippingOptions, shippingRates, shipping, mockShipping (+8 more)

### Community 22 - "reading-themes.ts"
Cohesion: 0.15
Nodes (16): matchCount(), renderArticle(), ArticlePage(), ReadingTheme, readingThemeSchema, countReadingTheme(), READING_THEME_ENTRIES, readingThemeDestination (+8 more)

### Community 23 - "cart-line-item.tsx"
Cohesion: 0.13
Nodes (25): chipPower(), LensChips(), ADR-0012, formatLineSummary(), formatPower(), formatPowers(), LineSummary(), power() (+17 more)

### Community 24 - "Two-tier component architecture (ui/ vs commerce/)"
Cohesion: 0.15
Nodes (14): Task 12: Carousels & CategoryGrid, Task 13: Layout chrome (AnnouncementBar, Header, MegaNav, LocaleSwitcher, Footer), Task 14: Home page, Task 15: Collection listing page + filters, CartLineItem component, CategoryGrid component, CollectionCarousel component, Two-tier component architecture (ui/ vs commerce/) (+6 more)

### Community 25 - "Product Detail Page (PDP) structure"
Cohesion: 0.15
Nodes (13): Color variants as distinct URLs (?color=slug) for SEO/deep-linking, CoolClub loyalty program + CoolCash currency, Fabric-technology brand system (cross-cutting taxonomy: CoolDry, CoolSoft, CoolRib, CoolFlex, ZeroMark), Fit-feedback histogram (Tight/True-to-size/Loose) in reviews, Product Detail Page (PDP) structure, Task 16: PDP components (Gallery, VariantSelector, SpecTable, ReviewsList), Task 17: PDP page + Add-to-cart, Task 18: Cart page + line item + order summary (+5 more)

### Community 26 - "product/[slug]/page.tsx"
Cohesion: 0.20
Nodes (16): ADR-0018, ADR-0019, ProductGrid(), HomeSection(), ADR-0013, PageContainer(), ADR-0013, Breadcrumb() (+8 more)

### Community 27 - "discovery/mock.ts"
Cohesion: 0.17
Nodes (11): quiz, QUIZ_MATCHES, DiscoveryError, mockDiscovery, toComparisonRow(), QuizDefinition, cheapestVariant(), EYE_ENLARGEMENT_BANDS (+3 more)

### Community 28 - "editorial.ts"
Cohesion: 0.15
Nodes (14): MakeupLookCard, MakeupLooks(), cards, makeupLooks, articleQuerySchema, articleSchema, ArticleSort, articleSortSchema (+6 more)

### Community 29 - "account/mock.ts"
Cohesion: 0.08
Nodes (17): NON_DEFAULT, addresses, Account, AddressError, addressStore, favoriteStore, mockAccount, accountPatchSchema (+9 more)

### Community 30 - "Vivimoon Storefront Baseline Design Spec"
Cohesion: 0.24
Nodes (11): Gender filter toggle (in-place homepage filtering), Hero banner carousel (7 slides), Homepage structure (hero carousel, promo tiles, category grid), Product card component (hover-swap, swatches, badges, price), Themed collection sections with product carousels, Build sequence (13 high-level steps), Baseline goals (demoable bilingual storefront, clean seams, prop-driven components), Explicit non-goals (Rx upload, loyalty, real payment, real DB, auth, deferred with seams) (+3 more)

### Community 31 - "cart-store.ts"
Cohesion: 0.08
Nodes (29): ORDER_RESPONSE, renderCheckoutPage(), fetchRoutingTo(), json(), PRICED_RESPONSE, renderCheckoutPage(), CheckoutView(), signOut() (+21 more)

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
Cohesion: 0.12
Nodes (16): mockOrders, Orders, randomId(), randomSuffix(), resetMockOrdersState(), store, ADDRESS, BASELINE_LINES (+8 more)

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
Cohesion: 0.21
Nodes (11): ReviewSourceBadge(), fill(), ReviewCard(), ReviewsList(), ReviewsSummary(), SUB_RATINGS, TAGS, Badge() (+3 more)

### Community 46 - "source-files.ts"
Cohesion: 0.20
Nodes (9): ADR-0016, nextConfig, ADR-0014, isTest(), isVendored(), SKIP, sourceFiles(), withoutComments() (+1 more)

### Community 61 - "M1 Foundation — progress ledger"
Cohesion: 0.22
Nodes (8): M1 Foundation — progress ledger, M2 Task 11 — Guest → member cart merge (2026-09-02), M2 Task 12 — Buy Now (2026-09-02), M2 Task 13 — M2 verification (2026-09-02), M2 Task 5 — RxSelector and Rx-aware add-to-cart (2026-08-31), M2 Task 6 — Server-owned pricing and auto-voucher (2026-08-31), M2 Task 7 — Cart page renders server prices (2026-08-31), M4 Task 9 — M4 verification (2026-09-05)

### Community 62 - "Issue tracker: GitHub"
Cohesion: 0.29
Nodes (6): Conventions, Issue tracker: GitHub, Pull requests as a triage surface, Wayfinding operations, When a skill says "fetch the relevant ticket", When a skill says "publish to the issue tracker"

### Community 63 - "checkout-view.tsx"
Cohesion: 0.11
Nodes (22): AddressCards(), ADDRESS_FIELDS, FieldName, ADR-0012, ADR-0025, ICONS, PaymentMethodPicker(), dict (+14 more)

### Community 64 - "Domain Docs"
Cohesion: 0.33
Nodes (5): Before exploring, read these, Domain Docs, File structure, Flag ADR conflicts, Use the glossary's vocabulary

### Community 65 - "cn.ts"
Cohesion: 0.16
Nodes (18): LocaleError(), LocaleNotFound(), RootNotFound(), LeadArticle(), OrderActions(), fill(), HistoryLine, OrderHistoryCard() (+10 more)

### Community 66 - "order-detail-view.tsx"
Cohesion: 0.14
Nodes (16): fetchOrders(), OrderHistoryPage(), withProducts(), formatDate(), OrderDetailView(), renderView(), Tone, TONE_CLASS (+8 more)

### Community 69 - "collection/[slug]/page.tsx"
Cohesion: 0.25
Nodes (15): discountLabel(), fetchVouchers(), formatDate(), VouchersPage(), CollectionPage(), resolveTitle(), Empty(), EmptyContent() (+7 more)

### Community 70 - "schemas/orders.ts"
Cohesion: 0.11
Nodes (17): ADR-0012, HOME_ADDRESS, OFFICE_ADDRESS, orders, giftLineSchema, priceCartRequestSchema, currencySchema, NotificationChannel (+9 more)

### Community 71 - "quick-add.tsx"
Cohesion: 0.18
Nodes (12): CompareToggle(), ProductCard(), RETURNS_FAQ, QuickAdd(), QuickAddBody(), subscribe(), RatingStars(), resolveVariant() (+4 more)

### Community 72 - "fetchViaSelf"
Cohesion: 0.25
Nodes (8): AddressesPage(), fetchAddresses(), fetchOrder(), OrderDetailPage(), AccountPage(), fetchAccount(), fetchViaSelf(), fetchMock

### Community 73 - "support/mock.ts"
Cohesion: 0.17
Nodes (12): post(), guides, ADR-0019, ADR-0019, FEATURED_LIMIT, guideFeedback, mockSupport, readMockGuideFeedback() (+4 more)

### Community 74 - "client.ts"
Cohesion: 0.15
Nodes (9): remove(), moveToFavorites(), FavoriteButton(), toggle(), mockedApiRequest, NewsletterSignup(), mockedApiRequest, apiRequest() (+1 more)

### Community 75 - "Process"
Cohesion: 0.15
Nodes (12): 1. Gather context, 2. Explore the codebase (optional), 3. Draft vertical slices, 4. Quiz the user, 5. Publish the tickets to the configured tracker, Acceptance criteria, Blocked by, <NN> — <Ticket title> (+4 more)

### Community 76 - "Vivimoon M1 — Foundation Implementation Plan"
Cohesion: 0.11
Nodes (18): File Structure, Global Constraints, M1 Definition of Done, Task 10: Browser API client, session sync, and the sign-in / sign-up pages, Task 11: Forgot-password OTP flow, Task 12: Account resource and route handlers, Task 13: Account page, route guards, and M1 verification, Task 1: API config and response envelope (+10 more)

### Community 77 - "catalog"
Cohesion: 0.24
Nodes (6): GET(), GET(), GET(), get(), GET(), catalog

### Community 78 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, build, dev, lint, start, test, test:contract, test:contract:upstream (+2 more)

### Community 79 - "lens-facets.ts"
Cohesion: 0.12
Nodes (22): FacetBrowser(), Swatches(), valueLabel(), pathname, MobileNav(), diameterMm(), replacementScheduleSchema, LensEntry (+14 more)

### Community 80 - "editorial/mock.ts"
Cohesion: 0.18
Nodes (13): Editorial, mockEditorial, searchable(), ArticleQuery, FaqQuery, filterFaqEntries(), searchable(), entries (+5 more)

### Community 81 - "plp-card.ts"
Cohesion: 0.26
Nodes (10): LensGalleryContexts, activeFilterGroups(), CARD_VIEWS, CardView, FILTER_GROUPS, lineLabel(), mm(), showQuizCard() (+2 more)

### Community 82 - "cart-view.tsx"
Cohesion: 0.19
Nodes (13): ADR-0003, ADR-0012, OrderSummary(), PriceTag(), ICONS, short(), SpendTierProgress(), ADR-0003 (+5 more)

### Community 83 - "Vivimoon M4 — Discovery Implementation Plan"
Cohesion: 0.13
Nodes (15): File Structure, Global Constraints, M4 Definition of Done, Scope note: the §6/§10 eyeEnlargement conflict, Task 1: Mirrored reviews — source badge, Task 2: Comparison — eye-enlargement banding, schemas, discovery resource, Task 3: Comparison — store, toggle, persistent tray, Task 4: Comparison — matrix Dialog (+7 more)

### Community 84 - "auth.ts"
Cohesion: 0.07
Nodes (33): MockUser, users, Auth, findByIdentifier(), mockAuth, OtpRecord, otps, pendingSignups (+25 more)

### Community 89 - "response.ts"
Cohesion: 0.08
Nodes (23): POST(), GET(), req(), POST(), ADDRESS, LINES, upstreamBaseUrl(), upstreamTimeoutMs() (+15 more)

### Community 90 - "[locale]/page.tsx"
Cohesion: 0.07
Nodes (38): BRAND_STORY_IMAGES, HomePage(), TV_THUMBS, ArticleCard, ArticleCards(), BrandStory(), BrandStoryImage, CategoryGrid() (+30 more)

### Community 92 - "accordion.tsx"
Cohesion: 0.27
Nodes (9): FaqAccordion(), FaqAnswer, entries, BeginnerFaq(), ProductReassurance(), Accordion(), AccordionContent(), AccordionItem() (+1 more)

### Community 93 - "cookie.ts"
Cohesion: 0.08
Nodes (13): jar, ADDRESS, jar, jar, jar, jar, secret(), SESSION_COOKIE (+5 more)

### Community 94 - "price/route.ts"
Cohesion: 0.12
Nodes (12): POST(), BASELINE_LINES, jar, SINGLE, ADR-0023, BASELINE_LINES, RX, ADR-0012 (+4 more)

### Community 96 - "to-spec/SKILL.md"
Cohesion: 0.22
Nodes (8): Further Notes, Implementation Decisions, Out of Scope, Problem Statement, Process, Solution, Testing Decisions, User Stories

### Community 100 - "schemas/support.ts"
Cohesion: 0.10
Nodes (25): renderGuide(), ADR-0022, getNavItems(), NavItem, faqEntries, ADR-0019, FaqEntry, faqEntrySchema (+17 more)

### Community 101 - "5. Migration Strategy"
Cohesion: 0.33
Nodes (6): 5. Migration Strategy, Adapting drift, Conformance suite, Cutover order, Per-resource cutover, Runtime validation

### Community 104 - "collection-filters.tsx"
Cohesion: 0.07
Nodes (42): CheckRow(), Chip(), CollectionFilters(), CollectionFiltersSheet(), CollectionImageView(), CollectionLoadMore(), CollectionSort(), DefaultRxAutoApply() (+34 more)

### Community 109 - "newsletter/route.ts"
Cohesion: 0.25
Nodes (9): POST(), post(), newsletter, mockNewsletter, Newsletter, SubscribeRequest, subscribeRequestSchema, SubscriptionAck (+1 more)

### Community 110 - "1. Overview"
Cohesion: 0.50
Nodes (4): 1. Overview, Baseline non-goals now in scope, Goals, Non-goals

### Community 111 - "order-history-card.test.tsx"
Cohesion: 0.24
Nodes (8): dict, line(), order(), product(), push, refresh, renderCard(), RX

### Community 112 - "3. Architecture — the proxy seam"
Cohesion: 0.67
Nodes (3): 3. Architecture — the proxy seam, Configuration, Resource layout

### Community 113 - "submit/route.ts"
Cohesion: 0.22
Nodes (6): POST(), GET(), POST(), discovery, Discovery, comparisonMatrixSchema

### Community 114 - "checkout-guest-member.test.tsx"
Cohesion: 0.17
Nodes (9): api(), HOME, json(), NEW, OFFICE, ORDER, PRICED, push (+1 more)

### Community 115 - "order-detail-view.test.tsx"
Cohesion: 0.18
Nodes (8): dict, push, OrderStatusTimeline(), Step, STEP_OF, STEPS, ORDER_STATUSES, OrderStatus

### Community 116 - "orders-preferred-payment.test.ts"
Cohesion: 0.25
Nodes (4): ADDRESS, jar, LINES, RX

### Community 117 - "sign-up.test.tsx"
Cohesion: 0.20
Nodes (5): SignUpForm(), authenticate(), done(), push, user

### Community 118 - "Vivimoon.vn — Live Site Data-Model Audit"
Cohesion: 0.40
Nodes (4): 1. Site structure, 2. Product detail page — data fields observed, 3. Open question — not acted on, Vivimoon.vn — Live Site Data-Model Audit

### Community 119 - "cn"
Cohesion: 0.09
Nodes (33): LensViewer(), dict, ADR-0012, QuantityStepper(), ITEM_CLASS, MegaNav(), AspectRatio(), BreadcrumbEllipsis() (+25 more)

### Community 120 - "cart/page.test.tsx"
Cohesion: 0.12
Nodes (16): lens(), makeLine(), mockedApiRequest, push, realPricing(), renderCartPage(), renderWithStaleLine(), track (+8 more)

### Community 121 - "account/layout.tsx"
Cohesion: 0.27
Nodes (6): AccountShell(), AccountShellDict, dict, AccountLayout(), fetchData(), ADR-0002

### Community 122 - "ForgotPasswordForm"
Cohesion: 0.36
Nodes (6): ForgotPasswordForm(), reportServer(), requestCode(), submitPassword(), verifyCode(), push

### Community 123 - "support/page.tsx"
Cohesion: 0.12
Nodes (13): PolicyId, TOPIC_ICONS, OrderLookupForm(), ReadingThemeChip, ReadingThemeChips(), chips, SearchForm(), ADR-0020 (+5 more)

### Community 124 - "loyalty/mock.ts"
Cohesion: 0.19
Nodes (8): loyaltyHistory, Loyalty, mockLoyalty, store, LoyaltyBalance, loyaltyBalanceSchema, LoyaltyEntry, loyaltyEntrySchema

### Community 125 - "AddressesManager"
Cohesion: 0.19
Nodes (3): AddressesManager(), AddressForm(), toFormState()

### Community 126 - "lens-viewer.tsx"
Cohesion: 0.14
Nodes (10): Slide, Tab, TABS, gallery, tones, videos, ViewerVideo, galleries (+2 more)

### Community 129 - "quiz-card.tsx"
Cohesion: 0.23
Nodes (6): QuizFlow(), goNext(), noSubscribe(), QuizCard(), savedQuizResults(), saveQuizResults()

### Community 130 - "account-info.tsx"
Cohesion: 0.11
Nodes (19): AccountInfo(), patch(), saveAccount(), savePersonal(), fmtDob(), fmtRx(), GENDERS, Dialog() (+11 more)

### Community 131 - "track/page.tsx"
Cohesion: 0.19
Nodes (10): lookUpOrder(), metadata, mockedFetchViaSelf, order, renderPage(), session, TrackOrderPage(), ADR-0002 (+2 more)

### Community 132 - "spec-table.tsx"
Cohesion: 0.38
Nodes (5): SpecTable(), baseSpecs, dict, ADR-0011, ProductSpecs

### Community 136 - "compare-store.ts"
Cohesion: 0.11
Nodes (14): geistMono, geistSans, metadata, ComparisonTray(), mockedApiRequest, CartHydrator(), CompareHydrator(), COMPARE_CAP (+6 more)

### Community 137 - "package.json"
Cohesion: 0.50
Nodes (3): name, private, version

### Community 140 - "track/route.ts"
Cohesion: 0.25
Nodes (6): GET(), ADR-0022, ADR-0022, ADR-0006, normalizeOrderCode(), publicOrderSchema

### Community 141 - "vouchers/route.ts"
Cohesion: 0.24
Nodes (5): GET(), jar, vouchers, mockVouchers, Vouchers

### Community 142 - "getDictionary"
Cohesion: 0.16
Nodes (18): AboutPage(), FavoritesPage(), fetchFavorites(), fetchLoyalty(), LoyaltyPage(), ForgotPasswordPage(), SignInPage(), SignUpPage() (+10 more)

### Community 143 - "useSessionStore"
Cohesion: 0.15
Nodes (10): push, user, SessionStore, SessionUser, user, useSessionStore, SessionSync(), base (+2 more)

### Community 149 - "list-id.ts"
Cohesion: 0.36
Nodes (6): collectionListId(), MEMBERSHIP_FILTERS, normalizeColors(), COLLECTION_COLORS, idFor(), ProductQuery

### Community 152 - "catalog/mock.ts"
Cohesion: 0.14
Nodes (21): reviews, applies(), Catalog, coversBothEyes(), FacetCounts, FacetDef, FacetKey, inPriceRange() (+13 more)

### Community 153 - "mini-cart.tsx"
Cohesion: 0.08
Nodes (30): makeLine(), seedLastOrder(), BundleOffer(), bundleAccessories, dict, mockedApiRequest, singleLens, ADR-0003 (+22 more)

### Community 155 - "cancel/route.test.ts"
Cohesion: 0.50
Nodes (3): jar, params(), post()

### Community 157 - "locales"
Cohesion: 0.18
Nodes (5): locales, config, GUARDED, RETIRED, ADR-0017

### Community 160 - "articles/page.tsx"
Cohesion: 0.22
Nodes (13): formatDate(), ArticlesPage(), readSort(), readTheme(), GuidePage(), quizSocialProof(), Article, articleDateline() (+5 more)

### Community 162 - "index-shape.test.tsx"
Cohesion: 0.31
Nodes (4): renderIndex(), CARDS_PER_PAGE, knowledgeIndexLayout, ADR-0005

### Community 164 - "mobile-nav.tsx"
Cohesion: 0.29
Nodes (8): Sheet(), SheetClose(), SheetContent(), SheetDescription(), SheetHeader(), SheetOverlay(), SheetTitle(), SheetTrigger()

### Community 165 - "orders-loyalty-award.test.ts"
Cohesion: 0.25
Nodes (4): ADDRESS, jar, LINES, RX

### Community 166 - "use-comparison.test.ts"
Cohesion: 0.36
Nodes (4): mockedApiRequest, useComparisonMatrix(), UseComparisonMatrixResult, ComparisonMatrix

### Community 167 - "orders/route.test.ts"
Cohesion: 0.20
Nodes (6): ADDRESS, BASELINE_LINES, jar, RX, ADR-0012, ADR-0025

### Community 169 - "SupportFaqPage"
Cohesion: 0.50
Nodes (3): renderFaq(), parseTopic(), SupportFaqPage()

### Community 170 - "product-videos.tsx"
Cohesion: 0.50
Nodes (3): ProductVideoCard, ProductVideos(), videos

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
- **721 isolated node(s):** `npx`, `Stage`, `push`, `push`, `Dict` (+716 more)
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