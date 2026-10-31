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

  /**
   * Orientation is not a thing a field *contains*, it is a thing a field *is*. Every
   * primitive here puts `data-orientation` on the element that opens the group, so a
   * variant reaching for it through `has-` searches that element's descendants and finds
   * nothing — `field.tsx` styled a description this way and the rule never ran once (#98).
   *
   * The spelling compiles, which is why the bracket guard above sails past it:
   * `data-horizontal` is a shadcn `@custom-variant` for `[data-orientation="horizontal"]`,
   * not a dead attribute. Only the `has-` is wrong. Upstream still ships it, so this holds
   * every vendored file against a fresh registry paste.
   *
   * All three spellings of the same mistake are caught, because the registry writes the
   * attribute every one of these ways elsewhere in this directory: the custom variant
   * (`has-data-horizontal`), the bracketed attribute (`has-data-[orientation=horizontal]`,
   * the form `has-data-[icon=…]` and `has-data-[slot=…]` already use eighteen times here),
   * and the doubled-bracket selector (`has-[[data-orientation=…]]`) upstream still ships.
   *
   * A `has-` probe for anything else — the icon in `alert.tsx` — is a real descendant
   * query and is left alone.
   */
  it('reads orientation off the group rather than hunting for it underneath', () => {
    const probing = sourceFiles()
      .filter((path) => !isTest(path))
      .flatMap((path) => {
        const found =
          withoutComments(readFileSync(path, 'utf8')).match(
            /has-(?:data-(?:horizontal|vertical)\b|data-\[orientation=|\[\[data-orientation)/g
          ) ?? [];
        return found.map((variant) => `${path}: ${variant}`);
      });

    expect(
      probing,
      `orientation probed through has-, which never matches:\n${probing.join('\n')}`
    ).toEqual([]);
  });
});
