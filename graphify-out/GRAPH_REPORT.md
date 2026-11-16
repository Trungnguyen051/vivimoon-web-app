# Graph Report - vivimoon-web-app  (2026-11-16)

## Corpus Check
- 542 files · ~309,088 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2647 nodes · 7093 edges · 180 communities (125 shown, 55 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 48 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `cd81799f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- mini-cart.tsx
- cart.ts
- button.tsx
- parseBody
- i18n/config.ts
- payments.ts
- add-to-cart.tsx
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
- types/index.ts
- i18n seam (locale-prefixed routes, getDictionary)
- rx.ts
- Coolmate.me Feature & Structure Analysis
- checkout.ts
- article-page.test.tsx
- cart-line-item.tsx
- Two-tier component architecture (ui/ vs commerce/)
- Product Detail Page (PDP) structure
- product/[slug]/page.tsx
- account-info.tsx
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
- reviews-list.test.tsx
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
- payment-method-picker.tsx
- Domain Docs
- orders/route.ts
- dictionaries.ts
- triage-labels.md
- Vivimoon
- cart-view.tsx
- schemas/orders.ts
- qr-transfer-view.tsx
- getDictionary
- schemas/support.ts
- bundle-offer.tsx
- Process
- Vivimoon M1 — Foundation Implementation Plan
- apiOk
- scripts
- client.ts
- editorial/mock.ts
- Product
- cart/page.test.tsx
- Vivimoon M4 — Discovery Implementation Plan
- auth.ts
- 0001-proxy-seam-replaces-repository-interface.md
- 0002-server-components-self-fetch-mutable-state.md
- 0003-client-never-computes-money.md
- common.ts
- [locale]/page.tsx
- shadcn
- mobile-nav.tsx
- support/page.tsx
- pricing/mock.ts
- 0016-ui-primitives-move-to-base-ui.md
- to-spec/SKILL.md
- 0017-expiry-is-shopper-facing-replacement-is-the-wire-name.md
- 0004-rx-schema-ships-cyl-axis-before-toric-ui.md
- 0005-eye-enlargement-computed-not-stored.md
- nav-destinations.test.ts
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
- AccountInfo
- success-view.tsx
- sign-up.test.tsx
- Vivimoon.vn — Live Site Data-Model Audit
- review-form.test.tsx
- plp-card.ts
- review-media-field.tsx
- ForgotPasswordForm
- schema.ts
- loyalty/mock.ts
- mock/index.ts
- lens-viewer.tsx
- 0010-product-line-excludes-correction-complexity.md
- 0011-eye-enlargement-derives-from-graphic-diameter.md
- buttonVariants
- cn
- success-view.test.tsx
- media/route.test.ts
- 0013-pages-own-their-width.md
- 0012-unavailable-cart-lines-are-reported-not-dropped.md
- Pages run full-bleed with 40px gutters; `PageContainer` no longer caps at `max-w-7xl`
- compare-store.ts
- package.json
- Cart Lines carry a Purchase Unit; a lens is priced per single lens
- Guest orders earn Held Points, credited when an account verifies the phone
- variant-selector.tsx
- vouchers/mock.ts
- AddressesManager
- useSessionStore
- Checkout offers QR transfer, cash on delivery and e-wallet; email becomes optional
- An Article's inline products come from its Reading Theme, not from the Article
- A Guide is a fixed-layout document, and not an Article
- The Support search box filters FAQ Entries; it is not storefront search
- mega-nav.tsx
- @types/react
- 0014-image-optimization-is-on.md
- catalog/mock.ts
- checkout-view.tsx
- zustand
- write-review-button.test.tsx
- parseProductQueryLoose
- success/page.tsx
- Order lookup is by order code alone, shown inline
- A phone sign-up is not an account until its OTP is verified
- pricing/mock.test.ts
- vitest
- helpful/route.test.ts
- helpful-button.test.tsx
- api/config.ts
- cart.test.ts
- spend-tiers.ts
- sign-in.test.tsx
- cart-line-item.test.tsx
- @vitejs/plugin-react
- AddressForm
- site-chrome.tsx
- OtpStage
- Guest orders join the account that verifies their phone
- hub.test.tsx
- Task 12: Carousels & CategoryGrid
- @types/node
- lucide-react
- prettier

## God Nodes (most connected - your core abstractions)
1. `cn()` - 214 edges
2. `getDictionary()` - 108 edges
3. `apiOk()` - 88 edges
4. `apiFail()` - 73 edges
5. `Locale` - 73 edges
6. `Dictionary` - 72 edges
7. `readSessionUserId()` - 62 edges
8. `isLocale()` - 60 edges
9. `apiRequest()` - 48 edges
10. `buttonVariants` - 45 edges

## Surprising Connections (you probably didn't know these)
- `README.md: Vivimoon Next.js project README` --semantically_similar_to--> `Tech stack (Next.js App Router, React 19, TS strict, Tailwind v4, shadcn/ui, embla, RHF+zod, GA4, Vitest)`  [INFERRED] [semantically similar]
  README.md → docs/superpowers/specs/2026-08-16-vivimoon-storefront-baseline-design.md
- `remove()` --calls--> `apiRequest()`  [EXTRACTED]
  app/[locale]/account/favorites/favorites-grid.tsx → lib/api/client.ts
- `renderCheckoutPage()` --calls--> `getDictionary()`  [EXTRACTED]
  app/[locale]/checkout/(flow)/checkout-buy-now.test.tsx → lib/i18n/dictionaries.ts
- `renderCheckoutPage()` --calls--> `getDictionary()`  [EXTRACTED]
  app/[locale]/checkout/(flow)/checkout-guest-member.test.tsx → lib/i18n/dictionaries.ts
- `renderCheckoutPage()` --calls--> `getDictionary()`  [EXTRACTED]
  app/[locale]/checkout/(flow)/checkout-preferred-payment.test.tsx → lib/i18n/dictionaries.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Cart feature data flow: reducer, storage, context, hook composing CartProvider** — docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_cartprovider, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_usecart, docs_superpowers_plans_2026_08_16_vivimoon_storefront_baseline_task9_cart_feature [EXTRACTED 1.00]
- **Four swappable architecture seams (data, theming, i18n, analytics) isolating volatility** — docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_productrepository, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_theming_seam, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_i18n_seam, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_analytics_seam [EXTRACTED 1.00]
- **Coolmate apparel patterns re-modeled for Vivimoon contact-lens domain** — docs_research_coolmate_website_analysis_product_card, docs_research_coolmate_website_analysis_pdp, docs_research_coolmate_website_analysis_color_variant_url_pattern, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_productcard, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_variant [INFERRED 0.85]

## Communities (180 total, 55 thin omitted)

### Community 0 - "mini-cart.tsx"
Cohesion: 0.08
Nodes (27): CartView(), LocaleLayout(), CartLineItem(), describe(), MiniCart(), MiniCartBody(), ADR-0003, ICONS (+19 more)

### Community 1 - "cart.ts"
Cohesion: 0.11
Nodes (18): bundleTagSchema, cartStateSchema, giftLineSchema, nextSpendTierSchema, priceCartRequestSchema, PriceLineInput, ShippingSelection, shippingSelectionSchema (+10 more)

### Community 2 - "button.tsx"
Cohesion: 0.11
Nodes (32): AddressDict, EMPTY_FORM, FormState, Stage, Dict, ADR-0021, SocialAuth(), ADR-0022 (+24 more)

### Community 3 - "parseBody"
Cohesion: 0.18
Nodes (20): POST(), jar, Order, POST(), POST(), POST(), POST(), ADR-0021 (+12 more)

### Community 4 - "i18n/config.ts"
Cohesion: 0.14
Nodes (19): CarouselNav(), CollectionCarousel(), FavoriteButton(), HelpfulButton(), Vote, PriceTag(), ProductCard(), ProductGrid() (+11 more)

### Community 5 - "payments.ts"
Cohesion: 0.14
Nodes (13): mockPayments, Payments, ADR-0025, IntentMethod, intentMethodSchema, PaymentIntent, PaymentIntentRequest, paymentIntentRequestSchema (+5 more)

### Community 6 - "add-to-cart.tsx"
Cohesion: 0.17
Nodes (13): AddToCart(), ADR-0023, defaultRxDraft, draftFromDefaultRx(), draftToRx(), POWER_GUIDE_SLUG, RxDraft, RxSelector() (+5 more)

### Community 7 - "dependencies"
Cohesion: 0.07
Nodes (27): @base-ui/react, class-variance-authority, clsx, embla-carousel-react, @hookform/resolvers, next, @next/third-parties, dependencies (+19 more)

### Community 8 - "Vivimoon M2 — Purchase Core Implementation Plan"
Cohesion: 0.11
Nodes (19): File Structure, Global Constraints, M2 Definition of Done, Scope note: why `cyl`/`axis` exist in the schema but not the UI, Task 10: Order placement, Task 11: Guest → member cart merge, Task 12: Buy Now, Task 13: M2 verification (+11 more)

### Community 9 - "cookie.ts"
Cohesion: 0.08
Nodes (13): jar, jar, VALID, jar, jar, jar, secret(), SESSION_COOKIE (+5 more)

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
Nodes (47): req(), accessoryOptionSchema, Collection, collectionSchema, comfortSchema, CompareRequest, compareRequestSchema, ComparisonRow (+39 more)

### Community 15 - "en.ts"
Cohesion: 0.10
Nodes (15): definition, mockedApiRequest, ComfortHighlight(), items, product, ProductVideoCard, ProductVideos(), videos (+7 more)

### Community 16 - "Product domain type"
Cohesion: 0.13
Nodes (17): Planned file structure (app/, lib/, content/, features/cart/, components/, tests/), Global constraints (Node 20+, TS strict, no hardcoded strings, no raw gtag, no data-fetching in ui/commerce components), Vivimoon Storefront Baseline Implementation Plan, Task 1: Scaffold project & tooling, Task 2: Testing setup (Vitest + RTL), Task 3: Utilities (cn, formatPrice), Task 4: Domain types, Task 5: Mock content (+9 more)

### Community 17 - "types/index.ts"
Cohesion: 0.15
Nodes (10): get(), mockedFetchViaSelf, ADR-0002, SpecTable(), baseSpecs, dict, ADR-0011, reviews (+2 more)

### Community 18 - "i18n seam (locale-prefixed routes, getDictionary)"
Cohesion: 0.13
Nodes (16): Task 7: i18n seam (config, dictionaries, middleware), Task 8: Analytics seam (GA4), Analytics seam (GA4 via typed track() wrapper), GA4 ecommerce events (view_item_list, select_item, view_item, add_to_cart, remove_from_cart, view_cart, begin_checkout, purchase), getDictionary(locale) function, @next/third-parties GoogleAnalytics component, Rationale for lightweight custom i18n over next-intl, i18n seam (locale-prefixed routes, getDictionary) (+8 more)

### Community 19 - "rx.ts"
Cohesion: 0.08
Nodes (29): AXIS_STEPS, defaultRxSchema, defaultSphSchema, LensType, lineRxSchema, purchaseUnitSchema, Rx, RX_LENS_TYPE (+21 more)

### Community 20 - "Coolmate.me Feature & Structure Analysis"
Cohesion: 0.12
Nodes (16): Screen-reader-only accessible text investment, Announcement bar (Coolmate), Blog / content-marketing hub, Care & Share CSR program, Community Threads (UGC/community hub), Cookie consent banner + preference center, CXP by Coolmate (custom-print sub-brand), Footer (contact, link columns, address, certifications) (+8 more)

### Community 21 - "checkout.ts"
Cohesion: 0.12
Nodes (15): ADDRESS, LINES, defaultShippingOptions, shippingRates, shipping, mockShipping, Shipping, ShippingError (+7 more)

### Community 22 - "article-page.test.tsx"
Cohesion: 0.18
Nodes (15): matchCount(), renderArticle(), ArticlePage(), readingThemeSchema, countReadingTheme(), READING_THEME_ENTRIES, readingThemeDestination, readingThemeEntry (+7 more)

### Community 23 - "cart-line-item.tsx"
Cohesion: 0.09
Nodes (31): QrTransferPage(), LensChips(), ADR-0012, Card, CartUpsell(), formatLineSummary(), formatPower(), formatPowers() (+23 more)

### Community 24 - "Two-tier component architecture (ui/ vs commerce/)"
Cohesion: 0.13
Nodes (17): Task 15: Collection listing page + filters, Task 16: PDP components (Gallery, VariantSelector, SpecTable, ReviewsList), Task 17: PDP page + Add-to-cart, Task 18: Cart page + line item + order summary, CartLineItem component, CategoryGrid component, CollectionCarousel component, Two-tier component architecture (ui/ vs commerce/) (+9 more)

### Community 25 - "Product Detail Page (PDP) structure"
Cohesion: 0.40
Nodes (5): Color variants as distinct URLs (?color=slug) for SEO/deep-linking, CoolClub loyalty program + CoolCash currency, Fabric-technology brand system (cross-cutting taxonomy: CoolDry, CoolSoft, CoolRib, CoolFlex, ZeroMark), Fit-feedback histogram (Tight/True-to-size/Loose) in reviews, Product Detail Page (PDP) structure

### Community 26 - "product/[slug]/page.tsx"
Cohesion: 0.14
Nodes (21): ADR-0018, ADR-0002, renderFaq(), parseTopic(), SupportFaqPage(), ADR-0019, ReviewsSummary(), HomeSection() (+13 more)

### Community 27 - "account-info.tsx"
Cohesion: 0.14
Nodes (16): GENDERS, subscribe(), useDesktop(), WriteReviewButton(), Dialog(), DialogClose(), DialogContent(), DialogDescription() (+8 more)

### Community 28 - "editorial.ts"
Cohesion: 0.12
Nodes (17): MakeupLookCard, MakeupLooks(), cards, ADR-0018, makeupLooks, Article, articleQuerySchema, articleSchema (+9 more)

### Community 29 - "account/mock.ts"
Cohesion: 0.06
Nodes (25): jar, ADDRESS, jar, addressErrorResponse(), DELETE(), PATCH(), jar, DELETE() (+17 more)

### Community 30 - "Vivimoon Storefront Baseline Design Spec"
Cohesion: 0.17
Nodes (15): Gender filter toggle (in-place homepage filtering), Hero banner carousel (7 slides), Homepage structure (hero carousel, promo tiles, category grid), Product card component (hover-swap, swatches, badges, price), Themed collection sections with product carousels, Task 19: Checkout + success (stubbed payment), Task 20: Final verification (responsive, a11y, build, tests), Build sequence (13 high-level steps) (+7 more)

### Community 31 - "cart-store.ts"
Cohesion: 0.07
Nodes (33): ORDER_RESPONSE, renderCheckoutPage(), renderCheckoutPage(), fetchRoutingTo(), json(), PRICED_RESPONSE, renderCheckoutPage(), makeLine() (+25 more)

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
Cohesion: 0.06
Nodes (35): jar, params(), post(), actionRequestSchema, GET(), POST(), ADR-0022, GET() (+27 more)

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
Cohesion: 0.07
Nodes (33): GET(), quiz, QUIZ_MATCHES, DiscoveryError, mockDiscovery, toComparisonRow(), QuizAnswer, quizAnswerSchema (+25 more)

### Community 42 - "reviews-list.test.tsx"
Cohesion: 0.13
Nodes (15): fill(), ReviewCard(), ReviewsList(), base, fetchMock, reviews, useViewerReviews(), reviewSchema (+7 more)

### Community 46 - "source-files.ts"
Cohesion: 0.20
Nodes (9): ADR-0016, nextConfig, ADR-0014, isTest(), isVendored(), SKIP, sourceFiles(), withoutComments() (+1 more)

### Community 61 - "M1 Foundation — progress ledger"
Cohesion: 0.22
Nodes (8): M1 Foundation — progress ledger, M2 Task 11 — Guest → member cart merge (2026-09-02), M2 Task 12 — Buy Now (2026-09-02), M2 Task 13 — M2 verification (2026-09-02), M2 Task 5 — RxSelector and Rx-aware add-to-cart (2026-08-31), M2 Task 6 — Server-owned pricing and auto-voucher (2026-08-31), M2 Task 7 — Cart page renders server prices (2026-08-31), M4 Task 9 — M4 verification (2026-09-05)

### Community 62 - "Issue tracker: GitHub"
Cohesion: 0.29
Nodes (6): Conventions, Issue tracker: GitHub, Pull requests as a triage surface, Wayfinding operations, When a skill says "fetch the relevant ticket", When a skill says "publish to the issue tracker"

### Community 63 - "payment-method-picker.tsx"
Cohesion: 0.22
Nodes (10): AddressCards(), ICONS, PaymentMethodPicker(), dict, ADR-0025, RadioCard(), PaymentMethodType, PaymentMethodOption (+2 more)

### Community 64 - "Domain Docs"
Cohesion: 0.33
Nodes (5): Before exploring, read these, Domain Docs, File structure, Flag ADR conflicts, Use the glossary's vocabulary

### Community 65 - "orders/route.ts"
Cohesion: 0.07
Nodes (16): BASELINE_LINES, jar, SINGLE, ADR-0023, ADDRESS, jar, LINES, RX (+8 more)

### Community 66 - "dictionaries.ts"
Cohesion: 0.11
Nodes (26): discountLabel(), fetchVouchers(), formatDate(), VouchersPage(), OrderInfo(), formatDate(), OrderDetailView(), Tone (+18 more)

### Community 69 - "cart-view.tsx"
Cohesion: 0.17
Nodes (17): FavoritesPage(), fetchFavorites(), fetchLoyalty(), formatDate(), LoyaltyPage(), ADR-0003, ADR-0012, VoucherPicker() (+9 more)

### Community 70 - "schemas/orders.ts"
Cohesion: 0.10
Nodes (17): dict, push, refresh, renderView(), currencySchema, lineReviewSchema, NotificationChannel, orderLineSchema (+9 more)

### Community 71 - "qr-transfer-view.tsx"
Cohesion: 0.12
Nodes (18): metadata, ADR-0002, ADR-0022, mmss(), QrLine, QrTransferView(), dict, LINES (+10 more)

### Community 72 - "getDictionary"
Cohesion: 0.06
Nodes (50): AboutPage(), AccountShell(), AccountShellDict, dict, AddressesPage(), fetchAddresses(), AccountLayout(), fetchData() (+42 more)

### Community 73 - "schemas/support.ts"
Cohesion: 0.08
Nodes (25): post(), guides, ADR-0019, faqEntries, ADR-0019, ADR-0019, guideFeedback, mockSupport (+17 more)

### Community 74 - "bundle-offer.tsx"
Cohesion: 0.08
Nodes (23): add, push, BundleOffer(), bundleAccessories, dict, mockedApiRequest, singleLens, ADR-0003 (+15 more)

### Community 75 - "Process"
Cohesion: 0.15
Nodes (12): 1. Gather context, 2. Explore the codebase (optional), 3. Draft vertical slices, 4. Quiz the user, 5. Publish the tickets to the configured tracker, Acceptance criteria, Blocked by, <NN> — <Ticket title> (+4 more)

### Community 76 - "Vivimoon M1 — Foundation Implementation Plan"
Cohesion: 0.11
Nodes (18): File Structure, Global Constraints, M1 Definition of Done, Task 10: Browser API client, session sync, and the sign-in / sign-up pages, Task 11: Forgot-password OTP flow, Task 12: Account resource and route handlers, Task 13: Account page, route guards, and M1 verification, Task 1: API config and response envelope (+10 more)

### Community 77 - "apiOk"
Cohesion: 0.11
Nodes (40): GET(), POST(), DELETE(), GET(), POST(), GET(), PATCH(), GET() (+32 more)

### Community 78 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, build, dev, lint, start, test, test:contract, test:contract:upstream (+2 more)

### Community 79 - "client.ts"
Cohesion: 0.09
Nodes (17): moveToFavorites(), ComparisonDialog(), matrix, ComparisonTray(), mockedApiRequest, toggle(), GuideFeedback(), mockedApiRequest (+9 more)

### Community 80 - "editorial/mock.ts"
Cohesion: 0.21
Nodes (13): Editorial, mockEditorial, searchable(), ArticleQuery, Topic, FaqQuery, filterFaqEntries(), searchable() (+5 more)

### Community 81 - "Product"
Cohesion: 0.20
Nodes (11): FavoritesGrid(), addToCart(), remove(), Gtag, product, track(), AnalyticsEvent, Ga4Item (+3 more)

### Community 82 - "cart/page.test.tsx"
Cohesion: 0.21
Nodes (11): lens(), makeLine(), mockedApiRequest, push, realPricing(), renderCartPage(), renderWithStaleLine(), track (+3 more)

### Community 83 - "Vivimoon M4 — Discovery Implementation Plan"
Cohesion: 0.13
Nodes (15): File Structure, Global Constraints, M4 Definition of Done, Scope note: the §6/§10 eyeEnlargement conflict, Task 1: Mirrored reviews — source badge, Task 2: Comparison — eye-enlargement banding, schemas, discovery resource, Task 3: Comparison — store, toggle, persistent tray, Task 4: Comparison — matrix Dialog (+7 more)

### Community 84 - "auth.ts"
Cohesion: 0.07
Nodes (35): Auth, findByIdentifier(), mockAuth, OtpRecord, otps, pendingSignups, resetMockAuthState(), ResetRecord (+27 more)

### Community 89 - "common.ts"
Cohesion: 0.06
Nodes (28): BASELINE_LINES, RX, ADR-0012, ADDRESS, BASELINE_LINES, jar, RX, ADR-0012 (+20 more)

### Community 90 - "[locale]/page.tsx"
Cohesion: 0.09
Nodes (30): BRAND_STORY_IMAGES, HomePage(), TV_THUMBS, BrandStory(), BrandStoryImage, CategoryGrid(), COLUMN_CLASSES, ContentCard (+22 more)

### Community 92 - "mobile-nav.tsx"
Cohesion: 0.17
Nodes (15): FacetBrowser(), Swatches(), valueLabel(), MobileNav(), getNavItems(), Sheet(), SheetClose(), SheetDescription() (+7 more)

### Community 93 - "support/page.tsx"
Cohesion: 0.21
Nodes (12): FaqAccordion(), FaqAnswer, entries, PolicyId, TOPIC_ICONS, BeginnerFaq(), ProductReassurance(), RETURNS_FAQ (+4 more)

### Community 94 - "pricing/mock.ts"
Cohesion: 0.15
Nodes (16): bestVoucher(), chosenVoucher(), Pricing, ADR-0012, ADR-0023, validVouchers(), voucherApplies(), voucherDiscount() (+8 more)

### Community 96 - "to-spec/SKILL.md"
Cohesion: 0.22
Nodes (8): Further Notes, Implementation Decisions, Out of Scope, Problem Statement, Process, Solution, Testing Decisions, User Stories

### Community 100 - "nav-destinations.test.ts"
Cohesion: 0.16
Nodes (11): NavItem, locales, config, GUARDED, segmentsOf(), RETIRED, ADR-0017, routeSegments() (+3 more)

### Community 101 - "5. Migration Strategy"
Cohesion: 0.33
Nodes (6): 5. Migration Strategy, Adapting drift, Conformance suite, Cutover order, Per-resource cutover, Runtime validation

### Community 104 - "collection-filters.tsx"
Cohesion: 0.12
Nodes (31): ActiveFilters(), CheckRow(), Chip(), ClearRxFilter(), CollectionFilters(), CollectionFiltersSheet(), CollectionImageView(), CollectionLoadMore() (+23 more)

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
Cohesion: 0.14
Nodes (17): MegaNav(), pathname, replacementScheduleSchema, DIAMETER_BUCKETS, DiameterBucket, FACET_COLLECTION, facetAnchorId(), facetDestinations() (+9 more)

### Community 114 - "checkout-guest-member.test.tsx"
Cohesion: 0.17
Nodes (9): api(), HOME, json(), NEW, OFFICE, ORDER, PRICED, push (+1 more)

### Community 115 - "AccountInfo"
Cohesion: 0.16
Nodes (8): AccountInfo(), patch(), saveAccount(), savePersonal(), fmtDob(), fmtRx(), push, user

### Community 116 - "success-view.tsx"
Cohesion: 0.21
Nodes (11): confirmationLine(), LastOrder, PointsBlock(), SuccessView(), ADR-0021, ADR-0022, ADR-0024, CopyButton() (+3 more)

### Community 117 - "sign-up.test.tsx"
Cohesion: 0.20
Nodes (5): SignUpForm(), authenticate(), done(), push, user

### Community 118 - "Vivimoon.vn — Live Site Data-Model Audit"
Cohesion: 0.40
Nodes (4): 1. Site structure, 2. Product detail page — data fields observed, 3. Open question — not acted on, Vivimoon.vn — Live Site Data-Model Audit

### Community 119 - "review-form.test.tsx"
Cohesion: 0.14
Nodes (6): ReviewForm(), handleSubmit(), body(), dict, FakeXHR, fillValid()

### Community 120 - "plp-card.ts"
Cohesion: 0.16
Nodes (18): CollectionPage(), resolveTitle(), chipPower(), PowerSelect(), PowerField(), LensGalleryContexts, activeFilterGroups(), CARD_VIEWS (+10 more)

### Community 121 - "review-media-field.tsx"
Cohesion: 0.18
Nodes (14): ACCEPT, fill(), Kind, kindOf(), MediaDict, MediaState, ReviewMediaField(), add() (+6 more)

### Community 122 - "ForgotPasswordForm"
Cohesion: 0.36
Nodes (6): ForgotPasswordForm(), reportServer(), requestCode(), submitPassword(), verifyCode(), push

### Community 123 - "schema.ts"
Cohesion: 0.20
Nodes (9): isPhone(), addressLabelSchema, notificationChannelSchema, CheckoutForm, CheckoutFormInput, checkoutSchema, ADR-0025, VALID (+1 more)

### Community 124 - "loyalty/mock.ts"
Cohesion: 0.15
Nodes (12): loyaltyHistory, earnedBy(), entry(), held, Loyalty, randomEntryId(), store, ADR-0024 (+4 more)

### Community 125 - "mock/index.ts"
Cohesion: 0.11
Nodes (17): accessories, addresses, collections, favorites, HOME_ADDRESS, OFFICE_ADDRESS, orders, ADR-0026 (+9 more)

### Community 126 - "lens-viewer.tsx"
Cohesion: 0.14
Nodes (11): LensViewer(), Slide, Tab, TABS, gallery, tones, videos, ViewerVideo (+3 more)

### Community 129 - "buttonVariants"
Cohesion: 0.09
Nodes (25): LocaleError(), LocaleNotFound(), QuizFlow(), goNext(), RootNotFound(), ADR-0012, LineSummary(), OrderActions() (+17 more)

### Community 130 - "cn"
Cohesion: 0.08
Nodes (33): renderIndex(), ArticlesPage(), readSort(), readTheme(), ArticleCard, ArticleCards(), LeadArticle(), OrderSummary() (+25 more)

### Community 131 - "success-view.test.tsx"
Cohesion: 0.22
Nodes (3): FirstWearRead, dict, READS

### Community 132 - "media/route.test.ts"
Cohesion: 0.15
Nodes (4): jar, send(), sendRaw(), Upload

### Community 136 - "compare-store.ts"
Cohesion: 0.13
Nodes (13): geistMono, geistSans, metadata, CompareToggle(), CartHydrator(), CompareHydrator(), COMPARE_CAP, COMPARE_STORAGE (+5 more)

### Community 137 - "package.json"
Cohesion: 0.50
Nodes (3): name, private, version

### Community 140 - "variant-selector.tsx"
Cohesion: 0.26
Nodes (8): resolveVariant(), coloredProduct, colorlessProduct, dict, VariantSelector(), selectColor(), Variant, distinctColorVariants()

### Community 141 - "vouchers/mock.ts"
Cohesion: 0.31
Nodes (5): vouchers, vouchers, mockVouchers, Vouchers, Voucher

### Community 142 - "AddressesManager"
Cohesion: 0.20
Nodes (4): AddressesManager(), NON_DEFAULT, toFormState(), SavedAddress

### Community 143 - "useSessionStore"
Cohesion: 0.12
Nodes (16): dict, push, GUEST_RX_KEY, readGuestRx(), useDefaultRx(), save(), useGuestRxStore, SessionStore (+8 more)

### Community 149 - "mega-nav.tsx"
Cohesion: 0.29
Nodes (10): ITEM_CLASS, NavigationMenu(), NavigationMenuContent(), NavigationMenuIndicator(), NavigationMenuItem(), NavigationMenuLink(), NavigationMenuList(), NavigationMenuPositioner() (+2 more)

### Community 152 - "catalog/mock.ts"
Cohesion: 0.09
Nodes (22): applies(), Catalog, FacetCounts, FacetDef, FacetKey, HelpfulVoteResult, helpfulVotes, inPriceRange() (+14 more)

### Community 153 - "checkout-view.tsx"
Cohesion: 0.11
Nodes (17): ADDRESS_FIELDS, CheckoutView(), signOut(), FieldName, placedOrderPath(), ADR-0012, ADR-0022, ADR-0024 (+9 more)

### Community 155 - "write-review-button.test.tsx"
Cohesion: 0.18
Nodes (4): fetchMock, LINE, OTHER, push

### Community 156 - "parseProductQueryLoose"
Cohesion: 0.14
Nodes (15): collectionListId(), MEMBERSHIP_FILTERS, normalizeColors(), COLLECTION_COLORS, idFor(), parseProductQueryLoose(), ProductQuery, ReplacementSchedule (+7 more)

### Community 157 - "success/page.tsx"
Cohesion: 0.12
Nodes (18): etaDaysOf(), FIRST_WEAR_ARTICLES, FIRST_WEAR_VIDEO, firstWearReads(), metadata, readOrder(), SuccessPage(), ADR-0002 (+10 more)

### Community 160 - "pricing/mock.test.ts"
Cohesion: 0.22
Nodes (6): mockLoyalty, BASELINE_LINES, SINGLE, ADR-0012, ADR-0023, UNDER_FREESHIP_LINES

### Community 162 - "helpful/route.test.ts"
Cohesion: 0.39
Nodes (5): ctx(), jar, req(), unvote(), vote()

### Community 165 - "api/config.ts"
Cohesion: 0.13
Nodes (13): POST(), POST(), POST(), ApiMode, DEPENDS_ON, rawMode(), readMode(), resolveMode() (+5 more)

### Community 166 - "cart.test.ts"
Cohesion: 0.29
Nodes (6): cartLineSchema, MAX_LINE_QUANTITY, priceLineInputSchema, cartLine, pricedLine, priceLine

### Community 167 - "spend-tiers.ts"
Cohesion: 0.40
Nodes (4): SPEND_TIERS, spendTiersFor(), TIER_GIFT_VARIANT_ID, NextSpendTier

### Community 169 - "cart-line-item.test.tsx"
Cohesion: 0.40
Nodes (4): dict, line, lineWithRx, rx

### Community 173 - "OtpStage"
Cohesion: 0.67
Nodes (3): OtpStage(), fill(), resend()

### Community 175 - "hub.test.tsx"
Cohesion: 0.16
Nodes (11): featured, renderHub(), ADR-0020, SupportPage(), renderHub(), ADR-0022, FEATURED_LIMIT, CHANNELS (+3 more)

### Community 176 - "Task 12: Carousels & CategoryGrid"
Cohesion: 0.29
Nodes (7): Multi-language/locale switcher (topbar), Utility topbar (Coolmate), Task 12: Carousels & CategoryGrid, Task 13: Layout chrome (AnnouncementBar, Header, MegaNav, LocaleSwitcher, Footer), Task 14: Home page, HeroCarousel component, LocaleSwitcher component

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
- **795 isolated node(s):** `npx`, `Stage`, `push`, `push`, `Dict` (+790 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **55 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

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