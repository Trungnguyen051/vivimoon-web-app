import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { ForgotPasswordForm } from './forgot-password-form';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push, refresh: vi.fn() }) }));

const dict = getDictionary('en').auth;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { 'content-type': 'application/json' },
  });
}

beforeEach(() => { push.mockReset(); });
afterEach(() => { vi.unstubAllGlobals(); });

describe('ForgotPasswordForm', () => {
  it('walks request -> verify -> reset and lands on sign-in', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(json({ ok: true, data: { otpId: 'o1', expiresAt: 'x', devCode: '123456' } }))
      .mockResolvedValueOnce(json({ ok: true, data: { kind: 'reset', resetToken: 'rt1' } }))
      .mockResolvedValueOnce(json({ ok: true, data: { user: { id: 'u1', name: 'Mai', phone: '0912345678' } } }));
    vi.stubGlobal('fetch', fetchMock);

    render(<ForgotPasswordForm locale="en" dict={dict} />);

    await userEvent.type(screen.getByLabelText('Phone or email'), '0912345678');
    await userEvent.click(screen.getByRole('button', { name: 'Send code' }));

    const code = await screen.findByLabelText('Verification code');
    await userEvent.type(code, '123456');
    await userEvent.click(screen.getByRole('button', { name: 'Verify' }));

    const password = await screen.findByLabelText('New password');
    await userEvent.type(password, 'brandnew1');
    await userEvent.click(screen.getByRole('button', { name: 'Update password' }));

    await waitFor(() => expect(push).toHaveBeenCalledWith('/en/account'));
    expect(fetchMock.mock.calls[0][0]).toBe('/api/auth/otp/request');
    expect(fetchMock.mock.calls[1][0]).toBe('/api/auth/otp/verify');
    expect(fetchMock.mock.calls[2][0]).toBe('/api/auth/password/reset');
  });

  it('shows the dev code only when the server sends one', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      json({ ok: true, data: { otpId: 'o1', expiresAt: 'x' } }),
    ));
    render(<ForgotPasswordForm locale="en" dict={dict} />);
    await userEvent.type(screen.getByLabelText('Phone or email'), '0912345678');
    await userEvent.click(screen.getByRole('button', { name: 'Send code' }));
    await screen.findByLabelText('Verification code');
    expect(screen.queryByText(/Development mode/)).not.toBeInTheDocument();
  });

  it('stays on the verify stage when the code is rejected', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(json({ ok: true, data: { otpId: 'o1', expiresAt: 'x' } }))
      .mockResolvedValueOnce(json({ ok: false, error: { code: 'unauthorized', message: 'That code is invalid or has expired' } }, 401)));

    render(<ForgotPasswordForm locale="en" dict={dict} />);
    await userEvent.type(screen.getByLabelText('Phone or email'), '0912345678');
    await userEvent.click(screen.getByRole('button', { name: 'Send code' }));
    await userEvent.type(await screen.findByLabelText('Verification code'), '000000');
    await userEvent.click(screen.getByRole('button', { name: 'Verify' }));

    expect(await screen.findByText('That code is invalid or has expired')).toBeInTheDocument();
    expect(screen.getByLabelText('Verification code')).toBeInTheDocument();
    expect(screen.queryByLabelText('New password')).not.toBeInTheDocument();
  });

  it('validates the identifier before calling the API', async () => {
    vi.stubGlobal('fetch', vi.fn());
    render(<ForgotPasswordForm locale="en" dict={dict} />);
    await userEvent.type(screen.getByLabelText('Phone or email'), 'nope');
    await userEvent.click(screen.getByRole('button', { name: 'Send code' }));
    expect(await screen.findByText(dict.errors.identifier)).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
