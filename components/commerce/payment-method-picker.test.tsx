import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PaymentMethodPicker } from './payment-method-picker';
import { paymentMethods } from '@/lib/payments/methods';
import { getDictionary } from '@/lib/i18n/dictionaries';

const dict = getDictionary('en');

describe('PaymentMethodPicker', () => {
  it('renders exactly the three configured methods and no COD', () => {
    render(<PaymentMethodPicker value={undefined} onChange={() => {}} dict={dict} />);
    expect(screen.getAllByRole('button')).toHaveLength(3);
    expect(screen.getByRole('button', { name: 'QR Pay' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ZaloPay' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'SePay' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /cod|cash on delivery/i })).not.toBeInTheDocument();
  });

  it('renders a fourth option when the config grows, with no component change', () => {
    const stub = [
      ...paymentMethods,
      { type: 'momo' as unknown as (typeof paymentMethods)[number]['type'], label: 'Fourth Method' },
    ];
    render(<PaymentMethodPicker value={undefined} onChange={() => {}} dict={dict} methods={stub} />);
    expect(screen.getAllByRole('button')).toHaveLength(4);
    expect(screen.getByRole('button', { name: 'Fourth Method' })).toBeInTheDocument();
  });

  it('emits the chosen method id on click', async () => {
    const onChange = vi.fn();
    render(<PaymentMethodPicker value={undefined} onChange={onChange} dict={dict} />);
    await userEvent.click(screen.getByRole('button', { name: 'ZaloPay' }));
    expect(onChange).toHaveBeenCalledWith('zalopay');
  });

  it('marks the selected method pressed', () => {
    render(<PaymentMethodPicker value="sepay" onChange={() => {}} dict={dict} />);
    expect(screen.getByRole('button', { name: 'SePay' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'QR Pay' })).toHaveAttribute('aria-pressed', 'false');
  });
});
