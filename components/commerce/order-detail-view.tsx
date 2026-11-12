import Image from 'next/image';
import { catalog } from '@/lib/api/resources/catalog';
import { RxSummary } from './rx-summary';
import { OrderStatusTimeline } from './order-status-timeline';
import { OrderActions } from './order-actions';
import type { HistoryLine } from './order-history-card';
import { formatPrice, toIntlLocale } from '@/lib/utils/format';
import type { Order } from '@/lib/api/schemas/orders';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';

function formatDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(toIntlLocale(locale), { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(iso));
}

type Tone = 'success' | 'destructive' | 'neutral';

function toneOf(status: Order['status']): Tone {
  if (status === 'delivered') return 'success';
  if (status === 'cancelled' || status === 'returned') return 'destructive';
  return 'neutral';
}

const TONE_CLASS: Record<Tone, string> = {
  success: 'bg-emerald-50 text-emerald-700',
  destructive: 'bg-destructive/10 text-destructive',
  neutral: 'bg-secondary text-primary',
};

/**
 * Shared between the member's order-detail page (session + ownership) and
 * the guest tracking view resolved from a token (issue #11) — both render
 * the exact same detail for the exact same `Order`, which is what makes
 * "one tracking view" true rather than two pages that merely look alike.
 */
export async function OrderDetailView({ order, locale, dict, signedIn }: {
  order: Order; locale: Locale; dict: Dictionary; signedIn: boolean;
}) {
  const enrichedLines = await Promise.all(
    order.lines.map(async (line) => ({ line, found: await catalog.getVariantById(line.variantId) })),
  );
  // The same line shape the history card's buy-again reads — today's catalogue price, not the order's.
  const historyLines: HistoryLine[] = enrichedLines.map(({ line, found }) => ({
    ...line,
    product: found && {
      id: found.product.id, slug: found.product.slug, name: found.product.name, image: found.product.images[0],
      sku: found.variant.sku, color: found.variant.colorLabel, compareAtPrice: found.variant.compareAtPrice, price: found.variant.price,
    },
  }));
  const itemCount = order.lines.reduce((sum, l) => sum + l.quantity, 0);
  const { address } = order;
  const delivery: [string, string | undefined][] = [
    [dict.orderDetail.recipient, address.recipient],
    [dict.orderDetail.phone, address.phone],
    [dict.orderDetail.address, [address.line1, address.ward, address.district, address.province].join(', ')],
    [dict.orderDetail.shippingMethod, order.shippingMethod],
    [dict.orderDetail.carrierTrackingCode, order.carrierTrackingCode],
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h2 className="font-heading text-[22px] uppercase leading-7">{dict.orderDetail.title} #{order.code}</h2>
          <p className="text-[13px] leading-5 text-muted-foreground">
            {dict.orderDetail.placedOn}: {formatDate(order.placedAt, locale)}
          </p>
        </div>
        <span data-tone={toneOf(order.status)} className={`shrink-0 px-3 py-1 text-[13px] leading-5 ${TONE_CLASS[toneOf(order.status)]}`}>
          {dict.orders.statuses[order.status]}
        </span>
      </div>

      <section className="border px-6 py-5">
        <h3 className="pb-4 text-[13px] font-medium leading-5">{dict.orderDetail.status}</h3>
        <OrderStatusTimeline status={order.status} dict={dict} />
      </section>

      <section aria-labelledby="order-lines" className="border">
        <h3 id="order-lines" className="border-b px-4 py-3 text-[13px] font-medium leading-5">{dict.orderDetail.lineItems}</h3>
        <ul>
          {enrichedLines.map(({ line, found }) => (
            <li key={line.lineKey} className="flex gap-3 px-4 py-3">
              <div className="relative size-16 shrink-0 overflow-hidden bg-secondary">
                {found?.product.images[0] ? (
                  <Image src={found.product.images[0]} alt="" fill className="object-cover" sizes="64px" />
                ) : null}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="truncate text-[13px] leading-5">{found?.product.name ?? line.variantId}</p>
                {found?.variant.colorLabel ? (
                  <p className="text-xs leading-4 text-muted-foreground">{found.variant.colorLabel}</p>
                ) : null}
                {line.rx ? <RxSummary rx={line.rx} dict={dict} /> : null}
                <div className="flex items-center justify-between pt-1">
                  <p className="flex items-center gap-1.5">
                    {line.compareAtUnitPrice !== undefined ? (
                      <s className="text-xs leading-4 text-muted-foreground">
                        {formatPrice(line.compareAtUnitPrice, line.currency, locale)}
                      </s>
                    ) : null}
                    <span className="text-[13px] leading-5">{formatPrice(line.unitPrice, line.currency, locale)}</span>
                  </p>
                  <span className="text-xs leading-4 text-muted-foreground">×{line.quantity}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <p className="flex items-center justify-end gap-1 border-t px-4 py-3">
          <span className="text-xs leading-5">
            {dict.orderDetail.totalLabel} ({itemCount} {dict.orderDetail.items}):
          </span>
          <span className="text-sm font-bold leading-5">{formatPrice(order.totals.total, order.totals.currency, locale)}</span>
        </p>
      </section>

      <section aria-labelledby="order-delivery" className="border">
        <h3 id="order-delivery" className="border-b px-4 py-3 text-[13px] font-medium leading-5">{dict.orderDetail.delivery}</h3>
        <dl className="grid gap-x-6 gap-y-3 p-4 sm:grid-cols-2">
          {delivery.map(([label, value]) => (
            <div key={label} className="flex flex-col gap-0.5">
              <dt className="text-xs leading-4 text-muted-foreground">{label}</dt>
              <dd className="text-[13px] leading-5">{value || '—'}</dd>
            </div>
          ))}
        </dl>
      </section>

      <OrderActions lines={historyLines} locale={locale} dict={dict} signedIn={signedIn} />
    </div>
  );
}
