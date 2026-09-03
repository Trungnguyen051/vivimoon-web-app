import { resolveMode } from '@/lib/api/config';
import { mockVouchers, type Vouchers } from './mock';

/**
 * `vouchers` is a module, not a resource — it resolves the existing
 * `commerce` resource, same as `pricing`/`shipping`/`orders`/`payments`
 * (see spec "Cutover order": vouchers are part of Group D `commerce`).
 *
 * When commerce migrates, add `./upstream.ts` exporting an object of the
 * same shape and return it below.
 */
export const vouchers: Vouchers =
  resolveMode('commerce') === 'mock'
    ? mockVouchers
    : (() => {
        throw new Error(
          'commerce is set to upstream but lib/api/resources/vouchers/upstream.ts does not exist yet',
        );
      })();
