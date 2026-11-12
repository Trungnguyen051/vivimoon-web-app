import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartLineItem } from './cart-line-item';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { lineKey } from '@/lib/cart/line-key';
import type { CartLine } from '@/features/cart/cart.types';
import type { RxInput } from '@/lib/api/schemas/rx';
import { accessories } from '@/content/mock';

const dict = getDictionary('en');
const line: CartLine = {
  lineKey: lineKey('v1'),
  productId: 'p1', variantId: 'v1', name: 'Aqua', sku: 'S1',
  unitPrice: 25, currency: 'USD', quantity: 2,
};
const rx: RxInput = { sameBothEyes: true, right: { sph: -2.5 }, left: { sph: -2.5 } };
const lineWithRx: CartLine = { ...line, lineKey: lineKey('v1', rx), rx: rx as CartLine['rx'] };

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

  it('renders the line summary when the line has a prescription, so two lines of the same variant are distinguishable', () => {
    render(<CartLineItem line={lineWithRx} locale="en" dict={dict} onQty={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getByText("1 pair · L −2.50 · R −2.50")).toBeInTheDocument();
  });

  it('renders no line summary for a line without a prescription', () => {
    render(<CartLineItem line={line} locale="en" dict={dict} onQty={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.queryByText(/1 (pair|lens)/)).not.toBeInTheDocument();
  });

  it('falls back to the SKU for a colorless line, so two same-named lines stay distinguishable', () => {
    render(<CartLineItem line={line} locale="en" dict={dict} onQty={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getByText(line.sku)).toBeInTheDocument();
  });

  it('shows color instead of SKU for a line that has one', () => {
    const coloredLine: CartLine = { ...line, color: 'Hazel Brown' };
    render(<CartLineItem line={coloredLine} locale="en" dict={dict} onQty={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getByText('Hazel Brown')).toBeInTheDocument();
    expect(screen.queryByText(line.sku)).not.toBeInTheDocument();
  });

  describe('an accessory line (Product Kind)', () => {
    const viDict = getDictionary('vi');
    const nuocNgam = accessories.find((a) => a.id === 'a-nuoc-ngam')!;
    const accessoryLine: CartLine = {
      lineKey: lineKey('a-nuoc-ngam-120'), productId: 'a-nuoc-ngam', variantId: 'a-nuoc-ngam-120',
      name: 'Nước ngâm lens', sku: 'NNL-120', variantLabel: '120ml', unitPrice: 4, currency: 'USD', quantity: 1,
    };

    it('shows its variant in the shared line-summary format, not its SKU', () => {
      render(<CartLineItem line={accessoryLine} accessory={nuocNgam} locale="vi" dict={viDict} onQty={vi.fn()} onRemove={vi.fn()} onVariant={vi.fn()} />);
      expect(screen.getByText('120ml · x1')).toBeInTheDocument();
      expect(screen.queryByText('NNL-120')).not.toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: viDict.cart.accessoryOptions.volume })).toHaveTextContent('Dung tích 120ml');
    });

    it('changes the variant from its picker, addressed by lineKey', async () => {
      const onVariant = vi.fn();
      render(<CartLineItem line={accessoryLine} accessory={nuocNgam} locale="vi" dict={viDict} onQty={vi.fn()} onRemove={vi.fn()} onVariant={onVariant} />);
      await userEvent.click(screen.getByRole('combobox', { name: viDict.cart.accessoryOptions.volume }));
      await userEvent.click(await screen.findByRole('option', { name: 'Dung tích 360ml' }));
      expect(onVariant).toHaveBeenCalledWith(accessoryLine.lineKey, nuocNgam.variants[1]);
    });

    it('names a single-variant accessory without a picker', () => {
      const drops = accessories.find((a) => a.id === 'a-nuoc-nho-mat')!;
      const line = { ...accessoryLine, productId: drops.id, variantId: drops.variants[0].id, variantLabel: '15ml' };
      render(<CartLineItem line={line} accessory={drops} locale="vi" dict={viDict} onQty={vi.fn()} onRemove={vi.fn()} onVariant={vi.fn()} />);
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
      expect(screen.getByText('Dung tích 15ml')).toBeInTheDocument();
    });
  });
});
