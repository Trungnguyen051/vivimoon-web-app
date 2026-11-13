import Image from 'next/image';
import { notFound, redirect } from 'next/navigation';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { fetchViaSelf } from '@/lib/api/server-fetch';
import { withProducts } from '@/components/commerce/history-lines';
import { ReviewForm } from '@/components/commerce/review-form';
import type { ApiResult } from '@/lib/api/client';
import type { Order } from '@/lib/api/schemas/orders';

/** Writing a Review of one order line (#227). Through the order route, like the order detail, for its line Review states. */
export default async function WriteReviewPage({ params }: { params: Promise<{ locale: string; id: string; lineKey: string }> }) {
  const { locale: raw, id, lineKey } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const dict = getDictionary(locale);
  const orderHref = `/${locale}/account/orders/${encodeURIComponent(id)}`;

  const result = (await (await fetchViaSelf(`/api/orders/${encodeURIComponent(id)}`)).json()) as ApiResult<Order>;
  if (!result.ok) {
    if (result.error.code === 'not_found') notFound();
    redirect(`/${locale}/sign-in?next=${encodeURIComponent(`${orderHref}/review/${lineKey}`)}`);
  }
  const line = result.data.lines.find((l) => l.lineKey === lineKey);
  if (!line) notFound();
  // Only a line that can be reviewed now: none yet, or its Review was rejected.
  if (line.review?.status !== 'none' && line.review?.status !== 'rejected') redirect(orderHref);

  const [{ product }] = await withProducts([line]);
  const variant = line.variantLabel ?? product?.color;

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-6">
      <div className="flex flex-col gap-0.5">
        <h2 className="font-heading text-[22px] uppercase leading-7">{dict.writeReview.title}</h2>
        <p className="text-[13px] leading-5 text-muted-foreground">{dict.writeReview.subtitle}</p>
      </div>

      <div className="flex items-center gap-3 border px-4 py-3">
        <div className="relative size-16 shrink-0 overflow-hidden bg-secondary">
          {product?.image ? <Image src={product.image} alt="" fill className="object-cover" sizes="64px" /> : null}
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="truncate text-[13px] font-medium leading-5">{product?.name ?? line.variantId}</p>
          {variant ? <p className="text-xs leading-4 text-muted-foreground">{dict.writeReview.variant.replace('{v}', variant)}</p> : null}
          <p className="text-xs leading-4 text-muted-foreground">{dict.orderDetail.title} #{result.data.code}</p>
        </div>
      </div>

      <ReviewForm
        orderId={id} lineKey={lineKey} orderHref={orderHref}
        productHref={`/${locale}/product/${line.review.productSlug}`}
        dict={{ writeReview: dict.writeReview, reviews: dict.reviews }}
      />
    </div>
  );
}
