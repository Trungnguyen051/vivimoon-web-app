import { resolveMode } from '@/lib/api/config';
import { mockOrders, type Orders } from './mock';

/**
 * `orders` is a module, not a resource — it resolves the existing
 * `commerce` resource, same as `pricing`/`shipping`/`payments` (see spec
 * "Cutover order": order placement is part of Group D `commerce`).
 *
 * When commerce migrates, add `./upstream.ts` exporting an object of the
 * same shape and return it below.
 */
export const orders: Orders =
  resolveMode('commerce') === 'mock'
    ? mockOrders
    : (() => {
        throw new Error(
          'commerce is set to upstream but lib/api/resources/orders/upstream.ts does not exist yet',
        );
      })();

export { OrderError } from './mock';
