import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CompareToggle } from './compare-toggle';
import { useCompareStore, COMPARE_CAP } from '@/features/compare/compare-store';
import { en } from '@/lib/i18n/dictionaries/en';

beforeEach(() => {
  localStorage.clear();
  useCompareStore.setState({ productIds: [], hydrated: true });
});

describe('CompareToggle', () => {
  it('adds the product on click when not selected', async () => {
    const user = userEvent.setup();
    render(<CompareToggle productId="p1" dict={en} />);
    await user.click(screen.getByRole('button'));
    expect(useCompareStore.getState().productIds).toEqual(['p1']);
  });

  it('removes the product on click when already selected', async () => {
    useCompareStore.setState({ productIds: ['p1'], hydrated: true });
    const user = userEvent.setup();
    render(<CompareToggle productId="p1" dict={en} />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button'));
    expect(useCompareStore.getState().productIds).toEqual([]);
  });

  it('is disabled once the cap is reached for a product not already selected', () => {
    useCompareStore.setState({ productIds: ['a', 'b', 'c', 'd'], hydrated: true });
    expect(useCompareStore.getState().productIds).toHaveLength(COMPARE_CAP);
    render(<CompareToggle productId="p1" dict={en} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('a selected product stays enabled even at the cap, so it can be removed', () => {
    useCompareStore.setState({ productIds: ['a', 'b', 'c', 'p1'], hydrated: true });
    render(<CompareToggle productId="p1" dict={en} />);
    expect(screen.getByRole('button')).not.toBeDisabled();
  });
});
