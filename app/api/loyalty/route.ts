import { loyalty } from '@/lib/api/resources/loyalty';
import { apiOk, apiFail } from '@/lib/api/response';
import { readSessionUserId } from '@/lib/auth/cookie';

export async function GET() {
  const userId = await readSessionUserId();
  if (!userId) return apiFail('unauthorized', 'Sign in to view your loyalty balance');
  return apiOk(await loyalty.get(userId));
}
