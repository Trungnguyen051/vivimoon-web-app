import type { Review, ReviewFilter } from '@/lib/api/schemas/catalog';

/** Shared by the reviews route and the PDP's filter tabs, so a tab's count and the route's answer can't disagree. */
export function filterReviews(reviews: Review[], { tag, hasMedia }: ReviewFilter): Review[] {
  return reviews.filter((r) => (!tag || r.tags.includes(tag)) && (!hasMedia || r.media.length > 0));
}

const SUB_RATINGS = ['comfort', 'colorMatch', 'easeOfWear'] as const;
type SubRatings = NonNullable<Review['subRatings']>;

/** The reviews block's summary column. Callers check for an empty list first — the average of nothing is NaN. */
export function reviewStats(reviews: Review[]) {
  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const histogram = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => Math.round(r.rating) === stars).length,
  }));
  const rated = reviews.flatMap((r) => (r.subRatings ? [r.subRatings] : []));
  const subRatings = rated.length === 0
    ? null
    : (Object.fromEntries(
        SUB_RATINGS.map((key) => [key, rated.reduce((sum, s) => sum + s[key], 0) / rated.length]),
      ) as SubRatings);
  return { average, histogram, subRatings, withMedia: reviews.filter((r) => r.media.length > 0).length };
}
