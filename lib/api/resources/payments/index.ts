import { resolveMode } from '@/lib/api/config';
import { mockPayments, type Payments } from './mock';

/**
 * `payments` is a module, not a resource — it resolves the existing
 * `commerce` resource, same as `pricing/index.ts` and `shipping/index.ts`
 * (see spec "Cutover order": payment intents are part of Group D `commerce`).
 *
 * When commerce migrates, add `./upstream.ts` exporting an object of the
 * same shape and return it below.
 */
export const payments: Payments =
  resolveMode('commerce') === 'mock'
    ? mockPayments
    : (() => {
        throw new Error(
          'commerce is set to upstream but lib/api/resources/payments/upstream.ts does not exist yet',
        );
      })();

export { PaymentError } from './mock';
