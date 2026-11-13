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

// Only approved reviews are public; the seed also holds pending and rejected ones.
const reviewsOf = (productId: string) => reviews.filter((r) => r.productId === productId && r.status === 'approved');

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

    // The header and the reviews section's big average agree.
    expect(screen.getByText(`${average.toFixed(1)} · ${own.length}`)).toBeInTheDocument();
    expect(screen.getByText(average.toFixed(1))).toBeInTheDocument();
    expect(screen.queryByText(`${product.rating.toFixed(1)} · ${product.reviewCount}`)).not.toBeInTheDocument();
  });

  it('leaves pending and rejected reviews out of the list and the summary', async () => {
    const product = products.find((p) => reviews.some((r) => r.productId === p.id && r.status !== 'approved'))!;
    const hidden = reviews.filter((r) => r.productId === product.id && r.status !== 'approved');
    await renderProduct(product.slug);

    expect(screen.getByText(new RegExp(`^${reviewsOf(product.id).length} reviews · `))).toBeInTheDocument();
    for (const r of hidden) expect(screen.queryByText(r.body)).not.toBeInTheDocument();
  });

  it('shows no stars at all for a product nobody has reviewed', async () => {
    const product = products.find((p) => reviewsOf(p.id).length === 0)!;
    await renderProduct(product.slug);

    expect(screen.getByText(enDict.pdp.noReviews)).toBeInTheDocument();
    expect(screen.queryByText(/ · \d+$/)).not.toBeInTheDocument();
  });
});
