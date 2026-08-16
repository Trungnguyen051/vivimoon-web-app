import type { Review } from '@/lib/types';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { RatingStars } from './rating-stars';

export function ReviewsList({ reviews, dict }: { reviews: Review[]; dict: Dictionary }) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">{dict.pdp.reviews}</h2>
      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">—</p>
      ) : (
        reviews.map((r) => (
          <div key={r.id} className="border-b pb-4">
            <div className="flex items-center gap-2">
              <RatingStars rating={r.rating} />
              <span className="text-sm font-medium">{r.author}</span>
              <span className="text-xs text-muted-foreground">{r.createdAt}</span>
            </div>
            <p className="mt-1 font-medium">{r.title}</p>
            <p className="text-sm text-muted-foreground">{r.body}</p>
          </div>
        ))
      )}
    </section>
  );
}
