import { describe, it, expect, beforeEach, vi } from 'vitest';

// Every catalogue product is `requiresRx`, and pricing refuses a line for one
// without a prescription — so every real-variant fixture line carries this.
const RX = { sameBothEyes: true, right: { sph: -2.5 }, left: { sph: -2.5 } };

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
  { lineKey: 'l1', variantId: 'p-aqua-daily-30', quantity: 2, rx: RX },
  { lineKey: 'l2', variantId: 'p-hazel-monthly-brown-30', quantity: 1, rx: RX },
];

function req(body: unknown): Request {
  return new Request('http://localhost/api/orders', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function validBody(overrides: Record<string, unknown> = {}) {
  return {
    lines: BASELINE_LINES, address: ADDRESS, email: 'alice@example.com', paymentMethod: 'qr', notificationChannel: 'zalo',
    ...overrides,
  };
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

  // ADR-0012: placement refuses rather than quietly placing a smaller order.
  it('400s an order containing a line that is no longer available', async () => {
    const res = await POST(req(validBody({ lines: [{ lineKey: 'l1', variantId: 'ghost', quantity: 1 }] })));
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error.code).toBe('validation_failed');
  });

  // ADR-0025: QR / COD / e-wallet; COD needs no payment intent.
  it('places a COD order with no payment intent', async () => {
    const body = await (await POST(req(validBody({ paymentMethod: 'cod' })))).json();
    expect(body.ok).toBe(true);
    expect(body.data.payment.method).toBe('cod');
    expect(body.data.payment.intent).toBeUndefined();
  });

  it('gives a QR order the QR intent and an e-wallet order the redirect intent', async () => {
    const qr = await (await POST(req(validBody({ paymentMethod: 'qr' })))).json();
    expect(qr.data.payment.intent.qrCode).toBeTruthy();
    expect(qr.data.payment.intent.redirectUrl).toBeUndefined();
    const ewallet = await (await POST(req(validBody({ paymentMethod: 'ewallet' })))).json();
    expect(ewallet.data.payment.intent.redirectUrl).toBeTruthy();
    expect(ewallet.data.payment.intent.qrCode).toBeUndefined();
  });

  it('refuses SePay, which has left the picker', async () => {
    const res = await POST(req(validBody({ paymentMethod: 'sepay' })));
    expect(res.status).toBe(400);
  });

  it('places a guest order without an email', async () => {
    const { email: _email, ...noEmail } = validBody();
    const body = await (await POST(req(noEmail))).json();
    expect(body.ok).toBe(true);
    expect(body.data.guestEmail).toBeUndefined();
  });

  it('requires a notification channel and stores it on the order', async () => {
    const { notificationChannel: _c, ...noChannel } = validBody();
    expect((await POST(req(noChannel))).status).toBe(400);
    const body = await (await POST(req(validBody({ notificationChannel: 'sms' })))).json();
    expect(body.data.notificationChannel).toBe('sms');
  });

  it('refuses the email channel without an email to send to', async () => {
    const { email: _email, ...noEmail } = validBody({ notificationChannel: 'email' });
    expect((await POST(req(noEmail))).status).toBe(400);
  });

  it('stores the order note', async () => {
    const body = await (await POST(req(validBody({ note: 'Giao giờ hành chính' })))).json();
    expect(body.data.note).toBe('Giao giờ hành chính');
  });
});
