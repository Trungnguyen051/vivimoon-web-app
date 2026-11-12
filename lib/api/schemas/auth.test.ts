import { describe, it, expect } from 'vitest';
import { identifierSchema, registerSchema, otpVerifySchema, passwordResetSchema, normalizePhone } from './auth';

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

describe('normalizePhone', () => {
  it('collapses the +84 form to its 0-prefixed equivalent', () => {
    expect(normalizePhone('+84912345678')).toBe('0912345678');
  });

  it('leaves an already 0-prefixed number unchanged', () => {
    expect(normalizePhone('0912345678')).toBe('0912345678');
  });

  it('is a no-op for an email', () => {
    expect(normalizePhone('a@b.vn')).toBe('a@b.vn');
  });

  it('makes the two accepted formats of the same number compare equal', () => {
    expect(normalizePhone('+84912345678')).toBe(normalizePhone('0912345678'));
  });
});

describe('registerSchema', () => {
  const ok = { phone: '0912345678', name: 'Mai', password: 'abcdefgh' };

  it('accepts name, phone and a password', () => {
    expect(registerSchema.parse(ok).phone).toBe('0912345678');
  });

  it('requires the password, at least 8 characters', () => {
    expect(() => registerSchema.parse({ ...ok, password: undefined })).toThrow();
    expect(() => registerSchema.parse({ ...ok, password: 'short' })).toThrow();
  });

  it('rejects an empty name and an email in place of the phone', () => {
    expect(() => registerSchema.parse({ ...ok, name: '' })).toThrow();
    expect(() => registerSchema.parse({ ...ok, phone: 'a@b.vn' })).toThrow();
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
