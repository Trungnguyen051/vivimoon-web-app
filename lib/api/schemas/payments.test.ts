import { describe, it, expect } from 'vitest';
import { paymentIntentSchema } from './payments';

const BASE = { id: 'pi-1', method: 'qr' as const, status: 'pending' as const };

describe('paymentIntentSchema', () => {
  it('accepts an intent with only qrCode', () => {
    expect(paymentIntentSchema.safeParse({ ...BASE, qrCode: 'abc' }).success).toBe(true);
  });

  it('accepts an intent with only redirectUrl', () => {
    expect(paymentIntentSchema.safeParse({ ...BASE, redirectUrl: 'https://pay.example/x' }).success).toBe(true);
  });

  it('rejects an intent with neither qrCode nor redirectUrl — the UI has nothing to branch on', () => {
    expect(paymentIntentSchema.safeParse({ ...BASE }).success).toBe(false);
  });

  it('rejects an intent with both qrCode and redirectUrl — the branch would be ambiguous', () => {
    expect(
      paymentIntentSchema.safeParse({ ...BASE, qrCode: 'abc', redirectUrl: 'https://pay.example/x' }).success,
    ).toBe(false);
  });
});
