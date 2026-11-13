import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { fetchViaSelf } from '@/lib/api/server-fetch';
import type { ApiResult } from '@/lib/api/client';
import { normalizeOrderCode, type PaymentOrder } from '@/lib/api/schemas/orders';
import { catalog } from '@/lib/api/resources/catalog';
import { editorial } from '@/lib/api/resources/editorial';
import { support } from '@/lib/api/resources/support';
import { shipping } from '@/lib/api/resources/shipping';
import { readingMinutes } from '@/lib/editorial/reading-time';
import { SuccessView, type FirstWearRead } from './success-view';

// The Order Code is the credential (ADR-0022) and sits in this URL: keep it out of Referer headers.
export const metadata: Metadata = { referrer: 'no-referrer' };

/** Through the route, not the resource: the placed order lives in its module instance (ADR-0002). `null` is "no such order". */
async function readOrder(code: string): Promise<PaymentOrder | null> {
  const response = await fetchViaSelf(`/api/orders/payment?code=${encodeURIComponent(code)}`);
  if (!response.ok) return null;
  const result = (await response.json()) as ApiResult<PaymentOrder>;
  return result.ok ? result.data : null;
}

/** The charged option's days to arrive; the order keeps the option's id, not its quote. */
async function etaDaysOf(order: PaymentOrder): Promise<number | undefined> {
  if (!order.shippingMethod) return undefined;
  const options = await shipping.quote({ province: order.address.province, district: order.address.district });
  return options.find((o) => o.id === order.shippingMethod)?.etaDays;
}

// shortcut: TV clips carry no running time yet, so this one's is authored here; read it off the clip once the schema has one.
const FIRST_WEAR_VIDEO = { product: 'aqua-daily-clear', clip: 'aqua-tv-3', duration: '1:05' };
const FIRST_WEAR_GUIDE = 'cach-deo-va-thao-lens';
const FIRST_WEAR_ARTICLES = ['cach-deo-lens-lan-dau', 've-sinh-va-bao-quan-lens'];

/** "Chuẩn bị cho lần đeo đầu tiên": a VIVIMOON TV clip, the put-in/take-out Guide and two Articles. A missing one is skipped. */
async function firstWearReads(locale: Locale): Promise<FirstWearRead[]> {
  const [product, guide, ...articles] = await Promise.all([
    catalog.getProductBySlug(FIRST_WEAR_VIDEO.product),
    support.getGuideBySlug(FIRST_WEAR_GUIDE),
    ...FIRST_WEAR_ARTICLES.map((slug) => editorial.getArticleBySlug(slug)),
  ]);
  const clip = product?.videos?.find((v) => v.id === FIRST_WEAR_VIDEO.clip);
  const reads: (FirstWearRead | null)[] = [
    clip ? { key: clip.id, kind: 'video', title: clip.title[locale], image: clip.poster, href: clip.url, duration: FIRST_WEAR_VIDEO.duration } : null,
    guide
      ? {
          key: guide.slug, kind: 'article', title: guide.title[locale], image: guide.steps[0].image,
          href: `/${locale}/support/guides/${guide.slug}`,
          minutes: readingMinutes([...guide.opening[locale], ...guide.steps.map((s) => s.body[locale]), ...guide.closing[locale]]),
        }
      : null,
    ...articles.map((a): FirstWearRead | null =>
      a ? { key: a.slug, kind: 'article', title: a.title[locale], image: a.image, href: `/${locale}/articles/${a.slug}`, minutes: readingMinutes(a.body[locale]) } : null,
    ),
  ];
  return reads.filter((r) => r !== null);
}

/** "Đặt hàng thành công!" (#206), keyed by `?code=`. A missing or unknown code still thanks the shopper, without the order's details. */
export default async function SuccessPage({ params, searchParams }: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const query = (await searchParams).code;
  const code = Array.isArray(query) ? query[0] : query;

  const [order, reads] = await Promise.all([
    code && normalizeOrderCode(code) ? readOrder(code) : null,
    firstWearReads(locale),
  ]);
  const etaDays = order ? await etaDaysOf(order) : undefined;

  return <SuccessView order={order} etaDays={etaDays} reads={reads} locale={locale} dict={getDictionary(locale)} />;
}
