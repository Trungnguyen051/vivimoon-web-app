/**
 * Lowercased and stripped of tone marks, so a search matches the way people actually
 * type. Vietnamese is written without diacritics far more often than with them — on a
 * phone keyboard that is the default — and "ky yeu" has to find "kỷ yếu".
 *
 * `đ` needs saying separately: it is a letter in its own right rather than `d` carrying
 * a mark, so NFD does not decompose it and `'Đ'.toLowerCase()` yields `'đ'`, not `'d'`.
 *
 * Shared rather than copied. The Knowledge index and the FAQ page both search authored
 * Vietnamese, and two foldings that drift would mean the same query finding a lens
 * article but not the answer about lenses — with nothing failing to say so. Both sides
 * of every comparison fold through here, which is what keeps it symmetric.
 */
export function fold(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/đ/g, 'd');
}

/**
 * Whether any one of these values contains the term, folded on both sides.
 *
 * Each value is tested on its own rather than joined into one string first. A plain
 * `includes` over a join matches across the seam — with a question ending "…hurt?" and
 * a short answer beginning "Không đau…", the query `hurt? Không đau` matches a row on
 * which that phrase appears nowhere. Which is precisely the wrong-result the
 * match-scope rules exist to avoid, arriving by the back door.
 */
export function foldedIncludes(values: string[], term: string): boolean {
  const needle = fold(term);
  return values.some((value) => fold(value).includes(needle));
}

/**
 * Every locale's text across these fields, which is what a search looks in.
 *
 * Every locale rather than the one being rendered, so a search never depends on which
 * storefront is open — and shared, because the Knowledge index and the FAQ page both
 * flatten `LocalizedText` this way. *Which* fields to flatten stays with each caller:
 * that choice is a judgement about what a reader can see on the row claiming the
 * match, and the two have different answers.
 */
export function localizedValues(...fields: Record<string, string>[]): string[] {
  return fields.flatMap((field) => Object.values(field));
}

/**
 * A search term, or `null` when there is nothing to filter by.
 *
 * Trimmed, so a box holding only spaces is no filter at all — typing and clearing has
 * to give the whole list back rather than an empty page.
 */
export function searchTerm(raw: string | undefined): string | null {
  return raw?.trim() || null;
}
