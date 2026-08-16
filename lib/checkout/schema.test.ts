import { describe, it, expect } from 'vitest';
import { checkoutSchema } from './schema';

describe('checkoutSchema', () => {
  it('rejects invalid email', () => {
    const r = checkoutSchema.safeParse({ fullName: 'A', email: 'bad', address: 'x', city: 'y', phone: '123' });
    expect(r.success).toBe(false);
  });
  it('accepts valid input', () => {
    const r = checkoutSchema.safeParse({ fullName: 'Alice', email: 'a@b.com', address: '1 St', city: 'HN', phone: '0900000000' });
    expect(r.success).toBe(true);
  });
});
