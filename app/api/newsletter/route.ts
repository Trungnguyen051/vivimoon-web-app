import { newsletter } from '@/lib/api/resources/newsletter';
import { subscribeRequestSchema } from '@/lib/api/schemas/newsletter';
import { apiOk } from '@/lib/api/response';
import { parseBody } from '@/lib/api/route-helpers';

/**
 * The weekly digest sign-up (#132).
 *
 * `parseBody` already answers a non-JSON body, a malformed one and a missing field with
 * the standard 400 envelope, naming the field — which is what lets the form show the
 * reason beside the input rather than inventing its own copy.
 */
export async function POST(request: Request) {
  const parsed = await parseBody(request, subscribeRequestSchema);
  if (!parsed.ok) return parsed.response;

  return apiOk(await newsletter.subscribe(parsed.data));
}
