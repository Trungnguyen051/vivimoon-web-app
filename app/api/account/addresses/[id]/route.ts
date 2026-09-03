import { account } from '@/lib/api/resources/account';
import { AddressError } from '@/lib/api/resources/account/mock';
import { addressPatchSchema } from '@/lib/api/schemas/account';
import { apiOk, apiFail } from '@/lib/api/response';
import { parseBody } from '@/lib/api/route-helpers';
import { readSessionUserId } from '@/lib/auth/cookie';

function addressErrorResponse(error: unknown): Response {
  if (error instanceof AddressError) return apiFail(error.code, error.message);
  throw error;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await readSessionUserId();
  if (!userId) return apiFail('unauthorized', 'Sign in to update your address');

  const { id } = await params;
  const parsed = await parseBody(request, addressPatchSchema);
  if (!parsed.ok) return parsed.response;

  try {
    return apiOk(await account.patchAddress(userId, id, parsed.data));
  } catch (error) {
    return addressErrorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await readSessionUserId();
  if (!userId) return apiFail('unauthorized', 'Sign in to delete your address');

  const { id } = await params;
  try {
    return apiOk(await account.deleteAddress(userId, id));
  } catch (error) {
    return addressErrorResponse(error);
  }
}
