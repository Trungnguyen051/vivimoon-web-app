import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ComfortHighlight } from './comfort-highlight';
import { en } from '@/lib/i18n/dictionaries/en';

const t = en.pdp.comfort;

describe('ComfortHighlight', () => {
  it('shows water content, wear hours and sensitive-eye suitability', () => {
    render(<ComfortHighlight comfort={{ wearHours: 12, sensitiveEyes: true }} waterContent="45%" whyHref="/why" dict={t} />);
    expect(screen.getByText(t.title)).toBeInTheDocument();
    expect(screen.getByText('45%')).toBeInTheDocument();
    expect(screen.getByText(t.wearHoursValue.replace('{n}', '12'))).toBeInTheDocument();
    expect(screen.getByText(t.suitable)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: t.why })).toHaveAttribute('href', '/why');
  });

  it('says so when a lens is not ideal for sensitive eyes', () => {
    render(<ComfortHighlight comfort={{ wearHours: 8, sensitiveEyes: false }} waterContent="50%" whyHref="/why" dict={t} />);
    expect(screen.getByText(t.notSuitable)).toBeInTheDocument();
  });

  it('renders nothing for a lens without comfort data', () => {
    const { container } = render(<ComfortHighlight comfort={undefined} waterContent="45%" whyHref="/why" dict={t} />);
    expect(container).toBeEmptyDOMElement();
  });
});
