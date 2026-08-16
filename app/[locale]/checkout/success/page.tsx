'use client';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
      // Reading sessionStorage must happen post-hydration (SSR has no sessionStorage and
      // an eager read would mismatch the server-rendered empty state), so the setState here
      // is an intentional one-time sync of external storage into render state.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOrderId(order.orderId);
      track({ name: 'purchase', params: { transaction_id: order.orderId, currency: order.currency, value: order.value, items: cartLinesToGa4Items(order.lines) } });
      sessionStorage.removeItem('vivimoon-last-order');
      clear();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <CheckCircle2 className="h-8 w-8 text-primary" />
      </div>
      <h1 className="mb-2 text-2xl font-bold">{dict.checkout.success}</h1>
      {orderId ? <p className="text-muted-foreground">{dict.checkout.orderId}: {orderId}</p> : null}
      <Button asChild className="mt-6 h-11 px-6 text-base">
        <Link href={`/${locale}`}>{dict.common.shopNow}</Link>
      </Button>
    </div>
  );
}
