import { readdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * `.claude` holds this agent harness's own state, including the worktrees it creates for
 * parallel work — a second full checkout of this repo, nested inside it. Walking into one
 * makes every guard here read another branch's working copy as if it were this one, and
 * `isVendored` cannot even exempt it: that test is a `components/ui` prefix, which a path
 * like `.claude/worktrees/x/components/ui/button.tsx` does not have. The guards then fail
 * on code that is not in this tree and may never be.
 */
const SKIP = new Set(['node_modules', '.next', '.git', '.claude', 'graphify-out', 'public', 'docs']);

/**
 * Every `.ts`/`.tsx` in the repo, so neither a component nor a fixture escapes a guard.
 *
 * The guards that walk the tree disagree about two slices of it, and each says which it
 * means at the call site rather than through a flag here: `a11y-labels` exempts the
 * vendored primitives as regenerable, `tailwind-variants` holds them precisely because
 * they are pasted in, and `image-pipeline` checks test files alongside the rest.
 */
export function sourceFiles(dir = '.'): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (SKIP.has(entry.name)) return [];
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(entry.name) ? [path] : [];
  });
}

/** The vendored shadcn primitives, which stay close to upstream so they can be regenerated. */
export const isVendored = (path: string) => path.startsWith('components/ui');

export const isTest = (path: string) => /\.test\.tsx?$/.test(path);

/**
 * A guard that quotes the spelling it bans would fire on its own prose, so the ones that
 * scan for class strings read the source with its comments removed.
 *
 * Anchored to the line start: an unanchored strip would also fire on `/*` inside a string
 * such as `'src/**' + '/*.tsx'`, blanking every class below it and passing vacuously.
 */
export function withoutComments(source: string): string {
  return source.replace(/^[ \t]*\/\*[\s\S]*?\*\//gm, '').replace(/^[ \t]*\/\/.*$/gm, '');
}
