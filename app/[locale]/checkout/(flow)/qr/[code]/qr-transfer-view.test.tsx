import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QrTransferView, type QrLine } from './qr-transfer-view';
import { getDictionary } from '@/lib/i18n/dictionaries';
import type { PaymentOrder } from '@/lib/api/schemas/orders';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

const dict = getDictionary('en');
const PLACED = Date.parse('2026-11-13T10:00:00Z');

function order(overrides: Partial<PaymentOrder['payment']> = {}): PaymentOrder {
  return {
    id: 'o1', code: 'VVM-ABC123', status: 'placed', placedAt: new Date(PLACED).toISOString(),
    lines: [{ lineKey: 'l1', variantId: 'v1', quantity: 1, unitPrice: 578_000, lineTotal: 578_000, currency: 'VND' }],
    totals: { subtotal: 578_000, discount: 0, appliedVouchers: [], shipping: 0, total: 578_000, currency: 'VND' },
    address: {
      recipient: 'Nguyen Thu Ha', phone: '0912345678', line1: '1 Tran Duy Hung',
      ward: 'Trung Hoa', district: 'Cau Giay', province: 'Ha Noi', label: 'home',
    },
    payment: { method: 'qr', status: 'pending', intent: { id: 'pi-1', method: 'qr', status: 'pending', qrCode: 'vivimoon-qr:pi-1' }, ...overrides },
  };
}
const LINES: QrLine[] = [{ lineKey: 'l1', title: 'Sandkiss', summary: '1 đôi · L −2.50 · R −3.00', lineTotal: 578_000 }];

function renderAt(ms: number, o = order()) {
  vi.setSystemTime(PLACED + ms);
  return render(<QrTransferView order={o} lines={LINES} now={PLACED + ms} locale="en" dict={dict} />);
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

describe('QrTransferView', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    push.mockReset();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("counts down from the order's placed time, so a reload resumes it", () => {
    renderAt(8_000);
    expect(screen.getByRole('timer')).toHaveTextContent('14:52');
  });

  it('copies the account number, amount and reference, and announces it', async () => {
    renderAt(0);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Copy Amount' }));
    expect(await navigator.clipboard.readText()).toBe('578000');
    expect(screen.getByText('Amount copied')).toHaveAttribute('role', 'status');
    await user.click(screen.getByRole('button', { name: 'Copy Transfer reference' }));
    expect(await navigator.clipboard.readText()).toBe('VVM-ABC123');
    await user.click(screen.getByRole('button', { name: 'Copy Account number' }));
    expect(await navigator.clipboard.readText()).toBe('0011002345678');
  });

  it('"I\'ve made the transfer" confirms the payment and goes to success', async () => {
    const fetch = vi.fn(async () => json({ ok: true, data: order({ status: 'paid' }) }));
    vi.stubGlobal('fetch', fetch);
    renderAt(0);
    await userEvent.setup().click(screen.getByRole('button', { name: dict.qrPayment.paid }));
    expect(JSON.parse((fetch.mock.calls[0] as unknown as [string, RequestInit])[1].body as string)).toEqual({ code: 'VVM-ABC123', action: 'confirm' });
    await waitFor(() => expect(push).toHaveBeenCalledWith('/en/checkout/success'));
  });

  it('shows the expired state once the hold is up, without the QR or a confirm button', () => {
    renderAt(15 * 60_000);
    expect(screen.getByRole('alert')).toHaveTextContent(dict.qrPayment.expiredTitle);
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.queryByRole('button', { name: dict.qrPayment.paid })).toBeNull();
    expect(screen.getByText(dict.qrPayment.expired)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: dict.qrPayment.switchToCod })).toBeEnabled();
  });

  it('a new QR restarts the countdown', async () => {
    const renewedAt = new Date(PLACED + 20 * 60_000).toISOString();
    vi.stubGlobal('fetch', vi.fn(async () => json({ ok: true, data: order({ renewedAt }) })));
    renderAt(20 * 60_000, order({ status: 'expired' }));
    await userEvent.setup().click(screen.getByRole('button', { name: dict.qrPayment.newQr }));
    expect(await screen.findByRole('timer')).toHaveTextContent('15:00');
    expect(push).not.toHaveBeenCalled();
  });

  it('says so when an action fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => json({ ok: false, error: { code: 'conflict', message: 'x' } }, 409)));
    renderAt(0);
    await userEvent.setup().click(screen.getByRole('button', { name: dict.qrPayment.switchToCod }));
    expect(await screen.findByRole('alert')).toHaveTextContent(dict.qrPayment.failed);
    expect(push).not.toHaveBeenCalled();
  });
});
