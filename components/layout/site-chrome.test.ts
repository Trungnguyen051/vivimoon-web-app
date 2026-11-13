import { describe, it, expect } from 'vitest';
import { isCheckoutFlow } from './site-chrome';

describe('isCheckoutFlow', () => {
  it('is true for checkout and the pages under it', () => {
    expect(isCheckoutFlow('/vi/checkout')).toBe(true);
    expect(isCheckoutFlow('/en/checkout/qr/VVM-ABC')).toBe(true);
  });

  it('leaves success, the cart and everything else on the site layout', () => {
    expect(isCheckoutFlow('/vi/checkout/success')).toBe(false);
    expect(isCheckoutFlow('/vi/cart')).toBe(false);
    expect(isCheckoutFlow('/vi/checkout-guide')).toBe(false);
    expect(isCheckoutFlow('/vi')).toBe(false);
  });
});
