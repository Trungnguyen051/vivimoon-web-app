import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchViaSelf } from './server-fetch';

vi.mock('next/headers', () => ({
  headers: async () => new Headers({ host: 'evil.example', 'x-forwarded-proto': 'https' }),
  cookies: async () => ({ getAll: () => [{ name: 'session', value: 'abc' }] }),
}));

const fetchMock = vi.fn(async () => new Response('{}'));

beforeEach(() => {
  fetchMock.mockClear();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('fetchViaSelf', () => {
  it('ignores the request Host header and targets the loopback origin by default', async () => {
    vi.stubEnv('SELF_ORIGIN', '');
    vi.stubEnv('PORT', '4321');
    await fetchViaSelf('/api/account');
    expect(fetchMock).toHaveBeenCalledWith('http://127.0.0.1:4321/api/account', expect.anything());
  });

  it('uses SELF_ORIGIN when it is set', async () => {
    vi.stubEnv('SELF_ORIGIN', 'http://app.internal:8080');
    await fetchViaSelf('/api/account');
    expect(fetchMock).toHaveBeenCalledWith('http://app.internal:8080/api/account', expect.anything());
  });
});
