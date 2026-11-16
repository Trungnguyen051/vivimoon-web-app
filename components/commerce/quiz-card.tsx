'use client';
import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { ChevronRight, Sparkle } from 'lucide-react';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { FACET_COLLECTION } from '@/lib/products/lens-facets';
import { answersFromOptionIds } from '@/lib/products/quiz-scoring';
import { quiz } from '@/content/quiz';

/** The Quiz's last answers on this device, as comma-separated option ids. Present = the Quiz was taken. */
const QUIZ_ANSWERS_KEY = 'vivimoon:quiz-answers';

export function saveQuizAnswers(optionIds: string) {
  try { localStorage.setItem(QUIZ_ANSWERS_KEY, optionIds); } catch { /* storage blocked: the card keeps its first-time copy */ }
}

/** Where a set of answers' Quiz Matches are listed (#248). */
export const quizResultsHref = (locale: Locale, optionIds: string) =>
  `/${locale}/collection/${FACET_COLLECTION}?quiz=${optionIds}`;

const noSubscribe = () => () => {};

/** Device storage is untrusted, and the questions can change: anything but a full set of today's answers reads as none. */
function savedQuizAnswers() {
  try {
    const saved = localStorage.getItem(QUIZ_ANSWERS_KEY) ?? '';
    const answers = answersFromOptionIds(saved.split(','), quiz.questions);
    return answers.length === quiz.questions.length ? answers.map((a) => a.optionId).join(',') : '';
  } catch { return ''; }
}

/**
 * "Chưa biết chọn mẫu nào?" — the quiz card in the PLP grid (Figma 106:51). Whether it
 * shows at all is the page's call (`showQuizCard`); this picks its copy and, after the
 * Quiz, links to the matches for the saved answers rather than question 1.
 */
export function QuizCard({
  locale, dict, questionCount, socialProof,
}: {
  locale: Locale; dict: Dictionary; questionCount: number; socialProof: string;
}) {
  const t = dict.collection.quizCard;
  // The server can't see this device's storage, so it renders the first-time copy.
  const saved = useSyncExternalStore(noSubscribe, savedQuizAnswers, () => '');

  return (
    <div className="flex flex-col justify-center gap-3 bg-muted p-4 md:gap-4 md:p-8">
      <span className="flex size-10 items-center justify-center rounded-full bg-background md:size-13">
        <Sparkle className="size-5 md:size-6" aria-hidden />
      </span>
      <h2 className="font-heading text-xl leading-tight md:text-[28px] md:leading-9">{t.title}</h2>
      <p className="text-xs text-muted-foreground md:text-base">{t.body.replace('{count}', String(questionCount))}</p>
      <Link
        href={saved ? quizResultsHref(locale, saved) : `/${locale}/quiz`}
        className={cn(buttonVariants(), 'h-auto w-full gap-2 rounded-none bg-foreground text-background hover:bg-foreground/85 px-3 py-3 text-xs whitespace-normal md:px-5 md:py-3.5 md:text-base')}
      >
        {saved ? t.revisit : t.cta}
        <ChevronRight className="size-4" aria-hidden />
      </Link>
      <p className="text-[11px] text-muted-foreground md:text-xs">{socialProof}</p>
    </div>
  );
}
