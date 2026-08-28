import type { z } from 'zod';

/**
 * A live response did not match the contract. Carries enough detail to tell
 * Vivimoon's backend developer exactly which field on which endpoint is wrong.
 */
export class UpstreamShapeError extends Error {
  constructor(
    message: string,
    readonly issues: z.ZodIssue[],
    readonly context: string,
  ) {
    super(message);
    this.name = 'UpstreamShapeError';
  }
}

export function parseOrThrow<T extends z.ZodTypeAny>(
  schema: T,
  value: unknown,
  context: string,
): z.infer<T> {
  const result = schema.safeParse(value);
  if (result.success) return result.data;

  const detail = result.error.issues
    .map((i) => `  ${i.path.join('.') || '(root)'}: ${i.message}`)
    .join('\n');
  throw new UpstreamShapeError(
    `Response from ${context} does not match the contract:\n${detail}`,
    result.error.issues,
    context,
  );
}
