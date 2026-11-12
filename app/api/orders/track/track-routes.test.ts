import { describe, it, expect, beforeEach } from 'vitest';

const { GET } = await import('./route');
const { resetMockOrdersState } = await import('@/lib/api/resources/orders/mock');

// VVM-SEED0001 is a seeded order (content/mock/orders.ts). Order Lookup is by
// Order Code alone (ADR-0022), so a member's order resolves like any other.
function lookup(code?: string): Promise<Response> {
  const url = new URL('http://localhost/api/orders/track');
  if (code !== undefined) url.searchParams.set('code', code);
  return GET(new Request(url));
}

describe('GET /api/orders/track?code=', () => {
  beforeEach(() => { resetMockOrdersState(); });

  it('returns the order for a matching Order Code', async () => {
    const res = await lookup('VVM-SEED0001');
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.code).toBe('VVM-SEED0001');
  });

  it("never reveals the order's owner, email or payment to a code holder", async () => {
    const body = await (await lookup('VVM-SEED0001')).json();
    expect(body.data).not.toHaveProperty('userId');
    expect(body.data).not.toHaveProperty('guestEmail');
    expect(body.data).not.toHaveProperty('payment');
  });

  it('tolerates a leading #, lowercase and stray spaces', async () => {
    const res = await lookup('  #vvm-seed0001 ');
    expect(res.status).toBe(200);
  });

  it('404s an unknown code', async () => {
    const res = await lookup('VVM-NOPE0000');
    expect(res.status).toBe(404);
  });

  it('rejects a missing or blank code', async () => {
    expect((await lookup()).status).toBe(400);
    expect((await lookup('  # ')).status).toBe(400);
  });
});
