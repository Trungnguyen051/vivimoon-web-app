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
GET    /api/orders/track?code=&contact=                 → OrderTracking
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

**zustand** replaces React Context for client-global state, persisted to **`sessionStorage`**.

Three stores, and only three:

| Store | Contents | Persisted |
|---|---|---|
| `useCartStore` | lines (variant + Rx), last priced totals | yes |
| `useCompareStore` | up to 4 product IDs | yes |
| `useSessionStore` | current user summary for header/UI branching | no — server is source of truth |

Everything else — order history, addresses, vouchers, loyalty, favorites, catalog — is **server data fetched in Server Components** through the proxy. It does not belong in a client store; putting it there would mean re-implementing caching and invalidation the server already handles.

```ts
// features/cart/cart-store.ts
export const CART_STORAGE = createJSONStorage(() => sessionStorage);   // single swap point

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
- **`CART_STORAGE` is exported as a single constant.** `sessionStorage` is per-tab and cleared when the tab closes, so a cart does not survive a browser restart or a link opened in a new tab. If Vivimoon wants cross-session carts, changing that one line to `localStorage` is the entire change.

`features/cart/cart-context.tsx` and `cart-storage.ts` are deleted.

---

## 9. Auth and Session

- Mock `/api/auth/*` covers phone/email/Google, OTP, and password reset.
- Successful auth sets an **httpOnly, SameSite=Lax, Secure** cookie server-side. The token is never in a response body or in JavaScript.
- Server Components read the cookie and fetch authenticated data server-side.
- Client mutations call our route handlers, which read the cookie and forward.
- `middleware.ts` extends beyond locale handling to guard `/account/*` and `/checkout` (logged-in variant), redirecting to sign-in with a `next` parameter.
- Google is mocked as an endpoint returning a session; real OAuth is Vivimoon's concern, absorbed at proxy time.
- **Guest → member cart merge:** on login, the sessionStorage cart is posted to `/api/cart/price` under the new session and any member voucher is applied. Guest cart lines always win over a stale server cart.

---

## 10. Feature Notes

**Onboarding.** Phone-first, matching Vietnamese norms. No password complexity rules (per checklist). OTP optional at signup, required for reset.

**Order tracking.** One lookup form serving guest and logged-in users, by order code plus phone or email. Logged-in users reach the same view from order history without re-entering credentials.

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

---

## 12. Testing

Vitest + RTL continue. Added:

- **Contract:** every fixture parses against its zod schema. Guarantees mock data cannot drift from the contract.
- **Route handlers:** each mock endpoint returns a schema-valid envelope and correct error codes.
- **Cart + Rx:** line identity (same variant, different Rx ⇒ two lines), quantity merge, `sameBothEyes` normalization.
- **Store:** persistence to `sessionStorage`, `skipHydration` correctness, guest→member merge.
- **Schemas:** Rx validation per lens type, VN address validation, checkout, voucher application.
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

## 15. Open Questions for Vivimoon

1. **COD.** The checklist lists QR Pay, ZaloPay, and SePay but no cash-on-delivery, which remains dominant in Vietnamese e-commerce. Intentional, or an oversight? A seam is left either way.
2. **Cart persistence.** `sessionStorage` means carts do not survive closing the tab. Confirm this is intended.
3. **Rx ranges.** Which SPH range and step do Vivimoon stock, and do toric products need CYL/AXIS at launch?
4. **Guest order tracking.** Is order code plus phone sufficient, or is an emailed magic link required?
5. **Locales.** The checklist is silent on language. EN/VI is retained — confirm English is still needed.
