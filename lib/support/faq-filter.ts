import type { FaqEntry, Topic } from '@/lib/api/schemas/support';
import { foldedIncludes } from '@/lib/text/fold';

/**
 * What the FAQ page's two controls add up to (#120).
 *
 * A query and a Topic are the same URL state, so they are read together here rather
 * than by the sidebar and the box separately — two controls that filtered in sequence
 * would each be right about their own half and wrong about the page.
 *
 * Pure, and over entries rather than over the resource, so both rules below are checked
 * without a DOM and without fixtures standing in for them.
 */
export type FaqQuery = { q?: string; category?: Topic | null };

/**
 * Question and short answer, in every locale.
 *
 * Not the full answer. A match a reader cannot see without expanding the row reads as a
 * wrong result rather than a found one — the row would claim a relevance nothing on it
 * shows (ADR-0020). Every locale, so a search never depends on which one is open.
 */
function searchable(entry: FaqEntry): string[] {
  return [...Object.values(entry.question), ...Object.values(entry.shortAnswer)];
}

export function filterFaqEntries(entries: FaqEntry[], { q, category }: FaqQuery): FaqEntry[] {
  // Trimmed, so a box holding only spaces is no query at all — typing and clearing has
  // to give the whole list back rather than an empty page.
  const term = q?.trim();

  /* A query *replaces* the active Topic rather than narrowing within it. Searching and
     browsing are different modes: narrowing inside a Topic would hide answers a reader
     can plainly see are relevant, and a sidebar reporting counts under a live query
     reads as broken. The sidebar stays visible either way — it is how a reader leaves
     the query. */
  if (term) return entries.filter((entry) => foldedIncludes(searchable(entry), term));

  return category ? entries.filter((entry) => entry.topic === category) : [...entries];
}
