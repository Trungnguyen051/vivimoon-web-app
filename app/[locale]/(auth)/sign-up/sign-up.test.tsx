import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { SignUpForm } from './sign-up-form';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push, refresh: vi.fn() }) }));

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

async function fillBaseForm(password = 'vivimoon123', confirmPassword = password) {
  await userEvent.type(screen.getByLabelText('Full name'), 'Mai');
  await userEvent.type(screen.getByLabelText('Phone or email'), '0912345678');
  await userEvent.type(screen.getByLabelText('Password'), password);
  await userEvent.type(screen.getByLabelText('Confirm password'), confirmPassword);
}

beforeEach(() => { push.mockReset(); });
afterEach(() => { vi.unstubAllGlobals(); });

describe('SignUpForm', () => {
  it('shows a mismatch error and never calls the API when passwords differ', async () => {
    vi.stubGlobal('fetch', vi.fn());
    render(<SignUpForm locale="en" dict={dict} />);
    await fillBaseForm('vivimoon123', 'somethingelse');
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));
    expect(await screen.findByText(dict.errors.confirmPassword)).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('registers, then completing sign-up without OTP still lands on account', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      ok({ user: { id: 'u1', name: 'Mai', phone: '0912345678' } }),
    ));
    render(<SignUpForm locale="en" dict={dict} />);
    await fillBaseForm();
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByText(dict.verifyPrompt)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Skip for now' }));
    await waitFor(() => expect(push).toHaveBeenCalledWith('/en/account'));
  });

  it('registers, then completing OTP verification also lands on account', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(ok({ user: { id: 'u1', name: 'Mai', phone: '0912345678' } }))
      .mockResolvedValueOnce(ok({ otpId: 'o1', expiresAt: 'x', devCode: '123456' }))
      .mockResolvedValueOnce(ok({ kind: 'session', user: { id: 'u1', name: 'Mai', phone: '0912345678' } }));
    vi.stubGlobal('fetch', fetchMock);

    render(<SignUpForm locale="en" dict={dict} />);
    await fillBaseForm();
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));

    await userEvent.click(await screen.findByRole('button', { name: 'Verify now' }));
    const code = await screen.findByLabelText('Verification code');
    await userEvent.type(code, '123456');
    await userEvent.click(screen.getByRole('button', { name: 'Verify' }));

    await waitFor(() => expect(push).toHaveBeenCalledWith('/en/account'));
    expect(fetchMock.mock.calls[0][0]).toBe('/api/auth/register');
    expect(fetchMock.mock.calls[1][0]).toBe('/api/auth/otp/request');
    expect(fetchMock.mock.calls[2][0]).toBe('/api/auth/otp/verify');
  });

  it('stays on the code stage and never navigates when the OTP is rejected', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(ok({ user: { id: 'u1', name: 'Mai', phone: '0912345678' } }))
      .mockResolvedValueOnce(ok({ otpId: 'o1', expiresAt: 'x' }))
      .mockResolvedValueOnce(fail('unauthorized', 'That code is invalid or has expired', 401));
    vi.stubGlobal('fetch', fetchMock);

    render(<SignUpForm locale="en" dict={dict} />);
    await fillBaseForm();
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Verify now' }));
    await userEvent.type(await screen.findByLabelText('Verification code'), '000000');
    await userEvent.click(screen.getByRole('button', { name: 'Verify' }));

    expect(await screen.findByText('That code is invalid or has expired')).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it('a rapid double-click on Verify now fires only one otp/request', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(ok({ user: { id: 'u1', name: 'Mai', phone: '0912345678' } }))
      .mockResolvedValue(ok({ otpId: 'o1', expiresAt: 'x', devCode: '123456' }));
    vi.stubGlobal('fetch', fetchMock);
    render(<SignUpForm locale="en" dict={dict} />);
    await fillBaseForm();
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));

    const verifyNowButton = await screen.findByRole('button', { name: 'Verify now' });
    // Two clicks in the same synchronous tick (fireEvent, not userEvent) —
    // the ref guard, not just the `busy` state, must catch the second one
    // before any re-render commits the disabled attribute.
    fireEvent.click(verifyNowButton);
    fireEvent.click(verifyNowButton);

    await screen.findByLabelText('Verification code');
    expect(fetchMock).toHaveBeenCalledTimes(2); // register + a single otp/request
  });

  it('a rapid double-click on Verify fires only one otp/verify request', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(ok({ user: { id: 'u1', name: 'Mai', phone: '0912345678' } }))
      .mockResolvedValueOnce(ok({ otpId: 'o1', expiresAt: 'x', devCode: '123456' }))
      .mockResolvedValue(ok({ kind: 'session', user: { id: 'u1', name: 'Mai', phone: '0912345678' } }));
    vi.stubGlobal('fetch', fetchMock);
    render(<SignUpForm locale="en" dict={dict} />);
    await fillBaseForm();
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Verify now' }));
    await userEvent.type(await screen.findByLabelText('Verification code'), '123456');

    const verifyButton = screen.getByRole('button', { name: 'Verify' });
    fireEvent.click(verifyButton);
    fireEvent.click(verifyButton);

    await waitFor(() => expect(push).toHaveBeenCalledWith('/en/account'));
    expect(fetchMock).toHaveBeenCalledTimes(3); // register + otp/request + a single otp/verify
  });

  it('shows an error and stays on the prompt when otp/request fails, without navigating away', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(ok({ user: { id: 'u1', name: 'Mai', phone: '0912345678' } }))
      .mockResolvedValueOnce(fail('internal', 'Something went wrong. Please try again.', 500)));
    render(<SignUpForm locale="en" dict={dict} />);
    await fillBaseForm();
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Verify now' }));

    expect(await screen.findByText('Something went wrong. Please try again.')).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Verify now' })).toBeInTheDocument();
  });

  it('surfaces a server error on registration without leaving the form', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      fail('conflict', 'That phone or email is already registered', 409),
    ));
    render(<SignUpForm locale="en" dict={dict} />);
    await fillBaseForm();
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));
    expect(await screen.findByText('That phone or email is already registered')).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });
});
