import { describe, it, expect } from 'vitest';
import { maskEmail, maskPhone } from './mask-contact';

describe('maskPhone', () => {
  it('keeps the first four and last three digits, as the wireframe shows', () => {
    expect(maskPhone('0912345678')).toBe('0912 *** 678');
  });

  it('ignores spaces, dots and a +84 prefix written by hand', () => {
    expect(maskPhone('0912 345.678')).toBe('0912 *** 678');
    expect(maskPhone('+84912345678')).toBe('+849 *** 678');
  });

  it('hides a number too short to keep both ends', () => {
    expect(maskPhone('12345')).toBe('***');
  });
});

describe('maskEmail', () => {
  it('keeps the first letter and the domain', () => {
    expect(maskEmail('mai.nguyen@example.vn')).toBe('m***@example.vn');
  });

  it('hides anything that is not an address', () => {
    expect(maskEmail('not-an-email')).toBe('***');
  });
});
