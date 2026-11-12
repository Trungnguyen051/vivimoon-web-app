import Image from 'next/image';
import { X } from 'lucide-react';
import type { CartLine } from '@/features/cart/cart.types';
import type { Accessory, Variant } from '@/lib/api/schemas/catalog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { formatPrice } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import { QuantityStepper } from './quantity-stepper';
import { LineSummary } from './line-summary';

export function CartLineItem({
  line, locale, dict, lineTotal = null, unavailable = false, onQty, onRemove, accessory, onVariant,
}: {
  line: CartLine; locale: Locale; dict: Dictionary;
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
  return (
    <div className={cn('flex gap-4 border-b py-6 first:pt-0', unavailable && 'opacity-60')}>
      <div className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-muted">
        {line.image ? <Image src={line.image} alt={line.name} fill className="object-cover" sizes="96px" /> : null}
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-medium leading-snug">{line.name}</p>
            {accessory ? (
              <AccessoryOption line={line} accessory={accessory} dict={dict} disabled={unavailable} onVariant={onVariant} />
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">{line.color || line.sku}</p>
            )}
            {/* Two lines can share a variantId and differ only by prescription
                (spec §7) — without this they'd read as a duplicate-line bug. */}
            <LineSummary line={line} dict={dict} />
            {unavailable ? (
              <p className="mt-2 text-sm font-medium text-destructive">{dict.cart.unavailable}</p>
            ) : null}
          </div>
          <button
            onClick={() => onRemove(line.lineKey)}
            aria-label={dict.cart.remove}
            className="-mr-1 flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
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
function AccessoryOption({ line, accessory, dict, disabled, onVariant }: {
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
