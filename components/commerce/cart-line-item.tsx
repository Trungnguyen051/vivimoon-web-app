import Image from 'next/image';
import { ChevronDown, Trash2, X } from 'lucide-react';
import type { ReactNode } from 'react';
import type { CartLine } from '@/features/cart/cart.types';
import type { Accessory, Variant } from '@/lib/api/schemas/catalog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { formatPrice } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import { QuantityStepper } from './quantity-stepper';
import { LineSummary, formatPower } from './line-summary';
import { STEPS } from './rx-selector';
import { formatSph } from '@/lib/products/rx-ranges';
import { editLens, powersOf, type Eye } from '@/lib/cart/edit-line';
import { purchaseUnitOf, type PurchaseUnit } from '@/lib/api/schemas/rx';

export function CartLineItem({
  line, locale, dict, lineTotal = null, unavailable = false, onQty, onRemove, accessory, onVariant, onEdit, compact = false,
}: {
  line: CartLine; locale: Locale; dict: Dictionary;
  /** Set to make a lens line's unit and powers editable in place; the cart re-keys and merges it. */
  onEdit?: (lineKey: string, line: CartLine) => void;
  /** The mini cart's tighter layout (Figma 57:2). */
  compact?: boolean;
  /** Set for an accessory line: its variants feed the line's option picker. */
  accessory?: Accessory;
  onVariant?: (lineKey: string, variant: Variant) => void;
  /** Server-priced line total. Null until POST /api/cart/price answers. */
  lineTotal?: number | null;
  /**
   * The catalogue no longer sells this variant (ADR-0012). The line stays
   * visible and removable but carries no price and no quantity control —
   * there is nothing to re-price it to.
   */
  unavailable?: boolean;
  onQty: (lineKey: string, qty: number) => void;
  onRemove: (lineKey: string) => void;
}) {
  const editable = Boolean(onEdit && line.rx && !unavailable);
  return (
    <div className={cn('flex gap-4 border-b', compact ? 'py-5' : 'py-6 first:pt-0', unavailable && 'opacity-60')}>
      <div className={cn('relative shrink-0 overflow-hidden rounded-lg bg-muted', compact ? 'size-[72px] sm:size-[88px]' : 'size-24')}>
        {line.image ? <Image src={line.image} alt={line.name} fill className="object-cover" sizes="96px" /> : null}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-medium leading-snug">
              {compact && line.productLine && line.replacement
                ? `${line.name} · ${dict.filters.productLines[line.productLine]} ${dict.filters.replacements[line.replacement]}`
                : line.name}
            </p>
            {accessory ? (
              <AccessoryOptionPicker line={line} accessory={accessory} dict={dict} disabled={unavailable} onVariant={onVariant} />
            ) : compact ? null : (
              <p className="mt-1 text-sm text-muted-foreground">{line.color || line.sku}</p>
            )}
            {/* Two lines can share a variantId and differ only by prescription
                (spec §7) — without this they'd read as a duplicate-line bug. */}
            {editable ? null : <LineSummary line={line} dict={dict} />}
            {unavailable ? (
              <p className="mt-2 text-sm font-medium text-destructive">{dict.cart.unavailable}</p>
            ) : null}
          </div>
          <button
            onClick={() => onRemove(line.lineKey)}
            aria-label={dict.cart.remove}
            className="-mr-1 flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {compact ? <Trash2 className="size-4" /> : <X className="size-4" />}
          </button>
        </div>
        {/* Below the name row, full width, so a pair's three chips fit beside the image on a phone. */}
        {editable && onEdit ? <LensChips line={line} dict={dict} onEdit={(next) => onEdit(line.lineKey, next)} /> : null}
        <div className={cn('mt-auto flex items-end justify-between gap-3', compact ? 'pt-3' : 'pt-4')}>
          {unavailable ? null : (
            <QuantityStepper
              value={line.quantity}
              onChange={(next) => onQty(line.lineKey, next)}
              decreaseLabel={dict.common.decreaseQty}
              increaseLabel={dict.common.increaseQty}
            />
          )}
          <p className="ml-auto font-semibold tabular-nums">
            {unavailable || lineTotal === null ? '—' : formatPrice(lineTotal, line.currency, locale)}
          </p>
        </div>
      </div>
    </div>
  );
}

/** "Dung tích 120ml": a picker when the accessory has more than one variant, plain text otherwise. */
function AccessoryOptionPicker({ line, accessory, dict, disabled, onVariant }: {
  line: CartLine; accessory: Accessory; dict: Dictionary; disabled: boolean;
  onVariant?: (lineKey: string, variant: Variant) => void;
}) {
  const optionName = dict.cart.accessoryOptions[accessory.option];
  const labelOf = (v: Variant) => `${optionName} ${v.label}`;
  if (accessory.variants.length < 2) {
    return <p className="mt-1 text-sm text-muted-foreground">{labelOf(accessory.variants[0])}</p>;
  }
  return (
    <Select
      value={line.variantId}
      disabled={disabled}
      onValueChange={(id) => {
        const next = accessory.variants.find((v) => v.id === id);
        if (next && next.id !== line.variantId) onVariant?.(line.lineKey, next);
      }}
      items={Object.fromEntries(accessory.variants.map((v) => [v.id, labelOf(v)]))}
    >
      <SelectTrigger size="sm" aria-label={optionName} className="mt-1.5 mb-1"><SelectValue /></SelectTrigger>
      <SelectContent>
        {accessory.variants.map((v) => <SelectItem key={v.id} value={v.id}>{labelOf(v)}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

/** A select styled as a chip: the visible label can differ from the option text (Figma 57:2's "1 đôi ⌄"). */
function Chip({ label, value, onChange, children, ariaLabel }: {
  label: ReactNode; value: string | number; onChange: (value: string) => void; children: ReactNode; ariaLabel: string;
}) {
  return (
    <label className="relative inline-flex h-7 items-center gap-1 rounded-md border px-1.5 text-xs sm:gap-1.5 sm:px-2 transition-colors hover:border-foreground/40 has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50">
      <span className="tabular-nums">{label}</span>
      <ChevronDown aria-hidden className="size-3.5 text-muted-foreground" />
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 cursor-pointer appearance-none opacity-0"
      >
        {children}
      </select>
    </label>
  );
}

// "0.00" rather than "Không độ", so a pair's three chips fit on one row.
const chipPower = (sph: number) => formatSph(sph).replace('-', '−');

/** A lens line's Purchase Unit and power(s), each editable in place (CONTEXT.md "Purchase Unit"). */
function LensChips({ line, dict, onEdit }: { line: CartLine; dict: Dictionary; onEdit: (line: CartLine) => void }) {
  const unit = purchaseUnitOf(line) ?? 'pair';
  const powers = powersOf(line);
  const options = STEPS.map((s) => <option key={s} value={s}>{formatPower(s, dict)}</option>);
  const eyeChip = (eye: Eye | undefined) => {
    const sph = powers[eye ?? 'left'];
    const name = eye === 'left' ? dict.rx.leftEye : eye === 'right' ? dict.rx.rightEye : dict.rx.power;
    return (
      <Chip
        key={eye ?? 'single'}
        ariaLabel={name}
        value={sph}
        onChange={(v) => onEdit(editLens(line, { eye, sph: Number(v) }))}
        label={eye ? (
          <>
            <span className="sm:hidden">{dict.rx[eye]}</span>
            <span className="hidden sm:inline">{dict.cart.eyes[eye]}</span> {chipPower(sph)}
          </>
        ) : chipPower(sph)}
      >
        {options}
      </Chip>
    );
  };
  return (
    <div className="mt-1.5 flex flex-wrap gap-1 sm:gap-1.5">
      <Chip
        ariaLabel={dict.pdp.buyAs}
        value={unit}
        onChange={(v) => onEdit(editLens(line, { unit: v as PurchaseUnit }))}
        label={dict.rx.units[unit]}
      >
        {(['single', 'pair'] as const).map((u) => <option key={u} value={u}>{dict.rx.units[u]}</option>)}
      </Chip>
      {unit === 'pair' ? (['left', 'right'] as const).map(eyeChip) : eyeChip(undefined)}
    </div>
  );
}
