'use client';
import { useId } from 'react';
import type { LensType } from '@/lib/api/schemas/catalog';
import type { AddBand } from '@/lib/products/rx-ranges';
import { RX_RANGES, formatSph } from '@/lib/products/rx-ranges';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { FieldSet, FieldLegend } from '@/components/ui/field';

/**
 * Draft (pre-validation) shape the selector is controlled over. `RxInput`
 * (lib/api/schemas/rx.ts) cannot represent "the shopper hasn't picked a power
 * yet" — `sph` is a required number there — so initialising with `sph: 0`
 * would silently pre-fill a valid plano prescription. The draft leaves both
 * fields optional until the shopper actually picks something.
 *
 * No `cyl`/`axis` here: toric is deferred past M2 (spec §15) and this
 * component renders no control for them (see the module doc below).
 */
export type RxEyeDraft = { sph?: number; add?: AddBand };
export type RxDraft = { sameBothEyes: boolean; right: RxEyeDraft; left: RxEyeDraft };
export const emptyRxDraft: RxDraft = { sameBothEyes: false, right: {}, left: {} };

/** Narrower shape than `typeof RX_RANGES` so a page can pass a per-product
 *  stocked subset without carrying `cyl`/`axis` along. */
type RxRanges = { sph: readonly number[]; add: readonly AddBand[] };

function EyeFields({
  eyeLabel,
  value,
  onChange,
  lensType,
  ranges,
  dict,
}: {
  eyeLabel: string;
  value: RxEyeDraft;
  onChange: (next: RxEyeDraft) => void;
  lensType: LensType;
  ranges: RxRanges;
  dict: Dictionary;
}) {
  const sphId = useId();
  const addId = useId();

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <label htmlFor={sphId} className="text-sm font-medium">
          {eyeLabel} {dict.rx.sph}
        </label>
        <select
          id={sphId}
          value={value.sph ?? ''}
          onChange={(e) =>
            onChange({ ...value, sph: e.target.value === '' ? undefined : Number(e.target.value) })
          }
          className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm"
        >
          <option value="">{dict.rx.selectPower}</option>
          {ranges.sph.map((s) => (
            <option key={s} value={s}>
              {s === 0 ? `${formatSph(s)} — ${dict.rx.plano}` : formatSph(s)}
            </option>
          ))}
        </select>
      </div>

      {lensType === 'multifocal' ? (
        <div className="space-y-1.5">
          <label htmlFor={addId} className="text-sm font-medium">
            {eyeLabel} {dict.rx.add}
          </label>
          <select
            id={addId}
            value={value.add ?? ''}
            onChange={(e) =>
              onChange({ ...value, add: e.target.value === '' ? undefined : (e.target.value as AddBand) })
            }
            className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm"
          >
            <option value="">{dict.rx.selectAdd}</option>
            {ranges.add.map((band) => (
              <option key={band} value={band}>
                {dict.rx.addBands[band]}
              </option>
            ))}
          </select>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Collects a shopper's prescription for one product. Renders only the steps
 * the product stocks (`ranges`, defaulting to the full `RX_RANGES` table) and
 * only the eyes/fields relevant to `lensType`.
 *
 * Deliberately has no `requiresRx` prop and never fetches: whether to render
 * this component at all, and whether a valid Rx gates the add-to-cart button,
 * are the page's decisions, not this component's (M1 constraint: `components/`
 * takes props).
 *
 * Renders no CYL or AXIS control for any lens type, including `toric` — that
 * field pair is deferred past M2 (spec §15). Re-enabling toric later means
 * adding controls here deliberately; see rx-selector.test.tsx for the
 * assertion that keeps that a conscious act rather than a silent leak.
 */
export function RxSelector({
  value,
  onChange,
  lensType,
  ranges = RX_RANGES,
  dict,
}: {
  value: RxDraft;
  onChange: (next: RxDraft) => void;
  lensType: LensType;
  ranges?: RxRanges;
  dict: Dictionary;
}) {
  const sameId = useId();

  return (
    <FieldSet className="gap-4">
      <FieldLegend variant="label">{dict.rx.rightEye} / {dict.rx.leftEye}</FieldLegend>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={sameId}
          checked={value.sameBothEyes}
          onChange={(e) => {
            const sameBothEyes = e.target.checked;
            onChange({
              sameBothEyes,
              right: value.right,
              left: sameBothEyes ? { ...value.right } : value.left,
            });
          }}
          className="size-4"
        />
        <label htmlFor={sameId} className="text-sm">{dict.rx.sameBothEyes}</label>
      </div>

      <EyeFields
        eyeLabel={dict.rx.rightEye}
        value={value.right}
        onChange={(nextRight) =>
          onChange({
            sameBothEyes: value.sameBothEyes,
            right: nextRight,
            left: value.sameBothEyes ? { ...nextRight } : value.left,
          })
        }
        lensType={lensType}
        ranges={ranges}
        dict={dict}
      />

      {!value.sameBothEyes ? (
        <EyeFields
          eyeLabel={dict.rx.leftEye}
          value={value.left}
          onChange={(nextLeft) => onChange({ ...value, left: nextLeft })}
          lensType={lensType}
          ranges={ranges}
          dict={dict}
        />
      ) : null}
    </FieldSet>
  );
}
