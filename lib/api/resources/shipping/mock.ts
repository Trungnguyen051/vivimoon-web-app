import { shippingRates, defaultShippingOptions } from '@/content/mock';
import type { ShippingOption } from '@/lib/api/schemas/checkout';

/** Thrown by the mock so the route handler can map it to an envelope. */
export class ShippingError extends Error {
  constructor(message: string, readonly code: 'not_found' | 'validation_failed') {
    super(message);
    this.name = 'ShippingError';
  }
}

export const mockShipping = {
  /**
   * Rates are keyed by province/district only — no weight/volume model in
   * M2. An unknown province/district gets `defaultShippingOptions` rather
   * than an error: a shopper mistyping or picking an address outside the
   * fixture table must still be able to check out.
   */
  async quote({ province, district }: { province: string; district: string }): Promise<ShippingOption[]> {
    return shippingRates[`${province}|${district}`] ?? defaultShippingOptions;
  },
};

export type Shipping = typeof mockShipping;
