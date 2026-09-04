import { resolveMode } from '@/lib/api/config';
import { mockDiscovery, type Discovery } from './mock';

/**
 * Server Components import this directly. Client Components go through
 * `/api/*`, whose route handlers also land here.
 *
 * `discovery` has resolved a mock/upstream mode since M1 (`lib/api/config.ts`)
 * but this is the first resource module to actually exist for it — comparison
 * and the quiz both live here, per spec §5's Group C.
 */
export const discovery: Discovery =
  resolveMode('discovery') === 'mock'
    ? mockDiscovery
    : (() => {
        throw new Error(
          'discovery is set to upstream but lib/api/resources/discovery/upstream.ts does not exist yet',
        );
      })();
