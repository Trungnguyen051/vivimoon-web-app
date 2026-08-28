import { auth } from '@/lib/api/resources/auth';
import { loginSchema } from '@/lib/api/schemas/auth';
import { apiOk } from '@/lib/api/response';
import { authErrorResponse, parseBody, startSession } from '@/lib/api/route-helpers';

export async function POST(request: Request) {
  const parsed = await parseBody(request, loginSchema);
  if (!parsed.ok) return parsed.response;
  try {
    const user = await auth.login(parsed.data);
    await startSession(user.id);
    return apiOk({ user });
  } catch (error) {
    return authErrorResponse(error);
  }
}
