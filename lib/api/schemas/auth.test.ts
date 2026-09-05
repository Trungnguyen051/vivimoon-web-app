import { describe, it, expect } from 'vitest';
import { identifierSchema, registerSchema, otpVerifySchema, passwordResetSchema } from './auth';

describe('identifierSchema', () => {
  it('accepts a Vietnamese mobile number', () => {
    expect(identifierSchema.parse('0912345678')).toBe('0912345678');
  });

  it('accepts +84 form', () => {
    expect(identifierSchema.parse('+84912345678')).toBe('+84912345678');
  });

  it('accepts an email', () => {
    expect(identifierSchema.parse('a@b.vn')).toBe('a@b.vn');
  });

  it('rejects a string that is neither', () => {
    expect(() => identifierSchema.parse('not-a-contact')).toThrow();
  });
});

describe('registerSchema', () => {
  it('accepts phone plus name with no password', () => {
    const r = registerSchema.parse({ identifier: '0912345678', name: 'Mai' });
    expect(r.name).toBe('Mai');
  });

  it('rejects an empty name', () => {
    expect(() => registerSchema.parse({ identifier: '0912345678', name: '' })).toThrow();
  });

  it('imposes no password complexity rule, only a minimum length', () => {
    expect(
      registerSchema.parse({
        identifier: 'a@b.vn', name: 'Mai', password: 'abcdefgh', confirmPassword: 'abcdefgh',
      }).password,
    ).toBe('abcdefgh');
    expect(() =>
      registerSchema.parse({
        identifier: 'a@b.vn', name: 'Mai', password: 'short', confirmPassword: 'short',
      }),
    ).toThrow();
  });

  it('accepts a password plus a matching confirmPassword', () => {
    const r = registerSchema.parse({
      identifier: 'a@b.vn', name: 'Mai', password: 'abcdefgh', confirmPassword: 'abcdefgh',
    });
    expect(r.password).toBe('abcdefgh');
  });

  it('rejects a password without a confirmPassword', () => {
    expect(() =>
      registerSchema.parse({ identifier: 'a@b.vn', name: 'Mai', password: 'abcdefgh' }),
    ).toThrow();
  });

  it('rejects a confirmPassword that does not match', () => {
    expect(() =>
      registerSchema.parse({
        identifier: 'a@b.vn', name: 'Mai', password: 'abcdefgh', confirmPassword: 'somethingelse',
      }),
    ).toThrow();
  });
});

describe('otpVerifySchema', () => {
  it('accepts a six-digit code', () => {
    expect(otpVerifySchema.parse({ otpId: 'o1', code: '123456' }).code).toBe('123456');
  });

  it('rejects a five-digit code', () => {
    expect(() => otpVerifySchema.parse({ otpId: 'o1', code: '12345' })).toThrow();
  });

  it('rejects a non-numeric code', () => {
    expect(() => otpVerifySchema.parse({ otpId: 'o1', code: 'abcdef' })).toThrow();
  });
});

describe('passwordResetSchema', () => {
  it('requires a reset token and a new password', () => {
    const r = passwordResetSchema.parse({ resetToken: 't', newPassword: 'abcdefgh' });
    expect(r.resetToken).toBe('t');
  });
});
