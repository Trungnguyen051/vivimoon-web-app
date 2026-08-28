import type { z } from 'zod';
import { cookies } from 'next/headers';
import { apiFail } from './response';
import { AuthError } from './resources/auth';
import { SESSION_COOKIE, sessionCookieOptions, signSession } from '@/lib/auth/cookie';

/** Parses a JSON body against a schema, returning a 400 envelope on failure. */
export async function parseBody<T extends z.ZodTypeAny>(
  request: Request,
  schema: T,
): Promise<{ ok: true; data: z.infer<T> } | { ok: false; response: Response }> {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return { ok: false, response: apiFail('validation_failed', 'Expected a JSON body') };
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return {
      ok: false,
      response: apiFail('validation_failed', first.message, {
        field: first.path.length > 0 ? first.path.join('.') : undefined,
      }),
    };
  }
  return { ok: true, data: parsed.data };
}

/** Maps a thrown AuthError to its envelope; rethrows anything unexpected. */
export function authErrorResponse(error: unknown): Response {
  if (error instanceof AuthError) return apiFail(error.code, error.message);
  throw error;
}

export async function startSession(userId: string): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, signSession(userId), sessionCookieOptions());
}

export async function endSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}
