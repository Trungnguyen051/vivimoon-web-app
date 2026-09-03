import { cookies, headers } from 'next/headers';

/**
 * Fetches one of this app's own route handlers from a Server Component,
 * forwarding the session cookie. A Server Component and a Route Handler are
 * separate module instances, so this round-trip — not a direct resource
 * import — is what lets a page see what another route handler has mutated
 * into the mock's in-memory store (see app/[locale]/account/page.tsx for
 * the fuller version of this rationale).
 */
export async function fetchViaSelf(path: string): Promise<Response> {
  const hdrs = await headers();
  const host = hdrs.get('host');
  const protocol = hdrs.get('x-forwarded-proto') ?? 'http';
  const cookieHeader = (await cookies()).getAll().map((c) => `${c.name}=${c.value}`).join('; ');

  return fetch(`${protocol}://${host}${path}`, {
    headers: { cookie: cookieHeader },
    cache: 'no-store',
  });
}
