import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { support } from '@/lib/api/resources/support';
import { topicSchema, type Topic } from '@/lib/api/schemas/support';
import { filterFaqEntries } from '@/lib/support/faq-filter';
import { firstParam } from '@/lib/utils/search-params';
import { cn } from '@/lib/utils/cn';
import { SearchForm } from '@/components/commerce/search-form';
import { PageContainer } from '@/components/layout/page-container';
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { FaqAccordion } from './faq-accordion';

/** From the schema, not a parallel list: a seventh Topic cannot stay unbrowsable here. */
const TOPICS = topicSchema.options;

function parseTopic(raw: string | undefined): Topic | null {
  const parsed = topicSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

export default async function SupportFaqPage({
  params, searchParams,
}: {
  params: Promise<{ locale: string }>;
  /* `string | string[]`, because a param can repeat — declaring it as `string` is
     what let `.trim()` past the compiler and into a 500. */
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const dict = getDictionary(locale);

  const query = await searchParams;
  // An unrecognised category falls back to everything rather than 404ing: a stale
  // bookmark from a renamed Topic should still show the reader a page of answers.
  const active = parseTopic(firstParam(query.category));
  const q = firstParam(query.q)?.trim() ?? '';

  /* Read whole and filtered here rather than by `listFaqEntriesByTopic`, because a
     query and a Topic are one piece of state: filtering by Topic first and searching
     inside the result would be the narrowing this ticket exists to rule out. */
  const entries = filterFaqEntries(await support.listFaqEntries(), { q, category: active });

  /* Picking a Topic clears the query, the same way a query replaces the Topic. The two
     are modes, and carrying one into the other is what makes a sidebar start lying. */
  const topicHref = (topic: Topic | null) =>
    topic ? `/${locale}/support/faq?category=${topic}` : `/${locale}/support/faq`;

  return (
    <PageContainer>
      <div className="flex flex-col gap-8">
        <Breadcrumb aria-label={dict.common.breadcrumb}>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href={`/${locale}/support`} />}>{dict.nav.support}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>{dict.support.faq.title}</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <h1 className="font-heading text-3xl md:text-4xl">{dict.support.faq.title}</h1>

        {/* No hidden `category`: submitting a query deliberately drops the active Topic. */}
        <SearchForm
          action={`/${locale}/support/faq`}
          label={dict.support.faq.searchLabel}
          placeholder={dict.support.faq.searchPlaceholder}
          defaultValue={q}
          className="md:max-w-md"
        />

        <div className="flex flex-col gap-8 md:flex-row md:gap-12">
          {/*
            A scrolling chip row on phones and a column on desktop. The design draws
            only the 300px column; stacking it above the answers is what keeps a
            seven-item sidebar from pushing every answer off a 390px screen.
          */}
          <nav
            aria-label={dict.support.faq.topicNav}
            className="-mx-4 flex shrink-0 gap-2 overflow-x-auto px-4 md:mx-0 md:w-64 md:flex-col md:gap-1 md:overflow-visible md:px-0"
          >
            {[null, ...TOPICS].map((topic) => {
              /* Nothing is current while a query is running: the results are drawn from
                 every Topic, so marking one — or marking "All", which claims an
                 unfiltered list — would be the sidebar describing a page that is not
                 on screen. */
              const current = !q && topic === active;
              return (
                <Link
                  key={topic ?? 'all'}
                  href={topicHref(topic)}
                  /* `page`, where the Reading Theme chips mark `true`: this is a nav
                     landmark listing Topics a reader moves between, each its own URL,
                     and the active one is the page they are on. A chip row filtering a
                     list in place is a set of options, not a set of pages. */
                  aria-current={current ? 'page' : undefined}
                  className={cn(
                    'shrink-0 rounded-full border px-4 py-2 text-sm whitespace-nowrap transition-colors md:rounded-none md:border-0 md:border-l-2 md:px-4 md:py-2.5',
                    current
                      ? 'border-foreground bg-foreground text-background md:bg-muted md:text-foreground'
                      : 'border-border text-muted-foreground hover:text-foreground md:border-transparent',
                  )}
                >
                  {topic ? dict.support.topics[topic] : dict.support.faq.allTopics}
                </Link>
              );
            })}
          </nav>

          <div className="min-w-0 flex-1">
            {/* A live query owns the heading: the active Topic is not filtering while
                one is set, so naming it here would describe a list this is not. */}
            {q ? (
              <h2 className="font-heading mb-2 text-2xl">{dict.support.faq.resultsFor} “{q}”</h2>
            ) : active ? (
              <h2 className="font-heading mb-2 text-2xl">{dict.support.topics[active]}</h2>
            ) : null}

            {/* An `else`, not a sibling: `FaqAccordion` draws its own top rule even
                with nothing in it, which would leave a line under the empty card and
                the same "failed to load" impression the card exists to avoid. */}
            {entries.length === 0 ? (
              <div className="flex flex-col items-start gap-4 rounded-xl border p-8">
                {/* Keyed on the mode, not on the count. A Topic with no entries is not
                    a search that found nothing, and telling a reader their search
                    matched nothing when they never made one is a page misreading
                    itself. Fixtures fill all six today; CMS-authored content will not
                    always. */}
                <p className="text-muted-foreground">
                  {q ? dict.support.faq.noResults : dict.support.faq.noneInTopic}
                </p>
                <Link href={topicHref(null)} className="text-sm underline underline-offset-4">
                  {q ? dict.support.faq.clearSearch : dict.support.faq.allTopics}
                </Link>
              </div>
            ) : (
            <FaqAccordion
              linksLabel={dict.support.faq.answerLinks}
              entries={entries.map((entry) => ({
                slug: entry.slug,
                question: entry.question[locale],
                paragraphs: entry.answer[locale],
                links: entry.links.map((link) => ({
                  // The fixture carries no locale — the reader's is applied here, so
                  // one authored link serves both storefronts.
                  href: `/${locale}${link.href}`,
                  label: link.label[locale],
                })),
              }))}
            />
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
