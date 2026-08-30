import { z } from 'zod';
import { sphSteps, addBands, cylValues, axisSteps } from '@/lib/products/rx-ranges';
import { lensTypeSchema } from './catalog';

const SPH_STEPS = sphSteps();
const AXIS_STEPS = axisSteps();

export const rxEyeSchema = z.object({
  sph: z.number().refine((v) => SPH_STEPS.includes(v), 'sph is not a stocked step'),
  /** Multifocal only. Banded LOW/MID/HIGH — contact multifocals are not numeric ADD. */
  add: z.enum(addBands).optional(),
  /** Toric. Deferred past M2 (spec §15) — validated if present, rendered by no
   *  selector yet. Present from day one so lineKey never has to change shape. */
  cyl: z
    .number()
    .refine((v) => (cylValues as readonly number[]).includes(v), 'cyl is not a stocked value')
    .optional(),
  axis: z.number().refine((v) => AXIS_STEPS.includes(v), 'axis must be a 10-degree step').optional(),
});

/**
 * A full prescription. `left` is optional on input and is filled from `right`
 * when `sameBothEyes` is set, so every consumer downstream sees both eyes and
 * never has to branch on absence.
 */
export const rxSchema = z
  .object({
    sameBothEyes: z.boolean().default(false),
    right: rxEyeSchema,
    left: rxEyeSchema.optional(),
  })
  .superRefine((v, ctx) => {
    if (!v.sameBothEyes && !v.left) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['left'],
        message: 'left eye is required unless both eyes are the same',
      });
    }
  })
  .transform((v) => ({
    sameBothEyes: v.sameBothEyes,
    right: v.right,
    // `left` is guaranteed by the refinement above when sameBothEyes is false.
    left: v.sameBothEyes ? v.right : v.left!,
  }));

export type RxEye = z.infer<typeof rxEyeSchema>;

/** Parsed/output shape: `sameBothEyes` is a REQUIRED boolean here, because
 *  `.default()` fills it on parse, and both eyes are present. */
export type Rx = z.infer<typeof rxSchema>;

/** Pre-parse/input shape: `sameBothEyes` and `left` are optional. This is what
 *  the selector builds and what `lineKey()` accepts — see lib/cart/line-key.ts. */
export type RxInput = z.input<typeof rxSchema>;

export type LensType = z.infer<typeof lensTypeSchema>;

/**
 * Narrows the Rx rules to one lens type.
 *
 * Multifocal requires a banded ADD on both eyes; every other type forbids it.
 * `cyl`/`axis` stay optional for ALL types in M2 — toric is deferred (spec
 * §15), so a toric product simply does not collect them yet.
 */
export function rxSchemaForLensType(lensType: LensType) {
  return rxSchema.superRefine((rx, ctx) => {
    for (const side of ['right', 'left'] as const) {
      const eye = rx[side];
      if (lensType === 'multifocal' && eye.add === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [side, 'add'],
          message: 'ADD is required for multifocal lenses',
        });
      }
      if (lensType !== 'multifocal' && eye.add !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [side, 'add'],
          message: 'ADD applies to multifocal lenses only',
        });
      }
    }
  });
}
