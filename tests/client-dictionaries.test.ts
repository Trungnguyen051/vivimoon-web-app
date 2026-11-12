import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';

/**
 * `[locale]/not-found` and `[locale]/error` are client components, and a client
 * component that imports the dictionaries module puts every locale in the browser
 * bundle. They read their strings from the locale layout instead
 * (`components/layout/boundary-strings.tsx`); this keeps the import from coming back.
 */
describe('client boundaries under [locale]', () => {
  it.each(['app/[locale]/not-found.tsx', 'app/[locale]/error.tsx'])(
    '%s does not import the dictionaries module',
    (path) => {
      expect(readFileSync(path, 'utf8')).not.toMatch(/from ['"]@\/lib\/i18n\/dictionaries/);
    },
  );
});
