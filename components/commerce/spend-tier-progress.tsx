import { Gift, PartyPopper, Percent, Truck } from 'lucide-react';
import type { NextSpendTier } from '@/lib/api/schemas/cart';
import type { Currency } from '@/lib/api/schemas/catalog';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { formatPrice } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

const ICONS = { freeShipping: Truck, gift: Gift, discount: Percent } as const;

/**
 * Progress toward the next Spend Tier (CONTEXT.md), as the server reported it:
 * "Mua thêm 110.000₫ để được Freeship", a bar, and what that tier gives.
 * Shared by the mini cart and the cart page. `next` absent means every tier is reached.
 */
export function SpendTierProgress({
  next, currency, locale, dict, className,
}: {
  next: NextSpendTier | undefined; currency: Currency; locale: Locale; dict: Dictionary; className?: string;
}) {
  const t = dict.spendTier;
  const price = (n: number) => formatPrice(n, currency, locale);
  const fill = (s: string) =>
    s.replace('{amount}', price(next?.remaining ?? 0))
      .replace('{threshold}', price(next?.threshold ?? 0))
      .replace('{value}', price(next?.value ?? 0));
  const Icon = next ? ICONS[next.reward] : PartyPopper;
  // A share of the bar, not an amount shown to anyone (ADR-0003).
  const percent = next ? ((next.threshold - next.remaining) / next.threshold) * 100 : 100;

  return (
    <div className={cn('flex flex-col gap-2 rounded-lg bg-muted/60 p-4', className)}>
      <p className="flex items-center gap-2 text-sm font-medium">
        <Icon aria-hidden className="size-5 shrink-0" />
        {next ? fill(t.remaining[next.reward]) : t.allReached}
      </p>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percent)}
        aria-label={next ? fill(t.caption[next.reward]) : t.allReached}
        className="h-1.5 overflow-hidden rounded-full bg-border"
      >
        <div className="h-full rounded-full bg-foreground transition-[width]" style={{ width: `${percent}%` }} />
      </div>
      {next ? <p className="text-xs text-muted-foreground">{fill(t.caption[next.reward])}</p> : null}
    </div>
  );
}
