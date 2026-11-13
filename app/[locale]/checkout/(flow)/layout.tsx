import { notFound } from 'next/navigation';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { CheckoutHeader } from '@/components/layout/checkout-header';

/**
 * The checkout layout: the slim header in place of the site's (which `SiteChrome`
 * leaves out on these routes). Success sits outside this group and keeps the site
 * layout. The QR page (#205) belongs in this group too.
 */
export default async function CheckoutLayout({
  children, params,
}: {
  children: React.ReactNode; params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <div className="min-h-svh bg-muted/60">
      <CheckoutHeader locale={locale} dict={getDictionary(locale)} step={2} />
      {children}
    </div>
  );
}
