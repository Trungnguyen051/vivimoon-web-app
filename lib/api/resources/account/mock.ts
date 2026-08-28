import { mockAuth, AuthError } from '@/lib/api/resources/auth/mock';
import type { AccountPatch } from '@/lib/api/schemas/account';
import type { User } from '@/lib/api/schemas/auth';

/** Shares the identity store — an account is the same record as its user. */
export const mockAccount = {
  async get(userId: string): Promise<User> {
    const user = await mockAuth.getUserById(userId);
    if (!user) throw new AuthError('Account not found', 'not_found');
    return user;
  },

  async update(userId: string, patch: AccountPatch): Promise<User> {
    return mockAuth.updateUser(userId, patch);
  },
};

export type Account = typeof mockAccount;
