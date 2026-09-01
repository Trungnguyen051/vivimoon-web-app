# M1 Foundation — progress ledger

Plan: docs/superpowers/plans/2026-08-27-vivimoon-m1-foundation.md
Branch: feat/m1-foundation
Base: 
b382499f969f706d50d2412102a3cf1266dffc9e

Tasks 1-13. Append one line per task as its review comes back clean.

Task 1: complete (commits 4e1ddb1..ebda1d0, review clean — approved, no Critical/Important)
  Minor carried to final review:
  - lib/api/config.test.ts: DEPENDS_ON.commerce second dependency (catalog upstream +
    identity mocked) is unexercised by any test. Brief-originated gap, not implementer.
  - npm "Unknown user config python" warning is pre-existing global npm config, not repo.
  Resolved by controller: ApiErrorSchema/apiErrorSchema casing drift on plan line 114 (fixed);
  full-suite + tsc claims verified independently before review dispatch (35/35, tsc clean).
Task 2: implemented (59f2cfe) + controller-directed fix (cbc3765) — awaiting review
  Plan defect #3: Task 2 Step 6 claimed Review.source is "optional on input", but the
  alias used z.infer (output type), where .default() makes it required. Plan corrected.
Task 2: complete (commits 0be3684..cbc3765, review clean — approved, no Critical/Important)
  Controller-resolved warnings: lib/types/index.ts is a plain barrel (no change needed);
  "Consumes: envelopeSchema" was a plan error — composition lives in Task 6's upstreamFetch.
  Minor carried to final review:
  - Two differently-shaped ProductQuery types coexist until Task 4 deletes lib/data/.
  Pre-empted for Task 4: the badges query filter is used by no caller; its removal is
  now documented in the plan as deliberate so review does not read it as a regression.
Task 3: complete (commit 47f398f, verified by controller — no review subagent dispatched)
  Diff matches the brief step-for-step. Verified independently: tsc clean, full suite 52/52,
  `npm run test:contract` 8/8, no stale `@/content/{products,collections,reviews}` importers.
  Conformance harness mutation-tested (products[0].slug -> number): suite failed with the exact
  path `product[0]: slug Expected string, received number`, so it is not vacuously passing.
  Fixture restored; content/ tree clean.
Task 4: complete (commit a7843e3, implemented + verified by controller — no subagent dispatched)
  TDD honoured: test written first, failed on unresolved './mock', passed 13/13 after impl.
  Ported MockProductRepository verbatim except the deliberate `badges` filter drop (plan-
  documented). Diffed old vs new method-for-method: no other behaviour lost.
  Verified: tsc exit 0, full suite 59/59 (old repo's 6 tests replaced by 13), `npm run build`
  succeeds with all 11 routes, and `grep -rn "productRepository\|lib/data" app components
  features lib content` returns nothing. lib/data/ is gone — first M1 DoD box now satisfied.
  Minor carried to final review:
  - lib/api/resources/catalog/index.ts throws eagerly at module load if catalog is set to
    upstream (fail-fast, per plan). No test covers that throw path; brief-originated gap.
  - app/[locale]/product/[slug]/page.tsx keeps its sequential awaits for related/reviews;
    the plan only parallelised the home page, so this was left as-is rather than widened.
Task 3: REVIEW CLEAN (subagent review, sonnet) — spec compliant, quality Approved,
  no Critical/Important. Supersedes the earlier "no subagent dispatched" note above.
  Reviewer ⚠️ "cannot verify test claims from diff" resolved by controller: tsc (exit 0),
  npm test (52/52) and npm run test:contract (8/8) were run first-hand at 47f398f, and the
  mutation check was performed by the controller — direct observation, not report claims.
  Reviewer independently confirmed R100 renames (zero content drift) and that expectAllValid
  uses safeParse against the real Task 2 schemas, so the harness is falsifiable, not a
  rubber stamp.
  Minor carried to final whole-branch review:
  - tests/contract/fixtures.test.ts: `x.path.join('.')` yields an empty segment for
    root-level issues, producing an opaque message if a future fixture fails that way.
  - No negative-path test is committed; the mutation check was manual, so the harness's
    "does it actually fail on bad data" property is not self-verifying in CI.
  - Referential integrity is one-directional only (no check that every product is
    reachable from some collection). Brief did not request it; disclosed, not a spec gap.
Task 4: REVIEW CLEAN (commits 2042448, 6da9b89 — review-driven fixes on a7843e3).
  Reviewer findings resolved:
  - Two vacuous test assertions in lib/api/resources/catalog/mock.test.ts
    (filters-by-replacement-schedule, honours-the-related-products-limit) could pass
    against broken logic; both now assert a non-empty/larger baseline before the
    weaker check, matching their sibling tests.
  - Collection page cast raw searchParams to LensType/ReplacementSchedule/sort instead
    of validating them; a malformed query (?type=banana) silently rendered an empty
    grid. Now parsed through productQuerySchema-derived validation.
  - Follow-up: strict per-field validation over-corrected — one bad param (e.g. sort)
    discarded an otherwise-valid one (e.g. type). Added parseProductQueryLoose
    (per-field-lenient sibling; productQuerySchema itself is unchanged for API routes)
    so the collection page keeps valid filters and drops only the invalid field.
  - Strengthened "returns only reviews for the requested product" with a second
    fixture product so a getReviews that ignores its argument now fails.
  Verified independently: tsc exit 0, full suite 62/62.
Task 5: complete (commit b480800, implemented + verified — no subagent dispatched).
  Added GET /api/products, /api/products/:slug, /api/products/:slug/reviews,
  /api/collections, /api/collections/:slug, all delegating to the catalog resource
  module (Task 4) and wrapped in apiOk/apiFail (Task 1). Excluded /api from the
  locale-redirect matcher in middleware.ts.
  TDD honoured: app/api/products/route.test.ts written first, failed on unresolved
  './route', passed 8/8 after the five handlers were added.
  Verified: tsc exit 0, full suite 70/70 (62 + 8 new), `npm run build` succeeds with
  all 5 new routes listed as dynamic (ƒ). Manually curled the running dev server:
  ?type=colored filters correctly, /ghost slug 404s with not_found, ?sort=cheapest
  400s with validation_failed, /api/collections returns the fixture list.
Task 6: complete (commit 29a21c1, implemented + verified — no subagent dispatched).
  Added parseOrThrow/UpstreamShapeError (lib/api/upstream/validate.ts), upstreamFetch/
  UpstreamRequestError (lib/api/upstream/fetch.ts), and the live-API conformance suite
  (tests/contract/upstream.test.ts, skipped unless UPSTREAM_API_BASE_URL is set) +
  test:contract:upstream script, all matching the plan verbatim.
  Plan deviation (implementer-discovered, not brief-originated): the plan's
  `parseOrThrow(envelopeSchema(schema), json, context)` does not typecheck as
  written. zod v3's discriminatedUnion widens the `ok` literal to `boolean` when
  threaded through two levels of generics (envelopeSchema<T> instantiated inside
  parseOrThrow<T2>), so `envelope.ok` narrowing fails with "Property 'error'/'data'
  does not exist". Fixed by asserting the parsed value against a local
  `Envelope<T> = { ok: true; data: T } | { ok: false; error: ApiError }` type
  instead of trusting z.infer through the nested generic instantiation.
  TDD honoured: lib/api/upstream/validate.test.ts written first, failed on
  unresolved './validate', passed 3/3 after impl.
  Verified: tsc exit 0, full suite 73/73 (6 upstream tests correctly skipped with no
  UPSTREAM_API_BASE_URL), `npm run test:contract` (8 pass, 6 skip), `npm run build`
  succeeds. Negative-path check per plan Step 8: pointed
  UPSTREAM_API_BASE_URL at an unreachable host (127.0.0.1:9) and ran
  test:contract:upstream — all 6 tests failed with "network error", proving the
  suite actually attempts the call rather than silently passing.
Task 7: complete (commit ab85c8c, implemented + verified — no subagent dispatched).
  Installed zustand ^5.0.15. Added features/session/session-store.ts (useSessionStore)
  matching the plan verbatim: unknown/authenticated/anonymous status, setUser/clear
  actions, deliberately not persisted (httpOnly cookie is the source of truth).
  TDD honoured: features/session/session-store.test.ts written first, failed on
  unresolved './session-store', passed 5/5 after impl — including the negative
  check that setUser never writes to localStorage/sessionStorage.
  Verified: tsc exit 0, full suite 78/78 (6 upstream tests still correctly skipped),
  `npm run build` succeeds.
Task 8: REVIEW CLEAN (commit b8ec9f6, review clean — approved, no Critical/Important).
  Auth schemas, content/mock/users.ts fixtures, mockAuth identity resource, and the
  resolveMode('identity') resolver — 25 new tests (11 schema + 14 mock-auth) plus 2
  extended fixture-conformance tests. All four security-sensitive behaviors verified:
  identical unauthorized message for unknown-identifier vs wrong-password, OTP
  single-use consumption, OTP issued regardless of identifier existence, email
  identifier lands on User.email not .phone.
  Verified: tsc clean, eslint 0 errors, full suite 105/111 (6 pre-existing upstream
  skips), output pristine.
  Minor carried to final review:
  - lib/api/resources/auth/mock.test.ts: "verifies a signup OTP into a session" test
    actually passes purpose:'login', not 'signup' — the 'signup' enum value is never
    exercised by any test (not a functional bug, both purposes share a code path).
  - mock.ts: updateUser is exported on Auth but has zero test coverage and isn't in
    the brief's Produces list — reserved for Task 12's account resource, which will
    be its first consumer.
  - No test for resetPassword with an invalid/expired token, or getUserById missing id.
Task 9: REVIEW CLEAN (commit 7793a95, review clean — approved, no Critical).
  lib/auth/cookie.ts (HMAC sign/verify, timing-safe compare), lib/api/route-helpers.ts
  (parseBody/authErrorResponse/startSession/endSession), and the 8 /api/auth/*
  handlers (login, register, google, session, logout, otp/request, otp/verify,
  password/reset) — 26 new tests. Reviewer independently verified all 8 security
  checklist items (no-throw on hostile cookie input, timing-safe compare, no token
  in any response body, devCode gate, session-only-on-success, logout cookie clear
  incl. Path normalization, AuthError->HTTP status mapping, session GET returns
  200/null not 401) with file:line evidence, plus confirmed the implementer's
  mutation-testing claims held up in the diff.
  Two Important findings, both labeled plan-mandated (matched the plan's own code
  exactly) — escalated to the human per the plan-conflict rule rather than
  auto-fixed or dismissed. Human chose to fix both, directly by the controller
  (no fix subagent) given session token budget:
  Fixed in commit 4d578c7:
  - otp/request only stripped devCode when isAnyUpstream(); default mock config
    (.env.example ships API_MODE_DEFAULT=mock) left the OTP code publicly
    readable in the response if ever deployed. Now also strips when
    NODE_ENV==='production', regardless of API mode. Regression test added.
  - signSession(userId) was a pure, unexpiring function of the user id — a
    leaked token stayed valid forever under the same secret, logout only clears
    the browser's copy. Added issued-at to the signed payload
    (`<userId>.<issuedAtMs>.<hmac>`) with a 30-day expiry check in
    verifySession; external contract (returns userId or null) unchanged, so
    Task 13's guard is unaffected. Existing "rejects a tampered payload" test
    updated for the 3-part format; new "rejects an expired session" test added
    (vi.useFakeTimers).
  Verified after fix: tsc clean, full suite 133/139 (6 pre-existing upstream
  skips, +2 new tests vs pre-fix 131).
  Minor findings NOT fixed (carried to final whole-branch review):
  - No automated test proves Next actually serializes Set-Cookie with the full
    options object (httpOnly/sameSite/secure) from a Route Handler — the mocked
    next/headers jar in auth-routes.test.ts discards the options argument, so
    e.g. dropping `httpOnly` from sessionCookieOptions() would pass every test.
  - Signature hex is not canonicalized (trailing garbage after valid hex bytes
    is silently ignored by Buffer.from(...,'hex')), so multiple distinct cookie
    strings decode to the same valid session — not a forgery path (HMAC still
    required) but would matter if anything ever keys on the cookie string
    itself (revocation list, cache key, rate limiter).
  - readSessionUserId() throws (doesn't fail closed) if AUTH_COOKIE_SECRET is
    unset and a cookie is present — doc comment on verifySession overstates
    "never throws" for that case.
  - otp/request's devCode strip is a denylist (`{devCode:_devCode,...rest}`);
    prefer an allowlist so a future dev-only field on OtpChallenge doesn't
    silently ship upstream by default.
  - session GET has no Cache-Control: no-store (defensive only — cookies()
    already forces the route dynamic).
  - No test for authErrorResponse's rethrow branch, or a valid-signature
    cookie for a since-deleted user (session route degrades correctly per
    getUserById, but the stale cookie itself is never cleared).
  Environment note from the implementer (unresolved, relevant to Task 10): no
  .env.local in the tree, so a plain `npm run dev` on :3000 has no
  AUTH_COOKIE_SECRET and login 500s there (fails closed — anonymous `session`
  still returns 200/null). Task 10's browser-verification step will need the
  env file copied first.

Task 10: complete (commit 1b74ded, implemented + verified — no subagent dispatched).
  Created .env.local from .env.example (AUTH_COOKIE_SECRET set) to unblock the
  browser-verification step noted after Task 9; file is gitignored, not committed.
  Full suite 141/6-skipped passing, tsc clean. Browser-verified via dev server:
  GET /en/sign-in, /en/sign-up, /vi/sign-in all 200; POST /api/auth/login with
  the mock user (0912345678/vivimoon123) set vivimoon_session as HttpOnly,
  SameSite=lax; GET /api/auth/session read the cookie back correctly.

Task 11: complete (commit bf45ba9, implemented + verified — no subagent dispatched).
  Forgot-password OTP flow (request/verify/reset, 3-stage form on one route).
  Followed the plan verbatim; 4/4 form tests, full suite 145/6-skipped, tsc clean.

Task 12: complete (commit 84b6eb6, implemented + verified — no subagent dispatched).
  Account resource (get/update over mockAuth) and GET/PATCH /api/account.
  Followed the plan verbatim; 9/9 route tests, full suite 154/6-skipped, tsc clean.

Task 13: complete (commit 6d443ea, implemented + verified — no subagent dispatched).
  Account page, AccountForm, and the route guard. Three deviations from the
  plan's literal text, all found by actually running the verification steps
  rather than trusting the plan's expected output:
  - middleware.ts -> proxy.ts. This Next.js version (16.3.1) deprecated and
    renamed the middleware file convention to proxy (dev server prints its own
    deprecation warning; node_modules/next/dist/docs/.../proxy.md confirms).
    Same guard logic and matcher, function renamed middleware -> proxy. The
    deprecation warning is gone after the rename, and `next build` labels the
    route "Proxy (Middleware)" rather than failing.
  - Sign-in page now wraps SignInForm in <Suspense>. useSearchParams() in a
    Client Component needs one for static prerendering; without it `next
    build` fails prerendering /en/sign-in and /vi/sign-in with "should be
    wrapped in a suspense boundary". This is Task 10's own code — `npm run
    dev` never exercises static prerendering, so this only surfaces under
    `next build`, which is why Task 10's own verification step didn't catch
    it and Task 13 Step 9 (the first time `npm run build` was actually run)
    did.
  - Account page fetches its own GET /api/account (via headers()/cookies())
    instead of importing the account resource directly. Root cause, confirmed
    with a temporary diagnostic and reverted: Next.js compiles Route Handlers
    and Server Component pages into separate module instances (verified
    empirically — instance identity differs across a login POST and an
    account page GET even within one process), so the mock's in-memory store
    as mutated by PATCH /api/account was invisible to a direct resource call
    from the page. Reproduced in both `next dev` and `next start`; before the
    fix, saving a name and reloading showed the old name, and saving again
    without touching the field would have silently reverted it. Asked the
    user how to handle it (fix now vs. document as a known mock-only
    limitation that disappears once a real upstream API replaces the
    in-memory store) — user chose fix now. Verified via curl against a live
    dev server and again against `next start`: patch, then reload, shows the
    saved value.
  Also found, NOT fixed, out of scope for M1 auth/account work: `npm run
  lint` reports one pre-existing error in components/commerce/hero-carousel.tsx
  (react-hooks/set-state-in-effect — calling setState synchronously in a
  useEffect). That file has no changes on this branch and was last touched in
  the pre-M1 baseline redesign; package.json/package-lock.json have not
  changed either. An earlier ledger entry (Task 4-ish, "eslint 0 errors")
  suggests lint was clean at that point, so this is likely a rule that
  started firing after some intervening change outside this branch's own
  commits — needs the user's attention separately from M1.
  Step 8 (guard end-to-end) and Step 9 (full M1 verification) both run
  through: tsc clean; lint has the one pre-existing unrelated error above;
  full suite 158/6-skipped; test:contract 10/6-skipped; `npm run build`
  succeeds (after the Suspense fix); API_MODE_CATALOG=upstream throws its
  explanatory error once UPSTREAM_API_BASE_URL is also set (the plan's Step 9
  grep command omits UPSTREAM_API_BASE_URL, but resolveMode() checks that
  before reaching the "does not exist yet" branch — a plan-text gap, not a
  code bug); API_MODE_COMMERCE=upstream with catalog still mocked correctly
  refuses (config.test.ts 9/9).

--- M1 COMPLETE (2026-08-29) --- Tasks 1-13 done. Remaining before sign-off:
user's call on the pre-existing hero-carousel.tsx lint error (out of scope
for this branch's own commits). See M1 Definition of Done below for the
full checklist.

M1 sign-off blocker resolved (2026-08-30, uncommitted in working tree):
components/commerce/hero-carousel.tsx react-hooks/set-state-in-effect error fixed
by a general-purpose subagent. The synchronous `onSelect()` in the effect body was
replaced with embla's own 'init'/'reInit' subscriptions alongside the existing
'select'. Verified first-hand by the controller, not taken from the report:
`npm run lint` 0 errors (2 pre-existing unrelated warnings remain), tsc exit 0,
suite 158 passed/6 skipped. Behaviour is unchanged at mount either way — no
startIndex is passed, so embla's selectedScrollSnap() is 0 at init and already
matches useState(0); the 'reInit' subscription is a small gain (dots now stay
correct across an options-driven reInit, which the old code did not handle).

Spec §15 open questions both closed by the user (2026-08-30):
- Payment methods: QR Pay / ZaloPay / SePay only. COD deferred, not in M2.
- Rx ranges: ship §6 industry defaults as-is against mock data; toric included.
M2 (Purchase core) is unblocked and is the next milestone.

--- M2 PLANNED (2026-08-30) ---
Plan: docs/superpowers/plans/2026-08-30-vivimoon-m2-purchase-core.md (13 tasks).
Scope per spec §13 minus toric, which the user deferred. Task order is
foundation-first: Rx ranges/schemas (1) -> lineKey (2) -> reducer re-keying (3)
-> zustand store (4), because everything downstream keys on lineKey.
Two M1 findings carried into M2's Global Constraints so they are not rediscovered:
proxy.ts (not middleware.ts), and pages must fetch their own /api/* for any state a
route handler mutates (Route Handlers and Server Components are separate module
instances). M1's "Server Components import resources directly" constraint is
explicitly amended, not silently contradicted.
Not yet started — no implementation commits on M2.

--- M2 IN PROGRESS (branch feat/m2-purchase-core) ---
Task 1: complete (ab8550c). Rx range table + schemas. Two plan-text deviations,
  both found by running it: the plan says "spherical" but the real lensTypeSchema
  enum is clear|colored|toric|multifocal; and adding requiresRx broke tsc on 12
  fixture literals because fixtures are typed as the OUTPUT type, where .default()
  makes the field required — the same .default()/z.infer trap as M1 Task 2, in
  reverse. Declared it explicitly on each fixture, matching reviewSchema's `source`.
Tasks 2-4: complete (c3d60be), landed as one commit because re-keying the reducer
  breaks cart-context.tsx, which Task 4 deletes.
  Plan defect found by test, not by reading: the plan asserted skipHydration
  prevents localStorage WRITES before rehydrate(). False — persist wraps setState
  unconditionally, so a pre-hydration mutation overwrites the stored cart before
  merge can union it; skipHydration skips only the initial READ. Store now exposes
  a `hydrated` gate (the only real protection) and keeps a custom merge as defence
  in depth for Task 11's guest-cart merge. Plan text was corrected before coding.
  UPDATE_QTY <= 0 now removes rather than clamping to 1 — a deliberate behaviour
  change from the baseline, documented in the commit.
  Cart/checkout show "—" and the value-bearing analytics events stay unfired until
  Task 7/10 give the server ownership of those totals.
Gates at c3d60be: tsc 0, lint 0 errors, 227 passed / 6 skipped, build succeeds.
Next: Task 5 (RxSelector + Rx-aware add to cart).

### M2 Task 5 — RxSelector and Rx-aware add-to-cart (2026-08-31)

Implemented by a Sonnet subagent under Opus orchestration, per the user's
instruction to hand implementation to a subagent.

**Deviations from plan text, all deliberate:**
- The plan's Step 2 test list named a `spherical` product. The enum is
  `clear | colored | toric | multifocal`; tests use `clear`. Plan corrected.
- Step 3 said "use `Select`/`Input`". Used a **native `<select>`**, not the
  Radix `components/ui/select.tsx`. Two reasons: sph has ~101 options, which
  is the wrong shape for a virtualised popover and worse on mobile; and Radix
  renders no `<option>`s until the popover opens, which would have made the
  plan's own "offers 0.00 / not -7.25 / no CYL control" assertions vacuous.
  Precedent: `components/layout/locale-switcher.tsx`. Radix `Select` is still
  the right control for the short filter lists in `collection-filters.tsx`.
- Dropped the planned `requiresRx` prop from `RxSelector`. Whether to render
  the selector and whether to gate the button are the PDP's decisions; a prop
  meaning "don't render me" only invites an early `return null`.

**Two design traps found before implementation (advisor pass):**
1. `RxSelector` cannot be controlled over `RxInput` — `rxEyeSchema.sph` is a
   required `z.number()`, so `RxInput` has no representation for "no power
   picked yet", and the natural workaround (`sph: 0`) is *plano*, silently
   pre-filling a valid prescription on a product that requires correction.
   Introduced an explicit `RxDraft` (both fields optional) for the selector;
   the cart line is built from `safeParse().data`, never the draft, so
   `cartLineSchema.rx` keeps the parsed output shape and `lineKey` stays
   stable across persisted carts.
2. `add-to-cart.tsx` computes `variant.price * qty` for the GA4 `add_to_cart`
   `value`. The Global Constraint's check was `grep "unitPrice \*"`, which
   that line passes on a technicality. Widened to
   `grep -rnE "(unitPrice|price) \*"` with exactly one expected hit, annotated
   inline as a sanctioned analytics snapshot (GA4 requires a value at add
   time, before any server price exists). Nothing a shopper *sees* is
   computed client-side.

**Fixed during review:** `formatSph` had been duplicated verbatim in
`rx-selector.tsx` and `rx-summary.tsx`. Drift there is user-visible — a cart
line labelled with a power the selector never offered — so it now lives in
`lib/products/rx-ranges.ts` beside `sphSteps()`, which owns that domain.

**Also fixed by the implementer:** the required-Rx hint was gated on
`!canAdd`, so it rendered on mount before any interaction; and because the
button is `disabled` while invalid, no "did they attempt to submit" flag can
ever fire from `onAdd`. Now gated on interaction with `RxSelector`.

**Gates (verified independently by the orchestrator, not taken from the
subagent's report):** `npx tsc --noEmit` exit 0 · `npm run lint` 0 errors /
2 pre-existing warnings · `npx vitest run` 241 passed, 6 skipped ·
`grep -rnE "(unitPrice|price) \*" app components features` → exactly the one
annotated GA4 line.

**Plan correction made while Task 5 ran:** Task 6 (and 8, 9, 10) had invented
four new resource names — `pricing`, `shipping`, `payments`, `orders` — for
`lib/api/config.ts`. Spec §"Cutover order" puts cart pricing, vouchers,
orders and payments in **Group D `commerce`**, which already exists in
`RESOURCES` with the correct dependency rule (`catalog` + `identity` first)
and already has an `API_MODE_COMMERCE` line in `.env.example`. The
established pattern is one directory per *module*, several sharing a
resource: `account/index.ts` and `auth/index.ts` both call
`resolveMode('identity')`. So `pricing/index.ts` calls
`resolveMode('commerce')`, and `config.ts` / `.env.example` are untouched by
Tasks 6, 8, 9 and 10.

### M2 Task 6 — Server-owned pricing and auto-voucher (2026-08-31)

Implemented by a Sonnet subagent under Opus orchestration.

**The security property holds and is tested end to end.** `priceLineInputSchema`
accepts only `{ lineKey, variantId, rx?, quantity }` — it does not list a price
field at all, so zod's default key-stripping removes any client-supplied
`unitPrice` in `parseBody` before pricing runs. There is nothing at runtime to
"ignore"; the field cannot arrive. Asserted twice: at the resource level with a
cast-through-`unknown` rigged body, and end to end through the route handler
with an untyped JSON body claiming `unitPrice: 1`. Both assert against a
non-trivial baseline (2 x 25 + 1 x 48 = 98) established first, so neither can
pass vacuously.

**Design decisions the brief left open, and how they went:**
- Schemas live in `lib/api/schemas/cart.ts` — the spec names `cart.ts` as owner
  of `POST /api/cart/price`.
- **No new `ErrorCode`.** `not_found` (unknown variantId) and
  `validation_failed` (bad quantity, empty cart, mixed currency) both fit.
- **Vouchers do NOT stack.** Exactly one, or none — whichever eligible
  candidate yields the largest discount. Stated in a comment and asserted.
- A candidate whose computed discount is 0 is dropped *before* the "best"
  comparison, so a `shipping`-type voucher cannot "apply" for zero benefit
  while `shipping` is still 0 pre-Task 8. Tested explicitly.
- `voucherApplies` checks `status` AND `expiresAt` independently: a voucher can
  be flagged `active` with a past date if the backend has not swept it yet.
  Fixture `STALE-ACTIVE60` exists solely to make that guard falsifiable.
- Determinism without an injected clock: fixture `expiresAt` dates are 2099 and
  2020, far from any real "now".
- `getVariantById` was added to `mockCatalog` rather than kept as a private
  helper in pricing — catalog owns the catalogue.
- `pricing/mock.ts` imports the **resolved** `catalog` singleton, not
  `mockCatalog` directly, so pricing picks up real prices automatically if
  catalog migrates upstream while commerce is still mocked. Consistent with
  `config.ts`'s `DEPENDS_ON` model.

**Deviation from spec §4, deliberate:** the request body has no top-level
`voucherCode?`. Task 6's interface is auto-apply-only and the implementer
followed it literally. Accepting a client-specified code later is additive,
not breaking.

**Flagged as present but unreachable, so it does not read as covered:** the
mixed-currency guard in `mock.ts` (all fixtures are USD) and the
`lines.length === 0` guard (the route's `.min(1)` rejects that first). Both are
defence for direct/future resource callers.

**Resource seam:** `pricing/index.ts` calls `resolveMode('commerce')` per the
correction recorded under Task 5. `git diff --stat lib/api/config.ts
.env.example` is empty, as required.

**Gates (verified independently by the orchestrator, not taken from the
subagent's report):** `npx tsc --noEmit` exit 0 · `npm run lint` 0 errors /
2 pre-existing warnings · `npx vitest run` 255 passed, 6 skipped (up 14 from
the 241 baseline) · `npm run test:contract` passes · config/env diff empty ·
money grep still the single annotated GA4 line.

### M2 Task 7 — Cart page renders server prices (2026-08-31)

Implemented by a Sonnet subagent under Opus orchestration. This is the task
that closes M2's visible gap: the cart and checkout stopped showing `—` for
prices as of Task 3's deletion of client-side money, and now show real
server-priced totals.

**Correctness properties verified, not just tested:**
- `total` is a prop straight from `POST /api/cart/price`, never
  `subtotal - discount + shipping` on the client. Task 6's voucher math has
  clamps (`Math.min` on `fixed`/`shipping` types, `Math.floor` on `percent`)
  that make client re-derivation not just a style violation but wrong at the
  edges. Money grep still shows exactly the one pre-existing annotated GA4
  line — nothing new.
- The pricing hook's effect depends on `[lines, hydrated, isEmpty]` only —
  never `result`/`isPending` — so setting either from inside the effect
  cannot create a re-price loop that would otherwise pass a naive "renders a
  number" test while silently hammering the endpoint in the browser.
- Stale-response cancellation is proven, not assumed: the test fires request
  A (immediate first-fire), mutates before A resolves (creating request B via
  the debounce), resolves B first, then resolves A *after* B, and asserts the
  displayed result is still B's. Run against a naive sketch first (no
  `cancelled` guard) to confirm the test actually fails for the right reason
  before the real implementation made it pass.
- Empty-cart handling is derived at render time (`isEmpty ? null : result`)
  rather than via `setState` inside the effect — takes effect the instant the
  cart empties, with no one-frame lag, and sidesteps `react-hooks/set-state-in-effect`
  entirely rather than reaching for the codebase's existing eslint-disable
  precedent (hero-carousel.tsx). Repopulating an emptied cart resets the
  first-fire flag too, so it prices immediately rather than sitting through
  the 300ms debounce with a stale result.

**`OrderSummary`'s new props are additive:** `discount?`, `shipping?`, `total?`
all optional, `total` falling back to `subtotal` when absent. `checkout/page.tsx`
was not touched and its `git diff --stat` is confirmed empty — it still calls
`<OrderSummary subtotal={null} .../>` and compiles unchanged.

**Two user-visible side effects worth naming, both intentional:**
1. Added a `!hydrated` skeleton branch to `app/[locale]/cart/page.tsx` before
   the empty-cart check. The pre-existing code checked `lines.length === 0`
   first, so a shopper with a persisted non-empty cart would flash "Your cart
   is empty" for a frame before rehydration completed. Not in the plan's
   literal step list, added because Step 1's "render a pending state until
   rehydrate + first price resolve" implies it.
2. `checkout/page.tsx`'s shipping row now reads "—" instead of the old
   hardcoded "Free", because it calls `OrderSummary` without a `shipping` prop
   and `undefined` now means "pending" under the new convention. The file
   itself is unmodified; this is the new convention working as specified —
   Task 8 supplies a real `shipping` value and this line goes back to
   rendering correctly with no further change to the component.

`RxSummary` renders inside `CartLineItem` (which already receives `dict`),
guarded on `line.rx` — keeps the "two lines, same variant, different power"
distinction local to the component that owns line rendering, per spec §7.

**Gates (verified independently by the orchestrator):** `npx tsc --noEmit`
exit 0 · `npm run lint` 0 errors / 2 pre-existing warnings · `npx vitest run`
272 passed, 6 skipped (+17 from the 255 baseline) · money grep unchanged at
one hit · `git diff --stat app/[locale]/checkout/page.tsx` empty.
