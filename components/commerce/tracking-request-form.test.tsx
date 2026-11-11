import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { TrackingRequestForm } from './tracking-request-form';

const dict = getDictionary('en').tracking;

function ok(data: unknown) {
  return new Response(JSON.stringify({ ok: true, data }), {
    status: 200, headers: { 'content-type': 'application/json' },
  });
}

afterEach(() => { vi.unstubAllGlobals(); });

describe('TrackingRequestForm', () => {
  it('posts the order code with a phone-or-email identifier, not an email-only field', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      ok({ message: 'If that order exists, a tracking link has been sent to the email on file.' }),
    );
    vi.stubGlobal('fetch', fetchMock);
    render(<TrackingRequestForm dict={dict} />);

    await userEvent.type(screen.getByLabelText('Order code'), 'VVM-ABCD1234');
    await userEvent.type(screen.getByLabelText('Phone or email'), '0912345678');
    await userEvent.click(screen.getByRole('button', { name: 'Get tracking link' }));

    const [, init] = fetchMock.mock.calls[0];
    const body = JSON.parse(init.body as string);
    expect(body).toEqual({ code: 'VVM-ABCD1234', identifier: '0912345678' });
    expect(await screen.findByText(/tracking link has been sent/)).toBeInTheDocument();
  });

  it('shows the dev link only when the server sends one', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      ok({ message: 'ack', devLink: '/orders/track/trk-123' }),
    ));
    render(<TrackingRequestForm dict={dict} />);
    await userEvent.type(screen.getByLabelText('Order code'), 'VVM-ABCD1234');
    await userEvent.type(screen.getByLabelText('Phone or email'), 'guest@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Get tracking link' }));
    expect(await screen.findByText('/orders/track/trk-123')).toBeInTheDocument();
  });

  /**
   * Until #122 this branch did nothing at all: the button un-disabled and the page
   * said nothing, so a shopper could not tell whether the lookup had been sent. That
   * form now also sits on the Support hub — the page people reach *because* something
   * has already gone wrong.
   */
  it('says so when the request does not go through', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    render(<TrackingRequestForm dict={dict} />);

    await userEvent.type(screen.getByLabelText('Order code'), 'VVM-ABCD1234');
    await userEvent.type(screen.getByLabelText('Phone or email'), '0912345678');
    await userEvent.click(screen.getByRole('button', { name: 'Get tracking link' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(dict.error);
    // The envelope's own message is English-only, so it is never the thing shown (#64).
    expect(alert).not.toHaveTextContent('Something went wrong');
  });

  /** A retry clears the last failure, or the form reads as still broken. */
  it('clears a failure when the next attempt succeeds', async () => {
    const fetchMock = vi.fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(ok({ message: 'If that order exists, a tracking link has been sent.' }));
    vi.stubGlobal('fetch', fetchMock);
    render(<TrackingRequestForm dict={dict} />);

    await userEvent.type(screen.getByLabelText('Order code'), 'VVM-ABCD1234');
    await userEvent.type(screen.getByLabelText('Phone or email'), '0912345678');
    await userEvent.click(screen.getByRole('button', { name: 'Get tracking link' }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Get tracking link' }));

    expect(await screen.findByText(/tracking link has been sent/)).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
