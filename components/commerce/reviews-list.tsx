'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MessageSquare, Play } from 'lucide-react';
import type { Review, ReviewFilter, ReviewTag } from '@/lib/types';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/config';
import { filterReviews, reviewStats } from '@/lib/products/reviews';
import { toIntlLocale } from '@/lib/utils/format';
import { BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { RatingStars } from './rating-stars';
import { ReviewSourceBadge } from './review-source-badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { HelpfulButton } from './helpful-button';
import { apiRequest } from '@/lib/api/client';
import { useSessionStore } from '@/features/session/session-store';

/**
 * Stars, average and count, read from the reviews themselves. The product page's header
 * uses this too, so it can never disagree with the list below it the way the product's
 * stored `rating`/`reviewCount` did. Nothing at all when there are no reviews.
 */
export function ReviewsSummary({ reviews, dict }: { reviews: Review[]; dict: Dictionary }) {
  if (reviews.length === 0) return null;
  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <div className="flex items-center gap-2">
      <RatingStars label={dict.common.rating} outOfLabel={dict.common.outOf} rating={average} />
      <span className="text-sm text-muted-foreground">
        {average.toFixed(1)} · {reviews.length}
      </span>
    </div>
  );
}

const TAGS: ReviewTag[] = ['sensitiveEyes', 'allDay', 'beginner', 'myopic'];
const SUB_RATINGS = ['comfort', 'colorMatch', 'easeOfWear'] as const;
/** Reviews shown before "See all" — the wireframe shows a short first page. */
const FIRST_PAGE = 4;

const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key]));

export function ReviewsList({ reviews, dict, locale, productSlug }: {
  reviews: Review[]; dict: Dictionary; locale: Locale;
  /** Where a signed-in member's per-Review flags (voted, own) are read from; without it, everyone reads as a guest. */
  productSlug?: string;
}) {
  const viewer = useViewerReviews(productSlug);
  const [filter, setFilter] = useState<ReviewFilter>({});
  const [expanded, setExpanded] = useState(false);
  const t = dict.reviews;
  const number = (n: number) => n.toLocaleString(toIntlLocale(locale));

  if (reviews.length === 0) {
    return (
      <section id="reviews" className="scroll-mt-24 space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight md:text-4xl">{t.title}</h2>
        <Empty className="rounded-xl border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MessageSquare />
            </EmptyMedia>
            <EmptyTitle>{dict.pdp.noReviews}</EmptyTitle>
          </EmptyHeader>
        </Empty>
      </section>
    );
  }

  const stats = reviewStats(reviews);
  const percent = (count: number) => Math.round((count / reviews.length) * 100);
  const shown = filterReviews(reviews, filter);
  const visible = expanded ? shown : shown.slice(0, FIRST_PAGE);

  const tabs: { label: string; value: ReviewFilter }[] = [
    { label: t.all, value: {} },
    { label: fill(t.withMedia, { n: number(stats.withMedia) }), value: { hasMedia: true } },
    ...TAGS.map((tag) => ({ label: t.tags[tag], value: { tag } })),
  ];

  return (
    <section id="reviews" className="scroll-mt-24 space-y-6 md:space-y-10">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight md:text-4xl">{t.title}</h2>
        <p className="text-sm text-muted-foreground md:text-base">
          {fill(t.summary, { n: number(reviews.length), p: percent(stats.withMedia) })}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:gap-14">
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-5 lg:flex-col lg:items-start">
            <div className="flex shrink-0 flex-col items-center gap-1 lg:flex-row lg:gap-3">
              <p className="text-5xl font-semibold tracking-tight lg:text-6xl">{stats.average.toFixed(1)}</p>
              <div className="flex flex-col items-center gap-1 lg:items-start">
                <RatingStars label={dict.common.rating} outOfLabel={dict.common.outOf} rating={stats.average} />
                <p className="text-xs text-muted-foreground lg:text-sm">{t.outOf5}</p>
              </div>
            </div>

            <ul className="flex w-full flex-col gap-1.5 lg:gap-2">
              {stats.histogram.map(({ stars, count }) => (
                <li key={stars} data-testid="histogram-row" className="flex items-center gap-2.5 text-xs lg:text-sm">
                  <span className="w-5 shrink-0">{stars}★</span>
                  <span aria-hidden className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <span className="block h-full rounded-full bg-foreground" style={{ width: `${percent(count)}%` }} />
                  </span>
                  <span className="w-9 shrink-0 text-right text-muted-foreground">{percent(count)}%</span>
                </li>
              ))}
            </ul>
          </div>

          {stats.subRatings && (
            <dl className="flex flex-col gap-3 rounded-xl bg-muted/60 p-5 text-sm">
              {SUB_RATINGS.filter((key) => stats.subRatings![key] !== undefined).map((key) => (
                <div key={key} className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{t.subRatings[key]}</dt>
                  <dd className="font-semibold">{stats.subRatings![key]!.toFixed(1)} / 5</dd>
                </div>
              ))}
            </dl>
          )}

          {/* The orders page sends a guest to sign-in and back, so one link serves both. */}
          <Link href={`/${locale}/account/orders`} className={cn(buttonVariants({ variant: 'outline', size: 'xl' }), 'w-full')}>
            {t.write}
          </Link>
        </div>

        <div className="min-w-0">
          <div role="group" aria-label={t.filters} className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-4 md:mx-0 md:flex-wrap md:px-0">
            {tabs.map(({ label, value }) => {
              const active = value.tag === filter.tag && value.hasMedia === filter.hasMedia;
              return (
                <button
                  key={label}
                  type="button"
                  aria-pressed={active}
                  onClick={() => { setFilter(value); setExpanded(false); }}
                  className={cn(
                    'shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-colors',
                    active ? 'border-foreground bg-foreground text-background' : 'border-border bg-background hover:bg-muted',
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {shown.length === 0 ? (
            <p className="border-t py-8 text-sm text-muted-foreground">{t.noMatch}</p>
          ) : (
            visible.map((r) => <ReviewCard key={r.id} review={viewer?.get(r.id) ?? r} dict={dict} locale={locale} />)
          )}

          {!expanded && shown.length > FIRST_PAGE && (
            <Button variant="outline" size="xl" className="mt-2 w-full md:w-auto" onClick={() => setExpanded(true)}>
              {fill(t.seeAll, { n: number(shown.length) })}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

/** The signed-in member's view of the list, by Review id: their votes and which Review is theirs. */
function useViewerReviews(productSlug?: string) {
  const status = useSessionStore((s) => s.status);
  const [viewer, setViewer] = useState<Map<string, Review> | null>(null);
  useEffect(() => {
    if (status !== 'authenticated' || !productSlug) return;
    let cancelled = false;
    apiRequest<Review[]>(`/api/products/${productSlug}/reviews`).then((result) => {
      if (!cancelled && result.ok) setViewer(new Map(result.data.map((r) => [r.id, r])));
    });
    return () => { cancelled = true; };
  }, [status, productSlug]);
  return status === 'authenticated' ? viewer : null;
}

function ReviewCard({ review: r, dict, locale }: { review: Review; dict: Dictionary; locale: Locale }) {
  const t = dict.reviews;
  return (
    <article className="flex flex-col gap-3 border-t py-6">
      <div className="flex items-start gap-3">
        <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground md:size-10">
          {r.author.replace(/^@/, '').charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium">{r.author}</h3>
            <div className="flex shrink-0 items-center gap-1.5">
              {r.source === 'vivimoon' && (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
                  <BadgeCheck aria-hidden className="size-3.5" />
                  {dict.writeReview.verifiedPurchase}
                </span>
              )}
              <ReviewSourceBadge source={r.source} sourceUrl={r.sourceUrl} dict={dict} />
            </div>
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-1 text-sm text-muted-foreground">
            <RatingStars label={dict.common.rating} outOfLabel={dict.common.outOf} rating={r.rating} />
            {r.variantLabel && <span>· {fill(t.bought, { variant: r.variantLabel })}</span>}
          </div>
        </div>
      </div>

      {r.tags.length > 0 && (
        <p className="text-xs text-muted-foreground">{r.tags.map((tag) => t.tags[tag]).join(' · ')}</p>
      )}
      <p className="leading-relaxed">
        {r.title && <span className="font-medium">{r.title}. </span>}
        {r.body}
      </p>

      {r.media.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {r.media.map((m, i) => (
            <li key={m.url}>
              <a
                href={m.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={m.type === 'video' ? t.video : fill(t.photo, { n: i + 1 })}
                className="relative flex size-16 items-center justify-center overflow-hidden rounded-lg bg-muted md:size-20"
              >
                {(m.type === 'image' ? m.url : m.poster) && (
                  <Image src={(m.type === 'image' ? m.url : m.poster)!} alt="" fill sizes="80px" className="object-cover" />
                )}
                {m.type === 'video' && (
                  <span className="relative flex size-8 items-center justify-center rounded-full bg-background/90">
                    <Play className="size-4 fill-current" />
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>
      )}

      <HelpfulButton
        reviewId={r.id}
        marketplaceCount={r.marketplaceHelpfulCount}
        voteCount={r.helpfulVoteCount}
        hasVoted={r.hasVoted ?? false}
        isOwn={r.isOwn}
        locale={locale}
        dict={t}
      />
    </article>
  );
}
