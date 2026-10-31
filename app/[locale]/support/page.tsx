import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { PageContainer } from '@/components/layout/page-container';

/**
 * Still the stub from #72, and still the thing Hỗ trợ resolves to — but no longer a
 * dead end. #119 shipped the 26 answers behind `/support/faq`, and a page of answers
 * nobody can reach from the nav is a page that does not exist: the only route in
 * would be typing the URL. The link below is the smallest thing that makes them
 * reachable, and it goes when #121 replaces this page with the real hub.
 */
export default async function SupportPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const dict = getDictionary(locale);

  return (
    <PageContainer>
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-12">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{dict.nav.support}</h1>
        <p className="text-muted-foreground">{dict.support.comingSoon}</p>
        <Link href={`/${locale}/support/faq`} className="underline underline-offset-4">
          {dict.support.faq.title}
        </Link>
      </div>
    </PageContainer>
  );
}
