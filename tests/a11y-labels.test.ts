import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const SKIP = new Set(['node_modules', '.next', '.git', 'graphify-out', 'public', 'docs']);

/**
 * Vendored shadcn primitives keep an English default and take a prop for the real
 * name — `SheetContent`/`DialogContent` take `closeLabel`, `Breadcrumb` an `aria-label`
 * — so they stay close to upstream and regenerable. The call sites are what this holds.
 */
const VENDORED = 'components/ui';

function sourceFiles(dir = '.'): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (SKIP.has(entry.name)) return [];
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    if (path.startsWith(VENDORED)) return [];
    return /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [path] : [];
  });
}

/**
 * An icon-only control has no visible text, so its `aria-label` is the whole accessible
 * name. A literal one is therefore untranslatable copy: the Vietnamese storefront used
 * to announce "Previous slide", "Go to slide 1" and "Language" in English (#64). A label
 * built from the dictionary interpolates one, so a literal in any spelling is the bug.
 */
describe('control labels', () => {
  it('builds every aria-label from the dictionary, not a literal', () => {
    const literals = sourceFiles().flatMap((path) => {
      // A literal in any of its JSX spellings: "x", {'x'}, {"x"} and {`x`} with nothing
      // interpolated. Only the last of those looks like an expression; all four are copy.
      const found = readFileSync(path, 'utf8')
        .match(/aria-label=(?:"[^"]+"|\{\s*(?:'[^']+'|"[^"]+"|`[^`$]+`)\s*\})/g) ?? [];
      return found.map((label) => `${path}: ${label}`);
    });

    expect(literals, `hardcoded aria-label:\n${literals.join('\n')}`).toEqual([]);
  });
});
