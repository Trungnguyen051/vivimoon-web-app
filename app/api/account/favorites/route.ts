import { account } from '@/lib/api/resources/account';
import { favoriteCreateSchema } from '@/lib/api/schemas/account';
import { apiOk, apiFail } from '@/lib/api/response';
import { parseBody } from '@/lib/api/route-helpers';
import { readSessionUserId } from '@/lib/auth/cookie';

export async function GET() {
  const userId = await readSessionUserId();
  if (!userId) return apiFail('unauthorized', 'Sign in to view your favorites');
  return apiOk(await account.listFavorites(userId));
}

export async function POST(request: Request) {
  const userId = await readSessionUserId();
  if (!userId) return apiFail('unauthorized', 'Sign in to favorite a product');

  const parsed = await parseBody(request, favoriteCreateSchema);
  if (!parsed.ok) return parsed.response;

  return apiOk(await account.addFavorite(userId, parsed.data.productId));
}
