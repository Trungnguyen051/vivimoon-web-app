import { resolveMode } from '@/lib/api/config';
import { mockCatalog, type Catalog } from './mock';

/**
 * Server Components import this directly. Client Components go through
 * `/api/*`, whose route handlers also land here.
 *
 * When catalog migrates, add `./upstream.ts` exporting an object of the same
 * shape and return it below. Until then there is no identity-mapping code to
 * maintain.
 */
export const catalog: Catalog =
  resolveMode('catalog') === 'mock'
    ? mockCatalog
    : (() => {
        throw new Error(
          'catalog is set to upstream but lib/api/resources/catalog/upstream.ts does not exist yet',
        );
      })();

export { minPrice } from './mock';
