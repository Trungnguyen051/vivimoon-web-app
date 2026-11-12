import { describe, it, expect } from 'vitest';
import { spendTiersFor } from './spend-tiers';

describe('spendTiersFor', () => {
  it.each([
    [299_999, [false, false, false], { threshold: 300_000, reward: 'freeShipping', remaining: 1 }],
    [300_000, [true, false, false], { threshold: 500_000, reward: 'gift', remaining: 200_000 }],
    [499_999, [true, false, false], { threshold: 500_000, reward: 'gift', remaining: 1 }],
    [500_000, [true, true, false], { threshold: 800_000, reward: 'discount', value: 50_000, remaining: 300_000 }],
    [799_999, [true, true, false], { threshold: 800_000, reward: 'discount', value: 50_000, remaining: 1 }],
    [800_000, [true, true, true], undefined],
  ])('at %i reports the reached tiers and the next one', (amount, reached, next) => {
    const result = spendTiersFor(amount);
    expect(result.tiers.map((t) => t.reached)).toEqual(reached);
    expect(result.next).toEqual(next);
  });

  it('frees shipping from 300.000 and not below', () => {
    expect(spendTiersFor(299_999).freeShipping).toBe(false);
    expect(spendTiersFor(300_000).freeShipping).toBe(true);
  });

  it('takes 50.000 off from 800.000 and not below', () => {
    expect(spendTiersFor(799_999).discount).toBe(0);
    expect(spendTiersFor(800_000).discount).toBe(50_000);
  });
});
