'use client';
import { useId } from 'react';
import Link from 'next/link';
import { ChevronDown, Info } from 'lucide-react';
import type { LineRx, PurchaseUnit } from '@/lib/api/schemas/rx';
import { sphSteps, formatSph } from '@/lib/products/rx-ranges';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { cn } from '@/lib/utils/cn';

/**
 * What the buy box is controlled over: the Purchase Unit plus a power per eye
 * (ADR-0023). Every power starts at 0.00 (designer note "Dev: default độ
 * cận"), so a draft is always a valid Rx and the buttons always work. The
 * single field edits `left` and `right` together, so switching unit keeps the
 * power already chosen; switching back from a pair shows the left eye's.
 */
export type RxDraft = { unit: PurchaseUnit; left: number; right: number; rightSameAsLeft: boolean };
export const defaultRxDraft: RxDraft = { unit: 'single', left: 0, right: 0, rightSameAsLeft: false };

export function draftToRx(d: RxDraft): LineRx {
  if (d.unit === 'single') return { sph: d.left };
  const right = d.rightSameAsLeft ? d.left : d.right;
  return { sameBothEyes: d.rightSameAsLeft, left: { sph: d.left }, right: { sph: right } };
}

// "Độ cận": myopia only, plano first. The mini cart's power chips offer the same.
export const STEPS = sphSteps().filter((v) => v <= 0).reverse();
const SAME = 'same';

function PowerField({
  label, value, onChange, dict, sameAsLeft,
}: {
  label?: string;
  value: number | typeof SAME;
  onChange: (next: number | typeof SAME) => void;
  dict: Dictionary;
  /** Offers "Giống mắt trái" — the right eye's field only. */
  sameAsLeft?: boolean;
}) {
  const id = useId();
  const hintId = useId();
  const zero = value === 0;
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
      {label ? <label htmlFor={id} className="text-xs font-medium text-muted-foreground">{label}</label> : null}
      <div className="relative">
        <select
          id={id}
          aria-label={label ? undefined : dict.rx.power}
          aria-describedby={zero ? hintId : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value === SAME ? SAME : Number(e.target.value))}
          className="min-h-12 w-full appearance-none rounded-md border border-input bg-background pr-10 pl-4 text-base tabular-nums transition-colors hover:border-foreground/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          {sameAsLeft ? <option value={SAME}>{dict.rx.sameAsLeft}</option> : null}
          {STEPS.map((s) => (
            <option key={s} value={s}>{s === 0 ? `${formatSph(s)} (${dict.rx.noPower})` : formatSph(s)}</option>
          ))}
        </select>
        <ChevronDown aria-hidden className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-muted-foreground" />
      </div>
      {zero ? <p id={hintId} className="text-xs text-muted-foreground">{dict.rx.zeroHint}</p> : null}
    </div>
  );
}

/**
 * The buy box's "Mua theo" choice and its power field(s): one "Độ cận" field
 * for 1 chiếc, "Mắt trái (L)" and "Mắt phải (R)" for 1 đôi. Takes props and
 * never fetches (M1 constraint: `components/` takes props).
 */
export function RxSelector({
  value, onChange, guideHref, dict,
}: {
  value: RxDraft;
  onChange: (next: RxDraft) => void;
  guideHref: string;
  dict: Dictionary;
}) {
  const units: PurchaseUnit[] = ['single', 'pair'];
  return (
    <div className="flex flex-col gap-6">
      <div role="group" aria-label={dict.pdp.buyAs} className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">{dict.pdp.buyAs}</p>
        <div className="flex gap-2">
          {units.map((unit) => (
            <button
              key={unit}
              type="button"
              aria-pressed={value.unit === unit}
              onClick={() => onChange({ ...value, unit })}
              className={cn(
                'h-11 flex-1 rounded-md border px-4 text-sm transition-colors sm:flex-none',
                value.unit === unit
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-input bg-background hover:border-foreground/40',
              )}
            >
              {dict.pdp.unitOptions[unit]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">{dict.rx.power}</p>
          <Link href={guideHref} className="flex items-center gap-1.5 text-sm underline underline-offset-4 hover:text-primary">
            <Info aria-hidden className="size-4" />
            {dict.rx.guide}
          </Link>
        </div>
        {value.unit === 'single' ? (
          <PowerField
            value={value.left}
            onChange={(sph) => onChange({ ...value, left: sph as number, right: sph as number, rightSameAsLeft: false })}
            dict={dict}
          />
        ) : (
          <div className="flex gap-3">
            <PowerField label={dict.rx.leftEye} value={value.left} onChange={(sph) => onChange({ ...value, left: sph as number })} dict={dict} />
            <PowerField
              label={dict.rx.rightEye}
              value={value.rightSameAsLeft ? SAME : value.right}
              onChange={(next) => onChange(next === SAME ? { ...value, rightSameAsLeft: true } : { ...value, right: next, rightSameAsLeft: false })}
              dict={dict}
              sameAsLeft
            />
          </div>
        )}
        <p className="text-xs text-muted-foreground/80">{value.unit === 'single' ? dict.rx.unsureHint : dict.rx.pairHint}</p>
      </div>
    </div>
  );
}
