import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { signSession, verifySession, SESSION_COOKIE, sessionCookieOptions } from './cookie';

const THIRTY_ONE_DAYS_MS = 31 * 24 * 60 * 60 * 1000;

const saved = { ...process.env };
beforeEach(() => {
  process.env = { ...saved, AUTH_COOKIE_SECRET: 'test-secret' };
});
afterEach(() => {
  process.env = { ...saved };
});

describe('session cookie', () => {
  it('round-trips a user id', () => {
    expect(verifySession(signSession('u-001'))).toBe('u-001');
  });

  it('rejects a tampered payload', () => {
    const token = signSession('u-001');
    const sigIndex = token.lastIndexOf('.');
    const sig = token.slice(sigIndex + 1);
    const issuedAt = token.slice(0, sigIndex).split('.').pop();
    // Same signature, different userId — the hmac no longer matches the payload.
    expect(verifySession(`u-999.${issuedAt}.${sig}`)).toBeNull();
  });

  it('rejects a bad signature', () => {
    expect(verifySession('u-001.deadbeef')).toBeNull();
  });

  it('rejects a malformed value', () => {
    expect(verifySession('nonsense')).toBeNull();
    expect(verifySession('')).toBeNull();
  });

  it('produces a different signature under a different secret', () => {
    const a = signSession('u-001');
    process.env.AUTH_COOKIE_SECRET = 'other-secret';
    expect(verifySession(a)).toBeNull();
  });

  it('names the cookie', () => {
    expect(SESSION_COOKIE).toBe('vivimoon_session');
  });

  // Anything a browser can send lands here. None of it may throw: an exception
  // in a Server Component or the route guard would surface as a 500 rather than
  // a signed-out visitor.
  it('returns null rather than throwing on hostile input', () => {
    const hostile = [
      undefined,
      '.',
      '..',
      '.abcdef',
      'u-001.',
      'u-001.zzzz',
      'u-001.abc', // odd-length hex
      'u-001.' + 'ff'.repeat(64), // signature longer than sha256
      '👻.👻',
      'a'.repeat(10000),
    ];
    for (const value of hostile) {
      expect(() => verifySession(value)).not.toThrow();
      expect(verifySession(value)).toBeNull();
    }
  });

  it('keeps a dot-bearing user id intact', () => {
    expect(verifySession(signSession('u.0.01'))).toBe('u.0.01');
  });

  it('rejects an expired session', () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
      const token = signSession('u-001');
      expect(verifySession(token)).toBe('u-001'); // valid the instant it's issued
      vi.setSystemTime(new Date('2026-01-01T00:00:00Z').getTime() + THIRTY_ONE_DAYS_MS);
      expect(verifySession(token)).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it('is httpOnly, lax and site-wide', () => {
    const options = sessionCookieOptions();
    expect(options.httpOnly).toBe(true);
    expect(options.sameSite).toBe('lax');
    expect(options.path).toBe('/');
    expect(options.maxAge).toBeGreaterThan(0);
  });
});
