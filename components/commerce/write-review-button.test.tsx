import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WriteReviewButton } from './write-review-button';
import { useSessionStore } from '@/features/session/session-store';
import { en } from '@/lib/i18n/dictionaries/en';

const push = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => '/en/product/hazel-monthly-colored',
}));

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

const ok = (data: unknown) => Promise.resolve(new Response(JSON.stringify({ ok: true, data })));
const unauthorized = () => Promise.resolve(new Response(JSON.stringify({ ok: false, error: { code: 'unauthorized', message: 'x' } }), { status: 401 }));
const fail = () => Promise.resolve(new Response(JSON.stringify({ ok: false, error: { code: 'internal', message: 'x' } }), { status: 500 }));

const LINE = { orderId: 'order-seed-11', orderCode: 'VVM-SEED0011', placedAt: '2026-08-12T03:40:00.000Z', lineKey: 'l1', variantLabel: 'Hazel Brown' };
const OTHER = { orderId: 'order-seed-12', orderCode: 'VVM-SEED0012', placedAt: '2026-09-21T11:05:00.000Z', lineKey: 'l1', variantLabel: 'Storm Gray' };
const t = en.reviewPicker;

const signIn = () => useSessionStore.getState().setUser({ id: 'u-001', name: 'Mai', phone: '0912345678' });
const renderButton = () => render(<WriteReviewButton productSlug="hazel-monthly-colored" locale="en" dict={en} />);
const click = () => userEvent.click(screen.getByRole('button', { name: en.reviews.write }));

beforeEach(() => {
  push.mockReset();
  fetchMock.mockReset();
  useSessionStore.setState({ user: null, status: 'anonymous' });
});

describe('WriteReviewButton', () => {
  it('sends a guest to sign-in and back, without asking for eligibility', async () => {
    renderButton();
    await click();
    expect(push).toHaveBeenCalledWith('/en/sign-in?next=%2Fen%2Fproduct%2Fhazel-monthly-colored');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sends a member whose session has lapsed to sign-in too', async () => {
    signIn();
    fetchMock.mockReturnValue(unauthorized());
    renderButton();
    await click();
    expect(push).toHaveBeenCalledWith('/en/sign-in?next=%2Fen%2Fproduct%2Fhazel-monthly-colored');
  });

  it('takes a member with one reviewable line straight to its form', async () => {
    signIn();
    fetchMock.mockReturnValue(ok([LINE]));
    renderButton();
    await click();
    expect(fetchMock).toHaveBeenCalledWith('/api/products/hazel-monthly-colored/reviews/eligibility', expect.anything());
    expect(push).toHaveBeenCalledWith('/en/account/orders/order-seed-11/review/l1');
  });

  it('lets a member with several lines pick the order, each with its date, code and variant', async () => {
    signIn();
    fetchMock.mockReturnValue(ok([OTHER, LINE]));
    renderButton();
    await click();
    expect(push).not.toHaveBeenCalled();

    const picker = screen.getByRole('dialog', { name: t.title });
    const options = within(picker).getAllByRole('link');
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveAttribute('href', '/en/account/orders/order-seed-12/review/l1');
    expect(options[0]).toHaveTextContent('VVM-SEED0012');
    expect(options[0]).toHaveTextContent('Storm Gray');
    expect(options[0]).toHaveTextContent('09/21/2026');
    expect(options[1]).toHaveAttribute('href', '/en/account/orders/order-seed-11/review/l1');
    expect(options[1]).toHaveTextContent('Hazel Brown');
  });

  it('tells a member with nothing to review that they need to buy and receive it, with a link to their orders', async () => {
    signIn();
    fetchMock.mockReturnValue(ok([]));
    renderButton();
    await click();
    expect(push).not.toHaveBeenCalled();
    await screen.findByText(t.notYet, { exact: false });
    expect(screen.getByRole('status')).toHaveTextContent(t.notYet);
    expect(screen.getByRole('link', { name: t.myOrders })).toHaveAttribute('href', '/en/account/orders');
  });

  it('says so when eligibility cannot be checked', async () => {
    signIn();
    fetchMock.mockReturnValue(fail());
    renderButton();
    await click();
    expect(await screen.findByText(t.failed)).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(t.failed);
    expect(push).not.toHaveBeenCalled();
  });
});
