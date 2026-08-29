import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { AccountForm } from './account-form';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));

const user = { id: 'u-001', phone: '0912345678', email: 'mai@example.vn', name: 'Mai', createdAt: '2026-01-15T09:00:00.000Z' };

const dict = getDictionary('en').account;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

afterEach(() => { vi.unstubAllGlobals(); });

describe('AccountForm', () => {
  it('renders the phone as read-only with an explanation', () => {
    vi.stubGlobal('fetch', vi.fn());
    render(<AccountForm user={user} dict={dict} />);
    const phone = screen.getByLabelText('Phone');
    expect(phone).toHaveValue('0912345678');
    expect(phone).toHaveAttribute('readonly');
    expect(screen.getByText(dict.phoneLocked)).toBeInTheDocument();
  });

  it('saves changed fields and confirms', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json({ ok: true, data: { ...user, name: 'Mai Nguyễn' } }));
    vi.stubGlobal('fetch', fetchMock);
    render(<AccountForm user={user} dict={dict} />);

    const name = screen.getByLabelText('Full name');
    await userEvent.clear(name);
    await userEvent.type(name, 'Mai Nguyễn');
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText(dict.saved)).toBeInTheDocument();
    const [path, init] = fetchMock.mock.calls[0];
    expect(path).toBe('/api/account');
    expect(init.method).toBe('PATCH');
    expect(JSON.parse(init.body)).toEqual({ name: 'Mai Nguyễn', email: 'mai@example.vn' });
  });

  it('omits a blank password rather than sending an empty string', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json({ ok: true, data: user }));
    vi.stubGlobal('fetch', fetchMock);
    render(<AccountForm user={user} dict={dict} />);
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).not.toHaveProperty('password');
  });

  it('surfaces a server error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      json({ ok: false, error: { code: 'validation_failed', message: 'Enter a valid email address' } }, 400),
    ));
    render(<AccountForm user={user} dict={dict} />);
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument();
    expect(screen.queryByText(dict.saved)).not.toBeInTheDocument();
  });
});
