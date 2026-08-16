import { notFound } from 'next/navigation';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary, type Dictionary } from '@/lib/i18n/dictionaries';
import { productRepository } from '@/lib/data';
import type { ProductQuery } from '@/lib/data';
import { SearchX } from 'lucide-react';
import { ProductGrid } from '@/components/commerce/product-grid';
import { CollectionFilters } from '@/components/commerce/collection-filters';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
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
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{resolveTitle(dict, collection.title)}</h1>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <CollectionFilters dict={dict} />
        {products.length > 0 ? (
          <p className="text-sm text-muted-foreground">{products.length} {dict.collection.productsLabel}</p>
        ) : null}
      </div>
      {products.length === 0 ? (
        <Empty className="rounded-xl border py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchX />
            </EmptyMedia>
            <EmptyTitle>{dict.collection.noResults}</EmptyTitle>
            <EmptyDescription>{dict.filters.clear}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ProductGrid products={products} locale={l} listId={collection.slug} />
      )}
    </div>
  );
}
