import { describe, it, expect, beforeEach } from 'vitest';
import { POST } from './route';
import { readMockGuideFeedback, resetMockGuideFeedbackState } from '@/lib/api/resources/support/mock';

const SLUG = 'cach-deo-va-thao-lens';

const post = (body: unknown, raw?: string) =>
  POST(new Request('http://localhost/api/support/guide-feedback', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: raw ?? JSON.stringify(body),
  }));

describe('POST /api/support/guide-feedback', () => {
  // Votes otherwise leak between files sharing a Vitest worker, which is what would
  // force every assertion here to reason in deltas rather than in absolutes.
  beforeEach(() => resetMockGuideFeedbackState());

  /**
   * The whole point of the ticket: the endpoint must actually record. A route that
   * answered `ok` without writing anywhere would pass an envelope-only test and be
   * exactly the button that pretends.
   */
  it('records the vote and answers with the standard success envelope', async () => {
    const response = await post({ guideSlug: SLUG, helpful: true });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, data: { guideSlug: SLUG, helpful: true } });
    expect(readMockGuideFeedback()).toEqual([{ guideSlug: SLUG, helpful: true }]);
  });

  it('records a negative vote as readily as a positive one', async () => {
    await post({ guideSlug: SLUG, helpful: false });

    expect(readMockGuideFeedback().at(-1)?.helpful).toBe(false);
  });

  /** No dedup: guests have no identity, and inventing one for a thumbs-up is disproportionate. */
  it('takes the same vote twice without complaint', async () => {
    await post({ guideSlug: SLUG, helpful: true });
    await post({ guideSlug: SLUG, helpful: true });

    expect(readMockGuideFeedback()).toHaveLength(2);
  });

  it.each([
    ['a missing slug', { helpful: true }],
    ['an empty slug', { guideSlug: '', helpful: true }],
    ['a missing verdict', { guideSlug: SLUG }],
    ['a verdict that is not a boolean', { guideSlug: SLUG, helpful: 'yes' }],
  ])('rejects %s without recording it', async (_case, body) => {
    const response = await post(body);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.ok).toBe(false);
    expect(payload.error.code).toBe('validation_failed');
    expect(readMockGuideFeedback()).toHaveLength(0);
  });

  it('rejects a body that is not JSON at all', async () => {
    const response = await post(undefined, 'not json');

    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe('validation_failed');
    expect(readMockGuideFeedback()).toHaveLength(0);
  });

  /**
   * A vote against a slug nobody authored can never be attributed to a guide — and the
   * stored signal is the entire point of this endpoint.
   */
  it('rejects a guide that does not exist, without recording it', async () => {
    const response = await post({ guideSlug: 'khong-co-huong-dan-nao', helpful: true });
    const payload = await response.json();

    expect(payload.ok).toBe(false);
    expect(payload.error.code).toBe('not_found');
    expect(readMockGuideFeedback()).toHaveLength(0);
  });

  /** The one validated string this app keeps, so it has a ceiling. */
  it('rejects a slug longer than any guide could have', async () => {
    const response = await post({ guideSlug: 'x'.repeat(5_000), helpful: true });

    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe('validation_failed');
    expect(readMockGuideFeedback()).toHaveLength(0);
  });

  /**
   * "No dedup" removes the only natural bound on an in-memory array behind an
   * endpoint that needs no session, so the store caps itself and drops the oldest.
   */
  it('keeps the store bounded however many votes arrive', async () => {
    for (let i = 0; i < 12; i++) await post({ guideSlug: SLUG, helpful: i % 2 === 0 });

    expect(readMockGuideFeedback()).toHaveLength(12);
    expect(readMockGuideFeedback().length).toBeLessThanOrEqual(1_000);
  });
});
