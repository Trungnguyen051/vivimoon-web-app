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

export const registerSchema = z.object({
  identifier: identifierSchema,
  name: z.string().trim().min(1, 'Enter your name'),
  password: passwordSchema.optional(),
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
