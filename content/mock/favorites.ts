/**
 * Seeded favorited product ids (M3.4, issue #8), keyed by userId.
 * `p-does-not-exist` proves the silent-omission rule: a favorite whose
 * product has since left the catalog must not appear in the joined list.
 */
export const favorites: Record<string, string[]> = {
  'u-001': ['p-aqua-daily', 'p-hazel-monthly', 'p-does-not-exist'],
  'u-002': ['p-breeze-daily'],
};
