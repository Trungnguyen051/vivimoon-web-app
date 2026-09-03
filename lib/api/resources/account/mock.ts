import { addresses as seedAddresses, favorites as seedFavorites } from '@/content/mock';
import { catalog } from '@/lib/api/resources/catalog';
import { mockAuth, AuthError } from '@/lib/api/resources/auth/mock';
import type { AccountPatch, AddressCreate, AddressPatch, SavedAddress } from '@/lib/api/schemas/account';
import type { User } from '@/lib/api/schemas/auth';
import type { Product } from '@/lib/api/schemas/catalog';

/** Thrown by the address-book mock so route handlers can map it to an envelope. */
export class AddressError extends Error {
  constructor(message: string, readonly code: 'not_found') {
    super(message);
    this.name = 'AddressError';
  }
}

// In-memory address book, keyed by userId. Resets on every server restart —
// same mutable-mock-state precedent as lib/api/resources/auth/mock.ts.
// New addresses are always pushed to the end of a user's array, so "the
// most-recently-added remaining address" (issue #7) is simply the last
// element left after a delete — no separate timestamp needed.
let addressStore: Record<string, SavedAddress[]> = structuredClone(seedAddresses);

/** Test helper — restores the fixture state between cases. */
export function resetMockAddressesState(): void {
  addressStore = structuredClone(seedAddresses);
}

function randomAddressId(): string {
  return `addr-${Math.random().toString(36).slice(2, 10)}`;
}

function addressesFor(userId: string): SavedAddress[] {
  return (addressStore[userId] ??= []);
}

// Same in-memory, reset-on-restart shape as the address book above.
let favoriteStore: Record<string, string[]> = structuredClone(seedFavorites);

/** Test helper — restores the fixture state between cases. */
export function resetMockFavoritesState(): void {
  favoriteStore = structuredClone(seedFavorites);
}

function favoriteIdsFor(userId: string): string[] {
  return (favoriteStore[userId] ??= []);
}

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

  async listAddresses(userId: string): Promise<SavedAddress[]> {
    return addressesFor(userId);
  },

  async addAddress(userId: string, input: AddressCreate): Promise<SavedAddress[]> {
    const list = addressesFor(userId);
    // The account's very first saved address has nothing to be "less
    // default" than, so it is promoted automatically rather than leaving a
    // shopper with a saved address book that has no default at all.
    list.push({ ...input, id: randomAddressId(), isDefault: list.length === 0 });
    return list;
  },

  async patchAddress(userId: string, id: string, patch: AddressPatch): Promise<SavedAddress[]> {
    const list = addressesFor(userId);
    const record = list.find((a) => a.id === id);
    if (!record) throw new AddressError('Address not found', 'not_found');
    const { isDefault, ...fields } = patch;
    Object.assign(record, fields);
    if (isDefault) {
      for (const a of list) a.isDefault = a.id === id;
    }
    return list;
  },

  async deleteAddress(userId: string, id: string): Promise<SavedAddress[]> {
    const list = addressesFor(userId);
    const idx = list.findIndex((a) => a.id === id);
    if (idx === -1) throw new AddressError('Address not found', 'not_found');
    const wasDefault = list[idx].isDefault;
    list.splice(idx, 1);
    if (wasDefault && list.length > 0) list[list.length - 1].isDefault = true;
    return list;
  },

  async listFavoriteIds(userId: string): Promise<string[]> {
    return [...favoriteIdsFor(userId)];
  },

  /** Joins stored ids against the live catalog; a since-removed product is silently dropped. */
  async listFavorites(userId: string): Promise<Product[]> {
    return catalog.getProductsByIds(favoriteIdsFor(userId));
  },

  async addFavorite(userId: string, productId: string): Promise<string[]> {
    const ids = favoriteIdsFor(userId);
    if (!ids.includes(productId)) ids.push(productId);
    return [...ids];
  },

  async removeFavorite(userId: string, productId: string): Promise<string[]> {
    const ids = favoriteIdsFor(userId);
    const idx = ids.indexOf(productId);
    if (idx !== -1) ids.splice(idx, 1);
    return [...ids];
  },
};

export type Account = typeof mockAccount;
