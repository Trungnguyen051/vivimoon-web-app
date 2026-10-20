import { notFound } from 'next/navigation';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { PageContainer } from '@/components/layout/page-container';

/**
 * A stub, so Hỗ trợ resolves to a real page rather than sitting inert in the nav
 * (#72). It carries no support content yet — Vivimoon owns the FAQ — and the
 * header and footer around it are the point: a shopper who lands here can carry
 * on browsing, and the nav item can finally take the current-route underline (#74).
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
      </div>
    </PageContainer>
  );
}
