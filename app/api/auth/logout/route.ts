import { apiOk } from '@/lib/api/response';
import { endSession } from '@/lib/api/route-helpers';

export async function POST() {
  await endSession();
  return apiOk({ ok: true });
}
