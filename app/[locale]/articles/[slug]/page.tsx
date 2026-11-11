import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { editorial } from '@/lib/api/resources/editorial';
import { catalog } from '@/lib/api/resources/catalog';
import {
  READING_THEME_ENTRIES, readingThemeHref, readingThemeIncludes,
} from '@/lib/editorial/reading-themes';
import { readingMinutes } from '@/lib/editorial/reading-time';
import { toIntlLocale } from '@/lib/utils/format';
import { PageContainer } from '@/components/layout/page-container';
import { ProductGrid } from '@/components/commerce/product-grid';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

/** How many lenses the in-body strip shows, as the design draws it. */
const STRIP_SIZE = 3;

/**
 * An article that ends somewhere (#130).
 *
 * The lenses are not chosen by the author. ADR-0018 declined a product reference on
 * `Article`, because that reference is exactly what would stop `editorial` migrating to
 * a CMS ahead of `catalog` — so the strip and the closing banner are composed here from
 * the article's Reading Theme, through the table #128 built.
 *
 * That table is partial, and this is where the partiality shows. An article under
 * `care` — solution, cases, hygiene — renders neither the strip nor the banner and ends
 * cleanly, because a lens strip beneath an article about cleaning solution would be
 * merchandising at a shopper dishonestly.
 */
export default async function ArticlePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const dict = getDictionary(locale);

  const article = await editorial.getArticleBySlug(slug);
  if (!article) notFound();

  // publishedAt is a plain date, which parses as UTC midnight — formatting it in the
  // server's own zone would show the previous day anywhere west of UTC.
  const published = new Intl.DateTimeFormat(toIntlLocale(locale), { dateStyle: 'long', timeZone: 'UTC' })
    .format(new Date(article.publishedAt));
  const dateline = [
    article.author,
    dict.articles.readingTime.replace('{count}', String(readingMinutes(article.body[locale]))),
    published,
  ].join(' · ');

  /* Looked up defensively. `readingThemeEntry` throws when a theme has no row, which
     `reading-themes.test.ts` makes impossible in CI — but at the top of a server
     component a throw takes the article's *body* down with the decoration. A seventh
     Reading Theme added to the enum before the table should cost a shopper the strip,
     not the page. */
  // English says "1 product", Vietnamese says the same thing either way.
  const plural = new Intl.PluralRules(toIntlLocale(locale));

  const entry = READING_THEME_ENTRIES.find((row) => row.readingTheme === article.readingTheme);
  const destination = entry?.kind === 'collection' ? entry : null;

  /* The banner's count is read from the collection it opens, never written down — the
     design's "18" is invented, and #36 is the regression that says so. Counted inside
     that collection and through the entry's own filter, so the number and the link
     cannot describe different sets. */
  const collection = destination ? await catalog.getCollection(destination.collection) : null;
  const inCollection = collection ? await catalog.getProductsByIds(collection.productIds) : [];
  /* Filtered once. The strip and the count are the same set — derived twice, their
     agreement would be something a reader has to re-derive rather than read. */
  const matching = destination
    ? inCollection.filter((product) => readingThemeIncludes(destination, product))
    : [];
  const count = matching.length;
  const strip = matching.slice(0, STRIP_SIZE);

  return (
    <PageContainer>
      <div className="flex flex-col gap-10 py-12">
        {/* Ends on the Reading Theme, as drawn: the article's own title is not a crumb,
            since the heading sits directly beneath it and repeating it is noise. */}
        <Breadcrumb aria-label={dict.common.breadcrumb}>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href={`/${locale}/articles`} />}>
                {dict.articles.title}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {/* A link, not a `BreadcrumbPage`: this crumb navigates — back to the
                  index filtered by this theme, so one click gets every other article
                  like this one — and `BreadcrumbPage` marks a crumb `aria-current` and
                  `aria-disabled`, which is the opposite claim. No crumb is current
                  here, because the article's own title is deliberately not one. */}
              <BreadcrumbLink render={<Link href={`/${locale}/articles?theme=${article.readingTheme}`} />}>
                {dict.articles.readingThemes[article.readingTheme]}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <article className="flex flex-col gap-10">
        <header className="flex max-w-3xl flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{article.title[locale]}</h1>
          <p className="text-sm text-muted-foreground">{dateline}</p>
        </header>

        {/* Wide, above the column — the body reads narrow, the image does not. */}
        <div className="relative aspect-[21/9] overflow-hidden rounded-xl">
          <Image src={article.image} alt="" fill className="object-cover" sizes="100vw" />
        </div>

        {/* The column is a div inside the landmark, not the landmark itself: an
            `<article>` wrapping only the prose leaves a screen-reader user who jumps to
            it in a region with no title and no byline. */}
        <div className="flex w-full max-w-2xl flex-col gap-6">
          {/* Paragraphs, not markup: the fixtures cannot inject markup into the page. */}
          {article.body[locale].map((paragraph, i) => (
            <p key={i} className="text-muted-foreground">{paragraph}</p>
          ))}
        </div>
        </article>

        {strip.length > 0 ? (
          <section className="flex flex-col gap-6">
            <h2 className="text-2xl font-semibold tracking-tight">{dict.articles.inThisArticle}</h2>
            {/* Through `ProductGrid`, so the strip reports `view_item_list` and wires
                `select_item` — a merchandising row GA4 cannot see cannot be judged. */}
            <ProductGrid
              products={strip}
              locale={locale}
              dict={dict}
              listId={`article:${article.slug}`}
            />
          </section>
        ) : null}

        {/* Only when it leads somewhere the strip has not already shown. With a theme
            matching three lenses or fewer, the strip *is* the collection, and inviting a
            shopper to "see the whole collection" they have just scrolled past is an
            invitation to nothing. */}
        {destination && count > strip.length ? (
          <section className="flex flex-col items-start gap-4 rounded-xl border p-6 sm:flex-row sm:items-center sm:justify-between md:p-10">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-semibold tracking-tight">{dict.articles.collectionBannerTitle}</h2>
              <p className="text-muted-foreground">
                {(plural.select(count) === 'one'
                  ? dict.articles.collectionBannerCount.one
                  : dict.articles.collectionBannerCount.other
                ).replace('{count}', String(count))}
              </p>
            </div>
            {/* Stacks on a phone. */}
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link
                href={readingThemeHref(destination, locale)}
                className={cn(buttonVariants({ size: 'xl' }))}
              >
                {dict.articles.collectionBannerCta}
              </Link>
              <Link
                href={`/${locale}/articles`}
                className={cn(buttonVariants({ variant: 'outline', size: 'xl' }))}
              >
                {dict.articles.backToIndex}
              </Link>
            </div>
          </section>
        ) : (
          /* Every article still offers a way onward. A `care` article ends with no
             banner by design; ending with nothing at all is a different thing. */
          <Link href={`/${locale}/articles`} className="text-sm text-muted-foreground underline underline-offset-4">
            {dict.articles.backToIndex}
          </Link>
        )}
      </div>
    </PageContainer>
  );
}
