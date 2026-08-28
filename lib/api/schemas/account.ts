import { z } from 'zod';

/**
 * Phone is deliberately absent: the client checklist specifies it as the one
 * immutable field, so it is not expressible in a patch at all rather than
 * being accepted and then ignored.
 */
export const accountPatchSchema = z
  .object({
    name: z.string().trim().min(1, 'Enter your name').optional(),
    email: z.string().email('Enter a valid email address').optional(),
    dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the format YYYY-MM-DD').optional(),
    password: z.string().min(8, 'Use at least 8 characters').optional(),
  })
  .refine((v) => Object.values(v).some((x) => x !== undefined), {
    message: 'Nothing to update',
  });

export type AccountPatch = z.infer<typeof accountPatchSchema>;
