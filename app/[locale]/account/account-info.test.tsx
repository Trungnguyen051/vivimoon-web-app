import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { useSessionStore } from '@/features/session/session-store';
import { AccountInfo } from './account-info';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push, refresh: vi.fn() }) }));

const user = {
  id: 'u-001', phone: '0912345678', email: 'mai@example.vn', name: 'Mai', createdAt: '2026-01-15T09:00:00.000Z',
  gender: 'female' as const, dob: '1995-03-07', defaultRx: { left: -1.5, right: 0 },
};
const dict = getDictionary('en').account;
const welcome = getDictionary('en').welcome;
const json = (body: unknown) => new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } });
const ui = (u: Parameters<typeof AccountInfo>[0]['user'] = user) => render(<AccountInfo user={u} locale="en" dict={dict} welcome={welcome} />);

afterEach(() => { vi.unstubAllGlobals(); push.mockClear(); });

describe('AccountInfo', () => {
  it('shows saved values and Default Rx as sph', () => {
    ui();
    expect(screen.getByText('07/03/1995')).toBeInTheDocument();
    expect(screen.getByText('−1.50')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('mai@example.vn')).toBeInTheDocument();
  });

  it('shows dashes and no email row when unset', () => {
    ui({ id: 'u', phone: '0912345678', name: 'Mai', createdAt: user.createdAt });
    expect(screen.getAllByText('—')).toHaveLength(4);
    expect(screen.queryByText(dict.email)).toBeNull();
  });

  it('saves personal info through PATCH and returns to read-only', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json({ ok: true, data: { ...user, name: 'Mai Nguyễn' } }));
    vi.stubGlobal('fetch', fetchMock);
    ui();
    await userEvent.click(screen.getByRole('button', { name: `${dict.edit} ${dict.personalInfo}` }));
    const name = screen.getByLabelText(dict.name);
    await userEvent.clear(name);
    await userEvent.type(name, 'Mai Nguyễn');
    await userEvent.click(screen.getByRole('button', { name: dict.save }));
    expect(await screen.findByText('Mai Nguyễn')).toBeInTheDocument();
    const [path, init] = fetchMock.mock.calls[0];
    expect(path).toBe('/api/account');
    expect(init.method).toBe('PATCH');
    expect(JSON.parse(init.body)).toMatchObject({ name: 'Mai Nguyễn', gender: 'female', dob: '1995-03-07', defaultRx: { left: -1.5, right: 0 } });
  });

  it('cancel discards edits', async () => {
    vi.stubGlobal('fetch', vi.fn());
    ui();
    await userEvent.click(screen.getByRole('button', { name: `${dict.edit} ${dict.accountInfo}` }));
    await userEvent.type(screen.getByLabelText(dict.email), 'x');
    await userEvent.click(screen.getByRole('button', { name: dict.cancel }));
    expect(screen.getByText('mai@example.vn')).toBeInTheDocument();
  });

  it('asks for the current password when the account has one', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json({ ok: true, data: user }));
    vi.stubGlobal('fetch', fetchMock);
    ui({ ...user, hasPassword: true });
    await userEvent.click(screen.getByRole('button', { name: dict.changePassword }));
    const dialog = screen.getByRole('dialog');
    await userEvent.type(within(dialog).getByLabelText(dict.newPassword), 'brandnew1');
    await userEvent.click(within(dialog).getByRole('button', { name: dict.save }));
    expect(await within(dialog).findByText(dict.errors.currentPassword)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
    await userEvent.type(within(dialog).getByLabelText(dict.currentPassword), 'vivimoon123');
    await userEvent.click(within(dialog).getByRole('button', { name: dict.save }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ password: 'brandnew1', currentPassword: 'vivimoon123' });
  });

  it('sets a first password with no current-password field for a Google-only account', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json({ ok: true, data: { ...user, hasPassword: true } }));
    vi.stubGlobal('fetch', fetchMock);
    ui({ ...user, hasPassword: false });
    await userEvent.click(screen.getByRole('button', { name: dict.changePassword }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).queryByLabelText(dict.currentPassword)).toBeNull();
    await userEvent.type(within(dialog).getByLabelText(dict.newPassword), 'brandnew1');
    await userEvent.click(within(dialog).getByRole('button', { name: dict.save }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ password: 'brandnew1' });
  });

  it('signs out: calls logout, clears the session, goes home', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json({ ok: true, data: { ok: true } }));
    vi.stubGlobal('fetch', fetchMock);
    useSessionStore.getState().setUser(user);
    ui();
    await userEvent.click(screen.getByRole('button', { name: dict.signOut }));
    await waitFor(() => expect(push).toHaveBeenCalledWith('/en'));
    expect(fetchMock.mock.calls[0][0]).toBe('/api/auth/logout');
    expect(useSessionStore.getState().user).toBeNull();
  });

  it('only calls DELETE after confirmation', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json({ ok: true, data: { ok: true } }));
    vi.stubGlobal('fetch', fetchMock);
    useSessionStore.getState().setUser(user);
    ui();
    await userEvent.click(screen.getByRole('button', { name: dict.deleteAccount }));
    expect(fetchMock).not.toHaveBeenCalled();
    const dialog = screen.getByRole('dialog');
    await userEvent.type(within(dialog).getByLabelText(dict.currentPassword), 'vivimoon123');
    await userEvent.click(within(dialog).getByRole('button', { name: dict.deleteAccount }));
    await waitFor(() => expect(push).toHaveBeenCalledWith('/en'));
    expect(fetchMock.mock.calls[0][1].method).toBe('DELETE');
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ currentPassword: 'vivimoon123' });
    expect(useSessionStore.getState().user).toBeNull();
  });
});
