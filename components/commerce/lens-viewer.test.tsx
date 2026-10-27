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
    render(<LensViewer gallery={gallery} alt="Aqua" dict={en.viewer} imageLabel={en.common.image} />);
    expect(screen.getByRole('tab', { name: en.viewer.eye })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: en.viewer.face })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: en.viewer.withMakeup })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: en.viewer.withoutMakeup })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: en.viewer.byEyeColor })).toBeInTheDocument();
  });

  it('shows the active context images, defaulting to the first tab', () => {
    render(<LensViewer gallery={gallery} alt="Aqua" dict={en.viewer} imageLabel={en.common.image} />);
    expect(screen.getByAltText('Aqua')).toHaveAttribute('src', expect.stringContaining('eye-1'));
  });

  it('swaps the active image set when switching tabs', async () => {
    const user = userEvent.setup();
    render(<LensViewer gallery={gallery} alt="Aqua" dict={en.viewer} imageLabel={en.common.image} />);
    await user.click(screen.getByRole('tab', { name: en.viewer.face }));
    expect(screen.getByAltText('Aqua')).toHaveAttribute('src', expect.stringContaining('face-1'));
  });

  /**
   * Asserted through `aria-disabled` rather than `toBeDisabled()`, which reads only the
   * native attribute. Radix marked a dead tab with `disabled`; Base UI marks it the way
   * the ARIA practices ask a composite widget to.
   *
   * One thing genuinely changed with it: Radix's roving focus skipped a natively
   * disabled tab, and Base UI's does not skip an `aria-disabled` one, so arrow keys now
   * land on it. That is the behaviour the practices ask for — a keyboard user gets to
   * find out the context exists rather than having it silently withheld — and the tab
   * still refuses to open, which is what the click below pins.
   */
  it('marks a tab with no images as disabled, and refuses to open it', async () => {
    render(<LensViewer gallery={gallery} alt="Aqua" dict={en.viewer} imageLabel={en.common.image} />);
    const user = userEvent.setup();
    const dead = screen.getByRole('tab', { name: en.viewer.withoutMakeup });
    expect(dead).toHaveAttribute('aria-disabled', 'true');

    // The announcement is only half of it — the tab must also refuse to take over.
    await user.click(dead);
    expect(dead).toHaveAttribute('aria-selected', 'false');
  });

  it('the byEyeColor tab renders an eye-color selector and swaps images on selection', async () => {
    const user = userEvent.setup();
    render(<LensViewer gallery={gallery} alt="Aqua" dict={en.viewer} imageLabel={en.common.image} />);
    await user.click(screen.getByRole('tab', { name: en.viewer.byEyeColor }));
    expect(screen.getByAltText('Aqua')).toHaveAttribute('src', expect.stringContaining('brown-1'));

    await user.click(screen.getByRole('button', { name: 'blue' }));
    expect(screen.getByAltText('Aqua')).toHaveAttribute('src', expect.stringContaining('blue-1'));
  });
});
