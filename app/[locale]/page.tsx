import { isLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { HeroCarousel } from '@/components/commerce/hero-carousel';
import { CategoryGrid } from '@/components/commerce/category-grid';
import { QuizCta } from '@/components/commerce/quiz-cta';
import { ShopByFilter } from '@/components/commerce/shop-by-filter';
import { ContentCarousel } from '@/components/commerce/content-carousel';
import { notFound } from 'next/navigation';
import { HomeSection } from '@/components/layout/home-section';
import { BrandStory } from '@/components/commerce/brand-story';

/* Provisional creative: the only catalog photography not already on this page. Real brand imagery is pending. */
const BRAND_STORY_IMAGES = [
  { id: 'craft', src: '/images/cat-best.jpg' },
  { id: 'color', src: '/images/cat-colored.jpg' },
  { id: 'daily', src: '/images/cat-daily.jpg' },
];

const TV_THUMBS = ['/images/tv-thumb-1.png', '/images/tv-thumb-2.png', '/images/tv-thumb-3.png', '/images/tv-thumb-4.png'];

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const l = locale as Locale;
  const dict = getDictionary(l);

  return (
    <>
      {/* Full-bleed and flush under the header: the hero sits outside PageContainer (ADR-0013). */}
      <HeroCarousel
        ctaLabel={dict.common.shopNow}
        slides={[
          { id: 'new-arrivals', image: '/images/hero-1.jpg', href: `/${l}/collection/new-arrivals`, alt: dict.collection.newArrivals },
          { id: 'sale', image: '/images/hero-2.jpg', href: `/${l}/collection/sale`, alt: dict.collection.sale },
        ]}
      />

      <HomeSection>
        <CategoryGrid
          title={dict.home.moments.title}
          seeMoreHref={`/${l}/collection/bestsellers`}
          seeMoreLabel={dict.home.moments.viewAll}
          items={[
            { id: 'grad', label: dict.home.moments.gradPhotos, href: `/${l}/collection/bestsellers`, image: '/images/moment-grad.png' },
            { id: 'wedding', label: dict.home.moments.wedding, href: `/${l}/collection/bestsellers`, image: '/images/moment-wedding.png' },
            { id: 'party', label: dict.home.moments.party, href: `/${l}/collection/bestsellers`, image: '/images/moment-party.png' },
          ]}
        />

        <QuizCta
          eyebrow={dict.home.quiz.eyebrow}
          title={dict.home.quiz.title}
          subtitle={dict.home.quiz.subtitle}
          socialProof={dict.home.quiz.socialProof}
          ctaLabel={dict.home.quiz.cta}
          href={`/${l}/quiz`}
          steps={dict.home.quiz.steps}
        />
      </HomeSection>

      <HomeSection tinted>
        <CategoryGrid
          title={dict.home.makeup.title}
          seeMoreHref={`/${l}/collection/colored-lenses`}
          seeMoreLabel={dict.home.makeup.viewAll}
          columns={4}
          items={[
            { id: 'natural', label: dict.home.makeup.natural, href: `/${l}/collection/colored-lenses`, image: '/images/makeup-natural.png' },
            { id: 'pink', label: dict.home.makeup.pink, href: `/${l}/collection/colored-lenses`, image: '/images/makeup-pink.png' },
            { id: 'orange', label: dict.home.makeup.orange, href: `/${l}/collection/colored-lenses`, image: '/images/makeup-orange.png' },
            { id: 'smoky', label: dict.home.makeup.smoky, href: `/${l}/collection/colored-lenses`, image: '/images/makeup-smoky.png' },
          ]}
        />
      </HomeSection>

      <HomeSection>
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
      </HomeSection>

      <HomeSection tinted>
        <ContentCarousel
          title={dict.home.tv.title}
          subtitle={dict.home.tv.subtitle}
          avatar="/images/tv-avatar.png"
          items={dict.home.tv.items.map((it, i) => ({ ...it, image: TV_THUMBS[i] }))}
        />
      </HomeSection>

      <HomeSection>
        <BrandStory
          headingLine1={dict.brandStory.headingLine1}
          headingLine2={dict.brandStory.headingLine2}
          body={dict.brandStory.body}
          ctaLabel={dict.brandStory.cta}
          href={`/${l}/about`}
          images={BRAND_STORY_IMAGES}
        />
      </HomeSection>
    </>
  );
}
