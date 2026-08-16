import { formatPrice } from '@/lib/utils/format';
import type { Currency } from '@/lib/types';
import type { Locale } from '@/lib/i18n/config';
import { cn } from '@/lib/utils/cn';

export function PriceTag({
  price, currency, locale, compareAtPrice, className,
}: {
  price: number; currency: Currency; locale: Locale; compareAtPrice?: number; className?: string;
}) {
  const discount = compareAtPrice ? Math.round((1 - price / compareAtPrice) * 100) : 0;
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="font-semibold">{formatPrice(price, currency, locale)}</span>
      {compareAtPrice ? (
        <>
          <span className="text-sm text-muted-foreground line-through">
            {formatPrice(compareAtPrice, currency, locale)}
          </span>
          <span className="text-xs font-medium text-destructive">-{discount}%</span>
        </>
      ) : null}
    </div>
  );
}
