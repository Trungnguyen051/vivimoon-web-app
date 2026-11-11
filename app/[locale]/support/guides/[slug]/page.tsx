import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { support } from '@/lib/api/resources/support';
import { editorial } from '@/lib/api/resources/editorial';
import { catalog } from '@/lib/api/resources/catalog';
import { readingMinutes } from '@/lib/editorial/reading-time';
import { toIntlLocale } from '@/lib/utils/format';
import { PageContainer } from '@/components/layout/page-container';
import { ProductGrid } from '@/components/commerce/product-grid';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

/**
 * A Guide: a fixed-layout help document, rendered in one order (ADR-0019).
 *
 * Reading time is counted off the body rather than authored beside it, so it cannot
 * drift from the text it describes — and the body here is every word a reader actually
 * reads: the opening note, each step's title and prose, and the closing note.
 *
 * `video` is in the schema and omitted from this guide. There is no footage, and an
 * empty grey box labelled "video" is a bug rather than a placeholder.
 */
export default async function GuidePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const dict = getDictionary(locale);
  const copy = dict.support.guide;

  const guide = await support.getGuideBySlug(slug);
  if (!guide) notFound();

  /* Every word of the document, in reading order. */
  const body = [
    ...guide.opening[locale],
    ...guide.steps.flatMap((step) => [step.title[locale], step.body[locale]]),
    ...guide.closing[locale],
  ];

  const collection = await catalog.getCollection(guide.collection);
  const products = collection ? await catalog.getProductsByIds(collection.productIds.slice(0, 3)) : [];

  /* The rail points at either kind — a Guide and an Article differ by shape, never by
     subject. Resolved rather than trusted: a renamed slug drops the card instead of
     shipping a link into a `notFound()`. */
  const related = (
    await Promise.all(
      guide.related.map(async (ref) => {
        if (ref.kind === 'guide') {
          const other = await support.getGuideBySlug(ref.slug);
          return other && { href: `/${locale}/support/guides/${other.slug}`, title: other.title[locale] };
        }
        const article = await editorial.getArticleBySlug(ref.slug);
        return article && { href: `/${locale}/articles/${article.slug}`, title: article.title[locale] };
      }),
    )
  ).filter((card): card is { href: string; title: string } => card !== null && card !== undefined);

  const dateFormat = new Intl.DateTimeFormat(toIntlLocale(locale), { dateStyle: 'long', timeZone: 'UTC' });

  return (
    <PageContainer>
      <div className="flex flex-col gap-10 py-12">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href={`/${locale}/support`} />}>{dict.nav.support}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>{guide.title[locale]}</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <header className="flex max-w-3xl flex-col gap-3">
          <h1 className="font-heading text-3xl md:text-4xl">{guide.title[locale]}</h1>
          {/* Computed reading time, authored updated date. A Guide carries both dates
              because instructions about someone's eyes going stale is a safety problem
              an opinion piece about lens colour is not. */}
          <p className="text-sm text-muted-foreground">
            {dict.articles.readingTime.replace('{count}', String(readingMinutes(body)))}
            {' · '}
            {copy.updatedOn} {dateFormat.format(new Date(guide.updatedAt))}
          </p>
        </header>

        <section className="flex max-w-3xl flex-col gap-3">
          <h2 className="font-heading text-xl">{copy.beforeYouStart}</h2>
          {guide.opening[locale].map((paragraph, i) => (
            <p key={i} className="text-muted-foreground">{paragraph}</p>
          ))}
        </section>

        <section className="flex flex-col gap-8">
          <h2 className="font-heading text-xl">{copy.stepsLabel}</h2>
          {/* An ordered list, so the numbering is the document's structure rather than
              text a reader has to trust. Stacks on a phone. */}
          <ol className="flex flex-col gap-8">
            {guide.steps.map((step, i) => (
              <li key={i} className="grid gap-4 sm:grid-cols-[200px_1fr] sm:items-start">
                <span className="relative block aspect-[4/3] overflow-hidden rounded-xl">
                  <Image
                    src={step.image}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width:640px) 100vw, 200px"
                  />
                </span>
                <div className="flex flex-col gap-2">
                  <h3 className="text-base font-medium">
                    {i + 1}. {step.title[locale]}
                  </h3>
                  <p className="text-muted-foreground">{step.body[locale]}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="flex max-w-3xl flex-col gap-3 rounded-xl border p-6">
          <h2 className="font-heading text-xl">{copy.safety}</h2>
          {guide.closing[locale].map((paragraph, i) => (
            <p key={i} className="text-muted-foreground">{paragraph}</p>
          ))}
        </section>

        {products.length > 0 ? (
          <section className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="font-heading text-2xl">{copy.suggested}</h2>
              {/* The row *is* the Collection, so this opens the real thing. */}
              <Link
                href={`/${locale}/collection/${guide.collection}`}
                className={cn(buttonVariants({ variant: 'outline' }))}
              >
                {copy.viewCollection}
              </Link>
            </div>
            {/* Through `ProductGrid`, which fires `view_item_list` and wires
                `select_item` per card. Hand-rolled cards would make this row invisible
                to GA4 — and "did the beginner guide sell any lenses" is exactly the
                question a merchandising row with its own "Xem tất cả" has to answer. */}
            <ProductGrid
              products={products}
              locale={locale}
              dict={dict}
              listId={`guide:${guide.slug}`}
            />
          </section>
        ) : null}

        {related.length > 0 ? (
          <section className="flex flex-col gap-6">
            <h2 className="font-heading text-2xl">{copy.related}</h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((card) => (
                <li key={card.href}>
                  <Link href={card.href} className="block h-full rounded-xl border p-5 transition-colors hover:bg-muted">
                    <span className="text-base font-medium">{card.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </PageContainer>
  );
}
