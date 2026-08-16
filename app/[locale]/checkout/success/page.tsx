'use client';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
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
    <Empty className="py-24">
      <EmptyHeader>
        <EmptyMedia variant="icon" className="bg-primary/10 text-primary">
          <CheckCircle2 />
        </EmptyMedia>
        <EmptyTitle>{dict.checkout.success}</EmptyTitle>
        {orderId ? (
          <EmptyDescription>{dict.checkout.orderId}: {orderId}</EmptyDescription>
        ) : null}
      </EmptyHeader>
      <EmptyContent>
        <Button asChild className="h-11 px-6 text-base">
          <Link href={`/${locale}`}>{dict.common.shopNow}</Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
