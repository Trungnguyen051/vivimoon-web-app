import { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RxSelector, defaultRxDraft, draftToRx, type RxDraft } from './rx-selector';
import { getDictionary } from '@/lib/i18n/dictionaries';

const dict = getDictionary('en');

function Controlled({ onChange }: { onChange?: (next: RxDraft) => void }) {
  const [value, setValue] = useState(defaultRxDraft);
  return (
    <RxSelector
      value={value}
      onChange={(next) => { setValue(next); onChange?.(next); }}
      guideHref="/en/support/guides/chon-do-can-the-nao"
      dict={dict}
    />
  );
}

const unitButton = (unit: 'single' | 'pair') => screen.getByRole('button', { name: dict.pdp.unitOptions[unit] });
const singleField = () => screen.getByRole('combobox', { name: dict.rx.power });
const optionValues = (select: HTMLElement) =>
  within(select).getAllByRole('option').map((o) => (o as HTMLOptionElement).value);

describe('RxSelector', () => {
  it('starts as 1 chiếc at 0.00, with the no-power hint and the guide link', () => {
    render(<Controlled />);
    expect(unitButton('single')).toHaveAttribute('aria-pressed', 'true');
    expect(singleField()).toHaveValue('0');
    expect(screen.getByText(dict.rx.zeroHint)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: dict.rx.guide })).toHaveAttribute('href', '/en/support/guides/chon-do-can-the-nao');
  });

  it('hides the hint once a power is chosen', async () => {
    render(<Controlled />);
    await userEvent.selectOptions(singleField(), '-2.5');
    expect(screen.queryByText(dict.rx.zeroHint)).not.toBeInTheDocument();
  });

  it('shows Mắt trái (L) and Mắt phải (R) for a pair, keeping the chosen power both ways', async () => {
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} />);
    await userEvent.selectOptions(singleField(), '-2.5');
    await userEvent.click(unitButton('pair'));

    expect(screen.queryByRole('combobox', { name: dict.rx.power })).not.toBeInTheDocument();
    expect(screen.getByLabelText(dict.rx.leftEye)).toHaveValue('-2.5');
    expect(screen.getByLabelText(dict.rx.rightEye)).toHaveValue('-2.5');

    await userEvent.selectOptions(screen.getByLabelText(dict.rx.rightEye), '-3');
    await userEvent.click(unitButton('single'));
    expect(singleField()).toHaveValue('-2.5');
  });

  it('lets the right eye follow the left with "Same as left eye"', async () => {
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} />);
    await userEvent.click(unitButton('pair'));
    await userEvent.selectOptions(screen.getByLabelText(dict.rx.rightEye), 'same');
    await userEvent.selectOptions(screen.getByLabelText(dict.rx.leftEye), '-4');
    const last = onChange.mock.lastCall![0] as RxDraft;
    expect(draftToRx(last)).toEqual({ sameBothEyes: true, left: { sph: -4 }, right: { sph: -4 } });
  });

  it('offers myopia powers only, plano first, and no unstocked -7.25', () => {
    render(<Controlled />);
    const values = optionValues(singleField());
    expect(values[0]).toBe('0');
    expect(values).toContain('-10');
    expect(values).not.toContain('-7.25');
    expect(values.every((v) => Number(v) <= 0)).toBe(true);
  });

  it('renders no CYL, AXIS or ADD control (toric and multifocal are deferred, ADR-0010)', async () => {
    render(<Controlled />);
    await userEvent.click(unitButton('pair'));
    // Pinned count, so a control that dodges a name match still fails here.
    expect(screen.getAllByRole('combobox')).toHaveLength(2);
  });
});

describe('draftToRx', () => {
  it('gives a single one sph and a pair its left and right', () => {
    expect(draftToRx({ unit: 'single', left: -2.5, right: -2.5, rightSameAsLeft: false })).toEqual({ sph: -2.5 });
    expect(draftToRx({ unit: 'pair', left: -2.5, right: -3, rightSameAsLeft: false }))
      .toEqual({ sameBothEyes: false, left: { sph: -2.5 }, right: { sph: -3 } });
  });
});
