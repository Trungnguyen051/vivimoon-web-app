import { catalog } from '@/lib/api/resources/catalog';
import { paymentMethods } from '@/lib/payments/methods';
import { RxSummary } from './rx-summary';
import { OrderStatusTimeline } from './order-status-timeline';
import { Card, CardContent } from '@/components/ui/card';
import { formatPrice, toIntlLocale } from '@/lib/utils/format';
import type { Order } from '@/lib/api/schemas/orders';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';

function formatDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(toIntlLocale(locale), { dateStyle: 'medium' }).format(new Date(iso));
}

/**
 * Shared between the member's order-detail page (session + ownership) and
 * the guest tracking view resolved from a token (issue #11) — both render
 * the exact same detail for the exact same `Order`, which is what makes
 * "one tracking view" true rather than two pages that merely look alike.
 */
export async function OrderDetailView({ order, locale, dict }: { order: Order; locale: Locale; dict: Dictionary }) {
  const enrichedLines = await Promise.all(
    order.lines.map(async (line) => ({ line, found: await catalog.getVariantById(line.variantId) })),
  );
  const methodLabel = paymentMethods.find((m) => m.type === order.payment.method)?.label ?? order.payment.method;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-2xl font-semibold tracking-tight">{order.code}</span>
          <span className="text-sm text-muted-foreground">{formatDate(order.placedAt, locale)}</span>
        </div>
        <span className="text-lg font-semibold">{formatPrice(order.totals.total, order.totals.currency, locale)}</span>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">{dict.orderDetail.status}</h2>
        <OrderStatusTimeline status={order.status} dict={dict.orders} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">{dict.orderDetail.lineItems}</h2>
        <ul className="flex flex-col gap-3">
          {enrichedLines.map(({ line, found }) => (
            <li key={line.lineKey}>
              <Card>
                <CardContent className="flex items-center justify-between gap-4 py-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{found?.product.name ?? line.variantId}</span>
                    <span className="text-sm text-muted-foreground">
                      {dict.pdp.quantity}: {line.quantity} · {formatPrice(line.unitPrice, line.currency, locale)}
                    </span>
                    {line.rx ? <RxSummary rx={line.rx} dict={dict} /> : null}
                  </div>
                  <span className="font-medium">{formatPrice(line.lineTotal, line.currency, locale)}</span>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-medium">{dict.orderDetail.address}</h2>
          <p className="text-sm text-muted-foreground">
            {order.address.recipient}
            <br />
            {order.address.phone}
            <br />
            {order.address.line1}, {order.address.ward}, {order.address.district}, {order.address.province}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-medium">{dict.orderDetail.payment}</h2>
          <p className="text-sm text-muted-foreground">{methodLabel}</p>
        </div>
      </section>
    </div>
  );
}
