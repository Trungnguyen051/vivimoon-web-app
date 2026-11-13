import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PaymentMethodPicker } from './payment-method-picker';
import { paymentMethods } from '@/lib/payments/methods';
import { getDictionary } from '@/lib/i18n/dictionaries';

const dict = getDictionary('vi');

describe('PaymentMethodPicker', () => {
  it('offers QR transfer, COD and e-wallet as radio cards, and no SePay (ADR-0025)', () => {
    render(<PaymentMethodPicker value="qr" onChange={() => {}} dict={dict} />);
    expect(screen.getAllByRole('radio')).toHaveLength(3);
    expect(screen.getByRole('radio', { name: /Chuyển khoản \/ Quét mã QR/ })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Thanh toán khi nhận hàng \(COD\)/ })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Ví điện tử \(MoMo, ZaloPay, VNPay\)/ })).toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: /sepay/i })).not.toBeInTheDocument();
  });

  it('renders a fourth option when the config grows, with no component change', () => {
    const stub = [...paymentMethods, { type: 'momo' as unknown as (typeof paymentMethods)[number]['type'] }];
    render(<PaymentMethodPicker value="qr" onChange={() => {}} dict={dict} methods={stub} />);
    expect(screen.getAllByRole('radio')).toHaveLength(4);
  });

  it('emits the chosen method on select', async () => {
    const onChange = vi.fn();
    render(<PaymentMethodPicker value="qr" onChange={onChange} dict={dict} />);
    await userEvent.click(screen.getByRole('radio', { name: /COD/ }));
    expect(onChange).toHaveBeenCalledWith('cod');
  });

  it('checks the selected method', () => {
    render(<PaymentMethodPicker value="ewallet" onChange={() => {}} dict={dict} />);
    expect(screen.getByRole('radio', { name: /Ví điện tử/ })).toBeChecked();
    expect(screen.getByRole('radio', { name: /Quét mã QR/ })).not.toBeChecked();
  });

  it('labels a remembered method only when asked to', () => {
    const { rerender } = render(<PaymentMethodPicker value="cod" onChange={() => {}} dict={dict} />);
    expect(screen.queryByText('Đã chọn sẵn theo lần mua trước')).not.toBeInTheDocument();
    rerender(<PaymentMethodPicker value="cod" onChange={() => {}} dict={dict} remembered />);
    expect(screen.getByText('Đã chọn sẵn theo lần mua trước')).toBeInTheDocument();
  });
});
