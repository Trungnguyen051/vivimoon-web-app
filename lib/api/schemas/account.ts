import { z } from 'zod';
import { addressSchema } from './checkout';

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

/** A shopper's saved shipping address (M3.3, issue #7) — `addressSchema` plus book-keeping fields. */
export const savedAddressSchema = addressSchema.extend({
  id: z.string(),
  isDefault: z.boolean(),
});

/** POST /api/account/addresses body — same shape as checkout's address, no id/isDefault yet. */
export const addressCreateSchema = addressSchema;

/** PATCH /api/account/addresses/:id body — any address field, and/or a default-promotion flag. */
export const addressPatchSchema = addressSchema
  .partial()
  .extend({ isDefault: z.literal(true).optional() })
  .refine((v) => Object.values(v).some((x) => x !== undefined), {
    message: 'Nothing to update',
  });

export type SavedAddress = z.infer<typeof savedAddressSchema>;
export type AddressCreate = z.infer<typeof addressCreateSchema>;
export type AddressPatch = z.infer<typeof addressPatchSchema>;

/** POST /api/account/favorites body (M3.4, issue #8). */
export const favoriteCreateSchema = z.object({ productId: z.string().min(1) });
export type FavoriteCreate = z.infer<typeof favoriteCreateSchema>;
