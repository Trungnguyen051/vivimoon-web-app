import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NewsletterSignup } from './newsletter-signup';
import { apiRequest } from '@/lib/api/client';
import { vi as viDict } from '@/lib/i18n/dictionaries/vi';

vi.mock('@/lib/api/client', () => ({ apiRequest: vi.fn() }));
const mockedApiRequest = vi.mocked(apiRequest);

const dict = viDict.newsletter;

function renderForm() {
  render(<NewsletterSignup dict={dict} />);
  return {
    email: screen.getByLabelText(dict.emailLabel),
    submit: () => screen.getByRole('button', { name: new RegExp(`${dict.submit}|${dict.pending}`) }),
  };
}

describe('NewsletterSignup', () => {
  beforeEach(() => mockedApiRequest.mockReset());

  it('starts idle: no confirmation, no error, a button ready to press', () => {
    const { submit } = renderForm();

    expect(submit()).toBeEnabled();
    expect(submit()).toHaveTextContent(dict.submit);
    // The live region is mounted from the start so a later announcement is reliable.
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('confirms a valid address and clears the field', async () => {
    mockedApiRequest.mockResolvedValue({ ok: true, data: { email: 'a@b.com' } });
    const { email, submit } = renderForm();

    await userEvent.type(email, 'a@b.com');
    await userEvent.click(submit());

    expect(await screen.findByRole('status')).toHaveTextContent(dict.success);
    expect(email).toHaveValue('');
    expect(mockedApiRequest).toHaveBeenCalledWith('/api/newsletter', { method: 'POST', body: { email: 'a@b.com' } });
  });

  /**
   * The envelope's own message is never shown. It is authored in English — by the
   * schema for a rejected address, by `apiRequest` for a request that never arrived —
   * so showing it would put English on the Vietnamese storefront, which is the
   * regression #64 exists to stop.
   */
  it('rejects an address in the shopper\'s language, and keeps what was typed', async () => {
    mockedApiRequest.mockResolvedValue({
      ok: false,
      error: { code: 'validation_failed', message: 'That does not look like an email address', field: 'email' },
    });
    const { email, submit } = renderForm();

    await userEvent.type(email, 'nope');
    await userEvent.click(submit());

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(dict.invalid);
    expect(alert).not.toHaveTextContent('That does not look like an email address');
    expect(email).toHaveValue('nope');
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  /** A request that never reached the route is a different line, also from the dictionary. */
  it('reports a failed request in the shopper\'s language too', async () => {
    mockedApiRequest.mockResolvedValue({
      ok: false, error: { code: 'internal', message: 'Something went wrong. Please try again.' },
    });
    const { email, submit } = renderForm();

    await userEvent.type(email, 'a@b.com');
    await userEvent.click(submit());

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(dict.error);
    expect(alert).not.toHaveTextContent('Something went wrong');
  });

  /**
   * The confirmation and the failure must never be on screen together. A success
   * leaves the field empty but the button live, so the next click posts nothing and is
   * rejected — and `done` left standing would render both alerts, disagreeing.
   */
  it('drops the confirmation when a later submit fails', async () => {
    mockedApiRequest.mockResolvedValueOnce({ ok: true, data: { email: 'a@b.com' } });
    const { email, submit } = renderForm();

    await userEvent.type(email, 'a@b.com');
    await userEvent.click(submit());
    expect(await screen.findByRole('status')).toHaveTextContent(dict.success);

    mockedApiRequest.mockResolvedValueOnce({
      ok: false, error: { code: 'validation_failed', message: 'Enter your email address', field: 'email' },
    });
    await userEvent.click(submit());

    expect(await screen.findByRole('alert')).toHaveTextContent(dict.invalid);
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  /**
   * The state that usually goes missing. A button that stays pressable while the
   * request is in flight is how a shopper subscribes three times.
   */
  it('shows pending and cannot be fired twice', async () => {
    let release: (value: { ok: true; data: { email: string } }) => void = () => {};
    mockedApiRequest.mockReturnValue(new Promise((resolve) => { release = resolve; }));
    const { email, submit } = renderForm();

    await userEvent.type(email, 'a@b.com');
    await userEvent.click(submit());

    expect(submit()).toBeDisabled();
    expect(submit()).toHaveTextContent(dict.pending);

    await userEvent.click(submit());
    expect(mockedApiRequest).toHaveBeenCalledTimes(1);

    release({ ok: true, data: { email: 'a@b.com' } });
    await waitFor(() => expect(submit()).toBeEnabled());
    expect(submit()).toHaveTextContent(dict.submit);
  });

  /** A retry has to clear the last failure, or the page reads as still broken. */
  it('clears a previous error when tried again', async () => {
    mockedApiRequest.mockResolvedValueOnce({ ok: false, error: { code: 'internal', message: 'x' } });
    const { email, submit } = renderForm();

    await userEvent.type(email, 'a@b.com');
    await userEvent.click(submit());
    expect(await screen.findByRole('alert')).toBeInTheDocument();

    mockedApiRequest.mockResolvedValueOnce({ ok: true, data: { email: 'a@b.com' } });
    await userEvent.click(submit());

    expect(await screen.findByRole('status')).toHaveTextContent(dict.success);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
