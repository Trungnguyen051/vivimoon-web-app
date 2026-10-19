import { notFound } from 'next/navigation';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { editorial } from '@/lib/api/resources/editorial';
import { ArticleCards } from '@/components/commerce/article-cards';
import { PageContainer } from '@/components/layout/page-container';

export default async function ArticlesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const dict = getDictionary(locale);
  const articles = await editorial.listArticles();

  return (
    <PageContainer>
      <div className="flex flex-col gap-10 px-4 py-12">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{dict.articles.title}</h1>
        <ArticleCards
          articles={articles.map((article) => ({
            slug: article.slug,
            title: article.title[locale],
            excerpt: article.excerpt[locale],
            image: article.image,
            href: `/${locale}/articles/${article.slug}`,
          }))}
        />
      </div>
    </PageContainer>
  );
}
