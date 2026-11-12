import { describe, it, expect } from 'vitest';
import { cartLineSchema, priceLineInputSchema, pricedLineSchema, MAX_LINE_QUANTITY } from './cart';

const cartLine = { lineKey: 'k1', productId: 'p1', variantId: 'v1', name: 'Aqua', sku: 'S1', unitPrice: 125_000, currency: 'VND' };
const priceLine = { lineKey: 'k1', variantId: 'v1' };
const pricedLine = { lineKey: 'k1', variantId: 'v1', unitPrice: 125_000, lineTotal: 125_000, currency: 'VND' };

describe('line quantity cap', () => {
  it('is 99', () => {
    expect(MAX_LINE_QUANTITY).toBe(99);
  });

  it.each([
    ['cartLineSchema', cartLineSchema, cartLine],
    ['priceLineInputSchema', priceLineInputSchema, priceLine],
    ['pricedLineSchema', pricedLineSchema, pricedLine],
  ] as const)('%s accepts 99 and rejects 100', (_name, schema, base) => {
    expect(schema.safeParse({ ...base, quantity: 99 }).success).toBe(true);
    expect(schema.safeParse({ ...base, quantity: 100 }).success).toBe(false);
  });
});
