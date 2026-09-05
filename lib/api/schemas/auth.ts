import { z } from 'zod';

/** Vietnamese mobile: local 0-prefixed 9 digits, or +84 international form. */
const VN_PHONE = /^(0\d{9}|\+84\d{9})$/;

export const identifierSchema = z
  .string()
  .trim()
  .refine(
    (v) => VN_PHONE.test(v) || z.string().email().safeParse(v).success,
    'Enter a valid phone number or email address',
  );

export function isPhone(identifier: string): boolean {
  return VN_PHONE.test(identifier);
}

/**
 * Canonical form for phone comparisons — `+84912345678` and `0912345678` are
 * the same number, but a strict string match would treat them as different.
 * A no-op for anything that isn't `+84`-prefixed (emails included), so it's
 * safe to apply to either side of an identifier match unconditionally.
 */
export function normalizePhone(identifier: string): string {
  return identifier.startsWith('+84') ? `0${identifier.slice(3)}` : identifier;
}

export const userSchema = z.object({
  id: z.string(),
  phone: z.string(),
  email: z.string().email().optional(),
  name: z.string(),
  dob: z.string().optional(),
  avatarUrl: z.string().optional(),
  createdAt: z.string(),
});

/**
 * No password complexity rules, per the client checklist — only a minimum
 * length, without which the field is not a password at all.
 */
const passwordSchema = z.string().min(8, 'Use at least 8 characters');

export const registerSchema = z
  .object({
    identifier: identifierSchema,
    name: z.string().trim().min(1, 'Enter your name'),
    password: passwordSchema.optional(),
    confirmPassword: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.password === undefined) return;
    if (v.confirmPassword === undefined) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['confirmPassword'], message: 'Confirm your password' });
    } else if (v.confirmPassword !== v.password) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['confirmPassword'], message: 'Passwords do not match' });
    }
  });

export const loginSchema = z.object({
  identifier: identifierSchema,
  password: z.string().min(1, 'Enter your password'),
});

export const googleLoginSchema = z.object({ idToken: z.string().min(1) });

export const otpPurposeSchema = z.enum(['signup', 'login', 'reset']);

export const otpRequestSchema = z.object({
  identifier: identifierSchema,
  purpose: otpPurposeSchema,
});

export const otpChallengeSchema = z.object({
  otpId: z.string(),
  expiresAt: z.string(),
  /** Mock mode only — the code that would have been sent. Never set upstream. */
  devCode: z.string().optional(),
});

export const otpVerifySchema = z.object({
  otpId: z.string().min(1),
  code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code'),
});

export const otpVerifyResultSchema = z.union([
  z.object({ kind: z.literal('session'), user: userSchema }),
  z.object({ kind: z.literal('reset'), resetToken: z.string() }),
]);

export const passwordResetSchema = z.object({
  resetToken: z.string().min(1),
  newPassword: passwordSchema,
});

export const sessionSchema = z.object({ user: userSchema.nullable() });

export type User = z.infer<typeof userSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type OtpPurpose = z.infer<typeof otpPurposeSchema>;
export type OtpRequestInput = z.infer<typeof otpRequestSchema>;
export type OtpChallenge = z.infer<typeof otpChallengeSchema>;
export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;
export type OtpVerifyResult = z.infer<typeof otpVerifyResultSchema>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
