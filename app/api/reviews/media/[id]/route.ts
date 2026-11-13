import { catalog } from '@/lib/api/resources/catalog';
import { apiFail } from '@/lib/api/response';
import { readSessionUserId } from '@/lib/auth/cookie';

/**
 * Serves an uploaded Review photo or video. Public only once its Review is approved (Review Moderation);
 * before that only its uploader sees it, so the route can't serve unmoderated files to anyone.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const media = await catalog.getReviewMedia(id);
  const isPublic = media ? await catalog.isReviewMediaPublic(id) : false;
  if (!media || (!isPublic && media.userId !== (await readSessionUserId()))) return apiFail('not_found', 'Media not found');
  return new Response(media.bytes as BodyInit, {
    headers: {
      'content-type': media.contentType,
      'content-length': String(media.bytes.length),
      // Private until approved, so a shared cache never holds an unmoderated file.
      'cache-control': isPublic ? 'public, max-age=31536000, immutable' : 'private, no-store',
      'x-content-type-options': 'nosniff',
    },
  });
}
