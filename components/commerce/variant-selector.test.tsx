import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VariantSelector } from './variant-selector';
import { getDictionary } from '@/lib/i18n/dictionaries';
import type { Product } from '@/lib/types';

const dict = getDictionary('en');
const product: Product = {
  id: 'p1', slug: 'hazel', name: 'Hazel', brandId: 'v', brandName: 'Vivimoon',
  type: 'colored', replacement: 'monthly', description: '', images: ['/a.jpg'], badges: [],
  specs: { material: '', waterContent: '', baseCurve: '', diameter: '', uvProtection: false, manufacturer: '' },
  requiresRx: true,
  variants: [
    { id: 'v1', sku: 'H-BR-10', color: '#8a5a2b', colorLabel: 'Brown', packSize: '10 lenses', price: 22, currency: 'USD', stock: 5 },
    { id: 'v2', sku: 'H-BR-30', color: '#8a5a2b', colorLabel: 'Brown', packSize: '30 lenses', price: 55, currency: 'USD', stock: 5 },
  ],
  rating: 4, reviewCount: 0,
};

describe('VariantSelector', () => {
  it('emits a variant when a pack size is chosen', async () => {
    const onChange = vi.fn();
    render(<VariantSelector product={product} dict={dict} onVariantChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: '30 lenses' }));
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'v2' }));
  });
});
