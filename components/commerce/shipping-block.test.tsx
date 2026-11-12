import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { ShippingBlock } from './shipping-block';

const dict = getDictionary('vi');

afterEach(() => { vi.useRealTimers(); });

describe('ShippingBlock', () => {
  it('names the charged option with its days, arrival date and fee', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-09-29T10:00:00+07:00'));
    render(<ShippingBlock method="express" etaDays={3} fee={8} currency="USD" locale="vi" dict={dict} />);
    const block = screen.getByRole('region', { name: dict.checkout.shipping.title });
    expect(block).toHaveTextContent('Giao hàng nhanh · 3 ngày');
    expect(block).toHaveTextContent('Dự kiến nhận 02/10');
    expect(block).toHaveTextContent(/8/);
  });

  it('reads "Miễn phí" for free shipping', () => {
    render(<ShippingBlock method="standard" etaDays={2} fee={0} currency="USD" locale="vi" dict={dict} />);
    expect(screen.getByText(dict.checkout.shipping.free)).toBeInTheDocument();
  });

  it('shows an unknown option id as-is', () => {
    render(<ShippingBlock method="same_day" etaDays={1} fee={5} currency="USD" locale="vi" dict={dict} />);
    expect(screen.getByRole('region')).toHaveTextContent('same_day · 1 ngày');
  });

  it('asks for the address until there is a quote', () => {
    render(<ShippingBlock method={undefined} etaDays={undefined} fee={null} currency="USD" locale="vi" dict={dict} />);
    expect(screen.getByRole('region')).toHaveTextContent(dict.checkout.shipping.pending);
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  });
});
