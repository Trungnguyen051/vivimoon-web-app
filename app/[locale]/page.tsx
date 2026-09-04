import { isLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { catalog } from '@/lib/api/resources/catalog';
import { HeroCarousel } from '@/components/commerce/hero-carousel';
import { CategoryGrid } from '@/components/commerce/category-grid';
import { CollectionCarousel } from '@/components/commerce/collection-carousel';
import { notFound } from 'next/navigation';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const l = locale as Locale;
  const dict = getDictionary(l);

  const [bestsellers, colored] = await Promise.all([
    catalog.getCollection('bestsellers'),
    catalog.getCollection('colored-lenses'),
  ]);
  const [bestProducts, coloredProducts] = await Promise.all([
    bestsellers ? catalog.getProductsByIds(bestsellers.productIds) : [],
    colored ? catalog.getProductsByIds(colored.productIds) : [],
  ]);

  return (
    <div className="space-y-16 md:space-y-24">
      <HeroCarousel
        ctaLabel={dict.common.shopNow}
        slides={[
          { image: '/images/hero-1.jpg', href: `/${l}/collection/new-arrivals`, alt: dict.collection.newArrivals },
          { image: '/images/hero-2.jpg', href: `/${l}/collection/sale`, alt: dict.collection.sale },
        ]}
      />
      <CategoryGrid
        items={[
          { label: dict.collection.daily, href: `/${l}/collection/daily-lenses`, image: '/images/cat-daily.jpg' },
          { label: dict.collection.colored, href: `/${l}/collection/colored-lenses`, image: '/images/cat-colored.jpg' },
          { label: dict.collection.bestsellers, href: `/${l}/collection/bestsellers`, image: '/images/cat-best.jpg' },
        ]}
      />
      <CollectionCarousel title={dict.collection.bestsellers} products={bestProducts} locale={l} dict={dict} seeMoreHref={`/${l}/collection/bestsellers`} seeMoreLabel={dict.common.seeMore} />
      <CollectionCarousel title={dict.collection.colored} products={coloredProducts} locale={l} dict={dict} seeMoreHref={`/${l}/collection/colored-lenses`} seeMoreLabel={dict.common.seeMore} />
    </div>
  );
}
