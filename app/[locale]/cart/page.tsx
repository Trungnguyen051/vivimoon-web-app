'use client';
import { use } from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { isLocale, type Locale, defaultLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { useCart } from '@/features/cart/use-cart';
import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { CartLineItem } from '@/components/commerce/cart-line-item';
import { OrderSummary } from '@/components/commerce/order-summary';
import { useAnalytics } from '@/lib/analytics/use-analytics';
import { cartLinesToGa4Items } from '@/lib/analytics/events';

export default function CartPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = use(params);
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  const dict = getDictionary(locale);
  const { lines, currency, updateQty, remove } = useCart();
  const { track } = useAnalytics();

  // `view_cart` carries the cart's value, which is server-owned. It fires in
  // M2 Task 7 once POST /api/cart/price answers — reporting a locally computed
  // total here would be the very drift the server-pricing rule exists to avoid.

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
          {lines.map((l) => (
            <CartLineItem key={l.lineKey} line={l} locale={locale} dict={dict}
              onQty={(key, q) => (q < 1 ? handleRemove(key) : updateQty(key, q))}
              onRemove={handleRemove} />
          ))}
        </div>
        <OrderSummary subtotal={null} currency={currency} locale={locale} dict={dict} ctaHref={`/${locale}/checkout`} ctaLabel={dict.cart.checkout} />
      </div>
    </div>
  );
}
