# Graph Report - vivimoon-web-app  (2026-11-16)

## Corpus Check
- 551 files · ~314,101 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2673 nodes · 7241 edges · 184 communities (130 shown, 54 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 48 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `66d546e6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [locale]/layout.tsx
- fetchViaSelf
- checkout-view.tsx
- parseBody
- useSessionStore
- payment-method-picker.tsx
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
- discovery.ts
- Two-tier component architecture (ui/ vs commerce/)
- Product Detail Page (PDP) structure
- collection/[slug]/page.tsx
- cn
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
- support/mock.ts
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
- AddressesManager
- Domain Docs
- apiFail
- order-detail-view.tsx
- triage-labels.md
- Vivimoon
- apiOk
- track/page.tsx
- qr-transfer-view.tsx
- dictionaries.ts
- schemas/support.ts
- lineKey
- Process
- Vivimoon M1 — Foundation Implementation Plan
- [id]/reviews/route.ts
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
- fetch.ts
- [locale]/page.tsx
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
- payments.ts
- shipping-block.tsx
- sign-up.test.tsx
- Vivimoon.vn — Live Site Data-Model Audit
- review-media-field.tsx
- orders/route.test.ts
- common.ts
- account/layout.tsx
- review-form.tsx
- loyalty/mock.ts
- schemas/orders.ts
- lens-viewer.tsx
- 0010-product-line-excludes-correction-complexity.md
- 0011-eye-enlargement-derives-from-graphic-diameter.md
- Locale
- variant-selector.tsx
- orders-loyalty-award.test.ts
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
- CheckoutView
- @types/react
- 0014-image-optimization-is-on.md
- catalog/mock.ts
- bundle-offer.tsx
- zustand
- orders-preferred-payment.test.ts
- payments/mock.ts
- articles/page.tsx
- Order lookup is by order code alone, shown inline
- A phone sign-up is not an account until its OTP is verified
- cart.ts
- vitest
- checkout-price-preview.test.tsx
- review-form.test.tsx
- api/config.ts
- types/index.ts
- cancel/route.test.ts
- write-review-button.test.tsx
- SupportFaqPage
- @vitejs/plugin-react
- product-videos.tsx
- OtpStage
- Guest orders join the account that verifies their phone
- track-routes.test.ts
- AddressForm
- @types/node
- lucide-react
- prettier
- helpful/route.test.ts
- ForgotPasswordForm
- helpful-button.test.tsx
- lens-facets.test.ts

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

## Communities (184 total, 54 thin omitted)

### Community 0 - "[locale]/layout.tsx"
Cohesion: 0.33
Nodes (4): LocaleLayout(), AnnouncementBar(), isCheckoutFlow(), SiteChrome()

### Community 1 - "fetchViaSelf"
Cohesion: 0.18
Nodes (15): AddressesPage(), fetchAddresses(), fetchOrder(), OrderDetailPage(), WriteReviewPage(), fetchOrders(), OrderHistoryPage(), AccountPage() (+7 more)

### Community 2 - "checkout-view.tsx"
Cohesion: 0.13
Nodes (28): AddressDict, EMPTY_FORM, FormState, Stage, Dict, ADR-0021, SocialAuth(), ADDRESS_FIELDS (+20 more)

### Community 3 - "parseBody"
Cohesion: 0.19
Nodes (19): POST(), jar, Order, POST(), POST(), POST(), POST(), ADR-0021 (+11 more)

### Community 4 - "useSessionStore"
Cohesion: 0.07
Nodes (27): AccountInfo(), patch(), saveAccount(), savePersonal(), fmtDob(), fmtRx(), GENDERS, push (+19 more)

### Community 5 - "payment-method-picker.tsx"
Cohesion: 0.31
Nodes (8): ICONS, PaymentMethodPicker(), dict, ADR-0025, PaymentMethodType, PaymentMethodOption, paymentMethods, ADR-0025

### Community 6 - "add-to-cart.tsx"
Cohesion: 0.17
Nodes (13): AddToCart(), ADR-0023, defaultRxDraft, draftFromDefaultRx(), draftToRx(), POWER_GUIDE_SLUG, PowerField(), RxDraft (+5 more)

### Community 7 - "dependencies"
Cohesion: 0.07
Nodes (27): @base-ui/react, class-variance-authority, clsx, embla-carousel-react, @hookform/resolvers, next, @next/third-parties, dependencies (+19 more)

### Community 8 - "Vivimoon M2 — Purchase Core Implementation Plan"
Cohesion: 0.11
Nodes (19): File Structure, Global Constraints, M2 Definition of Done, Scope note: why `cyl`/`axis` exist in the schema but not the UI, Task 10: Order placement, Task 11: Guest → member cart merge, Task 12: Buy Now, Task 13: M2 verification (+11 more)

### Community 9 - "cookie.ts"
Cohesion: 0.07
Nodes (20): jar, BASELINE_LINES, jar, SINGLE, ADR-0023, jar, jar, fail() (+12 more)

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
Nodes (51): req(), OccasionHeader(), OccasionContent, Text, accessoryOptionSchema, Collection, COLLECTION_PAGE_SIZE, collectionSchema (+43 more)

### Community 15 - "buttonVariants"
Cohesion: 0.20
Nodes (11): PointsBlock(), LocaleError(), LocaleNotFound(), RootNotFound(), LeadArticle(), QuickAdd(), BoundaryStrings, BoundaryStringsContext (+3 more)

### Community 16 - "Product domain type"
Cohesion: 0.11
Nodes (20): Planned file structure (app/, lib/, content/, features/cart/, components/, tests/), Global constraints (Node 20+, TS strict, no hardcoded strings, no raw gtag, no data-fetching in ui/commerce components), Vivimoon Storefront Baseline Implementation Plan, Task 1: Scaffold project & tooling, Task 2: Testing setup (Vitest + RTL), Task 3: Utilities (cn, formatPrice), Task 4: Domain types, Task 5: Mock content (+12 more)

### Community 17 - "mock/index.ts"
Cohesion: 0.08
Nodes (24): collections, favorites, galleries, HOME_ADDRESS, OFFICE_ADDRESS, orders, ADR-0026, products (+16 more)

### Community 18 - "i18n seam (locale-prefixed routes, getDictionary)"
Cohesion: 0.11
Nodes (19): Multi-language/locale switcher (topbar), Utility topbar (Coolmate), Task 7: i18n seam (config, dictionaries, middleware), Task 8: Analytics seam (GA4), Analytics seam (GA4 via typed track() wrapper), GA4 ecommerce events (view_item_list, select_item, view_item, add_to_cart, remove_from_cart, view_cart, begin_checkout, purchase), getDictionary(locale) function, @next/third-parties GoogleAnalytics component (+11 more)

### Community 19 - "mini-cart.tsx"
Cohesion: 0.12
Nodes (21): QrTransferPage(), makeLine(), renderSuccessPage(), seedLastOrder(), Card, CartUpsell(), lineTitle(), describe() (+13 more)

### Community 20 - "Coolmate.me Feature & Structure Analysis"
Cohesion: 0.12
Nodes (16): Screen-reader-only accessible text investment, Announcement bar (Coolmate), Blog / content-marketing hub, Care & Share CSR program, Community Threads (UGC/community hub), Cookie consent banner + preference center, CXP by Coolmate (custom-print sub-brand), Footer (contact, link columns, address, certifications) (+8 more)

### Community 21 - "auth.ts"
Cohesion: 0.06
Nodes (35): Auth, AuthError, findByIdentifier(), mockAuth, OtpRecord, otps, pendingSignups, resetMockAuthState() (+27 more)

### Community 22 - "article-page.test.tsx"
Cohesion: 0.28
Nodes (11): matchCount(), renderArticle(), ArticlePage(), countReadingTheme(), READING_THEME_ENTRIES, readingThemeDestination, readingThemeEntry, readingThemeHref() (+3 more)

### Community 23 - "discovery.ts"
Cohesion: 0.10
Nodes (23): quiz, QUIZ_MATCHES, DiscoveryError, mockDiscovery, toComparisonRow(), QuizAnswer, quizAnswerSchema, QuizDefinition (+15 more)

### Community 24 - "Two-tier component architecture (ui/ vs commerce/)"
Cohesion: 0.15
Nodes (14): Task 12: Carousels & CategoryGrid, Task 13: Layout chrome (AnnouncementBar, Header, MegaNav, LocaleSwitcher, Footer), Task 14: Home page, Task 15: Collection listing page + filters, CartLineItem component, CategoryGrid component, CollectionCarousel component, Two-tier component architecture (ui/ vs commerce/) (+6 more)

### Community 25 - "Product Detail Page (PDP) structure"
Cohesion: 0.15
Nodes (13): Color variants as distinct URLs (?color=slug) for SEO/deep-linking, CoolClub loyalty program + CoolCash currency, Fabric-technology brand system (cross-cutting taxonomy: CoolDry, CoolSoft, CoolRib, CoolFlex, ZeroMark), Fit-feedback histogram (Tight/True-to-size/Loose) in reviews, Product Detail Page (PDP) structure, Task 16: PDP components (Gallery, VariantSelector, SpecTable, ReviewsList), Task 17: PDP page + Add-to-cart, Task 18: Cart page + line item + order summary (+5 more)

### Community 26 - "collection/[slug]/page.tsx"
Cohesion: 0.20
Nodes (18): ADR-0018, PAGE_IDENTITY, ADR-0002, ADR-0019, ProductGrid(), ReviewsSummary(), PageContainer(), ADR-0013 (+10 more)

### Community 27 - "cn"
Cohesion: 0.09
Nodes (30): CopyButton(), HelpfulButton(), Vote, QuantityStepper(), RatingStars(), ReviewSourceBadge(), fill(), ReviewCard() (+22 more)

### Community 28 - "editorial.ts"
Cohesion: 0.14
Nodes (15): MakeupLookCard, MakeupLooks(), cards, makeupLooks, articleQuerySchema, articleSchema, ArticleSort, articleSortSchema (+7 more)

### Community 29 - "account/mock.ts"
Cohesion: 0.09
Nodes (8): ADDRESS, jar, jar, addresses, AddressError, addressStore, favoriteStore, AddressPatch

### Community 30 - "Vivimoon Storefront Baseline Design Spec"
Cohesion: 0.24
Nodes (11): Gender filter toggle (in-place homepage filtering), Hero banner carousel (7 slides), Homepage structure (hero carousel, promo tiles, category grid), Product card component (hover-swap, swatches, badges, price), Themed collection sections with product carousels, Build sequence (13 high-level steps), Baseline goals (demoable bilingual storefront, clean seams, prop-driven components), Explicit non-goals (Rx upload, loyalty, real payment, real DB, auth, deferred with seams) (+3 more)

### Community 31 - "cart-store.ts"
Cohesion: 0.10
Nodes (28): renderCheckoutPage(), cartCount(), cartReducer(), readPersistedLine(), atA, atB, empty, makeLine() (+20 more)

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
Nodes (22): expireStaleQr(), joinIn(), mockOrders, Orders, REQ, randomId(), randomSuffix(), resetMockOrdersState() (+14 more)

### Community 38 - "Aqua Daily 2 (Placeholder Image)"
Cohesion: 0.50
Nodes (4): Aqua Daily 1 (placeholder image), Aqua Daily 2 (Placeholder Image), Blank Placeholder Graphic, Aqua Daily Product Line

### Community 39 - "Torica Biweekly Product Image (Blank Placeholder)"
Cohesion: 0.50
Nodes (4): Torica Biweekly Product Image (Blank Placeholder), Biweekly Variant/Frequency Concept, Empty/Unrendered Placeholder Asset, Torica Product Line

### Community 40 - "hazel-monthly-1.jpg (blank placeholder image)"
Cohesion: 0.67
Nodes (3): hazel-monthly-1.jpg (blank placeholder image), Hazel Monthly Product (inferred subscription/monthly product line), Placeholder / Blank Image Concept

### Community 41 - "support/mock.ts"
Cohesion: 0.17
Nodes (12): post(), guides, ADR-0019, ADR-0019, FEATURED_LIMIT, guideFeedback, mockSupport, readMockGuideFeedback() (+4 more)

### Community 42 - "reviews-list.test.tsx"
Cohesion: 0.16
Nodes (11): ReviewsList(), base, fetchMock, reviews, filterReviews(), reviewStats(), shortName(), SUB_RATINGS (+3 more)

### Community 46 - "source-files.ts"
Cohesion: 0.20
Nodes (9): ADR-0016, nextConfig, ADR-0014, isTest(), isVendored(), SKIP, sourceFiles(), withoutComments() (+1 more)

### Community 61 - "M1 Foundation — progress ledger"
Cohesion: 0.22
Nodes (8): M1 Foundation — progress ledger, M2 Task 11 — Guest → member cart merge (2026-09-02), M2 Task 12 — Buy Now (2026-09-02), M2 Task 13 — M2 verification (2026-09-02), M2 Task 5 — RxSelector and Rx-aware add-to-cart (2026-08-31), M2 Task 6 — Server-owned pricing and auto-voucher (2026-08-31), M2 Task 7 — Cart page renders server prices (2026-08-31), M4 Task 9 — M4 verification (2026-09-05)

### Community 62 - "Issue tracker: GitHub"
Cohesion: 0.29
Nodes (6): Conventions, Issue tracker: GitHub, Pull requests as a triage surface, Wayfinding operations, When a skill says "fetch the relevant ticket", When a skill says "publish to the issue tracker"

### Community 63 - "AddressesManager"
Cohesion: 0.14
Nodes (6): AddressesManager(), NON_DEFAULT, toFormState(), AddressCards(), RadioCard(), SavedAddress

### Community 64 - "Domain Docs"
Cohesion: 0.33
Nodes (5): Before exploring, read these, Domain Docs, File structure, Flag ADR conflicts, Use the glossary's vocabulary

### Community 65 - "apiFail"
Cohesion: 0.11
Nodes (31): addressErrorResponse(), DELETE(), PATCH(), GET(), POST(), DELETE(), GET(), POST() (+23 more)

### Community 66 - "order-detail-view.tsx"
Cohesion: 0.11
Nodes (17): formatDate(), OrderDetailView(), dict, push, refresh, renderView(), Tone, TONE_CLASS (+9 more)

### Community 69 - "apiOk"
Cohesion: 0.13
Nodes (19): DELETE(), POST(), GET(), POST(), GET(), GET(), get(), GET() (+11 more)

### Community 70 - "track/page.tsx"
Cohesion: 0.18
Nodes (11): lookUpOrder(), metadata, mockedFetchViaSelf, order, renderPage(), session, TrackOrderPage(), ADR-0002 (+3 more)

### Community 71 - "qr-transfer-view.tsx"
Cohesion: 0.13
Nodes (16): metadata, ADR-0002, ADR-0022, mmss(), QrLine, QrTransferView(), dict, LINES (+8 more)

### Community 72 - "dictionaries.ts"
Cohesion: 0.11
Nodes (23): AboutPage(), ForgotPasswordPage(), SignInPage(), push, SignUpPage(), CartPage(), CheckoutLayout(), CheckoutPage() (+15 more)

### Community 73 - "schemas/support.ts"
Cohesion: 0.12
Nodes (15): faqEntries, ADR-0019, FaqEntry, faqEntrySchema, guideFeedbackSchema, guideSchema, GuideStep, guideStepSchema (+7 more)

### Community 74 - "lineKey"
Cohesion: 0.12
Nodes (17): CartLineItem(), dict, line, lineWithRx, rx, sandkiss(), freshStore(), makeLine() (+9 more)

### Community 75 - "Process"
Cohesion: 0.15
Nodes (12): 1. Gather context, 2. Explore the codebase (optional), 3. Draft vertical slices, 4. Quiz the user, 5. Publish the tickets to the configured tracker, Acceptance criteria, Blocked by, <NN> — <Ticket title> (+4 more)

### Community 76 - "Vivimoon M1 — Foundation Implementation Plan"
Cohesion: 0.11
Nodes (18): File Structure, Global Constraints, M1 Definition of Done, Task 10: Browser API client, session sync, and the sign-in / sign-up pages, Task 11: Forgot-password OTP flow, Task 12: Account resource and route handlers, Task 13: Account page, route guards, and M1 verification, Task 1: API config and response envelope (+10 more)

### Community 77 - "[id]/reviews/route.ts"
Cohesion: 0.09
Nodes (20): POST(), POST(), jar, VALID, GET(), actionRequestSchema, GET(), POST() (+12 more)

### Community 78 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, build, dev, lint, start, test, test:contract, test:contract:upstream (+2 more)

### Community 79 - "en.ts"
Cohesion: 0.10
Nodes (16): definition, mockedApiRequest, push, ComfortHighlight(), items, product, steps, Header() (+8 more)

### Community 80 - "editorial/mock.ts"
Cohesion: 0.21
Nodes (13): Editorial, mockEditorial, searchable(), ArticleQuery, Topic, FaqQuery, filterFaqEntries(), searchable() (+5 more)

### Community 81 - "Product"
Cohesion: 0.13
Nodes (20): FavoritesGrid(), addToCart(), remove(), add, push, CarouselNav(), CollectionCarousel(), PriceTag() (+12 more)

### Community 82 - "cart/page.test.tsx"
Cohesion: 0.19
Nodes (12): CartView(), moveToFavorites(), lens(), makeLine(), mockedApiRequest, push, realPricing(), renderCartPage() (+4 more)

### Community 83 - "Vivimoon M4 — Discovery Implementation Plan"
Cohesion: 0.13
Nodes (15): File Structure, Global Constraints, M4 Definition of Done, Scope note: the §6/§10 eyeEnlargement conflict, Task 1: Mirrored reviews — source badge, Task 2: Comparison — eye-enlargement banding, schemas, discovery resource, Task 3: Comparison — store, toggle, persistent tray, Task 4: Comparison — matrix Dialog (+7 more)

### Community 84 - "cart-view.tsx"
Cohesion: 0.11
Nodes (33): FavoritesPage(), fetchFavorites(), fetchLoyalty(), formatDate(), LoyaltyPage(), discountLabel(), fetchVouchers(), formatDate() (+25 more)

### Community 89 - "fetch.ts"
Cohesion: 0.17
Nodes (11): RESOURCES, saved, upstreamBaseUrl(), upstreamTimeoutMs(), ApiError, Envelope, upstreamFetch(), UpstreamRequestError (+3 more)

### Community 90 - "[locale]/page.tsx"
Cohesion: 0.09
Nodes (24): BRAND_STORY_IMAGES, TV_THUMBS, ArticleCard, ArticleCards(), BrandStory(), BrandStoryImage, CategoryGrid(), COLUMN_CLASSES (+16 more)

### Community 92 - "success-view.tsx"
Cohesion: 0.09
Nodes (21): etaDaysOf(), FIRST_WEAR_ARTICLES, FIRST_WEAR_VIDEO, firstWearReads(), metadata, readOrder(), SuccessPage(), ADR-0002 (+13 more)

### Community 93 - "support/page.tsx"
Cohesion: 0.17
Nodes (14): FaqAccordion(), FaqAnswer, entries, PolicyId, TOPIC_ICONS, BeginnerFaq(), ProductReassurance(), RETURNS_FAQ (+6 more)

### Community 94 - "hub.test.tsx"
Cohesion: 0.14
Nodes (15): featured, renderHub(), ADR-0020, SupportPage(), renderHub(), ADR-0022, Footer(), Logo() (+7 more)

### Community 96 - "to-spec/SKILL.md"
Cohesion: 0.22
Nodes (8): Further Notes, Implementation Decisions, Out of Scope, Problem Statement, Process, Solution, Testing Decisions, User Stories

### Community 100 - "guide.test.tsx"
Cohesion: 0.36
Nodes (6): renderGuide(), GuidePage(), routeSegments(), pathSegments(), resolveRoute(), SEGMENT_ROOT

### Community 101 - "5. Migration Strategy"
Cohesion: 0.33
Nodes (6): 5. Migration Strategy, Adapting drift, Conformance suite, Cutover order, Per-resource cutover, Runtime validation

### Community 104 - "collection-filters.tsx"
Cohesion: 0.05
Nodes (60): CollectionPage(), resolveTitle(), dict, push, ActiveFilters(), CheckRow(), Chip(), ClearRxFilter() (+52 more)

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
Cohesion: 0.09
Nodes (35): FacetBrowser(), Swatches(), valueLabel(), LocaleLinks(), LocaleSwitcher(), ITEM_CLASS, MegaNav(), pathname (+27 more)

### Community 114 - "checkout-guest-member.test.tsx"
Cohesion: 0.17
Nodes (9): api(), HOME, json(), NEW, OFFICE, ORDER, PRICED, push (+1 more)

### Community 115 - "payments.ts"
Cohesion: 0.20
Nodes (8): IntentMethod, intentMethodSchema, paymentIntentRequestSchema, paymentIntentSchema, paymentMethodTypeSchema, paymentStatusSchema, BASE, ADR-0025

### Community 116 - "shipping-block.tsx"
Cohesion: 0.26
Nodes (8): OrderInfo(), ARRIVAL_FORMAT, arrivalDate(), ShippingBlock(), ShippingQuote, dict, StepHeading(), shippingMethodName()

### Community 117 - "sign-up.test.tsx"
Cohesion: 0.20
Nodes (5): SignUpForm(), authenticate(), done(), push, user

### Community 118 - "Vivimoon.vn — Live Site Data-Model Audit"
Cohesion: 0.40
Nodes (4): 1. Site structure, 2. Product detail page — data fields observed, 3. Open question — not acted on, Vivimoon.vn — Live Site Data-Model Audit

### Community 119 - "review-media-field.tsx"
Cohesion: 0.18
Nodes (14): ACCEPT, fill(), Kind, kindOf(), MediaDict, MediaState, ReviewMediaField(), add() (+6 more)

### Community 120 - "orders/route.test.ts"
Cohesion: 0.20
Nodes (6): ADDRESS, BASELINE_LINES, jar, RX, ADR-0012, ADR-0025

### Community 121 - "common.ts"
Cohesion: 0.14
Nodes (11): BASELINE_LINES, RX, ADR-0012, pricedCartSchema, comparisonMatrixSchema, apiErrorSchema, envelopeSchema(), ERROR_CODES (+3 more)

### Community 122 - "account/layout.tsx"
Cohesion: 0.27
Nodes (6): AccountShell(), AccountShellDict, dict, AccountLayout(), fetchData(), ADR-0002

### Community 123 - "review-form.tsx"
Cohesion: 0.24
Nodes (8): fill(), ReviewForm(), ReviewFormDict, StarInput(), SUB_RATINGS, SubRatingKey, TAGS, ReviewTag

### Community 124 - "loyalty/mock.ts"
Cohesion: 0.15
Nodes (13): loyaltyHistory, earnedBy(), entry(), held, Loyalty, randomEntryId(), store, ADR-0024 (+5 more)

### Community 125 - "schemas/orders.ts"
Cohesion: 0.15
Nodes (12): lineReviewSchema, NotificationChannel, OrderLine, orderLineSchema, PaymentAction, paymentActionSchema, paymentOrderSchema, placeOrderRequestSchema (+4 more)

### Community 126 - "lens-viewer.tsx"
Cohesion: 0.17
Nodes (9): LensViewer(), Slide, Tab, TABS, gallery, tones, videos, ViewerVideo (+1 more)

### Community 129 - "Locale"
Cohesion: 0.12
Nodes (22): ComparisonDialog(), matrix, OrderActions(), fill(), HistoryLine, OrderHistoryCard(), ADR-0012, QuickAddBody() (+14 more)

### Community 130 - "variant-selector.tsx"
Cohesion: 0.26
Nodes (8): resolveVariant(), coloredProduct, colorlessProduct, dict, VariantSelector(), selectColor(), Variant, distinctColorVariants()

### Community 131 - "orders-loyalty-award.test.ts"
Cohesion: 0.25
Nodes (4): ADDRESS, jar, LINES, RX

### Community 132 - "media/route.test.ts"
Cohesion: 0.15
Nodes (4): jar, send(), sendRaw(), Upload

### Community 136 - "compare-store.ts"
Cohesion: 0.13
Nodes (13): geistMono, geistSans, metadata, CompareToggle(), CartHydrator(), CompareHydrator(), COMPARE_CAP, COMPARE_STORAGE (+5 more)

### Community 137 - "package.json"
Cohesion: 0.50
Nodes (3): name, private, version

### Community 140 - "rx.ts"
Cohesion: 0.06
Nodes (50): chipPower(), LensChips(), ADR-0012, PowerSelect(), formatLineSummary(), formatPower(), formatPowers(), LineSummary() (+42 more)

### Community 141 - "checkout.ts"
Cohesion: 0.08
Nodes (24): ADDRESS, LINES, defaultShippingOptions, shippingRates, shipping, mockShipping, Shipping, ShippingError (+16 more)

### Community 142 - "quiz-flow.tsx"
Cohesion: 0.42
Nodes (8): QuizFlow(), goNext(), noSubscribe(), QuizCard(), quizResultsHref(), savedQuizAnswers(), saveQuizAnswers(), answersFromOptionIds()

### Community 143 - "client.ts"
Cohesion: 0.09
Nodes (17): ComparisonTray(), mockedApiRequest, FavoriteButton(), toggle(), GuideFeedback(), mockedApiRequest, NewsletterSignup(), mockedApiRequest (+9 more)

### Community 149 - "CheckoutView"
Cohesion: 0.11
Nodes (11): ORDER_RESPONSE, renderCheckoutPage(), CheckoutView(), signOut(), placedOrderPath(), mockedApiRequest, toPriceLines(), usePricedCart() (+3 more)

### Community 152 - "catalog/mock.ts"
Cohesion: 0.06
Nodes (37): applies(), Catalog, FacetCounts, FacetDef, FacetKey, HelpfulVoteResult, helpfulVotes, inPriceRange() (+29 more)

### Community 153 - "bundle-offer.tsx"
Cohesion: 0.11
Nodes (14): BundleOffer(), bundleAccessories, dict, mockedApiRequest, singleLens, ADR-0003, MiniCart(), dict (+6 more)

### Community 155 - "orders-preferred-payment.test.ts"
Cohesion: 0.25
Nodes (4): ADDRESS, jar, LINES, RX

### Community 156 - "payments/mock.ts"
Cohesion: 0.29
Nodes (5): mockPayments, Payments, ADR-0025, PaymentIntent, PaymentIntentRequest

### Community 157 - "articles/page.tsx"
Cohesion: 0.13
Nodes (17): renderIndex(), ArticlesPage(), readSort(), readTheme(), ReadingThemeChip, ReadingThemeChips(), chips, articles (+9 more)

### Community 160 - "cart.ts"
Cohesion: 0.04
Nodes (54): ICONS, short(), SpendTierProgress(), ADR-0003, mockLoyalty, pricing, bestVoucher(), chosenVoucher() (+46 more)

### Community 162 - "checkout-price-preview.test.tsx"
Cohesion: 0.40
Nodes (4): fetchRoutingTo(), json(), PRICED_RESPONSE, renderCheckoutPage()

### Community 164 - "review-form.test.tsx"
Cohesion: 0.15
Nodes (5): handleSubmit(), body(), dict, FakeXHR, fillValid()

### Community 165 - "api/config.ts"
Cohesion: 0.22
Nodes (9): POST(), ApiMode, DEPENDS_ON, rawMode(), readMode(), resolveMode(), ResourceName, payments (+1 more)

### Community 166 - "types/index.ts"
Cohesion: 0.12
Nodes (14): approvedReviews(), ProductPage(), mockedFetchViaSelf, renderProduct(), ADR-0002, SpecTable(), baseSpecs, dict (+6 more)

### Community 167 - "cancel/route.test.ts"
Cohesion: 0.50
Nodes (3): jar, params(), post()

### Community 168 - "write-review-button.test.tsx"
Cohesion: 0.18
Nodes (4): fetchMock, LINE, OTHER, push

### Community 169 - "SupportFaqPage"
Cohesion: 0.50
Nodes (3): renderFaq(), parseTopic(), SupportFaqPage()

### Community 171 - "product-videos.tsx"
Cohesion: 0.50
Nodes (3): ProductVideoCard, ProductVideos(), videos

### Community 173 - "OtpStage"
Cohesion: 0.67
Nodes (3): OtpStage(), fill(), resend()

### Community 182 - "helpful/route.test.ts"
Cohesion: 0.39
Nodes (5): ctx(), jar, req(), unvote(), vote()

### Community 183 - "ForgotPasswordForm"
Cohesion: 0.36
Nodes (6): ForgotPasswordForm(), reportServer(), requestCode(), submitPassword(), verifyCode(), push

### Community 193 - "lens-facets.test.ts"
Cohesion: 0.09
Nodes (29): HomePage(), collectionListId(), MEMBERSHIP_FILTERS, normalizeColors(), COLLECTION_COLORS, idFor(), mockCatalog, diameterMm() (+21 more)

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
- **802 isolated node(s):** `npx`, `Stage`, `push`, `push`, `Dict` (+797 more)
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