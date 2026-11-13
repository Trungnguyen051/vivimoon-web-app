import { catalog } from '@/lib/api/resources/catalog';
import { apiFail } from '@/lib/api/response';

/** Serves an uploaded Review photo or video. The reference is a random id, so it's as public as the Review it joins. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const media = await catalog.getReviewMedia((await params).id);
  if (!media) return apiFail('not_found', 'Media not found');
  return new Response(media.bytes as BodyInit, {
    headers: {
      'content-type': media.contentType,
      'content-length': String(media.bytes.length),
      'cache-control': 'public, max-age=31536000, immutable',
      'x-content-type-options': 'nosniff',
    },
  });
}
