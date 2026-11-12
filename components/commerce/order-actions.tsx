'use client';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { HistoryLine } from './order-history-card';
import { useBuyAgain } from './use-buy-again';

/** Under an order: "Mua lại" for anyone; the way back to order history only for a signed-in member. */
export function OrderActions({ lines, locale, dict, signedIn }: {
  lines: HistoryLine[]; locale: Locale; dict: Dictionary; signedIn: boolean;
}) {
  const { buyAgain, missing } = useBuyAgain(lines, locale);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-3">
        {signedIn ? (
          <Link href={`/${locale}/account/orders`} className={cn(buttonVariants({ variant: 'outline' }), 'h-11 flex-1 rounded-none border-foreground')}>
            {dict.orderDetail.backToOrders}
          </Link>
        ) : null}
        <Button onClick={buyAgain} className="h-11 flex-1 rounded-none">{dict.orders.buyAgain}</Button>
      </div>
      {missing > 0 ? (
        <p role="alert" className="text-sm text-destructive">
          {dict.orders.unavailable.replace('{n}', String(missing))}{' '}
          <Link href={`/${locale}/cart`} className="underline underline-offset-4">{dict.orders.viewCart}</Link>
        </p>
      ) : null}
    </div>
  );
}
