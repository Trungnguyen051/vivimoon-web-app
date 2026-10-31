import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { sourceFiles, isVendored, withoutComments } from './source-files';

/**
 * `buttonVariants` topped out at `lg`, nine units tall, so every large call-to-action on
 * the site stated its own height instead — the empty-cart and checkout-success links one
 * way, sixteen form submits another. Eighteen call sites spelling a size the design
 * system did not offer (#99).
 *
 * The order summary showed why it matters: its disabled branch rendered a `Button` and
 * its enabled branch a `Link`, each carrying the same override separately, so one control
 * stated its size twice and nothing kept the two in step.
 *
 * `size="xl"` now covers it. A height paired with `text-base` in one class string is the
 * shape of the bug, and that pairing is what this looks for. `min-h-11` on a navigation
 * row is a touch target rather than a button, so the height must not be preceded by a
 * word character or a dash.
 *
 * This reads test files too — a CTA in a fixture is still a CTA — which is why it strips
 * comments first, including its own.
 */
describe('large call-to-action buttons', () => {
  it('take their size from buttonVariants rather than spelling it', () => {
    const handRolled = sourceFiles()
      .filter((path) => !isVendored(path))
      .flatMap((path) => {
        const source = withoutComments(readFileSync(path, 'utf8'));
        return [...source.matchAll(/(?:"|'|`)([^"'`\n]*\btext-base\b[^"'`\n]*)(?:"|'|`)/g)]
          .filter((match) => /(?<![\w-])h-\d\d?\b/.test(match[1]))
          .map((match) => `${path}: ${JSON.stringify(match[1])}`);
      });

    expect(
      handRolled,
      `CTA size spelled by hand, use size="xl":\n${handRolled.join('\n')}`
    ).toEqual([]);
  });
});
