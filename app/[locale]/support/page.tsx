import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Search } from 'lucide-react';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { support } from '@/lib/api/resources/support';
import { PageContainer } from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

/**
 * The Support hub's answer surface (#121). A shopper landing on Hỗ trợ is asked one
 * question and given two ways to answer it: a box to type into, and the five things a
 * first-time wearer actually worries about.
 *
 * Everything here is a link or a GET form. The box and the chips set `?q=` on the FAQ
 * page, which already knows how to search (#120), so this page needs no client state at
 * all — and works with JavaScript disabled for the same reason the FAQ page does.
 */
export default async function SupportPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const dict = getDictionary(locale);
  const hub = dict.support.hub;

  const featured = await support.listFeaturedFaqEntries();
  const faqHref = `/${locale}/support/faq`;

  /* The card opens that one answer, rather than dropping the reader on a page of
     collapsed rows to find it in again. The Topic rides along so the sidebar agrees
     with what is showing, and the fragment is what the accordion opens on. */
  const detailHref = (topic: string, slug: string) => `${faqHref}?category=${topic}#faq-${slug}`;

  return (
    <PageContainer>
      {/* 40px gutters, per ADR-0015 — the design draws 80px. */}
      <div className="flex flex-col gap-12 py-12">
        <section className="flex flex-col items-center gap-6 text-center">
          <h1 className="font-heading max-w-3xl text-3xl md:text-4xl">{hub.heroTitle}</h1>
          <p className="max-w-2xl text-muted-foreground">{hub.heroSubtitle}</p>

          <form action={faqHref} className="flex w-full max-w-xl items-center gap-2 rounded-md border px-3">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <input
              type="search"
              name="q"
              aria-label={hub.searchLabel}
              placeholder={hub.searchPlaceholder}
              className="h-12 flex-1 bg-transparent text-sm outline-none"
            />
          </form>

          {/* Links, not buttons: each carries its own query and needs nothing to run. */}
          <nav aria-label={hub.commonSearches} className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-sm text-muted-foreground">{hub.commonSearches}</span>
            {hub.chips.map((chip) => (
              <Link
                key={chip}
                href={`${faqHref}?q=${encodeURIComponent(chip)}`}
                className="rounded-full border px-4 py-2 text-sm whitespace-nowrap transition-colors hover:bg-muted"
              >
                {chip}
              </Link>
            ))}
          </nav>
        </section>

        {/* Omitted whole rather than left as a heading over an empty row — the same
            call the FAQ page makes, and the same reason: an empty band under a title
            reads as something that failed to load. The fixtures fill it today; the
            resource is written toward a CMS that may not. */}
        {featured.length > 0 ? (
        <section className="flex flex-col gap-8">
          <h2 className="font-heading text-2xl md:text-3xl">{hub.featuredTitle}</h2>

          {/* One-up on phones, two-up on tablets; the design's five-across only fits
              from the large breakpoint. */}
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {featured.map((entry) => (
              <li key={entry.slug} className="flex h-full flex-col gap-3 rounded-xl border p-5">
                <h3 className="text-base font-medium leading-snug">{entry.question[locale]}</h3>
                {/* Authored, never truncated: a sentence cut mid-word on the first
                    screen of the help section reads as a bug rather than a summary. */}
                <p className="flex-1 text-sm text-muted-foreground">{entry.shortAnswer[locale]}</p>
                <Link
                  href={detailHref(entry.topic, entry.slug)}
                  className="text-sm underline underline-offset-4"
                >
                  {hub.seeDetail}
                </Link>
              </li>
            ))}
          </ul>

        </section>
        ) : null}

        {/* Outside the band: the way into every answer must survive an empty row. */}
        <div className="flex justify-center">
          <Link href={faqHref} className={cn(buttonVariants({ variant: 'outline', size: 'xl' }))}>
            {hub.seeAllFaq}
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}
