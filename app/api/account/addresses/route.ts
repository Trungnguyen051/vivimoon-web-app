import { account } from '@/lib/api/resources/account';
import { addressCreateSchema } from '@/lib/api/schemas/account';
import { apiOk, apiFail } from '@/lib/api/response';
import { parseBody } from '@/lib/api/route-helpers';
import { readSessionUserId } from '@/lib/auth/cookie';

export async function GET() {
  const userId = await readSessionUserId();
  if (!userId) return apiFail('unauthorized', 'Sign in to view your addresses');
  return apiOk(await account.listAddresses(userId));
}

export async function POST(request: Request) {
  const userId = await readSessionUserId();
  if (!userId) return apiFail('unauthorized', 'Sign in to add an address');

  const parsed = await parseBody(request, addressCreateSchema);
  if (!parsed.ok) return parsed.response;

  return apiOk(await account.addAddress(userId, parsed.data));
}
