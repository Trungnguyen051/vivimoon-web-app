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
