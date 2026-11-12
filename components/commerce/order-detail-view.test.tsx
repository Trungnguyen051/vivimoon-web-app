import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useCartStore } from '@/features/cart/cart-store';
import type { Order } from '@/lib/api/schemas/orders';
import type { OrderStatus } from '@/lib/orders/statuses';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { OrderDetailView } from './order-detail-view';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push, refresh: vi.fn() }) }));

const dict = getDictionary('vi');

beforeEach(() => {
  localStorage.clear();
  useCartStore.setState({ lines: [], hydrated: true });
  push.mockClear();
});

function order(overrides: Partial<Order> = {}): Order {
  return {
    id: 'o1', code: 'VVM-TEST0001', status: 'placed', placedAt: '2024-03-15T03:00:00.000Z',
    lines: [{ lineKey: 'l1', variantId: 'p-aqua-daily-30', quantity: 1, unitPrice: 125_000, lineTotal: 125_000, currency: 'VND' }],
    totals: { subtotal: 125_000, discount: 0, appliedVouchers: [], shipping: 0, total: 125_000, currency: 'VND' },
    address: {
      recipient: 'Nguyễn Thị Thu Hà', phone: '0909000000', line1: '123 Nguyễn Huệ',
      ward: 'Bến Nghé', district: 'Quận 1', province: 'TP.HCM', label: 'home',
    },
    payment: { method: 'qr', status: 'pending' },
    ...overrides,
  };
}

async function renderView(o: Order, signedIn = false) {
  render(await OrderDetailView({ order: o, locale: 'vi', dict, signedIn }));
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

describe('OrderDetailView products panel', () => {
  // p-aqua-daily-30 is "Aqua Daily" (content/mock/products.ts).
  const lines: Order['lines'] = [
    { lineKey: 'l1', variantId: 'p-aqua-daily-30', quantity: 2, unitPrice: 125_000, lineTotal: 250_000, currency: 'VND' },
    { lineKey: 'l2', variantId: 'p-mystic-daily-violet-30', quantity: 1, unitPrice: 90_000, compareAtUnitPrice: 120_000, lineTotal: 90_000, currency: 'VND' },
  ];
  const totals = { subtotal: 340_000, discount: 0, appliedVouchers: [], shipping: 15_000, total: 355_000, currency: 'VND' as const };

  it('lists each line with its thumbnail, name and quantity', async () => {
    await renderView(order({ lines, totals }));
    const panel = screen.getByRole('region', { name: dict.orderDetail.lineItems });
    const rows = within(panel).getAllByRole('listitem');
    expect(rows).toHaveLength(2);
    expect(rows[0].querySelector('img')).not.toBeNull(); // decorative: the name sits beside it
    expect(rows[0]).toHaveTextContent('Aqua Daily Clear');
    expect(rows[0]).toHaveTextContent('×2');
    expect(rows[1]).toHaveTextContent('×1');
  });

  it('strikes through the original price only on a line that captured one', async () => {
    await renderView(order({ lines, totals }));
    const panel = screen.getByRole('region', { name: dict.orderDetail.lineItems });
    const struck = panel.querySelectorAll('s');
    expect(struck).toHaveLength(1);
    expect(struck[0].textContent).toMatch(/120\.000/);
  });

  it('footers the item count (sum of quantities) and the order total', async () => {
    await renderView(order({ lines, totals }));
    const footer = screen.getByText(`${dict.orderDetail.totalLabel} (3 ${dict.orderDetail.items}):`);
    expect(footer.parentElement).toHaveTextContent(/355\.000/);
  });
});

describe('OrderDetailView delivery info', () => {
  const field = (label: string) => screen.getByText(label, { selector: 'dt' }).nextElementSibling;

  it('shows recipient, phone, address, shipping method and Carrier Tracking Code', async () => {
    await renderView(order({ status: 'shipped', shippingMethod: 'express', carrierTrackingCode: 'SPX2330404994944' }));
    const d = dict.orderDetail;
    expect(field(d.recipient)).toHaveTextContent('Nguyễn Thị Thu Hà');
    expect(field(d.phone)).toHaveTextContent('0909000000');
    expect(field(d.address)).toHaveTextContent('123 Nguyễn Huệ, Bến Nghé, Quận 1, TP.HCM');
    expect(field(d.shippingMethod)).toHaveTextContent('Giao hàng nhanh');
    expect(field(d.carrierTrackingCode)).toHaveTextContent('SPX2330404994944');
  });

  it('shows "—" for details the order does not have yet, and no payment method', async () => {
    await renderView(order());
    expect(field(dict.orderDetail.shippingMethod)).toHaveTextContent('—');
    expect(field(dict.orderDetail.carrierTrackingCode)).toHaveTextContent('—');
    expect(screen.queryByText('Thanh toán')).not.toBeInTheDocument(); // the wireframe drops payment method
  });
});

describe('OrderDetailView actions', () => {
  it('lets a guest buy again, with no account-only link', async () => {
    await renderView(order());
    expect(screen.queryByRole('link', { name: dict.orderDetail.backToOrders })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: dict.orders.buyAgain }));
    expect(useCartStore.getState().lines.map((l) => l.variantId)).toEqual(['p-aqua-daily-30']);
    expect(push).toHaveBeenCalledWith('/vi/cart');
  });

  it('adds a link back to order history for a signed-in member', async () => {
    await renderView(order(), true);
    expect(screen.getByRole('link', { name: dict.orderDetail.backToOrders })).toHaveAttribute('href', '/vi/account/orders');
    expect(screen.getByRole('button', { name: dict.orders.buyAgain })).toBeInTheDocument();
  });
});
