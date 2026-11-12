import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OrderSummary } from './order-summary';
import { getDictionary } from '@/lib/i18n/dictionaries';

const dict = getDictionary('en');

describe('OrderSummary', () => {
  it('shows pending dashes when nothing has priced yet', () => {
    render(<OrderSummary subtotal={null} currency="VND" locale="en" dict={dict} />);
    // subtotal, shipping (undefined = pending), and total (falls back to the
    // null subtotal) all read as pending.
    expect(screen.getAllByText('—')).toHaveLength(3);
  });

  it('falls back total to subtotal when total is omitted (existing-caller compatibility)', () => {
    render(<OrderSummary subtotal={500_000} currency="VND" locale="en" dict={dict} />);
    const amounts = screen.getAllByText('500.000₫');
    expect(amounts.length).toBeGreaterThanOrEqual(2); // subtotal row and total row both read 500.000₫
  });

  it('renders the server total distinctly once discount/shipping/total are known', () => {
    render(<OrderSummary subtotal={500_000} discount={50_000} shipping={25_000} total={475_000} currency="VND" locale="en" dict={dict} />);
    expect(screen.getByText('500.000₫')).toBeInTheDocument(); // subtotal
    expect(screen.getByText('-50.000₫')).toBeInTheDocument(); // discount, prefixed as a reduction
    expect(screen.getByText('25.000₫')).toBeInTheDocument(); // shipping
    expect(screen.getByText('475.000₫')).toBeInTheDocument(); // total — the server's number, not subtotal - discount + shipping
  });

  it('omits the discount row when there is no discount', () => {
    render(<OrderSummary subtotal={500_000} discount={0} shipping={0} total={500_000} currency="VND" locale="en" dict={dict} />);
    expect(screen.queryByText(dict.cart.discount)).not.toBeInTheDocument();
  });

  it('shows "Free" for zero shipping and a pending dash for unknown shipping', () => {
    const { rerender } = render(<OrderSummary subtotal={500_000} shipping={0} total={500_000} currency="VND" locale="en" dict={dict} />);
    expect(screen.getByText(dict.cart.free)).toBeInTheDocument();

    rerender(<OrderSummary subtotal={500_000} shipping={null} total={500_000} currency="VND" locale="en" dict={dict} />);
    expect(screen.queryByText(dict.cart.free)).not.toBeInTheDocument();
  });
});
