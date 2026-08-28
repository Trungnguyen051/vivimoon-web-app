import { auth } from '@/lib/api/resources/auth';
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
    if (result.kind === 'session') await startSession(result.user.id);
    return apiOk(result);
  } catch (error) {
    return authErrorResponse(error);
  }
}
