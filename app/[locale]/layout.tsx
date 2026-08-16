import { notFound } from 'next/navigation';
import { isLocale, locales, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { AnnouncementBar } from '@/components/layout/announcement-bar';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

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
      <AnnouncementBar text={dict.announcement.freeShipping} />
      <Header locale={locale as Locale} dict={dict} />
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
      <Footer locale={locale as Locale} dict={dict} />
    </>
  );
}
