import { resolveMode } from '@/lib/api/config';
import { mockShipping, type Shipping } from './mock';

/**
 * `shipping` is a module, not a resource — it resolves the existing
 * `commerce` resource, same as `pricing/index.ts` (see spec "Cutover
 * order": shipping quotes are part of Group D `commerce`).
 *
 * When commerce migrates, add `./upstream.ts` exporting an object of the
 * same shape and return it below.
 */
export const shipping: Shipping =
  resolveMode('commerce') === 'mock'
    ? mockShipping
    : (() => {
        throw new Error(
          'commerce is set to upstream but lib/api/resources/shipping/upstream.ts does not exist yet',
        );
      })();

export { ShippingError } from './mock';
