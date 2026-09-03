import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReviewsList } from './reviews-list';
import { en } from '@/lib/i18n/dictionaries/en';
import type { Review } from '@/lib/types';

const reviews: Review[] = [
  {
    id: 'r1', productId: 'p1', author: 'Mai', rating: 5, title: 'Great lenses',
    body: 'Comfortable all day.', createdAt: '2026-08-01', hasImages: false,
    source: 'shopee', sourceUrl: 'https://shopee.vn/item/123',
  },
  {
    id: 'r2', productId: 'p1', author: 'An', rating: 4, title: 'Good',
    body: 'Would buy again.', createdAt: '2026-08-02', hasImages: false,
    source: 'vivimoon',
  },
];

describe('ReviewsList', () => {
  it('shows the empty state when there are no reviews', () => {
    render(<ReviewsList reviews={[]} dict={en} />);
    expect(screen.getByText(en.pdp.noReviews)).toBeInTheDocument();
  });

  it('renders a source badge per review, linked when sourceUrl is present', () => {
    render(<ReviewsList reviews={reviews} dict={en} />);
    const shopeeLink = screen.getByRole('link', { name: en.pdp.reviewSource.shopee });
    expect(shopeeLink).toHaveAttribute('href', 'https://shopee.vn/item/123');
    expect(screen.getByText(en.pdp.reviewSource.vivimoon)).toBeInTheDocument();
    expect(screen.queryAllByRole('link')).toHaveLength(1);
  });
});
