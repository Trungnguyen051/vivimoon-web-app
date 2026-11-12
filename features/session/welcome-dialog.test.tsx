import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { useSessionStore } from './session-store';
import { WelcomeDialog } from './welcome-dialog';

const dict = getDictionary('en').welcome;
const base = { id: 'u-001', name: 'Mai', phone: '0912345678' };

function json(body: unknown) {
  return new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } });
}

afterEach(() => { vi.unstubAllGlobals(); });
beforeEach(() => { useSessionStore.getState().clear(); });

describe('WelcomeDialog', () => {
  it('shows for a signed-in user without onboardedAt', () => {
    useSessionStore.getState().setUser(base);
    render(<WelcomeDialog dict={dict} />);
    expect(screen.getByText(dict.title)).toBeInTheDocument();
  });

  it('does not show for an onboarded or signed-out user', () => {
    useSessionStore.getState().setUser({ ...base, onboardedAt: '2026-01-01T00:00:00.000Z' });
    render(<WelcomeDialog dict={dict} />);
    expect(screen.queryByText(dict.title)).not.toBeInTheDocument();
  });

  it('Done saves the entered values and closes', async () => {
    const fetchMock = vi.fn().mockImplementation(async (_p, init) => json({ ok: true, data: { ...base, ...JSON.parse(init.body) } }));
    vi.stubGlobal('fetch', fetchMock);
    useSessionStore.getState().setUser(base);
    render(<WelcomeDialog dict={dict} />);

    await userEvent.type(screen.getByLabelText(dict.dob), '1995-05-20');
    await userEvent.click(screen.getByLabelText(dict.female));
    await userEvent.click(screen.getByRole('button', { name: `${dict.decrease} ${dict.leftEye}` }));
    await userEvent.click(screen.getByRole('button', { name: `${dict.decrease} ${dict.leftEye}` }));
    await userEvent.click(screen.getByRole('button', { name: `${dict.decrease} ${dict.rightEye}` }));
    await userEvent.click(screen.getByRole('button', { name: dict.done }));

    await waitFor(() => expect(screen.queryByText(dict.title)).not.toBeInTheDocument());
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body).toMatchObject({ dob: '1995-05-20', gender: 'female', defaultRx: { left: -0.5, right: -0.25 } });
    expect(body.onboardedAt).toBeTruthy();
  });

  it('the plus stepper is disabled at 0', () => {
    useSessionStore.getState().setUser(base);
    render(<WelcomeDialog dict={dict} />);
    expect(screen.getByRole('button', { name: `${dict.increase} ${dict.leftEye}` })).toBeDisabled();
  });

  it('Done without touching a stepper does not send defaultRx', async () => {
    const fetchMock = vi.fn().mockImplementation(async (_p, init) => json({ ok: true, data: { ...base, ...JSON.parse(init.body) } }));
    vi.stubGlobal('fetch', fetchMock);
    useSessionStore.getState().setUser(base);
    render(<WelcomeDialog dict={dict} />);
    await userEvent.click(screen.getByRole('button', { name: dict.done }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).not.toHaveProperty('defaultRx');
  });

  it('steps 0.25 down to -6.00, jumps to -6.50, and stops at -10.00', async () => {
    useSessionStore.getState().setUser(base);
    render(<WelcomeDialog dict={dict} />);
    const minus = screen.getByRole('button', { name: `${dict.decrease} ${dict.leftEye}` });
    for (let i = 0; i < 24; i++) await userEvent.click(minus);
    expect(screen.getByLabelText(dict.leftEye)).toHaveTextContent('-6.00');
    await userEvent.click(minus);
    expect(screen.getByLabelText(dict.leftEye)).toHaveTextContent('-6.50');
    for (let i = 0; i < 7; i++) await userEvent.click(minus);
    expect(screen.getByLabelText(dict.leftEye)).toHaveTextContent('-10.00');
    expect(minus).toBeDisabled();
  });

  it('Skip saves only onboardedAt', async () => {
    const fetchMock = vi.fn().mockImplementation(async (_p, init) => json({ ok: true, data: { ...base, ...JSON.parse(init.body) } }));
    vi.stubGlobal('fetch', fetchMock);
    useSessionStore.getState().setUser(base);
    render(<WelcomeDialog dict={dict} />);
    await userEvent.click(screen.getByRole('button', { name: dict.skip }));
    await waitFor(() => expect(screen.queryByText(dict.title)).not.toBeInTheDocument());
    expect(Object.keys(JSON.parse(fetchMock.mock.calls[0][1].body))).toEqual(['onboardedAt']);
  });
});
