import { notFound } from 'next/navigation';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { discovery } from '@/lib/api/resources/discovery';
import { QuizFlow } from './quiz-flow';
import { PageContainer } from '@/components/layout/page-container';

export default async function QuizPage({
  params, searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ answers?: string }>;
}) {
  const { locale } = await params;
  const { answers } = await searchParams;
  if (!isLocale(locale)) notFound();
  const l = locale as Locale;
  const dict = getDictionary(l);

  const definition = await discovery.getQuizDefinition();
  return (
    <PageContainer>
      {/* "Sửa câu trả lời" (#248) reopens the Quiz with the results page's answers. */}
      <QuizFlow definition={definition} locale={l} dict={dict} initialAnswers={answers?.split(',')} />
    </PageContainer>
  );
}
