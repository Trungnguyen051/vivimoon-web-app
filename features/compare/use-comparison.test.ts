import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useComparisonMatrix } from './use-comparison';
import { apiRequest } from '@/lib/api/client';
import type { ComparisonMatrix } from '@/lib/api/schemas/catalog';

vi.mock('@/lib/api/client', () => ({ apiRequest: vi.fn() }));

const mockedApiRequest = vi.mocked(apiRequest);

function matrixFor(ids: string[]): ComparisonMatrix {
  return {
    products: ids.map((id) => ({
      id, slug: id, name: id, image: '/x.jpg', diameter: '14.2mm',
      eyeEnlargement: 'subtle', lifespan: 'daily', price: 20, currency: 'USD',
    })),
  };
}

async function flush() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

beforeEach(() => {
  mockedApiRequest.mockReset();
});

describe('useComparisonMatrix', () => {
  it('returns null and does not fetch when there are no ids', () => {
    const { result } = renderHook(() => useComparisonMatrix([]));
    expect(result.current.matrix).toBeNull();
    expect(mockedApiRequest).not.toHaveBeenCalled();
  });

  it('fetches the matrix for the given ids', async () => {
    mockedApiRequest.mockResolvedValue({ ok: true, data: matrixFor(['a']) });
    // `ids` is hoisted so the hook sees a stable reference across the
    // re-renders `setIsPending`/`setMatrix` trigger — an inline `['a']`
    // literal is a fresh array every render and free-loops the effect
    // (this hook trusts caller-stable ids, same contract as `usePricedCart`).
    const ids = ['a'];
    const { result } = renderHook(() => useComparisonMatrix(ids));
    await flush();
    expect(mockedApiRequest).toHaveBeenCalledWith('/api/products/compare', expect.objectContaining({
      method: 'POST',
      body: { productIds: ['a'] },
    }));
    expect(result.current.matrix?.products).toHaveLength(1);
  });

  it('re-fetches when ids change, and clears back to null when emptied', async () => {
    mockedApiRequest.mockResolvedValue({ ok: true, data: matrixFor(['a']) });
    const { result, rerender } = renderHook(({ ids }) => useComparisonMatrix(ids), {
      initialProps: { ids: ['a'] },
    });
    await flush();
    expect(result.current.matrix?.products).toHaveLength(1);

    rerender({ ids: [] });
    expect(result.current.matrix).toBeNull();
  });

  it('surfaces the error message and no matrix when the request fails', async () => {
    mockedApiRequest.mockResolvedValue({ ok: false, error: { code: 'internal', message: 'Something went wrong.' } });
    const ids = ['a'];
    const { result } = renderHook(() => useComparisonMatrix(ids));
    await flush();
    expect(result.current.matrix).toBeNull();
    expect(result.current.error).toBe('Something went wrong.');
  });
});
