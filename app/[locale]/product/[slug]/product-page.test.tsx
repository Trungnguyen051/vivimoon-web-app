import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProductPage from './page';
import { products, reviews } from '@/content/mock';
import { en as enDict } from '@/lib/i18n/dictionaries/en';
import { fetchViaSelf } from '@/lib/api/server-fetch';
import type { Review } from '@/lib/types';
import { GET as getReviewsRoute } from '@/app/api/products/[slug]/reviews/route';

// The page reads Reviews through the route (ADR-0002); here the self-fetch lands on that route's handler.
vi.mock('@/lib/api/server-fetch', () => ({ fetchViaSelf: vi.fn() }));
vi.mock('@/lib/auth/cookie', () => ({ readSessionUserId: async () => null }));
const mockedFetchViaSelf = vi.mocked(fetchViaSelf);
beforeEach(() => {
  mockedFetchViaSelf.mockReset();
  mockedFetchViaSelf.mockImplementation(async (path) => {
    const slug = decodeURIComponent(path.match(/^\/api\/products\/([^/?]+)\/reviews$/)![1]);
    return getReviewsRoute(new Request(`http://x${path}`), { params: Promise.resolve({ slug }) });
  });
});

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

  it("shows the Reviews the route returns, so a member's approved Review reaches the list and the summary", async () => {
    // A Review written through a route handler lives in that module instance, not the page's: only the route knows it.
    const product = products.find((p) => reviewsOf(p.id).length > 0)!;
    const written: Review = {
      id: 'r-written', productId: product.id, author: 'Mai N.', rating: 1, body: 'Viết qua route, duyệt rồi, phải hiện trên trang.',
      createdAt: '2026-11-01T00:00:00.000Z', tags: [], media: [], marketplaceHelpfulCount: 0, helpfulVoteCount: 0,
      status: 'approved', source: 'vivimoon',
    };
    const all = [written, ...reviewsOf(product.id)];
    mockedFetchViaSelf.mockResolvedValue(Response.json({ ok: true, data: all }));
    await renderProduct(product.slug);

    expect(mockedFetchViaSelf).toHaveBeenCalledWith(`/api/products/${product.slug}/reviews`);
    expect(screen.getByText(written.body)).toBeInTheDocument();
    const average = all.reduce((sum, r) => sum + r.rating, 0) / all.length;
    expect(screen.getByText(`${average.toFixed(1)} · ${all.length}`)).toBeInTheDocument();
  });

  it('shows no stars at all for a product nobody has reviewed', async () => {
    const product = products.find((p) => reviewsOf(p.id).length === 0)!;
    await renderProduct(product.slug);

    expect(screen.getByText(enDict.pdp.noReviews)).toBeInTheDocument();
    expect(screen.queryByText(/ · \d+$/)).not.toBeInTheDocument();
  });
});
