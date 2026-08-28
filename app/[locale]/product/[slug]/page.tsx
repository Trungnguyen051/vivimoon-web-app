import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { catalog } from '@/lib/api/resources/catalog';
import { ProductGallery } from '@/components/commerce/product-gallery';
import { AddToCart } from '@/components/commerce/add-to-cart';
import { SpecTable } from '@/components/commerce/spec-table';
import { ReviewsList } from '@/components/commerce/reviews-list';
import { CollectionCarousel } from '@/components/commerce/collection-carousel';
import { RatingStars } from '@/components/commerce/rating-stars';
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export default async function ProductPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const l = locale as Locale;
  const dict = getDictionary(l);

  const product = await catalog.getProductBySlug(slug);
  if (!product) notFound();

  const related = await catalog.getRelatedProducts(product, 8);
  const reviews = await catalog.getReviews(product.id);

  return (
    <div className="space-y-16 md:space-y-24">
      <div className="space-y-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/${l}`}>Vivimoon</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{product.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid gap-10 md:grid-cols-2 lg:gap-16">
          <ProductGallery images={product.images} alt={product.name} />
          <div className="flex flex-col gap-5">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{product.name}</h1>
            <div className="flex items-center gap-2">
              <RatingStars rating={product.rating} />
              <span className="text-sm text-muted-foreground">
                {product.rating.toFixed(1)} · {product.reviewCount}
              </span>
            </div>
            <p className="max-w-prose leading-relaxed text-muted-foreground">{product.description}</p>
            <AddToCart product={product} locale={l} dict={dict} />
          </div>
        </div>
      </div>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight">{dict.pdp.specs}</h2>
        <SpecTable specs={product.specs} dict={dict} />
      </section>

      <CollectionCarousel title={dict.pdp.related} products={related} locale={l} seeMoreHref={`/${l}/collection/bestsellers`} seeMoreLabel={dict.common.seeMore} />

      <ReviewsList reviews={reviews} dict={dict} />
    </div>
  );
}
