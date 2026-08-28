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
const { GET: session } = await import('./session/route');
const { POST: logout } = await import('./logout/route');
const { POST: otpRequest } = await import('./otp/request/route');
const { POST: otpVerify } = await import('./otp/verify/route');
const { POST: passwordReset } = await import('./password/reset/route');
const { resetMockAuthState } = await import('@/lib/api/resources/auth/mock');

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
    const res = await register(
      post({ identifier: '0912345678', name: 'Dup', password: 'abcdefgh' }),
    );
    expect(res.status).toBe(409);
  });

  it('registers a new account and starts a session', async () => {
    const res = await register(
      post({ identifier: '0900000001', name: 'Mới', password: 'abcdefgh' }),
    );
    expect(res.status).toBe(200);
    expect((await res.json()).data.user.name).toBe('Mới');
    expect(jar.get(SESSION_COOKIE)).toBeTruthy();
  });

  it('signs in with Google and starts a session', async () => {
    const res = await google(post({ idToken: 'mai@example.vn' }));
    expect((await res.json()).data.user.id).toBe('u-001');
    expect(jar.get(SESSION_COOKIE)).toBeTruthy();
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
