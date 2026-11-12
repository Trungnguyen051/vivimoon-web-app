import { notFound } from 'next/navigation';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary, type Dictionary } from '@/lib/i18n/dictionaries';
import { catalog } from '@/lib/api/resources/catalog';
import { COLLECTION_PAGE_SIZE as PAGE_SIZE, DEFAULT_SORT, parseProductQueryLoose } from '@/lib/api/schemas/catalog';
import { SearchX } from 'lucide-react';
import { ProductGrid } from '@/components/commerce/product-grid';
import { collectionListId } from '@/lib/analytics/list-id';
import {
  CollectionFilters, CollectionFiltersSheet, CollectionLoadMore, CollectionSort, DefaultRxAutoApply, YourRxSheet,
} from '@/components/commerce/collection-filters';
import { distinctColorVariants } from '@/lib/products/variant-colors';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import Link from 'next/link';
import { Empty, EmptyContent, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { PageContainer } from '@/components/layout/page-container';

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

  const collection = await catalog.getCollection(slug);
  if (!collection) notFound();

  const query = parseProductQueryLoose(sp);
  // Paging is `?show=`, whole pages only, so a shared link opens on as many lenses as it showed.
  const shown = Math.max(PAGE_SIZE, Math.ceil((Number.parseInt(sp.show ?? '', 10) || 0) / PAGE_SIZE) * PAGE_SIZE);
  const { products, total, counts } = await catalog.searchProducts(
    { ...query, sort: query.sort ?? DEFAULT_SORT },
    { ids: collection.productIds, limit: shown },
  );

  /* The colours this collection contains bound the analytics id's only free-form field. */
  const base = await catalog.getProductsByIds(collection.productIds);
  const colors = distinctColorVariants(base.flatMap((p) => p.variants)).map((v) => v.color as string);

  /* The filters the page actually applied, not every query param — a utm tag must not
     make an genuinely empty collection look filtered and offer a link back to itself. */
  const unfilteredHref = `/${l}/collection/${slug}`;
  const isFiltered = Object.entries(query).some(([key, value]) => key !== 'sort' && value !== undefined);

  return (
    <PageContainer>
      <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{resolveTitle(dict, collection.title)}</h1>
      <div className="mt-6 flex items-start gap-10 md:mt-8">
        <aside className="hidden w-66 shrink-0 lg:block">
          <CollectionFilters dict={dict} counts={counts} />
        </aside>
        <div className="min-w-0 flex-1 space-y-6">
          <DefaultRxAutoApply />
          <div className="grid grid-cols-2 gap-2 lg:hidden">
            <CollectionFiltersSheet dict={dict} counts={counts} />
            <YourRxSheet dict={dict} />
          </div>
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">{total} {dict.collection.productsLabel}</p>
            <CollectionSort dict={dict} />
          </div>
        {products.length === 0 ? (
          <Empty className="rounded-xl border py-16">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SearchX />
              </EmptyMedia>
              <EmptyTitle>{dict.collection.noResults}</EmptyTitle>
            </EmptyHeader>
            {/* A real control, not an instruction (#43). Named for its outcome rather
                than repeating the filter row's "clear" — two controls, one accessible name,
                is what a screen reader would otherwise announce. */}
            {isFiltered ? (
              <EmptyContent>
                <Link href={unfilteredHref} className={cn(buttonVariants({ variant: 'outline' }))}>
                  {dict.collection.showAll}
                </Link>
              </EmptyContent>
            ) : null}
          </Empty>
        ) : (
          <ProductGrid
            products={products}
            locale={l}
            dict={dict}
            listId={collectionListId(collection.slug, query, colors)}
            // Three across beside the sidebar, as the frame draws it.
            className="lg:grid-cols-3"
          />
        )}
          {total > 0 ? <CollectionLoadMore dict={dict} shown={products.length} total={total} /> : null}
        </div>
      </div>
    </PageContainer>
  );
}
