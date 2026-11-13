import { auth } from '@/lib/api/resources/auth';
import { loyalty } from '@/lib/api/resources/loyalty';
import { orders } from '@/lib/api/resources/orders';
import { otpVerifySchema } from '@/lib/api/schemas/auth';
import { apiOk } from '@/lib/api/response';
import { authErrorResponse, parseBody, startSession } from '@/lib/api/route-helpers';

export async function POST(request: Request) {
  const parsed = await parseBody(request, otpVerifySchema);
  if (!parsed.ok) return parsed.response;
  try {
    const result = await auth.verifyOtp(parsed.data);
    // A `reset` challenge proves the identifier, not the password: it hands back
    // a one-time reset token and deliberately does not sign anyone in.
    if (result.kind === 'session') {
      await startSession(result.user.id);
      // An account's phone is one it verified at sign-up (ADR-0021) and can't change; social accounts have none.
      // Claiming clears the Held Points, so a later OTP sign-in credits nothing twice (ADR-0024).
      // Guest orders with that phone join the account at the same moment, once and for good (ADR-0026).
      // A failure here must not report a sign-in that succeeded as failed; what's left waits for the next one.
      const { phone, id } = result.user;
      if (phone) await Promise.allSettled([loyalty.claimHeld(phone, id), orders.joinGuestOrders(phone, id)]);
    }
    return apiOk(result);
  } catch (error) {
    return authErrorResponse(error);
  }
}
