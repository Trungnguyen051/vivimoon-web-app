import { describe, it, expect, beforeEach } from 'vitest';
import { mockAuth, resetMockAuthState } from './mock';

describe('mockAuth', () => {
  beforeEach(() => { resetMockAuthState(); });

  it('logs in with a known phone and password', async () => {
    const user = await mockAuth.login({ identifier: '0912345678', password: 'vivimoon123' });
    expect(user.name).toBe('Nguyễn Thị Mai');
  });

  it('logs in by email as well as phone', async () => {
    const user = await mockAuth.login({ identifier: 'mai@example.vn', password: 'vivimoon123' });
    expect(user.id).toBe('u-001');
  });

  it('rejects a wrong password', async () => {
    await expect(mockAuth.login({ identifier: '0912345678', password: 'nope' })).rejects.toThrow(/invalid/i);
  });

  it('rejects an unknown identifier with the same message as a wrong password', async () => {
    // Identical wording both ways, so the form cannot be used to enumerate accounts.
    const unknown = await mockAuth.login({ identifier: '0900000000', password: 'x' }).catch((e) => e.message);
    const wrong = await mockAuth.login({ identifier: '0912345678', password: 'x' }).catch((e) => e.message);
    expect(unknown).toBe(wrong);
  });

  it('registers into a pending signup: a challenge, and no account yet', async () => {
    const c = await mockAuth.register({ phone: '0911111111', name: 'Mới', password: 'abcdefgh' });
    expect(c.devCode).toMatch(/^\d{6}$/);
    await expect(mockAuth.login({ identifier: '0911111111', password: 'abcdefgh' })).rejects.toThrow(/invalid/i);
  });

  it('creates the account only when the signup challenge is verified', async () => {
    const c = await mockAuth.register({ phone: '+84911111112', name: 'Mới', password: 'abcdefgh' });
    const result = await mockAuth.verifyOtp({ otpId: c.otpId, code: c.devCode! });
    expect(result.kind === 'session' && result.user.phone).toBe('0911111112');
    expect((await mockAuth.login({ identifier: '0911111112', password: 'abcdefgh' })).name).toBe('Mới');
  });

  it('verifying a challenge creates the account submitted with that challenge, not a later registration for the same phone', async () => {
    const a = await mockAuth.register({ phone: '0911111114', name: 'A', password: 'password-A1' });
    await mockAuth.register({ phone: '0911111114', name: 'B', password: 'password-B1' });
    await mockAuth.verifyOtp({ otpId: a.otpId, code: a.devCode! });
    expect((await mockAuth.login({ identifier: '0911111114', password: 'password-A1' })).name).toBe('A');
    await expect(mockAuth.login({ identifier: '0911111114', password: 'password-B1' })).rejects.toThrow(/invalid/i);
  });

  it('a resend (registering again) verifies with the same details', async () => {
    await mockAuth.register({ phone: '0911111113', name: 'Mới', password: 'abcdefgh' });
    const again = await mockAuth.register({ phone: '0911111113', name: 'Mới', password: 'abcdefgh' });
    expect((await mockAuth.verifyOtp({ otpId: again.otpId, code: again.devCode! })).kind).toBe('session');
  });

  it('a bare signup OTP for a pending phone carries no registration and cannot create the account', async () => {
    await mockAuth.register({ phone: '0911111115', name: 'Victim', password: 'abcdefgh' });
    const bare = await mockAuth.requestOtp({ identifier: '0911111115', purpose: 'signup' });
    await expect(mockAuth.verifyOtp({ otpId: bare.otpId, code: bare.devCode! })).rejects.toThrow();
  });

  it('refuses to register a phone already in use, in either form', async () => {
    await expect(mockAuth.register({ phone: '0912345678', name: 'Dup', password: 'abcdefgh' })).rejects.toThrow(/already/i);
    await expect(mockAuth.register({ phone: '+84912345678', name: 'Dup', password: 'abcdefgh' })).rejects.toThrow(/already/i);
  });

  it('signs in with the +84 form of a phone registered in 0-prefixed form', async () => {
    const user = await mockAuth.login({ identifier: '+84912345678', password: 'vivimoon123' });
    expect(user.id).toBe('u-001');
  });

  it('issues an OTP challenge carrying a dev code in mock mode', async () => {
    const c = await mockAuth.requestOtp({ identifier: '0912345678', purpose: 'reset' });
    expect(c.otpId).toBeTruthy();
    expect(c.devCode).toMatch(/^\d{6}$/);
  });

  it('issues a challenge for an unknown identifier too, revealing nothing', async () => {
    const c = await mockAuth.requestOtp({ identifier: '0900000000', purpose: 'reset' });
    expect(c.otpId).toBeTruthy();
  });

  it('verifies a reset OTP into a reset token', async () => {
    const c = await mockAuth.requestOtp({ identifier: '0912345678', purpose: 'reset' });
    const result = await mockAuth.verifyOtp({ otpId: c.otpId, code: c.devCode! });
    expect(result.kind).toBe('reset');
  });

  it('verifies a signup OTP into a session', async () => {
    const c = await mockAuth.requestOtp({ identifier: '0912345678', purpose: 'login' });
    const result = await mockAuth.verifyOtp({ otpId: c.otpId, code: c.devCode! });
    expect(result.kind).toBe('session');
  });

  it('rejects a wrong code', async () => {
    const c = await mockAuth.requestOtp({ identifier: '0912345678', purpose: 'reset' });
    const wrong = c.devCode === '000000' ? '111111' : '000000';
    await expect(mockAuth.verifyOtp({ otpId: c.otpId, code: wrong })).rejects.toThrow(/invalid|expired/i);
  });

  it('burns a challenge after five wrong codes, so the right one no longer works', async () => {
    const c = await mockAuth.requestOtp({ identifier: '0912345678', purpose: 'reset' });
    const wrong = c.devCode === '000000' ? '111111' : '000000';
    for (let i = 0; i < 5; i++) {
      await expect(mockAuth.verifyOtp({ otpId: c.otpId, code: wrong })).rejects.toThrow(/invalid|expired/i);
    }
    await expect(mockAuth.verifyOtp({ otpId: c.otpId, code: c.devCode! })).rejects.toThrow(/invalid|expired/i);
  });

  it('still accepts the right code after fewer than five wrong ones', async () => {
    const c = await mockAuth.requestOtp({ identifier: '0912345678', purpose: 'login' });
    const wrong = c.devCode === '000000' ? '111111' : '000000';
    for (let i = 0; i < 4; i++) {
      await expect(mockAuth.verifyOtp({ otpId: c.otpId, code: wrong })).rejects.toThrow();
    }
    expect((await mockAuth.verifyOtp({ otpId: c.otpId, code: c.devCode! })).kind).toBe('session');
  });

  it('consumes an OTP so it cannot be replayed', async () => {
    const c = await mockAuth.requestOtp({ identifier: '0912345678', purpose: 'reset' });
    await mockAuth.verifyOtp({ otpId: c.otpId, code: c.devCode! });
    await expect(mockAuth.verifyOtp({ otpId: c.otpId, code: c.devCode! })).rejects.toThrow(/invalid|expired/i);
  });

  it('resets a password and lets the new one log in', async () => {
    const c = await mockAuth.requestOtp({ identifier: '0912345678', purpose: 'reset' });
    const result = await mockAuth.verifyOtp({ otpId: c.otpId, code: c.devCode! });
    if (result.kind !== 'reset') throw new Error('expected a reset token');
    await mockAuth.resetPassword({ resetToken: result.resetToken, newPassword: 'brandnew1' });
    const user = await mockAuth.login({ identifier: '0912345678', password: 'brandnew1' });
    expect(user.id).toBe('u-001');
  });
});
