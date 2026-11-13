import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const jar = new Map<string, string>();
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => (jar.has(name) ? { name, value: jar.get(name) } : undefined),
    set: (name: string, value: string) => {
      jar.set(name, value);
    },
    delete: (name: string) => {
      jar.delete(name);
    },
  }),
}));

process.env.AUTH_COOKIE_SECRET = 'test-secret';

const { POST: login } = await import('./login/route');
const { POST: register } = await import('./register/route');
const { POST: google } = await import('./google/route');
const { POST: apple } = await import('./apple/route');
const { GET: session } = await import('./session/route');
const { POST: logout } = await import('./logout/route');
const { POST: otpRequest } = await import('./otp/request/route');
const { POST: otpVerify } = await import('./otp/verify/route');
const { POST: passwordReset } = await import('./password/reset/route');
const { resetMockAuthState } = await import('@/lib/api/resources/auth/mock');
const { resetMockLoyaltyState } = await import('@/lib/api/resources/loyalty/mock');
const { loyalty } = await import('@/lib/api/resources/loyalty');
const { resetMockOrdersState } = await import('@/lib/api/resources/orders/mock');
const { GET: listOrders, POST: placeOrder } = await import('../orders/route');
const { GET: orderDetail } = await import('../orders/[id]/route');
type Order = import('@/lib/api/schemas/orders').Order;

function post(body: unknown): Request {
  return new Request('http://localhost/api/auth', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const SESSION_COOKIE = 'vivimoon_session';

describe('auth routes', () => {
  beforeEach(() => {
    jar.clear();
    resetMockAuthState();
    resetMockLoyaltyState();
    resetMockOrdersState();
  });

  afterEach(() => {
    delete process.env.API_MODE_CATALOG;
    delete process.env.UPSTREAM_API_BASE_URL;
  });

  it('logs in and sets the session cookie', async () => {
    const res = await login(post({ identifier: '0912345678', password: 'vivimoon123' }));
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.data.user.name).toBe('Nguyễn Thị Mai');
    expect(jar.get(SESSION_COOKIE)).toBeTruthy();
  });

  it('never returns the session token in the body', async () => {
    const res = await login(post({ identifier: '0912345678', password: 'vivimoon123' }));
    const token = jar.get(SESSION_COOKIE);
    expect(token).toBeTruthy(); // otherwise the assertion below is vacuous
    expect(JSON.stringify(await res.json())).not.toContain(token!);
  });

  it('never returns the password in the body', async () => {
    const res = await login(post({ identifier: '0912345678', password: 'vivimoon123' }));
    expect(JSON.stringify(await res.json())).not.toContain('vivimoon123');
  });

  it('401s a wrong password without setting a cookie', async () => {
    const res = await login(post({ identifier: '0912345678', password: 'wrong' }));
    expect(res.status).toBe(401);
    expect((await res.json()).error.code).toBe('unauthorized');
    expect(jar.has(SESSION_COOKIE)).toBe(false);
  });

  it('400s a malformed identifier', async () => {
    const res = await login(post({ identifier: 'nope', password: 'x' }));
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe('validation_failed');
  });

  it('400s a body that is not JSON', async () => {
    const res = await login(
      new Request('http://localhost/api/auth', { method: 'POST', body: 'not json' }),
    );
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe('validation_failed');
  });

  it('409s a duplicate registration', async () => {
    const res = await register(post({ phone: '0912345678', name: 'Dup', password: 'abcdefgh' }));
    expect(res.status).toBe(409);
  });

  it('register returns a signup challenge and sets no session; login before verify fails', async () => {
    const res = await register(post({ phone: '0900000001', name: 'Mới', password: 'abcdefgh' }));
    expect(res.status).toBe(200);
    expect((await res.json()).data.otpId).toBeTruthy();
    expect(jar.get(SESSION_COOKIE)).toBeUndefined();
    const attempt = await login(post({ identifier: '0900000001', password: 'abcdefgh' }));
    expect(attempt.status).toBe(401);
  });

  it('verifying the signup challenge starts a session; a wrong code does not', async () => {
    const { data } = await (await register(post({ phone: '0900000003', name: 'Mới', password: 'abcdefgh' }))).json();
    const wrong = data.devCode === '000000' ? '111111' : '000000';
    expect((await otpVerify(post({ otpId: data.otpId, code: wrong }))).status).toBe(401);
    expect(jar.get(SESSION_COOKIE)).toBeUndefined();
    const res = await otpVerify(post({ otpId: data.otpId, code: data.devCode }));
    expect((await res.json()).data.user.name).toBe('Mới');
    expect(jar.get(SESSION_COOKIE)).toBeTruthy();
  });

  it('verifying a sign-up credits the Held Points for that phone, exactly once (ADR-0024)', async () => {
    const order = { id: 'order-guest', code: 'VVM-GUEST', totals: { total: 580_000, pointsToEarn: 58 } } as Order;
    await loyalty.hold('0900 000 004', order); // typed with spaces at checkout
    await loyalty.hold('0999999999', order); // someone else's number stays held

    const { data } = await (await register(post({ phone: '+84900000004', name: 'Mới', password: 'abcdefgh' }))).json();
    const { data: verified } = await (await otpVerify(post({ otpId: data.otpId, code: data.devCode }))).json();
    const userId = verified.user.id;
    expect((await loyalty.get(userId)).balance).toBe(58);
    expect((await loyalty.get(userId)).history[0].orderId).toBe('order-guest');

    // A later OTP sign-in verifies the phone again but has nothing left to credit.
    const challenge = await (await otpRequest(post({ identifier: '0900000004', purpose: 'login' }))).json();
    await otpVerify(post({ otpId: challenge.data.otpId, code: challenge.data.devCode }));
    expect((await loyalty.get(userId)).balance).toBe(58);
    expect(await loyalty.claimHeld('0999999999', 'u-other')).toBe(58);
  });

  it('verifying a phone joins every guest order placed with it, once, and still credits Held Points once (ADR-0026)', async () => {
    const guestOrder = async (phone: string) => (await (await placeOrder(post({
      lines: [{ lineKey: 'l1', variantId: 'p-aqua-daily-30', quantity: 1, rx: { sameBothEyes: true, right: { sph: -2.5 }, left: { sph: -2.5 } } }],
      address: { recipient: 'Mới', phone, line1: '1 Le Loi', ward: 'Ben Nghe', district: 'District 1', province: 'Ho Chi Minh City', label: 'home' },
      paymentMethod: 'cod', notificationChannel: 'zalo',
    }))).json()).data as Order;
    // However the number was typed at checkout, it's the same phone.
    const mine = [await guestOrder('0900 000 005'), await guestOrder('0900.000.005'), await guestOrder('+84-900-000-005')];
    const someoneElses = await guestOrder('0999999999');

    const { data } = await (await register(post({ phone: '0900000005', name: 'Mới', password: 'abcdefgh' }))).json();
    const { data: verified } = await (await otpVerify(post({ otpId: data.otpId, code: data.devCode }))).json();
    const userId = verified.user.id;
    const historyIds = async () => ((await (await listOrders()).json()).data as Order[]).map((o) => o.id).sort();
    const detail = (id: string) => orderDetail(post({}), { params: Promise.resolve({ id }) });

    expect(await historyIds()).toEqual(mine.map((o) => o.id).sort());
    expect((await detail(mine[0].id)).status).toBe(200);
    expect((await detail(someoneElses.id)).status).toBe(404);
    const earned = mine.reduce((sum, o) => sum + (o.totals.pointsToEarn ?? 0), 0);
    expect(earned).toBeGreaterThan(0);
    expect((await loyalty.get(userId)).balance).toBe(earned);

    // A later OTP sign-in verifies the phone again: nothing joins or pays out twice.
    const challenge = await (await otpRequest(post({ identifier: '0900000005', purpose: 'login' }))).json();
    await otpVerify(post({ otpId: challenge.data.otpId, code: challenge.data.devCode }));
    expect(await historyIds()).toEqual(mine.map((o) => o.id).sort());
    expect((await loyalty.get(userId)).balance).toBe(earned);
  });

  it('400s a registration without a password', async () => {
    const res = await register(post({ phone: '0900000002', name: 'NoPw' }));
    expect(res.status).toBe(400);
  });

  it('signs in with Google and starts a session', async () => {
    const res = await google(post({ idToken: 'mai@example.vn' }));
    expect((await res.json()).data.user.id).toBe('u-001');
    expect(jar.get(SESSION_COOKIE)).toBeTruthy();
  });

  it('signs in with Apple and starts a session', async () => {
    const res = await apple(post({ idToken: 'mai@example.vn' }));
    expect((await res.json()).data.user.id).toBe('u-001');
    expect(jar.get(SESSION_COOKIE)).toBeTruthy();
  });

  it('refuses Apple sign-in in a production build', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    try {
      const res = await apple(post({ idToken: 'mai@example.vn' }));
      expect(res.status).toBe(401);
      expect(jar.has(SESSION_COOKIE)).toBe(false);
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it('refuses Google sign-in in a production build, where the mock cannot verify a token', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    try {
      const res = await google(post({ idToken: 'mai@example.vn' }));
      expect(res.status).toBe(401);
      expect((await res.json()).error.code).toBe('unauthorized');
      expect(jar.has(SESSION_COOKIE)).toBe(false);
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it('returns the current user from the session cookie', async () => {
    await login(post({ identifier: '0912345678', password: 'vivimoon123' }));
    const body = await (await session()).json();
    expect(body.data.user.id).toBe('u-001');
  });

  it('returns a null user with no cookie', async () => {
    const body = await (await session()).json();
    expect(body.data.user).toBeNull();
  });

  it('returns a null user for a forged cookie', async () => {
    // Short signature (fails on length) and a full-width one (fails on compare).
    for (const forged of ['u-001.deadbeef', `u-001.${'a'.repeat(64)}`]) {
      jar.set(SESSION_COOKIE, forged);
      const body = await (await session()).json();
      expect(body.data.user).toBeNull();
    }
  });

  it('clears the cookie on logout', async () => {
    await login(post({ identifier: '0912345678', password: 'vivimoon123' }));
    await logout();
    expect(jar.has(SESSION_COOKIE)).toBe(false);
  });

  it('issues and verifies an OTP end to end', async () => {
    const challenge = (
      await (await otpRequest(post({ identifier: '0912345678', purpose: 'login' }))).json()
    ).data;
    const res = await otpVerify(post({ otpId: challenge.otpId, code: challenge.devCode }));
    expect((await res.json()).data.kind).toBe('session');
    expect(jar.get(SESSION_COOKIE)).toBeTruthy();
  });

  it('401s a wrong OTP code', async () => {
    const challenge = (
      await (await otpRequest(post({ identifier: '0912345678', purpose: 'login' }))).json()
    ).data;
    const res = await otpVerify(post({ otpId: challenge.otpId, code: '000000' }));
    expect(res.status).toBe(401);
    expect(jar.has(SESSION_COOKIE)).toBe(false);
  });

  it('resets a password without logging in at the verify step', async () => {
    const challenge = (
      await (await otpRequest(post({ identifier: '0912345678', purpose: 'reset' }))).json()
    ).data;
    const verified = (
      await (await otpVerify(post({ otpId: challenge.otpId, code: challenge.devCode }))).json()
    ).data;
    expect(verified.kind).toBe('reset');
    // A reset challenge proves the phone, not the password — no session yet.
    expect(jar.has(SESSION_COOKIE)).toBe(false);

    const res = await passwordReset(
      post({ resetToken: verified.resetToken, newPassword: 'newpassword' }),
    );
    expect((await res.json()).data.user.id).toBe('u-001');
    expect(jar.get(SESSION_COOKIE)).toBeTruthy();

    jar.clear();
    const relogin = await login(post({ identifier: '0912345678', password: 'newpassword' }));
    expect(relogin.status).toBe(200);
  });

  it('strips devCode when any resource is upstream', async () => {
    process.env.API_MODE_CATALOG = 'upstream';
    process.env.UPSTREAM_API_BASE_URL = 'https://api.example.com';
    const body = await (
      await otpRequest(post({ identifier: '0912345678', purpose: 'login' }))
    ).json();
    expect(body.data.otpId).toBeTruthy();
    expect(body.data.devCode).toBeUndefined();
    expect(JSON.stringify(body)).not.toContain('devCode');
  });

  it('strips devCode in a production build even with mock config', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    try {
      const body = await (
        await otpRequest(post({ identifier: '0912345678', purpose: 'login' }))
      ).json();
      expect(body.data.otpId).toBeTruthy();
      expect(body.data.devCode).toBeUndefined();
    } finally {
      vi.unstubAllEnvs();
    }
  });
});
