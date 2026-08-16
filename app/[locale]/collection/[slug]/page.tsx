import { notFound } from 'next/navigation';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary, type Dictionary } from '@/lib/i18n/dictionaries';
import { productRepository } from '@/lib/data';
import type { ProductQuery } from '@/lib/data';
import { ProductGrid } from '@/components/commerce/product-grid';
import { CollectionFilters } from '@/components/commerce/collection-filters';
import type { LensType, ReplacementSchedule } from '@/lib/types';

function resolveTitle(dict: Dictionary, key: string): string {
  const parts = key.split('.');
  let cur: unknown = dict;
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return key; // fallback to the raw key/title
    }
  }
  return typeof cur === 'string' ? cur : key;
}

export default async function CollectionPage({
  params, searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { locale, slug } = await params;
  const sp = await searchParams;
  if (!isLocale(locale)) notFound();
  const l = locale as Locale;
  const dict = getDictionary(l);

  const collection = await productRepository.getCollection(slug);
  if (!collection) notFound();

  // Start from the collection's products, then apply URL filters via listProducts intersection.
  const base = await productRepository.getProductsByIds(collection.productIds);
  const query: ProductQuery = {
    type: sp.type as LensType | undefined,
    replacement: sp.replacement as ReplacementSchedule | undefined,
    color: sp.color,
    sort: sp.sort as ProductQuery['sort'],
  };
  const filtered = await productRepository.listProducts(query);
  const ids = new Set(base.map((p) => p.id));
  const products = filtered.filter((p) => ids.has(p.id));

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">{resolveTitle(dict, collection.title)}</h1>
      <CollectionFilters dict={dict} />
      <ProductGrid products={products} locale={l} listId={collection.slug} />
    </div>
  );
}
