import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

export const SESSION_COOKIE = 'vivimoon_session';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function secret(): string {
  const value = process.env.AUTH_COOKIE_SECRET;
  if (!value) throw new Error('AUTH_COOKIE_SECRET is not set');
  return value;
}

function sign(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('hex');
}

/** `<userId>.<hmac>` — opaque to the browser, which never reads it anyway. */
export function signSession(userId: string): string {
  return `${userId}.${sign(userId)}`;
}

/**
 * Returns the user id only for a value this server signed. Every other input —
 * tampered, truncated, non-hex, absent — returns null instead of throwing, so a
 * hostile cookie signs the visitor out rather than crashing the render.
 */
export function verifySession(value: string | undefined): string | null {
  if (!value) return null;
  const index = value.lastIndexOf('.');
  if (index <= 0) return null;

  const payload = value.slice(0, index);
  const provided = Buffer.from(value.slice(index + 1), 'hex');
  const expected = Buffer.from(sign(payload), 'hex');
  if (provided.length !== expected.length) return null;
  return timingSafeEqual(provided, expected) ? payload : null;
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  };
}

/** Reads the verified user id in a Server Component or route handler. */
export async function readSessionUserId(): Promise<string | null> {
  const jar = await cookies();
  return verifySession(jar.get(SESSION_COOKIE)?.value);
}
