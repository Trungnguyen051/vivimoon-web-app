/**
 * The first value of a search param.
 *
 * A repeated param arrives as an array — `?q=lens&q=lens` is one link clicked twice, and
 * a shopper can type it by hand. The first value wins, as elsewhere in the repo.
 *
 * Shared because the alternative is each page remembering: a page that declares
 * `q?: string` and calls `.trim()` on it type-checks, renders fine every time anyone
 * tries it, and throws a 500 the first time a param repeats.
 */
export function firstParam(raw: string | string[] | undefined): string | undefined {
  return Array.isArray(raw) ? raw[0] : raw;
}
