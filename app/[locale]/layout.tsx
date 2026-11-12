import { notFound } from 'next/navigation';
import { isLocale, locales, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { AnnouncementBar } from '@/components/layout/announcement-bar';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { SessionSync } from '@/features/session/session-sync';
import { WelcomeDialog } from '@/features/session/welcome-dialog';
import { ComparisonTray } from '@/components/commerce/comparison-tray';
import { BoundaryStringsProvider } from '@/components/layout/boundary-strings';
import { MiniCart } from '@/components/commerce/mini-cart';
import { catalog } from '@/lib/api/resources/catalog';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children, params,
}: {
  children: React.ReactNode; params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale as Locale);
  return (
    <>
      <SessionSync />
      <WelcomeDialog dict={dict.welcome} />
      <AnnouncementBar segments={[dict.announcement.freeShipping, dict.announcement.authentic, dict.announcement.licensed]} />
      <Header locale={locale as Locale} dict={dict} />
      {/* Width and padding belong to the page, not here — see ADR-0013. Pages opt in via PageContainer. */}
      {/* Only the strings `not-found` and `error` print, so the dictionaries stay off the client. */}
      <BoundaryStringsProvider value={{ locale: locale as Locale, notFound: dict.notFound, errorPage: dict.errorPage }}>
        <main>{children}</main>
      </BoundaryStringsProvider>
      <Footer locale={locale as Locale} dict={dict} />
      <ComparisonTray locale={locale as Locale} dict={dict} />
      <MiniCart locale={locale as Locale} dict={dict} accessories={await catalog.listAccessories()} />
    </>
  );
}
