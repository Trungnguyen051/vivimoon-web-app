import { catalog } from '@/lib/api/resources/catalog';
import { productQuerySchema } from '@/lib/api/schemas/catalog';
import { apiOk, apiFail } from '@/lib/api/response';

/** `GET /api/search/suggest?q=` — what the Search panel shows while typing (#260). */
export async function GET(request: Request) {
  const parsed = productQuerySchema.shape.q.safeParse(new URL(request.url).searchParams.get('q') ?? '');
  if (!parsed.success || parsed.data === undefined) {
    return apiFail('validation_failed', 'q must be 1 to 80 characters', { field: 'q' });
  }
  return apiOk(await catalog.searchSuggestions(parsed.data));
}
