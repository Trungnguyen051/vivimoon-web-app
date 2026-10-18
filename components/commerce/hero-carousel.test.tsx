import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeroCarousel } from './hero-carousel';

/**
 * A marketing hero routinely runs two creatives for one collection, so href is
 * not a slide's identity — nor is the image, once a re-crop is reused. Both the
 * slides and the dot buttons key on the explicit `id` for that reason; keying
 * on content is the defect #30 shipped in CategoryGrid.
 */
describe('HeroCarousel', () => {
  afterEach(() => vi.restoreAllMocks());

  it('keys slides by identity when two share a destination and an image', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <HeroCarousel
        ctaLabel="Shop now"
        slides={[
          { id: 'sale-a', image: '/images/hero-1.jpg', href: '/en/collection/sale', alt: 'Sale, first look' },
          { id: 'sale-b', image: '/images/hero-1.jpg', href: '/en/collection/sale', alt: 'Sale, second look' },
        ]}
      />,
    );

    expect(consoleError.mock.calls.flat().join(' ')).not.toMatch(/same key/i);
    expect(screen.getByText('Sale, first look')).toBeInTheDocument();
    expect(screen.getByText('Sale, second look')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /go to slide/i })).toHaveLength(2);
  });
});
