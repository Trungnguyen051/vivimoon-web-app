import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VariantSelector } from './variant-selector';
import { getDictionary } from '@/lib/i18n/dictionaries';
import type { Product } from '@/lib/types';

const dict = getDictionary('en');
const coloredProduct: Product = {
  id: 'p1', slug: 'hazel', name: 'Hazel', brandId: 'v', brandName: 'Vivimoon',
  type: 'colored', replacement: 'monthly', description: '', images: ['/a.jpg'], badges: [],
  specs: { material: '', waterContent: '', baseCurve: '', diameter: '', origin: '' },
  requiresRx: true,
  variants: [
    { id: 'v1', sku: 'H-BR', color: '#8a5a2b', colorLabel: 'Brown', price: 55, currency: 'USD', stock: 5 },
    { id: 'v2', sku: 'H-GR', color: '#777777', colorLabel: 'Gray', price: 55, currency: 'USD', stock: 5 },
  ],
  rating: 4, reviewCount: 0,
};
const colorlessProduct: Product = {
  ...coloredProduct,
  id: 'p2', slug: 'aqua', name: 'Aqua', type: 'clear',
  variants: [{ id: 'v3', sku: 'AQ-1', price: 25, currency: 'USD', stock: 10 }],
};

describe('VariantSelector', () => {
  it('emits the matching variant when a color is chosen', async () => {
    const onChange = vi.fn();
    render(<VariantSelector product={coloredProduct} dict={dict} onVariantChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Gray' }));
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'v2' }));
  });

  it('emits the first variant on mount before any color is clicked', () => {
    const onChange = vi.fn();
    render(<VariantSelector product={coloredProduct} dict={dict} onVariantChange={onChange} />);
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ id: 'v1' }));
  });

  it('renders no color picker for a colorless product, but still emits its sole variant', () => {
    const onChange = vi.fn();
    render(<VariantSelector product={colorlessProduct} dict={dict} onVariantChange={onChange} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ id: 'v3' }));
  });
});
