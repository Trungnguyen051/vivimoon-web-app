# Graph Report - vivimoon-web-app  (2026-11-16)

## Corpus Check
- 554 files · ~317,165 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2694 nodes · 7330 edges · 182 communities (127 shown, 55 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 49 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b1b1d3e7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- nav-destinations.test.ts
- cart.ts
- Dictionary
- parseBody
- order-status-timeline.tsx
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
- mega-nav.tsx
- Product domain type
- mock/index.ts
- i18n seam (locale-prefixed routes, getDictionary)
- quick-add.tsx
- Coolmate.me Feature & Structure Analysis
- auth.ts
- articles/[slug]/page.tsx
- quiz-scoring.ts
- Two-tier component architecture (ui/ vs commerce/)
- Product Detail Page (PDP) structure
- product/[slug]/page.tsx
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
- addresses/page.tsx
- Domain Docs
- apiOk
- schemas/orders.ts
- triage-labels.md
- Vivimoon
- qr-transfer-view.tsx
- success/page.tsx
- qr-transfer-view.test.tsx
- dictionaries.ts
- schemas/support.ts
- mini-cart.tsx
- Process
- Vivimoon M1 — Foundation Implementation Plan
- cart-line-item.tsx
- scripts
- vi.ts
- faq-filter.ts
- Product
- cart/page.test.tsx
- Vivimoon M4 — Discovery Implementation Plan
- Locale
- 0001-proxy-seam-replaces-repository-interface.md
- 0002-server-components-self-fetch-mutable-state.md
- 0003-client-never-computes-money.md
- common.ts
- [locale]/page.tsx
- shadcn
- checkout-view.tsx
- support/page.tsx
- [locale]/layout.tsx
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
- api/config.ts
- 1. Overview
- order-history-card.test.tsx
- 3. Architecture — the proxy seam
- lens-facets.ts
- checkout-guest-member.test.tsx
- payments.ts
- spend-tier-progress.tsx
- sign-up.test.tsx
- Vivimoon.vn — Live Site Data-Model Audit
- review-media-field.tsx
- SupportFaqPage
- lens-entries.ts
- account/layout.tsx
- collection-carousel.tsx
- loyalty/mock.ts
- collection/[slug]/page.tsx
- lens-viewer.tsx
- 0010-product-line-excludes-correction-complexity.md
- 0011-eye-enlargement-derives-from-graphic-diameter.md
- apiRequest
- variant-selector.tsx
- search-box.tsx
- media/route.test.ts
- 0013-pages-own-their-width.md
- 0012-unavailable-cart-lines-are-reported-not-dropped.md
- Pages run full-bleed with 40px gutters; `PageContainer` no longer caps at `max-w-7xl`
- comparison-tray.tsx
- package.json
- Cart Lines carry a Purchase Unit; a lens is priced per single lens
- Guest orders earn Held Points, credited when an account verifies the phone
- rx.ts
- shipping/mock.ts
- quiz-card.tsx
- guide-feedback.test.tsx
- Checkout offers QR transfer, cash on delivery and e-wallet; email becomes optional
- An Article's inline products come from its Reading Theme, not from the Article
- A Guide is a fixed-layout document, and not an Article
- The Support search box filters FAQ Entries; it is not storefront search
- newsletter-signup.test.tsx
- @types/react
- 0014-image-optimization-is-on.md
- catalog/mock.ts
- bundle-offer.test.tsx
- zustand
- i18n/config.ts
- discovery.ts
- AddressForm
- Order lookup is by order code alone, shown inline
- A phone sign-up is not an account until its OTP is verified
- pricing/mock.ts
- vitest
- checkout.ts
- review-form.test.tsx
- orders/route.ts
- write-review-button.test.tsx
- @vitejs/plugin-react
- app/layout.tsx
- OtpStage
- Guest orders join the account that verifies their phone
- @types/node
- lucide-react
- prettier
- success-view.test.tsx
- vouchers/mock.ts
- helpful/route.test.ts
- ForgotPasswordForm
- occasion-header.tsx
- spec-table.tsx
- list-id.ts
- parseProductQueryLoose

## God Nodes (most connected - your core abstractions)
1. `cn()` - 220 edges
2. `getDictionary()` - 108 edges
3. `apiOk()` - 90 edges
4. `Locale` - 77 edges
5. `Dictionary` - 77 edges
6. `apiFail()` - 75 edges
7. `readSessionUserId()` - 62 edges
8. `isLocale()` - 60 edges
9. `apiRequest()` - 51 edges
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

## Communities (182 total, 55 thin omitted)

### Community 0 - "nav-destinations.test.ts"
Cohesion: 0.19
Nodes (12): SupportPage(), renderHub(), ADR-0022, NavItem, NavLink, segmentsOf(), hrefsOf(), navHrefs() (+4 more)

### Community 1 - "cart.ts"
Cohesion: 0.08
Nodes (26): BASELINE_LINES, RX, ADR-0012, bundleTagSchema, cartLineSchema, cartStateSchema, MAX_LINE_QUANTITY, nextSpendTierSchema (+18 more)

### Community 2 - "Dictionary"
Cohesion: 0.11
Nodes (32): AddressDict, EMPTY_FORM, FormState, Stage, Dict, ADR-0021, SocialAuth(), TONE (+24 more)

### Community 3 - "parseBody"
Cohesion: 0.17
Nodes (21): POST(), jar, Order, POST(), POST(), POST(), POST(), POST() (+13 more)

### Community 4 - "order-status-timeline.tsx"
Cohesion: 0.16
Nodes (9): dict, push, refresh, renderView(), Step, STEP_OF, STEPS, ORDER_STATUSES (+1 more)

### Community 5 - "payment-method-picker.tsx"
Cohesion: 0.31
Nodes (8): ICONS, PaymentMethodPicker(), dict, ADR-0025, PaymentMethodType, PaymentMethodOption, paymentMethods, ADR-0025

### Community 6 - "add-to-cart.tsx"
Cohesion: 0.15
Nodes (15): AddToCart(), ADR-0023, defaultRxDraft, draftFromDefaultRx(), draftToRx(), POWER_GUIDE_SLUG, RxDraft, RxSelector() (+7 more)

### Community 7 - "dependencies"
Cohesion: 0.07
Nodes (27): @base-ui/react, class-variance-authority, clsx, embla-carousel-react, @hookform/resolvers, next, @next/third-parties, dependencies (+19 more)

### Community 8 - "Vivimoon M2 — Purchase Core Implementation Plan"
Cohesion: 0.11
Nodes (19): File Structure, Global Constraints, M2 Definition of Done, Scope note: why `cyl`/`axis` exist in the schema but not the UI, Task 10: Order placement, Task 11: Guest → member cart merge, Task 12: Buy Now, Task 13: M2 verification (+11 more)

### Community 9 - "cookie.ts"
Cohesion: 0.06
Nodes (17): jar, jar, jar, params(), post(), jar, VALID, jar (+9 more)

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
Nodes (52): req(), get(), accessoryOptionSchema, Collection, collectionSchema, comfortSchema, CompareRequest, compareRequestSchema (+44 more)

### Community 15 - "mega-nav.tsx"
Cohesion: 0.18
Nodes (14): ITEM_CLASS, MegaNav(), pathname, NavigationMenu(), NavigationMenuContent(), NavigationMenuIndicator(), NavigationMenuItem(), NavigationMenuLink() (+6 more)

### Community 16 - "Product domain type"
Cohesion: 0.11
Nodes (20): Planned file structure (app/, lib/, content/, features/cart/, components/, tests/), Global constraints (Node 20+, TS strict, no hardcoded strings, no raw gtag, no data-fetching in ui/commerce components), Vivimoon Storefront Baseline Implementation Plan, Task 1: Scaffold project & tooling, Task 2: Testing setup (Vitest + RTL), Task 3: Utilities (cn, formatPrice), Task 4: Domain types, Task 5: Mock content (+12 more)

### Community 17 - "mock/index.ts"
Cohesion: 0.08
Nodes (22): approvedReviews(), ProductPage(), mockedFetchViaSelf, renderProduct(), ADR-0002, addresses, collections, favorites (+14 more)

### Community 18 - "i18n seam (locale-prefixed routes, getDictionary)"
Cohesion: 0.11
Nodes (19): Multi-language/locale switcher (topbar), Utility topbar (Coolmate), Task 7: i18n seam (config, dictionaries, middleware), Task 8: Analytics seam (GA4), Analytics seam (GA4 via typed track() wrapper), GA4 ecommerce events (view_item_list, select_item, view_item, add_to_cart, remove_from_cart, view_cart, begin_checkout, purchase), getDictionary(locale) function, @next/third-parties GoogleAnalytics component (+11 more)

### Community 19 - "quick-add.tsx"
Cohesion: 0.11
Nodes (25): GENDERS, QuickAdd(), QuickAddBody(), subscribe(), useDesktop(), Dialog(), DialogClose(), DialogContent() (+17 more)

### Community 20 - "Coolmate.me Feature & Structure Analysis"
Cohesion: 0.12
Nodes (16): Screen-reader-only accessible text investment, Announcement bar (Coolmate), Blog / content-marketing hub, Care & Share CSR program, Community Threads (UGC/community hub), Cookie consent banner + preference center, CXP by Coolmate (custom-print sub-brand), Footer (contact, link columns, address, certifications) (+8 more)

### Community 21 - "auth.ts"
Cohesion: 0.07
Nodes (36): Auth, findByIdentifier(), mockAuth, OtpRecord, otps, pendingSignups, resetMockAuthState(), ResetRecord (+28 more)

### Community 22 - "articles/[slug]/page.tsx"
Cohesion: 0.26
Nodes (12): matchCount(), renderArticle(), ArticlePage(), ADR-0018, countReadingTheme(), READING_THEME_ENTRIES, readingThemeDestination, readingThemeEntry (+4 more)

### Community 23 - "quiz-scoring.ts"
Cohesion: 0.16
Nodes (15): quizScope(), QuizQuestion, accumulateWeights(), answersFromOptionIds(), productTags(), QUIZ_MATCH_SHARE, quizMatches(), scoreQuiz() (+7 more)

### Community 24 - "Two-tier component architecture (ui/ vs commerce/)"
Cohesion: 0.15
Nodes (14): Task 12: Carousels & CategoryGrid, Task 13: Layout chrome (AnnouncementBar, Header, MegaNav, LocaleSwitcher, Footer), Task 14: Home page, Task 15: Collection listing page + filters, CartLineItem component, CategoryGrid component, CollectionCarousel component, Two-tier component architecture (ui/ vs commerce/) (+6 more)

### Community 25 - "Product Detail Page (PDP) structure"
Cohesion: 0.15
Nodes (13): Color variants as distinct URLs (?color=slug) for SEO/deep-linking, CoolClub loyalty program + CoolCash currency, Fabric-technology brand system (cross-cutting taxonomy: CoolDry, CoolSoft, CoolRib, CoolFlex, ZeroMark), Fit-feedback histogram (Tight/True-to-size/Loose) in reviews, Product Detail Page (PDP) structure, Task 16: PDP components (Gallery, VariantSelector, SpecTable, ReviewsList), Task 17: PDP page + Add-to-cart, Task 18: Cart page + line item + order summary (+5 more)

### Community 26 - "product/[slug]/page.tsx"
Cohesion: 0.25
Nodes (12): ADR-0002, ADR-0019, ComfortHighlight(), ReviewsSummary(), Breadcrumb(), BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink() (+4 more)

### Community 27 - "cn"
Cohesion: 0.07
Nodes (43): AddressCards(), LocaleError(), LocaleNotFound(), RootNotFound(), LeadArticle(), OrderActions(), fill(), HistoryLine (+35 more)

### Community 28 - "editorial.ts"
Cohesion: 0.10
Nodes (21): MakeupLookCard, MakeupLooks(), cards, ADR-0018, makeupLooks, editorial, Editorial, mockEditorial (+13 more)

### Community 29 - "account/mock.ts"
Cohesion: 0.08
Nodes (20): ADDRESS, jar, addressErrorResponse(), DELETE(), PATCH(), jar, account, Account (+12 more)

### Community 30 - "Vivimoon Storefront Baseline Design Spec"
Cohesion: 0.24
Nodes (11): Gender filter toggle (in-place homepage filtering), Hero banner carousel (7 slides), Homepage structure (hero carousel, promo tiles, category grid), Product card component (hover-swap, swatches, badges, price), Themed collection sections with product carousels, Build sequence (13 high-level steps), Baseline goals (demoable bilingual storefront, clean seams, prop-driven components), Explicit non-goals (Rx upload, loyalty, real payment, real DB, auth, deferred with seams) (+3 more)

### Community 31 - "cart-store.ts"
Cohesion: 0.08
Nodes (34): ORDER_RESPONSE, renderCheckoutPage(), renderCheckoutPage(), fetchRoutingTo(), json(), PRICED_RESPONSE, renderCheckoutPage(), CheckoutView() (+26 more)

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
Nodes (36): actionRequestSchema, GET(), POST(), ADR-0022, GET(), ADR-0022, ADR-0022, ADR-0006 (+28 more)

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
Cohesion: 0.18
Nodes (11): post(), guides, ADR-0019, ADR-0019, guideFeedback, mockSupport, readMockGuideFeedback(), resetMockGuideFeedbackState() (+3 more)

### Community 42 - "reviews-list.tsx"
Cohesion: 0.12
Nodes (20): HelpfulButton(), Vote, RatingStars(), ReviewSourceBadge(), fill(), ReviewCard(), ReviewsList(), SUB_RATINGS (+12 more)

### Community 46 - "source-files.ts"
Cohesion: 0.20
Nodes (9): ADR-0016, nextConfig, ADR-0014, isTest(), isVendored(), SKIP, sourceFiles(), withoutComments() (+1 more)

### Community 61 - "M1 Foundation — progress ledger"
Cohesion: 0.22
Nodes (8): M1 Foundation — progress ledger, M2 Task 11 — Guest → member cart merge (2026-09-02), M2 Task 12 — Buy Now (2026-09-02), M2 Task 13 — M2 verification (2026-09-02), M2 Task 5 — RxSelector and Rx-aware add-to-cart (2026-08-31), M2 Task 6 — Server-owned pricing and auto-voucher (2026-08-31), M2 Task 7 — Cart page renders server prices (2026-08-31), M4 Task 9 — M4 verification (2026-09-05)

### Community 62 - "Issue tracker: GitHub"
Cohesion: 0.29
Nodes (6): Conventions, Issue tracker: GitHub, Pull requests as a triage surface, Wayfinding operations, When a skill says "fetch the relevant ticket", When a skill says "publish to the issue tracker"

### Community 63 - "addresses/page.tsx"
Cohesion: 0.18
Nodes (6): AddressesManager(), NON_DEFAULT, toFormState(), AddressesPage(), fetchAddresses(), SavedAddress

### Community 64 - "Domain Docs"
Cohesion: 0.33
Nodes (5): Before exploring, read these, Domain Docs, File structure, Flag ADR conflicts, Use the glossary's vocabulary

### Community 65 - "apiOk"
Cohesion: 0.11
Nodes (41): GET(), POST(), DELETE(), GET(), POST(), DELETE(), GET(), PATCH() (+33 more)

### Community 66 - "schemas/orders.ts"
Cohesion: 0.11
Nodes (17): ADR-0012, giftLineSchema, priceCartRequestSchema, currencySchema, lineReviewSchema, NotificationChannel, OrderLine, orderLineSchema (+9 more)

### Community 69 - "qr-transfer-view.tsx"
Cohesion: 0.43
Nodes (5): mmss(), QrTransferView(), CopyButton(), BANK_TRANSFER, formatAccountNumber()

### Community 70 - "success/page.tsx"
Cohesion: 0.09
Nodes (29): fetchOrder(), OrderDetailPage(), WriteReviewPage(), fetchOrders(), OrderHistoryPage(), AccountPage(), fetchAccount(), etaDaysOf() (+21 more)

### Community 71 - "qr-transfer-view.test.tsx"
Cohesion: 0.20
Nodes (6): QrLine, dict, LINES, PLACED, push, PaymentOrder

### Community 72 - "dictionaries.ts"
Cohesion: 0.09
Nodes (22): AboutPage(), push, ForgotPasswordPage(), SignInPage(), push, SignUpPage(), CartPage(), CheckoutPage() (+14 more)

### Community 73 - "schemas/support.ts"
Cohesion: 0.16
Nodes (12): faqEntries, ADR-0019, faqEntrySchema, guideFeedbackSchema, guideSchema, GuideStep, guideStepSchema, SupportLink (+4 more)

### Community 74 - "mini-cart.tsx"
Cohesion: 0.08
Nodes (31): BundleOffer(), ADR-0003, CartLineItem(), dict, line, lineWithRx, rx, Card (+23 more)

### Community 75 - "Process"
Cohesion: 0.15
Nodes (12): 1. Gather context, 2. Explore the codebase (optional), 3. Draft vertical slices, 4. Quiz the user, 5. Publish the tickets to the configured tracker, Acceptance criteria, Blocked by, <NN> — <Ticket title> (+4 more)

### Community 76 - "Vivimoon M1 — Foundation Implementation Plan"
Cohesion: 0.11
Nodes (18): File Structure, Global Constraints, M1 Definition of Done, Task 10: Browser API client, session sync, and the sign-in / sign-up pages, Task 11: Forgot-password OTP flow, Task 12: Account resource and route handlers, Task 13: Account page, route guards, and M1 verification, Task 1: API config and response envelope (+10 more)

### Community 77 - "cart-line-item.tsx"
Cohesion: 0.09
Nodes (33): chipPower(), LensChips(), ADR-0012, PowerSelect(), formatLineSummary(), formatPower(), formatPowers(), LineSummary() (+25 more)

### Community 78 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, build, dev, lint, start, test, test:contract, test:contract:upstream (+2 more)

### Community 79 - "vi.ts"
Cohesion: 0.06
Nodes (26): definition, mockedApiRequest, push, featured, renderHub(), ADR-0020, matrix, items (+18 more)

### Community 80 - "faq-filter.ts"
Cohesion: 0.21
Nodes (12): searchable(), FaqEntry, Topic, FaqQuery, filterFaqEntries(), searchable(), entries, ADR-0020 (+4 more)

### Community 81 - "Product"
Cohesion: 0.08
Nodes (24): FavoritesGrid(), addToCart(), remove(), add, push, dict, push, ProductGrid() (+16 more)

### Community 82 - "cart/page.test.tsx"
Cohesion: 0.21
Nodes (11): lens(), makeLine(), mockedApiRequest, push, realPricing(), renderCartPage(), renderWithStaleLine(), track (+3 more)

### Community 83 - "Vivimoon M4 — Discovery Implementation Plan"
Cohesion: 0.13
Nodes (15): File Structure, Global Constraints, M4 Definition of Done, Scope note: the §6/§10 eyeEnlargement conflict, Task 1: Mirrored reviews — source badge, Task 2: Comparison — eye-enlargement banding, schemas, discovery resource, Task 3: Comparison — store, toggle, persistent tray, Task 4: Comparison — matrix Dialog (+7 more)

### Community 84 - "Locale"
Cohesion: 0.10
Nodes (32): FavoritesPage(), fetchFavorites(), fetchLoyalty(), formatDate(), LoyaltyPage(), discountLabel(), fetchVouchers(), formatDate() (+24 more)

### Community 89 - "common.ts"
Cohesion: 0.06
Nodes (27): ADDRESS, BASELINE_LINES, jar, RX, ADR-0012, ADR-0025, ADDRESS, LINES (+19 more)

### Community 90 - "[locale]/page.tsx"
Cohesion: 0.10
Nodes (22): BRAND_STORY_IMAGES, TV_THUMBS, ArticleCard, ArticleCards(), BrandStory(), BrandStoryImage, CategoryGrid(), COLUMN_CLASSES (+14 more)

### Community 92 - "checkout-view.tsx"
Cohesion: 0.08
Nodes (33): ADDRESS_FIELDS, FieldName, ADR-0012, ADR-0022, ADR-0024, ADR-0025, confirmationLine(), LastOrder (+25 more)

### Community 93 - "support/page.tsx"
Cohesion: 0.16
Nodes (15): FaqAccordion(), FaqAnswer, entries, PolicyId, TOPIC_ICONS, BeginnerFaq(), OrderLookupForm(), ProductReassurance() (+7 more)

### Community 94 - "[locale]/layout.tsx"
Cohesion: 0.11
Nodes (19): CheckoutLayout(), LocaleLayout(), AnnouncementBar(), BoundaryStrings, BoundaryStringsContext, BoundaryStringsProvider(), CheckoutHeader(), Footer() (+11 more)

### Community 96 - "to-spec/SKILL.md"
Cohesion: 0.22
Nodes (8): Further Notes, Implementation Decisions, Out of Scope, Problem Statement, Process, Solution, Testing Decisions, User Stories

### Community 100 - "guide.test.tsx"
Cohesion: 0.27
Nodes (6): renderGuide(), GuidePage(), articles, articleDateline(), readingMinutes(), ADR-0005

### Community 101 - "5. Migration Strategy"
Cohesion: 0.33
Nodes (6): 5. Migration Strategy, Adapting drift, Conformance suite, Cutover order, Per-resource cutover, Runtime validation

### Community 104 - "collection-filters.tsx"
Cohesion: 0.11
Nodes (33): ActiveFilters(), CheckRow(), Chip(), ClearRxFilter(), CollectionFilters(), CollectionFiltersSheet(), CollectionImageView(), CollectionLoadMore() (+25 more)

### Community 109 - "api/config.ts"
Cohesion: 0.09
Nodes (21): POST(), post(), POST(), POST(), ApiMode, DEPENDS_ON, rawMode(), readMode() (+13 more)

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
Cohesion: 0.16
Nodes (20): FacetBrowser(), Swatches(), valueLabel(), MobileNav(), getNavItems(), replacementScheduleSchema, LensEntry, LensEntryId (+12 more)

### Community 114 - "checkout-guest-member.test.tsx"
Cohesion: 0.17
Nodes (9): api(), HOME, json(), NEW, OFFICE, ORDER, PRICED, push (+1 more)

### Community 115 - "payments.ts"
Cohesion: 0.14
Nodes (13): mockPayments, Payments, ADR-0025, IntentMethod, intentMethodSchema, PaymentIntent, PaymentIntentRequest, paymentIntentRequestSchema (+5 more)

### Community 116 - "spend-tier-progress.tsx"
Cohesion: 0.25
Nodes (8): CartView(), moveToFavorites(), ICONS, short(), SpendTierProgress(), ADR-0003, cartLinesToGa4Items(), price

### Community 117 - "sign-up.test.tsx"
Cohesion: 0.20
Nodes (5): SignUpForm(), authenticate(), done(), push, user

### Community 118 - "Vivimoon.vn — Live Site Data-Model Audit"
Cohesion: 0.40
Nodes (4): 1. Site structure, 2. Product detail page — data fields observed, 3. Open question — not acted on, Vivimoon.vn — Live Site Data-Model Audit

### Community 119 - "review-media-field.tsx"
Cohesion: 0.18
Nodes (14): ACCEPT, fill(), Kind, kindOf(), MediaDict, MediaState, ReviewMediaField(), add() (+6 more)

### Community 120 - "SupportFaqPage"
Cohesion: 0.50
Nodes (3): renderFaq(), parseTopic(), SupportFaqPage()

### Community 121 - "lens-entries.ts"
Cohesion: 0.57
Nodes (6): HomePage(), countLensEntry(), LENS_ENTRIES, lensEntryCollection(), lensEntryHref(), lensEntryIncludes()

### Community 122 - "account/layout.tsx"
Cohesion: 0.27
Nodes (6): AccountShell(), AccountShellDict, dict, AccountLayout(), fetchData(), ADR-0002

### Community 124 - "loyalty/mock.ts"
Cohesion: 0.09
Nodes (19): loyaltyHistory, earnedBy(), entry(), held, Loyalty, mockLoyalty, randomEntryId(), store (+11 more)

### Community 125 - "collection/[slug]/page.tsx"
Cohesion: 0.15
Nodes (22): CollectionPage(), PAGE_IDENTITY, resolveTitle(), ProductCard(), quizSocialProof(), COLLECTION_PAGE_SIZE, DEFAULT_SORT, LensGalleryContexts (+14 more)

### Community 126 - "lens-viewer.tsx"
Cohesion: 0.14
Nodes (11): LensViewer(), Slide, Tab, TABS, gallery, tones, videos, ViewerVideo (+3 more)

### Community 129 - "apiRequest"
Cohesion: 0.08
Nodes (21): AccountInfo(), patch(), saveAccount(), savePersonal(), fmtDob(), fmtRx(), push, user (+13 more)

### Community 130 - "variant-selector.tsx"
Cohesion: 0.42
Nodes (5): resolveVariant(), VariantSelector(), selectColor(), Variant, distinctColorVariants()

### Community 131 - "search-box.tsx"
Cohesion: 0.16
Nodes (11): readRecent(), SearchBox(), remember(), api, found, writeRecent(), popularSearches, SearchSuggestions (+3 more)

### Community 132 - "media/route.test.ts"
Cohesion: 0.12
Nodes (9): fail(), POST(), jar, send(), sendRaw(), Upload, REVIEW_MEDIA_LIMITS, mp4DurationSeconds() (+1 more)

### Community 136 - "comparison-tray.tsx"
Cohesion: 0.12
Nodes (15): CompareToggle(), ComparisonDialog(), ComparisonTray(), mockedApiRequest, COMPARE_CAP, COMPARE_STORAGE, CompareState, CompareStore (+7 more)

### Community 137 - "package.json"
Cohesion: 0.50
Nodes (3): name, private, version

### Community 140 - "rx.ts"
Cohesion: 0.09
Nodes (28): AXIS_STEPS, defaultSphSchema, LensType, LineRxInput, lineRxSchema, purchaseUnitSchema, Rx, RX_LENS_TYPE (+20 more)

### Community 141 - "shipping/mock.ts"
Cohesion: 0.36
Nodes (5): defaultShippingOptions, shippingRates, mockShipping, Shipping, ShippingOption

### Community 142 - "quiz-card.tsx"
Cohesion: 0.25
Nodes (9): goNext(), noSubscribe(), QuizCard(), quizResultsHref(), QuizStartLink(), savedQuizAnswers(), saveQuizAnswers(), useSavedQuizAnswers() (+1 more)

### Community 152 - "catalog/mock.ts"
Cohesion: 0.09
Nodes (28): applies(), Catalog, FacetCounts, FacetDef, FacetKey, HelpfulVoteResult, helpfulVotes, inPriceRange() (+20 more)

### Community 153 - "bundle-offer.test.tsx"
Cohesion: 0.13
Nodes (9): bundleAccessories, dict, mockedApiRequest, singleLens, mockedApiRequest, toPriceLines(), UsePricedCartResult, SessionStatus (+1 more)

### Community 155 - "i18n/config.ts"
Cohesion: 0.17
Nodes (8): LocaleLinks(), LocaleSwitcher(), defaultLocale, locales, config, GUARDED, RETIRED, ADR-0017

### Community 156 - "discovery.ts"
Cohesion: 0.10
Nodes (23): GET(), quiz, QUIZ_MATCHES, discovery, Discovery, DiscoveryError, mockDiscovery, toComparisonRow() (+15 more)

### Community 160 - "pricing/mock.ts"
Cohesion: 0.11
Nodes (21): bestVoucher(), chosenVoucher(), Pricing, ADR-0012, ADR-0023, validVouchers(), voucherApplies(), voucherDiscount() (+13 more)

### Community 162 - "checkout.ts"
Cohesion: 0.12
Nodes (15): isPhone(), pricedLineSchema, Address, addressLabelSchema, addressSchema, shippingOptionSchema, ShippingQuoteRequest, shippingQuoteRequestSchema (+7 more)

### Community 164 - "review-form.test.tsx"
Cohesion: 0.15
Nodes (5): handleSubmit(), body(), dict, FakeXHR, fillValid()

### Community 165 - "orders/route.ts"
Cohesion: 0.07
Nodes (16): BASELINE_LINES, jar, SINGLE, ADR-0023, ADDRESS, jar, LINES, RX (+8 more)

### Community 168 - "write-review-button.test.tsx"
Cohesion: 0.18
Nodes (4): fetchMock, LINE, OTHER, push

### Community 172 - "app/layout.tsx"
Cohesion: 0.28
Nodes (5): geistMono, geistSans, metadata, CartHydrator(), CompareHydrator()

### Community 173 - "OtpStage"
Cohesion: 0.67
Nodes (3): OtpStage(), fill(), resend()

### Community 180 - "success-view.test.tsx"
Cohesion: 0.20
Nodes (4): FirstWearRead, SuccessView(), dict, READS

### Community 181 - "vouchers/mock.ts"
Cohesion: 0.31
Nodes (5): vouchers, vouchers, mockVouchers, Vouchers, Voucher

### Community 182 - "helpful/route.test.ts"
Cohesion: 0.39
Nodes (5): ctx(), jar, req(), unvote(), vote()

### Community 183 - "ForgotPasswordForm"
Cohesion: 0.70
Nodes (5): ForgotPasswordForm(), reportServer(), requestCode(), submitPassword(), verifyCode()

### Community 185 - "occasion-header.tsx"
Cohesion: 0.39
Nodes (5): OccasionHeader(), OccasionContent, Text, Occasion, occasionSchema

### Community 186 - "spec-table.tsx"
Cohesion: 0.38
Nodes (5): SpecTable(), baseSpecs, dict, ADR-0011, ProductSpecs

### Community 187 - "list-id.ts"
Cohesion: 0.36
Nodes (6): collectionListId(), MEMBERSHIP_FILTERS, normalizeColors(), COLLECTION_COLORS, idFor(), ProductQuery

### Community 193 - "parseProductQueryLoose"
Cohesion: 0.19
Nodes (11): mockCatalog, parseProductQueryLoose(), ReplacementSchedule, DURATION_COLLECTION, DURATION_TILES, DurationTile, durationTileHref(), DurationTileId (+3 more)

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
- **805 isolated node(s):** `npx`, `Stage`, `push`, `push`, `Dict` (+800 more)
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