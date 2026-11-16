# Graph Report - vivimoon-web-app  (2026-11-16)

## Corpus Check
- 542 files · ~310,038 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2651 nodes · 7127 edges · 194 communities (137 shown, 57 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 48 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `42498f04`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- dictionaries.ts
- cart.ts
- addresses-manager.tsx
- apiOk
- client.ts
- payments/mock.ts
- rx-selector.tsx
- dependencies
- Vivimoon M2 — Purchase Core Implementation Plan
- cookie.ts
- devDependencies
- Vivimoon — Client Scope Design Spec
- compilerOptions
- components.json
- catalog.ts
- en.ts
- Product domain type
- mock/index.ts
- i18n seam (locale-prefixed routes, getDictionary)
- cart-line-item.tsx
- Coolmate.me Feature & Structure Analysis
- add-to-cart.test.tsx
- article-page.test.tsx
- Product
- Two-tier component architecture (ui/ vs commerce/)
- Product Detail Page (PDP) structure
- collection/[slug]/page.tsx
- quick-add.tsx
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
- Review
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
- orders-loyalty-award.test.ts
- track/page.tsx
- triage-labels.md
- Vivimoon
- response.ts
- order-detail-view.tsx
- qr-transfer-view.tsx
- getDictionary
- schemas/support.ts
- bundle-offer.tsx
- Process
- Vivimoon M1 — Foundation Implementation Plan
- apiFail
- scripts
- guide-feedback.test.tsx
- editorial/mock.ts
- add-to-cart.tsx
- cart/page.test.tsx
- Vivimoon M4 — Discovery Implementation Plan
- auth.ts
- 0001-proxy-seam-replaces-repository-interface.md
- 0002-server-components-self-fetch-mutable-state.md
- 0003-client-never-computes-money.md
- api/config.ts
- [locale]/page.tsx
- shadcn
- success/page.tsx
- support/page.tsx
- pricing/mock.ts
- 0016-ui-primitives-move-to-base-ui.md
- to-spec/SKILL.md
- 0017-expiry-is-shopper-facing-replacement-is-the-wire-name.md
- 0004-rx-schema-ships-cyl-axis-before-toric-ui.md
- 0005-eye-enlargement-computed-not-stored.md
- guide.test.tsx
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
- lens-facets.ts
- checkout-guest-member.test.tsx
- fetchViaSelf
- cart-view.tsx
- sign-up.test.tsx
- Vivimoon.vn — Live Site Data-Model Audit
- review-form.tsx
- list-id.ts
- common.ts
- account/layout.tsx
- checkout.ts
- loyalty/mock.ts
- schemas/orders.ts
- lens-viewer.test.tsx
- 0010-product-line-excludes-correction-complexity.md
- 0011-eye-enlargement-derives-from-graphic-diameter.md
- cn
- payments.ts
- Task 18: Cart page + line item + order summary
- media/route.test.ts
- 0013-pages-own-their-width.md
- 0012-unavailable-cart-lines-are-reported-not-dropped.md
- Pages run full-bleed with 40px gutters; `PageContainer` no longer caps at `max-w-7xl`
- compare-store.ts
- package.json
- Cart Lines carry a Purchase Unit; a lens is priced per single lens
- Guest orders earn Held Points, credited when an account verifies the phone
- rx.ts
- vouchers/mock.ts
- AddressesManager
- apiRequest
- Checkout offers QR transfer, cash on delivery and e-wallet; email becomes optional
- An Article's inline products come from its Reading Theme, not from the Article
- A Guide is a fixed-layout document, and not an Article
- The Support search box filters FAQ Entries; it is not storefront search
- useCartStore
- @types/react
- 0014-image-optimization-is-on.md
- catalog/mock.ts
- mini-cart.test.tsx
- zustand
- plp-card.ts
- [id]/reviews/route.test.ts
- articles/page.tsx
- Order lookup is by order code alone, shown inline
- A phone sign-up is not an account until its OTP is verified
- pricing/mock.test.ts
- vitest
- bundle-offer.test.tsx
- review-form.test.tsx
- submit/route.ts
- payment/route.ts
- order-status-timeline.tsx
- write-review-button.test.tsx
- rx-ranges.ts
- @vitejs/plugin-react
- AddressForm
- orders/route.test.ts
- OtpStage
- Guest orders join the account that verifies their phone
- [locale]/layout.tsx
- Task 12: Carousels & CategoryGrid
- @types/node
- lucide-react
- prettier
- success-view.test.tsx
- orders-preferred-payment.test.ts
- helpful/route.test.ts
- ForgotPasswordForm
- helpful-button.test.tsx
- use-comparison.test.ts
- sign-in.test.tsx
- lens-viewer.tsx
- cancel/route.test.ts
- maskPhone
- newsletter-signup.test.tsx
- success-buy-now.test.tsx
- trust-badges.tsx

## God Nodes (most connected - your core abstractions)
1. `cn()` - 214 edges
2. `getDictionary()` - 108 edges
3. `apiOk()` - 88 edges
4. `apiFail()` - 73 edges
5. `Locale` - 73 edges
6. `Dictionary` - 72 edges
7. `readSessionUserId()` - 62 edges
8. `isLocale()` - 60 edges
9. `apiRequest()` - 49 edges
10. `useSessionStore` - 44 edges

## Surprising Connections (you probably didn't know these)
- `README.md: Vivimoon Next.js project README` --semantically_similar_to--> `Tech stack (Next.js App Router, React 19, TS strict, Tailwind v4, shadcn/ui, embla, RHF+zod, GA4, Vitest)`  [INFERRED] [semantically similar]
  README.md → docs/superpowers/specs/2026-08-16-vivimoon-storefront-baseline-design.md
- `renderCheckoutPage()` --calls--> `getDictionary()`  [EXTRACTED]
  app/[locale]/checkout/(flow)/checkout-buy-now.test.tsx → lib/i18n/dictionaries.ts
- `renderCheckoutPage()` --calls--> `getDictionary()`  [EXTRACTED]
  app/[locale]/checkout/(flow)/checkout-guest-member.test.tsx → lib/i18n/dictionaries.ts
- `renderCheckoutPage()` --calls--> `getDictionary()`  [EXTRACTED]
  app/[locale]/checkout/(flow)/checkout-preferred-payment.test.tsx → lib/i18n/dictionaries.ts
- `renderCheckoutPage()` --calls--> `getDictionary()`  [EXTRACTED]
  app/[locale]/checkout/(flow)/checkout-price-preview.test.tsx → lib/i18n/dictionaries.ts

## Import Cycles
- 3-file cycle: `content/quiz.ts -> lib/api/schemas/discovery.ts -> lib/api/schemas/catalog.ts -> content/quiz.ts`

## Hyperedges (group relationships)
- **Cart feature data flow: reducer, storage, context, hook composing CartProvider** — docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_cartprovider, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_usecart, docs_superpowers_plans_2026_08_16_vivimoon_storefront_baseline_task9_cart_feature [EXTRACTED 1.00]
- **Four swappable architecture seams (data, theming, i18n, analytics) isolating volatility** — docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_productrepository, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_theming_seam, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_i18n_seam, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_analytics_seam [EXTRACTED 1.00]
- **Coolmate apparel patterns re-modeled for Vivimoon contact-lens domain** — docs_research_coolmate_website_analysis_product_card, docs_research_coolmate_website_analysis_pdp, docs_research_coolmate_website_analysis_color_variant_url_pattern, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_productcard, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_variant [INFERRED 0.85]

## Communities (194 total, 57 thin omitted)

### Community 0 - "dictionaries.ts"
Cohesion: 0.12
Nodes (23): QuizFlow(), goNext(), Card, Vote, ADR-0022, noSubscribe(), QuizCard(), quizResultsHref() (+15 more)

### Community 1 - "cart.ts"
Cohesion: 0.08
Nodes (26): bundleTagSchema, cartLineSchema, cartStateSchema, giftLineSchema, MAX_LINE_QUANTITY, nextSpendTierSchema, priceCartRequestSchema, PricedLine (+18 more)

### Community 2 - "addresses-manager.tsx"
Cohesion: 0.13
Nodes (24): AddressDict, EMPTY_FORM, FormState, Stage, Dict, ADR-0021, SocialAuth(), Alert() (+16 more)

### Community 3 - "apiOk"
Cohesion: 0.16
Nodes (26): DELETE(), GET(), PATCH(), POST(), jar, Order, POST(), POST() (+18 more)

### Community 4 - "client.ts"
Cohesion: 0.09
Nodes (17): AccountInfo(), patch(), saveAccount(), savePersonal(), fmtDob(), fmtRx(), GENDERS, push (+9 more)

### Community 5 - "payments/mock.ts"
Cohesion: 0.24
Nodes (7): payments, mockPayments, PaymentError, Payments, ADR-0025, PaymentIntent, PaymentIntentRequest

### Community 6 - "rx-selector.tsx"
Cohesion: 0.15
Nodes (10): PowerSelect(), defaultRxDraft, POWER_GUIDE_SLUG, PowerField(), RxDraft, STEPS, dict, ADR-0023 (+2 more)

### Community 7 - "dependencies"
Cohesion: 0.07
Nodes (27): @base-ui/react, class-variance-authority, clsx, embla-carousel-react, @hookform/resolvers, next, @next/third-parties, dependencies (+19 more)

### Community 8 - "Vivimoon M2 — Purchase Core Implementation Plan"
Cohesion: 0.11
Nodes (19): File Structure, Global Constraints, M2 Definition of Done, Scope note: why `cyl`/`axis` exist in the schema but not the UI, Task 10: Order placement, Task 11: Guest → member cart merge, Task 12: Buy Now, Task 13: M2 verification (+11 more)

### Community 9 - "cookie.ts"
Cohesion: 0.07
Nodes (14): jar, ADDRESS, jar, jar, jar, jar, jar, secret() (+6 more)

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
Cohesion: 0.05
Nodes (45): baseSpecs, dict, accessoryOptionSchema, Collection, collectionSchema, comfortSchema, CompareRequest, compareRequestSchema (+37 more)

### Community 15 - "en.ts"
Cohesion: 0.07
Nodes (23): definition, mockedApiRequest, push, featured, renderHub(), ADR-0020, matrix, items (+15 more)

### Community 16 - "Product domain type"
Cohesion: 0.11
Nodes (20): Planned file structure (app/, lib/, content/, features/cart/, components/, tests/), Global constraints (Node 20+, TS strict, no hardcoded strings, no raw gtag, no data-fetching in ui/commerce components), Vivimoon Storefront Baseline Implementation Plan, Task 1: Scaffold project & tooling, Task 2: Testing setup (Vitest + RTL), Task 3: Utilities (cn, formatPrice), Task 4: Domain types, Task 5: Mock content (+12 more)

### Community 17 - "mock/index.ts"
Cohesion: 0.11
Nodes (15): mockedFetchViaSelf, ADR-0002, articles, collections, favorites, galleries, products, reviews (+7 more)

### Community 18 - "i18n seam (locale-prefixed routes, getDictionary)"
Cohesion: 0.13
Nodes (16): Task 7: i18n seam (config, dictionaries, middleware), Task 8: Analytics seam (GA4), Analytics seam (GA4 via typed track() wrapper), GA4 ecommerce events (view_item_list, select_item, view_item, add_to_cart, remove_from_cart, view_cart, begin_checkout, purchase), getDictionary(locale) function, @next/third-parties GoogleAnalytics component, Rationale for lightweight custom i18n over next-intl, i18n seam (locale-prefixed routes, getDictionary) (+8 more)

### Community 19 - "cart-line-item.tsx"
Cohesion: 0.13
Nodes (24): QrTransferPage(), chipPower(), LensChips(), ADR-0012, CartUpsell(), formatLineSummary(), formatPower(), formatPowers() (+16 more)

### Community 20 - "Coolmate.me Feature & Structure Analysis"
Cohesion: 0.12
Nodes (16): Screen-reader-only accessible text investment, Announcement bar (Coolmate), Blog / content-marketing hub, Care & Share CSR program, Community Threads (UGC/community hub), Cookie consent banner + preference center, CXP by Coolmate (custom-print sub-brand), Footer (contact, link columns, address, certifications) (+8 more)

### Community 21 - "add-to-cart.test.tsx"
Cohesion: 0.25
Nodes (4): dict, push, GUEST_RX_KEY, useGuestRxStore

### Community 22 - "article-page.test.tsx"
Cohesion: 0.18
Nodes (15): matchCount(), renderArticle(), ArticlePage(), readingThemeSchema, countReadingTheme(), READING_THEME_ENTRIES, readingThemeDestination, readingThemeEntry (+7 more)

### Community 23 - "Product"
Cohesion: 0.14
Nodes (14): Gtag, product, AnalyticsEvent, Ga4Item, Discovery, DiscoveryError, mockDiscovery, toComparisonRow() (+6 more)

### Community 24 - "Two-tier component architecture (ui/ vs commerce/)"
Cohesion: 0.25
Nodes (8): CartLineItem component, CategoryGrid component, CollectionCarousel component, Two-tier component architecture (ui/ vs commerce/), ProductGallery component, RatingStars component, ReviewsList component (read-only), SpecTable component

### Community 25 - "Product Detail Page (PDP) structure"
Cohesion: 0.22
Nodes (9): Color variants as distinct URLs (?color=slug) for SEO/deep-linking, CoolClub loyalty program + CoolCash currency, Fabric-technology brand system (cross-cutting taxonomy: CoolDry, CoolSoft, CoolRib, CoolFlex, ZeroMark), Fit-feedback histogram (Tight/True-to-size/Loose) in reviews, Product Detail Page (PDP) structure, Task 15: Collection listing page + filters, Task 16: PDP components (Gallery, VariantSelector, SpecTable, ReviewsList), Task 17: PDP page + Add-to-cart (+1 more)

### Community 26 - "collection/[slug]/page.tsx"
Cohesion: 0.12
Nodes (26): ADR-0018, CollectionPage(), resolveTitle(), ADR-0002, renderFaq(), parseTopic(), SupportFaqPage(), ADR-0019 (+18 more)

### Community 27 - "quick-add.tsx"
Cohesion: 0.13
Nodes (19): ComparisonDialog(), QuickAdd(), RatingStars(), subscribe(), useDesktop(), WriteReviewButton(), Dialog(), DialogClose() (+11 more)

### Community 28 - "editorial.ts"
Cohesion: 0.11
Nodes (18): MakeupLookCard, MakeupLooks(), cards, ADR-0018, makeupLooks, Article, ArticleQuery, articleQuerySchema (+10 more)

### Community 29 - "account/mock.ts"
Cohesion: 0.08
Nodes (18): NON_DEFAULT, addresses, Account, AddressError, addressStore, favoriteStore, mockAccount, accountPatchSchema (+10 more)

### Community 30 - "Vivimoon Storefront Baseline Design Spec"
Cohesion: 0.24
Nodes (11): Gender filter toggle (in-place homepage filtering), Hero banner carousel (7 slides), Homepage structure (hero carousel, promo tiles, category grid), Product card component (hover-swap, swatches, badges, price), Themed collection sections with product carousels, Build sequence (13 high-level steps), Baseline goals (demoable bilingual storefront, clean seams, prop-driven components), Explicit non-goals (Rx upload, loyalty, real payment, real DB, auth, deferred with seams) (+3 more)

### Community 31 - "cart-store.ts"
Cohesion: 0.14
Nodes (18): renderCheckoutPage(), cartCount(), cartReducer(), readPersistedLine(), atA, atB, empty, makeLine() (+10 more)

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
Cohesion: 0.10
Nodes (21): ADR-0022, joinIn(), mockOrders, Orders, REQ, randomId(), randomSuffix(), resetMockOrdersState() (+13 more)

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
Cohesion: 0.09
Nodes (26): quizScope(), QuizAnswer, quizAnswerSchema, quizDefinitionSchema, QuizOption, quizOptionSchema, QuizQuestion, quizQuestionSchema (+18 more)

### Community 42 - "Review"
Cohesion: 0.16
Nodes (12): get(), Review, ReviewFilter, ReviewSource, ReviewTag, filterReviews(), reviewStats(), shortName() (+4 more)

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
Nodes (18): AddressCards(), ADDRESS_FIELDS, FieldName, ADR-0012, ADR-0022, ADR-0024, ADR-0025, StepHeading() (+10 more)

### Community 64 - "Domain Docs"
Cohesion: 0.33
Nodes (5): Before exploring, read these, Domain Docs, File structure, Flag ADR conflicts, Use the glossary's vocabulary

### Community 65 - "orders-loyalty-award.test.ts"
Cohesion: 0.25
Nodes (4): ADDRESS, jar, LINES, RX

### Community 66 - "track/page.tsx"
Cohesion: 0.21
Nodes (9): lookUpOrder(), metadata, mockedFetchViaSelf, order, renderPage(), session, TrackOrderPage(), ADR-0002 (+1 more)

### Community 69 - "response.ts"
Cohesion: 0.19
Nodes (9): GET(), GET(), GET(), GET(), Ctx, DELETE(), POST(), setVote() (+1 more)

### Community 70 - "order-detail-view.tsx"
Cohesion: 0.15
Nodes (13): WriteReviewPage(), withProducts(), formatDate(), OrderDetailView(), dict, push, refresh, renderView() (+5 more)

### Community 71 - "qr-transfer-view.tsx"
Cohesion: 0.12
Nodes (18): metadata, ADR-0002, ADR-0022, mmss(), QrLine, QrTransferView(), dict, LINES (+10 more)

### Community 72 - "getDictionary"
Cohesion: 0.16
Nodes (18): AboutPage(), AddressesPage(), fetchAddresses(), FavoritesPage(), fetchFavorites(), fetchLoyalty(), LoyaltyPage(), AccountPage() (+10 more)

### Community 73 - "schemas/support.ts"
Cohesion: 0.09
Nodes (23): post(), guides, ADR-0019, faqEntries, ADR-0019, ADR-0019, guideFeedback, mockSupport (+15 more)

### Community 74 - "bundle-offer.tsx"
Cohesion: 0.15
Nodes (16): BundleOffer(), ADR-0003, accessoryLine(), useBuyBoxStore, freshStore(), makeLine(), rxA, rxB (+8 more)

### Community 75 - "Process"
Cohesion: 0.15
Nodes (12): 1. Gather context, 2. Explore the codebase (optional), 3. Draft vertical slices, 4. Quiz the user, 5. Publish the tickets to the configured tracker, Acceptance criteria, Blocked by, <NN> — <Ticket title> (+4 more)

### Community 76 - "Vivimoon M1 — Foundation Implementation Plan"
Cohesion: 0.11
Nodes (18): File Structure, Global Constraints, M1 Definition of Done, Task 10: Browser API client, session sync, and the sign-in / sign-up pages, Task 11: Forgot-password OTP flow, Task 12: Account resource and route handlers, Task 13: Account page, route guards, and M1 verification, Task 1: API config and response envelope (+10 more)

### Community 77 - "apiFail"
Cohesion: 0.15
Nodes (26): addressErrorResponse(), DELETE(), PATCH(), GET(), POST(), DELETE(), GET(), POST() (+18 more)

### Community 78 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, build, dev, lint, start, test, test:contract, test:contract:upstream (+2 more)

### Community 80 - "editorial/mock.ts"
Cohesion: 0.20
Nodes (12): Editorial, mockEditorial, searchable(), FaqQuery, filterFaqEntries(), searchable(), entries, ADR-0020 (+4 more)

### Community 81 - "add-to-cart.tsx"
Cohesion: 0.13
Nodes (17): AddToCart(), ADR-0023, CarouselNav(), CollectionCarousel(), PriceTag(), ProductCard(), QuantityStepper(), draftFromDefaultRx() (+9 more)

### Community 82 - "cart/page.test.tsx"
Cohesion: 0.24
Nodes (10): lens(), makeLine(), mockedApiRequest, push, realPricing(), renderCartPage(), renderWithStaleLine(), track (+2 more)

### Community 83 - "Vivimoon M4 — Discovery Implementation Plan"
Cohesion: 0.13
Nodes (15): File Structure, Global Constraints, M4 Definition of Done, Scope note: the §6/§10 eyeEnlargement conflict, Task 1: Mirrored reviews — source badge, Task 2: Comparison — eye-enlargement banding, schemas, discovery resource, Task 3: Comparison — store, toggle, persistent tray, Task 4: Comparison — matrix Dialog (+7 more)

### Community 84 - "auth.ts"
Cohesion: 0.07
Nodes (35): Auth, findByIdentifier(), mockAuth, OtpRecord, otps, pendingSignups, resetMockAuthState(), ResetRecord (+27 more)

### Community 89 - "api/config.ts"
Cohesion: 0.10
Nodes (19): GET(), jar, ApiMode, DEPENDS_ON, rawMode(), readMode(), resolveMode(), ResourceName (+11 more)

### Community 90 - "[locale]/page.tsx"
Cohesion: 0.10
Nodes (21): BRAND_STORY_IMAGES, TV_THUMBS, ArticleCard, ArticleCards(), BrandStory(), BrandStoryImage, CategoryGrid(), COLUMN_CLASSES (+13 more)

### Community 92 - "success/page.tsx"
Cohesion: 0.14
Nodes (15): etaDaysOf(), FIRST_WEAR_ARTICLES, FIRST_WEAR_VIDEO, firstWearReads(), metadata, readOrder(), SuccessPage(), ADR-0002 (+7 more)

### Community 93 - "support/page.tsx"
Cohesion: 0.15
Nodes (17): FaqAccordion(), FaqAnswer, entries, PolicyId, TOPIC_ICONS, BeginnerFaq(), OrderLookupForm(), ProductReassurance() (+9 more)

### Community 94 - "pricing/mock.ts"
Cohesion: 0.18
Nodes (13): bestVoucher(), chosenVoucher(), ADR-0012, ADR-0023, validVouchers(), voucherApplies(), voucherDiscount(), voucherRefusal() (+5 more)

### Community 96 - "to-spec/SKILL.md"
Cohesion: 0.22
Nodes (8): Further Notes, Implementation Decisions, Out of Scope, Problem Statement, Process, Solution, Testing Decisions, User Stories

### Community 100 - "guide.test.tsx"
Cohesion: 0.10
Nodes (19): SupportPage(), renderHub(), ADR-0022, Footer(), topicSchema, locales, CHANNELS, CONTACT_CHANNELS (+11 more)

### Community 101 - "5. Migration Strategy"
Cohesion: 0.33
Nodes (6): 5. Migration Strategy, Adapting drift, Conformance suite, Cutover order, Per-resource cutover, Runtime validation

### Community 104 - "collection-filters.tsx"
Cohesion: 0.07
Nodes (41): CheckRow(), Chip(), ClearRxFilter(), CollectionFilters(), CollectionFiltersSheet(), CollectionLoadMore(), CollectionSort(), DefaultRxAutoApply() (+33 more)

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

### Community 113 - "lens-facets.ts"
Cohesion: 0.06
Nodes (54): HomePage(), FacetBrowser(), Swatches(), valueLabel(), ITEM_CLASS, MegaNav(), pathname, MobileNav() (+46 more)

### Community 114 - "checkout-guest-member.test.tsx"
Cohesion: 0.17
Nodes (9): api(), HOME, json(), NEW, OFFICE, ORDER, PRICED, push (+1 more)

### Community 115 - "fetchViaSelf"
Cohesion: 0.23
Nodes (9): fetchOrder(), OrderDetailPage(), fetchOrders(), OrderHistoryPage(), approvedReviews(), ProductPage(), renderProduct(), fetchViaSelf() (+1 more)

### Community 116 - "cart-view.tsx"
Cohesion: 0.08
Nodes (41): FavoritesGrid(), addToCart(), CartView(), ADR-0003, ADR-0012, LastOrder, OrderInfo(), SuccessView() (+33 more)

### Community 117 - "sign-up.test.tsx"
Cohesion: 0.20
Nodes (5): SignUpForm(), authenticate(), done(), push, user

### Community 118 - "Vivimoon.vn — Live Site Data-Model Audit"
Cohesion: 0.40
Nodes (4): 1. Site structure, 2. Product detail page — data fields observed, 3. Open question — not acted on, Vivimoon.vn — Live Site Data-Model Audit

### Community 119 - "review-form.tsx"
Cohesion: 0.13
Nodes (20): fill(), ReviewForm(), ReviewFormDict, StarInput(), SUB_RATINGS, SubRatingKey, TAGS, ACCEPT (+12 more)

### Community 120 - "list-id.ts"
Cohesion: 0.36
Nodes (6): collectionListId(), MEMBERSHIP_FILTERS, normalizeColors(), COLLECTION_COLORS, idFor(), ProductQuery

### Community 121 - "common.ts"
Cohesion: 0.06
Nodes (24): POST(), BASELINE_LINES, jar, SINGLE, ADR-0023, BASELINE_LINES, RX, ADR-0012 (+16 more)

### Community 122 - "account/layout.tsx"
Cohesion: 0.27
Nodes (6): AccountShell(), AccountShellDict, dict, AccountLayout(), fetchData(), ADR-0002

### Community 123 - "checkout.ts"
Cohesion: 0.15
Nodes (13): defaultShippingOptions, shippingRates, shipping, mockShipping, Shipping, ShippingError, pricedLineSchema, Address (+5 more)

### Community 124 - "loyalty/mock.ts"
Cohesion: 0.12
Nodes (16): loyaltyHistory, earnedBy(), entry(), held, Loyalty, randomEntryId(), store, ADR-0024 (+8 more)

### Community 125 - "schemas/orders.ts"
Cohesion: 0.14
Nodes (13): ADR-0012, currencySchema, lineReviewSchema, NotificationChannel, OrderLine, orderLineSchema, paymentActionSchema, paymentOrderSchema (+5 more)

### Community 126 - "lens-viewer.test.tsx"
Cohesion: 0.29
Nodes (4): gallery, tones, videos, LensGallery

### Community 129 - "cn"
Cohesion: 0.09
Nodes (41): LocaleError(), LocaleNotFound(), RootNotFound(), CopyButton(), LeadArticle(), LensViewer(), OrderActions(), fill() (+33 more)

### Community 130 - "payments.ts"
Cohesion: 0.14
Nodes (16): ICONS, PaymentMethodPicker(), dict, ADR-0025, IntentMethod, intentMethodSchema, paymentIntentRequestSchema, paymentIntentSchema (+8 more)

### Community 131 - "Task 18: Cart page + line item + order summary"
Cohesion: 0.33
Nodes (6): Task 18: Cart page + line item + order summary, Task 19: Checkout + success (stubbed payment), Task 20: Final verification (responsive, a11y, build, tests), OrderSummary component, Pages table (Home, Collection, PDP, Cart, Checkout, Checkout success), Testing strategy (Vitest unit + RTL component tests)

### Community 132 - "media/route.test.ts"
Cohesion: 0.12
Nodes (9): fail(), POST(), jar, send(), sendRaw(), Upload, REVIEW_MEDIA_LIMITS, mp4DurationSeconds() (+1 more)

### Community 136 - "compare-store.ts"
Cohesion: 0.11
Nodes (16): geistMono, geistSans, metadata, CompareToggle(), ComparisonTray(), mockedApiRequest, CartHydrator(), CompareHydrator() (+8 more)

### Community 137 - "package.json"
Cohesion: 0.50
Nodes (3): name, private, version

### Community 140 - "rx.ts"
Cohesion: 0.11
Nodes (19): AXIS_STEPS, defaultSphSchema, LensType, lineRxSchema, purchaseUnitSchema, Rx, RX_LENS_TYPE, RxEye (+11 more)

### Community 141 - "vouchers/mock.ts"
Cohesion: 0.31
Nodes (5): vouchers, vouchers, mockVouchers, Vouchers, Voucher

### Community 143 - "apiRequest"
Cohesion: 0.10
Nodes (22): remove(), moveToFavorites(), PointsBlock(), FavoriteButton(), toggle(), remove(), useViewerReviews(), mockedApiRequest (+14 more)

### Community 149 - "useCartStore"
Cohesion: 0.12
Nodes (11): ORDER_RESPONSE, renderCheckoutPage(), fetchRoutingTo(), json(), PRICED_RESPONSE, renderCheckoutPage(), CheckoutView(), signOut() (+3 more)

### Community 152 - "catalog/mock.ts"
Cohesion: 0.10
Nodes (20): applies(), Catalog, FacetCounts, FacetDef, FacetKey, HelpfulVoteResult, helpfulVotes, inPriceRange() (+12 more)

### Community 153 - "mini-cart.test.tsx"
Cohesion: 0.13
Nodes (9): add, push, MiniCart(), dict, mockedApiRequest, sandkiss(), dict, product (+1 more)

### Community 155 - "plp-card.ts"
Cohesion: 0.18
Nodes (16): ActiveFilters(), inStockForBothEyes(), LensGalleryContexts, parseDiameterRange(), parseRxPair(), productQuerySchema, activeFilterGroups(), CARD_VIEWS (+8 more)

### Community 156 - "[id]/reviews/route.test.ts"
Cohesion: 0.14
Nodes (7): jar, VALID, HOME_ADDRESS, OFFICE_ADDRESS, orders, ADR-0026, Order

### Community 157 - "articles/page.tsx"
Cohesion: 0.08
Nodes (40): formatDate(), discountLabel(), fetchVouchers(), formatDate(), VouchersPage(), renderIndex(), ArticlesPage(), readSort() (+32 more)

### Community 160 - "pricing/mock.test.ts"
Cohesion: 0.14
Nodes (10): mockLoyalty, pricing, mockPricing, Pricing, PricingError, BASELINE_LINES, SINGLE, ADR-0012 (+2 more)

### Community 162 - "bundle-offer.test.tsx"
Cohesion: 0.14
Nodes (9): bundleAccessories, dict, mockedApiRequest, singleLens, dict, line, lineWithRx, rx (+1 more)

### Community 164 - "review-form.test.tsx"
Cohesion: 0.15
Nodes (5): handleSubmit(), body(), dict, FakeXHR, fillValid()

### Community 165 - "submit/route.ts"
Cohesion: 0.24
Nodes (5): POST(), GET(), POST(), discovery, comparisonMatrixSchema

### Community 166 - "payment/route.ts"
Cohesion: 0.22
Nodes (9): actionRequestSchema, GET(), POST(), ADR-0022, GET(), ADR-0022, ADR-0006, normalizeOrderCode() (+1 more)

### Community 167 - "order-status-timeline.tsx"
Cohesion: 0.22
Nodes (7): OrderStatusTimeline(), Step, STEP_OF, STEPS, dict, ORDER_STATUSES, OrderStatus

### Community 168 - "write-review-button.test.tsx"
Cohesion: 0.18
Nodes (4): fetchMock, LINE, OTHER, push

### Community 169 - "rx-ranges.ts"
Cohesion: 0.33
Nodes (8): AddBand, addBands, axisSteps(), cylValues, hundredths(), RX_RANGES, sphSteps(), stepNote()

### Community 172 - "orders/route.test.ts"
Cohesion: 0.20
Nodes (6): ADDRESS, BASELINE_LINES, jar, RX, ADR-0012, ADR-0025

### Community 173 - "OtpStage"
Cohesion: 0.67
Nodes (3): OtpStage(), fill(), resend()

### Community 175 - "[locale]/layout.tsx"
Cohesion: 0.29
Nodes (5): LocaleLayout(), AnnouncementBar(), BoundaryStringsProvider(), isCheckoutFlow(), SiteChrome()

### Community 176 - "Task 12: Carousels & CategoryGrid"
Cohesion: 0.29
Nodes (7): Multi-language/locale switcher (topbar), Utility topbar (Coolmate), Task 12: Carousels & CategoryGrid, Task 13: Layout chrome (AnnouncementBar, Header, MegaNav, LocaleSwitcher, Footer), Task 14: Home page, HeroCarousel component, LocaleSwitcher component

### Community 180 - "success-view.test.tsx"
Cohesion: 0.22
Nodes (3): FirstWearRead, dict, READS

### Community 181 - "orders-preferred-payment.test.ts"
Cohesion: 0.25
Nodes (4): ADDRESS, jar, LINES, RX

### Community 182 - "helpful/route.test.ts"
Cohesion: 0.39
Nodes (5): ctx(), jar, req(), unvote(), vote()

### Community 183 - "ForgotPasswordForm"
Cohesion: 0.36
Nodes (6): ForgotPasswordForm(), reportServer(), requestCode(), submitPassword(), verifyCode(), push

### Community 185 - "use-comparison.test.ts"
Cohesion: 0.38
Nodes (3): mockedApiRequest, UseComparisonMatrixResult, ComparisonMatrix

### Community 187 - "lens-viewer.tsx"
Cohesion: 0.33
Nodes (5): Slide, Tab, TABS, ViewerVideo, MakeupTone

### Community 188 - "cancel/route.test.ts"
Cohesion: 0.50
Nodes (3): jar, params(), post()

### Community 189 - "maskPhone"
Cohesion: 0.70
Nodes (3): confirmationLine(), maskEmail(), maskPhone()

### Community 192 - "success-buy-now.test.tsx"
Cohesion: 0.67
Nodes (3): makeLine(), renderSuccessPage(), seedLastOrder()

### Community 193 - "trust-badges.tsx"
Cohesion: 0.50
Nodes (3): GLYPHS, TrustBadge, TrustBadges()

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
- **798 isolated node(s):** `npx`, `Stage`, `push`, `push`, `Dict` (+793 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **57 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

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