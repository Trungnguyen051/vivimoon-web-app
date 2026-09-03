import { vouchers } from '@/lib/api/resources/vouchers';
import { apiOk, apiFail } from '@/lib/api/response';
import { readSessionUserId } from '@/lib/auth/cookie';

export async function GET() {
  const userId = await readSessionUserId();
  if (!userId) return apiFail('unauthorized', 'Sign in to view your vouchers');
  return apiOk(await vouchers.listActive());
}
