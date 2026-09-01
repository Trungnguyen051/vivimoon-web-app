import type { ShippingOption } from '@/lib/api/schemas/checkout';

/**
 * PROVISIONAL — placeholder shipping rates pending Vivimoon's real carrier
 * integration (owner: Vivimoon). Keyed by `${province}|${district}`; see
 * lib/api/resources/shipping/mock.ts for the lookup and default fallback.
 */
// Fees share scale with content/mock/products.ts (USD, e.g. 25/48 per unit) —
// pricedCartSchema has one `currency` for the whole cart and `shipping` is a
// bare integer in it, so a VND-scale fee here would silently blow up `total`.
export const shippingRates: Record<string, ShippingOption[]> = {
  'Ho Chi Minh City|District 1': [
    { id: 'standard', label: 'Standard', fee: 3, etaDays: 2 },
    { id: 'express', label: 'Express', fee: 8, etaDays: 1 },
  ],
  'Hanoi|Ba Dinh': [
    { id: 'standard', label: 'Standard', fee: 4, etaDays: 3 },
    { id: 'express', label: 'Express', fee: 9, etaDays: 1 },
  ],
};

/** Returned for any province/district not in `shippingRates` above. */
export const defaultShippingOptions: ShippingOption[] = [
  { id: 'standard', label: 'Standard', fee: 5, etaDays: 5 },
];
