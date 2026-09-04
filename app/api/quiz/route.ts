import { discovery } from '@/lib/api/resources/discovery';
import { apiOk } from '@/lib/api/response';

export async function GET() {
  return apiOk(await discovery.getQuizDefinition());
}
