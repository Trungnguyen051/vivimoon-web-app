import { cookies, headers } from 'next/headers';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { PackageOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { readSessionUserId } from '@/lib/auth/cookie';
import { formatPrice, toIntlLocale } from '@/lib/utils/format';
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
  const hdrs = await headers();
  const host = hdrs.get('host');
  const protocol = hdrs.get('x-forwarded-proto') ?? 'http';
  const cookieHeader = (await cookies()).getAll().map((c) => `${c.name}=${c.value}`).join('; ');

  const response = await fetch(`${protocol}://${host}/api/orders`, {
    headers: { cookie: cookieHeader },
    cache: 'no-store',
  });
  const result = (await response.json()) as ApiResult<Order[]>;
  if (!result.ok) redirect(`/${locale}/sign-in?next=${encodeURIComponent(`/${locale}/account/orders`)}`);
  return result.data;
}

const STATUS_VARIANT: Record<Order['status'], 'default' | 'secondary' | 'destructive'> = {
  placed: 'secondary',
  confirmed: 'secondary',
  packed: 'secondary',
  shipped: 'secondary',
  out_for_delivery: 'secondary',
  delivered: 'default',
  cancelled: 'destructive',
  returned: 'destructive',
};

function formatDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(toIntlLocale(locale), { dateStyle: 'medium' }).format(new Date(iso));
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

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-12">
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
          {orders.map((order) => (
            <li key={order.id}>
              <Card>
                <CardContent className="flex items-center justify-between gap-4 py-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{order.code}</span>
                    <span className="text-sm text-muted-foreground">{formatDate(order.placedAt, locale)}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={STATUS_VARIANT[order.status]}>{dict.orders.statuses[order.status]}</Badge>
                    <span className="font-medium">{formatPrice(order.totals.total, order.totals.currency, locale)}</span>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Link href={`/${locale}/account`} className="text-sm text-muted-foreground underline underline-offset-4">
        {dict.account.title}
      </Link>
    </div>
  );
}
