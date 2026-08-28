import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { parseOrThrow, UpstreamShapeError } from './validate';

const schema = z.object({ id: z.string(), price: z.number().int() });

describe('parseOrThrow', () => {
  it('returns parsed data when the shape matches', () => {
    expect(parseOrThrow(schema, { id: 'a', price: 1 }, 'GET /x')).toEqual({ id: 'a', price: 1 });
  });

  it('throws UpstreamShapeError naming the endpoint and field', () => {
    try {
      parseOrThrow(schema, { id: 'a', price: '1' }, 'GET /products');
      throw new Error('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(UpstreamShapeError);
      const e = err as UpstreamShapeError;
      expect(e.message).toContain('GET /products');
      expect(e.message).toContain('price');
      expect(e.issues[0].path).toEqual(['price']);
    }
  });

  it('reports several bad fields at once', () => {
    try {
      parseOrThrow(schema, { id: 1, price: '1' }, 'GET /products');
      throw new Error('should have thrown');
    } catch (err) {
      expect((err as UpstreamShapeError).issues).toHaveLength(2);
    }
  });
});
