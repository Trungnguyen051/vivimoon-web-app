'use client';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { isLocale, type Locale, defaultLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { useCart } from '@/features/cart/use-cart';
import { useAnalytics } from '@/lib/analytics/use-analytics';
import { cartLinesToGa4Items } from '@/lib/analytics/events';

export default function SuccessPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = use(params);
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  const dict = getDictionary(locale);
  const { clear } = useCart();
  const { track } = useAnalytics();
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    const raw = sessionStorage.getItem('vivimoon-last-order');
    if (raw) {
      const order = JSON.parse(raw) as { orderId: string; currency: string; value: number; lines: { sku: string; name: string; unitPrice: number; quantity: number }[] };
      setOrderId(order.orderId);
      track({ name: 'purchase', params: { transaction_id: order.orderId, currency: order.currency, value: order.value, items: cartLinesToGa4Items(order.lines) } });
      sessionStorage.removeItem('vivimoon-last-order');
      clear();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="py-16 text-center">
      <h1 className="mb-2 text-2xl font-bold">{dict.checkout.success}</h1>
      {orderId ? <p className="text-muted-foreground">{dict.checkout.orderId}: {orderId}</p> : null}
      <Link href={`/${locale}`} className="mt-6 inline-block underline">{dict.common.shopNow}</Link>
    </div>
  );
}
