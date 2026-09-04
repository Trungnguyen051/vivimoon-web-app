import { describe, it, expect } from 'vitest';
import { GET } from './route';
import { POST } from './submit/route';
import { envelopeSchema } from '@/lib/api/schemas/common';
import { quizDefinitionSchema, quizSubmitResponseSchema } from '@/lib/api/schemas/discovery';
import { quiz } from '@/content/quiz';

function submitReq(body: unknown): Request {
  return new Request('http://localhost/api/quiz/submit', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('GET /api/quiz', () => {
  it('returns a schema-valid quiz definition', async () => {
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    const result = envelopeSchema(quizDefinitionSchema).safeParse(body);
    expect(result.success, JSON.stringify(result.success ? null : result.error.issues)).toBe(true);
  });
});

describe('POST /api/quiz/submit', () => {
  it('returns schema-valid recommendations for real answers', async () => {
    const q = quiz.questions[0];
    const res = await POST(submitReq({ answers: [{ questionId: q.id, optionId: q.options[0].id }] }));
    const body = await res.json();
    expect(res.status).toBe(200);
    const result = envelopeSchema(quizSubmitResponseSchema).safeParse(body);
    expect(result.success, JSON.stringify(result.success ? null : result.error.issues)).toBe(true);
  });

  it('rejects an empty answers array with 400 validation_failed', async () => {
    const res = await POST(submitReq({ answers: [] }));
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error.code).toBe('validation_failed');
  });

  it('rejects an answer referencing an unknown question/option with 400 validation_failed', async () => {
    const res = await POST(submitReq({ answers: [{ questionId: 'nope', optionId: 'nope' }] }));
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error.code).toBe('validation_failed');
  });
});
