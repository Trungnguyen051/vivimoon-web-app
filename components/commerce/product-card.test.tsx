import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductCard } from './product-card';
import type { Product } from '@/lib/types';
import { en } from '@/lib/i18n/dictionaries/en';
import { vi } from '@/lib/i18n/dictionaries/vi';

const product: Product = {
  id: 'p1', slug: 'aqua', name: 'Aqua Daily', brandId: 'v', brandName: 'Vivimoon',
  productLine: 'trongSuot', replacement: 'daily', description: '', images: ['/a.jpg', '/b.jpg'], badges: ['sale'],
  specs: { material: '', waterContent: '', baseCurve: '', diameter: '', origin: '' },
  requiresRx: true,
  variants: [{ id: 'v1', sku: 'S1', price: 20, compareAtPrice: 25, currency: 'USD', stock: 5 }],
  rating: 4, reviewCount: 3,
};

describe('ProductCard', () => {
  it('renders name, sale badge, discounted price, and a link to the PDP', () => {
    render(<ProductCard product={product} locale="en" dict={en} />);
    expect(screen.getByText('Aqua Daily')).toBeInTheDocument();
    expect(screen.getByText('$20.00')).toBeInTheDocument();
    expect(screen.getByText('$25.00')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /Aqua Daily/i });
    expect(link).toHaveAttribute('href', '/en/product/aqua');
  });

  it("prints the badge in the shopper's language, not its code", () => {
    render(<ProductCard product={product} locale="vi" dict={vi} />);
    expect(screen.getByText(vi.pdp.badges.sale)).toBeInTheDocument();
    expect(vi.pdp.badges.sale).toBe('Giảm giá');
    expect(screen.queryByText('sale')).not.toBeInTheDocument();
  });
});
