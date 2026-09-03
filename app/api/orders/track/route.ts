import { orders } from '@/lib/api/resources/orders';
import { trackingRequestSchema } from '@/lib/api/schemas/orders';
import { isAnyUpstream } from '@/lib/api/config';
import { apiOk } from '@/lib/api/response';
import { parseBody } from '@/lib/api/route-helpers';

const ACK_MESSAGE = 'If that order exists, a tracking link has been sent to the email on file.';

export async function POST(request: Request) {
  const parsed = await parseBody(request, trackingRequestSchema);
  if (!parsed.ok) return parsed.response;

  const { devLink } = await orders.requestTracking(parsed.data.code, parsed.data.email);

  // devLink is a local convenience — strip it the moment anything is live, or
  // in any production build, same posture as auth's devCode.
  if (isAnyUpstream() || process.env.NODE_ENV === 'production' || !devLink) {
    return apiOk({ message: ACK_MESSAGE });
  }
  return apiOk({ message: ACK_MESSAGE, devLink });
}
