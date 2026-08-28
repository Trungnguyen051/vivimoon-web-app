import { catalog } from '@/lib/api/resources/catalog';
import { apiOk, apiFail } from '@/lib/api/response';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const collection = await catalog.getCollection(slug);
  if (!collection) return apiFail('not_found', `No collection with slug "${slug}"`);
  return apiOk(collection);
}
