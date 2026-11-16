'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { QuizDefinition, QuizSubmitResponse } from '@/lib/api/schemas/discovery';
import { apiRequest } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { quizResultsHref, saveQuizAnswers } from '@/components/commerce/quiz-card';
import { FACET_COLLECTION } from '@/lib/products/lens-facets';
import { answersFromOptionIds } from '@/lib/products/quiz-scoring';
import { cn } from '@/lib/utils/cn';

/**
 * Client step-wizard: one question per screen, in-memory answers keyed by question id.
 * Finishing opens the Quiz Matches as a listing (#248) — the answers travel in that
 * address, so this screen renders no results of its own.
 *
 * `initialAnswers` is the results page's "Sửa câu trả lời": the Quiz reopens on its last
 * step with those option ids picked. Ids the questions don't have are ignored.
 */
export function QuizFlow({
  definition, locale, dict, initialAnswers = [],
}: {
  definition: QuizDefinition; locale: Locale; dict: Dictionary; initialAnswers?: string[];
}) {
  const router = useRouter();
  const total = definition.questions.length;
  const [answers, setAnswers] = useState<Record<string, string>>(() =>
    Object.fromEntries(answersFromOptionIds(initialAnswers, definition.questions).map((a) => [a.questionId, a.optionId])));
  const [step, setStep] = useState(() => (definition.questions.every((q) => answers[q.id]) ? total - 1 : 0));

  const question = definition.questions[step];
  const isLast = step === total - 1;
  const selectedOptionId = question ? answers[question.id] : undefined;

  /*
   * The last step's button says how many lenses match ("Xem 12 mẫu lens hợp với bạn"), so
   * the answers are scored as soon as the set is complete. The count is a courtesy: if the
   * request is slow or fails the button keeps its plain label and still opens the results.
   */
  const [count, setCount] = useState<{ key: string; n: number } | null>(null);
  const answersKey = definition.questions.map((q) => answers[q.id] ?? '').join(',');
  const complete = definition.questions.every((q) => answers[q.id]);
  const questionsRef = useRef(definition.questions);
  useEffect(() => {
    if (!complete) return;
    let stale = false;
    apiRequest<QuizSubmitResponse>('/api/quiz/submit', {
      method: 'POST',
      body: { answers: answersFromOptionIds(answersKey.split(','), questionsRef.current) },
    }).then((res) => {
      if (!stale && res.ok) setCount({ key: answersKey, n: res.data.recommendations.length });
    });
    return () => { stale = true; };
  }, [answersKey, complete]);
  const matchCount = count?.key === answersKey ? count.n : null;

  function goNext() {
    if (!selectedOptionId) return;
    if (!isLast) return setStep((s) => s + 1);
    saveQuizAnswers(answersKey);
    router.push(quizResultsHref(locale, answersKey));
  }

  if (!question) return null;

  // The answers given on the steps before this one.
  const recap = definition.questions.slice(0, step).flatMap((q) => {
    const option = q.options.find((o) => o.id === answers[q.id]);
    return option ? [option.label[locale]] : [];
  });

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>{dict.quiz.step.replace('{n}', String(step + 1)).replace('{total}', String(total))}</p>
          <Link href={`/${locale}`} className="underline underline-offset-4 hover:text-foreground">{dict.quiz.exit}</Link>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${((step + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      <h1 className="text-2xl font-semibold tracking-tight">{question.prompt[locale]}</h1>

      <div role="radiogroup" aria-label={question.prompt[locale]} className="flex flex-col gap-3">
        {question.options.map((option) => {
          const checked = selectedOptionId === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: option.id }))}
              className={cn(
                'rounded-lg border px-4 py-3 text-left text-sm transition-colors',
                checked ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted',
              )}
            >
              {option.label[locale]}
            </button>
          );
        })}
      </div>

      {recap.length > 0 ? (
        <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {dict.quiz.recap}
          {recap.map((label) => <span key={label} className="border px-2 py-0.5 text-foreground">{label}</span>)}
        </p>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <Button type="button" variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          {dict.quiz.back}
        </Button>
        <div className="flex flex-col items-end gap-1.5">
          <Button type="button" onClick={goNext} disabled={!selectedOptionId}>
            {!isLast ? dict.quiz.next
              : matchCount !== null ? dict.quiz.submitCount.replace('{n}', String(matchCount))
              : dict.quiz.submit}
          </Button>
          {!selectedOptionId ? <p className="text-xs text-muted-foreground">{dict.quiz.unanswered}</p> : null}
        </div>
      </div>

      <p className="text-center text-sm">
        <Link
          href={`/${locale}/collection/${FACET_COLLECTION}?from=quiz`}
          className="text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          {dict.quiz.skip}
        </Link>
      </p>
    </div>
  );
}
