import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Search, SearchX } from 'lucide-react';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { editorial } from '@/lib/api/resources/editorial';
import {
  articleSortSchema, readingThemeSchema,
  type Article, type ArticleSort, type ReadingTheme,
} from '@/lib/api/schemas/editorial';
import { readingMinutes } from '@/lib/editorial/reading-time';
import { CARDS_PER_PAGE, knowledgeIndexLayout } from '@/lib/editorial/index-layout';
import { firstParam } from '@/lib/utils/search-params';
import { ArticleCards } from '@/components/commerce/article-cards';
import { MakeupLooks } from '@/components/commerce/makeup-looks';
import { NewsletterSignup } from '@/components/commerce/newsletter-signup';
import { LeadArticle } from '@/components/commerce/lead-article';
import { QuizCta } from '@/components/commerce/quiz-cta';
import { ReadingThemeChips } from '@/components/commerce/reading-theme-chips';
import { PageContainer } from '@/components/layout/page-container';
import { Empty, EmptyContent, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { buttonVariants } from '@/components/ui/button';
import { quizSocialProof } from '@/content/quiz';
import { toIntlLocale } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

/** The grid's anchor, so showing more lands on the new cards rather than at the top. */
const GRID_ANCHOR = 'more-articles';

/**
 * Every control on this page reads a URL a shopper can edit, so each one degrades to its
 * default rather than taking the page down — the same loose reading
 * `parseProductQueryLoose` applies to a product filter.
 */
function readTheme(raw: string | string[] | undefined): ReadingTheme | undefined {
  const parsed = readingThemeSchema.safeParse(firstParam(raw));
  return parsed.success ? parsed.data : undefined;
}

function readSort(raw: string | string[] | undefined): ArticleSort {
  const parsed = articleSortSchema.safeParse(firstParam(raw));
  return parsed.success ? parsed.data : 'newest';
}

export default async function ArticlesPage({
  params, searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const dict = getDictionary(locale);

  const query = await searchParams;
  const readingTheme = readTheme(query.theme);
  const q = firstParam(query.q)?.trim() ?? '';
  const sort = readSort(query.sort);
  const shown = Number(firstParam(query.shown)) || CARDS_PER_PAGE;

  /* One query, three spellings. The chips, the box and the sort control all narrow the
     same list in the resource rather than each filtering what the last one left. */
  /* Independent reads, so they go together: the band is not part of the query, and
     awaiting it after the articles would double this page's blocking round trips the
     day `editorial` resolves to an upstream resource rather than the mock. */
  const [articles, looks] = await Promise.all([
    editorial.listArticles({ readingTheme, q, sort }),
    editorial.listMakeupLooks(),
  ]);
  const layout = knowledgeIndexLayout(articles, shown);

  /* Every other param is carried through, so changing one control never silently
     discards the other two. */
  const hrefWith = (changes: Record<string, string | undefined>, hash?: string) => {
    const next = new URLSearchParams(
      Object.entries(query).flatMap(([k, v]) =>
        v === undefined ? [] : Array.isArray(v) ? v.map((one) => [k, one] as [string, string]) : [[k, v] as [string, string]],
      ),
    );
    for (const [key, value] of Object.entries(changes)) {
      if (value === undefined) next.delete(key);
      else next.set(key, value);
    }
    /* Truthiness of the serialised string, not `next.size` — that property is Node 19+,
       and where it is missing `undefined > 0` is quietly false, which would collapse
       every chip to the unfiltered index with nothing thrown to notice it. */
    const serialised = next.toString();
    return `/${locale}/articles${serialised ? `?${serialised}` : ''}${hash ? `#${hash}` : ''}`;
  };

  /* Showing more raises the count rather than paging, so the lead and the cards already
     read stay where they are. */
  const showMoreHref = hrefWith({ shown: String(layout.limit + CARDS_PER_PAGE) }, GRID_ANCHOR);

  /* A plain date parses as UTC midnight, so it is formatted in UTC too — in a timezone
     behind it, a local format would render the day before the one authored.

     Built once: a full page datelines up to thirteen articles, and an `Intl` constructor
     is among the more expensive calls in a render. */
  const dateFormat = new Intl.DateTimeFormat(toIntlLocale(locale), { dateStyle: 'long', timeZone: 'UTC' });
  const publishedOn = (date: string) => dateFormat.format(new Date(date));

  const dateline = (article: Article) =>
    [
      article.author,
      dict.articles.readingTime.replace('{count}', String(readingMinutes(article.body[locale]))),
      publishedOn(article.publishedAt),
    ].join(' · ');

  const toCard = (article: Article) => ({
    slug: article.slug,
    title: article.title[locale],
    image: article.image,
    href: `/${locale}/articles/${article.slug}`,
    eyebrow: dict.articles.readingThemes[article.readingTheme],
    dateline: dateline(article),
  });

  return (
    <PageContainer>
      <div className="flex flex-col gap-10 py-12">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{dict.articles.title}</h1>
          <p className="max-w-2xl text-muted-foreground">{dict.articles.subtitle}</p>
        </div>

        {layout.lead ? (
          <LeadArticle
            eyebrow={dict.articles.leadEyebrow}
            theme={dict.articles.readingThemes[layout.lead.readingTheme]}
            title={layout.lead.title[locale]}
            excerpt={layout.lead.excerpt[locale]}
            image={layout.lead.image}
            href={`/${locale}/articles/${layout.lead.slug}`}
            dateline={dateline(layout.lead)}
            ctaLabel={dict.common.seeMore}
          />
        ) : null}

        <ReadingThemeChips
          label={dict.articles.filterLabel}
          chips={[
            { id: 'all', label: dict.articles.allThemes, href: hrefWith({ theme: undefined, shown: undefined }), active: readingTheme === undefined },
            ...readingThemeSchema.options.map((theme) => ({
              id: theme,
              label: dict.articles.readingThemes[theme],
              /* Narrowing resets the page count: a shopper who expanded one list has not
                 asked to see twelve of the next. */
              href: hrefWith({ theme, shown: undefined }),
              active: readingTheme === theme,
            })),
          ]}
        />

        {/* A GET form, so searching works with JavaScript disabled — the same URL-as-state
            the collection filters use. The other two controls ride along as hidden fields
            rather than being dropped on submit. */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <form action={`/${locale}/articles`} className="flex items-center gap-2 rounded-md border px-3 sm:w-80">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <input
              type="search"
              name="q"
              defaultValue={q}
              aria-label={dict.articles.searchLabel}
              placeholder={dict.articles.searchPlaceholder}
              className="h-11 flex-1 bg-transparent text-sm outline-none"
            />
            {readingTheme ? <input type="hidden" name="theme" value={readingTheme} /> : null}
            {sort !== 'newest' ? <input type="hidden" name="sort" value={sort} /> : null}
          </form>

          {/* Links rather than a select: the sort has two options and no JavaScript has to
              run for either of them to work. */}
          <nav aria-label={dict.articles.sortLabel} className="flex items-center gap-2">
            {articleSortSchema.options.map((option) => (
              <Link
                key={option}
                href={hrefWith({ sort: option, shown: undefined })}
                aria-current={sort === option ? 'true' : undefined}
                className={cn(
                  buttonVariants({ variant: sort === option ? 'default' : 'outline', size: 'sm' }),
                )}
              >
                {dict.articles.sorts[option]}
              </Link>
            ))}
          </nav>
        </div>

        {layout.lead === undefined ? (
          <Empty className="rounded-xl border py-16">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SearchX />
              </EmptyMedia>
              <EmptyTitle>{dict.articles.noResults}</EmptyTitle>
            </EmptyHeader>
            {/* Only when something is actually filtering. An upstream editorial resource
                that returns nothing at all would otherwise offer a button back to the
                page the shopper is already looking at. */}
            {readingTheme || q ? (
              <EmptyContent>
                <Link
                  href={`/${locale}/articles`}
                  className={cn(buttonVariants({ variant: 'outline' }))}
                >
                  {dict.articles.showAll}
                </Link>
              </EmptyContent>
            ) : null}
          </Empty>
        ) : null}

        {/* Omitted entirely below two matches — heading and all. A heading over an empty
            band reads as a bug rather than as an honest empty. */}
        {layout.hasGrid ? (
          <section id={GRID_ANCHOR} className="flex flex-col gap-10">
            <ArticleCards bordered title={dict.articles.gridTitle} articles={layout.cards.map(toCard)} />
            {layout.remaining > 0 ? (
              <div className="flex justify-center">
                <Link href={showMoreHref} className={cn(buttonVariants({ variant: 'outline', size: 'xl' }))}>
                  {dict.articles.showMore}
                </Link>
              </div>
            ) : null}
          </section>
        ) : null}

        {/* The band shows every Look there is and is not part of the query, so it
            renders whatever the chips and the search box do — but an upstream editorial
            resource may legitimately have none, and a heading over an empty band reads
            as a bug here for the same reason it does over the grid. */}
        {looks.length > 0 ? (
          <MakeupLooks
            title={dict.articles.makeupLooksTitle}
            looks={looks.map((look) => ({
              id: look.id,
              title: look.title[locale],
              image: look.image,
              lensName: look.lensName,
              href: `/${locale}/product/${look.productSlug}`,
            }))}
          />
        ) : null}

        {/* The same copy the homepage shows, from one place in the dictionary: the teaser
            must claim no question count (#35), and a second copy here would be a second
            thing for that guard to miss. */}
        <QuizCta
          eyebrow={dict.home.quiz.eyebrow}
          title={dict.home.quiz.title}
          subtitle={dict.home.quiz.subtitle}
          socialProof={quizSocialProof(dict.home.quiz.socialProof, locale)}
          ctaLabel={dict.home.quiz.cta}
          href={`/${locale}/quiz`}
          steps={dict.home.quiz.steps}
        />

        <NewsletterSignup dict={dict.newsletter} />
      </div>
    </PageContainer>
  );
}
