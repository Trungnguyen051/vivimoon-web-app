import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { OrderStatusTimeline } from './order-status-timeline';
import { getDictionary } from '@/lib/i18n/dictionaries';

const dict = getDictionary('vi');

/** Each step's label and whether it is drawn done. */
function steps() {
  return within(screen.getByRole('list')).getAllByRole('listitem').map((li) => ({
    label: li.textContent, done: li.dataset.done === 'true',
  }));
}

describe('OrderStatusTimeline — success page payment step (#206)', () => {
  it('a paid QR order has placed and paid done, the rest to come', () => {
    render(<OrderStatusTimeline status="placed" payment={{ method: 'qr', status: 'paid' }} dict={dict} />);
    expect(steps()).toEqual([
      { label: 'Đã đặt hàng', done: true },
      { label: 'Đã thanh toán', done: true },
      { label: 'Đang đóng gói', done: false },
      { label: 'Đang giao', done: false },
      { label: 'Đã nhận', done: false },
    ]);
  });

  it('COD reads "Thanh toán khi nhận" and stays open until delivery', () => {
    render(<OrderStatusTimeline status="placed" payment={{ method: 'cod', status: 'pending' }} dict={dict} />);
    expect(steps()[1]).toEqual({ label: 'Thanh toán khi nhận', done: false });
  });

  it('a COD order is paid once delivered', () => {
    render(<OrderStatusTimeline status="delivered" payment={{ method: 'cod', status: 'pending' }} dict={dict} />);
    expect(steps().every((s) => s.done)).toBe(true);
  });

  it('an e-wallet order awaiting its gateway shows payment still to come', () => {
    render(<OrderStatusTimeline status="placed" payment={{ method: 'ewallet', status: 'pending' }} dict={dict} />);
    expect(steps().slice(0, 2)).toEqual([
      { label: 'Đã đặt hàng', done: true },
      { label: 'Đã thanh toán', done: false },
    ]);
  });

  it('a paid e-wallet order has payment done', () => {
    render(<OrderStatusTimeline status="placed" payment={{ method: 'ewallet', status: 'paid' }} dict={dict} />);
    expect(steps()[1]).toEqual({ label: 'Đã thanh toán', done: true });
  });

  it('without payment it keeps the order-detail "Đã xác nhận" step', () => {
    render(<OrderStatusTimeline status="confirmed" dict={dict} />);
    expect(steps()[1]).toEqual({ label: 'Đã xác nhận', done: true });
  });
});
