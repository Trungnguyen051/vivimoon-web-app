import { z } from 'zod';
import { sphSteps, addBands, cylValues, axisSteps } from '@/lib/products/rx-ranges';

/**
 * The correction-complexity vocabulary the Rx rules branch on — owned here,
 * deliberately NOT the product catalog's `productLineSchema` (ADR-0010). The
 * real catalog carries no toric or multifocal product, so nothing in the
 * product taxonomy may imply prescription complexity; these values stay
 * dormant here until a real line for them exists.
 */
export const rxLensTypeSchema = z.enum(['clear', 'colored', 'toric', 'multifocal']);

/**
 * What every live call site passes. A fixed constant rather than a product
 * field: no real product can reach the toric/multifocal branches, so wiring a
 * real signal back in later is a change here, not a schema migration.
 */
export const RX_LENS_TYPE = 'clear' as const satisfies LensType;

const SPH_STEPS = sphSteps();
const AXIS_STEPS = axisSteps();

const sphSchema = z.number().refine((v) => SPH_STEPS.includes(v), 'sph is not a stocked step');

/** A shopper's saved starting point per eye (CONTEXT.md "Default Rx"): myopia only, in 0.25 steps. */
const defaultSphSchema = sphSchema.refine((v) => v <= 0 && Number.isInteger(v * 4), 'Use a value of 0 or below in 0.25 steps');
export const defaultRxSchema = z.object({ left: defaultSphSchema, right: defaultSphSchema });
export type DefaultRx = z.infer<typeof defaultRxSchema>;

export const rxEyeSchema = z.object({
  sph: sphSchema,
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

/**
 * How a lens Cart Line is bought (CONTEXT.md "Purchase Unit", ADR-0023): one
 * lens (`single`) or two (`pair`). A lens's listed price is per single lens.
 */
export const purchaseUnitSchema = z.enum(['single', 'pair']);
export type PurchaseUnit = z.infer<typeof purchaseUnitSchema>;

/** A `single` line's Rx: one `sph`, no eye attached (ADR-0023). */
export const singleRxSchema = z.object({ sph: sphSchema });
export type SingleRx = z.infer<typeof singleRxSchema>;

/** What a lens line carries: a pair's left/right Rx, or a single's lone `sph`. */
export const lineRxSchema = z.union([rxSchema, singleRxSchema]);
export type LineRx = z.infer<typeof lineRxSchema>;
/** Pre-parse form of `LineRx` — what `lineKey()` accepts. */
export type LineRxInput = z.input<typeof lineRxSchema>;

export const isSingleRx = (rx: LineRxInput): rx is SingleRx => 'sph' in rx;

/**
 * A line's unit, reading a unit-less line that carries an Rx as a `pair` —
 * every line persisted before ADR-0023 had a two-eye Rx and meant a pair.
 * A line with no Rx (a non-Rx product) has no unit.
 */
export function purchaseUnitOf(line: { purchaseUnit?: PurchaseUnit; rx?: unknown }): PurchaseUnit | undefined {
  return line.purchaseUnit ?? (line.rx ? 'pair' : undefined);
}

/** Lenses in one unit — what the per-lens price is multiplied by. No unit (a non-Rx product) is one item. */
export const lensesIn = (unit: PurchaseUnit | undefined): number => (unit === 'pair' ? 2 : 1);

/**
 * Shared by every schema carrying a line's unit + Rx: a `single` must carry a
 * single Rx, and a `pair` (or a legacy unit-less line) a two-eye one.
 */
export function refineUnitMatchesRx(line: { purchaseUnit?: PurchaseUnit; rx?: LineRxInput }, ctx: z.RefinementCtx) {
  if (line.rx && isSingleRx(line.rx) !== (purchaseUnitOf(line) === 'single')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['rx'],
      message: 'a single line carries one sph; a pair carries left and right',
    });
  }
}

export type RxEye = z.infer<typeof rxEyeSchema>;

/** Parsed/output shape: `sameBothEyes` is a REQUIRED boolean here, because
 *  `.default()` fills it on parse, and both eyes are present. */
export type Rx = z.infer<typeof rxSchema>;

/** Pre-parse/input shape: `sameBothEyes` and `left` are optional. This is what
 *  the selector builds and what `lineKey()` accepts — see lib/cart/line-key.ts. */
export type RxInput = z.input<typeof rxSchema>;

export type LensType = z.infer<typeof rxLensTypeSchema>;

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
