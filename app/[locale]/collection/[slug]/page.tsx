import { notFound } from 'next/navigation';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary, type Dictionary } from '@/lib/i18n/dictionaries';
import { catalog } from '@/lib/api/resources/catalog';
import { COLLECTION_PAGE_SIZE as PAGE_SIZE, DEFAULT_SORT, parseProductQueryLoose } from '@/lib/api/schemas/catalog';
import { SearchX } from 'lucide-react';
import { ProductGrid } from '@/components/commerce/product-grid';
import { collectionListId } from '@/lib/analytics/list-id';
import {
  ActiveFilters, ClearRxFilter, CollectionFilters, CollectionFiltersSheet, CollectionImageView, CollectionLoadMore,
  CollectionSort, DefaultRxAutoApply, YourRxSheet,
} from '@/components/commerce/collection-filters';
import { QuizCard } from '@/components/commerce/quiz-card';
import { cardImage, parseCardView, rxPairLabel, showQuizCard } from '@/lib/products/plp-card';
import { quiz, quizSocialProof } from '@/content/quiz';
import { answersFromOptionIds } from '@/lib/products/quiz-scoring';
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
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
  // With `quiz=` the page is the Quiz's results (#248): its matches, best first unless sorted.
  const answers = query.quiz ? answersFromOptionIds(query.quiz.split(','), quiz.questions) : [];
  const isQuizResults = answers.length > 0;
  const { products, total, totalAnyPower, counts } = await catalog.searchProducts(
    { ...query, sort: query.sort ?? (isQuizResults ? undefined : DEFAULT_SORT) },
    { ids: collection.productIds, limit: shown },
  );

  // "12 mẫu chọn theo câu trả lời" counts the matches themselves, whatever filters the shopper adds on top.
  const matchCount = isQuizResults
    ? (await catalog.searchProducts({ quiz: query.quiz }, { ids: collection.productIds, limit: 0 })).total
    : 0;

  // The applied Default Rx as the shopper reads it; null when the listing isn't narrowed by one.
  const rx = rxPairLabel(query.rx, dict);

  // "Xem ảnh": every card shows the chosen view and swaps to the close-up (or, on it, the model) on hover.
  const view = parseCardView(sp.view);
  const hoverView = view === 'closeUp' ? 'face' : 'closeUp';
  const images = Object.fromEntries(await Promise.all(products.map(async (p) => {
    const gallery = (await catalog.getGallery(p.id))?.contexts;
    return [p.id, { image: cardImage(p, gallery, view), hoverImage: cardImage(p, gallery, hoverView) }] as const;
  })));

  /* The colours this collection contains bound the analytics id's only free-form field. */
  const base = await catalog.getProductsByIds(collection.productIds);
  const colors = distinctColorVariants(base.flatMap((p) => p.variants)).map((v) => v.color as string);

  /* The filters the page actually applied, not every query param — a utm tag must not
     make an genuinely empty collection look filtered and offer a link back to itself. */
  const unfilteredHref = `/${l}/collection/${slug}`;
  const isFiltered = Object.entries(query).some(([key, value]) => key !== 'sort' && key !== 'quiz' && value !== undefined);
  const unfilteredResultsHref = isQuizResults ? `${unfilteredHref}?quiz=${query.quiz}` : unfilteredHref;

  return (
    <PageContainer>
      {isQuizResults ? (
        <>
          <Breadcrumb aria-label={dict.common.breadcrumb} className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link href={unfilteredHref} />}>{resolveTitle(dict, collection.title)}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage>{dict.quiz.results.breadcrumb}</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{dict.quiz.results.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <p className="text-muted-foreground">
              {dict.quiz.results.summary
                .replace('{n}', String(matchCount))
                .replace('{answers}', answers.map((a) =>
                  quiz.questions.find((q) => q.id === a.questionId)?.options.find((o) => o.id === a.optionId)?.label[l],
                ).join(' · '))}
            </p>
            <Link href={`/${l}/quiz`} className="underline underline-offset-4">{dict.quiz.results.redo}</Link>
            <Link href={`/${l}/quiz?answers=${query.quiz}`} className="underline underline-offset-4">{dict.quiz.results.edit}</Link>
          </div>
        </>
      ) : (
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{resolveTitle(dict, collection.title)}</h1>
      )}
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
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                {rx
                  ? dict.collection.rx.count.replace('{n}', String(total)).replace('{total}', String(totalAnyPower))
                  : `${total} ${dict.collection.productsLabel}`}
              </p>
              <div className="flex items-center gap-6">
                <CollectionImageView dict={dict} className="hidden lg:flex" />
                <CollectionSort dict={dict} />
              </div>
            </div>
            <CollectionImageView dict={dict} className="lg:hidden" />
            <ActiveFilters dict={dict} />
          </div>
        {products.length === 0 ? (
          <Empty className="rounded-xl border py-16">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SearchX />
              </EmptyMedia>
              {/* Only blame the powers when dropping them would actually show lenses. */}
              <EmptyTitle>
                {rx && totalAnyPower > 0 ? dict.collection.rx.noResults.replace('{rx}', rx) : dict.collection.noResults}
              </EmptyTitle>
            </EmptyHeader>
            {/* A real control, not an instruction (#43). Named for its outcome rather
                than repeating the filter row's "clear" — two controls, one accessible name,
                is what a screen reader would otherwise announce. */}
            {rx && totalAnyPower > 0 ? (
              <EmptyContent>
                <ClearRxFilter>{dict.collection.rx.clear}</ClearRxFilter>
              </EmptyContent>
            ) : isFiltered ? (
              <EmptyContent>
                <Link href={unfilteredResultsHref} className={cn(buttonVariants({ variant: 'outline' }))}>
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
            images={images}
            rxLine={rx ? dict.collection.card.rxInStock.replace('{rx}', rx) : undefined}
            fourth={showQuizCard(sp, total) ? (
              <QuizCard
                locale={l}
                dict={dict}
                questionCount={quiz.questions.length}
                socialProof={quizSocialProof(dict.home.quiz.socialProof, l)}
              />
            ) : null}
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
