import { describe, it, expect, vi, afterEach } from 'vitest';
import { apiRequest } from './client';

function mockFetch(body: unknown, status = 200) {
  return vi.fn().mockResolvedValue(
    new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } }),
  );
}

afterEach(() => { vi.unstubAllGlobals(); });

describe('apiRequest', () => {
  it('returns data on a success envelope', async () => {
    vi.stubGlobal('fetch', mockFetch({ ok: true, data: { id: 'u1' } }));
    const result = await apiRequest<{ id: string }>('/api/x');
    expect(result).toEqual({ ok: true, data: { id: 'u1' } });
  });

  it('returns the error envelope on a 4xx rather than throwing', async () => {
    vi.stubGlobal('fetch', mockFetch({ ok: false, error: { code: 'unauthorized', message: 'nope' } }, 401));
    const result = await apiRequest('/api/x');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('unauthorized');
  });

  it('normalizes a non-JSON response into an internal error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html>502</html>', { status: 502 })));
    const result = await apiRequest('/api/x');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('internal');
  });

  it('normalizes a network failure into an internal error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    const result = await apiRequest('/api/x');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('internal');
  });

  it('sends JSON and the same-origin credentials the session cookie needs', async () => {
    const spy = mockFetch({ ok: true, data: null });
    vi.stubGlobal('fetch', spy);
    await apiRequest('/api/x', { method: 'POST', body: { a: 1 } });
    const [, init] = spy.mock.calls[0];
    expect(init.method).toBe('POST');
    expect(init.body).toBe('{"a":1}');
    expect(init.credentials).toBe('same-origin');
    expect(init.headers['content-type']).toBe('application/json');
  });
});
