import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import type { Order } from '@/lib/api/schemas/orders';
import type { OrderStatus } from '@/lib/orders/statuses';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { OrderDetailView } from './order-detail-view';

const dict = getDictionary('vi');

function order(overrides: Partial<Order> = {}): Order {
  return {
    id: 'o1', code: 'VVM-TEST0001', status: 'placed', placedAt: '2024-03-15T03:00:00.000Z',
    lines: [{ lineKey: 'l1', variantId: 'p-aqua-daily-30', quantity: 1, unitPrice: 25, lineTotal: 25, currency: 'USD' }],
    totals: { subtotal: 25, discount: 0, appliedVouchers: [], shipping: 0, total: 25, currency: 'USD' },
    address: {
      recipient: 'Nguyễn Thị Thu Hà', phone: '0909000000', line1: '123 Nguyễn Huệ',
      ward: 'Bến Nghé', district: 'Quận 1', province: 'TP.HCM', label: 'home',
    },
    payment: { method: 'qr', status: 'pending' },
    ...overrides,
  };
}

async function renderView(o: Order) {
  render(await OrderDetailView({ order: o, locale: 'vi', dict }));
}

const currentStep = () => screen.getByRole('listitem', { current: 'step' });

describe('OrderDetailView header', () => {
  it('titles the order by its code with the date placed', async () => {
    await renderView(order());
    expect(screen.getByRole('heading', { name: `${dict.orderDetail.title} #VVM-TEST0001` })).toBeInTheDocument();
    expect(screen.getByText(`${dict.orderDetail.placedOn}: 15/03/2024`)).toBeInTheDocument();
  });

  it.each<[OrderStatus, string]>([
    ['delivered', 'success'],
    ['cancelled', 'destructive'],
    ['returned', 'destructive'],
    ['packed', 'neutral'],
  ])('badges a %s order with the %s tone and its status name', async (status, tone) => {
    await renderView(order({ status }));
    const badge = screen.getByText(dict.orders.statuses[status], { selector: '[data-tone]' });
    expect(badge).toHaveAttribute('data-tone', tone);
  });
});

describe('OrderDetailView stepper', () => {
  it.each<[OrderStatus, keyof typeof dict.orderDetail.steps]>([
    ['placed', 'placed'],
    ['confirmed', 'confirmed'],
    ['packed', 'packed'],
    ['shipped', 'shipping'],
    ['out_for_delivery', 'shipping'],
    ['delivered', 'delivered'],
  ])('puts a %s order on the "%s" step', async (status, step) => {
    await renderView(order({ status }));
    expect(currentStep()).toHaveTextContent(dict.orderDetail.steps[step]);
  });

  it('shows five steps, never claiming a COD order was paid', async () => {
    await renderView(order());
    const steps = within(screen.getByRole('list', { name: dict.orderDetail.status })).getAllByRole('listitem');
    expect(steps.map((s) => s.textContent)).toEqual(Object.values(dict.orderDetail.steps));
  });

  it('shows a cancelled order as an end state instead of the stepper', async () => {
    await renderView(order({ status: 'cancelled' }));
    expect(screen.queryByRole('list', { name: dict.orderDetail.status })).not.toBeInTheDocument();
    expect(screen.getAllByText(dict.orders.statuses.cancelled)).toHaveLength(2);
  });
});
