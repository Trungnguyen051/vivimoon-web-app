import { auth } from '@/lib/api/resources/auth';
import { appleLoginSchema } from '@/lib/api/schemas/auth';
import { apiFail, apiOk } from '@/lib/api/response';
import { authErrorResponse, parseBody, startSession } from '@/lib/api/route-helpers';

export async function POST(request: Request) {
  // The mock reads the token as a bare email and verifies nothing, so in any
  // production build it would hand a session to whoever names an address.
  if (process.env.NODE_ENV === 'production') {
    return apiFail('unauthorized', 'Apple sign-in is not available');
  }
  const parsed = await parseBody(request, appleLoginSchema);
  if (!parsed.ok) return parsed.response;
  try {
    const user = await auth.loginWithApple(parsed.data.idToken);
    await startSession(user.id);
    return apiOk({ user });
  } catch (error) {
    return authErrorResponse(error);
  }
}
