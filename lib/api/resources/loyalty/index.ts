import { resolveMode } from '@/lib/api/config';
import { mockLoyalty, type Loyalty } from './mock';

/**
 * `loyalty` is a module, not a resource — it resolves the existing
 * `commerce` resource, same as `pricing`/`orders`/`vouchers` (loyalty is
 * awarded from order placement, so it travels with the same cutover group).
 *
 * When commerce migrates, add `./upstream.ts` exporting an object of the
 * same shape and return it below.
 */
export const loyalty: Loyalty =
  resolveMode('commerce') === 'mock'
    ? mockLoyalty
    : (() => {
        throw new Error(
          'commerce is set to upstream but lib/api/resources/loyalty/upstream.ts does not exist yet',
        );
      })();
