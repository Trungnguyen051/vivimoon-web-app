import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { editorial } from '@/lib/api/resources/editorial';
import { toIntlLocale } from '@/lib/utils/format';
import { PageContainer } from '@/components/layout/page-container';

export default async function ArticlePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const dict = getDictionary(locale);

  const article = await editorial.getArticleBySlug(slug);
  if (!article) notFound();

  // publishedAt is a plain date, which parses as UTC midnight — formatting it in the
  // server's own zone would show the previous day anywhere west of UTC.
  const published = new Intl.DateTimeFormat(toIntlLocale(locale), { dateStyle: 'long', timeZone: 'UTC' })
    .format(new Date(article.publishedAt));

  return (
    <PageContainer>
      <article className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-12">
        <p className="text-sm text-muted-foreground">{dict.articles.publishedOn} {published}</p>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{article.title[locale]}</h1>
        <div className="relative aspect-[16/10] overflow-hidden rounded">
          <Image src={article.image} alt="" fill className="object-cover" sizes="(max-width:768px) 100vw, 672px" />
        </div>
        {/* Paragraphs, not markup: the fixtures cannot inject markup into the page. */}
        {article.body[locale].map((paragraph, i) => (
          <p key={i} className="text-muted-foreground">{paragraph}</p>
        ))}
        <Link href={`/${locale}/articles`} className="text-sm text-muted-foreground underline underline-offset-4">
          {dict.articles.backToIndex}
        </Link>
      </article>
    </PageContainer>
  );
}
