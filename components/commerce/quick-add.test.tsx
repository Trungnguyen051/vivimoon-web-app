import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuickAdd } from './quick-add';
import { useCartStore } from '@/features/cart/cart-store';
import { useMiniCartStore } from '@/features/cart/mini-cart-store';
import { useBuyBoxStore } from '@/features/cart/buy-box-store';
import { getDictionary } from '@/lib/i18n/dictionaries';
import type { Product } from '@/lib/types';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

const dict = getDictionary('en');

const product: Product = {
  id: 'p1', slug: 'hazel', name: 'Hazel', brandId: 'v', brandName: 'Vivimoon',
  productLine: 'trongSuot', replacement: 'monthly', description: '', images: ['/a.jpg', '/b.jpg'], badges: [],
  specs: { material: '', waterContent: '', baseCurve: '', diameter: '', origin: '' },
  requiresRx: true,
  variants: [{ id: 'v1', sku: 'H-BR-10', price: 110_000, currency: 'VND', stock: 9 }],
  rating: 4.9, reviewCount: 3, soldCount: 3200,
};

const open = () => userEvent.click(screen.getByRole('button', { name: `${dict.common.addToCart} Hazel` }));
const dialog = () => screen.getByRole('dialog', { name: 'Hazel' });
const addInDialog = () => userEvent.click(screen.getByRole('button', { name: dict.common.addToCart }));

beforeEach(() => {
  localStorage.clear();
  useCartStore.setState({ lines: [], hydrated: false, buyNowLine: null });
  useMiniCartStore.setState({ open: false, added: [] });
  useBuyBoxStore.setState({ line: null });
});

describe('QuickAdd (#197)', () => {
  it('opens a labelled dialog with the buy box, the policy line and a link to the PDP', async () => {
    render(<QuickAdd product={product} locale="en" dict={dict} />);
    await open();
    expect(dialog()).toBeInTheDocument();
    expect(screen.getByRole('button', { name: dict.pdp.unitOptions.pair })).toBeInTheDocument();
    expect(screen.getByText(dict.returnPolicy.terms, { exact: false })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: dict.quickAdd.details })).toHaveAttribute('href', '/en/product/hazel');
    // Mua ngay belongs to the PDP only.
    expect(screen.queryByRole('button', { name: dict.common.buyNow })).not.toBeInTheDocument();
  });

  it('submits a single lens at the chosen power, opens the mini cart and closes', async () => {
    render(<QuickAdd product={product} locale="en" dict={dict} />);
    await open();
    await userEvent.selectOptions(screen.getByRole('combobox', { name: dict.rx.power }), '-2.5');
    await addInDialog();

    const lines = useCartStore.getState().lines;
    expect(lines).toEqual([
      expect.objectContaining({ variantId: 'v1', purchaseUnit: 'single', rx: { sph: -2.5 }, quantity: 1, unitPrice: 110_000 }),
    ]);
    expect(useMiniCartStore.getState()).toMatchObject({ open: true, added: lines });
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Hazel' })).not.toBeInTheDocument());
  });

  it('submits a pair with each eye and the quantity', async () => {
    render(<QuickAdd product={product} locale="en" dict={dict} />);
    await open();
    await userEvent.click(screen.getByRole('button', { name: dict.pdp.unitOptions.pair }));
    await userEvent.selectOptions(screen.getByLabelText(dict.rx.leftEye), '-2.5');
    await userEvent.selectOptions(screen.getByLabelText(dict.rx.rightEye), '-3');
    await userEvent.click(screen.getByRole('button', { name: dict.common.increaseQty }));
    await addInDialog();

    expect(useCartStore.getState().lines).toEqual([
      expect.objectContaining({
        variantId: 'v1', purchaseUnit: 'pair', rx: { sameBothEyes: false, left: { sph: -2.5 }, right: { sph: -3 } },
        quantity: 2, unitPrice: 220_000,
      }),
    ]);
  });

  it('leaves the PDP buy box line alone (it may sit in the related carousel)', async () => {
    render(<QuickAdd product={product} locale="en" dict={dict} />);
    await open();
    expect(useBuyBoxStore.getState().line).toBeNull();
  });

  it('renders as the centred dialog from md up and submits from there too', async () => {
    const matchMedia = window.matchMedia;
    window.matchMedia = (query: string) => ({ ...matchMedia(query), matches: true });
    try {
      render(<QuickAdd product={product} locale="en" dict={dict} />);
      await open();
      expect(dialog()).toHaveAttribute('data-slot', 'dialog-content');
      await addInDialog();
      expect(useCartStore.getState().lines).toEqual([expect.objectContaining({ purchaseUnit: 'single', rx: { sph: 0 } })]);
    } finally {
      window.matchMedia = matchMedia;
    }
  });

  it('is a bottom sheet below md', async () => {
    render(<QuickAdd product={product} locale="en" dict={dict} />);
    await open();
    expect(dialog()).toHaveAttribute('data-side', 'bottom');
  });

  it('closes on Escape and gives focus back to the card button', async () => {
    render(<QuickAdd product={product} locale="en" dict={dict} />);
    await open();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Hazel' })).not.toBeInTheDocument());
    expect(useCartStore.getState().lines).toEqual([]);
    await waitFor(() => expect(screen.getByRole('button', { name: `${dict.common.addToCart} Hazel` })).toHaveFocus());
  });
});
