import { describe, it, expect } from 'vitest';
import { mockShipping } from './mock';

describe('mockShipping.quote', () => {
  it('returns the known rate for a province/district in the table', async () => {
    const options = await mockShipping.quote({ province: 'Ho Chi Minh City', district: 'District 1' });
    expect(options).toEqual([
      { id: 'standard', label: 'Standard', fee: 3, etaDays: 2 },
      { id: 'express', label: 'Express', fee: 8, etaDays: 1 },
    ]);
  });

  it('returns a sane default rather than throwing for an unknown district', async () => {
    const options = await mockShipping.quote({ province: 'Nowhere', district: 'Nowhere District' });
    expect(options).toEqual([{ id: 'standard', label: 'Standard', fee: 5, etaDays: 5 }]);
  });
});
