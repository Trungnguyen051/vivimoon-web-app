import { resolveMode } from '@/lib/api/config';
import { mockAccount, type Account } from './mock';

export const account: Account =
  resolveMode('identity') === 'mock'
    ? mockAccount
    : (() => {
        throw new Error(
          'identity is set to upstream but lib/api/resources/account/upstream.ts does not exist yet',
        );
      })();
