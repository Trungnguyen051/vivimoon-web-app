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
});
