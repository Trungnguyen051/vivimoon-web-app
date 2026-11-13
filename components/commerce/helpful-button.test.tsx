import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HelpfulButton } from './helpful-button';
import { useSessionStore } from '@/features/session/session-store';
import { en } from '@/lib/i18n/dictionaries/en';

const push = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => '/en/product/hazel',
}));

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

const ok = (data: unknown) => Promise.resolve(new Response(JSON.stringify({ ok: true, data })));
const fail = () => Promise.resolve(new Response(JSON.stringify({ ok: false, error: { code: 'internal', message: 'x' } }), { status: 500 }));

const signIn = () => useSessionStore.getState().setUser({ id: 'u-002', name: 'Linh', phone: '0987654321' });
const renderButton = (props: Partial<Parameters<typeof HelpfulButton>[0]> = {}) =>
  render(<HelpfulButton reviewId="r4" marketplaceCount={11} voteCount={2} hasVoted={false} locale="en" dict={en.reviews} {...props} />);
const button = () => screen.getByRole('button', { name: /Helpful/ });

beforeEach(() => {
  push.mockReset();
  fetchMock.mockReset();
  useSessionStore.setState({ user: null, status: 'anonymous' });
});

describe('HelpfulButton', () => {
  it('shows the marketplace count plus votes', () => {
    renderButton();
    expect(button()).toHaveTextContent('Helpful (13)');
    expect(button()).toHaveAttribute('aria-pressed', 'false');
  });

  it('sends a guest to sign-in and back, without voting', async () => {
    renderButton();
    await userEvent.click(button());
    expect(push).toHaveBeenCalledWith('/en/sign-in?next=%2Fen%2Fproduct%2Fhazel');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('votes at once, before the request settles, and keeps it when it succeeds', async () => {
    signIn();
    let settle!: (r: Response) => void;
    fetchMock.mockReturnValue(new Promise<Response>((r) => { settle = r; }));
    renderButton();
    await userEvent.click(button());
    expect(button()).toHaveAttribute('aria-pressed', 'true');
    expect(button()).toHaveTextContent('Helpful (14)');
    expect(fetchMock).toHaveBeenCalledWith('/api/reviews/r4/helpful', expect.objectContaining({ method: 'POST' }));

    settle(await ok({ hasVoted: true, helpfulVoteCount: 3 }));
    await vi.waitFor(() => expect(button()).not.toHaveAttribute('aria-busy', 'true'));
    expect(button()).toHaveAttribute('aria-pressed', 'true');
    expect(button()).toHaveTextContent('Helpful (14)');
  });

  it('takes a vote back with a second tap', async () => {
    signIn();
    fetchMock.mockReturnValue(ok({ hasVoted: false, helpfulVoteCount: 1 }));
    renderButton({ hasVoted: true });
    expect(button()).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(button());
    expect(fetchMock).toHaveBeenCalledWith('/api/reviews/r4/helpful', expect.objectContaining({ method: 'DELETE' }));
    expect(button()).toHaveAttribute('aria-pressed', 'false');
    expect(button()).toHaveTextContent('Helpful (12)');
  });

  it('sends a member whose session has lapsed to sign-in, rolling the vote back', async () => {
    signIn();
    fetchMock.mockReturnValue(Promise.resolve(new Response(JSON.stringify({ ok: false, error: { code: 'unauthorized', message: 'x' } }), { status: 401 })));
    renderButton();
    await userEvent.click(button());
    await vi.waitFor(() => expect(push).toHaveBeenCalledWith('/en/sign-in?next=%2Fen%2Fproduct%2Fhazel'));
    expect(button()).toHaveAttribute('aria-pressed', 'false');
  });

  it('drops a vote cast by someone who has since signed out', async () => {
    signIn();
    fetchMock.mockReturnValue(ok({ hasVoted: true, helpfulVoteCount: 3 }));
    renderButton();
    await userEvent.click(button());
    await vi.waitFor(() => expect(button()).toHaveTextContent('Helpful (14)'));
    act(() => useSessionStore.getState().clear());
    expect(button()).toHaveAttribute('aria-pressed', 'false');
    expect(button()).toHaveTextContent('Helpful (13)');
  });

  it('rolls back and says so when the request fails', async () => {
    signIn();
    fetchMock.mockReturnValue(fail());
    renderButton();
    await userEvent.click(button());
    expect(await screen.findByText(en.reviews.helpfulFailed)).toHaveAttribute('role', 'status');
    expect(button()).toHaveAttribute('aria-pressed', 'false');
    expect(button()).toHaveTextContent('Helpful (13)');
  });

  it('is not a button on your own Review, but still shows the count', () => {
    renderButton({ isOwn: true });
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText('Helpful (13)')).toBeInTheDocument();
  });
});
