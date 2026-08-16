import { notFound } from 'next/navigation';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { productRepository } from '@/lib/data';
import { ProductGallery } from '@/components/commerce/product-gallery';
import { AddToCart } from '@/components/commerce/add-to-cart';
import { SpecTable } from '@/components/commerce/spec-table';
import { ReviewsList } from '@/components/commerce/reviews-list';
import { CollectionCarousel } from '@/components/commerce/collection-carousel';
import { RatingStars } from '@/components/commerce/rating-stars';

export default async function ProductPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const l = locale as Locale;
  const dict = getDictionary(l);

  const product = await productRepository.getProductBySlug(slug);
  if (!product) notFound();

  const related = await productRepository.getRelatedProducts(product, 8);
  const reviews = await productRepository.getReviews(product.id);

  return (
    <div className="space-y-16">
      <div className="grid gap-8 md:grid-cols-2">
        <ProductGallery images={product.images} alt={product.name} />
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <div className="flex items-center gap-2">
            <RatingStars rating={product.rating} />
            <span className="text-sm text-muted-foreground">({product.reviewCount})</span>
          </div>
          <p className="leading-relaxed text-muted-foreground">{product.description}</p>
          <AddToCart product={product} locale={l} dict={dict} />
        </div>
      </div>

      <section>
        <h2 className="mb-4 text-xl font-semibold">{dict.pdp.specs}</h2>
        <SpecTable specs={product.specs} dict={dict} />
      </section>

      <CollectionCarousel title={dict.pdp.related} products={related} locale={l} seeMoreHref={`/${l}/collection/bestsellers`} seeMoreLabel={dict.common.seeMore} />

      <ReviewsList reviews={reviews} dict={dict} />
    </div>
  );
}
