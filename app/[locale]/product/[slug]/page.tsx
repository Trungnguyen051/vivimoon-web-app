import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Gift, Tag, Truck } from 'lucide-react';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { catalog } from '@/lib/api/resources/catalog';
import { fetchViaSelf } from '@/lib/api/server-fetch';
import type { ApiResult } from '@/lib/api/client';
import type { Review } from '@/lib/api/schemas/catalog';
import { cheapestVariant } from '@/lib/products/cheapest-variant';
import { formatCount, formatPrice } from '@/lib/utils/format';
import { LensViewer } from '@/components/commerce/lens-viewer';
import { AddToCart } from '@/components/commerce/add-to-cart';
import { FavoriteButton } from '@/components/commerce/favorite-button';
import { CompareToggle } from '@/components/commerce/compare-toggle';
import { ComfortHighlight } from '@/components/commerce/comfort-highlight';
import { ProductReassurance, RETURNS_FAQ } from '@/components/commerce/product-reassurance';
import { BeginnerFaq } from '@/components/commerce/beginner-faq';
import { SpecTable } from '@/components/commerce/spec-table';
import { ProductVideos } from '@/components/commerce/product-videos';
import { BundleOffer } from '@/components/commerce/bundle-offer';
import { ReviewsList, ReviewsSummary } from '@/components/commerce/reviews-list';
import { CollectionCarousel } from '@/components/commerce/collection-carousel';
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { PageContainer } from '@/components/layout/page-container';

/** Where the PDP's links lead: articles, guides and FAQ entries in content/mock. */
const WHY_COMFORTABLE_ARTICLE = 'silicone-hydrogel-vs-lens-thuong';
const WEAR_GUIDE = 'cach-deo-va-thao-lens';

/**
 * Through the route rather than the catalog directly: a member's Review is written and moderated in the
 * route handlers' module instance, which this page doesn't share (ADR-0002). The list and the summary
 * above it both read this, so an approved Review reaches both.
 */
async function approvedReviews(slug: string): Promise<Review[]> {
  const result = (await (await fetchViaSelf(`/api/products/${encodeURIComponent(slug)}/reviews`)).json()) as ApiResult<Review[]>;
  if (!result.ok) throw new Error(`reviews read failed: ${result.error.message}`);
  return result.data;
}

/**
 * Section order follows the PDP frames (Figma 56:2 desktop, 195:431 mobile): gallery,
 * product info and buy box, reassurance, FAQ beside specs, VIVIMOON TV, Bundle,
 * reviews, related. Every optional section hides when the product lacks its data.
 */
export default async function ProductPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const l = locale as Locale;
  const dict = getDictionary(l);

  const product = await catalog.getProductBySlug(slug);
  if (!product) notFound();

  const related = await catalog.getRelatedProducts(product, 8);
  const reviews = await approvedReviews(product.slug);
  const gallery = await catalog.getGallery(product.id);
  const bundleIds = product.bundle?.accessoryIds ?? [];
  // In the Bundle's own order; the block hides unless every accessory still exists.
  const allAccessories = bundleIds.length ? await catalog.listAccessories() : [];
  const found = bundleIds.map((id) => allAccessories.find((a) => a.id === id));
  const bundleAccessories = found.every(Boolean) ? found.filter((a) => a !== undefined) : [];

  const t = dict.pdp;
  const cheapest = cheapestVariant(product);
  const videos = (product.videos ?? []).map((v) => ({
    id: v.id, title: v.title[l], poster: v.poster, url: v.url, views: formatCount(v.views, l),
  }));
  const favorite = (className: string) => (
    <FavoriteButton productId={product.id} locale={l} dict={dict.favorites} iconOnly className={className} />
  );
  const promos = [
    { Icon: Tag, label: t.promos.firstOrder },
    { Icon: Gift, label: t.promos.gift },
    { Icon: Truck, label: t.promos.freeship },
  ];

  return (
    <PageContainer className="pt-4 md:pt-6">
      <div className="space-y-16 md:space-y-24">
        <div className="space-y-4 md:space-y-6">
          <Breadcrumb aria-label={dict.common.breadcrumb}>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link href={`/${l}`} />}>Vivimoon</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link href={`/${l}/collection/all-lenses`} />}>{t.allLenses}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link href={`/${l}/collection/all-lenses?replacement=${product.replacement}`} />}>
                  {t.lensesOf.replace('{r}', dict.filters.replacements[product.replacement])}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{product.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="grid gap-6 md:grid-cols-2 md:gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,584px)] lg:gap-14">
            {/* Keyed by product.id for the same reason as AddToCart below: a client-side
                nav between two PDPs must remount it, not carry over the active slide. */}
            <LensViewer
              key={product.id}
              gallery={gallery}
              images={product.images}
              videos={videos}
              tones={product.makeupTones ?? []}
              alt={product.name}
              dict={dict.viewer}
              imageLabel={dict.common.image}
              common={dict.common}
              favorite={favorite('size-8 rounded-full border-0 bg-background/90')}
            />

            <div className="flex min-w-0 flex-col gap-6">
              <div className="flex flex-col gap-2.5 md:gap-3">
                {product.badges.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {product.badges.map((b) => (
                      <span key={b} className="rounded-full border px-2.5 py-0.5 text-xs font-medium md:text-sm">{t.badges[b]}</span>
                    ))}
                  </div>
                ) : null}
                <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">{product.name}</h1>
                {product.subtitle ? <p className="text-sm text-muted-foreground md:text-base">{product.subtitle}</p> : null}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                  <ReviewsSummary reviews={reviews} dict={dict} />
                  {product.soldCount ? (
                    <>
                      {reviews.length > 0 ? <span aria-hidden className="text-border">|</span> : null}
                      <span>{t.sold.replace('{n}', formatCount(product.soldCount, l))}</span>
                    </>
                  ) : null}
                </div>
              </div>

              {/* Keyed by product.id so a client-side nav between two PDPs (e.g. a
                  related-product link) remounts AddToCart instead of reusing its
                  instance — its local state (variant, qty, rx draft) is
                  per-product and has no other way to reset without a full page
                  reload. */}
              <AddToCart key={product.id} product={product} locale={l} dict={dict} favorite={favorite('size-12')}>
                <ul className="flex flex-wrap gap-2">
                  {promos.map(({ Icon, label }) => (
                    <li key={label} className="inline-flex items-center gap-1.5 rounded-full border bg-muted/60 px-3 py-1.5 text-xs md:text-sm">
                      <Icon className="size-4 text-primary" aria-hidden />
                      {label}
                    </li>
                  ))}
                </ul>
                <ComfortHighlight
                  comfort={product.comfort}
                  waterContent={product.specs.waterContent}
                  whyHref={`/${l}/articles/${WHY_COMFORTABLE_ARTICLE}`}
                  dict={t.comfort}
                />
              </AddToCart>

              <CompareToggle productId={product.id} dict={dict} variant="button" />

              <ProductReassurance
                dict={{ trust: t.trust, returnPolicy: dict.returnPolicy }}
                detailsHref={`/${l}/support/${RETURNS_FAQ}#faq-dieu-kien-doi-tra`}
                howToHref={`/${l}/support/${RETURNS_FAQ}#faq-cach-gui-tra-hang`}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,760fr)_minmax(0,560fr)]">
          {product.faq?.length ? (
            <BeginnerFaq
              title={t.faq.title}
              entries={product.faq.map((e) => ({ question: e.question[l], answer: e.answer[l] }))}
              guideLabel={t.faq.guide}
              guideHref={`/${l}/support/guides/${WEAR_GUIDE}`}
            />
          ) : null}
          <section className="flex flex-col gap-3 md:gap-4 lg:self-start lg:rounded-xl lg:bg-muted/60 lg:p-8">
            <h2 className="text-xl font-semibold tracking-tight md:text-4xl">{t.specs}</h2>
            <SpecTable specs={product.specs} dict={dict} />
          </section>
        </div>

        <ProductVideos
          videos={videos}
          productLabel={`${product.name} · ${formatPrice(cheapest.price, cheapest.currency, l)}`}
          moreHref={`/${l}#vivimoon-tv`}
          dict={t.videos}
        />

        {bundleAccessories.length > 0 ? (
          <BundleOffer product={product} accessories={bundleAccessories} locale={l} dict={dict} />
        ) : null}

        <ReviewsList reviews={reviews} dict={dict} locale={l} productSlug={product.slug} />

        <CollectionCarousel title={t.related} products={related} locale={l} dict={dict} seeMoreHref={`/${l}/collection/bestsellers`} seeMoreLabel={dict.common.seeMore} />
      </div>
    </PageContainer>
  );
}
