import { describe, it, expect } from 'vitest';
import { checkoutSchema } from './schema';

const VALID = {
  recipient: 'Alice Nguyen',
  email: 'a@b.com',
  phone: '0900000000',
  line1: '1 Le Loi',
  ward: 'Ben Nghe',
  district: 'District 1',
  province: 'Ho Chi Minh City',
  label: 'home',
};

describe('checkoutSchema', () => {
  it('accepts a valid Vietnamese address', () => {
    const r = checkoutSchema.safeParse(VALID);
    expect(r.success, JSON.stringify(r.success ? null : r.error.issues)).toBe(true);
  });

  it('rejects invalid email', () => {
    const r = checkoutSchema.safeParse({ ...VALID, email: 'bad' });
    expect(r.success).toBe(false);
  });

  it('rejects a malformed VN phone number', () => {
    const r = checkoutSchema.safeParse({ ...VALID, phone: '123' });
    expect(r.success).toBe(false);
  });

  it('accepts a +84 international phone number', () => {
    const r = checkoutSchema.safeParse({ ...VALID, phone: '+84900000000' });
    expect(r.success).toBe(true);
  });

  it('rejects a missing ward', () => {
    const withoutWard: Record<string, unknown> = { ...VALID };
    delete withoutWard.ward;
    const r = checkoutSchema.safeParse(withoutWard);
    expect(r.success).toBe(false);
  });

  it('has no city field', () => {
    expect(checkoutSchema.innerType().shape).not.toHaveProperty('city');
  });

  // ADR-0025: email is optional; the notification channel carries the confirmation.
  it('accepts no email, or an empty one, and defaults the channel to Zalo', () => {
    const { email: _email, ...noEmail } = VALID;
    const r = checkoutSchema.safeParse(noEmail);
    expect(r.success && r.data.notificationChannel).toBe('zalo');
    expect(checkoutSchema.safeParse({ ...VALID, email: '' }).success).toBe(true);
  });

  it('needs an email when the channel is email', () => {
    expect(checkoutSchema.safeParse({ ...VALID, email: '', notificationChannel: 'email' }).success).toBe(false);
    expect(checkoutSchema.safeParse({ ...VALID, notificationChannel: 'email' }).success).toBe(true);
  });
});
