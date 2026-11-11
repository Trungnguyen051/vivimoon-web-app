import { describe, it, expect } from 'vitest';
import { mockNewsletter } from './mock';
import { subscriptionAckSchema } from '@/lib/api/schemas/newsletter';

describe('mockNewsletter', () => {
  it('answers with the shape the route promises', async () => {
    const ack = await mockNewsletter.subscribe({ email: 'ngochan@example.com' });

    expect(subscriptionAckSchema.safeParse(ack).success).toBe(true);
    expect(ack.email).toBe('ngochan@example.com');
  });

  /**
   * No list, so no "already subscribed" — a second call answers exactly as the first
   * did. With nothing to check against, any other answer would be invented, and a
   * confirmation a shopper can trust is worth more than a distinction we cannot make.
   */
  it('forgets, so subscribing twice is not a different answer', async () => {
    const first = await mockNewsletter.subscribe({ email: 'ngochan@example.com' });
    const second = await mockNewsletter.subscribe({ email: 'ngochan@example.com' });

    expect(second).toEqual(first);
  });
});
