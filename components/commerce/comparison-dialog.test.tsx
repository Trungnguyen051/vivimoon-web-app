import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComparisonDialog } from './comparison-dialog';
import { en } from '@/lib/i18n/dictionaries/en';
import type { ComparisonMatrix } from '@/lib/api/schemas/catalog';

const matrix: ComparisonMatrix = {
  products: [
    {
      id: 'p1', slug: 'aqua-blue', name: 'Aqua Blue', image: '/aqua.jpg',
      color: '#3b82f6', colorLabel: 'Blue', diameter: '14.2mm',
      eyeEnlargement: 'subtle', lifespan: 'monthly', price: 25, currency: 'USD',
    },
    {
      id: 'p2', slug: 'dramatic-grey', name: 'Dramatic Grey', image: '/grey.jpg',
      color: '#6b7280', colorLabel: 'Grey', diameter: '14.8mm',
      eyeEnlargement: 'dramatic', lifespan: 'daily', price: 18, currency: 'USD',
    },
  ],
};

function renderDialog(props: Partial<React.ComponentProps<typeof ComparisonDialog>> = {}) {
  return render(
    <ComparisonDialog
      open
      onOpenChange={vi.fn()}
      matrix={null}
      isPending={false}
      error={null}
      locale="en"
      dict={en}
      onRemove={vi.fn()}
      {...props}
    />,
  );
}

describe('ComparisonDialog', () => {
  it('renders one column per product with its spec rows', () => {
    renderDialog({ matrix });
    expect(screen.getByText('Aqua Blue')).toBeInTheDocument();
    expect(screen.getByText('Dramatic Grey')).toBeInTheDocument();
    expect(screen.getByText('14.2mm')).toBeInTheDocument();
    expect(screen.getByText('14.8mm')).toBeInTheDocument();
    expect(screen.getByText(en.compare.bands.subtle)).toBeInTheDocument();
    expect(screen.getByText(en.compare.bands.dramatic)).toBeInTheDocument();
    expect(screen.getByText(en.filters.replacements.monthly)).toBeInTheDocument();
    expect(screen.getByText(en.filters.replacements.daily)).toBeInTheDocument();
  });

  it('links each column header to the product PDP', () => {
    renderDialog({ matrix });
    expect(screen.getByRole('link', { name: /Aqua Blue/ })).toHaveAttribute('href', '/en/product/aqua-blue');
  });

  it('calls onRemove with the product id when a column is removed', async () => {
    const onRemove = vi.fn();
    const user = userEvent.setup();
    renderDialog({ matrix, onRemove });
    await user.click(screen.getByRole('button', { name: `${en.compare.remove}: Aqua Blue` }));
    expect(onRemove).toHaveBeenCalledWith('p1');
  });

  it('renders a loading state instead of a table while pending with no matrix yet', () => {
    renderDialog({ matrix: null, isPending: true });
    expect(screen.queryByText('Aqua Blue')).not.toBeInTheDocument();
  });

  it('renders an error state driven purely by the error prop', () => {
    renderDialog({ matrix: null, error: 'boom' });
    expect(screen.getByText('boom')).toBeInTheDocument();
  });
});
