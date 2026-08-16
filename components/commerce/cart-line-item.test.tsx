import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartLineItem } from './cart-line-item';
import { getDictionary } from '@/lib/i18n/dictionaries';
import type { CartLine } from '@/features/cart/cart.types';

const dict = getDictionary('en');
const line: CartLine = {
  productId: 'p1', variantId: 'v1', name: 'Aqua', sku: 'S1',
  packSize: '30 lenses', unitPrice: 25, currency: 'USD', quantity: 2,
};

describe('CartLineItem', () => {
  it('shows line total and fires remove', async () => {
    const onRemove = vi.fn();
    render(<CartLineItem line={line} locale="en" dict={dict} onQty={vi.fn()} onRemove={onRemove} />);
    expect(screen.getByText('$50.00')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: dict.cart.remove }));
    expect(onRemove).toHaveBeenCalledWith('v1');
  });
});
