import { auth } from '@/lib/api/resources/auth';
import { registerSchema } from '@/lib/api/schemas/auth';
import { apiOk } from '@/lib/api/response';
import { authErrorResponse, parseBody } from '@/lib/api/route-helpers';
import { isAnyUpstream } from '@/lib/api/config';

// No session here: registration only issues the `signup` challenge; verify starts the session.
export async function POST(request: Request) {
  const parsed = await parseBody(request, registerSchema);
  if (!parsed.ok) return parsed.response;
  try {
    const challenge = await auth.register(parsed.data);
    // Same devCode rule as otp/request.
    if (isAnyUpstream() || process.env.NODE_ENV === 'production') {
      const { devCode: _devCode, ...rest } = challenge;
      return apiOk(rest);
    }
    return apiOk(challenge);
  } catch (error) {
    return authErrorResponse(error);
  }
}
