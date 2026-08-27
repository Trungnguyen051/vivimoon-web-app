import { z } from 'zod';

export const apiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  field: z.string().optional(),
});
export type ApiError = z.infer<typeof apiErrorSchema>;

/** Wraps any payload schema in the shared success/failure envelope. */
export function envelopeSchema<T extends z.ZodTypeAny>(inner: T) {
  return z.discriminatedUnion('ok', [
    z.object({ ok: z.literal(true), data: inner }),
    z.object({ ok: z.literal(false), error: apiErrorSchema }),
  ]);
}

export const okEnvelopeSchema = z.object({ ok: z.literal(true) });

/** Error codes the frontend branches on. Anything else is treated as unknown. */
export const ERROR_CODES = [
  'validation_failed',
  'not_found',
  'unauthorized',
  'conflict',
  'rate_limited',
  'upstream_unavailable',
  'internal',
] as const;
export type ErrorCode = (typeof ERROR_CODES)[number];

export const HTTP_STATUS: Record<ErrorCode, number> = {
  validation_failed: 400,
  not_found: 404,
  unauthorized: 401,
  conflict: 409,
  rate_limited: 429,
  upstream_unavailable: 502,
  internal: 500,
};
