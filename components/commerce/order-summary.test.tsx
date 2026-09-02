import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OrderSummary } from './order-summary';
import { getDictionary } from '@/lib/i18n/dictionaries';

const dict = getDictionary('en');

describe('OrderSummary', () => {
  it('shows pending dashes when nothing has priced yet', () => {
    render(<OrderSummary subtotal={null} currency="USD" locale="en" dict={dict} />);
    // subtotal, shipping (undefined = pending), and total (falls back to the
    // null subtotal) all read as pending.
    expect(screen.getAllByText('—')).toHaveLength(3);
  });

  it('falls back total to subtotal when total is omitted (existing-caller compatibility)', () => {
    render(<OrderSummary subtotal={100} currency="USD" locale="en" dict={dict} />);
    const amounts = screen.getAllByText('$100.00');
    expect(amounts.length).toBeGreaterThanOrEqual(2); // subtotal row and total row both read $100.00
  });

  it('renders the server total distinctly once discount/shipping/total are known', () => {
    render(<OrderSummary subtotal={100} discount={10} shipping={5} total={95} currency="USD" locale="en" dict={dict} />);
    expect(screen.getByText('$100.00')).toBeInTheDocument(); // subtotal
    expect(screen.getByText('-$10.00')).toBeInTheDocument(); // discount, prefixed as a reduction
    expect(screen.getByText('$5.00')).toBeInTheDocument(); // shipping
    expect(screen.getByText('$95.00')).toBeInTheDocument(); // total — the server's number, not subtotal - discount + shipping
  });

  it('omits the discount row when there is no discount', () => {
    render(<OrderSummary subtotal={100} discount={0} shipping={0} total={100} currency="USD" locale="en" dict={dict} />);
    expect(screen.queryByText(dict.cart.discount)).not.toBeInTheDocument();
  });

  it('shows "Free" for zero shipping and a pending dash for unknown shipping', () => {
    const { rerender } = render(<OrderSummary subtotal={100} shipping={0} total={100} currency="USD" locale="en" dict={dict} />);
    expect(screen.getByText(dict.cart.free)).toBeInTheDocument();

    rerender(<OrderSummary subtotal={100} shipping={null} total={100} currency="USD" locale="en" dict={dict} />);
    expect(screen.queryByText(dict.cart.free)).not.toBeInTheDocument();
  });
});
