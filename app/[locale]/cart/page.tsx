'use client';
import { use, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { isLocale, type Locale, defaultLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { useCart } from '@/features/cart/use-cart';
import { usePricedCart } from '@/features/cart/use-priced-cart';
import { useSessionStore } from '@/features/session/session-store';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyContent, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { CartLineItem } from '@/components/commerce/cart-line-item';
import { OrderSummary } from '@/components/commerce/order-summary';
import { useAnalytics } from '@/lib/analytics/use-analytics';
import { cartLinesToGa4Items } from '@/lib/analytics/events';

export default function CartPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = use(params);
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  const dict = getDictionary(locale);
  const { lines, hydrated, currency, updateQty, remove } = useCart();
  const sessionStatus = useSessionStore((s) => s.status);
  // Guest→member cart merge (spec §9): lines already survive login (the
  // cart lives in localStorage, untouched by auth), so re-pricing on a
  // session-status change is what "merge" reduces to here — it lets a
  // `memberOnly` voucher apply the moment a shopper signs in without a
  // page reload.
  const { result } = usePricedCart(lines, hydrated, sessionStatus);
  const { track } = useAnalytics();

  // `view_cart` fires exactly once per cart view, the moment the first server
  // price answers — not on every re-price, or a rapid `+` click would fire a
  // duplicate. `value` is the subtotal (GA4 convention: pre-shipping,
  // pre-discount item value), never a client-computed total.
  const viewCartFiredRef = useRef(false);
  useEffect(() => {
    if (!result || viewCartFiredRef.current) return;
    viewCartFiredRef.current = true;
    track({
      name: 'view_cart',
      params: { currency: result.currency, value: result.subtotal, items: cartLinesToGa4Items(lines) },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  const handleRemove = (key: string) => {
    const line = lines.find((l) => l.lineKey === key);
    if (line) {
      track({
        name: 'remove_from_cart',
        params: { currency: line.currency, value: line.unitPrice, items: cartLinesToGa4Items([line]) },
      });
    }
    remove(key);
  };

  // The cart lives in localStorage behind zustand `persist` with
  // `skipHydration: true` — unreadable until rehydrate() runs. Gate on
  // `hydrated` first so a shopper with a persisted, non-empty cart never
  // flashes the empty state for a frame on load.
  if (!hydrated) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-9 w-48" />
        <div className="grid gap-10 md:grid-cols-3 md:gap-12">
          <div className="space-y-6 md:col-span-2">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <Empty className="py-24">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ShoppingBag />
          </EmptyMedia>
          <EmptyTitle>{dict.cart.empty}</EmptyTitle>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild className="h-11 px-6 text-base">
            <Link href={`/${locale}`}>{dict.common.shopNow}</Link>
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{dict.cart.title}</h1>
      <div className="grid gap-10 md:grid-cols-3 md:gap-12">
        <div className="md:col-span-2">
          {lines.map((l) => {
            const pricedLine = result?.lines.find((pl) => pl.lineKey === l.lineKey);
            return (
              <CartLineItem key={l.lineKey} line={l} locale={locale} dict={dict}
                lineTotal={pricedLine?.lineTotal ?? null}
                onQty={(key, q) => (q < 1 ? handleRemove(key) : updateQty(key, q))}
                onRemove={handleRemove} />
            );
          })}
        </div>
        <OrderSummary
          subtotal={result?.subtotal ?? null}
          discount={result?.discount ?? null}
          shipping={result?.shipping ?? null}
          total={result?.total ?? null}
          currency={currency} locale={locale} dict={dict}
          ctaHref={`/${locale}/checkout`} ctaLabel={dict.cart.checkout}
        />
      </div>
    </div>
  );
}
