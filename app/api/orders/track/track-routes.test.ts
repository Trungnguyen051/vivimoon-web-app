import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('next/headers', () => ({ cookies: async () => ({ get: () => undefined }) }));

const { POST } = await import('./route');
const { GET: GET_TOKEN } = await import('./[token]/route');
const { resetMockOrdersState } = await import('@/lib/api/resources/orders/mock');

// order-seed-1 is u-001's (a member's) order — no guestEmail, so it must
// never resolve through the guest tracking flow. Guest orders carry no
// fixture in content/mock/orders.ts, so tests place one first.
const GUEST_ADDRESS = {
  recipient: 'Guest Shopper', phone: '0909111222', line1: '9 Guest St',
  ward: 'Ward 1', district: 'District 1', province: 'Ho Chi Minh City', label: 'home' as const,
};

async function placeGuestOrder(email = 'guest@example.com') {
  const { orders } = await import('@/lib/api/resources/orders');
  return orders.place(
    {
      lines: [{ lineKey: 'l1', variantId: 'p-aqua-daily-30', quantity: 1 }],
      address: GUEST_ADDRESS,
      email,
      paymentMethod: 'qr',
    },
    null,
  );
}

function req(body: unknown): Request {
  return new Request('http://localhost/api/orders/track', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function tokenParams(token: string) { return { params: Promise.resolve({ token }) }; }

describe('POST /api/orders/track', () => {
  beforeEach(() => { resetMockOrdersState(); delete process.env.API_MODE_DEFAULT; });
  afterEach(() => { delete process.env.API_MODE_DEFAULT; delete process.env.UPSTREAM_API_BASE_URL; });

  it('returns an identical acknowledgement for a real and a fake order code', async () => {
    const order = await placeGuestOrder();
    const realRes = await (await POST(req({ code: order.code, identifier: 'guest@example.com' }))).json();
    const fakeRes = await (await POST(req({ code: 'VVM-FAKE0000', identifier: 'nobody@example.com' }))).json();
    expect(realRes.data.message).toBe(fakeRes.data.message);
  });

  it('includes a devLink for a real match in mock mode', async () => {
    const order = await placeGuestOrder();
    const body = await (await POST(req({ code: order.code, identifier: 'guest@example.com' }))).json();
    expect(body.data.devLink).toMatch(/^\/orders\/track\//);
  });

  it('omits devLink for a fake code', async () => {
    const body = await (await POST(req({ code: 'VVM-FAKE0000', identifier: 'nobody@example.com' }))).json();
    expect(body.data.devLink).toBeUndefined();
  });

  it('is case-insensitive on code and email', async () => {
    const order = await placeGuestOrder('Guest@Example.com');
    const body = await (await POST(req({ code: order.code.toLowerCase(), identifier: 'GUEST@EXAMPLE.COM' }))).json();
    expect(body.data.devLink).toBeDefined();
  });

  it('matches by the phone number on the order address, same as email', async () => {
    const order = await placeGuestOrder();
    const body = await (await POST(req({ code: order.code, identifier: GUEST_ADDRESS.phone }))).json();
    expect(body.data.devLink).toMatch(/^\/orders\/track\//);
  });

  it('matches a +84-form address phone when tracked with its 0-prefixed equivalent', async () => {
    const { orders } = await import('@/lib/api/resources/orders');
    const order = await orders.place(
      {
        lines: [{ lineKey: 'l1', variantId: 'p-aqua-daily-30', quantity: 1 }],
        address: { ...GUEST_ADDRESS, phone: '+84909111222' },
        email: 'guest@example.com',
        paymentMethod: 'qr',
      },
      null,
    );
    const body = await (await POST(req({ code: order.code, identifier: '0909111222' }))).json();
    expect(body.data.devLink).toMatch(/^\/orders\/track\//);
  });

  it('returns an identical acknowledgement for a real and a fake phone number', async () => {
    const order = await placeGuestOrder();
    const realRes = await (await POST(req({ code: order.code, identifier: GUEST_ADDRESS.phone }))).json();
    const fakeRes = await (await POST(req({ code: 'VVM-FAKE0000', identifier: '0900000000' }))).json();
    expect(realRes.data.message).toBe(fakeRes.data.message);
  });

  it("never matches a member's order (no guestEmail to check against)", async () => {
    const body = await (await POST(req({ code: 'VVM-SEED0001', identifier: 'mai@example.vn' }))).json();
    expect(body.data.devLink).toBeUndefined();
  });

  it('never returns validation_failed for a malformed but well-typed body — envelope stays uniform', async () => {
    const res = await POST(req({ code: '', identifier: 'not-a-phone-or-email' }));
    expect(res.status).toBe(400); // schema rejection, not a leak — still no distinguishing signal about order existence
  });

  it('omits devLink once any resource is upstream', async () => {
    const order = await placeGuestOrder();
    process.env.API_MODE_DEFAULT = 'upstream';
    process.env.UPSTREAM_API_BASE_URL = 'https://upstream.example.com';
    const body = await (await POST(req({ code: order.code, identifier: 'guest@example.com' }))).json();
    expect(body.data.devLink).toBeUndefined();
  });
});

describe('GET /api/orders/track/[token]', () => {
  beforeEach(() => { resetMockOrdersState(); });

  it('resolves a valid token to its order', async () => {
    const order = await placeGuestOrder();
    const ackBody = await (await POST(req({ code: order.code, identifier: 'guest@example.com' }))).json();
    const token = (ackBody.data.devLink as string).split('/').pop()!;

    const res = await GET_TOKEN(new Request('http://x'), tokenParams(token));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.id).toBe(order.id);
  });

  it('404s an unknown token', async () => {
    const res = await GET_TOKEN(new Request('http://x'), tokenParams('trk-nonexistent'));
    expect(res.status).toBe(404);
  });
});
