import { account } from '@/lib/api/resources/account';
import { accountPatchSchema } from '@/lib/api/schemas/account';
import { apiOk, apiFail } from '@/lib/api/response';
import { authErrorResponse, endSession, parseBody } from '@/lib/api/route-helpers';
import { readSessionUserId } from '@/lib/auth/cookie';

export async function GET() {
  const userId = await readSessionUserId();
  if (!userId) return apiFail('unauthorized', 'Sign in to view your account');
  try {
    return apiOk(await account.get(userId));
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function PATCH(request: Request) {
  const userId = await readSessionUserId();
  if (!userId) return apiFail('unauthorized', 'Sign in to update your account');

  // Unknown keys — `phone` among them — are stripped by the schema, so an
  // attempt to change the immutable field simply has no effect.
  const parsed = await parseBody(request, accountPatchSchema);
  if (!parsed.ok) return parsed.response;

  try {
    return apiOk(await account.update(userId, parsed.data));
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function DELETE(request: Request) {
  const userId = await readSessionUserId();
  if (!userId) return apiFail('unauthorized', 'Sign in to delete your account');
  // Re-authenticate: a borrowed device or stolen cookie must not be enough to wipe an account.
  const body: unknown = await request.json().catch(() => ({}));
  const currentPassword = typeof (body as { currentPassword?: unknown })?.currentPassword === 'string'
    ? (body as { currentPassword: string }).currentPassword
    : undefined;
  try {
    await account.delete(userId, currentPassword);
  } catch (error) {
    return authErrorResponse(error);
  }
  await endSession();
  return apiOk({ ok: true });
}
