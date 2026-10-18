import { notFound } from 'next/navigation';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { PageContainer } from '@/components/layout/page-container';

/**
 * A stub, so the brand story's CTA resolves to a real page rather than a 404
 * (#39). Nothing else links here yet — the nav's Về Vivimoon is #40's job, and
 * this route existing is what unblocks it. It carries the brand-story copy and
 * nothing more; the full About page is not specified yet.
 */
export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const dict = getDictionary(locale);

  return (
    <PageContainer>
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-12">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          <span className="block">{dict.brandStory.headingLine1}</span>
          <span className="block">{dict.brandStory.headingLine2}</span>
        </h1>
        <p className="text-muted-foreground">{dict.brandStory.body}</p>
      </div>
    </PageContainer>
  );
}
