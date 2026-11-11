import { describe, it, expect } from 'vitest';
import { POST } from './route';

const post = (body: unknown, raw?: string) =>
  POST(new Request('http://localhost/api/newsletter', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: raw ?? JSON.stringify(body),
  }));

describe('POST /api/newsletter', () => {
  it('accepts a valid address in the standard success envelope', async () => {
    const response = await post({ email: 'ngochan@example.com' });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, data: { email: 'ngochan@example.com' } });
  });

  /** Trimmed, so a trailing space pasted from a contacts app is not a rejection. */
  it('trims before accepting', async () => {
    const body = await (await post({ email: '  ngochan@example.com  ' })).json();

    expect(body.data.email).toBe('ngochan@example.com');
  });

  /**
   * The field is named in the envelope, which is what lets the form put the reason
   * beside the input rather than minting copy of its own.
   */
  it.each([
    ['a malformed address', { email: 'not-an-email' }],
    ['an empty address', { email: '' }],
    ['a missing field', {}],
  ])('rejects %s, naming the field', async (_case, body) => {
    const response = await post(body);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.ok).toBe(false);
    expect(payload.error.code).toBe('validation_failed');
    expect(payload.error.field).toBe('email');
    expect(payload.error.message.trim()).not.toBe('');
  });

  it('rejects a body that is not JSON at all', async () => {
    const response = await post(undefined, 'this is not json');
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.ok).toBe(false);
    expect(payload.error.code).toBe('validation_failed');
  });
});
