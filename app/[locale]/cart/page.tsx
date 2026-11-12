import { notFound } from 'next/navigation';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { catalog } from '@/lib/api/resources/catalog';
import { CartView } from './cart-view';

/** Server shell: the dictionary is read here, so only this locale's strings reach the client. */
export default async function CartPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const [accessories, lenses] = await Promise.all([catalog.listAccessories(), catalog.listProducts({ sort: 'bestselling' })]);
  // Two lenses are enough for the "Mua thêm" row, which shows four cards at most.
  return <CartView locale={locale} dict={getDictionary(locale)} accessories={accessories} lenses={lenses.slice(0, 2)} />;
}
