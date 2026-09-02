import { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RxSelector, emptyRxDraft, type RxDraft } from './rx-selector';
import { getDictionary } from '@/lib/i18n/dictionaries';
import type { LensType } from '@/lib/api/schemas/catalog';

const dict = getDictionary('en');

function Controlled({
  lensType,
  initial = emptyRxDraft,
  ranges,
  onChange,
}: {
  lensType: LensType;
  initial?: RxDraft;
  ranges?: { sph: readonly number[]; add: readonly ('LOW' | 'MID' | 'HIGH')[] };
  onChange?: (next: RxDraft) => void;
}) {
  // A tiny uncontrolled-from-the-outside wrapper so the test can drive value/onChange
  // like the real PDP does, without re-implementing state management per test.
  const [value, setValue] = useState(initial);
  return (
    <RxSelector
      value={value}
      onChange={(next: RxDraft) => {
        setValue(next);
        onChange?.(next);
      }}
      lensType={lensType}
      ranges={ranges}
      dict={dict}
    />
  );
}

function allCylAndAxisControls() {
  return [
    ...screen.queryAllByRole('combobox', { name: /cyl/i }),
    ...screen.queryAllByRole('combobox', { name: /axis/i }),
    ...screen.queryAllByRole('spinbutton', { name: /cyl/i }),
    ...screen.queryAllByRole('spinbutton', { name: /axis/i }),
  ];
}

describe('RxSelector', () => {
  it('renders an sph control per eye and no ADD control for a clear product', () => {
    render(<Controlled lensType="clear" />);
    expect(screen.getByLabelText(`${dict.rx.rightEye} ${dict.rx.sph}`)).toBeInTheDocument();
    expect(screen.getByLabelText(`${dict.rx.leftEye} ${dict.rx.sph}`)).toBeInTheDocument();
    expect(screen.queryByLabelText(`${dict.rx.rightEye} ${dict.rx.add}`)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(`${dict.rx.leftEye} ${dict.rx.add}`)).not.toBeInTheDocument();
  });

  it('renders ADD with exactly LOW/MID/HIGH for a multifocal product', () => {
    render(<Controlled lensType="multifocal" />);
    const addSelect = screen.getByLabelText(`${dict.rx.rightEye} ${dict.rx.add}`) as HTMLSelectElement;
    const optionValues = within(addSelect)
      .getAllByRole('option')
      .map((o) => (o as HTMLOptionElement).value)
      .filter((v) => v !== '');
    expect(optionValues).toEqual(['LOW', 'MID', 'HIGH']);
  });

  it.each([
    ['clear', 2],
    ['colored', 2],
    ['toric', 2],
    ['multifocal', 4],
  ] as const)(
    'renders no CYL or AXIS control for lens type %s (and exactly %i controls total)',
    (lensType, expectedControlCount) => {
      render(<Controlled lensType={lensType} />);
      expect(allCylAndAxisControls()).toHaveLength(0);
      // Belt-and-suspenders on top of the name-matching check above: pin the
      // total control count too, so a future toric control that dodges the
      // /cyl|axis/i name match (a bare text input, an unlabelled control)
      // still fails this test instead of leaking through silently.
      expect(screen.getAllByRole('combobox')).toHaveLength(expectedControlCount);
    },
  );

  it('offers 0.00 (plano) and does not offer -7.25 in the sph options', () => {
    render(<Controlled lensType="clear" />);
    const sphSelect = screen.getByLabelText(`${dict.rx.rightEye} ${dict.rx.sph}`) as HTMLSelectElement;
    const optionValues = within(sphSelect)
      .getAllByRole('option')
      .map((o) => (o as HTMLOptionElement).value)
      .filter((v) => v !== '');
    expect(optionValues).toContain('0');
    expect(optionValues).not.toContain('-7.25');
  });

  it('mirrors right to left and hides the left control when "same for both eyes" is toggled', async () => {
    const onChange = vi.fn();
    render(<Controlled lensType="clear" onChange={onChange} />);

    const rightSph = screen.getByLabelText(`${dict.rx.rightEye} ${dict.rx.sph}`);
    await userEvent.selectOptions(rightSph, '-2.5');

    const sameCheckbox = screen.getByLabelText(dict.rx.sameBothEyes);
    await userEvent.click(sameCheckbox);

    expect(screen.queryByLabelText(`${dict.rx.leftEye} ${dict.rx.sph}`)).not.toBeInTheDocument();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0] as RxDraft;
    expect(lastCall.sameBothEyes).toBe(true);
    expect(lastCall.left).toEqual(lastCall.right);
    expect(lastCall.left.sph).toBe(-2.5);
  });

  it('renders only the stocked subset when given a narrower ranges prop', () => {
    render(
      <Controlled
        lensType="clear"
        ranges={{ sph: [-1, -2, 0], add: ['LOW', 'MID', 'HIGH'] }}
      />,
    );
    const sphSelect = screen.getByLabelText(`${dict.rx.rightEye} ${dict.rx.sph}`) as HTMLSelectElement;
    const optionValues = within(sphSelect)
      .getAllByRole('option')
      .map((o) => (o as HTMLOptionElement).value)
      .filter((v) => v !== '');
    expect(optionValues.sort()).toEqual(['-1', '-2', '0'].sort());
  });
});
