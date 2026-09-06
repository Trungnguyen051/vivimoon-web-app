# Graph Report - vivimoon-web-app  (2026-09-06)

## Corpus Check
- 318 files · ~140,036 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1634 nodes · 3659 edges · 131 communities (94 shown, 37 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 30 edges (avg confidence: 0.77)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ed8a2dbc`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- readSessionUserId
- cn
- sign-up-form.tsx
- parseBody
- cart-reducer.test.ts
- cookie.ts
- useSessionStore
- dependencies
- Vivimoon M2 — Purchase Core Implementation Plan
- Sản phẩm được yêu thích
- devDependencies
- Vivimoon — Client Scope Design Spec
- compilerOptions
- components.json
- catalog.ts
- mock/index.ts
- Product domain type
- compare-store.ts
- i18n seam (locale-prefixed routes, getDictionary)
- product/[slug]/page.tsx
- Coolmate.me Feature & Structure Analysis
- api/config.ts
- discovery.ts
- cart/page.tsx
- Two-tier component architecture (ui/ vs commerce/)
- Product Detail Page (PDP) structure
- pricing/mock.ts
- fetch.ts
- types/index.ts
- Sản phẩm được yêu thích
- Vivimoon Storefront Baseline Design Spec
- vouchers/page.tsx
- Placeholder/Empty Image Asset
- Cart (CartProvider context+reducer, localStorage persistence)
- Blank Placeholder Image Concept
- AGENTS.md: This is NOT the Next.js you know
- FocalPro Monthly Product Image (Blank Placeholder)
- orders/mock.ts
- Aqua Daily 2 (Placeholder Image)
- Torica Biweekly Product Image (Blank Placeholder)
- hazel-monthly-1.jpg (blank placeholder image)
- Hazel Monthly Product Line
- Placeholder/Blank Product Image
- eslint.config.mjs
- next.config.ts
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
- M1 Foundation — progress ledger
- Issue tracker: GitHub
- rx.ts
- Domain Docs
- dictionaries.ts
- orders-preferred-payment.test.ts
- triage-labels.md
- Vivimoon
- account/mock.ts
- order-status-timeline.tsx
- mobile-nav.tsx
- loyalty/mock.ts
- collection-filters.tsx
- cart.ts
- Process
- Vivimoon M1 — Foundation Implementation Plan
- getDictionary
- scripts
- shipping/mock.ts
- lens-viewer.tsx
- schemas/orders.ts
- orders/route.test.ts
- Vivimoon M4 — Discovery Implementation Plan
- auth/mock.ts
- 0001-proxy-seam-replaces-repository-interface.md
- 0002-server-components-self-fetch-mutable-state.md
- 0003-client-never-computes-money.md
- Sản phẩm được yêu thích
- radix-ui
- react-hook-form
- ForgotPasswordForm
- @testing-library/react
- @types/node
- @vitejs/plugin-react
- to-spec/SKILL.md
- discovery/mock.ts
- 0004-rx-schema-ships-cyl-axis-before-toric-ui.md
- 0005-eye-enlargement-computed-not-stored.md
- zustand
- 5. Migration Strategy
- 0006-guest-order-tracking-via-emailed-link.md
- 0007-payment-ui-branches-on-intent-shape.md
- prettier
- 0008-cart-hydration-gate-flag.md
- 0009-session-tokens-signed-and-expiring.md
- apiOk
- 1. Overview
- addresses-manager.tsx
- 3. Architecture — the proxy seam
- cart-store.ts
- loyalty/page.tsx
- payments.ts
- common.ts
- SignUpForm
- add-to-cart.tsx
- auth.ts
- checkout/page.tsx
- fixtures.test.ts
- vouchers/mock.ts
- account/route.ts
- checkout-address-prefill.test.tsx
- sign-in.test.tsx
- AddressForm
- LENS KHOÁ ẨM - 1 NGÀY
- Không tìm thấy nội dung yêu cầu.
- account-form.test.tsx
- embla-carousel-react

## God Nodes (most connected - your core abstractions)
1. `cn()` - 113 edges
2. `apiOk()` - 68 edges
3. `getDictionary()` - 54 edges
4. `apiFail()` - 48 edges
5. `readSessionUserId()` - 43 edges
6. `isLocale()` - 42 edges
7. `Locale` - 37 edges
8. `Dictionary` - 37 edges
9. `parseBody()` - 36 edges
10. `apiRequest()` - 25 edges

## Surprising Connections (you probably didn't know these)
- `README.md: Vivimoon Next.js project README` --semantically_similar_to--> `Tech stack (Next.js App Router, React 19, TS strict, Tailwind v4, shadcn/ui, embla, RHF+zod, GA4, Vitest)`  [INFERRED] [semantically similar]
  README.md → docs/superpowers/specs/2026-08-16-vivimoon-storefront-baseline-design.md
- `toggle()` --calls--> `apiRequest()`  [EXTRACTED]
  components/commerce/favorite-button.tsx → lib/api/client.ts
- `AlertAction()` --calls--> `cn()`  [EXTRACTED]
  components/ui/alert.tsx → lib/utils/cn.ts
- `BreadcrumbEllipsis()` --calls--> `cn()`  [EXTRACTED]
  components/ui/breadcrumb.tsx → lib/utils/cn.ts
- `FieldContent()` --calls--> `cn()`  [EXTRACTED]
  components/ui/field.tsx → lib/utils/cn.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Cart feature data flow: reducer, storage, context, hook composing CartProvider** — docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_cartprovider, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_usecart, docs_superpowers_plans_2026_08_16_vivimoon_storefront_baseline_task9_cart_feature [EXTRACTED 1.00]
- **Four swappable architecture seams (data, theming, i18n, analytics) isolating volatility** — docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_productrepository, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_theming_seam, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_i18n_seam, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_analytics_seam [EXTRACTED 1.00]
- **Coolmate apparel patterns re-modeled for Vivimoon contact-lens domain** — docs_research_coolmate_website_analysis_product_card, docs_research_coolmate_website_analysis_pdp, docs_research_coolmate_website_analysis_color_variant_url_pattern, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_productcard, docs_superpowers_specs_2026_08_16_vivimoon_storefront_baseline_design_variant [INFERRED 0.85]

## Communities (131 total, 37 thin omitted)

### Community 0 - "readSessionUserId"
Cohesion: 0.15
Nodes (11): jar, DELETE(), POST(), GET(), GET(), GET(), POST(), account (+3 more)

### Community 1 - "cn"
Cohesion: 0.11
Nodes (20): HeroCarousel(), Slide, QuantityStepper(), Accordion(), AccordionContent(), AccordionItem(), AccordionTrigger(), CardAction() (+12 more)

### Community 2 - "sign-up-form.tsx"
Cohesion: 0.16
Nodes (22): Stage, Stage, Alert(), AlertAction(), AlertDescription(), AlertTitle(), alertVariants, Field() (+14 more)

### Community 3 - "parseBody"
Cohesion: 0.22
Nodes (15): jar, POST(), POST(), POST(), POST(), POST(), POST(), POST() (+7 more)

### Community 4 - "cart-reducer.test.ts"
Cohesion: 0.11
Nodes (20): dict, line, lineWithRx, rx, atA, atB, empty, makeLine() (+12 more)

### Community 5 - "cookie.ts"
Cohesion: 0.14
Nodes (11): BASELINE_LINES, jar, jar, jar, secret(), SESSION_COOKIE, sessionCookieOptions(), sign() (+3 more)

### Community 6 - "useSessionStore"
Cohesion: 0.16
Nodes (8): fetchRoutingTo(), json(), PRICED_RESPONSE, SessionStore, SessionUser, user, useSessionStore, SessionSync()

### Community 7 - "dependencies"
Cohesion: 0.08
Nodes (25): class-variance-authority, clsx, @hookform/resolvers, lucide-react, next, @next/third-parties, dependencies, class-variance-authority (+17 more)

### Community 8 - "Vivimoon M2 — Purchase Core Implementation Plan"
Cohesion: 0.11
Nodes (19): File Structure, Global Constraints, M2 Definition of Done, Scope note: why `cyl`/`axis` exist in the schema but not the UI, Task 10: Order placement, Task 11: Guest → member cart merge, Task 12: Buy Now, Task 13: M2 verification (+11 more)

### Community 9 - "Sản phẩm được yêu thích"
Cohesion: 0.05
Nodes (43): CHÍNH SÁCH, **Chính sách mua hàng & hậu mãi Vivimoon**, [Combo 5 tép dung dịch nhỏ mắt Avizor](https://vivimoon.vn/combo-5-tep-dung-dich-nho-mat-avizor-p39089247.html "Combo 5 tép dung dịch nhỏ mắt Avizor"), [Combo 5 tép dung dịch nhỏ mắt Avizor](https://vivimoon.vn/combo-5-tep-dung-dich-nho-mat-avizor-p39089247.html "Combo 5 tép dung dịch nhỏ mắt Avizor"), CÔNG TY TNHH THƯƠNG MẠI XUẤT NHẬP KHẨU ISU, **FAQ - Câu hỏi thường gặp về Vivimedi Oxy Plus**, **Gợi ý Makeup & Outfit với Vivimedi Oxy Plus**, [Hiểu Blue (Promotion) - 6 months - LCMT](https://vivimoon.vn/hieu-blue-promotion-6-months-lcmt-p39087658.html "Hiểu Blue (Promotion) - 6 months - LCMT") (+35 more)

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
Cohesion: 0.09
Nodes (23): SpecTable(), mockedApiRequest, UseComparisonMatrixResult, Collection, CompareRequest, compareRequestSchema, ComparisonMatrix, ComparisonRow (+15 more)

### Community 15 - "mock/index.ts"
Cohesion: 0.15
Nodes (13): collections, favorites, galleries, HOME_ADDRESS, OFFICE_ADDRESS, orders, products, reviews (+5 more)

### Community 16 - "Product domain type"
Cohesion: 0.11
Nodes (20): Planned file structure (app/, lib/, content/, features/cart/, components/, tests/), Global constraints (Node 20+, TS strict, no hardcoded strings, no raw gtag, no data-fetching in ui/commerce components), Vivimoon Storefront Baseline Implementation Plan, Task 1: Scaffold project & tooling, Task 2: Testing setup (Vitest + RTL), Task 3: Utilities (cn, formatPrice), Task 4: Domain types, Task 5: Mock content (+12 more)

### Community 17 - "compare-store.ts"
Cohesion: 0.06
Nodes (22): geistMono, geistSans, metadata, QuizFlow(), definition, mockedApiRequest, CompareToggle(), matrix (+14 more)

### Community 18 - "i18n seam (locale-prefixed routes, getDictionary)"
Cohesion: 0.11
Nodes (19): Multi-language/locale switcher (topbar), Utility topbar (Coolmate), Task 7: i18n seam (config, dictionaries, middleware), Task 8: Analytics seam (GA4), Analytics seam (GA4 via typed track() wrapper), GA4 ecommerce events (view_item_list, select_item, view_item, add_to_cart, remove_from_cart, view_cart, begin_checkout, purchase), getDictionary(locale) function, @next/third-parties GoogleAnalytics component (+11 more)

### Community 19 - "product/[slug]/page.tsx"
Cohesion: 0.24
Nodes (10): FavoriteButton(), toggle(), RatingStars(), Breadcrumb(), BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink(), BreadcrumbList() (+2 more)

### Community 20 - "Coolmate.me Feature & Structure Analysis"
Cohesion: 0.12
Nodes (16): Screen-reader-only accessible text investment, Announcement bar (Coolmate), Blog / content-marketing hub, Care & Share CSR program, Community Threads (UGC/community hub), Cookie consent banner + preference center, CXP by Coolmate (custom-print sub-brand), Footer (contact, link columns, address, certifications) (+8 more)

### Community 21 - "api/config.ts"
Cohesion: 0.16
Nodes (12): POST(), GUEST_ADDRESS, placeGuestOrder(), ApiMode, DEPENDS_ON, isAnyUpstream(), rawMode(), readMode() (+4 more)

### Community 22 - "discovery.ts"
Cohesion: 0.11
Nodes (21): QuizAnswer, quizAnswerSchema, quizDefinitionSchema, QuizOption, quizOptionSchema, QuizQuestion, quizQuestionSchema, QuizSubmitRequest (+13 more)

### Community 23 - "cart/page.tsx"
Cohesion: 0.24
Nodes (16): CartPage(), SuccessPage(), CollectionPage(), resolveTitle(), ProductGrid(), Empty(), EmptyContent(), EmptyDescription() (+8 more)

### Community 24 - "Two-tier component architecture (ui/ vs commerce/)"
Cohesion: 0.15
Nodes (14): Task 12: Carousels & CategoryGrid, Task 13: Layout chrome (AnnouncementBar, Header, MegaNav, LocaleSwitcher, Footer), Task 14: Home page, Task 15: Collection listing page + filters, CartLineItem component, CategoryGrid component, CollectionCarousel component, Two-tier component architecture (ui/ vs commerce/) (+6 more)

### Community 25 - "Product Detail Page (PDP) structure"
Cohesion: 0.15
Nodes (13): Color variants as distinct URLs (?color=slug) for SEO/deep-linking, CoolClub loyalty program + CoolCash currency, Fabric-technology brand system (cross-cutting taxonomy: CoolDry, CoolSoft, CoolRib, CoolFlex, ZeroMark), Fit-feedback histogram (Tight/True-to-size/Loose) in reviews, Product Detail Page (PDP) structure, Task 16: PDP components (Gallery, VariantSelector, SpecTable, ReviewsList), Task 17: PDP page + Add-to-cart, Task 18: Cart page + line item + order summary (+5 more)

### Community 26 - "pricing/mock.ts"
Cohesion: 0.18
Nodes (11): pricing, bestVoucher(), mockPricing, Pricing, PricingError, BASELINE_LINES, voucherApplies(), voucherDiscount() (+3 more)

### Community 27 - "fetch.ts"
Cohesion: 0.17
Nodes (11): RESOURCES, saved, upstreamBaseUrl(), upstreamTimeoutMs(), ApiError, Envelope, upstreamFetch(), UpstreamRequestError (+3 more)

### Community 28 - "types/index.ts"
Cohesion: 0.15
Nodes (15): PriceTag(), minVariant(), ProductCard(), product, dict, product, VariantSelector(), Gtag (+7 more)

### Community 29 - "Sản phẩm được yêu thích"
Cohesion: 0.05
Nodes (41): 1\. Jupiter Gray - Sản phẩm mới của dòng lens khóa ẩm cao cấp, 2\. Ưu điểm của Lens khóa ẩm Jupiter Gray, 3\. Một số lưu ý khi sử dụng lens khóa ẩm Jupiter Gray, 4\. Vivimoon địa chỉ cung cấp lens Jupiter Gray chính hãng, CHÍNH SÁCH, [Combo 5 tép dung dịch nhỏ mắt Avizor](https://vivimoon.vn/combo-5-tep-dung-dich-nho-mat-avizor-p39089247.html "Combo 5 tép dung dịch nhỏ mắt Avizor"), [Combo 5 tép dung dịch nhỏ mắt Avizor](https://vivimoon.vn/combo-5-tep-dung-dich-nho-mat-avizor-p39089247.html "Combo 5 tép dung dịch nhỏ mắt Avizor"), CÔNG TY TNHH THƯƠNG MẠI XUẤT NHẬP KHẨU ISU (+33 more)

### Community 30 - "Vivimoon Storefront Baseline Design Spec"
Cohesion: 0.24
Nodes (11): Gender filter toggle (in-place homepage filtering), Hero banner carousel (7 slides), Homepage structure (hero carousel, promo tiles, category grid), Product card component (hover-swap, swatches, badges, price), Themed collection sections with product carousels, Build sequence (13 high-level steps), Baseline goals (demoable bilingual storefront, clean seams, prop-driven components), Explicit non-goals (Rx upload, loyalty, real payment, real DB, auth, deferred with seams) (+3 more)

### Community 31 - "vouchers/page.tsx"
Cohesion: 0.16
Nodes (21): fetchOrders(), formatDate(), OrderHistoryPage(), STATUS_VARIANT, discountLabel(), fetchVouchers(), formatDate(), VouchersPage() (+13 more)

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
Cohesion: 0.13
Nodes (13): jar, mockOrders, Orders, randomId(), randomOrderCode(), randomSuffix(), resetMockOrdersState(), store (+5 more)

### Community 38 - "Aqua Daily 2 (Placeholder Image)"
Cohesion: 0.50
Nodes (4): Aqua Daily 1 (placeholder image), Aqua Daily 2 (Placeholder Image), Blank Placeholder Graphic, Aqua Daily Product Line

### Community 39 - "Torica Biweekly Product Image (Blank Placeholder)"
Cohesion: 0.50
Nodes (4): Torica Biweekly Product Image (Blank Placeholder), Biweekly Variant/Frequency Concept, Empty/Unrendered Placeholder Asset, Torica Product Line

### Community 40 - "hazel-monthly-1.jpg (blank placeholder image)"
Cohesion: 0.67
Nodes (3): hazel-monthly-1.jpg (blank placeholder image), Hazel Monthly Product (inferred subscription/monthly product line), Placeholder / Blank Image Concept

### Community 61 - "M1 Foundation — progress ledger"
Cohesion: 0.22
Nodes (8): M1 Foundation — progress ledger, M2 Task 11 — Guest → member cart merge (2026-09-02), M2 Task 12 — Buy Now (2026-09-02), M2 Task 13 — M2 verification (2026-09-02), M2 Task 5 — RxSelector and Rx-aware add-to-cart (2026-08-31), M2 Task 6 — Server-owned pricing and auto-voucher (2026-08-31), M2 Task 7 — Cart page renders server prices (2026-08-31), M4 Task 9 — M4 verification (2026-09-05)

### Community 62 - "Issue tracker: GitHub"
Cohesion: 0.29
Nodes (6): Conventions, Issue tracker: GitHub, Pull requests as a triage surface, Wayfinding operations, When a skill says "fetch the relevant ticket", When a skill says "publish to the issue tracker"

### Community 63 - "rx.ts"
Cohesion: 0.09
Nodes (27): emptyRxDraft, EyeFields(), RxDraft, RxEyeDraft, RxRanges, RxSelector(), dict, eyeSummary() (+19 more)

### Community 64 - "Domain Docs"
Cohesion: 0.33
Nodes (5): Before exploring, read these, Domain Docs, File structure, Flag ADR conflicts, Use the glossary's vocabulary

### Community 65 - "dictionaries.ts"
Cohesion: 0.15
Nodes (13): ComparisonDialog(), ComparisonTray(), TrackingRequestForm(), AnnouncementBar(), Footer(), Button(), buttonVariants, useComparisonMatrix() (+5 more)

### Community 66 - "orders-preferred-payment.test.ts"
Cohesion: 0.29
Nodes (3): ADDRESS, jar, LINES

### Community 69 - "account/mock.ts"
Cohesion: 0.08
Nodes (19): ADDRESS, jar, addressErrorResponse(), DELETE(), PATCH(), POST(), addresses, Account (+11 more)

### Community 70 - "order-status-timeline.tsx"
Cohesion: 0.33
Nodes (5): OrderStatusTimeline(), PROGRESSION, TERMINAL_DISTINCT, ORDER_STATUSES, OrderStatus

### Community 71 - "mobile-nav.tsx"
Cohesion: 0.16
Nodes (15): Header(), LocaleSwitcher(), MegaNav(), MobileNav(), getNavItems(), NavItem, Sheet(), SheetClose() (+7 more)

### Community 72 - "loyalty/mock.ts"
Cohesion: 0.11
Nodes (11): ADDRESS, jar, LINES, loyaltyHistory, Loyalty, mockLoyalty, store, LoyaltyBalance (+3 more)

### Community 73 - "collection-filters.tsx"
Cohesion: 0.17
Nodes (14): CollectionFilters(), REPLACEMENTS, SORTS, TYPES, Select(), SelectContent(), SelectGroup(), SelectItem() (+6 more)

### Community 74 - "cart.ts"
Cohesion: 0.17
Nodes (11): cartLineSchema, cartStateSchema, priceCartRequestSchema, PriceLineInput, ShippingSelection, shippingSelectionSchema, VoucherStatus, voucherStatusSchema (+3 more)

### Community 75 - "Process"
Cohesion: 0.15
Nodes (12): 1. Gather context, 2. Explore the codebase (optional), 3. Draft vertical slices, 4. Quiz the user, 5. Publish the tickets to the configured tracker, Acceptance criteria, Blocked by, <NN> — <Ticket title> (+4 more)

### Community 76 - "Vivimoon M1 — Foundation Implementation Plan"
Cohesion: 0.11
Nodes (18): File Structure, Global Constraints, M1 Definition of Done, Task 10: Browser API client, session sync, and the sign-in / sign-up pages, Task 11: Forgot-password OTP flow, Task 12: Account resource and route handlers, Task 13: Account page, route guards, and M1 verification, Task 1: API config and response envelope (+10 more)

### Community 77 - "getDictionary"
Cohesion: 0.15
Nodes (17): FavoritesPage(), ForgotPasswordPage(), SignInPage(), SignUpPage(), LocaleLayout(), TrackRequestPage(), TrackedOrderPage(), HomePage() (+9 more)

### Community 78 - "scripts"
Cohesion: 0.15
Nodes (12): name, private, scripts, build, dev, lint, start, test (+4 more)

### Community 79 - "shipping/mock.ts"
Cohesion: 0.29
Nodes (6): defaultShippingOptions, shippingRates, mockShipping, Shipping, ShippingError, ShippingOption

### Community 80 - "lens-viewer.tsx"
Cohesion: 0.29
Nodes (8): CONTEXT_KEYS, LensViewer(), ProductGallery(), Tabs(), TabsContent(), TabsList(), tabsListVariants, TabsTrigger()

### Community 81 - "schemas/orders.ts"
Cohesion: 0.11
Nodes (17): ADDRESS, LINES, pricedLineSchema, priceLineInputSchema, Address, addressSchema, shippingOptionSchema, ShippingQuoteRequest (+9 more)

### Community 82 - "orders/route.test.ts"
Cohesion: 0.29
Nodes (3): ADDRESS, BASELINE_LINES, jar

### Community 83 - "Vivimoon M4 — Discovery Implementation Plan"
Cohesion: 0.13
Nodes (15): File Structure, Global Constraints, M4 Definition of Done, Scope note: the §6/§10 eyeEnlargement conflict, Task 1: Mirrored reviews — source badge, Task 2: Comparison — eye-enlargement banding, schemas, discovery resource, Task 3: Comparison — store, toggle, persistent tray, Task 4: Comparison — matrix Dialog (+7 more)

### Community 84 - "auth/mock.ts"
Cohesion: 0.12
Nodes (14): MockUser, users, Auth, mockAuth, OtpRecord, otps, resetMockAuthState(), ResetRecord (+6 more)

### Community 89 - "Sản phẩm được yêu thích"
Cohesion: 0.05
Nodes (39): CHÍNH SÁCH, [Combo 5 tép dung dịch nhỏ mắt Avizor](https://vivimoon.vn/combo-5-tep-dung-dich-nho-mat-avizor-p39089247.html "Combo 5 tép dung dịch nhỏ mắt Avizor"), [Combo 5 tép dung dịch nhỏ mắt Avizor](https://vivimoon.vn/combo-5-tep-dung-dich-nho-mat-avizor-p39089247.html "Combo 5 tép dung dịch nhỏ mắt Avizor"), CÔNG TY TNHH THƯƠNG MẠI XUẤT NHẬP KHẨU ISU, [Hiểu Blue (Promotion) - 6 months - LCMT](https://vivimoon.vn/hieu-blue-promotion-6-months-lcmt-p39087658.html "Hiểu Blue (Promotion) - 6 months - LCMT"), [Hiểu Blue (Promotion) - 6 months - LCMT](https://vivimoon.vn/hieu-blue-promotion-6-months-lcmt-p39087658.html "Hiểu Blue (Promotion) - 6 months - LCMT"), [Hộp dung dịch nhỏ mắt Avizor](https://vivimoon.vn/hop-dung-dich-nho-mat-avizor-p39089248.html "Hộp dung dịch nhỏ mắt Avizor"), [Hộp dung dịch nhỏ mắt Avizor](https://vivimoon.vn/hop-dung-dich-nho-mat-avizor-p39089248.html "Hộp dung dịch nhỏ mắt Avizor") (+31 more)

### Community 92 - "ForgotPasswordForm"
Cohesion: 0.36
Nodes (6): ForgotPasswordForm(), reportServer(), requestCode(), submitPassword(), verifyCode(), push

### Community 96 - "to-spec/SKILL.md"
Cohesion: 0.22
Nodes (8): Further Notes, Implementation Decisions, Out of Scope, Problem Statement, Process, Solution, Testing Decisions, User Stories

### Community 97 - "discovery/mock.ts"
Cohesion: 0.17
Nodes (12): GET(), quiz, discovery, cheapestVariant(), Discovery, DiscoveryError, mockDiscovery, toComparisonRow() (+4 more)

### Community 101 - "5. Migration Strategy"
Cohesion: 0.33
Nodes (6): 5. Migration Strategy, Adapting drift, Conformance suite, Cutover order, Per-resource cutover, Runtime validation

### Community 109 - "apiOk"
Cohesion: 0.16
Nodes (18): GET(), GET(), POST(), GET(), GET(), GET(), GET(), POST() (+10 more)

### Community 110 - "1. Overview"
Cohesion: 0.50
Nodes (4): 1. Overview, Baseline non-goals now in scope, Goals, Non-goals

### Community 111 - "addresses-manager.tsx"
Cohesion: 0.14
Nodes (10): AddressDict, AddressesManager(), EMPTY_FORM, FormState, NON_DEFAULT, toFormState(), ReviewSourceBadge(), Badge() (+2 more)

### Community 112 - "3. Architecture — the proxy seam"
Cohesion: 0.67
Nodes (3): 3. Architecture — the proxy seam, Configuration, Resource layout

### Community 113 - "cart-store.ts"
Cohesion: 0.14
Nodes (10): mockedApiRequest, track, ORDER_RESPONSE, makeLine(), seedLastOrder(), CART_STORAGE, CartStore, CartAction (+2 more)

### Community 114 - "loyalty/page.tsx"
Cohesion: 0.22
Nodes (13): AddressesPage(), fetchAddresses(), fetchFavorites(), fetchLoyalty(), formatDate(), LoyaltyPage(), fetchOrder(), OrderDetailPage() (+5 more)

### Community 115 - "payments.ts"
Cohesion: 0.13
Nodes (16): PaymentMethodPicker(), dict, payments, mockPayments, PaymentError, Payments, PaymentIntent, PaymentIntentRequest (+8 more)

### Community 116 - "common.ts"
Cohesion: 0.14
Nodes (11): BASELINE_LINES, req(), pricedCartSchema, comparisonMatrixSchema, lensGallerySchema, apiErrorSchema, envelopeSchema(), ERROR_CODES (+3 more)

### Community 117 - "SignUpForm"
Cohesion: 0.22
Nodes (4): SignUpForm(), goToAccount(), verifyCode(), push

### Community 118 - "add-to-cart.tsx"
Cohesion: 0.21
Nodes (11): AddToCart(), dict, push, cartCount(), cartReducer(), mergeLines(), selectCartCount(), useCartStore (+3 more)

### Community 119 - "auth.ts"
Cohesion: 0.18
Nodes (13): googleLoginSchema, identifierSchema, normalizePhone(), otpChallengeSchema, otpPurposeSchema, otpRequestSchema, OtpVerifyInput, otpVerifyResultSchema (+5 more)

### Community 120 - "checkout/page.tsx"
Cohesion: 0.14
Nodes (14): CheckoutPage(), mockedApiRequest, toPriceLines(), usePricedCart(), UsePricedCartResult, SessionStatus, apiRequest(), isPhone() (+6 more)

### Community 121 - "fixtures.test.ts"
Cohesion: 0.18
Nodes (10): userSchema, voucherSchema, collectionSchema, productQuerySchema, productSchema, reviewSchema, validProduct, orderSchema (+2 more)

### Community 122 - "vouchers/mock.ts"
Cohesion: 0.31
Nodes (5): vouchers, vouchers, mockVouchers, Vouchers, Voucher

### Community 123 - "account/route.ts"
Cohesion: 0.25
Nodes (4): jar, GET(), PATCH(), accountPatchSchema

### Community 124 - "checkout-address-prefill.test.tsx"
Cohesion: 0.33
Nodes (4): DEFAULT_ADDRESS, fetchRoutingTo(), json(), PRICED_RESPONSE

### Community 127 - "LENS KHOÁ ẨM - 1 NGÀY"
Cohesion: 0.33
Nodes (5): CHÍNH SÁCH, CÔNG TY TNHH THƯƠNG MẠI XUẤT NHẬP KHẨU ISU, LENS KHOÁ ẨM - 1 NGÀY, MẠNG XÃ HỘI, SẢN PHẨM

### Community 128 - "Không tìm thấy nội dung yêu cầu."
Cohesion: 0.33
Nodes (5): CHÍNH SÁCH, CÔNG TY TNHH THƯƠNG MẠI XUẤT NHẬP KHẨU ISU, Không tìm thấy nội dung yêu cầu., MẠNG XÃ HỘI, SẢN PHẨM

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
- **567 isolated node(s):** `Stage`, `push`, `push`, `Stage`, `push` (+562 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **37 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

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