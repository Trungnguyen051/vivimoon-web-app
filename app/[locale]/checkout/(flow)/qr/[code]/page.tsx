import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { fetchViaSelf } from '@/lib/api/server-fetch';
import type { ApiResult } from '@/lib/api/client';
import type { PaymentOrder } from '@/lib/api/schemas/orders';
import { catalog } from '@/lib/api/resources/catalog';
import { lensLineOf } from '@/lib/products/lens-facets';
import { formatLineSummary, lineTitle } from '@/components/commerce/line-summary';
import { QrTransferView, type QrLine } from './qr-transfer-view';

// The Order Code is the credential (ADR-0022) and sits in this URL: keep it out of Referer headers.
export const metadata: Metadata = { referrer: 'no-referrer' };

/** "Quét mã để thanh toán" (#205), keyed by Order Code, in the checkout layout. */
export default async function QrTransferPage({ params }: { params: Promise<{ locale: string; code: string }> }) {
  const { locale, code } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  // Through the route, not the resource: placement and payment changes live in its module instance (ADR-0002).
  const response = await fetchViaSelf(`/api/orders/payment?code=${encodeURIComponent(code)}`);
  if (response.status === 404) notFound();
  const result = (await response.json()) as ApiResult<PaymentOrder>;
  if (!result.ok) throw new Error(`QR order lookup failed: ${result.error.message}`);
  const order = result.data;
  // Nothing left to transfer: a paid or COD order belongs on success.
  if (order.payment.method !== 'qr' || order.payment.status === 'paid') redirect(`/${locale}/checkout/success?code=${encodeURIComponent(order.code)}`);

  const lines: QrLine[] = await Promise.all(
    order.lines.map(async (line) => {
      const found = await catalog.getVariantById(line.variantId);
      const product = found?.product;
      const title = !product
        ? line.variantId
        : product.kind === 'accessory'
          ? product.name
          : lineTitle({ name: product.name, lensLine: lensLineOf(product.specs.material), replacement: product.replacement }, dict);
      return {
        lineKey: line.lineKey, title, image: product?.images[0],
        summary: formatLineSummary(line, dict), lineTotal: line.lineTotal,
      };
    }),
  );

  // A server component renders once per request; this clock seeds the first paint so it hydrates unchanged.
  // eslint-disable-next-line react-hooks/purity
  return <QrTransferView order={order} lines={lines} now={Date.now()} locale={locale} dict={dict} />;
}
