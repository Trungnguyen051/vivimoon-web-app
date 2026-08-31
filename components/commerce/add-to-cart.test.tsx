import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddToCart } from './add-to-cart';
import { useCartStore } from '@/features/cart/cart-store';
import { getDictionary } from '@/lib/i18n/dictionaries';
import type { Product } from '@/lib/types';

const dict = getDictionary('en');

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'p1', slug: 'hazel', name: 'Hazel', brandId: 'v', brandName: 'Vivimoon',
    type: 'clear', replacement: 'monthly', description: '', images: ['/a.jpg'], badges: [],
    specs: { material: '', waterContent: '', baseCurve: '', diameter: '', uvProtection: false, manufacturer: '' },
    requiresRx: true,
    variants: [
      { id: 'v1', sku: 'H-BR-10', packSize: '10 lenses', price: 22, currency: 'USD', stock: 5 },
    ],
    rating: 4, reviewCount: 0,
    ...overrides,
  };
}

async function fillRightSphAndMirror(sph: string) {
  const rightSph = screen.getByLabelText(`${dict.rx.rightEye} ${dict.rx.sph}`);
  await userEvent.selectOptions(rightSph, sph);
  await userEvent.click(screen.getByLabelText(dict.rx.sameBothEyes));
}

beforeEach(() => {
  localStorage.clear();
  // The store is a module singleton (spec §8); reset it between tests so a
  // line added in one test can't bleed into the next.
  useCartStore.setState({ lines: [], hydrated: false });
});

describe('AddToCart — Rx gating (Task 5, Step 4)', () => {
  it('disables the button until a valid Rx is entered, then enables it', async () => {
    const product = makeProduct({ requiresRx: true, type: 'clear' });
    render(<AddToCart product={product} locale="en" dict={dict} />);
    const addButton = screen.getByRole('button', { name: dict.common.addToCart });
    expect(addButton).toBeDisabled();

    await fillRightSphAndMirror('-2.5');

    expect(addButton).toBeEnabled();
  });

  it('shows the required-Rx message only after the shopper has touched the selector', async () => {
    const product = makeProduct({ requiresRx: true, type: 'clear' });
    render(<AddToCart product={product} locale="en" dict={dict} />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    // Touch the control but leave the prescription incomplete (right only).
    const rightSph = screen.getByLabelText(`${dict.rx.rightEye} ${dict.rx.sph}`);
    await userEvent.selectOptions(rightSph, '-2.5');

    expect(screen.getByRole('alert')).toHaveTextContent(dict.rx.required);
  });

  it('does not render RxSelector and enables the button immediately when requiresRx is false', () => {
    const product = makeProduct({ requiresRx: false });
    render(<AddToCart product={product} locale="en" dict={dict} />);
    expect(screen.queryByLabelText(`${dict.rx.rightEye} ${dict.rx.sph}`)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: dict.common.addToCart })).toBeEnabled();
  });

  it('adds a line with no rx and lineKey === variantId when requiresRx is false', async () => {
    const product = makeProduct({ requiresRx: false });
    render(<AddToCart product={product} locale="en" dict={dict} />);
    await userEvent.click(screen.getByRole('button', { name: dict.common.addToCart }));

    const lines = useCartStore.getState().lines;
    expect(lines).toHaveLength(1);
    expect(lines[0].rx).toBeUndefined();
    expect(lines[0].lineKey).toBe('v1');
  });

  it('adding the same variant at two different powers produces two distinct cart lines', async () => {
    const product = makeProduct({ requiresRx: true, type: 'clear' });
    render(<AddToCart product={product} locale="en" dict={dict} />);

    await fillRightSphAndMirror('-2.5');
    await userEvent.click(screen.getByRole('button', { name: dict.common.addToCart }));

    const rightSph = screen.getByLabelText(`${dict.rx.rightEye} ${dict.rx.sph}`);
    await userEvent.selectOptions(rightSph, '-3');
    await userEvent.click(screen.getByRole('button', { name: dict.common.addToCart }));

    const lines = useCartStore.getState().lines;
    expect(lines).toHaveLength(2);
    expect(lines[0].lineKey).not.toBe(lines[1].lineKey);
    expect(lines[0].rx).toBeDefined();
    expect(lines[1].rx).toBeDefined();
  });
});
