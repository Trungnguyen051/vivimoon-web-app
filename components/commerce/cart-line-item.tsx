import Image from 'next/image';
import { X } from 'lucide-react';
import type { CartLine } from '@/features/cart/cart.types';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { formatPrice } from '@/lib/utils/format';
import { QuantityStepper } from './quantity-stepper';
import { RxSummary } from './rx-summary';

export function CartLineItem({
  line, locale, dict, lineTotal = null, onQty, onRemove,
}: {
  line: CartLine; locale: Locale; dict: Dictionary;
  /** Server-priced line total. Null until POST /api/cart/price answers. */
  lineTotal?: number | null;
  onQty: (lineKey: string, qty: number) => void;
  onRemove: (lineKey: string) => void;
}) {
  return (
    <div className="flex gap-4 border-b py-6 first:pt-0">
      <div className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-muted">
        {line.image ? <Image src={line.image} alt={line.name} fill className="object-cover" sizes="96px" /> : null}
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-medium leading-snug">{line.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {line.packSize}{line.color ? ` · ${line.color}` : ''}
            </p>
            {/* Two lines can share a variantId and differ only by prescription
                (spec §7) — without this they'd read as a duplicate-line bug. */}
            {line.rx ? <RxSummary rx={line.rx} dict={dict} /> : null}
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
          <QuantityStepper
            value={line.quantity}
            onChange={(next) => onQty(line.lineKey, next)}
            decreaseLabel={dict.common.decreaseQty}
            increaseLabel={dict.common.increaseQty}
          />
          <p className="font-semibold tabular-nums">
            {lineTotal === null ? '—' : formatPrice(lineTotal, line.currency, locale)}
          </p>
        </div>
      </div>
    </div>
  );
}
