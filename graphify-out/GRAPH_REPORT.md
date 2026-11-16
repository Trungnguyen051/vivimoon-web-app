# Graph Report - vivimoon-web-app  (2026-11-16)

## Corpus Check
- 549 files · ~312,859 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2664 nodes · 7206 edges · 183 communities (128 shown, 55 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 48 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0389eefd`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [locale]/layout.tsx
- cart.ts
- sign-up-form.tsx
- apiOk
- AccountInfo
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
- buttonVariants
- Product domain type
- mock/index.ts
- i18n seam (locale-prefixed routes, getDictionary)
- mini-cart.tsx
- Coolmate.me Feature & Structure Analysis
- auth.ts
- article-page.test.tsx
- discovery/mock.ts
- Two-tier component architecture (ui/ vs commerce/)
- Product Detail Page (PDP) structure
- collection/[slug]/page.tsx
- cn
- editorial.ts
- addresses-manager.tsx
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
- session-store.ts
- Domain Docs
- orders/route.ts
- order-detail-view.tsx
- triage-labels.md
- Vivimoon
- apiFail
- plp-card.ts
- qr-transfer-view.tsx
- dictionaries.ts
- schemas/support.ts
- bundle-offer.tsx
- Process
- Vivimoon M1 — Foundation Implementation Plan
- [id]/reviews/route.test.ts
- scripts
- en.ts
- editorial/mock.ts
- Product
- cart/page.test.tsx
- Vivimoon M4 — Discovery Implementation Plan
- cart-view.tsx
- 0001-proxy-seam-replaces-repository-interface.md
- 0002-server-components-self-fetch-mutable-state.md
- 0003-client-never-computes-money.md
- common.ts
- cn.ts
- shadcn
- success-view.tsx
- support/page.tsx
- hub.test.tsx
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
- mega-nav.tsx
- formatPrice
- sign-up.test.tsx
- Vivimoon.vn — Live Site Data-Model Audit
- review-form.tsx
- list-id.ts
- price/route.test.ts
- account-shell.tsx
- quote/route.ts
- loyalty/mock.ts
- schemas/orders.ts
- lens-viewer.tsx
- 0010-product-line-excludes-correction-complexity.md
- 0011-eye-enlargement-derives-from-graphic-diameter.md
- Locale
- variant-selector.tsx
- pricing/mock.test.ts
- media/route.test.ts
- 0013-pages-own-their-width.md
- 0012-unavailable-cart-lines-are-reported-not-dropped.md
- Pages run full-bleed with 40px gutters; `PageContainer` no longer caps at `max-w-7xl`
- compare-store.ts
- package.json
- Cart Lines carry a Purchase Unit; a lens is priced per single lens
- Guest orders earn Held Points, credited when an account verifies the phone
- rx.ts
- checkout.ts
- quiz-flow.tsx
- client.ts
- Checkout offers QR transfer, cash on delivery and e-wallet; email becomes optional
- An Article's inline products come from its Reading Theme, not from the Article
- A Guide is a fixed-layout document, and not an Article
- The Support search box filters FAQ Entries; it is not storefront search
- checkout-view.tsx
- @types/react
- 0014-image-optimization-is-on.md
- catalog/mock.ts
- favorites-grid.tsx
- zustand
- cart-line-item.tsx
- vouchers/mock.ts
- articles/page.tsx
- Order lookup is by order code alone, shown inline
- A phone sign-up is not an account until its OTP is verified
- pricing/mock.ts
- vitest
- spend-tiers.ts
- review-form.test.tsx
- api/config.ts
- spec-table.tsx
- occasions.ts
- write-review-button.test.tsx
- welcome-dialog.test.tsx
- @vitejs/plugin-react
- OtpStage
- Guest orders join the account that verifies their phone
- Task 12: Carousels & CategoryGrid
- @types/node
- lucide-react
- prettier
- success-view.test.tsx
- helpful/route.test.ts
- ForgotPasswordForm
- helpful-button.test.tsx
- sign-in.test.tsx
- [locale]/page.tsx

## God Nodes (most connected - your core abstractions)
1. `cn()` - 218 edges
2. `getDictionary()` - 108 edges
3. `apiOk()` - 88 edges
4. `Locale` - 75 edges
5. `Dictionary` - 75 edges
6. `apiFail()` - 73 edges
7. `readSessionUserId()` - 62 edges
8. `isLocale()` - 60 edges
9. `apiRequest()` - 49 edges
10. `buttonVariants` - 45 edges

## Surprising Connections (you probably didn't know these)
- `README.md: Vivimoon Next.js project README` --semantically_similar_to--> `Tech stack (Next.js App Router, React 19, TS strict, Tailwind v4, shadcn/ui, embla, RHF+zod, GA4, Vitest)`  [INFERRED] [semantically similar]
  README.md → docs/superpowers/specs/2026-08-16-vivimoon-storefront-baseline-design.md
- `remove()` --calls--> `apiRequest()`  [EXTRACTED]
  app/[locale]/account/favorites/favorites-grid.tsx → lib/api/client.ts
- `moveToFavorites()` --calls--> `apiRequest()`  [EXTRACTED]
  app/[locale]/cart/cart-view.tsx → lib/api/client.ts
- `renderCheckoutPage()` --calls--> `getDictionary()`  [EXTRACTED]
  app/[locale]/checkout/(flow)/checkout-buy-now.test.tsx → lib/i18n/dictionaries.ts
- `renderCheckoutPage()` --calls--> `getDictionary()`  [EXTRACTED]
  app/[locale]/checkout/(flow)/checkout-guest-member.test.tsx → lib/i18n/dictionaries.ts

## Import Cycles
- 3-file cycle: `content/quiz.ts -> lib/api/schemas/discovery.ts -> lib/api/schemas/catalog.ts -> content/quiz.ts`

## Hyperedges (group relationships)
- **Cart feature data flow: reducer, storage, context, hook composing CartProvider** — docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_cartprovider, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_usecart, docs_superpowers_plans_2026_08_16_vivimoon_storefront_baseline_task9_cart_feature [EXTRACTED 1.00]
- **Four swappable architecture seams (data, theming, i18n, analytics) isolating volatility** — docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_productrepository, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_theming_seam, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_i18n_seam, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_analytics_seam [EXTRACTED 1.00]
- **Coolmate apparel patterns re-modeled for Vivimoon contact-lens domain** — docs_research_coolmate_website_analysis_product_card, docs_research_coolmate_website_analysis_pdp, docs_research_coolmate_website_analysis_color_variant_url_pattern, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_productcard, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_variant [INFERRED 0.85]

## Communities (183 total, 55 thin omitted)

### Community 0 - "[locale]/layout.tsx"
Cohesion: 0.11
Nodes (17): ComparisonTray(), AnnouncementBar(), BoundaryStrings, BoundaryStringsContext, BoundaryStringsProvider(), CheckoutHeader(), Footer(), Header() (+9 more)

### Community 1 - "cart.ts"
Cohesion: 0.09
Nodes (22): bundleTagSchema, cartLineSchema, cartStateSchema, nextSpendTierSchema, pricedLineSchema, PriceLineInput, priceLineInputSchema, ShippingSelection (+14 more)

### Community 2 - "sign-up-form.tsx"
Cohesion: 0.12
Nodes (24): Stage, Dict, ADR-0021, SocialAuth(), Alert(), AlertAction(), AlertDescription(), AlertTitle() (+16 more)

### Community 3 - "apiOk"
Cohesion: 0.16
Nodes (27): DELETE(), GET(), PATCH(), POST(), jar, Order, POST(), POST() (+19 more)

### Community 4 - "AccountInfo"
Cohesion: 0.16
Nodes (8): AccountInfo(), patch(), saveAccount(), savePersonal(), fmtDob(), fmtRx(), push, user

### Community 5 - "payments.ts"
Cohesion: 0.09
Nodes (22): AddressCards(), ICONS, PaymentMethodPicker(), dict, ADR-0025, RadioCard(), mockPayments, Payments (+14 more)

### Community 6 - "add-to-cart.tsx"
Cohesion: 0.13
Nodes (14): AddToCart(), dict, push, ADR-0023, defaultRxDraft, draftFromDefaultRx(), draftToRx(), POWER_GUIDE_SLUG (+6 more)

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
Cohesion: 0.04
Nodes (48): req(), mockedApiRequest, UseComparisonMatrixResult, accessoryOptionSchema, Collection, collectionSchema, comfortSchema, CompareRequest (+40 more)

### Community 15 - "buttonVariants"
Cohesion: 0.16
Nodes (12): LocaleError(), LocaleNotFound(), RootNotFound(), LeadArticle(), OrderLineReview(), TONE, noSubscribe(), QuizCard() (+4 more)

### Community 16 - "Product domain type"
Cohesion: 0.13
Nodes (17): Planned file structure (app/, lib/, content/, features/cart/, components/, tests/), Global constraints (Node 20+, TS strict, no hardcoded strings, no raw gtag, no data-fetching in ui/commerce components), Vivimoon Storefront Baseline Implementation Plan, Task 1: Scaffold project & tooling, Task 2: Testing setup (Vitest + RTL), Task 3: Utilities (cn, formatPrice), Task 4: Domain types, Task 5: Mock content (+9 more)

### Community 17 - "mock/index.ts"
Cohesion: 0.07
Nodes (25): mockedFetchViaSelf, ADR-0002, articles, ADR-0018, collections, favorites, galleries, HOME_ADDRESS (+17 more)

### Community 18 - "i18n seam (locale-prefixed routes, getDictionary)"
Cohesion: 0.13
Nodes (16): Task 7: i18n seam (config, dictionaries, middleware), Task 8: Analytics seam (GA4), Analytics seam (GA4 via typed track() wrapper), GA4 ecommerce events (view_item_list, select_item, view_item, add_to_cart, remove_from_cart, view_cart, begin_checkout, purchase), getDictionary(locale) function, @next/third-parties GoogleAnalytics component, Rationale for lightweight custom i18n over next-intl, i18n seam (locale-prefixed routes, getDictionary) (+8 more)

### Community 19 - "mini-cart.tsx"
Cohesion: 0.10
Nodes (23): PowerSelect(), formatLineSummary(), formatPower(), formatPowers(), LineSummary(), lineTitle(), power(), SummaryLine (+15 more)

### Community 20 - "Coolmate.me Feature & Structure Analysis"
Cohesion: 0.12
Nodes (16): Screen-reader-only accessible text investment, Announcement bar (Coolmate), Blog / content-marketing hub, Care & Share CSR program, Community Threads (UGC/community hub), Cookie consent banner + preference center, CXP by Coolmate (custom-print sub-brand), Footer (contact, link columns, address, certifications) (+8 more)

### Community 21 - "auth.ts"
Cohesion: 0.07
Nodes (36): MockUser, users, Auth, findByIdentifier(), mockAuth, OtpRecord, otps, pendingSignups (+28 more)

### Community 22 - "article-page.test.tsx"
Cohesion: 0.18
Nodes (15): matchCount(), renderArticle(), ArticlePage(), readingThemeSchema, countReadingTheme(), READING_THEME_ENTRIES, readingThemeDestination, readingThemeEntry (+7 more)

### Community 23 - "discovery/mock.ts"
Cohesion: 0.19
Nodes (11): quiz, QUIZ_MATCHES, Discovery, DiscoveryError, mockDiscovery, toComparisonRow(), QuizDefinition, EYE_ENLARGEMENT_BANDS (+3 more)

### Community 24 - "Two-tier component architecture (ui/ vs commerce/)"
Cohesion: 0.13
Nodes (17): Task 15: Collection listing page + filters, Task 16: PDP components (Gallery, VariantSelector, SpecTable, ReviewsList), Task 17: PDP page + Add-to-cart, Task 18: Cart page + line item + order summary, CartLineItem component, CategoryGrid component, CollectionCarousel component, Two-tier component architecture (ui/ vs commerce/) (+9 more)

### Community 25 - "Product Detail Page (PDP) structure"
Cohesion: 0.40
Nodes (5): Color variants as distinct URLs (?color=slug) for SEO/deep-linking, CoolClub loyalty program + CoolCash currency, Fabric-technology brand system (cross-cutting taxonomy: CoolDry, CoolSoft, CoolRib, CoolFlex, ZeroMark), Fit-feedback histogram (Tight/True-to-size/Loose) in reviews, Product Detail Page (PDP) structure

### Community 26 - "collection/[slug]/page.tsx"
Cohesion: 0.15
Nodes (24): ADR-0018, CollectionPage(), resolveTitle(), ADR-0002, parseTopic(), SupportFaqPage(), ADR-0019, CollectionImageView() (+16 more)

### Community 27 - "cn"
Cohesion: 0.11
Nodes (24): CopyButton(), OrderSummary(), ADR-0012, QuantityStepper(), RatingStars(), HomeSection(), ADR-0013, AspectRatio() (+16 more)

### Community 28 - "editorial.ts"
Cohesion: 0.14
Nodes (15): MakeupLookCard, MakeupLooks(), cards, makeupLooks, articleQuerySchema, articleSchema, ArticleSort, articleSortSchema (+7 more)

### Community 29 - "addresses-manager.tsx"
Cohesion: 0.06
Nodes (22): AddressDict, AddressesManager(), AddressForm(), EMPTY_FORM, FormState, NON_DEFAULT, toFormState(), addresses (+14 more)

### Community 30 - "Vivimoon Storefront Baseline Design Spec"
Cohesion: 0.17
Nodes (15): Gender filter toggle (in-place homepage filtering), Hero banner carousel (7 slides), Homepage structure (hero carousel, promo tiles, category grid), Product card component (hover-swap, swatches, badges, price), Themed collection sections with product carousels, Task 19: Checkout + success (stubbed payment), Task 20: Final verification (responsive, a11y, build, tests), Build sequence (13 high-level steps) (+7 more)

### Community 31 - "cart-store.ts"
Cohesion: 0.12
Nodes (27): renderCheckoutPage(), makeLine(), renderSuccessPage(), seedLastOrder(), SuccessView(), cartCount(), cartReducer(), readPersistedLine() (+19 more)

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
Nodes (36): POST(), jar, params(), post(), actionRequestSchema, GET(), ADR-0022, GET() (+28 more)

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
Nodes (24): quizScope(), quizAnswerSchema, quizDefinitionSchema, QuizOption, quizOptionSchema, QuizQuestion, quizQuestionSchema, QuizSubmitRequest (+16 more)

### Community 42 - "reviews-list.tsx"
Cohesion: 0.12
Nodes (19): ReviewSourceBadge(), fill(), ReviewCard(), ReviewsList(), ReviewsSummary(), SUB_RATINGS, TAGS, base (+11 more)

### Community 46 - "source-files.ts"
Cohesion: 0.20
Nodes (9): ADR-0016, nextConfig, ADR-0014, isTest(), isVendored(), SKIP, sourceFiles(), withoutComments() (+1 more)

### Community 61 - "M1 Foundation — progress ledger"
Cohesion: 0.22
Nodes (8): M1 Foundation — progress ledger, M2 Task 11 — Guest → member cart merge (2026-09-02), M2 Task 12 — Buy Now (2026-09-02), M2 Task 13 — M2 verification (2026-09-02), M2 Task 5 — RxSelector and Rx-aware add-to-cart (2026-08-31), M2 Task 6 — Server-owned pricing and auto-voucher (2026-08-31), M2 Task 7 — Cart page renders server prices (2026-08-31), M4 Task 9 — M4 verification (2026-09-05)

### Community 62 - "Issue tracker: GitHub"
Cohesion: 0.29
Nodes (6): Conventions, Issue tracker: GitHub, Pull requests as a triage surface, Wayfinding operations, When a skill says "fetch the relevant ticket", When a skill says "publish to the issue tracker"

### Community 63 - "session-store.ts"
Cohesion: 0.17
Nodes (8): mockedApiRequest, UsePricedCartResult, SessionStatus, SessionStore, SessionUser, user, PricedCart, DefaultRx

### Community 64 - "Domain Docs"
Cohesion: 0.33
Nodes (5): Before exploring, read these, Domain Docs, File structure, Flag ADR conflicts, Use the glossary's vocabulary

### Community 65 - "orders/route.ts"
Cohesion: 0.08
Nodes (14): GET(), jar, ADDRESS, jar, LINES, RX, ADDRESS, jar (+6 more)

### Community 66 - "order-detail-view.tsx"
Cohesion: 0.07
Nodes (29): lookUpOrder(), metadata, mockedFetchViaSelf, order, renderPage(), session, TrackOrderPage(), ADR-0002 (+21 more)

### Community 69 - "apiFail"
Cohesion: 0.10
Nodes (37): addressErrorResponse(), DELETE(), PATCH(), GET(), POST(), DELETE(), GET(), POST() (+29 more)

### Community 70 - "plp-card.ts"
Cohesion: 0.21
Nodes (12): LensGalleryContexts, QuizAnswer, activeFilterGroups(), CARD_VIEWS, CardView, FILTER_GROUPS, lineLabel(), mm() (+4 more)

### Community 71 - "qr-transfer-view.tsx"
Cohesion: 0.11
Nodes (20): metadata, ADR-0002, ADR-0022, mmss(), QrLine, QrTransferView(), dict, LINES (+12 more)

### Community 72 - "dictionaries.ts"
Cohesion: 0.08
Nodes (48): AboutPage(), AddressesPage(), fetchAddresses(), FavoritesPage(), fetchFavorites(), AccountLayout(), fetchData(), ADR-0002 (+40 more)

### Community 73 - "schemas/support.ts"
Cohesion: 0.08
Nodes (25): post(), renderFaq(), guides, ADR-0019, faqEntries, ADR-0019, ADR-0019, guideFeedback (+17 more)

### Community 74 - "bundle-offer.tsx"
Cohesion: 0.08
Nodes (31): CartView(), moveToFavorites(), BundleOffer(), bundleAccessories, dict, mockedApiRequest, singleLens, ADR-0003 (+23 more)

### Community 75 - "Process"
Cohesion: 0.15
Nodes (12): 1. Gather context, 2. Explore the codebase (optional), 3. Draft vertical slices, 4. Quiz the user, 5. Publish the tickets to the configured tracker, Acceptance criteria, Blocked by, <NN> — <Ticket title> (+4 more)

### Community 76 - "Vivimoon M1 — Foundation Implementation Plan"
Cohesion: 0.11
Nodes (18): File Structure, Global Constraints, M1 Definition of Done, Task 10: Browser API client, session sync, and the sign-in / sign-up pages, Task 11: Forgot-password OTP flow, Task 12: Account resource and route handlers, Task 13: Account page, route guards, and M1 verification, Task 1: API config and response envelope (+10 more)

### Community 78 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, build, dev, lint, start, test, test:contract, test:contract:upstream (+2 more)

### Community 79 - "en.ts"
Cohesion: 0.05
Nodes (27): definition, mockedApiRequest, push, ComfortHighlight(), ComparisonDialog(), matrix, ContentCarousel(), items (+19 more)

### Community 80 - "editorial/mock.ts"
Cohesion: 0.23
Nodes (12): Editorial, mockEditorial, searchable(), ArticleQuery, FaqQuery, filterFaqEntries(), searchable(), ADR-0020 (+4 more)

### Community 81 - "Product"
Cohesion: 0.18
Nodes (10): CarouselNav(), CollectionCarousel(), ProductCard(), product, Gtag, product, AnalyticsEvent, Ga4Item (+2 more)

### Community 82 - "cart/page.test.tsx"
Cohesion: 0.27
Nodes (9): lens(), makeLine(), mockedApiRequest, push, realPricing(), renderCartPage(), renderWithStaleLine(), track (+1 more)

### Community 83 - "Vivimoon M4 — Discovery Implementation Plan"
Cohesion: 0.13
Nodes (15): File Structure, Global Constraints, M4 Definition of Done, Scope note: the §6/§10 eyeEnlargement conflict, Task 1: Mirrored reviews — source badge, Task 2: Comparison — eye-enlargement banding, schemas, discovery resource, Task 3: Comparison — store, toggle, persistent tray, Task 4: Comparison — matrix Dialog (+7 more)

### Community 84 - "cart-view.tsx"
Cohesion: 0.22
Nodes (11): ADR-0003, ADR-0012, CartLineItem(), Empty(), EmptyContent(), EmptyDescription(), EmptyHeader(), EmptyMedia() (+3 more)

### Community 89 - "common.ts"
Cohesion: 0.07
Nodes (26): ADDRESS, BASELINE_LINES, jar, RX, ADR-0012, ADR-0025, POST(), GET() (+18 more)

### Community 90 - "cn.ts"
Cohesion: 0.12
Nodes (15): ArticleCard, BrandStory(), BrandStoryImage, CategoryGrid(), COLUMN_CLASSES, ContentCard, CarouselLabels, HeroCarousel() (+7 more)

### Community 92 - "success-view.tsx"
Cohesion: 0.27
Nodes (8): confirmationLine(), LastOrder, PointsBlock(), ADR-0021, ADR-0022, ADR-0024, maskEmail(), maskPhone()

### Community 93 - "support/page.tsx"
Cohesion: 0.17
Nodes (14): FaqAccordion(), FaqAnswer, entries, PolicyId, TOPIC_ICONS, BeginnerFaq(), ProductReassurance(), RETURNS_FAQ (+6 more)

### Community 94 - "hub.test.tsx"
Cohesion: 0.33
Nodes (6): featured, renderHub(), ADR-0020, SupportPage(), renderHub(), FEATURED_LIMIT

### Community 96 - "to-spec/SKILL.md"
Cohesion: 0.22
Nodes (8): Further Notes, Implementation Decisions, Out of Scope, Problem Statement, Process, Solution, Testing Decisions, User Stories

### Community 100 - "guide.test.tsx"
Cohesion: 0.11
Nodes (20): renderGuide(), ADR-0022, NavItem, guideSchema, topicSchema, defaultLocale, locales, CHANNELS (+12 more)

### Community 101 - "5. Migration Strategy"
Cohesion: 0.33
Nodes (6): 5. Migration Strategy, Adapting drift, Conformance suite, Cutover order, Per-resource cutover, Runtime validation

### Community 104 - "collection-filters.tsx"
Cohesion: 0.09
Nodes (36): ActiveFilters(), CheckRow(), Chip(), ClearRxFilter(), CollectionFilters(), CollectionFiltersSheet(), CollectionLoadMore(), CollectionSort() (+28 more)

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
Nodes (23): FacetBrowser(), Swatches(), valueLabel(), MegaNav(), pathname, MobileNav(), getNavItems(), replacementScheduleSchema (+15 more)

### Community 114 - "checkout-guest-member.test.tsx"
Cohesion: 0.17
Nodes (9): api(), HOME, json(), NEW, OFFICE, ORDER, PRICED, push (+1 more)

### Community 115 - "mega-nav.tsx"
Cohesion: 0.29
Nodes (10): ITEM_CLASS, NavigationMenu(), NavigationMenuContent(), NavigationMenuIndicator(), NavigationMenuItem(), NavigationMenuLink(), NavigationMenuList(), NavigationMenuPositioner() (+2 more)

### Community 116 - "formatPrice"
Cohesion: 0.13
Nodes (23): discountLabel(), fetchVouchers(), formatDate(), VouchersPage(), OrderInfo(), approvedReviews(), ProductPage(), renderProduct() (+15 more)

### Community 117 - "sign-up.test.tsx"
Cohesion: 0.20
Nodes (5): SignUpForm(), authenticate(), done(), push, user

### Community 118 - "Vivimoon.vn — Live Site Data-Model Audit"
Cohesion: 0.40
Nodes (4): 1. Site structure, 2. Product detail page — data fields observed, 3. Open question — not acted on, Vivimoon.vn — Live Site Data-Model Audit

### Community 119 - "review-form.tsx"
Cohesion: 0.12
Nodes (21): fill(), ReviewFormDict, StarInput(), SUB_RATINGS, SubRatingKey, TAGS, ACCEPT, fill() (+13 more)

### Community 120 - "list-id.ts"
Cohesion: 0.36
Nodes (6): collectionListId(), MEMBERSHIP_FILTERS, normalizeColors(), COLLECTION_COLORS, idFor(), ProductQuery

### Community 121 - "price/route.test.ts"
Cohesion: 0.33
Nodes (4): BASELINE_LINES, RX, ADR-0012, pricedCartSchema

### Community 122 - "account-shell.tsx"
Cohesion: 0.40
Nodes (3): AccountShell(), AccountShellDict, dict

### Community 123 - "quote/route.ts"
Cohesion: 0.24
Nodes (6): POST(), ADDRESS, LINES, shipping, ShippingError, shippingQuoteResponseSchema

### Community 124 - "loyalty/mock.ts"
Cohesion: 0.14
Nodes (14): loyaltyHistory, earnedBy(), entry(), held, Loyalty, mockLoyalty, randomEntryId(), store (+6 more)

### Community 125 - "schemas/orders.ts"
Cohesion: 0.13
Nodes (14): giftLineSchema, priceCartRequestSchema, currencySchema, lineReviewSchema, NotificationChannel, OrderLine, orderLineSchema, paymentActionSchema (+6 more)

### Community 126 - "lens-viewer.tsx"
Cohesion: 0.29
Nodes (6): LensViewer(), Slide, Tab, TABS, ViewerVideo, MakeupTone

### Community 129 - "Locale"
Cohesion: 0.11
Nodes (31): GENDERS, Card, OrderActions(), fill(), HistoryLine, OrderHistoryCard(), ADR-0012, ADR-0022 (+23 more)

### Community 130 - "variant-selector.tsx"
Cohesion: 0.26
Nodes (8): resolveVariant(), coloredProduct, colorlessProduct, dict, VariantSelector(), selectColor(), Variant, distinctColorVariants()

### Community 131 - "pricing/mock.test.ts"
Cohesion: 0.20
Nodes (7): mockPricing, BASELINE_LINES, SINGLE, ADR-0012, ADR-0023, UNDER_FREESHIP_LINES, PriceCartRequest

### Community 132 - "media/route.test.ts"
Cohesion: 0.15
Nodes (4): jar, send(), sendRaw(), Upload

### Community 136 - "compare-store.ts"
Cohesion: 0.11
Nodes (14): geistMono, geistSans, metadata, CompareToggle(), mockedApiRequest, CartHydrator(), CompareHydrator(), COMPARE_CAP (+6 more)

### Community 137 - "package.json"
Cohesion: 0.50
Nodes (3): name, private, version

### Community 140 - "rx.ts"
Cohesion: 0.09
Nodes (27): AXIS_STEPS, defaultSphSchema, LensType, lineRxSchema, purchaseUnitSchema, Rx, RX_LENS_TYPE, RxEye (+19 more)

### Community 141 - "checkout.ts"
Cohesion: 0.13
Nodes (14): isPhone(), Address, addressLabelSchema, addressSchema, shippingOptionSchema, ShippingQuoteRequest, shippingQuoteRequestSchema, notificationChannelSchema (+6 more)

### Community 142 - "quiz-flow.tsx"
Cohesion: 0.44
Nodes (7): QuizFlow(), goNext(), quizResultsHref(), savedQuizAnswers(), saveQuizAnswers(), FACET_COLLECTION, answersFromOptionIds()

### Community 143 - "client.ts"
Cohesion: 0.23
Nodes (9): FavoriteButton(), toggle(), HelpfulButton(), Vote, remove(), useSessionStore, SessionSync(), apiRequest() (+1 more)

### Community 149 - "checkout-view.tsx"
Cohesion: 0.09
Nodes (17): ORDER_RESPONSE, renderCheckoutPage(), fetchRoutingTo(), json(), PRICED_RESPONSE, renderCheckoutPage(), ADDRESS_FIELDS, CheckoutView() (+9 more)

### Community 152 - "catalog/mock.ts"
Cohesion: 0.09
Nodes (21): applies(), Catalog, FacetCounts, FacetDef, FacetKey, HelpfulVoteResult, helpfulVotes, inPriceRange() (+13 more)

### Community 153 - "favorites-grid.tsx"
Cohesion: 0.11
Nodes (15): FavoritesGrid(), addToCart(), remove(), add, push, MiniCart(), dict, mockedApiRequest (+7 more)

### Community 155 - "cart-line-item.tsx"
Cohesion: 0.13
Nodes (22): chipPower(), LensChips(), ADR-0012, STEPS, SelectContent(), SelectGroup(), SelectItem(), SelectLabel() (+14 more)

### Community 156 - "vouchers/mock.ts"
Cohesion: 0.31
Nodes (5): vouchers, vouchers, mockVouchers, Vouchers, Voucher

### Community 157 - "articles/page.tsx"
Cohesion: 0.13
Nodes (18): renderIndex(), ArticlesPage(), readSort(), readTheme(), GuidePage(), ArticleCards(), ReadingThemeChip, ReadingThemeChips() (+10 more)

### Community 160 - "pricing/mock.ts"
Cohesion: 0.15
Nodes (16): bestVoucher(), chosenVoucher(), Pricing, ADR-0012, ADR-0023, validVouchers(), voucherApplies(), voucherDiscount() (+8 more)

### Community 162 - "spend-tiers.ts"
Cohesion: 0.33
Nodes (5): SPEND_TIERS, spendTiersFor(), TIER_GIFT_VARIANT_ID, NextSpendTier, SpendTier

### Community 164 - "review-form.test.tsx"
Cohesion: 0.15
Nodes (5): handleSubmit(), body(), dict, FakeXHR, fillValid()

### Community 165 - "api/config.ts"
Cohesion: 0.09
Nodes (18): POST(), BASELINE_LINES, jar, SINGLE, ADR-0023, POST(), ApiMode, DEPENDS_ON (+10 more)

### Community 166 - "spec-table.tsx"
Cohesion: 0.38
Nodes (5): SpecTable(), baseSpecs, dict, ADR-0011, ProductSpecs

### Community 167 - "occasions.ts"
Cohesion: 0.50
Nodes (3): OccasionContent, Text, Occasion

### Community 168 - "write-review-button.test.tsx"
Cohesion: 0.15
Nodes (5): fetchMock, LINE, OTHER, push, WriteReviewButton()

### Community 173 - "OtpStage"
Cohesion: 0.67
Nodes (3): OtpStage(), fill(), resend()

### Community 176 - "Task 12: Carousels & CategoryGrid"
Cohesion: 0.29
Nodes (7): Multi-language/locale switcher (topbar), Utility topbar (Coolmate), Task 12: Carousels & CategoryGrid, Task 13: Layout chrome (AnnouncementBar, Header, MegaNav, LocaleSwitcher, Footer), Task 14: Home page, HeroCarousel component, LocaleSwitcher component

### Community 180 - "success-view.test.tsx"
Cohesion: 0.22
Nodes (3): FirstWearRead, dict, READS

### Community 182 - "helpful/route.test.ts"
Cohesion: 0.39
Nodes (5): ctx(), jar, req(), unvote(), vote()

### Community 183 - "ForgotPasswordForm"
Cohesion: 0.36
Nodes (6): ForgotPasswordForm(), reportServer(), requestCode(), submitPassword(), verifyCode(), push

### Community 193 - "[locale]/page.tsx"
Cohesion: 0.12
Nodes (24): BRAND_STORY_IMAGES, HomePage(), TV_THUMBS, GLYPHS, TrustBadge, TrustBadges(), mockCatalog, parseProductQueryLoose() (+16 more)

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
- **800 isolated node(s):** `npx`, `Stage`, `push`, `push`, `Dict` (+795 more)
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