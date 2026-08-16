'use client';
import { use, useEffect } from 'react';
import Link from 'next/link';
import { isLocale, type Locale, defaultLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { useCart } from '@/features/cart/use-cart';
import { CartLineItem } from '@/components/commerce/cart-line-item';
import { OrderSummary } from '@/components/commerce/order-summary';
import { useAnalytics } from '@/lib/analytics/use-analytics';
import { cartLinesToGa4Items } from '@/lib/analytics/events';

export default function CartPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = use(params);
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  const dict = getDictionary(locale);
  const { lines, subtotal, currency, updateQty, remove } = useCart();
  const { track } = useAnalytics();

  useEffect(() => {
    track({ name: 'view_cart', params: { currency, value: subtotal, items: cartLinesToGa4Items(lines) } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRemove = (variantId: string) => {
    const line = lines.find((l) => l.variantId === variantId);
    if (line) {
      track({
        name: 'remove_from_cart',
        params: {
          currency: line.currency,
          value: line.unitPrice * line.quantity,
          items: cartLinesToGa4Items([line]),
        },
      });
    }
    remove(variantId);
  };

  if (lines.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="mb-4 text-lg">{dict.cart.empty}</p>
        <Link href={`/${locale}`} className="underline">{dict.common.shopNow}</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-2">
        <h1 className="mb-4 text-2xl font-bold">{dict.cart.title}</h1>
        {lines.map((l) => (
          <CartLineItem key={l.variantId} line={l} locale={locale} dict={dict}
            onQty={(id, q) => (q < 1 ? handleRemove(id) : updateQty(id, q))}
            onRemove={handleRemove} />
        ))}
      </div>
      <OrderSummary subtotal={subtotal} currency={currency} locale={locale} dict={dict} ctaHref={`/${locale}/checkout`} ctaLabel={dict.cart.checkout} />
    </div>
  );
}
