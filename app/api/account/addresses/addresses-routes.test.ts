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

const { GET, POST } = await import('./route');
const { PATCH, DELETE } = await import('./[id]/route');
const { signSession } = await import('@/lib/auth/cookie');
const { resetMockAddressesState } = await import('@/lib/api/resources/account/mock');

const ADDRESS = {
  recipient: 'Test User',
  phone: '0909000000',
  line1: '1 Test St',
  ward: 'Ward 1',
  district: 'District 1',
  province: 'Ho Chi Minh City',
  label: 'home' as const,
};

function req(body: unknown, method = 'POST'): Request {
  return new Request('http://localhost/api/account/addresses', {
    method,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function params(id: string) {
  return { params: Promise.resolve({ id }) };
}

function signIn(userId = 'u-001') { jar.set('vivimoon_session', signSession(userId)); }

describe('account address routes', () => {
  beforeEach(() => { jar.clear(); resetMockAddressesState(); });

  it('401s every operation without a session', async () => {
    expect((await GET()).status).toBe(401);
    expect((await POST(req(ADDRESS))).status).toBe(401);
    expect((await PATCH(req({ isDefault: true }, 'PATCH'), params('addr-seed-1'))).status).toBe(401);
    expect((await DELETE(req({}, 'DELETE'), params('addr-seed-1'))).status).toBe(401);
  });

  it('lists the seeded addresses for the signed-in user', async () => {
    signIn();
    const body = await (await GET()).json();
    expect(body.data).toHaveLength(2);
    expect(body.data.find((a: { id: string }) => a.id === 'addr-seed-1').isDefault).toBe(true);
  });

  it('adds an address, not yet default when one already exists', async () => {
    signIn();
    const body = await (await POST(req(ADDRESS))).json();
    expect(body.data).toHaveLength(3);
    expect(body.data[2].isDefault).toBe(false);
  });

  it('makes a brand-new account\'s first address the default', async () => {
    signIn('u-fresh');
    const body = await (await POST(req(ADDRESS))).json();
    expect(body.data).toEqual([expect.objectContaining({ isDefault: true })]);
  });

  it('edits address fields without touching default status', async () => {
    signIn();
    const body = await (await PATCH(req({ line1: '99 New St' }, 'PATCH'), params('addr-seed-2'))).json();
    const edited = body.data.find((a: { id: string }) => a.id === 'addr-seed-2');
    expect(edited.line1).toBe('99 New St');
    expect(edited.isDefault).toBe(false);
  });

  it('marks a different address as default, unsetting the previous one', async () => {
    signIn();
    const body = await (await PATCH(req({ isDefault: true }, 'PATCH'), params('addr-seed-2'))).json();
    expect(body.data.find((a: { id: string }) => a.id === 'addr-seed-1').isDefault).toBe(false);
    expect(body.data.find((a: { id: string }) => a.id === 'addr-seed-2').isDefault).toBe(true);
  });

  it('404s patching an address that does not belong to anyone', async () => {
    signIn();
    expect((await PATCH(req({ isDefault: true }, 'PATCH'), params('addr-nope'))).status).toBe(404);
  });

  it('deletes a non-default address, leaving the default untouched', async () => {
    signIn();
    const body = await (await DELETE(req({}, 'DELETE'), params('addr-seed-2'))).json();
    expect(body.data).toHaveLength(1);
    expect(body.data[0]).toEqual(expect.objectContaining({ id: 'addr-seed-1', isDefault: true }));
  });

  it('deleting the default auto-promotes the most-recently-added remaining address', async () => {
    signIn();
    await POST(req(ADDRESS)); // now 3 addresses: seed-1 (default), seed-2, new one (most recent)
    const body = await (await DELETE(req({}, 'DELETE'), params('addr-seed-1'))).json();
    expect(body.data).toHaveLength(2);
    const promoted = body.data[body.data.length - 1];
    expect(promoted.isDefault).toBe(true);
    expect(promoted.id).not.toBe('addr-seed-1');
    expect(body.data.filter((a: { isDefault: boolean }) => a.isDefault)).toHaveLength(1);
  });

  it('deleting the only address leaves none, not an error', async () => {
    signIn('u-002'); // seeded with exactly one address
    const body = await (await DELETE(req({}, 'DELETE'), params('addr-seed-3'))).json();
    expect(body.ok).toBe(true);
    expect(body.data).toEqual([]);
  });

  it('404s deleting an address that does not exist', async () => {
    signIn();
    expect((await DELETE(req({}, 'DELETE'), params('addr-nope'))).status).toBe(404);
  });
});
