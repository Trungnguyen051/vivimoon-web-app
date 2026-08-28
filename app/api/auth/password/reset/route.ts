import { auth } from '@/lib/api/resources/auth';
import { passwordResetSchema } from '@/lib/api/schemas/auth';
import { apiOk } from '@/lib/api/response';
import { authErrorResponse, parseBody, startSession } from '@/lib/api/route-helpers';

export async function POST(request: Request) {
  const parsed = await parseBody(request, passwordResetSchema);
  if (!parsed.ok) return parsed.response;
  try {
    const user = await auth.resetPassword(parsed.data);
    await startSession(user.id);
    return apiOk({ user });
  } catch (error) {
    return authErrorResponse(error);
  }
}
