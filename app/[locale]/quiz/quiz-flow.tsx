'use client';
import { useRef, useState } from 'react';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { QuizDefinition, QuizSubmitResponse } from '@/lib/api/schemas/discovery';
import type { Product } from '@/lib/types';
import { apiRequest } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { ProductGrid } from '@/components/commerce/product-grid';
import { cn } from '@/lib/utils/cn';

/**
 * Client step-wizard (spec Task 8): one question per screen, in-memory
 * answers map keyed by question id (no persistence — quiz progress does not
 * need to survive a reload, nothing asks for that). Mirrors the
 * "render only the current step" shape `RxSelector` already established.
 *
 * Owns the `POST /api/quiz/submit` call itself, same posture as
 * `ComparisonTray` owning its fetch — this file lives under `app/`, not
 * `components/`, so it's the sanctioned place for a mutation fetch.
 */
export function QuizFlow({
  definition, locale, dict,
}: {
  definition: QuizDefinition; locale: Locale; dict: Dictionary;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Product[] | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // `isPending` state alone doesn't block a second click that fires before
  // the first's re-render commits (e.g. a fast double-tap) — this ref is
  // updated synchronously so the second call sees it immediately.
  const isSubmittingRef = useRef(false);

  const question = definition.questions[step];
  const isLast = step === definition.questions.length - 1;
  const selectedOptionId = question ? answers[question.id] : undefined;

  function selectOption(optionId: string) {
    setAnswers((prev) => ({ ...prev, [question.id]: optionId }));
  }

  function goBack() {
    setStep((s) => Math.max(0, s - 1));
  }

  async function goNext() {
    if (!selectedOptionId) return;
    if (!isLast) {
      setStep((s) => s + 1);
      return;
    }
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsPending(true);
    setError(null);
    const res = await apiRequest<QuizSubmitResponse>('/api/quiz/submit', {
      method: 'POST',
      body: { answers: definition.questions.map((q) => ({ questionId: q.id, optionId: answers[q.id] })) },
    });
    isSubmittingRef.current = false;
    setIsPending(false);
    if (res.ok) setResults(res.data.recommendations);
    else setError(res.error.message || dict.quiz.error);
  }

  function retake() {
    setStep(0);
    setAnswers({});
    setResults(null);
    setError(null);
  }

  if (results) {
    return (
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">{dict.quiz.resultsTitle}</h1>
          <Button type="button" variant="outline" onClick={retake}>{dict.quiz.retake}</Button>
        </div>
        <ProductGrid products={results} locale={locale} dict={dict} listId="quiz-results" />
      </div>
    );
  }

  if (!question) return null;

  const total = definition.questions.length;

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">{step + 1} / {total}</p>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${((step + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      <h1 className="text-2xl font-semibold tracking-tight">{question.prompt}</h1>

      <div role="radiogroup" aria-label={question.prompt} className="flex flex-col gap-3">
        {question.options.map((option) => {
          const checked = selectedOptionId === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => selectOption(option.id)}
              className={cn(
                'rounded-lg border px-4 py-3 text-left text-sm transition-colors',
                checked ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted',
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}

      <div className="flex items-center justify-between gap-3">
        <Button type="button" variant="outline" onClick={goBack} disabled={step === 0}>
          {dict.quiz.back}
        </Button>
        <div className="flex flex-col items-end gap-1.5">
          <Button type="button" onClick={goNext} disabled={!selectedOptionId || isPending}>
            {isLast ? dict.quiz.submit : dict.quiz.next}
          </Button>
          {!selectedOptionId ? <p className="text-xs text-muted-foreground">{dict.quiz.unanswered}</p> : null}
        </div>
      </div>
    </div>
  );
}
