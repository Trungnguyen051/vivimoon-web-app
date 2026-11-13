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
  // Per sub-rating, over the Reviews that rated it; a sub-rating nobody rated is left out.
  const entries = SUB_RATINGS.flatMap((key) => {
    const given = reviews.flatMap((r) => (r.subRatings?.[key] === undefined ? [] : [r.subRatings[key]]));
    return given.length === 0 ? [] : [[key, given.reduce((sum, v) => sum + v, 0) / given.length] as const];
  });
  const subRatings = entries.length === 0 ? null : (Object.fromEntries(entries) as SubRatings);
  return { average, histogram, subRatings, withMedia: reviews.filter((r) => r.media.length > 0).length };
}

/**
 * A writer's public name: given name plus family initial ("Nguyễn Văn Trung" → "Trung N."). Vietnamese
 * names put the family name first; a single-word name shows as given.
 */
export function shortName(fullName: string): string {
  const words = fullName.trim().split(/\s+/);
  return words.length < 2 ? words[0] : `${words.at(-1)} ${words[0].charAt(0).toUpperCase()}.`;
}
