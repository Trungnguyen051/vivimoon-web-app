import { catalog } from '@/lib/api/resources/catalog';
import { productQuerySchema } from '@/lib/api/schemas/catalog';
import { apiOk, apiFail } from '@/lib/api/response';

export async function GET(request: Request) {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = productQuerySchema.safeParse(params);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return apiFail('validation_failed', first.message, { field: first.path.join('.') });
  }
  return apiOk(await catalog.listProducts(parsed.data));
}
