import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { toGa4Items } from './events';
import { track } from './analytics';
import type { Product } from '@/lib/types';

const product = {
  id: 'p1', slug: 'p1', name: 'Aqua', brandId: 'v', brandName: 'Vivimoon',
  type: 'clear', replacement: 'daily', description: '', images: [], badges: [],
  specs: { material: '', waterContent: '', baseCurve: '', diameter: '', uvProtection: false, manufacturer: '' },
  variants: [{ id: 'v1', sku: 'SKU1', packSize: '30', price: 25, currency: 'USD', stock: 10 }],
  rating: 5, reviewCount: 1,
} as Product;

describe('toGa4Items', () => {
  it('maps product+variant to GA4 item shape', () => {
    const [item] = toGa4Items([{ product, variant: product.variants[0], quantity: 2 }]);
    expect(item).toEqual({
      item_id: 'SKU1', item_name: 'Aqua', item_brand: 'Vivimoon',
      item_category: 'clear', price: 25, quantity: 2,
    });
  });
});

describe('track', () => {
  const original = process.env.NEXT_PUBLIC_GA_ID;
  afterEach(() => { process.env.NEXT_PUBLIC_GA_ID = original; });
  beforeEach(() => { (window as unknown as { gtag?: unknown }).gtag = vi.fn(); });

  it('is a no-op when GA id is unset', () => {
    process.env.NEXT_PUBLIC_GA_ID = '';
    const spy = (window as unknown as { gtag: ReturnType<typeof vi.fn> }).gtag;
    track({ name: 'view_item', params: { items: [] } });
    expect(spy).not.toHaveBeenCalled();
  });

  it('forwards to gtag when GA id is set', () => {
    process.env.NEXT_PUBLIC_GA_ID = 'G-TEST';
    const spy = (window as unknown as { gtag: ReturnType<typeof vi.fn> }).gtag;
    track({ name: 'view_item', params: { items: [] } });
    expect(spy).toHaveBeenCalledWith('event', 'view_item', { items: [] });
  });
});
