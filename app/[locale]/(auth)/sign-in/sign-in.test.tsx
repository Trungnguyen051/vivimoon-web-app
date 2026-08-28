import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { SignInForm } from './sign-in-form';

const push = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(''),
}));

// The real dictionary, not a stub: a partial literal would not satisfy
// Dictionary['auth'], and using the real copy catches drift between the
// dictionary and what the form renders.
const dict = getDictionary('en').auth;

function ok(data: unknown) {
  return new Response(JSON.stringify({ ok: true, data }), {
    status: 200, headers: { 'content-type': 'application/json' },
  });
}
function fail(code: string, message: string, status: number) {
  return new Response(JSON.stringify({ ok: false, error: { code, message } }), {
    status, headers: { 'content-type': 'application/json' },
  });
}

beforeEach(() => { push.mockReset(); });
afterEach(() => { vi.unstubAllGlobals(); });

describe('SignInForm', () => {
  it('shows a validation error for a malformed identifier', async () => {
    vi.stubGlobal('fetch', vi.fn());
    render(<SignInForm locale="en" dict={dict} />);
    await userEvent.type(screen.getByLabelText('Phone or email'), 'nonsense');
    await userEvent.type(screen.getByLabelText('Password'), 'whatever');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByText(dict.errors.identifier)).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('posts credentials and redirects on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok({ user: { id: 'u1', name: 'Mai', phone: '0912345678' } })));
    render(<SignInForm locale="en" dict={dict} />);
    await userEvent.type(screen.getByLabelText('Phone or email'), '0912345678');
    await userEvent.type(screen.getByLabelText('Password'), 'vivimoon123');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    await waitFor(() => expect(push).toHaveBeenCalledWith('/en/account'));
  });

  it('surfaces the server error message without clearing the form', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(fail('unauthorized', 'Invalid phone/email or password', 401)));
    render(<SignInForm locale="en" dict={dict} />);
    const id = screen.getByLabelText('Phone or email');
    await userEvent.type(id, '0912345678');
    await userEvent.type(screen.getByLabelText('Password'), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByText('Invalid phone/email or password')).toBeInTheDocument();
    expect(id).toHaveValue('0912345678');
    expect(push).not.toHaveBeenCalled();
  });
});
