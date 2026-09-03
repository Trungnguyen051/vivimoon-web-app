import { account } from '@/lib/api/resources/account';
import { apiOk, apiFail } from '@/lib/api/response';
import { readSessionUserId } from '@/lib/auth/cookie';

export async function DELETE(_request: Request, { params }: { params: Promise<{ productId: string }> }) {
  const userId = await readSessionUserId();
  if (!userId) return apiFail('unauthorized', 'Sign in to unfavorite a product');

  const { productId } = await params;
  return apiOk(await account.removeFavorite(userId, productId));
}
