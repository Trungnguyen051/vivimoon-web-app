import { notFound } from 'next/navigation';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { CheckoutView } from './checkout-view';

/** Server shell: the dictionary is read here, so only this locale's strings reach the client. */
export default async function CheckoutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <CheckoutView locale={locale} dict={getDictionary(locale)} />;
}
