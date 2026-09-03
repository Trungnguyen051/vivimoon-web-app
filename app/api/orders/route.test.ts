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
const { signSession } = await import('@/lib/auth/cookie');
const { envelopeSchema } = await import('@/lib/api/schemas/common');
const { orderSchema } = await import('@/lib/api/schemas/orders');
const { resetMockOrdersState } = await import('@/lib/api/resources/orders/mock');

function signIn(userId = 'u-001') { jar.set('vivimoon_session', signSession(userId)); }

const ADDRESS = {
  recipient: 'Alice Nguyen',
  phone: '0900000000',
  line1: '1 Le Loi',
  ward: 'Ben Nghe',
  district: 'District 1',
  province: 'Ho Chi Minh City',
  label: 'home' as const,
};

const BASELINE_LINES = [
  { lineKey: 'l1', variantId: 'p-aqua-daily-30', quantity: 2 },
  { lineKey: 'l2', variantId: 'p-hazel-monthly-brown-30', quantity: 1 },
];

function req(body: unknown): Request {
  return new Request('http://localhost/api/orders', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function validBody(overrides: Record<string, unknown> = {}) {
  return { lines: BASELINE_LINES, address: ADDRESS, email: 'alice@example.com', paymentMethod: 'qr', ...overrides };
}

describe('GET /api/orders', () => {
  beforeEach(() => { jar.clear(); resetMockOrdersState(); });

  it('redirects a signed-out visitor to unauthorized', async () => {
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(401);
    expect(body.error.code).toBe('unauthorized');
  });

  it("returns the signed-in shopper's seeded orders without placing any", async () => {
    signIn('u-001');
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.length).toBeGreaterThan(0);
    for (const order of body.data) {
      const result = orderSchema.safeParse(order);
      expect(result.success, JSON.stringify(result.success ? null : result.error.issues)).toBe(true);
      expect(order.userId).toBe('u-001');
    }
  });

  it('is empty, not an error, for a user with no orders', async () => {
    signIn('u-no-orders');
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data).toEqual([]);
  });

  it('shows an order placed during the session immediately after placement', async () => {
    signIn('u-001');
    const placed = await (await POST(req(validBody()))).json();
    const res = await GET();
    const body = await res.json();
    expect(body.data.some((o: { id: string }) => o.id === placed.data.id)).toBe(true);
  });
});

describe('POST /api/orders', () => {
  beforeEach(() => { jar.clear(); resetMockOrdersState(); });

  it('returns a schema-valid envelope for a guest order', async () => {
    const res = await POST(req(validBody()));
    const body = await res.json();
    expect(res.status).toBe(200);
    const result = envelopeSchema(orderSchema).safeParse(body);
    expect(result.success, JSON.stringify(result.success ? null : result.error.issues)).toBe(true);
    expect(body.data.guestEmail).toBe('alice@example.com');
    expect(body.data.userId).toBeUndefined();
  });

  it('attaches the user id when a session is present', async () => {
    signIn('u-001');
    const body = await (await POST(req(validBody()))).json();
    expect(body.data.userId).toBe('u-001');
    expect(body.data.guestEmail).toBeUndefined();
  });

  it('rejects a malformed body with 400 validation_failed', async () => {
    const res = await POST(req(validBody({ lines: [] })));
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error.code).toBe('validation_failed');
  });

  it('404s an unknown variantId with the typed not_found error', async () => {
    const res = await POST(req(validBody({ lines: [{ lineKey: 'l1', variantId: 'ghost', quantity: 1 }] })));
    const body = await res.json();
    expect(res.status).toBe(404);
    expect(body.error.code).toBe('not_found');
  });
});
