import type { ShippingOption } from '@/lib/api/schemas/checkout';

/**
 * PROVISIONAL — placeholder shipping rates pending Vivimoon's real carrier
 * integration (owner: Vivimoon). Keyed by `${province}|${district}`; see
 * lib/api/resources/shipping/mock.ts for the lookup and default fallback.
 */
// Fees in VND, the cart's currency — PROVISIONAL: standard 30.000₫, express 50.000₫.
export const shippingRates: Record<string, ShippingOption[]> = {
  'Ho Chi Minh City|District 1': [
    { id: 'standard', label: 'Standard', fee: 30_000, etaDays: 2 },
    { id: 'express', label: 'Express', fee: 50_000, etaDays: 1 },
  ],
  'Hanoi|Ba Dinh': [
    { id: 'standard', label: 'Standard', fee: 30_000, etaDays: 3 },
    { id: 'express', label: 'Express', fee: 50_000, etaDays: 1 },
  ],
};

/** Returned for any province/district not in `shippingRates` above. */
export const defaultShippingOptions: ShippingOption[] = [
  { id: 'standard', label: 'Standard', fee: 30_000, etaDays: 5 },
];
