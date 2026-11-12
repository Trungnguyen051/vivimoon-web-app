import { notFound } from 'next/navigation';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { fetchViaSelf } from '@/lib/api/server-fetch';
import type { ApiResult } from '@/lib/api/client';
import type { Order } from '@/lib/api/schemas/orders';
import { OrderDetailView } from '@/components/commerce/order-detail-view';
import { PageContainer } from '@/components/layout/page-container';

/**
 * Public — no session — but it still goes through the same-origin route
 * handler rather than importing the orders resource directly: the token was
 * written by POST /api/orders/track, a separate module instance from this
 * page, so a direct read here would never see it (see
 * app/[locale]/account/page.tsx). An invalid or expired token is a 404.
 */
async function fetchTrackedOrder(token: string): Promise<Order> {
  const response = await fetchViaSelf(`/api/orders/track/${encodeURIComponent(token)}`);
  const result = (await response.json()) as ApiResult<Order>;
  if (!result.ok) notFound();
  return result.data;
}

export default async function TrackedOrderPage({ params }: { params: Promise<{ locale: string; token: string }> }) {
  const { locale: raw, token } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const dict = getDictionary(locale);

  const order = await fetchTrackedOrder(token);

  return (
    <PageContainer>
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-12">
        <OrderDetailView order={order} locale={locale} dict={dict} />
      </div>
    </PageContainer>
  );
}
