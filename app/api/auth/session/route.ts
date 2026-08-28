import { auth } from '@/lib/api/resources/auth';
import { apiOk } from '@/lib/api/response';
import { readSessionUserId } from '@/lib/auth/cookie';

export async function GET() {
  const userId = await readSessionUserId();
  const user = userId ? await auth.getUserById(userId) : null;
  return apiOk({ user });
}
