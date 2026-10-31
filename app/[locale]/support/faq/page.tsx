import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { support } from '@/lib/api/resources/support';
import { topicSchema, type Topic } from '@/lib/api/schemas/support';
import { cn } from '@/lib/utils/cn';
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
  searchParams: Promise<{ category?: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const dict = getDictionary(locale);

  // An unrecognised category falls back to everything rather than 404ing: a stale
  // bookmark from a renamed Topic should still show the reader a page of answers.
  const active = parseTopic((await searchParams).category);
  const entries = active ? await support.listFaqEntriesByTopic(active) : await support.listFaqEntries();

  const topicHref = (topic: Topic | null) =>
    topic ? `/${locale}/support/faq?category=${topic}` : `/${locale}/support/faq`;

  return (
    <PageContainer>
      <div className="flex flex-col gap-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href={`/${locale}/support`} />}>{dict.nav.support}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>{dict.support.faq.title}</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <h1 className="font-heading text-3xl md:text-4xl">{dict.support.faq.title}</h1>

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
              const current = topic === active;
              return (
                <Link
                  key={topic ?? 'all'}
                  href={topicHref(topic)}
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
            {active ? (
              <h2 className="font-heading mb-2 text-2xl">{dict.support.topics[active]}</h2>
            ) : null}
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
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
