import { discovery } from '@/lib/api/resources/discovery';
import { DiscoveryError } from '@/lib/api/resources/discovery/mock';
import { quizSubmitRequestSchema } from '@/lib/api/schemas/discovery';
import { apiOk, apiFail } from '@/lib/api/response';
import { parseBody } from '@/lib/api/route-helpers';

export async function POST(request: Request) {
  const parsed = await parseBody(request, quizSubmitRequestSchema);
  if (!parsed.ok) return parsed.response;

  try {
    const recommendations = await discovery.submitQuiz(parsed.data.answers);
    return apiOk({ recommendations });
  } catch (error) {
    if (error instanceof DiscoveryError) return apiFail(error.code, error.message);
    throw error;
  }
}
