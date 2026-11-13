import { describe, it, expect } from 'vitest';
import { reviewSchema } from '@/lib/api/schemas/catalog';
import { filterReviews, reviewStats, shortName } from './reviews';

const base = { productId: 'p1', author: 'A', title: 't', body: 'b', createdAt: '2026-01-01' };
const reviews = [
  reviewSchema.parse({ ...base, id: 'a', rating: 5, tags: ['allDay'], media: [{ type: 'image', url: '/a.jpg' }],
    subRatings: { comfort: 5, colorMatch: 4, easeOfWear: 5 } }),
  reviewSchema.parse({ ...base, id: 'b', rating: 4, tags: ['allDay', 'myopic'],
    subRatings: { comfort: 4, colorMatch: 5, easeOfWear: 4 } }),
  reviewSchema.parse({ ...base, id: 'c', rating: 5, media: [{ type: 'video', url: '/v.mp4' }] }),
  reviewSchema.parse({ ...base, id: 'd', rating: 1 }),
];

describe('filterReviews', () => {
  it('returns everything with no filter', () => {
    expect(filterReviews(reviews, {})).toHaveLength(4);
  });

  it('keeps reviews carrying the tag', () => {
    expect(filterReviews(reviews, { tag: 'allDay' }).map((r) => r.id)).toEqual(['a', 'b']);
  });

  it('keeps reviews with a photo or video', () => {
    expect(filterReviews(reviews, { hasMedia: true }).map((r) => r.id)).toEqual(['a', 'c']);
  });

  it('combines the two', () => {
    expect(filterReviews(reviews, { tag: 'allDay', hasMedia: true }).map((r) => r.id)).toEqual(['a']);
  });
});

describe('reviewStats', () => {
  it('averages, histograms 5→1, and counts media', () => {
    const s = reviewStats(reviews);
    expect(s.average).toBeCloseTo(3.75);
    expect(s.histogram).toEqual([
      { stars: 5, count: 2 }, { stars: 4, count: 1 }, { stars: 3, count: 0 }, { stars: 2, count: 0 }, { stars: 1, count: 1 },
    ]);
    expect(s.withMedia).toBe(2);
  });

  it('averages sub-ratings over only the reviews that gave them', () => {
    expect(reviewStats(reviews).subRatings).toEqual({ comfort: 4.5, colorMatch: 4.5, easeOfWear: 4.5 });
  });

  it('has no sub-ratings when no review gave any', () => {
    expect(reviewStats(reviews.slice(2)).subRatings).toBeNull();
  });
});

describe('reviewStats with partial sub-ratings', () => {
  it('averages each sub-rating over the Reviews that gave it, leaving out one nobody gave', () => {
    const partial = [
      reviewSchema.parse({ ...base, id: 'p', rating: 5, subRatings: { comfort: 5 } }),
      reviewSchema.parse({ ...base, id: 'q', rating: 4, subRatings: { comfort: 3, colorMatch: 4 } }),
    ];
    expect(reviewStats(partial).subRatings).toEqual({ comfort: 4, colorMatch: 4 });
  });
});

describe('shortName', () => {
  it.each([
    ['Nguyễn Văn Trung', 'Trung N.'],
    ['Nguyễn Thị Mai', 'Mai N.'],
    ['  trần   linh ', 'linh T.'],
    ['Madonna', 'Madonna'],
  ])('shows %s as %s', (full, short) => {
    expect(shortName(full)).toBe(short);
  });
});
