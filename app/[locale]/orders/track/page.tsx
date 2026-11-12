import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { fetchViaSelf } from '@/lib/api/server-fetch';
import type { ApiResult } from '@/lib/api/client';
import { normalizeOrderCode, type Order } from '@/lib/api/schemas/orders';
import { OrderDetailView } from '@/components/commerce/order-detail-view';
import { OrderLookupForm } from '@/components/commerce/order-lookup-form';

// The Order Code is the credential (ADR-0022) and sits in this page's URL —
// keep it out of the Referer header of anything the page links to or loads.
export const metadata: Metadata = { referrer: 'no-referrer' };

/**
 * Through the same-origin route rather than the orders resource directly: an
 * order placed during this server's life lives in the route handler's module
 * instance, not this page's (ADR-0002). `null` is "no such Order Code".
 */
async function lookUpOrder(code: string): Promise<Order | null> {
  const response = await fetchViaSelf(`/api/orders/track?code=${encodeURIComponent(code)}`);
  if (response.status === 404) return null;
  const result = (await response.json()) as ApiResult<Order>;
  if (!result.ok) throw new Error(`order lookup failed: ${result.error.message}`);
  return result.data;
}

export default async function TrackOrderPage({ params, searchParams }: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const dict = getDictionary(locale);

  const query = (await searchParams).code;
  const typed = (Array.isArray(query) ? query[0] : query)?.trim() ?? '';
  const order = normalizeOrderCode(typed) ? await lookUpOrder(typed) : undefined;

  return (
    <div className="flex w-full flex-col">
      <section className="flex flex-col items-center gap-6 border-b bg-secondary px-4 py-14 text-center md:px-10">
        <div className="flex max-w-[440px] flex-col items-center gap-2">
          <h1 className="font-heading text-[28px] uppercase leading-9 tracking-wide">{dict.tracking.title}</h1>
          <p className="text-sm leading-6 text-muted-foreground">{dict.tracking.subtitle}</p>
        </div>
        <OrderLookupForm locale={locale} dict={dict.tracking} defaultCode={typed || undefined} />
      </section>

      {order === undefined ? (
        <div className="flex flex-col items-center gap-3 px-4 py-20 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-secondary text-primary">
            <Search className="size-7" aria-hidden />
          </span>
          <p className="text-sm">{dict.tracking.idle}</p>
        </div>
      ) : order === null ? (
        <div className="flex flex-col items-center gap-4 px-4 py-20 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <X className="size-7" aria-hidden />
          </span>
          <div className="flex max-w-[360px] flex-col gap-1">
            <h2 className="font-heading text-lg uppercase">{dict.tracking.notFoundTitle}</h2>
            <p className="text-[13px] leading-5 text-muted-foreground">
              {dict.tracking.notFoundBefore}
              <strong className="font-bold text-foreground">{typed}</strong>
              {dict.tracking.notFoundAfter}
            </p>
          </div>
          <Link href={`/${locale}/support`} className="text-[13px] text-primary underline underline-offset-4">
            {dict.tracking.contactSupport}
          </Link>
        </div>
      ) : (
        <div className="mx-auto w-full max-w-[720px] px-4 py-10">
          <OrderDetailView order={order} locale={locale} dict={dict} />
        </div>
      )}
    </div>
  );
}
