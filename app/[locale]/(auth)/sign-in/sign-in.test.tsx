import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { SignInForm } from './sign-in-form';

const push = vi.fn();
let search = '';
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(search),
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

beforeEach(() => { push.mockReset(); search = ''; });
afterEach(() => { vi.unstubAllGlobals(); });

describe('SignInForm', () => {
  it('shows a validation error for a malformed identifier', async () => {
    vi.stubGlobal('fetch', vi.fn());
    render(<SignInForm locale="en" dict={dict} />);
    await userEvent.type(screen.getByLabelText('Phone'), 'nonsense');
    await userEvent.type(screen.getByLabelText('Password'), 'whatever');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByText(dict.errors.identifier)).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('posts credentials and redirects on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok({ user: { id: 'u1', name: 'Mai', phone: '0912345678' } })));
    render(<SignInForm locale="en" dict={dict} />);
    await userEvent.type(screen.getByLabelText('Phone'), '0912345678');
    await userEvent.type(screen.getByLabelText('Password'), 'vivimoon123');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    await waitFor(() => expect(push).toHaveBeenCalledWith('/en/account'));
  });

  it('surfaces the server error message without clearing the form', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(fail('unauthorized', 'Invalid phone/email or password', 401)));
    render(<SignInForm locale="en" dict={dict} />);
    const id = screen.getByLabelText('Phone');
    await userEvent.type(id, '0912345678');
    await userEvent.type(screen.getByLabelText('Password'), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByText('Invalid phone/email or password')).toBeInTheDocument();
    expect(id).toHaveValue('0912345678');
    expect(push).not.toHaveBeenCalled();
  });

  it.each([['Google', '/api/auth/google'], ['Apple', '/api/auth/apple']])(
    'signs in with %s and follows ?next', async (name, path) => {
      search = 'next=/en/orders';
      const fetchMock = vi.fn().mockResolvedValue(ok({ user: { id: 'u1', name: 'Mai', phone: '' } }));
      vi.stubGlobal('fetch', fetchMock);
      render(<SignInForm locale="en" dict={dict} />);
      await userEvent.click(screen.getByRole('button', { name: `Continue with ${name}` }));
      await waitFor(() => expect(push).toHaveBeenCalledWith('/en/orders'));
      expect(fetchMock.mock.calls[0][0]).toBe(path);
    },
  );
});
