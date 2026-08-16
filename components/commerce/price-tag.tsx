import { formatPrice } from '@/lib/utils/format';
import type { Currency } from '@/lib/types';
import type { Locale } from '@/lib/i18n/config';
import { cn } from '@/lib/utils/cn';

export function PriceTag({
  price, currency, locale, compareAtPrice, className,
}: {
  price: number; currency: Currency; locale: Locale; compareAtPrice?: number; className?: string;
}) {
  const onSale = Boolean(compareAtPrice);
  const discount = compareAtPrice ? Math.round((1 - price / compareAtPrice) * 100) : 0;
  return (
    <div className={cn('flex items-baseline gap-2', className)}>
      <span className={cn('font-semibold tabular-nums', onSale && 'text-primary')}>
        {formatPrice(price, currency, locale)}
      </span>
      {compareAtPrice ? (
        <>
          <span className="text-sm tabular-nums text-muted-foreground line-through">
            {formatPrice(compareAtPrice, currency, locale)}
          </span>
          <span className="text-xs font-medium text-primary">-{discount}%</span>
        </>
      ) : null}
    </div>
  );
}
