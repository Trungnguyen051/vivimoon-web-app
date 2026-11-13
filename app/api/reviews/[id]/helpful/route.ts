import { catalog } from '@/lib/api/resources/catalog';
import { apiOk, apiFail } from '@/lib/api/response';
import { readSessionUserId } from '@/lib/auth/cookie';

type Ctx = { params: Promise<{ id: string }> };

/** A Helpful Vote: POST casts it, DELETE takes it back. Both are idempotent. */
async function setVote({ params }: Ctx, on: boolean) {
  const userId = await readSessionUserId();
  if (!userId) return apiFail('unauthorized', 'Sign in to vote on a review');
  const { id } = await params;
  const result = await catalog.setHelpfulVote(id, userId, on);
  if (result === 'not_found') return apiFail('not_found', `No review with id "${id}"`);
  if (result === 'own_review') return apiFail('conflict', 'You cannot vote on your own review');
  return apiOk(result);
}

export const POST = (_request: Request, ctx: Ctx) => setVote(ctx, true);
export const DELETE = (_request: Request, ctx: Ctx) => setVote(ctx, false);
