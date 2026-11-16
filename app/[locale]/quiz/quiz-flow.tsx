'use client';
import { useEffect, useRef, useState } from 'react';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { QuizDefinition, QuizSubmitResponse } from '@/lib/api/schemas/discovery';
import type { Product } from '@/lib/types';
import { apiRequest } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { ProductGrid } from '@/components/commerce/product-grid';
import { saveQuizResults } from '@/components/commerce/quiz-card';
import { FACET_COLLECTION } from '@/lib/products/lens-facets';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
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
  definition, locale, dict, savedResults,
}: {
  definition: QuizDefinition; locale: Locale; dict: Dictionary;
  /** The picks this device saved last time (`/quiz?results=…`), shown instead of question 1. */
  savedResults?: Product[];
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Product[] | null>(savedResults?.length ? savedResults : null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // `isPending` state alone doesn't block a second click that fires before
  // the first's re-render commits (e.g. a fast double-tap) — this ref is
  // updated synchronously so the second call sees it immediately.
  const isSubmittingRef = useRef(false);

  const question = definition.questions[step];
  const isLast = step === definition.questions.length - 1;
  const selectedOptionId = question ? answers[question.id] : undefined;

  /*
   * The last step's button says how many lenses match ("Xem 12 mẫu lens hợp với bạn"), so
   * the answers are scored as soon as the set is complete. The same response is what the
   * button then shows — the count and the results can't disagree, and a click costs no
   * second request.
   */
  const [preview, setPreview] = useState<{ key: string; products: Product[] } | null>(null);
  const answersKey = definition.questions.map((q) => answers[q.id] ?? '').join(',');
  const complete = definition.questions.every((q) => answers[q.id]);
  const submit = (key: string) => apiRequest<QuizSubmitResponse>('/api/quiz/submit', {
    method: 'POST',
    body: { answers: key.split(',').map((optionId, i) => ({ questionId: definition.questions[i].id, optionId })) },
  });
  const submitRef = useRef(submit);
  useEffect(() => { submitRef.current = submit; });
  useEffect(() => {
    if (!complete) return;
    let stale = false;
    submitRef.current(answersKey).then((res) => {
      if (!stale && res.ok) setPreview({ key: answersKey, products: res.data.recommendations });
    });
    return () => { stale = true; };
  }, [answersKey, complete]);
  const matches = preview?.key === answersKey ? preview.products : null;

  function showResults(products: Product[]) {
    setResults(products);
    saveQuizResults(products.map((p) => p.id));
  }

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
    if (matches) return showResults(matches);
    // The count never arrived (slow or failed request): score on the click instead.
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsPending(true);
    setError(null);
    const res = await submit(answersKey);
    isSubmittingRef.current = false;
    setIsPending(false);
    if (res.ok) showResults(res.data.recommendations);
    // The server's message is for logs, not shoppers, and it is English either way.
    else setError(dict.quiz.error);
  }

  function retake() {
    setStep(0);
    setAnswers({});
    setResults(null);
    setPreview(null);
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
        {/* `from=quiz` tells the collection to hold back its own quiz card. */}
        <div className="flex justify-center">
          <Link
            href={`/${locale}/collection/${FACET_COLLECTION}?from=quiz`}
            className={cn(buttonVariants({ variant: 'outline' }), 'h-12 w-full rounded-none px-6 md:w-auto')}
          >
            {dict.quiz.browseAll}
          </Link>
        </div>
      </div>
    );
  }

  if (!question) return null;

  const total = definition.questions.length;
  const allLensesHref = `/${locale}/collection/${FACET_COLLECTION}?from=quiz`;
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
              onClick={() => selectOption(option.id)}
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

      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}

      <div className="flex items-center justify-between gap-3">
        <Button type="button" variant="outline" onClick={goBack} disabled={step === 0}>
          {dict.quiz.back}
        </Button>
        <div className="flex flex-col items-end gap-1.5">
          <Button type="button" onClick={goNext} disabled={!selectedOptionId || isPending}>
            {!isLast ? dict.quiz.next : matches ? dict.quiz.submitCount.replace('{n}', String(matches.length)) : dict.quiz.submit}
          </Button>
          {!selectedOptionId ? <p className="text-xs text-muted-foreground">{dict.quiz.unanswered}</p> : null}
        </div>
      </div>

      <p className="text-center text-sm">
        <Link href={allLensesHref} className="text-muted-foreground underline underline-offset-4 hover:text-foreground">
          {dict.quiz.skip}
        </Link>
      </p>
    </div>
  );
}
