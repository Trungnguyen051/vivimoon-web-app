import { resolveMode } from '@/lib/api/config';
import { mockAuth, type Auth } from './mock';

export const auth: Auth =
  resolveMode('identity') === 'mock'
    ? mockAuth
    : (() => {
        throw new Error(
          'identity is set to upstream but lib/api/resources/auth/upstream.ts does not exist yet',
        );
      })();

export { AuthError } from './mock';
