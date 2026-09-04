import { notFound } from 'next/navigation';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { discovery } from '@/lib/api/resources/discovery';
import { QuizFlow } from './quiz-flow';

export default async function QuizPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const l = locale as Locale;
  const dict = getDictionary(l);

  const definition = await discovery.getQuizDefinition();

  return <QuizFlow definition={definition} locale={l} dict={dict} />;
}
