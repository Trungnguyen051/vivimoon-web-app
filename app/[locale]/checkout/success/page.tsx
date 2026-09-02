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
      const order = JSON.parse(raw) as {
        orderId: string; currency: string; value: number | null;
        lines: { sku: string; name: string; unitPrice: number; quantity: number }[];
        isBuyNow?: boolean;
      };
      // Reading sessionStorage must happen post-hydration (SSR has no sessionStorage and
      // an eager read would mismatch the server-rendered empty state), so the setState here
      // is an intentional one-time sync of external storage into render state.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOrderId(order.orderId);
      // `value` comes from the placed order's server-computed total
      // (app/[locale]/checkout/page.tsx) — a purchase event without it would
      // misreport revenue, so this only fires once a real order exists.
      if (order.value !== null) {
        track({ name: 'purchase', params: { transaction_id: order.orderId, currency: order.currency, value: order.value, items: cartLinesToGa4Items(order.lines) } });
      }
      sessionStorage.removeItem('vivimoon-last-order');
      // A buy-now order never drew from the real cart (spec §10) — clearing
      // it here would wipe items the shopper never checked out with.
      if (!order.isBuyNow) clear();
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
