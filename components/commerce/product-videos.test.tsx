import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductVideos } from './product-videos';
import { en } from '@/lib/i18n/dictionaries/en';

const t = en.pdp.videos;
const videos = [
  { id: 'v1', title: 'Look one', poster: '/p1.jpg', url: 'https://example.com/v1', views: '128k' },
  { id: 'v2', title: 'Look two', poster: '/p2.jpg', url: 'https://example.com/v2', views: '96k' },
];

describe('ProductVideos', () => {
  it('shows a card per clip, tagged with the product, and links to VIVIMOON TV', () => {
    render(<ProductVideos videos={videos} productLabel="Aqua · 190K" moreHref="/tv" dict={t} />);
    expect(screen.getByRole('heading', { name: t.title })).toBeInTheDocument();
    expect(screen.getByText('Look one')).toBeInTheDocument();
    expect(screen.getByText(t.views.replace('{n}', '96k'))).toBeInTheDocument();
    expect(screen.getAllByText('Aqua · 190K')).toHaveLength(videos.length);
    expect(screen.getByRole('link', { name: t.play.replace('{title}', 'Look two') })).toHaveAttribute('href', 'https://example.com/v2');
    expect(screen.getByRole('link', { name: t.more })).toHaveAttribute('href', '/tv');
  });

  it('renders nothing for a product without videos', () => {
    const { container } = render(<ProductVideos videos={[]} productLabel="Aqua · 190K" moreHref="/tv" dict={t} />);
    expect(container).toBeEmptyDOMElement();
  });
});
