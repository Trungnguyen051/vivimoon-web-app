import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReviewsList } from './reviews-list';
import { en } from '@/lib/i18n/dictionaries/en';
import { reviewSchema } from '@/lib/api/schemas/catalog';
import { useSessionStore } from '@/features/session/session-store';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => '/en/product/hazel' }));
const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);
beforeEach(() => {
  fetchMock.mockReset();
  useSessionStore.setState({ user: null, status: 'anonymous' });
});

const base = { productId: 'p1', title: 't', createdAt: '2026-08-01' };
const reviews = [
  reviewSchema.parse({
    ...base, id: 'r1', author: 'Mai', rating: 5, body: 'Comfortable all day.',
    source: 'shopee', sourceUrl: 'https://shopee.vn/item/123',
    variantLabel: 'Sandkiss 1 month', tags: ['allDay', 'myopic'], marketplaceHelpfulCount: 20, helpfulVoteCount: 4,
    media: [{ type: 'image', url: '/a.jpg' }, { type: 'video', url: 'https://tiktok.com/v/1' }],
    subRatings: { comfort: 5, colorMatch: 4, easeOfWear: 5 },
  }),
  reviewSchema.parse({
    ...base, id: 'r2', author: 'An', rating: 4, body: 'Would buy again.', tags: ['sensitiveEyes'],
    subRatings: { comfort: 4, colorMatch: 4, easeOfWear: 4 },
  }),
  reviewSchema.parse({ ...base, id: 'r3', author: 'Lan', rating: 5, body: 'Lovely.', tags: ['beginner'] }),
  reviewSchema.parse({ ...base, id: 'r4', author: 'Hoa', rating: 1, body: 'Not for me.' }),
];

const renderList = (list = reviews) => render(<ReviewsList reviews={list} locale="en" dict={en} productSlug="hazel" />);
const authors = () => screen.getAllByRole('article').map((a) => within(a).getByRole('heading').textContent);

describe('ReviewsList', () => {
  it('shows the empty state when there are no reviews, still offering "Write a review"', () => {
    renderList([]);
    expect(screen.getByText(en.pdp.noReviews)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: en.reviews.write })).toBeInTheDocument();
  });

  it('badges a Review written on Vivimoon as a verified purchase, and a Mirrored one not', () => {
    renderList();
    const [mirrored, written] = screen.getAllByRole('article');
    expect(within(mirrored).queryByText(en.writeReview.verifiedPurchase)).toBeNull();
    expect(within(written).getByText(en.writeReview.verifiedPurchase)).toBeInTheDocument();
  });

  it('summarises count, media share, average and the 5→1 histogram', () => {
    renderList();
    expect(screen.getByText('4 reviews · 25% with real photos')).toBeInTheDocument();
    expect(screen.getByText('3.8')).toBeInTheDocument();
    const rows = screen.getAllByTestId('histogram-row').map((r) => r.textContent);
    expect(rows).toEqual(['5★50%', '4★25%', '3★0%', '2★0%', '1★25%']);
  });

  it('averages the sub-ratings', () => {
    renderList();
    expect(screen.getByText(en.reviews.subRatings.comfort).nextSibling).toHaveTextContent('4.5 / 5');
    expect(screen.getByText(en.reviews.subRatings.colorMatch).nextSibling).toHaveTextContent('4.0 / 5');
  });

  it('filters the list by tab, and the media tab counts what it shows', async () => {
    renderList();
    expect(authors()).toEqual(['Mai', 'An', 'Lan', 'Hoa']);

    await userEvent.click(screen.getByRole('button', { name: 'Photos/videos (1)' }));
    expect(authors()).toEqual(['Mai']);

    await userEvent.click(screen.getByRole('button', { name: en.reviews.tags.sensitiveEyes }));
    expect(authors()).toEqual(['An']);
    expect(screen.getByRole('button', { name: en.reviews.tags.sensitiveEyes })).toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(screen.getByRole('button', { name: en.reviews.tags.allDay }));
    expect(authors()).toEqual(['Mai']);

    await userEvent.click(screen.getByRole('button', { name: en.reviews.all }));
    expect(authors()).toHaveLength(4);
  });

  it('shows a review’s variant, wearer tags, photos, video and helpful count', () => {
    renderList();
    const card = screen.getAllByRole('article')[0];
    expect(within(card).getByText('· Bought Sandkiss 1 month')).toBeInTheDocument();
    expect(within(card).getByText('All-day wear · Short-sighted')).toBeInTheDocument();
    expect(within(card).getByRole('link', { name: 'Review photo 1' })).toHaveAttribute('href', '/a.jpg');
    expect(within(card).getByRole('link', { name: en.reviews.video })).toHaveAttribute('href', 'https://tiktok.com/v/1');
    expect(within(card).getByText('Helpful (24)')).toBeInTheDocument();
  });

  it('shows a review without a title as just its body', () => {
    renderList([reviewSchema.parse({ ...base, title: undefined, id: 'r9', author: 'Vy', rating: 5, body: 'No title here.' })]);
    expect(within(screen.getByRole('article')).getByText('No title here.').textContent).toBe('No title here.');
  });

  it('renders a source badge per review, linked when sourceUrl is present', () => {
    renderList();
    expect(screen.getByRole('link', { name: en.pdp.reviewSource.shopee })).toHaveAttribute('href', 'https://shopee.vn/item/123');
    expect(screen.getAllByText(en.pdp.reviewSource.vivimoon)).toHaveLength(3);
  });

  it('shows the first reviews and reveals the rest from "See all"', async () => {
    const many = Array.from({ length: 6 }, (_, i) => reviewSchema.parse({ ...base, id: `m${i}`, author: `A${i}`, rating: 5, body: 'b' }));
    renderList(many);
    expect(screen.getAllByRole('article')).toHaveLength(4);
    await userEvent.click(screen.getByRole('button', { name: 'See all 6 reviews' }));
    expect(screen.getAllByRole('article')).toHaveLength(6);
    expect(screen.queryByRole('button', { name: 'See all 6 reviews' })).not.toBeInTheDocument();
  });

  it('reads a signed-in member’s votes and own Review, so theirs has no "Helpful" button', async () => {
    useSessionStore.setState({ user: { id: 'u-001', name: 'Mai', phone: '0912345678' }, status: 'authenticated' });
    fetchMock.mockResolvedValue(new Response(JSON.stringify({
      ok: true,
      data: [{ ...reviews[0], isOwn: true, hasVoted: false }, { ...reviews[1], isOwn: false, hasVoted: true, helpfulVoteCount: 1 }],
    })));
    renderList();
    const [mine, voted] = screen.getAllByRole('article');
    await vi.waitFor(() => expect(within(mine).queryByRole('button', { name: /Helpful/ })).not.toBeInTheDocument());
    expect(within(mine).getByText('Helpful (24)')).toBeInTheDocument();
    expect(within(voted).getByRole('button', { name: 'Helpful (1)' })).toHaveAttribute('aria-pressed', 'true');
    expect(fetchMock).toHaveBeenCalledWith('/api/products/hazel/reviews', expect.anything());
  });
});
