import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { readSessionUserId } from '@/lib/auth/cookie';
import { fetchViaSelf } from '@/lib/api/server-fetch';
import { OrderDetailView } from '@/components/commerce/order-detail-view';
import type { ApiResult } from '@/lib/api/client';
import type { Order } from '@/lib/api/schemas/orders';

/**
 * Goes through the same-origin route handler rather than importing the
 * orders resource directly — see app/[locale]/account/page.tsx for why.
 */
async function fetchOrder(id: string, locale: string): Promise<Order> {
  const response = await fetchViaSelf(`/api/orders/${encodeURIComponent(id)}`);
  const result = (await response.json()) as ApiResult<Order>;
  if (!result.ok) {
    if (result.error.code === 'not_found') notFound();
    redirect(`/${locale}/sign-in?next=${encodeURIComponent(`/${locale}/account/orders/${id}`)}`);
  }
  return result.data;
}

export default async function OrderDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale: raw, id } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const dict = getDictionary(locale);

  const userId = await readSessionUserId();
  if (!userId) redirect(`/${locale}/sign-in?next=${encodeURIComponent(`/${locale}/account/orders/${id}`)}`);

  const order = await fetchOrder(id, locale);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-12">
      <OrderDetailView order={order} locale={locale} dict={dict} />
      <Link href={`/${locale}/account/orders`} className="text-sm text-muted-foreground underline underline-offset-4">
        {dict.orderDetail.backToOrders}
      </Link>
    </div>
  );
}
