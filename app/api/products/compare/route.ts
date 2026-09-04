import { discovery } from '@/lib/api/resources/discovery';
import { compareRequestSchema } from '@/lib/api/schemas/catalog';
import { apiOk } from '@/lib/api/response';
import { parseBody } from '@/lib/api/route-helpers';

export async function POST(request: Request) {
  const parsed = await parseBody(request, compareRequestSchema);
  if (!parsed.ok) return parsed.response;

  return apiOk(await discovery.compare(parsed.data.productIds));
}
