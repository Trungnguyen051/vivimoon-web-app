import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import nextConfig from '../next.config';

const SKIP = new Set(['node_modules', '.next', '.git', 'graphify-out', 'public', 'docs']);

/** Every .tsx in the repo, so a component in a directory nobody listed is still checked. */
function sourceFiles(dir = '.'): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (SKIP.has(entry.name)) return [];
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return entry.name.endsWith('.tsx') ? [path] : [];
  });
}

/** `<Image … />` tags, and how many openings were found — they differ when a tag resists this match. */
function imageTags(source: string) {
  return {
    tags: source.match(/<Image\b[^>]*?\/>/g) ?? [],
    openings: (source.match(/<Image\b/g) ?? []).length,
  };
}

/** The `fill` prop, not the word anywhere in the tag — `className="fill-current"` is not it. */
const usesFill = (tag: string) => /\sfill(\s|=|\/|>|$)/.test(tag);

/**
 * The optimizer is what makes every `sizes` prop in the codebase mean anything
 * (ADR-0014). Turning it back off would silently return the site to shipping
 * full-size assets to phones, with no test or type failing — only the bytes change.
 */
describe('image pipeline', () => {
  it('leaves Next image optimization enabled', () => {
    expect(nextConfig.images?.unoptimized).not.toBe(true);
  });

  /**
   * A fill image has no intrinsic width, so without `sizes` Next assumes `100vw` and
   * picks its largest candidate — close to shipping the unoptimized file again.
   */
  it('gives every fill image a sizes prop', () => {
    const offenders = sourceFiles().flatMap((path) =>
      imageTags(readFileSync(path, 'utf8')).tags
        .filter((tag) => usesFill(tag) && !tag.includes('sizes='))
        .map(() => path),
    );

    expect(offenders, `fill <Image> without sizes in:\n${offenders.join('\n')}`).toEqual([]);
  });

  /**
   * The check above reads tags with a regex that stops at the first `>`, so a prop
   * containing one — `priority={i > 0}`, `onLoad={() => …}` — hides its whole tag and
   * the check passes while seeing nothing. Rather than leave that silent, every
   * opening must be one this can read.
   */
  it('can read every Image tag it is supposed to check', () => {
    const unreadable = sourceFiles().filter((path) => {
      const { tags, openings } = imageTags(readFileSync(path, 'utf8'));
      return tags.length !== openings;
    });

    expect(unreadable, `<Image> tags the sizes check cannot parse in:\n${unreadable.join('\n')}`).toEqual([]);
  });
});
