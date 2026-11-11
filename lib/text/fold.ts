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
