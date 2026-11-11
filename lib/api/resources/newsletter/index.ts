import { resolveMode } from '@/lib/api/config';
import { mockNewsletter, type Newsletter } from './mock';

/**
 * The weekly digest sign-up.
 *
 * `newsletter` is its own resource key with no dependencies at all — a subscription
 * references no product and no account. That makes it the one resource that can go
 * upstream first, ahead of catalog and identity, the day Vivimoon picks a mailing
 * provider.
 *
 * Going upstream without an implementation throws rather than falling back to the mock,
 * the way `editorial` does: a silent fallback would quietly keep accepting addresses
 * into a function that forgets them.
 */
export const newsletter: Newsletter =
  resolveMode('newsletter') === 'mock'
    ? mockNewsletter
    : (() => {
        throw new Error(
          'newsletter is set to upstream but lib/api/resources/newsletter/upstream.ts does not exist yet',
        );
      })();
