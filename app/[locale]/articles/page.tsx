import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SearchX } from 'lucide-react';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { editorial } from '@/lib/api/resources/editorial';
import { readingThemeSchema, type ReadingTheme } from '@/lib/api/schemas/editorial';
import { ArticleCards } from '@/components/commerce/article-cards';
import { ReadingThemeChips } from '@/components/commerce/reading-theme-chips';
import { PageContainer } from '@/components/layout/page-container';
import { Empty, EmptyContent, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

/**
 * A URL a shopper can edit, so an unrecognised theme must not take the page down. It
 * degrades to no filter, the way `parseProductQueryLoose` degrades a bad product filter
 * rather than rejecting the whole query.
 *
 * A repeated param arrives as an array — `?theme=care&theme=care` is one link clicked
 * twice — and handing that straight to the enum would fail it, dropping a filter the
 * shopper plainly asked for. The first value wins, as elsewhere in the repo.
 */
function readTheme(raw: string | string[] | undefined): ReadingTheme | undefined {
  const parsed = readingThemeSchema.safeParse(Array.isArray(raw) ? raw[0] : raw);
  return parsed.success ? parsed.data : undefined;
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
  const articles = await editorial.listArticles({ readingTheme });

  /* Every other param is carried through, so a theme can be changed without losing the
     search and sort that ticket #129 adds beside it. */
  const hrefFor = (theme?: ReadingTheme) => {
    const next = new URLSearchParams(
      Object.entries(query).flatMap(([k, v]) =>
        v === undefined ? [] : Array.isArray(v) ? v.map((one) => [k, one] as [string, string]) : [[k, v] as [string, string]],
      ),
    );
    if (theme) next.set('theme', theme);
    else next.delete('theme');
    /* Truthiness of the serialised string, not `next.size` — that property is Node 19+,
       and where it is missing `undefined > 0` is quietly false, which would collapse
       every chip to the unfiltered index with nothing thrown to notice it. */
    const serialised = next.toString();
    return `/${locale}/articles${serialised ? `?${serialised}` : ''}`;
  };

  return (
    <PageContainer>
      <div className="flex flex-col gap-10 px-4 py-12">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{dict.articles.title}</h1>
          <p className="max-w-2xl text-muted-foreground">{dict.articles.subtitle}</p>
        </div>

        <ReadingThemeChips
          label={dict.articles.filterLabel}
          chips={[
            { id: 'all', label: dict.articles.allThemes, href: hrefFor(), active: readingTheme === undefined },
            ...readingThemeSchema.options.map((theme) => ({
              id: theme,
              label: dict.articles.readingThemes[theme],
              href: hrefFor(theme),
              active: readingTheme === theme,
            })),
          ]}
        />

        {articles.length === 0 ? (
          /* Reachable today only because every Reading Theme happens to have an article:
             re-theme the one `care` fixture and this is the whole page. #129 adds the
             search box, which makes it reachable by ordinary typing. */
          <Empty className="rounded-xl border py-16">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SearchX />
              </EmptyMedia>
              <EmptyTitle>{dict.articles.noResults}</EmptyTitle>
            </EmptyHeader>
            {readingTheme ? (
              <EmptyContent>
                <Link href={hrefFor()} className={cn(buttonVariants({ variant: 'outline' }))}>
                  {dict.articles.showAll}
                </Link>
              </EmptyContent>
            ) : null}
          </Empty>
        ) : (
          <ArticleCards
            articles={articles.map((article) => ({
              slug: article.slug,
              title: article.title[locale],
              excerpt: article.excerpt[locale],
              image: article.image,
              href: `/${locale}/articles/${article.slug}`,
            }))}
          />
        )}
      </div>
    </PageContainer>
  );
}
