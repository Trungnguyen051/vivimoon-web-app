import Image from 'next/image';
import type { CartLine } from '@/features/cart/cart.types';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { formatPrice } from '@/lib/utils/format';
import { QuantityStepper } from './quantity-stepper';

export function CartLineItem({
  line, locale, dict, onQty, onRemove,
}: {
  line: CartLine; locale: Locale; dict: Dictionary;
  onQty: (variantId: string, qty: number) => void;
  onRemove: (variantId: string) => void;
}) {
  return (
    <div className="flex items-center gap-4 border-b py-4">
      <div className="relative h-20 w-20 overflow-hidden rounded bg-muted">
        {line.image ? <Image src={line.image} alt={line.name} fill className="object-cover" sizes="80px" /> : null}
      </div>
      <div className="flex-1">
        <p className="font-medium">{line.name}</p>
        <p className="text-sm text-muted-foreground">{line.packSize}{line.color ? ` · ${line.color}` : ''}</p>
        <QuantityStepper
          className="mt-2"
          value={line.quantity}
          onChange={(next) => onQty(line.variantId, next)}
          decreaseLabel={dict.common.decreaseQty}
          increaseLabel={dict.common.increaseQty}
        />
      </div>
      <div className="text-right">
        <p className="font-semibold">{formatPrice(line.unitPrice * line.quantity, line.currency, locale)}</p>
        <button onClick={() => onRemove(line.variantId)} className="text-sm text-muted-foreground underline">{dict.cart.remove}</button>
      </div>
    </div>
  );
}
