import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProductPage from './page';
import { products, reviews } from '@/content/mock';
import { en as enDict } from '@/lib/i18n/dictionaries/en';

vi.mock('next/navigation', async (orig) => ({
  ...(await orig<typeof import('next/navigation')>()),
  usePathname: () => '/en',
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

async function renderProduct(slug: string) {
  return render(await ProductPage({ params: Promise.resolve({ locale: 'en', slug }) }));
}

const reviewsOf = (productId: string) => reviews.filter((r) => r.productId === productId);

/**
 * The product's stored `rating`/`reviewCount` and the reviews below it are two sources
 * that drift — `breeze-daily-clear` once read "4.4 · 0" over one real review. The
 * header is derived from the same reviews the list shows, so they cannot disagree.
 */
describe('a product page', () => {
  it('rates the product from the reviews it shows', async () => {
    const product = products.find((p) => reviewsOf(p.id).length > 0)!;
    const own = reviewsOf(product.id);
    const average = own.reduce((sum, r) => sum + r.rating, 0) / own.length;
    await renderProduct(product.slug);

    // Header and reviews section print the same summary, once each.
    expect(screen.getAllByText(`${average.toFixed(1)} · ${own.length}`)).toHaveLength(2);
    expect(screen.queryByText(`${product.rating.toFixed(1)} · ${product.reviewCount}`)).not.toBeInTheDocument();
  });

  it('shows no stars at all for a product nobody has reviewed', async () => {
    const product = products.find((p) => reviewsOf(p.id).length === 0)!;
    await renderProduct(product.slug);

    expect(screen.getByText(enDict.pdp.noReviews)).toBeInTheDocument();
    expect(screen.queryByText(/ · \d+$/)).not.toBeInTheDocument();
  });
});
