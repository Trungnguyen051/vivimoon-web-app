import { users as seedUsers, type MockUser } from '@/content/mock';
import { isPhone, type LoginInput, type OtpChallenge, type OtpPurpose, type OtpRequestInput, type OtpVerifyInput, type OtpVerifyResult, type PasswordResetInput, type RegisterInput, type User } from '@/lib/api/schemas/auth';

/** Thrown by the mock so route handlers can map to an error code. */
export class AuthError extends Error {
  constructor(message: string, readonly code: 'unauthorized' | 'conflict' | 'not_found') {
    super(message);
    this.name = 'AuthError';
  }
}

interface OtpRecord { identifier: string; code: string; purpose: OtpPurpose; expiresAt: number }
interface ResetRecord { userId: string; expiresAt: number }

// In-memory state. Resets on every server restart, which is correct for a mock.
let store: MockUser[] = seedUsers.map((u) => ({ ...u }));
const otps = new Map<string, OtpRecord>();
const resets = new Map<string, ResetRecord>();

/** Test helper — restores the fixture state between cases. */
export function resetMockAuthState(): void {
  store = seedUsers.map((u) => ({ ...u }));
  otps.clear();
  resets.clear();
}

const OTP_TTL_MS = 5 * 60 * 1000;
const RESET_TTL_MS = 15 * 60 * 1000;

function publicUser(u: MockUser): User {
  const { password: _password, ...rest } = u;
  return rest;
}

function findByIdentifier(identifier: string): MockUser | undefined {
  const v = identifier.trim().toLowerCase();
  return store.find((u) => u.phone.toLowerCase() === v || u.email?.toLowerCase() === v);
}

function randomId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function randomCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export const mockAuth = {
  async register(input: RegisterInput): Promise<User> {
    if (findByIdentifier(input.identifier)) {
      throw new AuthError('That phone or email is already registered', 'conflict');
    }
    const phoneLike = isPhone(input.identifier);
    const user: MockUser = {
      id: randomId('u'),
      phone: phoneLike ? input.identifier : '',
      email: phoneLike ? undefined : input.identifier,
      name: input.name,
      createdAt: new Date().toISOString(),
      password: input.password,
    };
    store.push(user);
    return publicUser(user);
  },

  async login({ identifier, password }: LoginInput): Promise<User> {
    const user = findByIdentifier(identifier);
    // Identical failure for unknown account and wrong password: a differing
    // message would turn the sign-in form into an account-enumeration oracle.
    if (!user || user.password !== password) {
      throw new AuthError('Invalid phone/email or password', 'unauthorized');
    }
    return publicUser(user);
  },

  async loginWithGoogle(idToken: string): Promise<User> {
    // The mock treats the token as an email. Real verification is Vivimoon's.
    const existing = findByIdentifier(idToken);
    if (existing) return publicUser(existing);
    const user: MockUser = {
      id: randomId('u'),
      phone: '',
      email: idToken,
      name: idToken.split('@')[0] || 'Google user',
      createdAt: new Date().toISOString(),
    };
    store.push(user);
    return publicUser(user);
  },

  async requestOtp({ identifier, purpose }: OtpRequestInput): Promise<OtpChallenge> {
    // A challenge is issued whether or not the account exists, so the caller
    // learns nothing about which identifiers are registered.
    const otpId = randomId('otp');
    const code = randomCode();
    const expiresAt = Date.now() + OTP_TTL_MS;
    otps.set(otpId, { identifier, code, purpose, expiresAt });
    return {
      otpId,
      expiresAt: new Date(expiresAt).toISOString(),
      devCode: code,
    };
  },

  async verifyOtp({ otpId, code }: OtpVerifyInput): Promise<OtpVerifyResult> {
    const record = otps.get(otpId);
    if (!record || record.code !== code || record.expiresAt < Date.now()) {
      throw new AuthError('That code is invalid or has expired', 'unauthorized');
    }
    otps.delete(otpId); // single use — no replay

    const user = findByIdentifier(record.identifier);
    if (!user) throw new AuthError('That code is invalid or has expired', 'unauthorized');

    if (record.purpose === 'reset') {
      const resetToken = randomId('rst');
      resets.set(resetToken, { userId: user.id, expiresAt: Date.now() + RESET_TTL_MS });
      return { kind: 'reset', resetToken };
    }
    return { kind: 'session', user: publicUser(user) };
  },

  async resetPassword({ resetToken, newPassword }: PasswordResetInput): Promise<User> {
    const record = resets.get(resetToken);
    if (!record || record.expiresAt < Date.now()) {
      throw new AuthError('That reset link is invalid or has expired', 'unauthorized');
    }
    resets.delete(resetToken);
    const user = store.find((u) => u.id === record.userId);
    if (!user) throw new AuthError('Account not found', 'not_found');
    user.password = newPassword;
    return publicUser(user);
  },

  async getUserById(id: string): Promise<User | null> {
    const user = store.find((u) => u.id === id);
    return user ? publicUser(user) : null;
  },

  /** Used by the account resource, which shares this store. */
  async updateUser(id: string, patch: Partial<Pick<MockUser, 'name' | 'email' | 'dob' | 'password'>>): Promise<User> {
    const user = store.find((u) => u.id === id);
    if (!user) throw new AuthError('Account not found', 'not_found');
    Object.assign(user, patch);
    return publicUser(user);
  },
};

export type Auth = typeof mockAuth;
