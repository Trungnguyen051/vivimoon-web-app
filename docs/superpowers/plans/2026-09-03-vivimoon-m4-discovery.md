# Vivimoon M4 — Discovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the four Discovery-area features — mirrored review provenance, Comparison, the Lens Viewer, and the Lens-Matching Quiz — each independently demoable, each shippable now with complete UI even where Vivimoon's real content (photos, quiz questions) is still pending.

**Architecture:** No new seam. Reviews and the Lens Viewer are **catalog** data (read-only, Group A) and extend the existing `catalog` resource. Comparison and the Quiz are **discovery** data (Group C, depends on catalog) and land in a new `lib/api/resources/discovery/` module against the `discovery` resource key `lib/api/config.ts` already registered in M1 (`RESOURCES`, `DEPENDS_ON: { discovery: ['catalog'] }`) but has never been used until now.

**Tech Stack:** Next.js 16.3.1 App Router (`proxy.ts`), React 19, TypeScript strict, zod 3.25, zustand 5, Vitest + React Testing Library, shadcn `Dialog`/`Sheet`.

**Spec:** [`../specs/2026-08-27-vivimoon-client-scope-design.md`](../specs/2026-08-27-vivimoon-client-scope-design.md) — §2 row 7/9/10/11 (feature status), §10 (Comparison, Lens viewer feature notes), §11 (blocked items: Lens viewer assets, Quiz content), §13 (M4 scope).

**Depends on:** M1, M2, M3 complete. (M3 shipped as GitHub issues #5–#11 with an "Implementation Decisions" section per-issue rather than a `docs/superpowers/plans/*.md` file; M4 returns to the M1/M2 plan-doc format.)

**Design record:** the scope and UI decisions below were settled in a grilling session with the user on 2026-09-03 (not written down elsewhere) — build order, Dialog-vs-Sheet for the matrix, ship-now-with-placeholders for the viewer and quiz, entry points, and quiz flow shape all come from that session, not from the spec alone.

---

## Global Constraints

M1's and M2's Global Constraints all still apply. Read them. Restated here because M4 leans on them constantly:

- **No hardcoded user-facing strings** — all copy through `lib/i18n` dictionaries, `en` and `vi` together.
- **No component in `components/` fetches data.** `LensViewer`, `ComparisonDialog`, `ComparisonTray`, `CompareToggle`, and every quiz step component take props or read `useCompareStore` — none of them call `/api/*` directly. The page/feature layer does.
- **Zod schemas are the single source of truth.** `lib/types/*` re-exports `z.infer<>`.
- **Server Components import `lib/api/resources/*` directly** for read-only catalog data (gallery, quiz definition). Client Components and anything posting a mutation (`compare`, `quiz/submit`) go through `/api/*`.
- **Package manager:** npm. **Commits:** conventional style, one per task minimum.

New for M4:

- **The blocked-item convention (§11) applies to two new files.** `content/quiz.ts` and `content/mock/galleries.ts` ship complete and functional with provisional content, each carrying the exact header-comment convention already used in `lib/orders/statuses.ts`: `PROVISIONAL — ... pending Vivimoon's ... (spec §11). Owner: Vivimoon.` Filling in real content later is a data edit in that one file, not a code change.
- **`discovery` is a resource key that already exists and has never been used.** `lib/api/config.ts` has carried `'discovery'` in `RESOURCES` and `discovery: ['catalog']` in `DEPENDS_ON` since M1. Comparison and Quiz are the first features to actually create `lib/api/resources/discovery/`. Do not invent a new config mechanism — `resolveMode('discovery')` already works.
- **The comparison endpoint's schema lives in `catalog.ts`, but its resource key is `discovery`.** Spec §4 lists `POST /api/products/compare` under the **Catalog** schema file, but spec §5's migration groups classify comparison under **Group C (discovery)** alongside the quiz, because both are derived/recommendation-shaped reads that depend on catalog rather than being catalog data themselves. Preserve this split: `comparisonMatrixSchema`/`ComparisonMatrix` type in `lib/api/schemas/catalog.ts`; the route handler and its resource module resolve `resolveMode('discovery')`.
- **`useCompareStore` mirrors `useCartStore`'s persistence shape** (`localStorage`, zustand `persist`, `skipHydration: true`) per spec §8's precedent for client-global state — a fourth store, but it follows the same rule §8 already established: client-global, guest-friendly, not server data.
- **The comparison matrix renders in a `Dialog`, not a route.** No `/compare` page. `components/ui/dialog.tsx` already exists (scaffolded in M1, unused until now); this is its first real consumer.

---

## Scope note: the §6/§10 eyeEnlargement conflict

Spec §6 states "`ProductSpecs` are unchanged." Spec §10 states "`eyeEnlargement` is a new derived field on `ProductSpecs`." These two sentences contradict each other as written.

Resolution: `eyeEnlargement` is **computed, not stored.** `ProductSpecs`'s schema is genuinely unchanged, keeping §6 true. `lib/products/eye-enlargement.ts` exports a pure function, `eyeEnlargementBand(diameter: string): EyeEnlargementBand`, called only at the point of use — inside the comparison-matrix builder in `lib/api/resources/discovery/mock.ts`. `ComparisonMatrix` (not `Product`) is where the derived band actually appears. This keeps the bands "adjustable in that one file" exactly as §10 promises, without a schema migration or a stored field that drifts from its own derivation.

Do not "resolve" this by adding `eyeEnlargement` to `productSpecsSchema` — that reintroduces the contradiction and makes the band a stale cached value instead of always-fresh.

---

## File Structure

**Created**

```
lib/products/eye-enlargement.ts            # diameter -> band; PROVISIONAL bands (§10)
lib/products/eye-enlargement.test.ts
lib/products/quiz-scoring.ts                # tag-weight scoring, pure function
lib/products/quiz-scoring.test.ts
lib/api/schemas/discovery.ts                # QuizDefinition, QuizAnswer, quiz submit response
lib/api/schemas/discovery.test.ts
lib/api/resources/discovery/{index.ts,mock.ts,mock.test.ts}
app/api/products/compare/route.ts
app/api/products/compare/route.test.ts
app/api/products/[slug]/gallery/route.ts
app/api/products/[slug]/gallery/route.test.ts
app/api/quiz/route.ts
app/api/quiz/submit/route.ts
app/api/quiz/quiz-routes.test.ts
content/mock/galleries.ts                   # PROVISIONAL — 2-3 products fully populated, rest absent
content/quiz.ts                             # PROVISIONAL — 6 questions, tag weights (§11)
features/compare/compare-store.ts           # useCompareStore, mirrors cart-store.ts
features/compare/compare-store.test.ts
components/commerce/review-source-badge.tsx
components/commerce/compare-toggle.tsx
components/commerce/comparison-tray.tsx
components/commerce/comparison-dialog.tsx
components/commerce/lens-viewer.tsx
app/[locale]/quiz/page.tsx
app/[locale]/quiz/quiz-flow.tsx             # client step-wizard
```

**Modified**

```
lib/api/schemas/catalog.ts                 # + lensGallerySchema/LensGallery, comparisonMatrixSchema/ComparisonMatrix
lib/api/resources/catalog/mock.ts          # + getGallery(productId)
content/mock/index.ts                      # + galleries
components/commerce/reviews-list.tsx       # + source badge/link (§10)
components/commerce/product-card.tsx       # + CompareToggle
app/[locale]/product/[slug]/page.tsx       # + LensViewer (falls back to ProductGallery), + CompareToggle
app/[locale]/layout.tsx                    # mount <ComparisonTray />
components/layout/header.tsx               # + Quiz nav entry
lib/i18n/dictionaries/{en,vi}.ts           # + compare, viewer, quiz copy; + review source labels
tests/contract/fixtures.test.ts            # + gallery + quiz-definition fixture conformance
```

**Unchanged**

`lib/api/config.ts` — the `discovery` key and its dependency on `catalog` already exist. `lib/products/rx-ranges.ts`, cart, checkout, orders — nothing in M4 touches purchasing.

---

## Task 1: Mirrored reviews — source badge

**Files:**
- Create: `components/commerce/review-source-badge.tsx`
- Modify: `components/commerce/reviews-list.tsx`, `lib/i18n/dictionaries/{en,vi}.ts`

**Interfaces:**
- Produces: `ReviewSourceBadge({ source, sourceUrl }: { source: ReviewSource; sourceUrl?: string })` — renders a small badge naming the origin (Shopee / TikTok / Vivimoon); when `sourceUrl` is present the badge is a link (`target="_blank" rel="noopener noreferrer"`) to the original listing, otherwise plain text (Vivimoon-native reviews have no `sourceUrl`).
- Reads: `Review.source`, `Review.sourceUrl` — already on the schema (`lib/api/schemas/catalog.ts`), nothing to add here.

**Reads:** spec §10 ("rendered with a source badge linking to the original Shopee/TikTok listing. No authoring UI.")

This is the smallest task in M4 — the data model, the endpoint, and the mock fixtures already exist (verified: `reviewSchema` has `source`/`sourceUrl`, `content/mock/reviews.ts` and `app/api/products/[slug]/reviews/route.ts` are already in place). The only gap is that `ReviewsList` renders `author`/`rating`/`title`/`body` but never `source`.

- [ ] **Step 1: Write the failing badge test**

`components/commerce/review-source-badge.test.tsx`: renders `shopee`/`tiktok` with a `sourceUrl` as a link with the right `href`; renders `vivimoon` (no `sourceUrl`) as plain text, no link.

- [ ] **Step 2: Write `review-source-badge.tsx`**

Small, presentational, no fetching (constraint above). Reuse existing badge/pill styling already used for `product.badges` on `ProductCard` rather than inventing new badge CSS.

- [ ] **Step 3: Wire it into `ReviewsList`**

Add next to the existing `createdAt` line in each review `<article>`. Add `dict.pdp.reviewSource.{shopee,tiktok,vivimoon}` labels to both dictionaries.

- [ ] **Step 4: Verify and commit**

`npx vitest run components/commerce/review-source-badge.test.tsx components/commerce/reviews-list.test.tsx` → PASS (extend the existing `reviews-list.test.tsx` if one exists; create it if not, asserting the badge renders per review).

```bash
git add components/commerce/review-source-badge.tsx components/commerce/reviews-list.tsx lib/i18n/dictionaries
git commit -m "feat: show review source badge on mirrored reviews"
```

---

## Task 2: Comparison — eye-enlargement banding, schemas, discovery resource

**Files:**
- Create: `lib/products/eye-enlargement.ts`, `.test.ts`
- Modify: `lib/api/schemas/catalog.ts`
- Create: `lib/api/resources/discovery/{index.ts,mock.ts,mock.test.ts}`
- Create: `app/api/products/compare/route.ts`, `.test.ts`

**Interfaces:**
- Produces: `eyeEnlargementBand(diameter: string): 'natural' | 'subtle' | 'noticeable' | 'dramatic'` — parses a `"14.2mm"`-shaped string (verified against `content/mock/products.ts` fixtures) and bands per §10: `natural` < 14.0mm, `subtle` 14.0–14.2, `noticeable` 14.3–14.5, `dramatic` > 14.5.
- Produces: `comparisonMatrixSchema`/`ComparisonMatrix` in `catalog.ts` — `{ products: ComparisonRow[] }`, each row `{ id, slug, name, image, color?, diameter, eyeEnlargement, lifespan, price, currency }`.
- Produces: `discovery.compare(productIds: string[]): Promise<ComparisonMatrix>` on the new resource, internally calling `catalog.getProductsByIds()` (already exists — verified in `lib/api/resources/catalog/mock.ts`), same cross-resource-read pattern M2's `pricing/mock.ts` already uses against `catalog.getVariantById()`.
- `lifespan` maps to the existing `Product.replacement` field (`daily`/`biweekly`/`monthly`) — there is no separate lifespan field to add; the comparison note in §10 names an existing value under a shopper-facing label.

**Reads:** spec §10 (Comparison), §6 (eyeEnlargement conflict — see Scope note above), §4 (endpoint under Catalog schema), §5 (Group C — discovery depends on catalog).

- [ ] **Step 1: Write the failing banding test**

`lib/products/eye-enlargement.test.ts` — the four boundary cases from §10 exactly: `13.9mm` → `natural`, `14.0mm`/`14.2mm` → `subtle`, `14.3mm`/`14.5mm` → `noticeable`, `14.6mm` → `dramatic`. Assert the boundaries are inclusive/exclusive exactly as spec'd (`< 14.0`, `14.0–14.2`, `14.3–14.5`, `> 14.5` — note the gap at exactly `14.5` belongs to `noticeable`, not `dramatic`).

- [ ] **Step 2: Write `eye-enlargement.ts`**

Header comment: PROVISIONAL bands, Vivimoon-adjustable, per spec §10 — same convention as `lib/orders/statuses.ts`. Parse with `parseFloat`, strip the `mm` suffix; throw (don't silently default) on an unparseable diameter — a bad fixture should fail loudly in `tests/contract/fixtures.test.ts`, not render a wrong band.

- [ ] **Step 3: Add `comparisonMatrixSchema` to `catalog.ts`**

Do **not** touch `productSpecsSchema` — see Scope note. `ComparisonRow.eyeEnlargement` is the only place the band appears.

- [ ] **Step 4: Write the failing discovery resource test**

`lib/api/resources/discovery/mock.test.ts`: `compare(['id-a','id-b'])` returns rows in the order the ids were given (not catalog order), each row's `eyeEnlargement` matches `eyeEnlargementBand(product.specs.diameter)`, an unknown id is silently dropped (not an error) — comparison should degrade gracefully if a shopper's tray references a product that left the catalog, same posture as Favorites (§10, M3 precedent).

- [ ] **Step 5: Write `lib/api/resources/discovery/{mock.ts,index.ts}`**

`index.ts` mirrors `catalog/index.ts` exactly: `resolveMode('discovery') === 'mock' ? mockDiscovery : throw(...)`.

- [ ] **Step 6: Write the compare route**

`app/api/products/compare/route.ts` — `POST`, body `{ productIds: string[] }` validated against a request schema (max 4 — enforce server-side too, not just in `useCompareStore`), delegates to `discovery.compare()`, wraps in `apiOk`/`apiFail`.

- [ ] **Step 7: Verify and commit**

```bash
npx vitest run lib/products/eye-enlargement.test.ts lib/api/resources/discovery app/api/products/compare
npx tsc --noEmit
git add lib/products/eye-enlargement.ts lib/products/eye-enlargement.test.ts lib/api/schemas/catalog.ts lib/api/resources/discovery app/api/products/compare
git commit -m "feat: comparison matrix schema, eye-enlargement banding, discovery resource"
```

---

## Task 3: Comparison — store, toggle, persistent tray

**Files:**
- Create: `features/compare/compare-store.ts`, `.test.ts`
- Create: `components/commerce/compare-toggle.tsx`, `components/commerce/comparison-tray.tsx`
- Modify: `components/commerce/product-card.tsx`, `app/[locale]/product/[slug]/page.tsx`, `app/[locale]/layout.tsx`

**Interfaces:**
- Produces: `useCompareStore` — `{ productIds: string[]; add(id): void; remove(id): void; clear(): void }`. Capped at 4; `add()` past the cap is a no-op (surface a toast/disabled state in the UI, don't silently evict the oldest — that would surprise a shopper who didn't ask to remove anything). De-duped by product id (comparison operates on whole products, unlike cart lines which key on `variantId + rx`).
- Produces: `<CompareToggle productId>` — a small icon/checkbox control, used identically on `ProductCard` (PLP) and the PDP.
- Produces: `<ComparisonTray>` — reads `useCompareStore`, renders nothing when `productIds.length === 0`, otherwise a persistent bottom strip with thumbnails + a "Compare" button (opens the Task 4 Dialog) + individual remove + clear-all.

**Reads:** spec §8 (state management precedent), §10 ("a persistent tray accumulates selections across pages"), Q5/Q6 from the 2026-09-03 design session (PLP + PDP entry points; tray is the accumulator, separate from the Dialog).

- [ ] **Step 1: Write the failing store test**

`features/compare/compare-store.test.ts`: `add()` up to 4 succeeds; a 5th `add()` is a no-op and `productIds.length` stays 4; `add()` of an already-present id is a no-op (no duplicate); `remove()`/`clear()`; persists to `localStorage` under a distinct key (e.g. `vivimoon-compare`, not `vivimoon-cart`); `skipHydration: true` + explicit `rehydrate()`, same as `useCartStore`.

- [ ] **Step 2: Write `compare-store.ts`**

Structurally mirrors `features/cart/cart-store.ts` (already read in full) — same `persist`/`createJSONStorage`/`skipHydration` shape, but the reducer logic is a plain array cap-and-dedupe, no `cartReducer`-style line merging needed (no line identity concept here).

- [ ] **Step 3: Write `CompareToggle` and wire it into `ProductCard` and the PDP**

`ProductCard` is currently a plain server-renderable component with no client state (verified — no `'use client'`). `CompareToggle` must be its own small client island inside it, not a `'use client'` conversion of the whole card, so the PLP grid stays server-rendered.

- [ ] **Step 4: Write `ComparisonTray` and mount it in the locale layout**

Mount once in `app/[locale]/layout.tsx` so it's genuinely persistent "across pages" — not per-page. `position: fixed; bottom` strip, respects safe-area on mobile.

- [ ] **Step 5: Verify and commit**

```bash
npx vitest run features/compare
npx tsc --noEmit
git add features/compare components/commerce/compare-toggle.tsx components/commerce/comparison-tray.tsx components/commerce/product-card.tsx app/[locale]/product/[slug]/page.tsx app/[locale]/layout.tsx
git commit -m "feat: compare store, toggle, and persistent comparison tray"
```

---

## Task 4: Comparison — matrix Dialog

**Files:**
- Create: `components/commerce/comparison-dialog.tsx`
- Modify: `components/commerce/comparison-tray.tsx` (wires the "Compare" button to open it)
- Modify: `lib/i18n/dictionaries/{en,vi}.ts`

**Interfaces:**
- Produces: `<ComparisonDialog open, onOpenChange, productIds>` — on open, calls `POST /api/products/compare` through `lib/api/client.ts` (client-side fetch, per the constraint that `components/` never fetches — this call lives in the tray/feature layer, `ComparisonDialog` itself takes the resolved `ComparisonMatrix` as a prop, loading/error state owned by the tray).
- Built on `components/ui/dialog.tsx` (existing, first real consumer), sized wide (`max-w-4xl` or wider) with `overflow-x-auto` on the row/column grid for narrow viewports (per Q6: horizontal scroll on mobile, not a route).

**Reads:** Q6 from the 2026-09-03 design session (Dialog, not Sheet, not a route — a 4-column table needs width a side panel doesn't have).

- [ ] **Step 1: Write the failing dialog test**

`comparison-dialog.test.tsx` (RTL): given a `ComparisonMatrix` prop, renders one column per product with color/diameter/eye-enlargement band/lifespan/price rows; renders a loading state and an error state as separate stories/cases driven by props, not by mocking fetch inside the component test (fetch is not the component's job).

- [ ] **Step 2: Write `ComparisonDialog`**

Pure presentational component over the matrix data — no store reads, no fetch, per the constraint above. Column header includes each product's image/name linking to its PDP and a per-column remove (calls back up to `useCompareStore.remove`).

- [ ] **Step 3: Wire the fetch into `ComparisonTray`**

On "Compare" click: `setOpen(true)`, fetch the matrix for the current `productIds`, hold it in local state, pass to `ComparisonDialog`. Re-fetch if `productIds` changes while open (a shopper removing a column should update the matrix, not just hide a column client-side against stale data).

- [ ] **Step 4: Verify and commit**

```bash
npx vitest run components/commerce/comparison-dialog.test.tsx
git add components/commerce/comparison-dialog.tsx components/commerce/comparison-tray.tsx lib/i18n/dictionaries
git commit -m "feat: comparison matrix dialog"
```

---

## Task 5: Lens Viewer — schema, mock galleries, gallery endpoint

**Files:**
- Modify: `lib/api/schemas/catalog.ts`, `lib/api/resources/catalog/mock.ts`, `content/mock/index.ts`, `tests/contract/fixtures.test.ts`
- Create: `content/mock/galleries.ts`
- Create: `app/api/products/[slug]/gallery/route.ts`, `.test.ts`

**Interfaces:**
- Produces: `lensGallerySchema`/`LensGallery` in `catalog.ts` — `{ productId; contexts: { eye: Image[]; face: Image[]; withMakeup: Image[]; withoutMakeup: Image[]; byEyeColor: Record<string, Image[]> } }`, `Image = string` (URL, matching how `Product.images` is already typed).
- Produces: `catalog.getGallery(productId): Promise<LensGallery | null>` — `null` when the product has no gallery entry, which is the fallback signal the PDP (Task 6) branches on.
- Produces: `content/mock/galleries.ts` — PROVISIONAL, populated for **2–3 demo products only**, built by cycling each product's existing `images[]` across the five contexts (there is no real per-context photography yet — this is placeholder, not new asset creation). Every other product has no entry.

**Reads:** spec §10 (Lens viewer feature note), §11 (Lens viewer row — "viewer + categorization schema" ships now, "the photo library" is Vivimoon's), §6 (`LensGallery` interface), Q10 from the design session (partial coverage is deliberate, to exercise the fallback path).

- [ ] **Step 1: Write the failing schema + fixture test**

`lib/api/schemas/catalog.test.ts` (extend or create): a gallery fixture with all five context keys populated round-trips through `lensGallerySchema`; `byEyeColor` accepts an arbitrary string-keyed record.

- [ ] **Step 2: Add the schema, write `galleries.ts`**

Header comment: PROVISIONAL, real photo library pending Vivimoon (spec §11), owner Vivimoon, same convention as `lib/orders/statuses.ts`. Pick 2–3 products from `content/mock/products.ts` that have at least 3–4 `images[]` entries to cycle from, so the demo tabs don't all show one repeated photo.

- [ ] **Step 3: Add `getGallery()` to the catalog mock resource**

`return galleries.find((g) => g.productId === productId) ?? null;` — same "find-or-null" shape as `getProductBySlug`, already the established convention in `lib/api/resources/catalog/mock.ts`.

- [ ] **Step 4: Write the gallery route**

`app/api/products/[slug]/gallery/route.ts` — same shape as the existing `.../reviews/route.ts` (resolve product by slug first, 404 via `apiFail('not_found', ...)` if the product itself doesn't exist; a product that exists but has no gallery returns `apiOk(null)`, not a 404 — no gallery is an expected, common state, not an error).

- [ ] **Step 5: Add contract conformance**

`tests/contract/fixtures.test.ts` — every entry in `galleries` satisfies `lensGallerySchema`. Do not assert every product has a gallery entry — partial coverage is the point (Q10).

- [ ] **Step 6: Verify and commit**

```bash
npx vitest run lib/api/schemas/catalog.test.ts app/api/products
npx vitest run tests/contract
git add lib/api/schemas/catalog.ts lib/api/resources/catalog/mock.ts content/mock app/api/products/[slug]/gallery tests/contract/fixtures.test.ts
git commit -m "feat: lens gallery schema, provisional mock galleries, gallery endpoint"
```

---

## Task 6: Lens Viewer — tabbed component, PDP wiring, fallback

**Files:**
- Create: `components/commerce/lens-viewer.tsx`
- Modify: `app/[locale]/product/[slug]/page.tsx`, `lib/i18n/dictionaries/{en,vi}.ts`

**Interfaces:**
- Produces: `<LensViewer gallery, alt>` — tabs: eye / face / with makeup / without makeup / by natural eye color (the last tab itself sub-selects an eye color, since `byEyeColor` is keyed). Each tab reuses `ProductGallery`'s existing thumbnail-strip-plus-active-image layout for the images within that context, rather than inventing a second image-browsing interaction.
- The PDP decides which to render: `const gallery = await catalog.getGallery(product.id); return gallery ? <LensViewer gallery={gallery} alt={product.name} /> : <ProductGallery images={product.images} alt={product.name} />;` — this is the fallback from §10, and it's a Server Component read (catalog is read-only data, direct resource import per the M1 constraint — no route-handler mutation involved).

**Reads:** spec §10 ("Falls back to the standard `ProductGallery` when a product has no gallery entry, so partial photo coverage degrades gracefully rather than breaking the PDP.")

- [ ] **Step 1: Write the failing viewer test**

`lens-viewer.test.tsx`: five tabs render with the right labels; switching tabs swaps the active image set; the `byEyeColor` tab renders a secondary eye-color selector and swaps images on that selection; a context with an empty array renders that tab disabled rather than a broken empty gallery (mock galleries always populate all five contexts per Task 5, but the component itself should not assume that forever).

- [ ] **Step 2: Write `LensViewer`**

Client component (tab state) — takes the already-fetched `gallery` as a prop, no fetching inside it, per the standing constraint.

- [ ] **Step 3: Wire the PDP fallback**

Exactly the ternary above. Verify manually (or via a component test with two fixtures) that a demo product with a gallery entry shows `LensViewer` and every other product still shows the plain `ProductGallery` unchanged — the fallback must be silent, no "no gallery available" message, since partial coverage is the expected steady state, not an error condition.

- [ ] **Step 4: Copy and verify**

Add `dict.viewer.{eye,face,withMakeup,withoutMakeup,byEyeColor}` tab labels to both dictionaries.

```bash
npx vitest run components/commerce/lens-viewer.test.tsx
npx tsc --noEmit
git add components/commerce/lens-viewer.tsx "app/[locale]/product/[slug]/page.tsx" lib/i18n/dictionaries
git commit -m "feat: multi-context lens viewer with gallery fallback"
```

---

## Task 7: Quiz — schema, provisional content, scoring, routes

**Files:**
- Create: `lib/api/schemas/discovery.ts`, `.test.ts`
- Create: `content/quiz.ts`
- Create: `lib/products/quiz-scoring.ts`, `.test.ts`
- Modify: `lib/api/resources/discovery/mock.ts` (add quiz methods alongside Task 2's `compare()`)
- Create: `app/api/quiz/route.ts`, `app/api/quiz/submit/route.ts`, `app/api/quiz/quiz-routes.test.ts`
- Modify: `tests/contract/fixtures.test.ts`

**Interfaces:**
- Produces: `quizDefinitionSchema`/`QuizDefinition` — `{ questions: QuizQuestion[] }`, `QuizQuestion = { id; prompt; options: { id; label; tags: Record<string, number> }[] }` — each option carries tag weights (§11: "tag-weight scoring").
- Produces: `quizSubmitRequestSchema` — `{ answers: { questionId; optionId }[] }`; response `{ recommendations: Product[] }`.
- Produces: `content/quiz.ts` — PROVISIONAL, 6 questions (spec §11's number), header comment naming Vivimoon as owner of the real question set and weights, same convention as `lib/orders/statuses.ts`. Tags should draw from fields that already exist on `Product` (`type`, `replacement`, `badges`) so scoring against the real catalog is meaningful even with placeholder questions — e.g. a question about daily activity level weighting `replacement: 'daily'` vs `'monthly'`, a question about look preference weighting `type: 'colored'` vs `'clear'`.
- Produces: `scoreQuiz(answers, questions, products): Product[]` in `lib/products/quiz-scoring.ts` — sums the tag weights of each chosen option, scores each product by matching its own derived tags (type/replacement/badges) against the accumulated weights, returns products sorted descending, capped (e.g. top 6) — a pure function, independently testable without going through the route, same "logic lives outside the resource, resource just calls it" shape as `eyeEnlargementBand`.

**Reads:** spec §4 (Discovery schema endpoints), §11 (Quiz row — "6 provisional questions, tag-weight scoring", lands in `content/quiz.ts`), §13.

- [ ] **Step 1: Write the failing scoring test**

`lib/products/quiz-scoring.test.ts`: a set of answers whose weights clearly favor `type: 'colored'` products ranks every colored product above every clear product in the fixture catalog; an empty `answers[]` still returns a result (don't throw, don't return empty — degrade to some deterministic default ordering, e.g. by `reviewCount`, so the UI never shows a blank results screen); the result never exceeds the cap regardless of catalog size.

- [ ] **Step 2: Write `quiz-scoring.ts`**

Pure function, no I/O — takes `products: Product[]` as a parameter rather than importing `content/mock` directly, so it stays testable against a small fixture list independent of the real catalog size.

- [ ] **Step 3: Write `discovery.ts` schemas + `content/quiz.ts`**

Write the 6 placeholder questions per the guidance above. Validate `content/quiz.ts` against `quizDefinitionSchema` in a contract test (Step 6).

- [ ] **Step 4: Add quiz methods to the discovery mock resource**

`getQuizDefinition()` returns `content/quiz.ts` as-is. `submitQuiz(answers)` validates the answers reference real question/option ids (reject otherwise — this is a case where invalid input should error, unlike the compare id case in Task 2 which drops unknowns silently: a bad quiz answer is a client bug, a stale compare id is an expected, common state), then calls `scoreQuiz()` against `catalog.listProducts()`.

- [ ] **Step 5: Write the two routes**

`GET /api/quiz` → `discovery.getQuizDefinition()`. `POST /api/quiz/submit` → validates the body against `quizSubmitRequestSchema`, calls `discovery.submitQuiz()`.

- [ ] **Step 6: Contract conformance and verify**

`content/quiz.ts` validates against `quizDefinitionSchema` in `tests/contract/fixtures.test.ts`.

```bash
npx vitest run lib/products/quiz-scoring.test.ts lib/api/schemas/discovery.test.ts app/api/quiz
npx vitest run tests/contract
git add lib/api/schemas/discovery.ts content/quiz.ts lib/products/quiz-scoring.ts lib/api/resources/discovery/mock.ts app/api/quiz tests/contract/fixtures.test.ts
git commit -m "feat: quiz schema, provisional question set, tag-weight scoring, routes"
```

---

## Task 8: Quiz — step-wizard UI, `/quiz` route, results

**Files:**
- Create: `app/[locale]/quiz/page.tsx`, `app/[locale]/quiz/quiz-flow.tsx`
- Modify: `components/layout/header.tsx`, `lib/i18n/dictionaries/{en,vi}.ts`

**Interfaces:**
- `app/[locale]/quiz/page.tsx` — Server Component, fetches `QuizDefinition` via `discovery.getQuizDefinition()` directly (read-only catalog-adjacent data, same direct-import rule as the gallery), passes it to `<QuizFlow definition={...} locale={...} />`.
- `<QuizFlow>` — client step-wizard, one question per screen, progress indicator, back/next, mirrors the "render only the current step" shape `RxSelector` already established in this codebase (`components/commerce/rx-selector.tsx`) rather than inventing a new wizard pattern. On the final step, `POST /api/quiz/submit` through `lib/api/client.ts`, then renders recommendations using the **existing** product grid/card components (`ProductCard` from Task 3, already compare-aware — no new results-specific card).

**Reads:** Q7/Q8/Q9 from the 2026-09-03 design session (step wizard, dedicated `/quiz` route + nav entry, results reuse the existing grid).

- [ ] **Step 1: Write the failing quiz-flow test**

`quiz-flow.test.tsx` (RTL, real interaction via `userEvent`, not mocked handlers — matching M2's stated testing posture): stepping through all 6 questions advances the progress indicator each time; back returns to the previous answer already selected; submitting the last question fires the submit call and renders recommendations; an unanswered question blocks "next" (a quiz question needs an answer to score meaningfully — this is a real validation, not decoration).

- [ ] **Step 2: Write `QuizFlow`**

Step state as a simple index + an in-memory answers map, no persistence needed (unlike cart/compare, quiz progress does not need to survive a reload — spec never asks for that, and adding it would be scope creep with nothing asking for it).

- [ ] **Step 3: Write `app/[locale]/quiz/page.tsx`, add the nav entry**

Add a "Quiz" link to `components/layout/header.tsx`'s nav alongside the existing collection links.

- [ ] **Step 4: Copy**

`dict.quiz.{title,next,back,submit,resultsTitle,retake,unanswered}` in both dictionaries.

- [ ] **Step 5: Verify and commit**

```bash
npx vitest run "app/[locale]/quiz"
npx tsc --noEmit
git add "app/[locale]/quiz" components/layout/header.tsx lib/i18n/dictionaries
git commit -m "feat: quiz step-wizard page and results"
```

---

## Task 9: M4 verification

- [x] **Step 1: Gates**

```bash
npx tsc --noEmit
npm run lint
npx vitest run
npm run test:contract
npm run build
```

- [x] **Step 2: Constraint greps**

```bash
grep -rn "productSpecsSchema" lib/api/schemas/catalog.ts   # confirm eyeEnlargement was NOT added to it — Scope note
grep -rln "fetch(" components/                              # none — components/ still never fetches
grep -rn "gtag(" app components features                    # none, unchanged from M1/M2
```

- [x] **Step 3: End-to-end, in a browser, both locales**

PLP: add 2 products to compare from cards, add a 3rd from a PDP → tray persists across a page navigation → open the matrix Dialog → remove one → matrix updates. PDP: a demo product with a gallery entry shows the tabbed viewer with all 5 contexts; a product without one shows the plain gallery, unchanged. Reviews: a Shopee-sourced review shows its badge and links out; a Vivimoon-native one shows no link. Quiz: `/quiz` → step through all 6 questions → results render using the standard product grid → retake works.

- [x] **Step 4: Update the ledger**

Append the M4 outcome to `docs/legacy/superpowers-sdd-progress.md`, then `graphify update .` per `CLAUDE.md`.

---

## M4 Definition of Done

- [x] Every mirrored review shows a source badge; Shopee/TikTok badges link to `sourceUrl`, Vivimoon-native reviews don't.
- [x] `useCompareStore` holds up to 4 product ids, persisted, capped (no silent eviction past 4).
- [x] The persistent Comparison Tray survives page navigation and is mounted once, globally.
- [x] The comparison matrix opens in a `Dialog`, not a route; `/compare` does not exist as a page.
- [x] `eyeEnlargement` appears only on `ComparisonMatrix` rows, never stored on `ProductSpecs`.
- [x] 2–3 demo products render the tabbed Lens Viewer; every other product falls back to the standard `ProductGallery` with no error state.
- [x] `/quiz` runs a 6-question step wizard end to end and renders recommendations through the existing product grid.
- [x] `content/quiz.ts` and `content/mock/galleries.ts` each carry a PROVISIONAL header naming Vivimoon as the owner of the real content.
- [x] Both `en` and `vi` render every new screen with no hardcoded strings.
- [x] `npm run build` succeeds.

## What M4 deliberately does not do

- **No real photo library.** Assets pending (§11) — only 2–3 demo products get placeholder galleries, by design, to exercise the fallback path rather than fake full coverage.
- **No real quiz question set or weights.** Content pending (§11) — 6 placeholder questions scored against existing product fields (`type`/`replacement`/`badges`), isolated in `content/quiz.ts`.
- **No Favorites-page compare entry point.** PLP + PDP only (Q5) — a third entry point is additive later, not a restructure.
- **No quiz-progress persistence.** Not asked for; a reload restarts the quiz.
- **No `upstream.ts` for the new `discovery` resource or the extended `catalog` gallery method.** Same M1/M2 reasoning — those arrive at cutover; the conformance harness already makes cutover verifiable.
- **No toric, no COD.** Still out of scope, carried over from M2 §15 — unrelated to Discovery but restated since nothing in M4 revisits either.
