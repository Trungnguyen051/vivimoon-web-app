import Link from 'next/link';
import type { Currency } from '@/lib/types';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { formatPrice } from '@/lib/utils/format';
import { Button } from '@/components/ui/button';

export function OrderSummary({
  subtotal, currency, locale, dict, ctaHref, ctaLabel,
}: {
  subtotal: number; currency: Currency; locale: Locale; dict: Dictionary; ctaHref?: string; ctaLabel?: string;
}) {
  return (
    <div className="space-y-4 rounded-lg border p-6">
      <div className="flex justify-between">
        <span>{dict.cart.subtotal}</span>
        <span className="font-semibold">{formatPrice(subtotal, currency, locale)}</span>
      </div>
      {ctaHref && ctaLabel ? (
        <Button asChild className="w-full">
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}
