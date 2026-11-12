import Link from 'next/link';
import type { Currency } from '@/lib/types';
import type { SpendTier } from '@/lib/api/schemas/cart';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { formatPrice } from '@/lib/utils/format';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils/cn';

export function OrderSummary({
  subtotal, bundleSaving, discount, tierDiscount, spendTiers, shipping, total, currency, locale, dict, ctaHref, ctaLabel,
  note, ctaBlockedReason, children, subtotalLabel, discountLabel, gifts, saved, ctaIcon, footer, className,
}: {
  /** "Tạm tính (3)". Defaults to the plain label. */
  subtotalLabel?: string;
  /** "Voucher NEW30". Defaults to the plain discount label. */
  discountLabel?: string;
  /** Gift rows at 0₫, e.g. "Quà tặng lens 6 tháng · Kits Yêu Mắt" (CONTEXT.md "Gift"). */
  gifts?: { label: string; name: string }[];
  /** The server's saving, shown under the total as "Tiết kiệm X · Đã gồm VAT". */
  saved?: number;
  ctaIcon?: React.ReactNode;
  /** Below the CTA: the cart's payment chips and return policy. */
  footer?: React.ReactNode;
  className?: string;
  /** The reached `discount` Spend Tiers' amount off, already subtracted server-side. A row renders only when > 0. */
  tierDiscount?: number | null;
  /** The priced Spend Tiers, which name the threshold on the tier-discount row. */
  spendTiers?: SpendTier[];
  /** What is being bought, above the totals (checkout's line list). */
  children?: React.ReactNode;
  /** Null until POST /api/cart/price answers. Money is server-owned (spec §7). */
  subtotal: number | null;
  /** What complete Bundles save, already subtracted server-side. A row renders only when > 0. */
  bundleSaving?: number | null;
  /** Positive amount already subtracted server-side. A row renders only when > 0. */
  discount?: number | null;
  /** `null`/`undefined` = pending (not yet quoted); `0` = free; `>0` = the server's fee. */
  shipping?: number | null;
  /** The server's final total. Falls back to `subtotal` when omitted, so
   *  existing callers (e.g. checkout, pre-Task-8) keep compiling and
   *  rendering exactly as before. Never derive this on the client. */
  total?: number | null;
  currency: Currency; locale: Locale; dict: Dictionary; ctaHref?: string; ctaLabel?: string;
  /** Caveat about what the totals above do or don't include. */
  note?: string;
  /**
   * Why checkout can't proceed. Present = the CTA renders disabled with this
   * as its explanation, so the block is never a dead button with no reason
   * (ADR-0012).
   */
  ctaBlockedReason?: string;
}) {
  const price = (n: number | null) => (n === null ? '—' : formatPrice(n, currency, locale));
  const shippingText =
    shipping === null || shipping === undefined ? '—' : shipping === 0 ? dict.cart.free : formatPrice(shipping, currency, locale);
  const totalValue = total === undefined ? subtotal : total;

  return (
    <Card className={cn('h-fit md:sticky md:top-24', className)}>
      <CardHeader>
        <CardTitle>{dict.cart.orderSummary}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        {children}
        <div className="flex justify-between">
          <span className="text-muted-foreground">{subtotalLabel ?? dict.cart.subtotal}</span>
          <span className="tabular-nums">{price(subtotal)}</span>
        </div>
        {bundleSaving ? (
          <div className="flex justify-between">
            <span className="text-muted-foreground">{dict.cart.bundleSaving}</span>
            <span className="tabular-nums">-{formatPrice(bundleSaving, currency, locale)}</span>
          </div>
        ) : null}
        {gifts?.map((g) => (
          <div key={g.label} className="flex justify-between gap-4">
            <span className="text-muted-foreground">{g.label}</span>
            <span className="text-right font-medium">{g.name}</span>
          </div>
        ))}
        {discount != null && discount > 0 ? (
          <div className="flex justify-between">
            <span className="text-muted-foreground">{discountLabel ?? dict.cart.discount}</span>
            <span className="tabular-nums">-{formatPrice(discount, currency, locale)}</span>
          </div>
        ) : null}
        {tierDiscount ? (
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {dict.cart.tierDiscount.replace('{threshold}', formatPrice(
                // The highest reached discount tier names the row.
                spendTiers?.findLast((t) => t.reward === 'discount' && t.reached)?.threshold ?? 0, currency, locale,
              ))}
            </span>
            <span className="tabular-nums">-{formatPrice(tierDiscount, currency, locale)}</span>
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
        {saved !== undefined ? (
          <p className="text-xs text-muted-foreground">
            {saved > 0 ? dict.cart.saved.replace('{amount}', formatPrice(saved, currency, locale)) : dict.cart.vatIncluded}
          </p>
        ) : null}
        {note ? <p className="text-xs text-muted-foreground">{note}</p> : null}
      </CardContent>
      {ctaHref && ctaLabel ? (
        <CardFooter className="flex-col items-stretch gap-2">
          {ctaBlockedReason ? (
            <>
              <Button disabled size="xl">{ctaIcon}{ctaLabel}</Button>
              <p className="text-center text-xs text-destructive">{ctaBlockedReason}</p>
            </>
          ) : (
            <Link href={ctaHref} className={buttonVariants({ size: 'xl' })}>
              {ctaIcon}{ctaLabel}
            </Link>
          )}
          {footer}
        </CardFooter>
      ) : null}
    </Card>
  );
}
