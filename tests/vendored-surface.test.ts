import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { sourceFiles, isVendored, isTest } from './source-files';

/**
 * `components/ui` is pasted from the shadcn registry (ADR-0016), so anything removed from
 * it comes back the next time someone runs `shadcn add`. A deletion only sticks if a test
 * holds it — the same reason #102 pinned the navigation menu's spelling.
 *
 * This is a denylist, deliberately. The repo tolerates unreachable exports — there are
 * around twenty more — so "nothing imports it" is not by itself a defect here and no
 * general rule would be honest. These three were removed for a reason and are named one
 * by one; `DialogFooter` for the untranslatable "Close" it carried, the other two as the
 * dead surface that came with it (#100).
 */
const REMOVED = ['DialogFooter', 'SheetFooter', 'FieldSeparator'];

describe('deliberately removed primitives', () => {
  it('does not let a registry paste bring them back', () => {
    const returned = sourceFiles()
      .filter((path) => isVendored(path) && !isTest(path))
      .flatMap((path) => {
        const source = readFileSync(path, 'utf8');
        return REMOVED.filter((name) => new RegExp(`\\b${name}\\b`).test(source)).map(
          (name) => `${path}: ${name}`
        );
      });

    expect(
      returned,
      `removed in #100, back from the registry:\n${returned.join('\n')}`
    ).toEqual([]);
  });
});
