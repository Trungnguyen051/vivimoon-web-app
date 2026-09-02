import Link from 'next/link';
import type { Currency } from '@/lib/types';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { formatPrice } from '@/lib/utils/format';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export function OrderSummary({
  subtotal, discount, shipping, total, currency, locale, dict, ctaHref, ctaLabel,
}: {
  /** Null until POST /api/cart/price answers. Money is server-owned (spec §7). */
  subtotal: number | null;
  /** Positive amount already subtracted server-side. A row renders only when > 0. */
  discount?: number | null;
  /** `null`/`undefined` = pending (not yet quoted); `0` = free; `>0` = the server's fee. */
  shipping?: number | null;
  /** The server's final total. Falls back to `subtotal` when omitted, so
   *  existing callers (e.g. checkout, pre-Task-8) keep compiling and
   *  rendering exactly as before. Never derive this on the client. */
  total?: number | null;
  currency: Currency; locale: Locale; dict: Dictionary; ctaHref?: string; ctaLabel?: string;
}) {
  const price = (n: number | null) => (n === null ? '—' : formatPrice(n, currency, locale));
  const shippingText =
    shipping === null || shipping === undefined ? '—' : shipping === 0 ? dict.cart.free : formatPrice(shipping, currency, locale);
  const totalValue = total === undefined ? subtotal : total;

  return (
    <Card className="h-fit md:sticky md:top-24">
      <CardHeader>
        <CardTitle>{dict.cart.orderSummary}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">{dict.cart.subtotal}</span>
          <span className="tabular-nums">{price(subtotal)}</span>
        </div>
        {discount != null && discount > 0 ? (
          <div className="flex justify-between">
            <span className="text-muted-foreground">{dict.cart.discount}</span>
            <span className="tabular-nums">-{formatPrice(discount, currency, locale)}</span>
          </div>
        ) : null}
        <div className="flex justify-between">
          <span className="text-muted-foreground">{dict.cart.shipping}</span>
          <span>{shippingText}</span>
        </div>
        <Separator />
        <div className="flex items-baseline justify-between">
          <span className="font-medium">{dict.cart.total}</span>
          <span className="text-lg font-semibold tabular-nums">{price(totalValue)}</span>
        </div>
      </CardContent>
      {ctaHref && ctaLabel ? (
        <CardFooter>
          <Button asChild className="h-12 w-full text-base">
            <Link href={ctaHref}>{ctaLabel}</Link>
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  );
}
