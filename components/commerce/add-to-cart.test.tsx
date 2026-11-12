import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddToCart } from './add-to-cart';
import { useCartStore } from '@/features/cart/cart-store';
import { useMiniCartStore } from '@/features/cart/mini-cart-store';
import { getDictionary } from '@/lib/i18n/dictionaries';
import type { Product } from '@/lib/types';

const push = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, refresh: vi.fn() }),
}));

const dict = getDictionary('en');

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'p1', slug: 'hazel', name: 'Hazel', brandId: 'v', brandName: 'Vivimoon',
    productLine: 'trongSuot', replacement: 'monthly', description: '', images: ['/a.jpg'], badges: [],
    specs: { material: '', waterContent: '', baseCurve: '', diameter: '', origin: '' },
    requiresRx: true,
    variants: [
      { id: 'v1', sku: 'H-BR-10', price: 110_000, currency: 'VND', stock: 9 },
    ],
    rating: 4, reviewCount: 0,
    ...overrides,
  };
}

const unitButton = (unit: 'single' | 'pair') => screen.getByRole('button', { name: dict.pdp.unitOptions[unit] });
const addButton = () => screen.getByRole('button', { name: dict.common.addToCart });

beforeEach(() => {
  localStorage.clear();
  push.mockClear();
  // The store is a module singleton (spec §8); reset it between tests so a
  // line added in one test can't bleed into the next.
  useCartStore.setState({ lines: [], hydrated: false, buyNowLine: null });
  useMiniCartStore.setState({ open: false, added: [] });
});

describe('AddToCart — Purchase Unit (ADR-0023)', () => {
  it('shows the per-lens price "/ lens", and the per-pair price in pair mode', async () => {
    render(<AddToCart product={makeProduct()} locale="en" dict={dict} />);
    expect(screen.getByText('110.000₫')).toBeInTheDocument();
    expect(screen.getByText(dict.pdp.perUnit.single)).toBeInTheDocument();

    await userEvent.click(unitButton('pair'));
    expect(screen.getByText('220.000₫')).toBeInTheDocument();
    expect(screen.getByText(dict.pdp.perUnit.pair)).toBeInTheDocument();
  });

  it('counts stock in the chosen unit', async () => {
    render(<AddToCart product={makeProduct()} locale="en" dict={dict} />);
    expect(screen.getByText('lens · 9 left')).toBeInTheDocument();
    await userEvent.click(unitButton('pair'));
    expect(screen.getByText('pair · 4 left')).toBeInTheDocument();
  });

  it('works straight away at 0.00, adding a single plano lens, and shows the hint only while at 0.00', async () => {
    render(<AddToCart product={makeProduct()} locale="en" dict={dict} />);
    expect(screen.getByText(dict.rx.zeroHint)).toBeInTheDocument();
    await userEvent.click(addButton());

    expect(useCartStore.getState().lines).toEqual([
      expect.objectContaining({ variantId: 'v1', purchaseUnit: 'single', rx: { sph: 0 }, quantity: 1, unitPrice: 110_000 }),
    ]);

    await userEvent.selectOptions(screen.getByRole('combobox', { name: dict.rx.power }), '-2.5');
    expect(screen.queryByText(dict.rx.zeroHint)).not.toBeInTheDocument();
  });

  it('keeps the chosen power when switching unit, and adds a pair as a distinct line', async () => {
    render(<AddToCart product={makeProduct()} locale="en" dict={dict} />);
    await userEvent.selectOptions(screen.getByRole('combobox', { name: dict.rx.power }), '-2.5');
    await userEvent.click(addButton());

    await userEvent.click(unitButton('pair'));
    expect(screen.getByLabelText(dict.rx.leftEye)).toHaveValue('-2.5');
    await userEvent.selectOptions(screen.getByLabelText(dict.rx.rightEye), '-3');
    await userEvent.click(addButton());

    const [single, pair] = useCartStore.getState().lines;
    expect(single).toMatchObject({ purchaseUnit: 'single', rx: { sph: -2.5 } });
    expect(pair).toMatchObject({ purchaseUnit: 'pair', rx: { left: { sph: -2.5 }, right: { sph: -3 } }, unitPrice: 220_000 });
    expect(single.lineKey).not.toBe(pair.lineKey);
  });

  it('adding the same unit and power again bumps the quantity of one line', async () => {
    render(<AddToCart product={makeProduct()} locale="en" dict={dict} />);
    await userEvent.click(addButton());
    await userEvent.click(addButton());
    const lines = useCartStore.getState().lines;
    expect(lines).toHaveLength(1);
    expect(lines[0].quantity).toBe(2);
  });
});

describe('AddToCart — a product with no Rx', () => {
  it('renders no unit or power controls and adds a unit-less line keyed by its variant', async () => {
    render(<AddToCart product={makeProduct({ requiresRx: false })} locale="en" dict={dict} />);
    expect(screen.queryByRole('button', { name: dict.pdp.unitOptions.single })).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByText(dict.pdp.perUnit.single)).not.toBeInTheDocument();
    await userEvent.click(addButton());

    const [line] = useCartStore.getState().lines;
    expect(line.rx).toBeUndefined();
    expect(line.purchaseUnit).toBeUndefined();
    expect(line.lineKey).toBe('v1');
  });
});

describe('AddToCart — Buy Now (Task 12)', () => {
  it('sets buyNowLine with the chosen unit and power and navigates to checkout without touching the real cart', async () => {
    useCartStore.getState().add({
      lineKey: 'existing', productId: 'p0', variantId: 'v0', name: 'Existing',
      sku: 'SKU0', unitPrice: 50_000, currency: 'VND', quantity: 1,
    });

    render(<AddToCart product={makeProduct()} locale="en" dict={dict} />);
    await userEvent.click(unitButton('pair'));
    await userEvent.click(screen.getByRole('button', { name: dict.common.buyNow }));

    const state = useCartStore.getState();
    expect(state.lines).toHaveLength(1); // the pre-existing line, untouched
    expect(state.lines[0].lineKey).toBe('existing');
    expect(state.buyNowLine).toMatchObject({ variantId: 'v1', purchaseUnit: 'pair' });
    expect(push).toHaveBeenCalledWith('/en/checkout');
  });
});

describe('AddToCart — mini cart signal (#198)', () => {
  it('opens the mini cart with the added line on Thêm vào giỏ', async () => {
    render(<AddToCart product={makeProduct()} locale="en" dict={dict} />);
    await userEvent.click(addButton());
    const { open, added } = useMiniCartStore.getState();
    expect(open).toBe(true);
    expect(added).toEqual([useCartStore.getState().lines[0]]);
  });

  it('does not open it on Mua ngay', async () => {
    render(<AddToCart product={makeProduct()} locale="en" dict={dict} />);
    await userEvent.click(screen.getByRole('button', { name: dict.common.buyNow }));
    expect(useMiniCartStore.getState().open).toBe(false);
  });
});
