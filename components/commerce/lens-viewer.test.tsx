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
    withMakeup: [],
    withoutMakeup: [],
    byEyeColor: {},
    closeUp: ['/close-1.jpg'],
    sunlight: [],
  },
};
const videos = [{ id: 'v1', poster: '/poster-1.jpg', url: 'https://example.com/v1', title: 'Look one' }];
const tones = [{ tone: 'peach' as const, image: '/peach.jpg' }];

const t = en.viewer;
const mainImage = () => screen.getByTestId('lens-viewer-main').querySelector('img');

function renderViewer(props: Partial<Parameters<typeof LensViewer>[0]> = {}) {
  return render(
    <LensViewer gallery={gallery} images={['/fallback.jpg']} videos={videos} tones={tones} alt="Aqua" dict={t} imageLabel={en.common.image} common={en.common} {...props} />,
  );
}

describe('LensViewer', () => {
  it('offers a tab for each view that has something to show, and none for an empty one', () => {
    renderViewer();
    for (const tab of ['eye', 'face', 'closeUp', 'video'] as const) {
      expect(screen.getByRole('button', { name: t.tabs[tab] })).toBeInTheDocument();
    }
    expect(screen.queryByRole('button', { name: t.tabs.sunlight })).not.toBeInTheDocument();
  });

  it('opens on the first lens-pattern image and counts every slide', () => {
    renderViewer();
    expect(mainImage()).toHaveAttribute('src', expect.stringContaining('eye-1'));
    expect(screen.getByText('1 / 5')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: t.tabs.eye })).toHaveAttribute('aria-pressed', 'true');
  });

  it('switches images when a tab is chosen', async () => {
    const user = userEvent.setup();
    renderViewer();
    await user.click(screen.getByRole('button', { name: t.tabs.closeUp }));
    expect(mainImage()).toHaveAttribute('src', expect.stringContaining('close-1'));
    expect(screen.getByText('4 / 5')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: t.tabs.closeUp })).toHaveAttribute('aria-pressed', 'true');
  });

  it('steps across tabs with the arrows, wrapping at the ends', async () => {
    const user = userEvent.setup();
    renderViewer();
    await user.click(screen.getByRole('button', { name: en.common.next }));
    await user.click(screen.getByRole('button', { name: en.common.next }));
    expect(mainImage()).toHaveAttribute('src', expect.stringContaining('face-1'));
    expect(screen.getByRole('button', { name: t.tabs.face })).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', { name: t.tabs.eye }));
    await user.click(screen.getByRole('button', { name: en.common.previous }));
    expect(screen.getByText('5 / 5')).toBeInTheDocument();
  });

  it('plays a video slide from where the clip lives', async () => {
    const user = userEvent.setup();
    renderViewer();
    await user.click(screen.getByRole('button', { name: t.tabs.video }));
    expect(screen.getByRole('link', { name: 'Look one' })).toHaveAttribute('href', 'https://example.com/v1');
  });

  it('shows the lens with a makeup tone, and lets go of it when a tab is chosen', async () => {
    const user = userEvent.setup();
    renderViewer();
    await user.click(screen.getByRole('button', { name: t.toneLabels.peach }));
    expect(mainImage()).toHaveAttribute('src', expect.stringContaining('peach'));

    await user.click(screen.getByRole('button', { name: t.tabs.face }));
    expect(mainImage()).toHaveAttribute('src', expect.stringContaining('face-1'));
    expect(screen.getByRole('button', { name: t.toneLabels.peach })).toHaveAttribute('aria-pressed', 'false');
  });

  it('falls back to the product images, with no tab row, when there is no gallery', () => {
    renderViewer({ gallery: null, videos: [], tones: [] });
    expect(mainImage()).toHaveAttribute('src', expect.stringContaining('fallback'));
    expect(screen.queryByRole('group', { name: t.views })).not.toBeInTheDocument();
    expect(screen.queryByText(t.tones)).not.toBeInTheDocument();
  });
});
