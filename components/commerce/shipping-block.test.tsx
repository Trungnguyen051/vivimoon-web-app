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
    render(<ShippingBlock quote={{ method: 'express', etaDays: 3, fee: 8 }} failed={false} currency="USD" locale="vi" dict={dict} />);
    const block = screen.getByRole('region', { name: dict.checkout.shipping.title });
    expect(block).toHaveTextContent('Giao hàng nhanh · 3 ngày');
    expect(block).toHaveTextContent('Dự kiến nhận 02/10');
    expect(block).toHaveTextContent(/8/);
  });

  it('reads "Miễn phí" for free shipping', () => {
    render(<ShippingBlock quote={{ method: 'standard', etaDays: 2, fee: 0 }} failed={false} currency="USD" locale="vi" dict={dict} />);
    expect(screen.getByText(dict.checkout.shipping.free)).toBeInTheDocument();
  });

  it('shows an unknown option id as-is, even one named like an object built-in', () => {
    render(<ShippingBlock quote={{ method: 'constructor', etaDays: 1, fee: 5 }} failed={false} currency="USD" locale="vi" dict={dict} />);
    expect(screen.getByRole('region')).toHaveTextContent('constructor · 1 ngày');
  });

  it('says "1 day", not "1 days", in English', () => {
    render(<ShippingBlock quote={{ method: 'express', etaDays: 1, fee: 5 }} failed={false} currency="USD" locale="en" dict={getDictionary('en')} />);
    expect(screen.getByRole('region')).toHaveTextContent('Express delivery · 1 day');
  });

  it('dates arrival on the Vietnam calendar, dd/mm in English too', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-09-29T20:00:00-05:00')); // already 30/09 in Vietnam
    render(<ShippingBlock quote={{ method: 'standard', etaDays: 2, fee: 3 }} failed={false} currency="USD" locale="en" dict={getDictionary('en')} />);
    expect(screen.getByRole('region')).toHaveTextContent('Estimated arrival 02/10');
  });

  it('says the quote failed rather than showing an old one', () => {
    render(<ShippingBlock quote={null} failed currency="USD" locale="vi" dict={dict} />);
    expect(screen.getByRole('region')).toHaveTextContent(dict.checkout.shipping.failed);
  });

  it('asks for the address until there is a quote', () => {
    render(<ShippingBlock quote={null} failed={false} currency="USD" locale="vi" dict={dict} />);
    expect(screen.getByRole('region')).toHaveTextContent(dict.checkout.shipping.pending);
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  });
});
