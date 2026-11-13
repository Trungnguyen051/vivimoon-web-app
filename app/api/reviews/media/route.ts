import { catalog } from '@/lib/api/resources/catalog';
import { REVIEW_MEDIA_LIMITS } from '@/lib/api/schemas/catalog';
import { apiOk, apiFail } from '@/lib/api/response';
import { readSessionUserId } from '@/lib/auth/cookie';
import { mp4DurationSeconds, sniffMediaType } from '@/lib/products/review-media';

const { image, video } = REVIEW_MEDIA_LIMITS;
// The field says which rule failed (`file.type`, `file.size`, `file.duration`), so the form can word it in the shopper's language.
const fail = (message: string, field = 'file') => apiFail('validation_failed', message, { field });

/**
 * One photo or video for a Review the member is writing (#228), as multipart `file`. Type, size and
 * length are checked here, not just in the browser: this is the trust boundary.
 */
export async function POST(request: Request) {
  const userId = await readSessionUserId();
  if (!userId) return apiFail('unauthorized', 'Sign in to upload');

  // Refuse an oversized or unsized body before buffering it; the per-type caps below are the real rule.
  // Browsers always send a length with a FormData upload, so a missing one is refused rather than read unbounded.
  const length = Number(request.headers.get('content-length'));
  if (!length) return fail('Send the upload with a Content-Length');
  if (length > video.maxBytes + 1024 * 1024) return fail('A video can be up to 50 MB', 'file.size');

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail('Expected a multipart body with one file');
  }
  const files = form.getAll('file');
  const [file] = files;
  if (files.length !== 1 || typeof file === 'string') return fail('Send exactly one file');

  const bytes = new Uint8Array(await file.arrayBuffer());
  const contentType = sniffMediaType(bytes);
  const type = (image.types as readonly string[]).includes(contentType ?? '') ? 'image' : contentType === 'video/mp4' ? 'video' : null;
  if (!type || !contentType) return fail('Only jpg, png, webp or mp4 files', 'file.type');

  if (type === 'image' && bytes.length > image.maxBytes) return fail('A photo can be up to 5 MB', 'file.size');
  if (type === 'video') {
    if (bytes.length > video.maxBytes) return fail('A video can be up to 50 MB', 'file.size');
    const seconds = mp4DurationSeconds(bytes);
    if (seconds !== null && seconds > video.maxSeconds) return fail('A video can be up to 30 seconds', 'file.duration');
  }

  const saved = await catalog.saveReviewMedia(userId, type, contentType, bytes);
  if (!saved) return apiFail('conflict', 'Too many uploads. Send or delete a review first');
  return apiOk(saved, { status: 201 });
}
