import { MessageSquare } from 'lucide-react';
import type { Review } from '@/lib/types';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { RatingStars } from './rating-stars';
import { ReviewSourceBadge } from './review-source-badge';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';

export function ReviewsList({ reviews, dict }: { reviews: Review[]; dict: Dictionary }) {
  const average =
    reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold tracking-tight">{dict.pdp.reviews}</h2>
        {reviews.length > 0 ? (
          <div className="flex items-center gap-2">
            <RatingStars rating={average} />
            <span className="text-sm text-muted-foreground">
              {average.toFixed(1)} · {reviews.length}
            </span>
          </div>
        ) : null}
      </div>

      {reviews.length === 0 ? (
        <Empty className="rounded-xl border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MessageSquare />
            </EmptyMedia>
            <EmptyTitle>{dict.pdp.noReviews}</EmptyTitle>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {reviews.map((r) => (
            <article key={r.id} className="rounded-xl border p-5">
              <div className="flex items-center justify-between gap-2">
                <RatingStars rating={r.rating} />
                <span className="text-xs text-muted-foreground">{r.createdAt}</span>
              </div>
              <p className="mt-3 font-medium">{r.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
              <div className="mt-4 flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-foreground">{r.author}</p>
                <ReviewSourceBadge source={r.source} sourceUrl={r.sourceUrl} dict={dict} />
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
