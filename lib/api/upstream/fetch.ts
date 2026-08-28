import type { z } from 'zod';
import { upstreamBaseUrl, upstreamTimeoutMs } from '@/lib/api/config';
import { envelopeSchema, type ApiError } from '@/lib/api/schemas/common';
import { parseOrThrow } from './validate';

/**
 * zod v3's discriminatedUnion widens the `ok` literal when threaded through
 * two levels of generics (envelopeSchema<T> inside parseOrThrow<T2>), so the
 * inferred type loses its discriminant and `.ok` narrowing stops working.
 * Assert the shape explicitly instead of trusting z.infer here.
 */
type Envelope<T> = { ok: true; data: T } | { ok: false; error: ApiError };

export class UpstreamRequestError extends Error {
  constructor(message: string, readonly status: number, readonly context: string) {
    super(message);
    this.name = 'UpstreamRequestError';
  }
}

/**
 * Server-to-server call to Vivimoon's API. Never called from the browser —
 * the browser talks to our route handlers, which call this.
 */
export async function upstreamFetch<T extends z.ZodTypeAny>(
  path: string,
  schema: T,
  init: RequestInit & { token?: string } = {},
): Promise<z.infer<T>> {
  const { token, ...rest } = init;
  const context = `${rest.method ?? 'GET'} ${path}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), upstreamTimeoutMs());

  let response: Response;
  try {
    response = await fetch(`${upstreamBaseUrl()}${path}`, {
      ...rest,
      signal: controller.signal,
      headers: {
        'content-type': 'application/json',
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...rest.headers,
      },
    });
  } catch (cause) {
    const reason = cause instanceof Error && cause.name === 'AbortError'
      ? `timed out after ${upstreamTimeoutMs()}ms`
      : 'network error';
    throw new UpstreamRequestError(`${context} ${reason}`, 0, context);
  } finally {
    clearTimeout(timer);
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    throw new UpstreamRequestError(
      `${context} returned ${response.status} with a non-JSON body`,
      response.status,
      context,
    );
  }

  const envelope = parseOrThrow(envelopeSchema(schema), json, context) as Envelope<z.infer<T>>;
  if (!envelope.ok) {
    throw new UpstreamRequestError(
      `${context} failed: ${envelope.error.code} — ${envelope.error.message}`,
      response.status,
      context,
    );
  }
  return envelope.data;
}
