import Link from 'next/link';
import type { Currency } from '@/lib/types';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { formatPrice } from '@/lib/utils/format';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export function OrderSummary({
  subtotal, currency, locale, dict, ctaHref, ctaLabel,
}: {
  subtotal: number; currency: Currency; locale: Locale; dict: Dictionary; ctaHref?: string; ctaLabel?: string;
}) {
  const price = (n: number) => formatPrice(n, currency, locale);
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
        <div className="flex justify-between">
          <span className="text-muted-foreground">{dict.cart.shipping}</span>
          <span>{dict.cart.free}</span>
        </div>
        <Separator />
        <div className="flex items-baseline justify-between">
          <span className="font-medium">{dict.cart.total}</span>
          <span className="text-lg font-semibold tabular-nums">{price(subtotal)}</span>
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
