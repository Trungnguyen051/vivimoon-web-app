import { notFound } from 'next/navigation';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { discovery } from '@/lib/api/resources/discovery';
import { catalog } from '@/lib/api/resources/catalog';
import { QuizFlow } from './quiz-flow';
import { PageContainer } from '@/components/layout/page-container';

export default async function QuizPage({
  params, searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ results?: string }>;
}) {
  const { locale } = await params;
  const { results } = await searchParams;
  if (!isLocale(locale)) notFound();
  const l = locale as Locale;
  const dict = getDictionary(l);

  const definition = await discovery.getQuizDefinition();
  // "Xem lại gợi ý cho bạn": this device's saved picks. Ids no longer in the catalog drop out; none left means a fresh quiz.
  const savedResults = results ? await catalog.getProductsByIds(results.split(',').slice(0, 24)) : [];

  return (
    <PageContainer>
      <QuizFlow definition={definition} locale={l} dict={dict} savedResults={savedResults} />
    </PageContainer>
  );
}
