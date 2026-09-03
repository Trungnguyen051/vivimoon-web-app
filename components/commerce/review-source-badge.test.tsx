import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReviewSourceBadge } from './review-source-badge';
import { en } from '@/lib/i18n/dictionaries/en';

describe('ReviewSourceBadge', () => {
  it('renders a link to the original listing when sourceUrl is present', () => {
    render(<ReviewSourceBadge source="shopee" sourceUrl="https://shopee.vn/item/123" dict={en} />);
    const link = screen.getByRole('link', { name: en.pdp.reviewSource.shopee });
    expect(link).toHaveAttribute('href', 'https://shopee.vn/item/123');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });

  it('renders a tiktok badge as a link', () => {
    render(<ReviewSourceBadge source="tiktok" sourceUrl="https://tiktok.com/@x/video/1" dict={en} />);
    expect(screen.getByRole('link', { name: en.pdp.reviewSource.tiktok })).toBeInTheDocument();
  });

  it('renders plain text with no link when there is no sourceUrl (vivimoon-native)', () => {
    render(<ReviewSourceBadge source="vivimoon" dict={en} />);
    expect(screen.getByText(en.pdp.reviewSource.vivimoon)).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
