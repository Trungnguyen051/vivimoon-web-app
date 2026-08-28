import { auth } from '@/lib/api/resources/auth';
import { otpRequestSchema } from '@/lib/api/schemas/auth';
import { apiOk } from '@/lib/api/response';
import { authErrorResponse, parseBody } from '@/lib/api/route-helpers';
import { isAnyUpstream } from '@/lib/api/config';

export async function POST(request: Request) {
  const parsed = await parseBody(request, otpRequestSchema);
  if (!parsed.ok) return parsed.response;
  try {
    const challenge = await auth.requestOtp(parsed.data);
    // devCode is a local convenience. Strip it the moment anything is live, or
    // in any production build regardless of mode — the default mock config
    // must never leak a real OTP code if this ever runs somewhere public.
    if (isAnyUpstream() || process.env.NODE_ENV === 'production') {
      const { devCode: _devCode, ...rest } = challenge;
      return apiOk(rest);
    }
    return apiOk(challenge);
  } catch (error) {
    return authErrorResponse(error);
  }
}
