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
import { COLOR_FAMILIES, COLOR_FAMILY_COLLECTION, colorFamilyHref, countColorFamily } from '@/lib/products/color-families';
import { catalog } from '@/lib/api/resources/catalog';

/* Product photography, since the design weights these tiles like the colour ones.
   Each id is both the dictionary key and the replacement filter value.

   Each tile opens the collection that covers it best, which today is only true of
   `daily`: no collection contains a threeMonth or sixMonth product, though the
   catalog has both, so those two tiles land empty until the fixtures catch up (#49) —
   the same tracked gap as the Đen family's (#41), not a reason to drop the tiles the
   design specifies. */
const DURATION_TILES = [
  { id: 'daily', image: '/images/products/aqua-daily-1.jpg', collection: 'daily-lenses' },
  { id: 'threeMonth', image: '/images/products/hazel-monthly-1.jpg', collection: 'bestsellers' },
  { id: 'sixMonth', image: '/images/products/torica-monthly-1.jpg', collection: 'bestsellers' },
] as const;

/* Provisional creative: the only catalog photography not already on this page. Real brand imagery is pending. */
const BRAND_STORY_IMAGES = [
  { id: 'craft', src: '/images/cat-best.jpg' },
  { id: 'color', src: '/images/cat-colored.jpg' },
  { id: 'daily', src: '/images/cat-daily.jpg' },
];

/* Keyed by item id, not by position: an index would tie the thumbnails to dictionary
   order across both locales, and a fifth item would hand next/image an undefined src
   and take the homepage down rather than just miss a picture. */
const TV_THUMBS: Record<string, string> = {
  hazel: '/images/tv-thumb-1.png',
  mystic: '/images/tv-thumb-2.png',
  aqua: '/images/tv-thumb-3.png',
  torica: '/images/tv-thumb-4.png',
};

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const l = locale as Locale;
  const dict = getDictionary(l);

  /* The tiles state how many products are behind them, so the count is read from the
     very collection the tile opens rather than hard-coded (#36 shipped the design's
     14/10/24/8 over a collection holding two). */
  const familyCollection = await catalog.getCollection(COLOR_FAMILY_COLLECTION);
  const familyProducts = familyCollection ? await catalog.getProductsByIds(familyCollection.productIds) : [];

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
          colorFamilies={COLOR_FAMILIES.map((family) => ({
            id: family.id,
            label: dict.home.shopByFilter.colors[family.id],
            count: `${countColorFamily(family, familyProducts)} ${dict.collection.productsLabel}`,
            swatches: family.swatches,
            href: colorFamilyHref(family, l),
          }))}
          durations={DURATION_TILES.map((tile) => ({
            id: tile.id,
            label: dict.home.shopByFilter.durations[tile.id],
            image: tile.image,
            href: `/${l}/collection/${tile.collection}?replacement=${tile.id}`,
          }))}
        />
      </HomeSection>

      <HomeSection tinted>
        <ContentCarousel
          title={dict.home.tv.title}
          avatar="/images/tv-avatar.png"
          items={dict.home.tv.items.map((it) => ({ ...it, image: TV_THUMBS[it.id] ?? '/images/placeholder.jpg', href: `/${l}${it.href}` }))}
          moreLabel={dict.home.tv.more}
          slideLabel={dict.common.goToSlide}
          /* No video index route exists; the colour collection is the nearest browsing
             destination, though two of the four cards are clear lenses. Revisit with #42. */
          moreHref={`/${l}/collection/colored-lenses`}
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
