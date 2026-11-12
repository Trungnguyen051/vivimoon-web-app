import { support } from '@/lib/api/resources/support';
import { guideFeedbackSchema } from '@/lib/api/schemas/support';
import { apiFail, apiOk } from '@/lib/api/response';
import { parseBody } from '@/lib/api/route-helpers';

/**
 * Whether a Guide helped (#124).
 *
 * `parseBody` answers a non-JSON body, a malformed one and a missing field with the
 * standard 400 envelope, so this only has to record what survived it.
 *
 * Two deliberate departures from spec #118, ratified in #159. The path is
 * `/api/support/guide-feedback` rather than `/api/support/feedback`, because feedback
 * on a Guide is not the only feedback this storefront will ever take and a generic path
 * would have to be narrowed later. And the spec said this "always returns a success
 * envelope"; it does not, for the reason below — but the UI treats the failure as its
 * own problem rather than the reader's, which is the part the spec was protecting.
 */
export async function POST(request: Request) {
  const parsed = await parseBody(request, guideFeedbackSchema);
  if (!parsed.ok) return parsed.response;

  /* Resolved, not trusted. The stored vote is the entire point of this endpoint, and
     one against a slug nobody authored — a renamed guide, a typo in a future caller —
     can never be attributed to anything. Same shape as the product reviews route. */
  const guide = await support.getGuideBySlug(parsed.data.guideSlug);
  if (!guide) return apiFail('not_found', `No guide with slug "${parsed.data.guideSlug}"`);

  return apiOk(await support.recordGuideFeedback(parsed.data));
}
