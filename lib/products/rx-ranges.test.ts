import { describe, it, expect } from 'vitest';
import { RX_RANGES, sphSteps, addBands, cylValues, axisSteps } from './rx-ranges';

describe('sphSteps', () => {
  const steps = sphSteps();

  it('offers plano and both correction directions', () => {
    expect(steps).toContain(0);
    expect(steps).toContain(-0.25);
    expect(steps).toContain(-6);
    expect(steps).toContain(-6.5);
    expect(steps).toContain(-10);
    expect(steps).toContain(6);
  });

  it('widens to a 0.50 grid below -6.00', () => {
    // Manufacturers do not make 0.25 increments in high powers, so offering
    // -7.25 would be offering a lens nobody sells.
    expect(steps).not.toContain(-7.25);
    expect(steps).not.toContain(-6.75);
    expect(steps).toContain(-7);
    expect(steps).toContain(-7.5);

    const highPowers = steps.filter((s) => s < -6);
    expect(highPowers.length).toBeGreaterThan(0);
    for (const s of highPowers) {
      expect(Math.abs(Math.round(s * 100) % 50)).toBe(0);
    }
  });

  it('keeps the 0.25 grid between -6.00 and +6.00', () => {
    const normalPowers = steps.filter((s) => s >= -6 && s <= 6);
    expect(normalPowers.length).toBeGreaterThan(0);
    for (const s of normalPowers) {
      expect(Math.abs(Math.round(s * 100) % 25)).toBe(0);
    }
  });

  it('is sorted ascending with no duplicates', () => {
    expect([...steps].sort((a, b) => a - b)).toEqual(steps);
    expect(new Set(steps).size).toBe(steps.length);
  });

  it('emits exact 2-decimal values, not float drift', () => {
    // Accumulating `+= 0.25` yields -2.7500000000000004, which would destabilise
    // every lineKey derived from an Rx.
    for (const s of steps) {
      expect(Number(s.toFixed(2))).toBe(s);
    }
    expect(steps).toContain(-2.75);
  });

  it('never exceeds the specified bounds', () => {
    expect(Math.min(...steps)).toBe(-10);
    expect(Math.max(...steps)).toBe(6);
  });
});

describe('addBands', () => {
  it('is banded, not numeric — contact multifocals ship LOW/MID/HIGH', () => {
    expect(addBands).toEqual(['LOW', 'MID', 'HIGH']);
  });
});

describe('axisSteps', () => {
  it('is 10 through 180 in 10-degree steps', () => {
    const steps = axisSteps();
    expect(steps).toEqual([10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180]);
    expect(steps).toHaveLength(18);
  });
});

describe('cylValues', () => {
  it('is defined even though M2 renders no toric control', () => {
    // Toric is deferred past M2 (spec §15). The data exists so that enabling it
    // later is a selector change, not a cart re-keying.
    expect(cylValues).toEqual([-0.75, -1.25, -1.75, -2.25]);
  });
});

describe('RX_RANGES', () => {
  it('exposes the whole table as data for per-product narrowing', () => {
    expect(RX_RANGES.sph).toEqual(sphSteps());
    expect(RX_RANGES.add).toEqual(addBands);
    expect(RX_RANGES.cyl).toEqual(cylValues);
    expect(RX_RANGES.axis).toEqual(axisSteps());
  });
});
