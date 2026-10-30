import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { sourceFiles, isTest, withoutComments } from './source-files';

/**
 * A variant that matches nothing is worse than no variant: it reads as intent, compiles
 * to nothing, and the behaviour it claims is silently absent.
 *
 * This holds `components/ui`, which the other repo guards exclude as regenerable, because
 * that is where the bug comes from — the registry's class string is pasted in verbatim,
 * and #97 found four of these in one of them.
 */
describe('tailwind variants', () => {
  /**
   * `data-activation-direction=left:` is not Tailwind. An arbitrary data variant needs
   * brackets — `data-[activation-direction=left]:` — and without them Tailwind drops the
   * whole candidate, so the navigation menu's directional slide never ran (#97).
   *
   * The trailing `:` is what separates a variant from a JSX prop: a variant reads
   * `data-invalid=true:border-destructive`, where `<Field data-invalid={…}>` does not.
   */
  it('brackets every data variant that tests a value', () => {
    const unbracketed = sourceFiles()
      .filter((path) => !isTest(path))
      .flatMap((path) => {
        const found = withoutComments(readFileSync(path, 'utf8')).match(/\bdata-[a-z][a-z-]*=[a-z0-9][a-z0-9-]*:/g) ?? [];
        return found.map((variant) => `${path}: ${variant}`);
      });

    expect(
      unbracketed,
      `data variant missing brackets:\n${unbracketed.join('\n')}`
    ).toEqual([]);
  });
});
