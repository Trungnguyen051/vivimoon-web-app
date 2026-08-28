import { catalog } from '@/lib/api/resources/catalog';
import { apiOk } from '@/lib/api/response';

export async function GET() {
  return apiOk(await catalog.listCollections());
}
