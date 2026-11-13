import { catalog } from '@/lib/api/resources/catalog';
import { apiOk, apiFail } from '@/lib/api/response';
import { readSessionUserId } from '@/lib/auth/cookie';

/** A member deletes their own Review, at any time; the line can then be reviewed again. */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await readSessionUserId();
  if (!userId) return apiFail('unauthorized', 'Sign in to delete a review');

  const { id } = await params;
  // Someone else's Review answers like a missing one.
  if (!(await catalog.deleteReview(id, userId))) return apiFail('not_found', 'Review not found');
  return apiOk({ id });
}
