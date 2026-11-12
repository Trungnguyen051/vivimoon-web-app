import { notFound } from 'next/navigation';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { CartView } from './cart-view';

/** Server shell: the dictionary is read here, so only this locale's strings reach the client. */
export default async function CartPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <CartView locale={locale} dict={getDictionary(locale)} />;
}
