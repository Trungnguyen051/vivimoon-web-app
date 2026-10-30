import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Field, FieldContent, FieldDescription } from '@/components/ui/field';

/**
 * `FieldDescription` balances its line breaks only inside a horizontal field, and the
 * rule meant to do it had never once applied (#98).
 *
 * The cause is not the one the issue names. `data-horizontal` does resolve — not as a
 * Tailwind built-in but as a shadcn `@custom-variant` for `[data-orientation="horizontal"]`
 * (`shadcn/tailwind.css`, imported by `app/globals.css`), and that is the attribute
 * `Field` emits. What was wrong is `has-`: it probes the group's *descendants*, while
 * the orientation sits on the group element itself, so the `:has()` never found it.
 * Compiled, the old spelling asked for
 * `:where(.group\/field):has(:where([data-orientation="horizontal"])) *` where it wanted
 * `:where(.group\/field)[data-orientation="horizontal"] *`.
 *
 * Upstream shadcn still probes descendants, so a regenerated `field.tsx` would bring the
 * dead rule back. `tailwind-variants` guards that spelling across every vendored file;
 * this holds the one element it was costing, and pins the bracketed spelling the other
 * primitives use.
 */
describe('a horizontal field description', () => {
  it('asks the field group for its orientation rather than its descendants', () => {
    const { getByTestId } = render(
      <Field orientation="horizontal">
        <FieldContent>
          <FieldDescription data-testid="description">Giao hàng trong 2–3 ngày</FieldDescription>
        </FieldContent>
      </Field>
    );

    const balancing = [...getByTestId('description').classList].filter((name) =>
      name.includes('text-balance')
    );

    expect(balancing).toEqual(['group-data-[orientation=horizontal]/field:text-balance']);
  });
});
