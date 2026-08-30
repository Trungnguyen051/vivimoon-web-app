import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartLineItem } from './cart-line-item';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { lineKey } from '@/lib/cart/line-key';
import type { CartLine } from '@/features/cart/cart.types';

const dict = getDictionary('en');
const line: CartLine = {
  lineKey: lineKey('v1'),
  productId: 'p1', variantId: 'v1', name: 'Aqua', sku: 'S1',
  packSize: '30 lenses', unitPrice: 25, currency: 'USD', quantity: 2,
};

describe('CartLineItem', () => {
  it('renders the server-priced line total', () => {
    render(<CartLineItem line={line} locale="en" dict={dict} lineTotal={50} onQty={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getByText('$50.00')).toBeInTheDocument();
  });

  it('shows a pending placeholder before the server has priced the line', () => {
    // The client never multiplies unitPrice by quantity — money is server-owned.
    render(<CartLineItem line={line} locale="en" dict={dict} onQty={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.queryByText('$50.00')).not.toBeInTheDocument();
  });

  it('addresses the line by lineKey, not variantId', async () => {
    // Two lines can share a variantId and differ only by prescription.
    const onRemove = vi.fn();
    const onQty = vi.fn();
    render(<CartLineItem line={line} locale="en" dict={dict} onQty={onQty} onRemove={onRemove} />);
    await userEvent.click(screen.getByRole('button', { name: dict.cart.remove }));
    expect(onRemove).toHaveBeenCalledWith(line.lineKey);
    await userEvent.click(screen.getByRole('button', { name: dict.common.increaseQty }));
    expect(onQty).toHaveBeenCalledWith(line.lineKey, 3);
  });
});
