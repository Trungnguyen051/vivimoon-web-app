import { resolveMode } from '@/lib/api/config';
import { mockSupport, type Support } from './mock';

/**
 * Server Components import this directly, as they do catalog and editorial.
 *
 * `support` is its own resource key rather than a corner of `editorial`: a Guide and
 * an Article are different shapes with different migration paths (ADR-0019), and
 * help content is the kind of thing Vivimoon will want to edit without a deploy long
 * before the editorial section moves anywhere.
 */
export const support: Support =
  resolveMode('support') === 'mock'
    ? mockSupport
    : (() => {
        throw new Error(
          'support is set to upstream but lib/api/resources/support/upstream.ts does not exist yet',
        );
      })();
