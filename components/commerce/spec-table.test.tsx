import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SpecTable } from './spec-table';
import { getDictionary } from '@/lib/i18n/dictionaries';
import type { ProductSpecs } from '@/lib/types';

const dict = getDictionary('en');
const baseSpecs: ProductSpecs = {
  material: 'Hydrogel', waterContent: '48%', baseCurve: '8.6mm', diameter: '14.5mm', origin: 'South Korea',
};

describe('SpecTable', () => {
  it('renders no graphic diameter row when the spec has none', () => {
    render(<SpecTable specs={baseSpecs} dict={dict} />);
    expect(screen.queryByText(dict.pdp.graphicDiameter)).not.toBeInTheDocument();
  });

  it('renders the graphic diameter row when the spec has one', () => {
    render(<SpecTable specs={{ ...baseSpecs, graphicDiameter: '13.6mm' }} dict={dict} />);
    expect(screen.getByText(dict.pdp.graphicDiameter)).toBeInTheDocument();
    expect(screen.getByText('13.6mm')).toBeInTheDocument();
  });
});
