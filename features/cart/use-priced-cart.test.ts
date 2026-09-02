import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { usePricedCart } from './use-priced-cart';
import { apiRequest, type ApiResult } from '@/lib/api/client';
import type { CartLine } from './cart.types';
import type { PricedCart } from '@/lib/api/schemas/cart';
import type { SessionStatus } from '@/features/session/session-store';

vi.mock('@/lib/api/client', () => ({ apiRequest: vi.fn() }));

const mockedApiRequest = vi.mocked(apiRequest);

function makeLine(overrides: Partial<CartLine> = {}): CartLine {
  return {
    lineKey: 'k1',
    productId: 'p1',
    variantId: 'v1',
    name: 'Aqua',
    sku: 'SKU1',
    packSize: '30',
    unitPrice: 25,
    currency: 'USD',
    quantity: 1,
    ...overrides,
  };
}

// Fixed, hand-picked totals — never unitPrice multiplied by quantity. That
// computation is banned in app/components/features by the Global Constraint
// the money grep enforces, tests included.
function pricedCartFor(line: CartLine, lineTotal: number): PricedCart {
  return {
    lines: [
      { lineKey: line.lineKey, variantId: line.variantId, quantity: line.quantity, unitPrice: line.unitPrice, lineTotal, currency: line.currency },
    ],
    subtotal: lineTotal,
    discount: 0,
    appliedVouchers: [],
    shipping: 0,
    total: lineTotal,
    currency: line.currency,
  };
}

/** A promise this test resolves manually, to control arrival order precisely. */
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

async function flushMicrotasks() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

beforeEach(() => {
  mockedApiRequest.mockReset();
});

describe('usePricedCart', () => {
  it('does not fire before hydration', () => {
    const lines = [makeLine()];
    const { result } = renderHook(({ lines, hydrated }) => usePricedCart(lines, hydrated), {
      initialProps: { lines, hydrated: false },
    });
    expect(mockedApiRequest).not.toHaveBeenCalled();
    expect(result.current.result).toBeNull();
  });

  it('fires the first price immediately once hydrated, with no debounce', async () => {
    const line = makeLine();
    const priced = pricedCartFor(line, 25);
    mockedApiRequest.mockResolvedValue({ ok: true, data: priced });

    const lines = [line];
    const { result } = renderHook(() => usePricedCart(lines, true));

    await flushMicrotasks();

    expect(mockedApiRequest).toHaveBeenCalledTimes(1);
    expect(result.current.result).toEqual(priced);
    expect(result.current.isPending).toBe(false);
  });

  it('sends only lineKey/variantId/rx/quantity — never a client-supplied price', async () => {
    const line = makeLine();
    mockedApiRequest.mockResolvedValue({ ok: true, data: pricedCartFor(line, 25) });
    renderHook(() => usePricedCart([line], true));
    await flushMicrotasks();

    const [path, init] = mockedApiRequest.mock.calls[0];
    expect(path).toBe('/api/cart/price');
    const body = init?.body as { lines: unknown[] };
    expect(body.lines).toEqual([{ lineKey: line.lineKey, variantId: line.variantId, rx: undefined, quantity: line.quantity }]);
  });

  it('clears to null (not the previous result) the instant the cart becomes empty', async () => {
    const line = makeLine();
    const priced = pricedCartFor(line, 25);
    mockedApiRequest.mockResolvedValue({ ok: true, data: priced });

    const { result, rerender } = renderHook(({ lines }: { lines: CartLine[] }) => usePricedCart(lines, true), {
      initialProps: { lines: [line] },
    });
    await flushMicrotasks();
    expect(result.current.result).toEqual(priced);

    act(() => {
      rerender({ lines: [] });
    });

    expect(result.current.result).toBeNull();
    // Emptying the cart must not fire a request — priceCartRequestSchema requires >=1 line.
    expect(mockedApiRequest).toHaveBeenCalledTimes(1);
  });

  it('debounces a subsequent line change by ~300ms', async () => {
    vi.useFakeTimers();
    try {
      const line = makeLine();
      mockedApiRequest.mockResolvedValue({ ok: true, data: pricedCartFor(line, 25) });

      const { rerender } = renderHook(({ lines }: { lines: CartLine[] }) => usePricedCart(lines, true), {
        initialProps: { lines: [line] },
      });
      await act(async () => {
        await Promise.resolve();
      });
      expect(mockedApiRequest).toHaveBeenCalledTimes(1); // immediate first fire

      const line2 = makeLine({ quantity: 2 });
      mockedApiRequest.mockResolvedValue({ ok: true, data: pricedCartFor(line2, 50) });
      act(() => {
        rerender({ lines: [line2] });
      });
      expect(mockedApiRequest).toHaveBeenCalledTimes(1); // not yet — debounced

      await act(async () => {
        await vi.advanceTimersByTimeAsync(299);
      });
      expect(mockedApiRequest).toHaveBeenCalledTimes(1);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(2);
      });
      expect(mockedApiRequest).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it('retains the last good result while a re-price is pending (no flicker to null)', async () => {
    vi.useFakeTimers();
    try {
      const line = makeLine();
      const priced = pricedCartFor(line, 25);
      mockedApiRequest.mockResolvedValue({ ok: true, data: priced });

      const { result, rerender } = renderHook(({ lines }: { lines: CartLine[] }) => usePricedCart(lines, true), {
        initialProps: { lines: [line] },
      });
      await act(async () => {
        await Promise.resolve();
      });
      expect(result.current.result).toEqual(priced);

      const pending = deferred<ApiResult<PricedCart>>();
      mockedApiRequest.mockReturnValueOnce(pending.promise);
      const line2 = makeLine({ quantity: 2 });
      act(() => {
        rerender({ lines: [line2] });
      });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(300);
      });

      // Still pending, but the previous total must still be showing.
      expect(result.current.isPending).toBe(true);
      expect(result.current.result).toEqual(priced);

      const priced2 = pricedCartFor(line2, 50);
      await act(async () => {
        pending.resolve({ ok: true, data: priced2 });
        await Promise.resolve();
        await Promise.resolve();
      });
      expect(result.current.result).toEqual(priced2);
      expect(result.current.isPending).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it('drops a late (out-of-order) response and keeps the newer request\'s result', async () => {
    vi.useFakeTimers();
    try {
      const lineA = makeLine();
      const dA = deferred<ApiResult<PricedCart>>();
      mockedApiRequest.mockReturnValueOnce(dA.promise);

      const { result, rerender } = renderHook(({ lines }: { lines: CartLine[] }) => usePricedCart(lines, true), {
        initialProps: { lines: [lineA] },
      });
      // Request A fires immediately (first fire, no debounce).
      expect(mockedApiRequest).toHaveBeenCalledTimes(1);

      // Mutation B happens before A resolves.
      const lineB = makeLine({ quantity: 2 });
      const dB = deferred<ApiResult<PricedCart>>();
      mockedApiRequest.mockReturnValueOnce(dB.promise);
      act(() => {
        rerender({ lines: [lineB] });
      });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(300); // debounce elapses, request B fires
      });
      expect(mockedApiRequest).toHaveBeenCalledTimes(2);

      const resultA = pricedCartFor(lineA, 25);
      const resultB = pricedCartFor(lineB, 999); // distinct value, easy to identify

      // B resolves first (the normal case: B was requested more recently but
      // networks don't guarantee order, and here it simply answers sooner).
      await act(async () => {
        dB.resolve({ ok: true, data: resultB });
        await Promise.resolve();
        await Promise.resolve();
      });
      expect(result.current.result).toEqual(resultB);

      // A resolves LATE, after B. A correct implementation must ignore it.
      await act(async () => {
        dA.resolve({ ok: true, data: resultA });
        await Promise.resolve();
        await Promise.resolve();
      });
      expect(result.current.result).toEqual(resultB); // NOT resultA
    } finally {
      vi.useRealTimers();
    }
  });

  describe('guest -> member cart merge (spec §9)', () => {
    it('re-fires immediately, with no debounce, when sessionStatus changes with the same lines', async () => {
      const line = makeLine();
      const lines = [line]; // stable reference — only sessionStatus changes below
      mockedApiRequest.mockResolvedValue({ ok: true, data: pricedCartFor(line, 25) });

      const { rerender } = renderHook(
        ({ sessionStatus }: { sessionStatus: SessionStatus }) => usePricedCart(lines, true, sessionStatus),
        { initialProps: { sessionStatus: 'anonymous' as SessionStatus } },
      );
      await flushMicrotasks();
      expect(mockedApiRequest).toHaveBeenCalledTimes(1); // first fire

      act(() => {
        rerender({ sessionStatus: 'authenticated' });
      });
      // Immediate — not sitting through the 300ms debounce like a line edit would.
      expect(mockedApiRequest).toHaveBeenCalledTimes(2);
    });

    it('does not re-fire on a rerender where sessionStatus is unchanged', async () => {
      const line = makeLine();
      const lines = [line]; // stable reference
      mockedApiRequest.mockResolvedValue({ ok: true, data: pricedCartFor(line, 25) });

      const { rerender } = renderHook(
        ({ sessionStatus }: { sessionStatus: SessionStatus }) => usePricedCart(lines, true, sessionStatus),
        { initialProps: { sessionStatus: 'anonymous' as SessionStatus } },
      );
      await flushMicrotasks();
      expect(mockedApiRequest).toHaveBeenCalledTimes(1);

      act(() => {
        rerender({ sessionStatus: 'anonymous' });
      });
      await flushMicrotasks();
      expect(mockedApiRequest).toHaveBeenCalledTimes(1);
    });

    it('login with an empty guest cart does not fire or error', async () => {
      const { result, rerender } = renderHook(
        ({ sessionStatus }: { sessionStatus: SessionStatus }) => usePricedCart([], true, sessionStatus),
        { initialProps: { sessionStatus: 'anonymous' as SessionStatus } },
      );
      expect(result.current.result).toBeNull();

      act(() => {
        rerender({ sessionStatus: 'authenticated' });
      });

      expect(mockedApiRequest).not.toHaveBeenCalled();
      expect(result.current.result).toBeNull();
    });

    it('omitting sessionStatus (existing callers) never triggers the session-change branch', async () => {
      const line = makeLine();
      const lines = [line]; // stable reference — this rerender changes nothing
      mockedApiRequest.mockResolvedValue({ ok: true, data: pricedCartFor(line, 25) });

      const { rerender } = renderHook(() => usePricedCart(lines, true), { initialProps: {} });
      await flushMicrotasks();
      expect(mockedApiRequest).toHaveBeenCalledTimes(1);

      // Same lines, same (absent) sessionStatus — a plain rerender must not re-fire.
      act(() => {
        rerender({});
      });
      await flushMicrotasks();
      expect(mockedApiRequest).toHaveBeenCalledTimes(1);
    });
  });
});
