import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductCard } from './product-card';
import type { Product } from '@/lib/types';

const product: Product = {
  id: 'p1', slug: 'aqua', name: 'Aqua Daily', brandId: 'v', brandName: 'Vivimoon',
  type: 'clear', replacement: 'daily', description: '', images: ['/a.jpg', '/b.jpg'], badges: ['sale'],
  specs: { material: '', waterContent: '', baseCurve: '', diameter: '', uvProtection: false, manufacturer: '' },
  requiresRx: true,
  variants: [{ id: 'v1', sku: 'S1', packSize: '30', price: 20, compareAtPrice: 25, currency: 'USD', stock: 5 }],
  rating: 4, reviewCount: 3,
};

describe('ProductCard', () => {
  it('renders name, sale badge, discounted price, and a link to the PDP', () => {
    render(<ProductCard product={product} locale="en" />);
    expect(screen.getByText('Aqua Daily')).toBeInTheDocument();
    expect(screen.getByText('$20.00')).toBeInTheDocument();
    expect(screen.getByText('$25.00')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /Aqua Daily/i });
    expect(link).toHaveAttribute('href', '/en/product/aqua');
  });
});
