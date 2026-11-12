import { cookies } from 'next/headers';

/**
 * Fetches one of this app's own route handlers from a Server Component,
 * forwarding the session cookie. A Server Component and a Route Handler are
 * separate module instances, so this round-trip — not a direct resource
 * import — is what lets a page see what another route handler has mutated
 * into the mock's in-memory store (see app/[locale]/account/page.tsx for
 * the fuller version of this rationale).
 *
 * The origin is fixed, never read off the request's Host header: that header
 * is client-controlled, and trusting it would send the session cookie to
 * whatever host a caller named.
 */
export async function fetchViaSelf(path: string): Promise<Response> {
  // VERCEL_URL is set by the platform, not the request; loopback doesn't reach a Vercel function.
  const origin =
    process.env.SELF_ORIGIN ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://127.0.0.1:${process.env.PORT ?? 3000}`);
  const cookieHeader = (await cookies()).getAll().map((c) => `${c.name}=${c.value}`).join('; ');

  return fetch(`${origin}${path}`, {
    headers: { cookie: cookieHeader },
    cache: 'no-store',
  });
}
