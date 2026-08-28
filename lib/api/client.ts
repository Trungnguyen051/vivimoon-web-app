'use client';
import type { ApiError } from './schemas/common';

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiError };

const INTERNAL: ApiError = {
  code: 'internal',
  message: 'Something went wrong. Please try again.',
};

/**
 * Browser-side call to our own route handlers. Returns the envelope instead of
 * throwing, so forms branch on `result.ok` rather than wrapping every call in
 * try/catch. Server Components do not use this — they import the resource
 * module directly.
 */
export async function apiRequest<T>(
  path: string,
  init: Omit<RequestInit, 'body'> & { body?: unknown } = {},
): Promise<ApiResult<T>> {
  const { body, headers, ...rest } = init;
  try {
    const response = await fetch(path, {
      ...rest,
      credentials: 'same-origin', // the session cookie rides on this
      headers: { 'content-type': 'application/json', ...(headers as Record<string, string>) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });

    const json: unknown = await response.json();
    if (
      typeof json === 'object' && json !== null && 'ok' in json &&
      typeof (json as { ok: unknown }).ok === 'boolean'
    ) {
      return json as ApiResult<T>;
    }
    return { ok: false, error: INTERNAL };
  } catch {
    // Network failure, or a non-JSON body such as an HTML error page.
    return { ok: false, error: INTERNAL };
  }
}
