import { notFound } from 'next/navigation';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary, type Dictionary } from '@/lib/i18n/dictionaries';
import { catalog } from '@/lib/api/resources/catalog';
import { parseProductQueryLoose } from '@/lib/api/schemas/catalog';
import { SearchX } from 'lucide-react';
import { ProductGrid } from '@/components/commerce/product-grid';
import { collectionListId } from '@/lib/analytics/list-id';
import { CollectionFilters } from '@/components/commerce/collection-filters';
import { distinctColorVariants } from '@/lib/products/variant-colors';
import { Button } from '@/components/ui/button';
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

  // Start from the collection's products, then apply URL filters via listProducts intersection.
  const base = await catalog.getProductsByIds(collection.productIds);
  const query = parseProductQueryLoose(sp);
  const filtered = await catalog.listProducts(query);
  const ids = new Set(base.map((p) => p.id));
  const products = filtered.filter((p) => ids.has(p.id));

  /* Options come from the collection itself, so the control only ever offers colours
     that exist here; the dictionary names them (#43). */
  const colors = distinctColorVariants(base.flatMap((p) => p.variants)).map((v) => v.color as string);

  /* The filters the page actually applied, not every query param — a utm tag must not
     make an genuinely empty collection look filtered and offer a link back to itself. */
  const unfilteredHref = `/${l}/collection/${slug}`;
  const isFiltered = Object.values(query).some((value) => value !== undefined);

  return (
    <PageContainer>
      <div className="space-y-8">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{resolveTitle(dict, collection.title)}</h1>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <CollectionFilters dict={dict} colors={colors} />
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
            </EmptyHeader>
            {/* A real control, not an instruction (#43). Named for its outcome rather
                than repeating the filter row's "clear" — two buttons, one accessible name,
                is what a screen reader would otherwise announce. */}
            {isFiltered ? (
              <EmptyContent>
                <Button asChild variant="outline">
                  <Link href={unfilteredHref}>{dict.collection.showAll}</Link>
                </Button>
              </EmptyContent>
            ) : null}
          </Empty>
        ) : (
          <ProductGrid products={products} locale={l} dict={dict} listId={collectionListId(collection.slug, query, colors)} />
        )}
      </div>
    </PageContainer>
  );
}
