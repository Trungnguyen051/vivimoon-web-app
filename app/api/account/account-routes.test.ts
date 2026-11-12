import { describe, it, expect, beforeEach, vi } from 'vitest';

const jar = new Map<string, string>();
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => (jar.has(name) ? { name, value: jar.get(name) } : undefined),
    set: (name: string, value: string) => { jar.set(name, value); },
    delete: (name: string) => { jar.delete(name); },
  }),
}));

process.env.AUTH_COOKIE_SECRET = 'test-secret';

const { GET, PATCH, DELETE } = await import('./route');
const { signSession } = await import('@/lib/auth/cookie');
const { resetMockAuthState } = await import('@/lib/api/resources/auth/mock');

function patch(body: unknown): Request {
  return new Request('http://localhost/api/account', {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function del(body?: unknown): Request {
  return new Request('http://localhost/api/account', {
    method: 'DELETE',
    headers: { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

function signIn(userId = 'u-001') { jar.set('vivimoon_session', signSession(userId)); }

describe('account routes', () => {
  beforeEach(() => { jar.clear(); resetMockAuthState(); });

  it('401s GET without a session', async () => {
    const res = await GET();
    expect(res.status).toBe(401);
    expect((await res.json()).error.code).toBe('unauthorized');
  });

  it('401s PATCH without a session', async () => {
    expect((await PATCH(patch({ name: 'X' }))).status).toBe(401);
  });

  it('returns the signed-in user', async () => {
    signIn();
    const body = await (await GET()).json();
    expect(body.data.id).toBe('u-001');
    expect(body.data.name).toBe('Nguyễn Thị Mai');
  });

  it('never returns the password', async () => {
    signIn();
    expect(JSON.stringify(await (await GET()).json())).not.toContain('vivimoon123');
  });

  it('updates the name', async () => {
    signIn();
    const body = await (await PATCH(patch({ name: 'Mai Nguyễn' }))).json();
    expect(body.data.name).toBe('Mai Nguyễn');
  });

  it('rejects an invalid email', async () => {
    signIn();
    const res = await PATCH(patch({ email: 'not-an-email' }));
    expect(res.status).toBe(400);
    expect((await res.json()).error.field).toBe('email');
  });

  it('rejects an empty patch', async () => {
    signIn();
    expect((await PATCH(patch({}))).status).toBe(400);
  });

  it('ignores an attempt to change the phone', async () => {
    signIn();
    const body = await (await PATCH(patch({ name: 'Mai', phone: '0999999999' }))).json();
    expect(body.data.phone).toBe('0912345678');
  });

  it('409s an email change to an email another account already uses', async () => {
    signIn();
    const res = await PATCH(patch({ email: 'linh@example.vn' }));
    expect(res.status).toBe(409);
    expect((await res.json()).error.code).toBe('conflict');
  });

  it('lets an account keep its own email', async () => {
    signIn();
    expect((await PATCH(patch({ email: 'mai@example.vn' }))).status).toBe(200);
  });

  it('401s a new password sent without the current one', async () => {
    signIn();
    const res = await PATCH(patch({ password: 'brandnew1' }));
    expect(res.status).toBe(401);
  });

  it('lets a Google-only account set its first password without a current one', async () => {
    const { mockAuth } = await import('@/lib/api/resources/auth/mock');
    const google = await mockAuth.loginWithGoogle('lan@gmail.com');
    expect(google.hasPassword).toBe(false);
    signIn(google.id);
    const res = await PATCH(patch({ password: 'brandnew1' }));
    expect(res.status).toBe(200);
    expect((await res.json()).data.hasPassword).toBe(true);
    expect((await mockAuth.login({ identifier: 'lan@gmail.com', password: 'brandnew1' })).id).toBe(google.id);
  });

  it('401s a new password with the wrong current password', async () => {
    signIn();
    const res = await PATCH(patch({ password: 'brandnew1', currentPassword: 'wrongwrong' }));
    expect(res.status).toBe(401);
    expect((await res.json()).error.code).toBe('unauthorized');
  });

  it('changes the password given the right current password', async () => {
    signIn();
    const res = await PATCH(patch({ password: 'brandnew1', currentPassword: 'vivimoon123' }));
    expect(res.status).toBe(200);
    const { mockAuth } = await import('@/lib/api/resources/auth/mock');
    expect((await mockAuth.login({ identifier: '0912345678', password: 'brandnew1' })).id).toBe('u-001');
  });

  it('401s a tampered session cookie', async () => {
    jar.set('vivimoon_session', 'u-001.deadbeef');
    expect((await GET()).status).toBe(401);
  });

  it('round-trips gender, Default Rx and onboardedAt', async () => {
    signIn();
    const fields = { gender: 'female', defaultRx: { left: -2.25, right: -3 }, onboardedAt: '2026-01-01T00:00:00.000Z' };
    expect((await (await PATCH(patch(fields))).json()).data).toMatchObject(fields);
    expect((await (await GET()).json()).data).toMatchObject(fields);
  });

  it.each([{ left: 1, right: -1 }, { left: -1, right: 0.5 }, { left: -1.1, right: -1 }])('rejects Default Rx %j', async (defaultRx) => {
    signIn();
    expect((await PATCH(patch({ defaultRx }))).status).toBe(400);
  });

  it('401s DELETE without a session', async () => {
    expect((await DELETE(del())).status).toBe(401);
  });

  it('DELETE removes the user and the session no longer resolves', async () => {
    signIn();
    const res = await DELETE(del({ currentPassword: 'vivimoon123' }));
    expect(res.status).toBe(200);
    expect(jar.has('vivimoon_session')).toBe(false);
    signIn(); // a stale cookie for the deleted user
    expect((await GET()).status).toBe(404);
  });

  it('DELETE refuses without the current password and keeps the account', async () => {
    signIn();
    expect((await DELETE(del())).status).toBe(401);
    expect((await DELETE(del({ currentPassword: 'wrong' }))).status).toBe(401);
    expect(jar.has('vivimoon_session')).toBe(true);
    expect((await GET()).status).toBe(200);
  });
});
