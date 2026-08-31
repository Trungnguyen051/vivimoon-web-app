import { resolveMode } from '@/lib/api/config';
import { mockPricing, type Pricing } from './mock';

/**
 * `pricing` is a module, not a resource — it resolves the existing
 * `commerce` resource, exactly as `account/index.ts` and `auth/index.ts`
 * both resolve `identity`. See spec "Cutover order": cart pricing, vouchers,
 * orders and payments are all Group D `commerce`.
 *
 * When commerce migrates, add `./upstream.ts` exporting an object of the
 * same shape and return it below.
 */
export const pricing: Pricing =
  resolveMode('commerce') === 'mock'
    ? mockPricing
    : (() => {
        throw new Error(
          'commerce is set to upstream but lib/api/resources/pricing/upstream.ts does not exist yet',
        );
      })();

export { PricingError } from './mock';
