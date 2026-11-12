import { users as seedUsers, type MockUser } from '@/content/mock';
import { normalizePhone, type LoginInput, type OtpChallenge, type OtpPurpose, type OtpRequestInput, type OtpVerifyInput, type OtpVerifyResult, type PasswordResetInput, type RegisterInput, type User } from '@/lib/api/schemas/auth';

/** Thrown by the mock so route handlers can map to an error code. */
export class AuthError extends Error {
  constructor(message: string, readonly code: 'unauthorized' | 'conflict' | 'not_found') {
    super(message);
    this.name = 'AuthError';
  }
}

interface OtpRecord { identifier: string; code: string; purpose: OtpPurpose; expiresAt: number; attempts: number }
interface ResetRecord { userId: string; expiresAt: number }

// In-memory state. Resets on every server restart, which is correct for a mock.
let store: MockUser[] = seedUsers.map((u) => ({ ...u }));
const otps = new Map<string, OtpRecord>();
const resets = new Map<string, ResetRecord>();
/** Registrations awaiting their OTP, by challenge id (so a second register for the same phone cannot swap the first one's password). Not accounts until verified (ADR-0021). */
const pendingSignups = new Map<string, RegisterInput>();

/** Test helper — restores the fixture state between cases. */
export function resetMockAuthState(): void {
  store = seedUsers.map((u) => ({ ...u }));
  otps.clear();
  resets.clear();
  pendingSignups.clear();
}

const OTP_TTL_MS = 5 * 60 * 1000;
const RESET_TTL_MS = 15 * 60 * 1000;
/** Wrong codes a challenge survives; six digits fall to an unlimited guesser. */
const OTP_MAX_ATTEMPTS = 5;

function publicUser(u: MockUser): User {
  const { password, ...rest } = u;
  return { ...rest, hasPassword: password !== undefined };
}

function findByIdentifier(identifier: string): MockUser | undefined {
  const v = normalizePhone(identifier.trim().toLowerCase());
  return store.find((u) => normalizePhone(u.phone) === v || u.email?.toLowerCase() === v);
}

function randomId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function randomCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export const mockAuth = {
  /** Holds the registration and issues a `signup` challenge; the account exists only once it is verified. */
  async register(input: RegisterInput): Promise<OtpChallenge> {
    if (findByIdentifier(input.phone)) {
      throw new AuthError('That phone or email is already registered', 'conflict');
    }
    const challenge = await this.requestOtp({ identifier: input.phone, purpose: 'signup' });
    pendingSignups.set(challenge.otpId, input);
    return challenge;
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
    return this.loginWithSocial(idToken);
  },

  async loginWithApple(idToken: string): Promise<User> {
    return this.loginWithSocial(idToken);
  },

  async loginWithSocial(idToken: string): Promise<User> {
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
    // A resend carries the latest registration held for that phone to the fresh challenge.
    if (purpose === 'signup') {
      const phone = normalizePhone(identifier);
      const prior = [...otps].filter(([id, r]) => r.purpose === 'signup' && normalizePhone(r.identifier) === phone && pendingSignups.has(id)).pop();
      if (prior) pendingSignups.set(otpId, pendingSignups.get(prior[0])!);
    }
    otps.set(otpId, { identifier, code, purpose, expiresAt, attempts: 0 });
    return {
      otpId,
      expiresAt: new Date(expiresAt).toISOString(),
      devCode: code,
    };
  },

  async verifyOtp({ otpId, code }: OtpVerifyInput): Promise<OtpVerifyResult> {
    const record = otps.get(otpId);
    if (record && record.code !== code && ++record.attempts >= OTP_MAX_ATTEMPTS) {
      otps.delete(otpId); // burnt — the right code no longer works either
    }
    if (!record || record.code !== code || record.expiresAt < Date.now()) {
      throw new AuthError('That code is invalid or has expired', 'unauthorized');
    }
    otps.delete(otpId); // single use — no replay

    const pending = record.purpose === 'signup' ? pendingSignups.get(otpId) : undefined;
    if (pending) {
      pendingSignups.delete(otpId);
      const created: MockUser = {
        id: randomId('u'), phone: normalizePhone(pending.phone), name: pending.name,
        createdAt: new Date().toISOString(), password: pending.password,
      };
      store.push(created);
      return { kind: 'session', user: publicUser(created) };
    }

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

  /** Needs the current password when the account has one; a social-only account has none to give. */
  async deleteUser(id: string, currentPassword?: string): Promise<void> {
    const i = store.findIndex((u) => u.id === id);
    if (i === -1) throw new AuthError('Account not found', 'not_found');
    if (store[i].password !== undefined && currentPassword !== store[i].password) {
      throw new AuthError('Your current password is incorrect', 'unauthorized');
    }
    store.splice(i, 1);
  },

  async getUserById(id: string): Promise<User | null> {
    const user = store.find((u) => u.id === id);
    return user ? publicUser(user) : null;
  },

  /**
   * Used by the account resource, which shares this store. A `password`
   * change must carry the `currentPassword` it replaces, unless there is none
   * yet (a Google-only account setting its first one).
   */
  async updateUser(
    id: string,
    { currentPassword, ...patch }: Partial<Pick<MockUser, 'name' | 'email' | 'dob' | 'password' | 'preferredPaymentMethod' | 'gender' | 'defaultRx' | 'onboardedAt'>> & { currentPassword?: string },
  ): Promise<User> {
    const user = store.find((u) => u.id === id);
    if (!user) throw new AuthError('Account not found', 'not_found');
    if (patch.email !== undefined) {
      const email = patch.email.toLowerCase();
      if (store.some((u) => u.id !== id && u.email?.toLowerCase() === email)) {
        throw new AuthError('That phone or email is already registered', 'conflict');
      }
    }
    if (patch.password !== undefined && user.password !== undefined && currentPassword !== user.password) {
      throw new AuthError('Your current password is incorrect', 'unauthorized');
    }
    Object.assign(user, patch);
    return publicUser(user);
  },
};

export type Auth = typeof mockAuth;
