import { catalog } from '@/lib/api/resources/catalog';
import { reviewFilterSchema } from '@/lib/api/schemas/catalog';
import { apiOk, apiFail } from '@/lib/api/response';
import { readSessionUserId } from '@/lib/auth/cookie';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const parsed = reviewFilterSchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return apiFail('validation_failed', first.message, { field: first.path.join('.') });
  }
  const product = await catalog.getProductBySlug(slug);
  if (!product) return apiFail('not_found', `No product with slug "${slug}"`);
  return apiOk(await catalog.getReviews(product.id, parsed.data, await readSessionUserId()));
}
