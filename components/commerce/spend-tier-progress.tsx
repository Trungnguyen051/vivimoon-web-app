import { Check, Gift, PartyPopper, Percent, Truck } from 'lucide-react';
import type { NextSpendTier, SpendTier } from '@/lib/api/schemas/cart';
import type { Currency } from '@/lib/api/schemas/catalog';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { formatPrice } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

const ICONS = { freeShipping: Truck, gift: Gift, discount: Percent } as const;

/** "300K", "50K": a tier amount as the bar's marks write it. */
const short = (n: number) => `${n / 1000}K`;

/**
 * Progress toward the next Spend Tier (CONTEXT.md), as the server reported it:
 * "Mua thêm 110.000₫ để được Freeship", a bar, and what that tier gives.
 * Shared by the mini cart and the cart page. `next` absent means every tier is reached.
 *
 * Given every `tiers` (the cart page, Figma 57:807), the bar spans all of them with a
 * mark per tier, and the sentence first names what is already unlocked.
 */
export function SpendTierProgress({
  next, tiers, currency, locale, dict, className,
}: {
  next: NextSpendTier | undefined; tiers?: SpendTier[]; currency: Currency; locale: Locale; dict: Dictionary; className?: string;
}) {
  const t = dict.spendTier;
  const price = (n: number) => formatPrice(n, currency, locale);
  const fill = (s: string) =>
    s.replace('{amount}', price(next?.remaining ?? 0))
      .replace('{threshold}', price(next?.threshold ?? 0))
      .replace('{value}', price(next?.value ?? 0));
  const Icon = tiers ? Gift : next ? ICONS[next.reward] : PartyPopper;
  const top = tiers?.at(-1);
  // How far the cart is, read back from the server's "remaining"; a share of the bar, not an amount shown to anyone (ADR-0003).
  const reachedAmount = next ? next.threshold - next.remaining : top?.threshold ?? 1;
  const scale = top ? top.threshold : next?.threshold ?? 1;
  const percent = Math.min(100, (reachedAmount / scale) * 100);

  const reached = tiers?.filter((tier) => tier.reached) ?? [];
  const reachedText = reached.length > 0 && next
    ? `${t.reached.replace('{rewards}', reached.map((tier) => t.rewards[tier.reward].replace('{value}', short(tier.value ?? 0))).join(t.and))} `
    : '';
  const sentence = next ? reachedText + fill(t.remaining[next.reward]) : t.allReached;

  return (
    <div className={cn('flex flex-col gap-2 rounded-lg bg-muted/60 p-4', className)}>
      <p className="flex items-start gap-2 text-sm font-medium">
        <Icon aria-hidden className="size-5 shrink-0" />
        {sentence}
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
      {tiers ? (
        <ol className="flex justify-between gap-2 text-xs">
          <li className="text-muted-foreground">{price(0)}</li>
          {tiers.map((tier) => (
            <li key={tier.threshold} className={cn('flex items-center gap-1 text-right', tier.reached ? 'font-medium' : 'text-muted-foreground')}>
              {short(tier.threshold)}
              <span className="hidden sm:inline"> · {t.marks[tier.reward].replace('{value}', short(tier.value ?? 0))}</span>
              {tier.reached ? <Check aria-hidden className="size-3.5" /> : null}
            </li>
          ))}
        </ol>
      ) : next ? (
        <p className="text-xs text-muted-foreground">{fill(t.caption[next.reward])}</p>
      ) : null}
    </div>
  );
}
