import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComparisonTray } from './comparison-tray';
import { useCompareStore } from '@/features/compare/compare-store';
import { apiRequest } from '@/lib/api/client';
import { en } from '@/lib/i18n/dictionaries/en';
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

beforeEach(() => {
  mockedApiRequest.mockReset();
  mockedApiRequest.mockResolvedValue({ ok: true, data: matrixFor([]) });
  localStorage.clear();
  useCompareStore.setState({ productIds: [], hydrated: true });
});

describe('ComparisonTray', () => {
  it('renders nothing when the compare selection is empty', () => {
    const { container } = render(<ComparisonTray locale="en" dict={en} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders a persistent strip with the compare count once non-empty', () => {
    useCompareStore.setState({ productIds: ['a', 'b'], hydrated: true });
    render(<ComparisonTray locale="en" dict={en} />);
    expect(screen.getByText(`${en.compare.tray} (2)`)).toBeInTheDocument();
  });

  it('clear all empties the store', async () => {
    useCompareStore.setState({ productIds: ['a', 'b'], hydrated: true });
    const user = userEvent.setup();
    render(<ComparisonTray locale="en" dict={en} />);
    await user.click(screen.getByRole('button', { name: en.compare.clearAll }));
    expect(useCompareStore.getState().productIds).toEqual([]);
  });

  it('opens the comparison dialog on "Compare" click', async () => {
    useCompareStore.setState({ productIds: ['a'], hydrated: true });
    const user = userEvent.setup();
    render(<ComparisonTray locale="en" dict={en} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: new RegExp(en.compare.tray) }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
