import { catalog } from '@/lib/api/resources/catalog';
import { apiOk, apiFail } from '@/lib/api/response';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const product = await catalog.getProductBySlug(slug);
  if (!product) return apiFail('not_found', `No product with slug "${slug}"`);
  return apiOk(await catalog.getReviews(product.id));
}
