# Vivimoon M2 — Purchase Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Take a shopper from "choose a prescription" to "order placed." The cart moves off React Context onto zustand, line identity widens from `variantId` to `variantId + Rx`, and every currency figure becomes server-owned.

**Architecture:** M1's proxy seam is unchanged and is reused verbatim — new modules (`pricing`, `shipping`, `payments`, `orders`) drop into `lib/api/resources/<name>/{index,mock}.ts` behind the same `resolveMode()` config — all four resolve the **existing** `commerce` resource, exactly as `account/` and `auth/` both resolve `identity`, and their route handlers wrap the same `apiOk`/`apiFail` envelope. Nothing in M2 introduces a second seam.

**Tech Stack:** Next.js 16.3.1 App Router (note: `proxy.ts`, not `middleware.ts`), React 19, TypeScript strict, zod 3.25, zustand 5, Vitest + React Testing Library.

**Spec:** [`../specs/2026-08-27-vivimoon-client-scope-design.md`](../specs/2026-08-27-vivimoon-client-scope-design.md) — §6 (Rx ranges), §7 (cart/Rx/line identity), §8 (state), §11 (blocked items), §15 (decisions).

**Depends on:** M1 complete (all 13 tasks, `2026-08-27-vivimoon-m1-foundation.md`).

---

## Global Constraints

M1's Global Constraints all still apply. Read them. Three are **amended or added** for M2:

- **AMENDED — Server Components and mutable state.** M1 said "Server Components import `lib/api/resources/*` directly; never `fetch()` our own `/api/*`." That holds for **read-only catalog data**. It is **wrong for anything a Route Handler mutates**. M1 Task 13 established empirically that this Next.js compiles Route Handlers and Server Component pages into **separate module instances**, so an in-memory mock store mutated by `PATCH /api/account` is invisible to a direct resource import from a page. Therefore: **any page reading state that a route handler writes — cart pricing, orders, payment intents — must fetch its own `/api/*` endpoint** via `headers()`/`cookies()`, exactly as `app/[locale]/account/page.tsx` does. Copy that page's pattern; do not re-derive it. This is a mock-mode artifact that disappears at proxy cutover, and it costs one HTTP hop in dev.
- **AMENDED — `middleware.ts` is `proxy.ts`.** This Next.js version deprecated and renamed the convention. The file exports `proxy`, not `middleware`. Spec §9 and §14 still say `middleware.ts`; the code is correct, the spec text is legacy.
- **NEW — the client never computes money.** No `unitPrice * quantity` anywhere in `app/`, `components/`, or `features/` after Task 7. `cartSubtotal` is deleted. Every figure a shopper sees comes from `POST /api/cart/price`. A reviewer should be able to `grep -rnE "(unitPrice|price) \*" app components features` and get exactly one hit: the GA4 `add_to_cart` `value` in `components/commerce/add-to-cart.tsx`, which is a sanctioned analytics snapshot (GA4 requires a `value` at add time, before any server price exists) and is annotated inline as such. Nothing that a shopper *sees* is computed on the client.
- **NEW — pricing is a client call, and the cart page has no server-fetched price.** The amendment above does *not* extend to the cart. The cart lives in `localStorage` behind zustand `persist` with `skipHydration: true`, so it is unreadable until a client effect calls `rehydrate()` — there is no cart cookie and no server-side cart, and a Server Component therefore has **nothing to post** to `/api/cart/price`. All pricing calls are client-side, after rehydration, through `lib/api/client.ts`. The cart page renders a pending state until rehydrate and the first price resolve, which is the same state a reload needs anyway.
- **NEW — `components/` still never fetches.** Unchanged from M1. The *feature* layer (`features/cart/`) owns the pricing calls, exactly as M1's client components already call `lib/api/client.ts`; components under `components/` stay pure and take props.
- **NEW — no toric.** Per spec §15 (resolved 2026-08-30), `cyl` and `axis` ship as **optional fields present in the schema and the range table but rendered by no selector**. See Task 1 for why they must exist in the type from day one.

---

## Scope note: why `cyl`/`axis` exist in the schema but not the UI

The user deferred toric past M2. The naive reading is "leave both fields out entirely." That is the expensive choice, because `lineKey` — the hash that decides whether two cart lines are the same line — is derived from the Rx object. If `cyl`/`axis` join that object later, **every persisted cart in every shopper's `localStorage` changes key**, and the store needs a migration.

So M2 defines the full Rx type *including* optional `cyl`/`axis`, normalises them in `lineKey` (absent and `undefined` and `null` all hash identically), and simply renders no control for them. Enabling toric later is then: add two selector controls, flip a validation branch, populate the fields. No cart migration, no re-keying, no `persist` version bump.

This is the whole reason the deferral is cheap. Do not "simplify" it away.

---

## File Structure

**Created**

```
lib/products/rx-ranges.ts              # §6 table as data; per-product overridable
lib/products/rx-ranges.test.ts
lib/cart/line-key.ts                   # normalise Rx -> stable lineKey
lib/cart/line-key.test.ts
lib/payments/methods.ts                # QR Pay | ZaloPay | SePay (§15: these three only)
lib/api/schemas/
  rx.ts                                # RxEye, Rx, per-lens-type validation
  cart.ts                              # CartLine, CartState, PriceRequest, PriceResult
  checkout.ts                          # VN address, checkout payload
  orders.ts                            # Order, OrderLine, OrderStatus
lib/api/resources/
  pricing/{index.ts,mock.ts,mock.test.ts}
  shipping/{index.ts,mock.ts,mock.test.ts}
  payments/{index.ts,mock.ts,mock.test.ts}
  orders/{index.ts,mock.ts,mock.test.ts}
app/api/
  cart/price/route.ts
  shipping/quote/route.ts
  payments/intent/route.ts
  orders/route.ts
features/cart/cart-store.ts            # replaces cart-context.tsx
features/cart/cart-store.test.ts
features/cart/use-cart.ts              # rewritten over the store, same public shape
components/commerce/rx-selector.tsx
components/commerce/rx-summary.tsx     # renders an Rx compactly in cart/checkout lines
components/commerce/payment-method-picker.tsx
content/mock/vouchers.ts
content/mock/shipping-rates.ts
app/[locale]/checkout/success/page.tsx # if not already present from baseline
```

**Deleted**

```
features/cart/cart-context.tsx
features/cart/cart-storage.ts
features/cart/cart-storage.test.ts     # if present
```

**Modified**

```
features/cart/cart.types.ts            # becomes z.infer re-exports from schemas/cart.ts
features/cart/cart-reducer.ts          # keys on lineKey; cartSubtotal DELETED
features/cart/cart-reducer.test.ts     # + Rx line-identity cases
lib/checkout/schema.ts                 # city -> province/district/ward
lib/analytics/events.ts                # add_to_cart/purchase carry Rx-bearing items
lib/api/config.ts                      # UNCHANGED — pricing/shipping/payments/orders all resolve the existing `commerce` resource
lib/api/schemas/catalog.ts             # + lensType-driven Rx requirement on Variant
lib/i18n/dictionaries/{en,vi}.ts       # + Rx, checkout, payment, order copy
app/[locale]/product/[slug]/page.tsx   # + RxSelector, Buy Now
app/[locale]/cart/page.tsx             # server-priced
app/[locale]/checkout/page.tsx         # VN address, shipping, payment, placement
app/layout.tsx or app/[locale]/layout.tsx  # drop CartProvider
proxy.ts                               # guard /checkout logged-in variant
content/mock/index.ts                  # + vouchers, shipping rates
.env.example                           # UNCHANGED — API_MODE_COMMERCE already covers all four
tests/contract/fixtures.test.ts        # + voucher/shipping fixture conformance
```

---

## Task 1: Rx range table and Rx schemas

**Files:**
- Create: `lib/products/rx-ranges.ts`, `lib/products/rx-ranges.test.ts`, `lib/api/schemas/rx.ts`, `lib/api/schemas/rx.test.ts`
- Modify: `lib/api/schemas/catalog.ts`

**Interfaces:**
- Produces: `RX_RANGES` — the §6 table as data, with a header comment naming it provisional (per §11 convention)
- Produces: `sphSteps()`, `addBands`, `cylValues`, `axisSteps()` — generators, not hand-written arrays
- Produces: `rxEyeSchema`, `rxSchema`, `Rx` (parsed), `RxInput` (pre-parse), `RxEye`

> **`.default()` vs `z.infer` — M1 already lost time to this** (ledger, Task 2 plan defect #3: `Review.source` was described as "optional on input" but aliased with `z.infer`, the *output* type, where `.default()` makes it required). `sameBothEyes: z.boolean().default(false)` has the same shape. Export **both** `Rx` (`z.infer`, `sameBothEyes` required) and `RxInput` (`z.input`, optional), and be explicit about which side of the parse boundary each caller is on.
- Produces: `rxSchemaForLensType(lensType)` — the validation branch

**Reads:** spec §6 (Rx ranges table), §15 (toric deferral)

> **The step widens above -6.00.** Manufacturers do not make 0.25 increments in high powers. A generator that emits `-7.25` is a bug — it offers a lens nobody sells. `sphSteps()` must produce `-0.25 … -6.00` at `0.25`, then `-6.50 … -10.00` at `0.50`, and hyperopia `+0.25 … +6.00` at `0.25`, plus plano `0.00`.

> **ADD is banded, not numeric.** Contact multifocals ship LOW/MID/HIGH, unlike a spectacle prescription's numeric ADD. Do not model it as a number.

- [x] **Step 1: Write the failing range test**

Create `lib/products/rx-ranges.test.ts`. It must assert, at minimum:
- `sphSteps()` contains `0.00`, `-0.25`, `-6.00`, `-6.50`, `-10.00`, `+6.00`
- `sphSteps()` contains **no** value strictly between `-6.00` and `-10.00` that is off the `0.50` grid — in particular `expect(sphSteps()).not.toContain(-7.25)`
- `sphSteps()` is sorted and has no duplicates (the two myopia bands must not both emit `-6.00`)
- `addBands` deep-equals `['LOW', 'MID', 'HIGH']`
- `axisSteps()` is `[10, 20, … 180]` (18 entries)
- `cylValues` is `[-0.75, -1.25, -1.75, -2.25]` — **defined even though M2 renders no toric control**

Run: `npx vitest run lib/products/rx-ranges.test.ts` → FAIL on unresolved import.

- [x] **Step 2: Write `lib/products/rx-ranges.ts`**

Header comment must state: values are contact-lens industry standards, not Vivimoon-confirmed stock; owner is Vivimoon; narrowing is a data edit here with no selector changes (spec §11/§15).

Floating-point care: build steps from integers and divide (`i * 25 / 100`), never accumulate `+= 0.25`, or `-2.75` becomes `-2.7500000000000004` and every `lineKey` in Task 3 destabilises. Round every emitted value to 2 decimals.

- [x] **Step 3: Verify the range test passes**

Run: `npx vitest run lib/products/rx-ranges.test.ts` → PASS.

- [x] **Step 4: Write the failing Rx schema test**

Create `lib/api/schemas/rx.test.ts`:
- a `spherical` variant accepts `{ sph: -2.5 }` per eye and rejects `{ sph: -7.25 }` (off-grid)
- `sph: 0` (plano) is accepted — cosmetic lenses sold without correction
- a `multifocal` variant **requires** `add`, and rejects a numeric `add`
- a `spherical` variant **rejects** a supplied `add`
- `cyl`/`axis` are accepted when present and valid, and accepted when absent — **no lens type requires them in M2**
- `sameBothEyes: true` with only `right` supplied normalises `left` to equal `right`

Run → FAIL on unresolved import.

- [x] **Step 5: Write `lib/api/schemas/rx.ts`**

```ts
import { z } from 'zod';
import { sphSteps, addBands, cylValues, axisSteps } from '@/lib/products/rx-ranges';

export const rxEyeSchema = z.object({
  sph: z.number().refine((v) => sphSteps().includes(v), 'sph is not a stocked step'),
  /** Multifocal only. Banded LOW/MID/HIGH — contact multifocals are not numeric ADD. */
  add: z.enum(addBands).optional(),
  /** Toric. Deferred past M2 (spec §15) — validated if present, rendered by no
   *  selector yet. Present from day one so lineKey never has to change shape. */
  cyl: z.number().refine((v) => cylValues.includes(v), 'cyl is not a stocked value').optional(),
  axis: z.number().refine((v) => axisSteps().includes(v), 'axis must be a 10° step').optional(),
});

export const rxSchema = z.object({
  sameBothEyes: z.boolean().default(false),
  right: rxEyeSchema,
  left: rxEyeSchema,
});

export type RxEye = z.infer<typeof rxEyeSchema>;
/** Parsed/output shape: `sameBothEyes` is a REQUIRED boolean here, because
 *  `.default()` fills it on parse. */
export type Rx = z.infer<typeof rxSchema>;
/** Pre-parse/input shape: `sameBothEyes` is optional. This is what the selector
 *  builds and what `lineKey()` accepts. */
export type RxInput = z.input<typeof rxSchema>;
```

Then `rxSchemaForLensType(lensType)` narrows: `multifocal` makes `add` required on both eyes; every other type forbids `add`. **`cyl`/`axis` stay optional for all types in M2** — a toric product simply does not collect them yet.

- [x] **Step 6: Wire lens type onto the catalog schema**

In `lib/api/schemas/catalog.ts`, ensure `Product`/`Variant` expose the lens type the Rx branch keys on, and a `requiresRx: boolean` (cosmetic plano-only products do not prompt). Do **not** hand-write a duplicate interface — `lib/types/*` re-exports `z.infer<>` (M1 constraint).

- [x] **Step 7: Verify and commit**

Run: `npx vitest run lib/products lib/api/schemas/rx.test.ts` → PASS. `npx tsc --noEmit` → exit 0.

```bash
git add lib/products lib/api/schemas
git commit -m "feat: add Rx range table and prescription schemas"
```

---

## Task 2: Cart schemas and `lineKey`

**Files:**
- Create: `lib/cart/line-key.ts`, `lib/cart/line-key.test.ts`, `lib/api/schemas/cart.ts`
- Modify: `features/cart/cart.types.ts`

**Interfaces:**
- Produces: `lineKey(variantId, rx?: RxInput) => string`

> **`lineKey` takes `RxInput`, not `Rx`.** It sits on *both* sides of the parse boundary — the selector hands it an unparsed Rx, the store hands it one rehydrated from JSON. Taking the output type would force every pre-parse caller to invent a `sameBothEyes` value. Normalisation must therefore treat `sameBothEyes` absent and `false` as the **same hash**, alongside the `null`/`undefined` case below.
- Produces: `cartLineSchema`, `CartLine` — the M1 `CartLine` fields **plus** `rx?: Rx` and `lineKey: string`

> **This is the load-bearing task of M2.** Everything downstream — the reducer, the store, persistence, pricing, order lines — keys on this function's output. Get normalisation wrong and a shopper's cart silently splits or silently merges two different prescriptions into one line.

- [x] **Step 1: Write the failing test**

Create `lib/cart/line-key.test.ts`. Required cases:

```ts
// identity
same variantId, no rx            -> equal keys
same variantId, identical rx     -> equal keys
same variantId, sph -2.50 vs -3.00 -> DIFFERENT keys      // the core §7 requirement
different variantId, identical rx -> DIFFERENT keys

// normalisation — all of these must hash IDENTICALLY
{ sph: -2.5 }                    vs { sph: -2.5, cyl: undefined }
{ sph: -2.5, cyl: undefined }    vs { sph: -2.5, cyl: null }        // JSON round-trip yields null
{ sph: -2.5 }                    vs { sph: -2.50 }                  // numeric, not string
sameBothEyes absent              vs sameBothEyes: false             // .default() fills on parse only
key order { right, left }        vs { left, right }                 // object key order must not matter
sameBothEyes:true right-only     vs sameBothEyes:true both eyes equal

// stability
lineKey is stable across a JSON.parse(JSON.stringify(rx)) round-trip  // localStorage rehydration
lineKey contains no characters that break a React key or a URL param
```

The `null` vs `undefined` case is not hypothetical: the cart is persisted to `localStorage` as JSON, and `JSON.stringify` drops `undefined` keys while a server response may send `null`. If those hash differently, a cart line duplicates itself after a page reload.

Run → FAIL on unresolved import.

- [x] **Step 2: Write `lib/cart/line-key.ts`**

Normalise before hashing: drop keys whose value is `null`/`undefined`, round every number to 2 decimals, expand `sameBothEyes` to explicit both-eye values, then serialise with **sorted keys** (a plain `JSON.stringify` preserves insertion order — that is the object-key-order bug above). Hash or simply use the canonical string; a readable `variantId::{canonical}` is preferable to an opaque digest because it makes a wrong key obvious in DevTools and in a failing test diff.

- [x] **Step 3: Verify it passes**

Run: `npx vitest run lib/cart/line-key.test.ts` → PASS, all cases.

- [x] **Step 4: Write `lib/api/schemas/cart.ts` and re-point `cart.types.ts`**

`cartLineSchema` = the existing `CartLine` fields + `rx: rxSchema.optional()` + `lineKey: z.string()`. `features/cart/cart.types.ts` becomes `z.infer<>` re-exports (M1 constraint: schemas are the single source of truth). Keep `CartAction`, but **every action that identified a line by `variantId` now takes `lineKey`**.

- [x] **Step 5: Verify and commit**

`npx tsc --noEmit` → exit 0 (expect failures in `cart-reducer.ts`/`use-cart.ts` consumers — that is Task 3; if tsc must stay green per-commit, do Tasks 2 and 3 as one commit).

```bash
git add lib/cart lib/api/schemas/cart.ts features/cart/cart.types.ts
git commit -m "feat: derive cart line identity from variant and prescription"
```

---

## Task 3: Reducer keys on `lineKey`; delete client-side money

**Files:**
- Modify: `features/cart/cart-reducer.ts`, `features/cart/cart-reducer.test.ts`

**Interfaces:**
- Produces: `cartReducer` — unchanged signature, now `lineKey`-keyed
- Produces: `cartCount` — unchanged
- **Deletes:** `cartSubtotal`

> `cartReducer` stays a **pure function** and the store delegates to it (spec §8). Do not fold reducer logic into the zustand `create` callback — the existing test file is the cart's behavioural spec and must keep covering it directly.

- [x] **Step 1: Extend the failing test**

Add to `features/cart/cart-reducer.test.ts`:
- `ADD` same variant + same Rx twice ⇒ **one line, quantity 2**
- `ADD` same variant + different `sph` ⇒ **two lines, quantity 1 each** (§7's headline requirement)
- `ADD` same variant, one with Rx and one without ⇒ two lines
- `UPDATE_QTY` by `lineKey` touches only that line when two lines share a `variantId`
- `REMOVE` by `lineKey` likewise
- `UPDATE_QTY` to `0` — decide and **assert** the behaviour: clamp to 1 (current) or remove the line. Pick removal; a shopper decrementing to zero means "remove," and clamping strands a line they tried to delete. Document the change in the commit body.

Run → FAIL.

- [x] **Step 2: Rewrite the reducer**

Replace every `l.variantId === …` comparison with `l.lineKey === …`. `ADD` computes the incoming line's key via `lineKey()` if absent.

- [x] **Step 3: Delete `cartSubtotal`**

Remove it and every caller. Money is server-owned from Task 6 onward (Global Constraints). Until Task 7 lands, the cart page may show a pending state rather than a stale local total — that is intended, not a regression.

- [x] **Step 4: Verify**

Run: `npx vitest run features/cart` → PASS.
Run: `grep -rn "cartSubtotal\|unitPrice \*" app components features lib` → **no results**.

- [x] **Step 5: Commit**

```bash
git add features/cart
git commit -m "refactor: key cart lines on variant+Rx and remove client-side totals"
```

---

## Task 4: zustand cart store replaces React Context

**Files:**
- Create: `features/cart/cart-store.ts`, `features/cart/cart-store.test.ts`
- Delete: `features/cart/cart-context.tsx`, `features/cart/cart-storage.ts` (+ its test if present)
- Modify: `features/cart/use-cart.ts`, the layout that mounts `CartProvider`

**Interfaces:**
- Produces: `CART_STORAGE` — the single swap point for the persistence driver
- Produces: `useCartStore` — persisted to `localStorage` under `vivimoon-cart`, `skipHydration: true`
- Produces: `useCart()` — **same public shape as today** except `updateQty`/`remove` take `lineKey`, so page/component diffs stay small

- [x] **Step 1: Write the failing store test**

Create `features/cart/cart-store.test.ts`:
- actions delegate to `cartReducer` (add two same-variant-different-Rx lines ⇒ two lines)
- a pre-seeded `localStorage` value is picked up by `rehydrate()`, and is **not** read before it
- a mutation persists under key `vivimoon-cart`
- **the ordering hazard:** a line added *before* `rehydrate()` is not clobbered by hydration, and does not clobber the hydrated lines

> Do **not** assert "nothing is written to `localStorage` before `rehydrate()`." That is false, and a test asserting it fails against correct code. `persist` wraps `api.setState` unconditionally (`node_modules/zustand/middleware.js` — `savedSetState(...)` then `setItem()`), so **every** mutation writes. `skipHydration` skips only the initial *read*. The real risk is the read/write ordering above, so test that.
- a corrupt/unparseable stored value does not throw — the store falls back to an empty cart rather than crashing every page that renders the header count

Run → FAIL on unresolved import.

- [x] **Step 2: Write the store**

```ts
'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { cartReducer } from './cart-reducer';

/** Single swap point for the persistence driver (spec §8). localStorage is
 *  deliberate: carts survive a browser restart and are shared across tabs.
 *  sessionStorage was considered and rejected — per-tab, so closing a tab
 *  silently discards the cart. */
export const CART_STORAGE = createJSONStorage(() => localStorage);

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      lines: [],
      add: (line) => set((s) => cartReducer(s, { type: 'ADD', line })),
      updateQty: (lineKey, quantity) => set((s) => cartReducer(s, { type: 'UPDATE_QTY', lineKey, quantity })),
      remove: (lineKey) => set((s) => cartReducer(s, { type: 'REMOVE', lineKey })),
      clear: () => set((s) => cartReducer(s, { type: 'CLEAR' })),
    }),
    { name: 'vivimoon-cart', storage: CART_STORAGE, skipHydration: true },
  ),
);
```

- [x] **Step 3: Rehydrate on mount**

`skipHydration: true` means nothing loads until you call `useCartStore.persist.rehydrate()`. Do it in one client component mounted in the layout — mirror `features/session/session-sync.tsx` from M1 Task 10 rather than inventing a second pattern. This replaces the hand-rolled `hydrated` flag and both `useEffect`s in `cart-context.tsx`.

- [x] **Step 4: Rewrite `use-cart.ts` over the store, delete the Context**

Keep `useCart()`'s shape so consuming components barely change. Delete `cart-context.tsx` and `cart-storage.ts`. Remove `<CartProvider>` from the layout.

- [x] **Step 5: Verify**

Run: `npx vitest run features/cart` → PASS.
Run: `grep -rn "CartProvider\|cart-context\|cart-storage" app components features lib` → **no results**.
Run: `npx tsc --noEmit` → exit 0. `npm run build` → succeeds.

Manual check: add to cart, reload the page, cart survives. Open a second tab, confirm both see the same cart.

- [x] **Step 6: Commit**

```bash
git add features/cart app
git commit -m "refactor: migrate cart from React Context to zustand"
```

---

## Task 5: RxSelector and Rx-aware add-to-cart

**Files:**
- Create: `components/commerce/rx-selector.tsx`, `components/commerce/rx-selector.test.tsx`, `components/commerce/rx-summary.tsx`
- Modify: `app/[locale]/product/[slug]/page.tsx`, the add-to-cart client component, `lib/i18n/dictionaries/{en,vi}.ts`

**Interfaces:**
- Produces: `<RxSelector value onChange lensType ranges dict />` — controlled over an `RxDraft` (partial, pre-validation), renders **only** the steps the product stocks. No `requiresRx` prop: whether to render the selector at all, and whether a valid Rx gates the button, are the PDP's decisions (Step 4), not the component's.
- Produces: `<RxSummary rx />` — compact one-line render for cart/checkout/order lines

> **Renders no `cyl`/`axis` control.** Toric is deferred (§15). The fields exist in the type and the range table; the UI does not collect them in M2.

> `components/` never fetches data (M1 constraint). `RxSelector` receives its ranges as props from the page.

- [x] **Step 1: Add dictionary copy first**

`en` and `vi` together — `Dictionary` is typed from `en`, so a missing `vi` key is a compile error, which is the point. Keys needed: right/left eye, "same for both eyes", sph label, ADD label + LOW/MID/HIGH, plano / "no correction", the required-Rx validation message, and the cart/checkout Rx summary label.

- [x] **Step 2: Write the failing component test**

`components/commerce/rx-selector.test.tsx`:
- a `clear` product renders an sph control per eye and **no** ADD control (the enum is `clear|colored|toric|multifocal`; there is no `spherical`)
- a `multifocal` product renders ADD with exactly LOW/MID/HIGH
- **no product renders a CYL or AXIS control** — assert this explicitly, so re-enabling toric later is a deliberate act that breaks a test rather than a silent leak
- the sph options offer `0.00` (plano) and do **not** offer `-7.25`
- toggling "same for both eyes" mirrors right→left and hides the left control
- a product whose stocked subset is narrower than `RX_RANGES` renders only that subset

Run → FAIL.

- [x] **Step 3: Build `RxSelector`, then `RxSummary`**

Use existing `components/ui/*` primitives (`Field`, `Select`/`Input`). Do not introduce a new form library — the codebase is RHF + zod.

- [x] **Step 4: Gate add-to-cart on a valid Rx**

In the PDP's add-to-cart client component: when `requiresRx`, the button stays disabled until `rxSchemaForLensType(lensType)` parses. On success, build the line **with** `rx` and `lineKey`, then `useCart().add(line)`.

- [x] **Step 5: Analytics**

`add_to_cart` fires as before. Rx is **not** a GA4 item field — do not invent one. `cartLinesToGa4Items` in `lib/analytics/events.ts` already takes a line snapshot; confirm it still compiles against the widened `CartLine` and that no raw `gtag` call appears (M1 constraint).

- [x] **Step 6: Verify and commit**

`npx vitest run components/commerce` → PASS. `npx tsc --noEmit` → 0.
Manual: add the same variant at two different powers, confirm the cart shows **two lines**.

```bash
git add components/commerce app/\[locale\]/product lib/i18n
git commit -m "feat: add prescription selector and Rx-aware add to cart"
```

---

## Task 6: Server-owned pricing and auto-voucher

**Files:**
- Create: `content/mock/vouchers.ts`, `lib/api/resources/pricing/{index.ts,mock.ts,mock.test.ts}`, `app/api/cart/price/route.ts`, `app/api/cart/price/route.test.ts`
- Modify: `content/mock/index.ts`, `tests/contract/fixtures.test.ts`

**Interfaces:**
- Produces: `POST /api/cart/price` → `{ lines: PricedLine[], subtotal, discount, appliedVouchers, shipping, total, currency }`

> **`shipping` is `0` until Task 8.** No address exists yet, so there is nothing to quote against. Return the field with `0` — present and typed from day one, never omitted — so Task 7's summary component is not written against a shape that changes under it.
- Consumes: `apiOk`/`apiFail` (M1 Task 1), `resolveMode('commerce')` (M1 Task 1)

> Follow the M1 resource pattern exactly — `index.ts` picks mock vs upstream from env and throws a fail-fast error for upstream (which does not exist yet); `mock.ts` holds the logic. Copy `lib/api/resources/catalog/index.ts`.

> **Do not add a `pricing` resource name to `lib/api/config.ts`.** Spec §"Cutover order" puts cart pricing, vouchers, orders and payments in **Group D `commerce`**, which already exists in `RESOURCES` with the right dependency rule (`commerce` requires `catalog` + `identity` upstream first) and already has an `API_MODE_COMMERCE` line in `.env.example`. The established pattern is one directory per *module*, several sharing a resource — `account/index.ts` and `auth/index.ts` both call `resolveMode('identity')`. So `pricing/index.ts` calls `resolveMode('commerce')`, and `config.ts` and `.env.example` are untouched by Tasks 6, 8, 9 and 10.

> **The server re-prices from its own catalogue.** It must **not** trust `unitPrice` from the request body — a client that posts `unitPrice: 1` would otherwise buy at 1 VND. Accept `{ variantId, lineKey, rx?, quantity }` per line and look the price up server-side. This is the one genuine security property in M2.

- [ ] **Step 1: Voucher fixtures + conformance**

`content/mock/vouchers.ts` per spec §6's `Voucher` shape (`percent | fixed | shipping`, `minSpend?`, `expiresAt`, `status`). Extend `tests/contract/fixtures.test.ts` so every voucher parses against its schema — M1's harness is mutation-tested and must stay falsifiable; add the fixture to the existing pattern, do not write a parallel one.

- [ ] **Step 2: Write the failing pricing test**

`lib/api/resources/pricing/mock.test.ts`:
- subtotal is the sum of server-looked-up prices × quantity
- **a posted `unitPrice` is ignored** — post a line claiming `unitPrice: 1` and assert the subtotal uses the catalogue price. Assert a non-trivial baseline first so this cannot pass vacuously.
- the best applicable voucher auto-applies; below `minSpend` none applies
- an expired or `used` voucher never applies
- two vouchers do not stack unless the fixture says they may — assert whichever rule you implement
- an unknown `variantId` fails with a typed error, not a silent zero
- quantity `0` or negative is rejected

Run → FAIL.

- [ ] **Step 3: Implement `mock.ts`, then `index.ts`, then the route handler**

Route handler mirrors M1 Task 5's handlers: parse body with the zod schema, delegate to the resource, wrap in `apiOk`/`apiFail`, map validation failure to `validation_failed`.

- [ ] **Step 4: Route test**

`app/api/cart/price/route.test.ts` — valid body returns a schema-valid envelope; malformed body returns `400 validation_failed`; unknown variant returns the typed error.

- [ ] **Step 5: Verify and commit**

`npx vitest run lib/api/resources/pricing app/api/cart` → PASS. `npm run test:contract` → passes.

```bash
git add lib/api content/mock app/api/cart tests
git commit -m "feat: add server-owned cart pricing with auto-voucher"
```

---

## Task 7: Cart page renders server prices

**Files:**
- Modify: `app/[locale]/cart/page.tsx`, `components/commerce/cart-line-item.tsx`, `components/commerce/order-summary.tsx`, `features/cart/use-cart.ts`

> **The price is fetched client-side, not by the page.** The cart is in `localStorage` and is not readable until `rehydrate()` runs, so there is nothing for a Server Component to post. The debounced hook in Step 1 is the *only* pricing mechanism — first price included. Render a pending state until rehydrate + first price resolve.

> **Debounce quantity changes** and show the **previous** total in a pending state. Do not flicker to zero or to a skeleton — a total that blinks on every `+` click reads as a bug to a shopper.

- [ ] **Step 1: Add a priced-cart hook**

A client hook that fires the **first** price once `rehydrate()` has completed, then re-prices on line changes, debounced (~300ms), holding `{ result, isPending }` and retaining the last good `result` while pending. Cancel in-flight requests on a newer mutation so a slow response cannot overwrite a fresh one — an out-of-order response showing the wrong total is the most likely bug in this task.

- [ ] **Step 2: Render Rx on each line**

`<RxSummary />` per line, so two lines of the same variant are visually distinguishable. Without this the §7 split looks like a duplicate-line bug.

- [ ] **Step 3: Verify**

`npx vitest run` → green. Manual: two Rx lines price correctly; a voucher appears when its `minSpend` is met; rapid `+` clicking settles on the correct total, never a stale one.

- [ ] **Step 4: Commit**

```bash
git add app/\[locale\]/cart components/commerce features/cart
git commit -m "feat: price the cart server-side with debounced updates"
```

---

## Task 8: Vietnamese address model and shipping quote

**Files:**
- Create: `content/mock/shipping-rates.ts`, `lib/api/resources/shipping/{index.ts,mock.ts,mock.test.ts}`, `app/api/shipping/quote/route.ts`, `lib/api/schemas/checkout.ts`
- Modify: `lib/checkout/schema.ts`, `app/[locale]/checkout/page.tsx`, `lib/i18n/dictionaries/{en,vi}.ts`

> **`city` becomes `province` → `district` → `ward`.** The baseline `checkoutSchema` uses `city`, which is not how Vietnamese addresses work (spec §6 note). District-level granularity is also what makes the shipping quote meaningful.

- [ ] **Step 1: Rewrite `lib/checkout/schema.ts`**

Fields per spec §6 `Address`: `recipient`, `phone`, `line1`, `ward`, `district`, `province`, plus `label: 'home' | 'office' | 'other'`. Phone validates as a VN mobile number. **`email` stays required for guest checkout** — the guest order-tracking link is emailed (§10).

Saved addresses are **M3**. M2 collects an address on the checkout form; it does not persist one to the account.

- [ ] **Step 2: Shipping quote resource + route**

`POST /api/shipping/quote` takes the address plus priced lines, returns available options `{ id, label, fee, etaDays }`. Mock rates keyed by province/district in `content/mock/shipping-rates.ts` with a provisional-data header comment.

- [ ] **Step 3: Fold shipping into the price result**

`POST /api/cart/price` already returns a `shipping` field (Task 6). Pass the chosen shipping option id into the price call so `total` is the server's, not the client's addition. **Do not add `shipping` to `subtotal` on the client** — that reintroduces client-side money.

- [ ] **Step 4: Tests, verify, commit**

Resource test: a known district returns its rate; an unknown one returns a sane default rather than throwing. Schema test: `city` is gone; a malformed VN phone is rejected; a missing `ward` is rejected.

```bash
git add lib content app/api/shipping app/\[locale\]/checkout
git commit -m "feat: adopt VN address model and add shipping quotes"
```

---

## Task 9: Payment method selection

**Files:**
- Create: `lib/payments/methods.ts`, `lib/api/resources/payments/{index.ts,mock.ts,mock.test.ts}`, `app/api/payments/intent/route.ts`, `components/commerce/payment-method-picker.tsx`
- Modify: `app/[locale]/checkout/page.tsx`, `lib/i18n/dictionaries/{en,vi}.ts`

> **Exactly three methods: QR Pay, ZaloPay, SePay** (spec §15, confirmed 2026-08-30). **COD is deliberately excluded** and is not in M2. Do not add it "for completeness."

> **The UI branches on the `PaymentIntent` response shape — `qrCode` vs `redirectUrl` — never on the method name.** That is what makes adding COD or a fourth provider later a config entry rather than a new UI branch (§11). A `switch (method)` in the checkout component defeats the entire design and must be rejected in review.

- [ ] **Step 1: `lib/payments/methods.ts`**

The three methods with a header comment: provisional pending Vivimoon's payment solution; COD deliberately excluded; owner is Vivimoon (§11 convention).

- [ ] **Step 2: Payment intent resource + route**

`POST /api/payments/intent` → `{ id, method, status, qrCode? , redirectUrl? }`. Mock: QR Pay returns a `qrCode` payload; ZaloPay and SePay return a `redirectUrl`. No real payment is processed anywhere in M2.

- [ ] **Step 3: Picker component**

Renders from `lib/payments/methods.ts` — never a hardcoded list in JSX. Test: exactly three options render; adding a fourth entry to the config makes a fourth appear **with no component change** (assert this by importing and rendering against a stub list); **no COD option is present**.

- [ ] **Step 4: Verify and commit**

```bash
git add lib/payments lib/api/resources/payments app/api/payments components/commerce
git commit -m "feat: add payment method selection with QR/redirect intents"
```

---

## Task 10: Order placement

**Files:**
- Create: `lib/api/schemas/orders.ts`, `lib/api/resources/orders/{index.ts,mock.ts,mock.test.ts}`, `app/api/orders/route.ts`, `app/api/orders/route.test.ts`
- Modify: `app/[locale]/checkout/page.tsx`, `app/[locale]/checkout/success/page.tsx`, `proxy.ts`

**Interfaces:**
- Produces: `POST /api/orders` → the placed `Order`
- Consumes: pricing, shipping, payments resources; the session cookie from M1

> `OrderStatus` is **provisional** (§11) — `placed | confirmed | packed | shipped | out_for_delivery | delivered | cancelled | returned`, defined in `lib/orders/statuses.ts` with a header comment naming Vivimoon as owner. Order **history** and **tracking** are M3; M2 places an order and shows a confirmation.

- [ ] **Step 1: Failing test**

`lib/api/resources/orders/mock.test.ts`:
- placing an order **re-prices server-side** and stores the server total — a client-posted total is ignored (same property as Task 6, asserted again at the order boundary because this is the one that becomes money)
- order lines carry the resolved `rx` and `lineKey` (spec §6 `OrderLine` = `CartLine` + resolved Rx)
- a guest order (no session) is accepted and carries the guest email
- a logged-in order attaches the user id
- an empty cart is rejected
- the returned order code is not sequential/guessable — spec §10 designs against order enumeration, so do not undo it here with `order-1`, `order-2`

- [ ] **Step 2: Implement, then the route handler**

Guest checkout must work (spec §7: cart is client-side precisely so guests can check out). Reuse M1's session-cookie read; do not add a second cookie mechanism.

- [ ] **Step 3: Checkout submits and clears**

On success: `useCart().clear()`, then navigate to the success page. Fire `purchase` with the server's `transaction_id` and total via `lib/analytics` — never raw `gtag`.

- [ ] **Step 4: Guard the logged-in checkout variant in `proxy.ts`**

Extend the existing guard (do not create a second matcher). **Guest checkout must remain reachable** — the guard applies to the logged-in variant, not to `/checkout` wholesale. Assert both: a signed-out shopper reaches guest checkout; the account-linked path redirects to sign-in with `next`.

- [ ] **Step 5: Verify and commit**

```bash
git add lib/api lib/orders app/api/orders app/\[locale\]/checkout proxy.ts
git commit -m "feat: add order placement and confirmation"
```

---

## Task 11: Guest → member cart merge

**Files:**
- Modify: `features/cart/cart-store.ts` or the session-sync component, `app/[locale]/(auth)/sign-in/sign-in-form.tsx`

> Spec §9: on login, the persisted guest cart is re-priced under the new session so member vouchers apply. **Guest cart lines always win over a stale server cart.**

- [ ] **Step 1: Failing test**

- a guest cart with lines, then login ⇒ lines survive, re-priced under the session
- a member voucher that did not apply as a guest now applies
- login with an **empty** guest cart does not wipe anything, and does not error
- merge is idempotent — running it twice does not double quantities

- [ ] **Step 2: Implement, verify, commit**

Hook into the existing post-login path from M1 Task 10 rather than adding a new one.

```bash
git commit -am "feat: merge guest cart into member session on login"
```

---

## Task 12: Buy Now

**Files:**
- Modify: the PDP add-to-cart client component, `app/[locale]/checkout/page.tsx`

> Spec §10: same Rx selection as add-to-cart, then straight to checkout with a **single-line cart, leaving the existing cart untouched.**

- [ ] **Step 1: Decide and document the mechanism**

The existing cart must survive. Pass the single line through a short-lived buy-now slice in the store (not persisted) or a URL-addressed draft — **not** by clearing and restoring the real cart, which loses the shopper's cart if they abandon checkout or close the tab mid-flow.

- [ ] **Step 2: Test**

- Buy Now with a non-empty cart ⇒ checkout shows **one** line; returning to `/cart` shows the original cart **unchanged**
- abandoning buy-now checkout leaves the real cart intact
- completing a buy-now order does not clear the real cart

- [ ] **Step 3: Verify and commit**

```bash
git commit -am "feat: add Buy Now single-line checkout"
```

---

## Task 13: M2 verification

- [ ] **Step 1: Gates**

```bash
npx tsc --noEmit          # exit 0
npm run lint              # 0 errors
npm test                  # no failures; note the new total
npm run test:contract     # passes, upstream tests skip cleanly
npm run build             # succeeds
```

`npm run build` is the gate that catches what `npm run dev` cannot — M1 Task 13 found a missing `<Suspense>` around `useSearchParams()` only here. Any new client component reading search params needs one.

- [ ] **Step 2: Constraint greps**

```bash
grep -rn "unitPrice \*\|cartSubtotal" app components features lib   # none — client computes no money
grep -rn "CartProvider\|cart-context\|cart-storage" app components features  # none
grep -rn "cyl\|axis" components/                                    # none — no toric control
grep -rn "gtag(" app components features                            # none — analytics goes through lib/analytics
```

- [ ] **Step 3: End-to-end, in a browser, both locales**

Guest: PDP → pick Rx → add → add the same variant at a different power → cart shows **two** lines → voucher auto-applies → VN address → shipping quote → pick each of the three payment methods → place → confirmation.
Member: sign in with a guest cart present → lines survive and re-price → place an order.
Buy Now: with a non-empty cart, confirm checkout shows one line and `/cart` is untouched.
Reload mid-cart: lines and Rx survive; no duplicate lines appear (the `null`/`undefined` normalisation from Task 2).

- [ ] **Step 4: Update the ledger**

Append the M2 outcome to `.superpowers/sdd/progress.md`, then `graphify update .` per `CLAUDE.md`.

---

## M2 Definition of Done

- [ ] `features/cart/cart-context.tsx` and `cart-storage.ts` are gone; the cart runs on zustand, persisted to `localStorage`, `skipHydration` correct.
- [ ] The same variant at two different powers is two cart lines, and survives a reload as two lines.
- [ ] No client-side money: `cartSubtotal` is deleted and no component multiplies a price.
- [ ] The server ignores any client-supplied price or total, asserted at both the pricing and the order boundary.
- [ ] A guest can complete a purchase end to end; a member's guest cart merges on login.
- [ ] Exactly three payment methods render, driven by `lib/payments/methods.ts`; no COD; the UI branches on intent shape, not method name.
- [ ] Addresses are province/district/ward; `city` appears nowhere in the checkout schema.
- [ ] No CYL/AXIS control renders anywhere, and a test asserts it.
- [ ] Both `en` and `vi` render every new screen with no hardcoded strings.
- [ ] `npm run build` succeeds.

## What M2 deliberately does not do

- **No toric.** Deferred past M2 (§15). The fields and range data exist; no selector collects them. Enabling it later is a selector + validation change with **no cart re-keying**, which is the whole reason the deferral is cheap.
- **No COD.** Excluded pending Vivimoon's payment solution (§15). The seam is `lib/payments/methods.ts`.
- **No real payment.** Intents are mocked; settlement is Vivimoon's backend.
- **No saved addresses, order history, tracking, favorites, vouchers UI, or loyalty.** All M3. M2 collects an address per order and shows one confirmation.
- **No `upstream.ts` for the new resources.** Same reasoning as M1 — those arrive at cutover; the conformance harness already makes cutover verifiable.
