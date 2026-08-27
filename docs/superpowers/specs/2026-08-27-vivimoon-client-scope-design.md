# Vivimoon — Client Scope Design Spec

**Date:** 2026-08-27
**Status:** Approved (design), pending implementation plans
**Supersedes:** [`2026-08-16-vivimoon-storefront-baseline-design.md`](./2026-08-16-vivimoon-storefront-baseline-design.md)
**Source:** Vivimoon Functionality Checklist (21 features, 11 areas)
**Related:** [`docs/research/coolmate-website-analysis.md`](../../research/coolmate-website-analysis.md)

---

## 1. Overview

The delivered baseline is a mock-data storefront with a `localStorage` cart and a stubbed checkout. The client checklist turns it into a real e-commerce application: accounts, prescriptions, payments, orders, loyalty, and merchandising tools.

**Vivimoon's own backend developer owns the server.** They will supply REST endpoints. This project is the **frontend**, built against mock endpoints we serve ourselves, designed so that swapping to their API is a configuration change plus a per-resource adapter — not a rewrite.

### Goals
- Deliver all 21 checklist features as working frontend against mocked data.
- Make the mock→real migration **incremental, verifiable, and reversible**.
- Produce an executable API contract that doubles as the backend developer's specification.

### Non-goals
- Any real server, database, payment gateway, OAuth app, or carrier integration.
- Blog / community hub / store locator.
- On-site review authoring — reviews are **mirrored** from Shopee/TikTok, read-only.

### Baseline non-goals now in scope
Auth/accounts, loyalty, real payment *flows* (UI + mocked endpoints), prescription ordering, and server-owned data. Only blog/community/store-locator and review authoring remain deferred.

---

## 2. Feature Scope

| # | Area | Feature | Status |
|---|---|---|---|
| 1 | Onboarding | Sign Up — phone/email/Google, optional OTP | Specified |
| 1 | Onboarding | Log In — phone/email/Google | Specified |
| 1 | Onboarding | Forgot Password — OTP reset | Specified |
| 2 | Account | Account Info — all editable except phone | Specified |
| 2 | Account | Saved Addresses — default/office/home tags | Specified |
| 2 | Account | Payment Methods — QR Pay, ZaloPay, SePay | Specified |
| 2 | Account | Favorites | Specified |
| 2 | Account | Order History | Specified |
| 2 | Account | My Vouchers | Specified |
| 2 | Account | Loyalty Points — balance + history | **Rules stubbed** (§11) |
| 3 | Lookup | Order Tracking — guest + logged-in | **Statuses provisional** (§11) |
| 4 | Cart | Cart — qty, auto-voucher, total | Specified |
| 5 | Purchasing | Add to Cart — with Rx per eye | Specified |
| 5 | Purchasing | Buy Now — skip to checkout | Specified |
| 6 | Checkout | Guest Checkout | Specified |
| 6 | Checkout | Logged-in Checkout — autofill | Specified |
| 7 | Reviews | Mirrored from Shopee/TikTok | Specified |
| 8 | Loyalty | Award Points on order | **Rules stubbed** (§11) |
| 9 | Visualization | Multi-Context Viewer | **Assets pending** (§11) |
| 10 | Discovery | Lens-Matching Quiz | **Logic stubbed** (§11) |
| 11 | Comparison | Lens Comparison | Specified |

---

## 3. Architecture — the proxy seam

Our `/api/*` route handlers are **permanent infrastructure**, not scaffolding:

```
browser ──▶ /api/*  (our Next.js route handlers)  ──▶  MOCK:  content/mock/*.ts
                    │                                  PROXY: Vivimoon backend
                    └── reads httpOnly auth cookie
```

Application code — pages, components, stores — always calls `/api/*`. It does not know or care which mode a resource is in.

This buys four things:
1. **No CORS negotiation** with Vivimoon's backend; the browser never learns the upstream origin.
2. **The auth token never enters JavaScript** — it lives in an httpOnly cookie.
3. **Server Components can fetch authenticated data**, so account and order pages render server-side.
4. **Shape drift is absorbed in one file per resource**, not scattered through components.

### Resource layout

```
lib/api/
  config.ts                 # per-resource mode resolution from env
  schemas/                  # zod contracts — THE handoff artifact
    auth.ts  account.ts  catalog.ts  cart.ts  orders.ts
    payments.ts  loyalty.ts  discovery.ts  common.ts
  upstream/
    fetch.ts                # base client: URL, auth header, timeout, error normalization
    validate.ts             # zod parse with located diagnostics
  resources/
    <resource>/
      index.ts              # resolver — mock or upstream
      mock.ts               # reads content/mock/*
      upstream.ts           # fetch → adapt → validate   (added at cutover only)

app/api/**/route.ts         # thin handlers; delegate to lib/api/resources
content/mock/               # typed fixtures, validated against schemas in tests
```

`upstream.ts` **does not exist until that resource is ready to migrate.** No identity-mapping boilerplate ships today.

### Configuration

```bash
API_MODE_DEFAULT=mock
API_MODE_CATALOG=upstream          # per-resource override
UPSTREAM_API_BASE_URL=https://api.vivimoon.vn
UPSTREAM_API_TIMEOUT_MS=10000
NEXT_PUBLIC_GA_ID=
```

---

## 4. API Contract

Every request and response is a **zod schema** in `lib/api/schemas/`. The schemas do triple duty: they generate TypeScript types, they validate fixtures in tests so mock data cannot drift from the contract, and at proxy time they validate live responses — turning an integration mismatch into a located error rather than `undefined` rendering three components deep.

**This schema directory is the specification handed to Vivimoon's backend developer.**

### Envelope

All responses share one shape, so error handling is written once:

```ts
type ApiResponse<T> =
  | { ok: true;  data: T }
  | { ok: false; error: { code: string; message: string; field?: string } };
```

Arrows in the catalogue below name the **`data` payload**; every response is wrapped in this envelope.

### Endpoint catalogue

**Auth** — `lib/api/schemas/auth.ts`
```
POST   /api/auth/register          { identifier, name, password?, googleToken? } → { user }
POST   /api/auth/login             { identifier, password }                      → { user }
POST   /api/auth/google            { idToken }                                   → { user }
POST   /api/auth/otp/request       { identifier, purpose }                       → { otpId, expiresAt }
POST   /api/auth/otp/verify        { otpId, code }                               → { user } | { resetToken }
POST   /api/auth/password/reset    { resetToken, newPassword }                   → { ok }
POST   /api/auth/logout                                                          → { ok }
GET    /api/auth/session                                                         → { user | null }
```
`purpose` ∈ `signup | login | reset`. Login responses set the httpOnly cookie server-side; the token is never in the JSON body returned to the browser.

**Account** — `lib/api/schemas/account.ts`
```
GET    /api/account                                     → User
PATCH  /api/account          { name?, email?, dob?, password? } → User    # phone immutable
GET    /api/account/addresses                           → Address[]
POST   /api/account/addresses                           → Address
PATCH  /api/account/addresses/:id                       → Address
DELETE /api/account/addresses/:id                       → { ok }
POST   /api/account/addresses/:id/default               → Address[]
GET    /api/account/payment-methods                     → PaymentMethod[]
GET    /api/account/favorites                           → Product[]
POST   /api/account/favorites        { productId }      → { ok }
DELETE /api/account/favorites/:productId                → { ok }
GET    /api/account/vouchers                            → Voucher[]
GET    /api/account/loyalty                             → { balance, history[] }
```

**Catalog** — `lib/api/schemas/catalog.ts`
```
GET    /api/products?type=&replacement=&brandId=&color=&sort=   → Product[]
GET    /api/products/:slug                                      → Product
GET    /api/products/:id/reviews                                → Review[]
GET    /api/products/:slug/gallery                              → LensGallery
GET    /api/collections                                         → Collection[]
GET    /api/collections/:slug                                   → Collection
POST   /api/products/compare        { productIds[] }            → ComparisonMatrix
```

**Cart & checkout** — `lib/api/schemas/cart.ts`, `orders.ts`, `payments.ts`
```
POST   /api/cart/price       { lines[], voucherCode? }  → PricedCart
POST   /api/shipping/quote   { address, lines[] }       → ShippingOption[]
POST   /api/orders           { lines[], address, shippingOptionId, paymentMethod, voucherCode? } → Order
GET    /api/orders                                      → Order[]
GET    /api/orders/:id                                  → Order
POST   /api/orders/track/request   { orderCode, email }  → { ok }        # emails a signed link
GET    /api/orders/track?token=                         → OrderTracking
POST   /api/payments/intent  { orderId, method }        → PaymentIntent
GET    /api/payments/:id                                → PaymentIntent
```

`PaymentIntent` carries `{ id, status, qrCode?, redirectUrl? }` — QR Pay returns `qrCode`, ZaloPay/SePay return `redirectUrl`. The frontend branches on which is present, so adding a fourth method needs no new UI branch.

**Discovery** — `lib/api/schemas/discovery.ts`
```
GET    /api/quiz                                        → QuizDefinition
POST   /api/quiz/submit      { answers[] }              → { recommendations: Product[] }
```

---

## 5. Migration Strategy

The migration is the point of the architecture, so it is specified rather than left to improvisation.

### Per-resource cutover

Resources migrate one at a time by flipping `API_MODE_<RESOURCE>`. Rollback is flipping it back. **We own no data, so there is no data migration and no destructive step** — the only irreversible action is deleting mock fixtures, which is deferred until every resource has been stable in proxy mode.

### Cutover order

Mixed mode is only safe within dependency boundaries. Once real products arrive, their IDs will not match fixture IDs, and mocked orders referencing `prod-mock-001` will dangle:

```
Group A  catalog      products · collections · reviews · gallery    ─┐ independent —
Group B  identity     auth · account · addresses                    ─┘ migrate first
Group C  discovery    quiz · comparison                                depends on A
Group D  commerce     cart pricing · vouchers · orders · tracking ·
                      loyalty · payments                               depends on A + B — last
```

**Constraint:** never enable `API_MODE_COMMERCE=upstream` while `CATALOG` or `IDENTITY` remain mocked. The conformance suite fails fast on an ordering violation rather than letting dangling references reach the UI.

### Conformance suite

The same test suite runs against either side:

```bash
npm run test:contract                  # mock — runs in CI on every commit
npm run test:contract -- --upstream    # live API — run before flipping a resource
```

Green against upstream means the resource is safe to cut over. Red names the endpoint and the field. This gives Vivimoon's backend developer an executable definition of "done" instead of prose to interpret.

### Runtime validation

In proxy mode, `upstream/validate.ts` parses every response against its schema. Failures log the endpoint, the field path, and the received value, then surface a typed error. A shape regression after cutover is loud and located.

### Adapting drift

When Vivimoon's shapes differ from ours, the mapping goes in that resource's `upstream.ts` and nowhere else. Components, stores, and pages are never edited to accommodate a backend shape.

---

## 6. Domain Model Additions

Existing `Product`, `Variant`, `Collection`, `ProductSpecs` are unchanged. `Review` gains provenance.

```ts
// Prescription — line metadata, not a variant axis
interface RxEye  { sph: number; cyl?: number; axis?: number; add?: number }
interface LineRx { sameBothEyes: boolean; left: RxEye; right: RxEye }
```

`sph` is always captured. `cyl`/`axis` appear only when the product is `toric`; `add` only when `multifocal`. Both are derived from the existing `LensType`, so `RxSelector` stays generic over which fields a product requires.

### Rx ranges

Vivimoon has not yet confirmed stocked ranges, so these are **contact-lens industry standards**, held as data in `lib/products/rx-ranges.ts` and adjustable without code changes:

| Field | Range | Step | Applies to |
|---|---|---|---|
| `sph` (plano) | `0.00` | — | cosmetic lenses sold without correction |
| `sph` (myopia) | `-0.25` … `-6.00` | `0.25` | all |
| `sph` (myopia, high) | `-6.50` … `-10.00` | `0.50` | all |
| `sph` (hyperopia) | `+0.25` … `+6.00` | `0.25` | all |
| `cyl` | `-0.75`, `-1.25`, `-1.75`, `-2.25` | discrete | `toric` only |
| `axis` | `10°` … `180°` | `10°` | `toric` only |
| `add` | `LOW` / `MID` / `HIGH` | discrete | `multifocal` only |

Two details that differ from spectacle prescriptions and are easy to get wrong:

- **The step widens above -6.00.** Manufacturers do not produce 0.25 increments in high powers, so a selector offering `-7.25` would be offering a lens nobody makes.
- **Multifocal ADD is banded, not numeric.** Contact lens multifocals ship as LOW/MID/HIGH, unlike the numeric ADD on a glasses prescription.

The range table is per-product-overridable: a product declares which subset it stocks, and `RxSelector` renders only that. This means a narrowed real catalogue needs no selector changes.

```ts
interface User    { id; phone; email?; name; dob?; avatarUrl?; createdAt }

// Vietnamese addressing — province → district → ward, NOT city
interface Address {
  id; label: 'home' | 'office' | 'other';
  recipient; phone; line1;
  ward; district; province;
  isDefault: boolean;
}

interface PaymentMethod { id; type: 'qr' | 'zalopay' | 'sepay'; label; isDefault }

interface Voucher {
  code; title; description;
  type: 'percent' | 'fixed' | 'shipping';
  value; minSpend?; expiresAt;
  status: 'active' | 'used' | 'expired';
}

type OrderStatus =
  | 'placed' | 'confirmed' | 'packed' | 'shipped'
  | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned';   // provisional — §11

interface Order {
  id; code; status: OrderStatus; placedAt;
  lines: OrderLine[];        // CartLine + resolved Rx
  totals: CartTotals;
  address: Address;
  payment: { method; status };
  tracking?: OrderTracking;
}

interface LoyaltyEntry { id; orderId?; delta: number; reason; createdAt }

interface Review {
  /* …existing… */
  source: 'shopee' | 'tiktok' | 'vivimoon';
  sourceUrl?: string;
}

interface LensGallery {
  productId;
  contexts: {
    eye: Image[]; face: Image[];
    withMakeup: Image[]; withoutMakeup: Image[];
    byEyeColor: Record<string, Image[]>;
  };
}
```

> **Address model note:** the baseline `checkoutSchema` uses `city`, which does not match Vietnamese addressing. It becomes province/district/ward, which also enables district-level shipping quotes.

---

## 7. Cart, Rx, and Line Identity

Cart state stays **client-side** — guest checkout requires it, and it avoids a server round-trip per quantity change.

**Line identity becomes `variantId + rx`.** The current reducer keys on `variantId` alone (`features/cart/cart-reducer.ts`); the same variant at -2.50 and -3.00 must be two distinct lines. A stable `lineKey` is derived by hashing `variantId` with the normalized Rx.

Money is **never computed on the client.** `POST /api/cart/price` returns subtotal, discount, applied vouchers, shipping, and total. The client renders what it is given. This keeps discount logic server-owned, makes auto-voucher behavior identical for guests and members, and means a pricing-rule change needs no frontend release.

The call is debounced on quantity change, with the previous total shown in a pending state rather than flickering to zero.

---

## 8. State Management

**zustand** replaces React Context for client-global state, persisted to **`localStorage`**.

Three stores, and only three:

| Store | Contents | Persisted |
|---|---|---|
| `useCartStore` | lines (variant + Rx), last priced totals | yes |
| `useCompareStore` | up to 4 product IDs | yes |
| `useSessionStore` | current user summary for header/UI branching | no — server is source of truth |

Everything else — order history, addresses, vouchers, loyalty, favorites, catalog — is **server data fetched in Server Components** through the proxy. It does not belong in a client store; putting it there would mean re-implementing caching and invalidation the server already handles.

```ts
// features/cart/cart-store.ts
export const CART_STORAGE = createJSONStorage(() => localStorage);   // single swap point

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({ /* actions delegate to the pure cartReducer */ }),
    { name: 'vivimoon-cart', storage: CART_STORAGE, skipHydration: true },
  ),
);
```

Three deliberate choices:

- **`cartReducer` survives unchanged** as a pure function; the store delegates to it. The existing `cart-reducer.test.ts` continues to cover cart logic, and the store is tested separately for persistence and hydration.
- **`skipHydration: true`** with an explicit `rehydrate()` on mount avoids SSR/client mismatch. This replaces the hand-rolled `hydrated` flag and both `useEffect`s in `cart-context.tsx`.
- **`CART_STORAGE` is exported as a single constant.** `localStorage` is deliberate: carts survive a browser restart and are shared across tabs, which is standard e-commerce behavior and matches the delivered baseline. `sessionStorage` was considered and rejected — being per-tab, it silently discards a cart when the tab closes. Swapping the driver is a one-line change in this constant if that decision is ever revisited.

`features/cart/cart-context.tsx` and `cart-storage.ts` are deleted.

---

## 9. Auth and Session

- Mock `/api/auth/*` covers phone/email/Google, OTP, and password reset.
- Successful auth sets an **httpOnly, SameSite=Lax, Secure** cookie server-side. The token is never in a response body or in JavaScript.
- Server Components read the cookie and fetch authenticated data server-side.
- Client mutations call our route handlers, which read the cookie and forward.
- `middleware.ts` extends beyond locale handling to guard `/account/*` and `/checkout` (logged-in variant), redirecting to sign-in with a `next` parameter.
- Google is mocked as an endpoint returning a session; real OAuth is Vivimoon's concern, absorbed at proxy time.
- **Guest → member cart merge:** on login, the persisted guest cart is posted to `/api/cart/price` under the new session and any member voucher is applied. Guest cart lines always win over a stale server cart.

---

## 10. Feature Notes

**Onboarding.** Phone-first, matching Vietnamese norms. No password complexity rules (per checklist). OTP optional at signup, required for reset.

**Order tracking.** Guests submit order code plus email; the backend emails a **signed, expiring link** rather than rendering the order inline. This prevents order enumeration — code plus email alone would let anyone who guesses a code probe for valid ones, and order records carry a delivery address.

The link carries a token consumed by `GET /api/orders/track?token=`. Token issuance, signing, and expiry are Vivimoon's backend concern; the frontend only requests a link and renders whatever the token resolves to. The request form returns the same neutral acknowledgement whether or not the order exists, so it cannot be used as an oracle.

In mock mode the "email" is written to the server log and returned in the response body under `devLink` — **gated on `API_MODE !== 'proxy'`** so it cannot leak in production.

Logged-in users skip all of this and reach the same tracking view from order history.

**Reviews.** Read-only, rendered with a source badge linking to the original Shopee/TikTok listing. No authoring UI. Ingestion is entirely Vivimoon's backend concern.

**Comparison.** Up to 4 products, compared on color, diameter, eye-enlargement effect, lifespan, and price. A persistent tray accumulates selections across pages. `eyeEnlargement` is a new derived field on `ProductSpecs`, banded from diameter in `lib/products/eye-enlargement.ts` (`natural` < 14.0mm, `subtle` 14.0–14.2, `noticeable` 14.3–14.5, `dramatic` > 14.5). Bands are Vivimoon-adjustable in that one file.

**Lens viewer.** Tabbed multi-context gallery — eye / face / with makeup / without makeup / by natural eye color. Falls back to the standard `ProductGallery` when a product has no gallery entry, so partial photo coverage degrades gracefully rather than breaking the PDP.

**Buy Now.** Same Rx selection as add-to-cart, then routes straight to checkout with a single-line cart, leaving the existing cart untouched.

---

## 11. Blocked Items

Four items lack Vivimoon business input. None blocks the build. Each ships with complete UI and a mock endpoint; the **business rule alone** is isolated in one clearly-marked file, so filling it in later is a data change, not a code change.

| Item | Ships now | Vivimoon supplies | Lands in |
|---|---|---|---|
| Loyalty points | balance, history, award-on-order | earn/burn rates, tiers | `lib/loyalty/config.ts` |
| Order tracking | 6-step provisional timeline | real carrier statuses | `lib/orders/statuses.ts` |
| Lens viewer | viewer + categorization schema | the photo library | `content/mock/galleries.ts` |
| Quiz | 6 provisional questions, tag-weight scoring | question set + weights | `content/quiz.ts` |

Each file carries a header comment naming what is provisional and who owns it.

**Payment methods are also provisional.** Vivimoon's payment solution is not finalised, so the build ships the three named methods (QR Pay, ZaloPay, SePay) and no others. Cash-on-delivery is deliberately excluded for now rather than guessed at. The method set lives in `lib/payments/methods.ts`, and because the checkout UI branches on the `PaymentIntent` response shape — `qrCode` versus `redirectUrl` — rather than on the method name, adding COD or a fourth provider is a config entry plus whatever settlement copy it needs, not a new UI branch.

---

## 12. Testing

Vitest + RTL continue. Added:

- **Contract:** every fixture parses against its zod schema. Guarantees mock data cannot drift from the contract.
- **Route handlers:** each mock endpoint returns a schema-valid envelope and correct error codes.
- **Cart + Rx:** line identity (same variant, different Rx ⇒ two lines), quantity merge, `sameBothEyes` normalization.
- **Store:** persistence to `localStorage`, `skipHydration` correctness, cross-tab consistency, guest→member merge.
- **Schemas:** Rx validation per lens type, VN address validation, checkout, voucher application.
- **Order tracking:** the link-request endpoint returns an identical acknowledgement for known and unknown order codes (no enumeration oracle), and `devLink` is absent whenever `API_MODE=proxy`.
- **Rx ranges:** the selector offers no step the range table excludes — in particular nothing between `-6.00` and `-10.00` off the `0.50` grid.
- **Analytics:** new events fire with correct payloads; `track()` stays a no-op when unconfigured.

No E2E in this phase.

---

## 13. Milestones

Each is independently demoable and gets its own implementation plan.

**M1 — Foundation**
API seam, zod schemas, mock fixtures, route handlers, conformance harness, `ProductRepository` removal, zustand migration, auth flows, account info.

**M2 — Purchase core**
Rx selector, cart line identity, server pricing, auto-voucher, guest and logged-in checkout, shipping quote, payment method selection, order placement.

**M3 — Account & orders**
Order history, saved addresses, favorites, vouchers, order tracking, loyalty balance and award.

**M4 — Discovery**
Lens-matching quiz, multi-context viewer, comparison, mirrored reviews.

---

## 14. Files Removed or Changed

**Removed:** `lib/data/product-repository.ts`, `lib/data/mock-product-repository.ts`, `lib/data/index.ts`, `features/cart/cart-context.tsx`, `features/cart/cart-storage.ts`.

The repository interface existed to swap mock↔real in-process. That job now belongs to the network boundary; keeping both would be two seams doing one job.

**Changed:** six page files under `app/[locale]/` switch from repository calls to `lib/api`; `middleware.ts` gains auth guards; `lib/checkout/schema.ts` adopts the VN address model; dictionaries gain the new copy.

**Unchanged:** everything in `components/`. The baseline rule that commerce components never fetch data means the entire component layer survives a full backend replacement untouched.

---

## 15. Decisions and Open Questions

### Resolved — 2026-08-27

| Question | Decision |
|---|---|
| Cart persistence | **`localStorage`**, not `sessionStorage`. Carts survive browser restart and are shared across tabs. |
| Guest order tracking | **Emailed signed link**, not inline lookup. Prevents order enumeration (§10). |
| Locales | **EN/VI retained.** |
| COD | **Excluded for now**, pending Vivimoon's payment solution plan. Seam left (§11). |

### Still open

1. **Payment solution.** The final method set is not confirmed. The build ships QR Pay, ZaloPay, and SePay; revisit once Vivimoon's plan lands. Blocks nothing — the method set is config.
2. **Rx ranges.** Industry-standard defaults are specified in §6. Confirm against what Vivimoon actually stocks, and whether toric CYL/AXIS is needed at launch or can follow. Blocks nothing — the ranges are data.

Neither open item blocks any milestone. Both resolve to editing one data file.
