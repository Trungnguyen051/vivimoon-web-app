import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { sourceFiles, isVendored, isTest } from './source-files';

/**
 * An icon-only control has no visible text, so its `aria-label` is the whole accessible
 * name. A literal one is therefore untranslatable copy: the Vietnamese storefront used
 * to announce "Previous slide", "Go to slide 1" and "Language" in English (#64). A label
 * built from the dictionary interpolates one, so a literal in any spelling is the bug.
 */
describe('control labels', () => {
  it('builds every aria-label from the dictionary, not a literal', () => {
    // Vendored shadcn primitives keep an English default and take a prop for the real
    // name — `SheetContent`/`DialogContent` take `closeLabel`, `Breadcrumb` an
    // `aria-label` — so they stay close to upstream and regenerable. This holds their
    // call sites instead.
    const literals = sourceFiles()
      .filter((path) => !isVendored(path) && !isTest(path))
      .flatMap((path) => {
        // A literal in any of its JSX spellings: "x", {'x'}, {"x"} and {`x`} with nothing
        // interpolated. Only the last of those looks like an expression; all four are copy.
        const found = readFileSync(path, 'utf8')
          .match(/aria-label=(?:"[^"]+"|\{\s*(?:'[^']+'|"[^"]+"|`[^`$]+`)\s*\})/g) ?? [];
        return found.map((label) => `${path}: ${label}`);
      });

    expect(literals, `hardcoded aria-label:\n${literals.join('\n')}`).toEqual([]);
  });
});
