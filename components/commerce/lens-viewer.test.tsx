import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LensViewer } from './lens-viewer';
import { en } from '@/lib/i18n/dictionaries/en';
import type { LensGallery } from '@/lib/api/schemas/catalog';

const gallery: LensGallery = {
  productId: 'p1',
  contexts: {
    eye: ['/eye-1.jpg', '/eye-2.jpg'],
    face: ['/face-1.jpg'],
    withMakeup: ['/makeup-1.jpg'],
    withoutMakeup: [],
    byEyeColor: { brown: ['/brown-1.jpg'], blue: ['/blue-1.jpg'] },
  },
};

describe('LensViewer', () => {
  it('renders a tab for each of the five contexts', () => {
    render(<LensViewer gallery={gallery} alt="Aqua" dict={en.viewer} />);
    expect(screen.getByRole('tab', { name: en.viewer.eye })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: en.viewer.face })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: en.viewer.withMakeup })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: en.viewer.withoutMakeup })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: en.viewer.byEyeColor })).toBeInTheDocument();
  });

  it('shows the active context images, defaulting to the first tab', () => {
    render(<LensViewer gallery={gallery} alt="Aqua" dict={en.viewer} />);
    expect(screen.getByAltText('Aqua')).toHaveAttribute('src', expect.stringContaining('eye-1'));
  });

  it('swaps the active image set when switching tabs', async () => {
    const user = userEvent.setup();
    render(<LensViewer gallery={gallery} alt="Aqua" dict={en.viewer} />);
    await user.click(screen.getByRole('tab', { name: en.viewer.face }));
    expect(screen.getByAltText('Aqua')).toHaveAttribute('src', expect.stringContaining('face-1'));
  });

  it('disables a tab whose context has no images', () => {
    render(<LensViewer gallery={gallery} alt="Aqua" dict={en.viewer} />);
    expect(screen.getByRole('tab', { name: en.viewer.withoutMakeup })).toBeDisabled();
  });

  it('the byEyeColor tab renders an eye-color selector and swaps images on selection', async () => {
    const user = userEvent.setup();
    render(<LensViewer gallery={gallery} alt="Aqua" dict={en.viewer} />);
    await user.click(screen.getByRole('tab', { name: en.viewer.byEyeColor }));
    expect(screen.getByAltText('Aqua')).toHaveAttribute('src', expect.stringContaining('brown-1'));

    await user.click(screen.getByRole('button', { name: 'blue' }));
    expect(screen.getByAltText('Aqua')).toHaveAttribute('src', expect.stringContaining('blue-1'));
  });
});
