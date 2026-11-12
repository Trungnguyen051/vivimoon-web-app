import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { PackageOpen } from 'lucide-react';
import { OrderHistoryCard, type HistoryLine } from '@/components/commerce/order-history-card';
import { catalog } from '@/lib/api/resources/catalog';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { readSessionUserId } from '@/lib/auth/cookie';
import { fetchViaSelf } from '@/lib/api/server-fetch';
import type { ApiResult } from '@/lib/api/client';
import type { Order } from '@/lib/api/schemas/orders';

/**
 * Goes through the same-origin route handler rather than importing the
 * orders resource directly — see app/[locale]/account/page.tsx for why:
 * a Server Component and a Route Handler are separate module instances, so
 * a direct resource call here would bypass whatever `POST /api/orders`
 * mutated into the mock's in-memory store.
 */
async function fetchOrders(locale: string): Promise<Order[]> {
  const response = await fetchViaSelf('/api/orders');
  const result = (await response.json()) as ApiResult<Order[]>;
  if (!result.ok) redirect(`/${locale}/sign-in?next=${encodeURIComponent(`/${locale}/account/orders`)}`);
  return result.data;
}

/** Catalogue facts per line, looked up server-side (same as the detail view); money stays the order's own. */
async function withProducts(order: Order): Promise<HistoryLine[]> {
  return Promise.all(
    order.lines.map(async (line) => {
      const found = await catalog.getVariantById(line.variantId);
      return {
        ...line,
        product: found && {
          id: found.product.id, slug: found.product.slug, name: found.product.name, image: found.product.images[0],
          sku: found.variant.sku, color: found.variant.colorLabel, compareAtPrice: found.variant.compareAtPrice,
        },
      };
    }),
  );
}

export default async function OrderHistoryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const dict = getDictionary(locale);

  // The real check. The proxy's GUARDED list only tested that a cookie
  // existed; this verifies the signature and is what actually protects
  // the page.
  const userId = await readSessionUserId();
  if (!userId) redirect(`/${locale}/sign-in?next=${encodeURIComponent(`/${locale}/account/orders`)}`);

  const orders = await fetchOrders(locale);
  const cards = await Promise.all(orders.map(async (order) => ({ order, lines: await withProducts(order) })));

  return (
    <>
      <div className="flex flex-col gap-8">
        <h1 className="text-3xl font-semibold tracking-tight">{dict.orders.title}</h1>

        {orders.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <PackageOpen />
              </EmptyMedia>
              <EmptyTitle>{dict.orders.empty}</EmptyTitle>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="flex flex-col gap-3">
            {cards.map(({ order, lines }) => (
              <li key={order.id}>
                <OrderHistoryCard order={order} lines={lines} locale={locale} dict={dict} />
              </li>
            ))}
          </ul>
        )}

        <Link href={`/${locale}/account`} className="text-sm text-muted-foreground underline underline-offset-4">
          {dict.account.title}
        </Link>
      </div>
    </>
  );
}
