import { notFound } from 'next/navigation';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { orders } from '@/lib/api/resources/orders';
import { OrderDetailView } from '@/components/commerce/order-detail-view';

/**
 * Public — no session, so nothing here needs the cookie-forwarding,
 * same-origin-fetch dance the account pages use to see another route
 * handler's in-memory writes. Resolving the token is itself a plain read
 * against the shared `orders` singleton, same as catalog reads on the PDP.
 */
export default async function TrackedOrderPage({ params }: { params: Promise<{ locale: string; token: string }> }) {
  const { locale: raw, token } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const dict = getDictionary(locale);

  const order = await orders.resolveTrackingToken(token);
  if (!order) notFound();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-12">
      <OrderDetailView order={order} locale={locale} dict={dict} />
    </div>
  );
}
