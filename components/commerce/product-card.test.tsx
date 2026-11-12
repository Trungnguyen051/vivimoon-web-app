import { describe, it, expect, vi as vitest } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductCard } from './product-card';
import type { Product } from '@/lib/types';
import { en } from '@/lib/i18n/dictionaries/en';
import { vi } from '@/lib/i18n/dictionaries/vi';

vitest.mock('next/navigation', () => ({
  useRouter: () => ({ push: vitest.fn() }),
  usePathname: () => '/vi/collection/all-lenses',
}));

const product: Product = {
  id: 'p1', slug: 'aqua', name: 'Aqua Daily', brandId: 'v', brandName: 'Vivimoon',
  productLine: 'trongSuot', replacement: 'daily', description: '', images: ['/a.jpg', '/b.jpg'], badges: ['sale'],
  specs: { material: 'Silicone Hydrogel', waterContent: '', baseCurve: '', diameter: '14.2mm', origin: '' },
  requiresRx: true,
  variants: [{ id: 'v1', sku: 'S1', price: 100_000, compareAtPrice: 125_000, currency: 'VND', stock: 5 }],
  rating: 4.9, reviewCount: 3, soldCount: 3200,
};

const colorVariant = (color: string) =>
  ({ id: color, sku: color, color, colorLabel: color, price: 100_000, currency: 'VND' as const, stock: 5 });

describe('ProductCard', () => {
  it('renders name, sale badge, discounted price, and a link to the PDP', () => {
    render(<ProductCard product={product} locale="en" dict={en} />);
    expect(screen.getByText('100.000₫')).toBeInTheDocument();
    expect(screen.getByText('125.000₫')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: 'Aqua Daily' });
    expect(link).toHaveAttribute('href', '/en/product/aqua');
  });

  it("prints the badge in the shopper's language, not its code", () => {
    render(<ProductCard product={product} locale="vi" dict={vi} />);
    expect(screen.getByText(vi.pdp.badges.sale)).toBeInTheDocument();
    expect(vi.pdp.badges.sale).toBe('Giảm giá');
    expect(screen.queryByText('sale')).not.toBeInTheDocument();
  });

  it('shows the spec line, rating with sold count, and the price per lens', () => {
    render(<ProductCard product={product} locale="vi" dict={vi} />);
    expect(screen.getByText('Mắt thở · 1 ngày · DIA 14.2')).toBeInTheDocument();
    expect(screen.getByText('4.9')).toBeInTheDocument();
    expect(screen.getByText('Đã bán 3,2k')).toBeInTheDocument();
    expect(screen.getByText('/ chiếc')).toBeInTheDocument();
  });

  it('caps the swatches at three and counts the rest', () => {
    const variants = ['brown', 'black', 'gray', 'violet', 'green'].map((c) => colorVariant(c));
    const { container } = render(<ProductCard product={{ ...product, variants }} locale="vi" dict={vi} />);
    expect(container.querySelectorAll('span[title]')).toHaveLength(3);
    expect(screen.getByText('+2 màu')).toBeInTheDocument();
  });

  it('has a favourite heart and an add-to-cart that opens the PDP until Quick add lands', () => {
    render(<ProductCard product={product} locale="vi" dict={vi} />);
    expect(screen.getByRole('button', { name: vi.favorites.add })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Thêm vào giỏ Aqua Daily' })).toHaveAttribute('href', '/vi/product/aqua');
  });

  it("shows the chosen view's image", () => {
    const { container } = render(<ProductCard product={product} locale="vi" dict={vi} image="/view.jpg" />);
    expect(container.querySelector('img')?.getAttribute('src')).toContain('view.jpg');
  });
});
