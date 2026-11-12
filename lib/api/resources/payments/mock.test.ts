import { describe, it, expect } from 'vitest';
import { mockPayments, PaymentError } from './mock';

describe('mockPayments.createIntent', () => {
  it('returns a qrCode payload for QR Pay', async () => {
    const intent = await mockPayments.createIntent({ method: 'qr' });
    expect(intent.method).toBe('qr');
    expect(intent.status).toBe('pending');
    expect(intent.qrCode).toBeTruthy();
    expect(intent.redirectUrl).toBeUndefined();
  });

  it('returns a redirectUrl for the e-wallet', async () => {
    const intent = await mockPayments.createIntent({ method: 'ewallet' });
    expect(intent.redirectUrl).toBeTruthy();
    expect(intent.qrCode).toBeUndefined();
  });

  it('gives each intent a distinct id', async () => {
    const a = await mockPayments.createIntent({ method: 'qr' });
    const b = await mockPayments.createIntent({ method: 'qr' });
    expect(a.id).not.toBe(b.id);
  });

  it('rejects COD, which has no intent, with a typed not_found error', async () => {
    await expect(
      mockPayments.createIntent({ method: 'cod' as unknown as 'qr' }),
    ).rejects.toMatchObject({ code: 'not_found' });
    await expect(
      mockPayments.createIntent({ method: 'cod' as unknown as 'qr' }),
    ).rejects.toBeInstanceOf(PaymentError);
  });
});
