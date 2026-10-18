import { isLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { catalog } from '@/lib/api/resources/catalog';
import { HeroCarousel } from '@/components/commerce/hero-carousel';
import { CategoryGrid } from '@/components/commerce/category-grid';
import { CollectionCarousel } from '@/components/commerce/collection-carousel';
import { QuizCta } from '@/components/commerce/quiz-cta';
import { ShopByFilter } from '@/components/commerce/shop-by-filter';
import { ContentCarousel } from '@/components/commerce/content-carousel';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';

const TV_THUMBS = ['/images/tv-thumb-1.png', '/images/tv-thumb-2.png', '/images/tv-thumb-3.png', '/images/tv-thumb-4.png'];

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const l = locale as Locale;
  const dict = getDictionary(l);

  const newArrivals = await catalog.getCollection('new-arrivals');
  const newArrivalsProducts = newArrivals ? await catalog.getProductsByIds(newArrivals.productIds) : [];

  return (
    <PageContainer>
      <div className="space-y-16 md:space-y-24">
        <HeroCarousel
          ctaLabel={dict.common.shopNow}
          slides={[
            { image: '/images/hero-1.jpg', href: `/${l}/collection/new-arrivals`, alt: dict.collection.newArrivals },
            { image: '/images/hero-2.jpg', href: `/${l}/collection/sale`, alt: dict.collection.sale },
          ]}
        />

        <CategoryGrid
          title={dict.home.moments.title}
          subtitle={dict.home.moments.subtitle}
          seeMoreHref={`/${l}/collection/bestsellers`}
          seeMoreLabel={dict.home.moments.viewAll}
          items={[
            { label: dict.home.moments.gradPhotos, href: `/${l}/collection/bestsellers`, image: '/images/moment-grad.png' },
            { label: dict.home.moments.party, href: `/${l}/collection/bestsellers`, image: '/images/moment-party.png' },
            { label: dict.home.moments.wedding, href: `/${l}/collection/bestsellers`, image: '/images/moment-wedding.png' },
          ]}
        />

        <QuizCta
          title={dict.home.quiz.title}
          subtitle={dict.home.quiz.subtitle}
          stepLabel={dict.home.quiz.stepLabel}
          optionA={dict.home.quiz.optionA}
          optionB={dict.home.quiz.optionB}
          ctaLabel={dict.home.quiz.cta}
          href={`/${l}/quiz`}
        />

        <CategoryGrid
          title={dict.home.makeup.title}
          subtitle={dict.home.makeup.subtitle}
          seeMoreHref={`/${l}/collection/colored-lenses`}
          seeMoreLabel={dict.home.makeup.viewAll}
          columns={4}
          items={[
            { label: dict.home.makeup.natural, href: `/${l}/collection/colored-lenses`, image: '/images/makeup-natural.png' },
            { label: dict.home.makeup.pink, href: `/${l}/collection/colored-lenses`, image: '/images/makeup-pink.png' },
            { label: dict.home.makeup.orange, href: `/${l}/collection/colored-lenses`, image: '/images/makeup-orange.png' },
            { label: dict.home.makeup.smoky, href: `/${l}/collection/colored-lenses`, image: '/images/makeup-smoky.png' },
          ]}
        />

        <ShopByFilter
          title={dict.home.shopByFilter.title}
          seeMoreHref={`/${l}/collection/colored-lenses`}
          seeMoreLabel={dict.home.shopByFilter.viewAll}
          colorLabel={dict.home.shopByFilter.byColor}
          colorItems={[
            { label: dict.home.shopByFilter.colors.brown, count: `14 ${dict.collection.productsLabel}`, swatch: '#8a5a33', href: `/${l}/collection/colored-lenses?color=brown` },
            { label: dict.home.shopByFilter.colors.black, count: `12 ${dict.collection.productsLabel}`, swatch: '#1a1a1a', href: `/${l}/collection/colored-lenses?color=black` },
            { label: dict.home.shopByFilter.colors.gray, count: `24 ${dict.collection.productsLabel}`, swatch: '#9c9c9c', href: `/${l}/collection/colored-lenses?color=gray` },
            { label: dict.home.shopByFilter.colors.vivid, count: `6 ${dict.collection.productsLabel}`, swatch: '#8f5fd1', href: `/${l}/collection/colored-lenses?color=violet` },
            { label: dict.home.shopByFilter.colors.clear, count: `2 ${dict.collection.productsLabel}`, swatch: '#e8e8e8', href: `/${l}/collection/colored-lenses?color=clear` },
          ]}
          durationLabel={dict.home.shopByFilter.byDuration}
          durationItems={[
            { number: '1', unit: dict.home.shopByFilter.durationUnit.day, count: `14 ${dict.collection.productsLabel}`, href: `/${l}/collection/daily-lenses?replacement=daily` },
            { number: '1', unit: dict.home.shopByFilter.durationUnit.month, count: `14 ${dict.collection.productsLabel}`, href: `/${l}/collection/bestsellers?replacement=monthly` },
            { number: '3', unit: dict.home.shopByFilter.durationUnit.month, count: `14 ${dict.collection.productsLabel}`, href: `/${l}/collection/bestsellers?replacement=threeMonth` },
            { number: '6', unit: dict.home.shopByFilter.durationUnit.month, count: `14 ${dict.collection.productsLabel}`, href: `/${l}/collection/bestsellers?replacement=sixMonth` },
          ]}
        />

        <CollectionCarousel
          title={dict.collection.newArrivals}
          products={newArrivalsProducts}
          locale={l}
          dict={dict}
          seeMoreHref={`/${l}/collection/new-arrivals`}
          seeMoreLabel={dict.common.seeMore}
        />

        <ContentCarousel
          title={dict.home.tv.title}
          subtitle={dict.home.tv.subtitle}
          avatar="/images/tv-avatar.png"
          items={dict.home.tv.items.map((it, i) => ({ ...it, image: TV_THUMBS[i] }))}
        />

        <div className="relative aspect-[1744/660] w-full overflow-hidden rounded-2xl">
          <Image src="/images/promo-return-policy.png" alt="" fill className="object-cover" />
        </div>
      </div>
    </PageContainer>
  );
}
