import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { SignUpForm } from './sign-up-form';

const push = vi.fn();
let search = '';
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(search),
}));

const dict = getDictionary('en').auth;
const user = { id: 'u1', name: 'Mai', phone: '0912345678' };

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

async function submitForm() {
  await userEvent.type(screen.getByLabelText('Full name'), 'Mai');
  await userEvent.type(screen.getByLabelText('Phone'), '0912345678');
  await userEvent.type(screen.getByLabelText('Password'), 'vivimoon123');
  await userEvent.click(screen.getByRole('button', { name: 'Create account' }));
}

function typeCode(code: string) {
  [...code].forEach((c, i) => {
    fireEvent.change(screen.getByLabelText(`Digit ${i + 1}`), { target: { value: c } });
  });
}

beforeEach(() => { push.mockReset(); search = ''; });
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

describe('SignUpForm', () => {
  it('has exactly name, phone, password, submit, sign-in link, Google and Apple', () => {
    render(<SignUpForm locale="en" dict={dict} />);
    expect(screen.getAllByRole('textbox')).toHaveLength(2);
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.queryByLabelText(/confirm/i)).toBeNull();
    expect(screen.getByRole('link', { name: 'Sign in now' })).toHaveAttribute('href', '/en/sign-in');
    expect(screen.getAllByRole('button').map((b) => b.getAttribute('aria-label') ?? b.textContent)).toEqual([
      'Create account', dict.continueWithGoogle, dict.continueWithApple,
    ]);
  });

  it('registers, shows the OTP stage with the dev code, and starts no session or navigation', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ otpId: 'o1', expiresAt: 'x', devCode: '123456' }));
    vi.stubGlobal('fetch', fetchMock);
    render(<SignUpForm locale="en" dict={dict} />);
    await submitForm();

    expect(await screen.findByRole('heading', { name: 'OTP verification' })).toBeInTheDocument();
    expect(screen.getByText(/0912345678/)).toBeInTheDocument();
    expect(screen.getByText(/your code is 123456/)).toBeInTheDocument();
    expect(screen.getByText('Expires in 60s')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /skip/i })).toBeNull();
    expect(fetchMock.mock.calls[0][0]).toBe('/api/auth/register');
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ name: 'Mai', phone: '0912345678', password: 'vivimoon123' });
    expect(push).not.toHaveBeenCalled();
  });

  it('verifies the typed code and lands on account', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(ok({ otpId: 'o1', expiresAt: 'x' }))
      .mockResolvedValueOnce(ok({ kind: 'session', user }));
    vi.stubGlobal('fetch', fetchMock);
    render(<SignUpForm locale="en" dict={dict} />);
    await submitForm();
    await screen.findByText('Expires in 60s');
    typeCode('123456');
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => expect(push).toHaveBeenCalledWith('/en/account'));
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({ otpId: 'o1', code: '123456' });
  });

  it('respects ?next after verifying', async () => {
    search = 'next=/en/checkout';
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(ok({ otpId: 'o1', expiresAt: 'x' }))
      .mockResolvedValueOnce(ok({ kind: 'session', user })));
    render(<SignUpForm locale="en" dict={dict} />);
    await submitForm();
    await screen.findByText('Expires in 60s');
    typeCode('123456');
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(push).toHaveBeenCalledWith('/en/checkout'));
  });

  it('accepts a pasted code across the boxes', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(ok({ otpId: 'o1', expiresAt: 'x' })));
    render(<SignUpForm locale="en" dict={dict} />);
    await submitForm();
    await screen.findByText('Expires in 60s');
    fireEvent.paste(screen.getByLabelText('Digit 1'), { clipboardData: { getData: () => '654321' } });
    expect([1, 2, 3, 4, 5, 6].map((n) => (screen.getByLabelText(`Digit ${n}`) as HTMLInputElement).value).join('')).toBe('654321');
  });

  it('auto-advances on a digit and steps back on Backspace from an empty box', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(ok({ otpId: 'o1', expiresAt: 'x' })));
    render(<SignUpForm locale="en" dict={dict} />);
    await submitForm();
    await screen.findByText('Expires in 60s');
    fireEvent.change(screen.getByLabelText('Digit 1'), { target: { value: '7' } });
    expect(screen.getByLabelText('Digit 2')).toHaveFocus();
    fireEvent.keyDown(screen.getByLabelText('Digit 2'), { key: 'Backspace' });
    expect(screen.getByLabelText('Digit 1')).toHaveFocus();
  });

  it('stays on the OTP stage when the code is rejected', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(ok({ otpId: 'o1', expiresAt: 'x' }))
      .mockResolvedValueOnce(fail('unauthorized', 'That code is invalid or has expired', 401)));
    render(<SignUpForm locale="en" dict={dict} />);
    await submitForm();
    await screen.findByText('Expires in 60s');
    typeCode('000000');
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(await screen.findByText('That code is invalid or has expired')).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it('turns the countdown into Resend, which requests a new signup challenge', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(ok({ otpId: 'o1', expiresAt: 'x' }))
      .mockResolvedValueOnce(ok({ otpId: 'o2', expiresAt: 'y', devCode: '999999' }));
    vi.stubGlobal('fetch', fetchMock);
    render(<SignUpForm locale="en" dict={dict} />);
    await submitForm();
    await screen.findByText('Expires in 60s');
    expect(screen.queryByRole('button', { name: 'Resend code' })).toBeNull();

    await act(async () => { await vi.advanceTimersByTimeAsync(60_000); });
    fireEvent.click(await screen.findByRole('button', { name: 'Resend code' }));

    expect(await screen.findByText(/999999/)).toBeInTheDocument();
    expect(fetchMock.mock.calls[1][0]).toBe('/api/auth/register');
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual(JSON.parse(fetchMock.mock.calls[0][1].body));
    expect(screen.getByText('Expires in 60s')).toBeInTheDocument();
  });

  it('surfaces a server error on registration without leaving the form', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      fail('conflict', 'That phone or email is already registered', 409),
    ));
    render(<SignUpForm locale="en" dict={dict} />);
    await submitForm();
    expect(await screen.findByText('That phone or email is already registered')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'OTP verification' })).toBeNull();
  });

  it('shows a phone error and never calls the API for an invalid phone', async () => {
    vi.stubGlobal('fetch', vi.fn());
    render(<SignUpForm locale="en" dict={dict} />);
    await userEvent.type(screen.getByLabelText('Full name'), 'Mai');
    await userEvent.type(screen.getByLabelText('Phone'), '123');
    await userEvent.type(screen.getByLabelText('Password'), 'vivimoon123');
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));
    expect(await screen.findByText(dict.errors.phone)).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
