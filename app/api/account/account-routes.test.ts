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

const { GET, PATCH } = await import('./route');
const { signSession } = await import('@/lib/auth/cookie');
const { resetMockAuthState } = await import('@/lib/api/resources/auth/mock');

function patch(body: unknown): Request {
  return new Request('http://localhost/api/account', {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
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

  it('401s a tampered session cookie', async () => {
    jar.set('vivimoon_session', 'u-001.deadbeef');
    expect((await GET()).status).toBe(401);
  });
});
