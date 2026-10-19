import { resolveMode } from '@/lib/api/config';
import { mockEditorial, type Editorial } from './mock';

/**
 * Server Components import this directly, as they do catalog.
 *
 * `editorial` is its own resource key rather than a corner of `discovery`:
 * articles reference no product, so they can migrate to a CMS whenever one
 * exists without waiting on catalog, which `discovery` depends on.
 */
export const editorial: Editorial =
  resolveMode('editorial') === 'mock'
    ? mockEditorial
    : (() => {
        throw new Error(
          'editorial is set to upstream but lib/api/resources/editorial/upstream.ts does not exist yet',
        );
      })();
