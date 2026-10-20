import { notFound } from 'next/navigation';

/**
 * Exists only to lose. A segment-level `not-found` catches a thrown `notFound()`,
 * never an unmatched URL — those go straight to the *root* boundary, which renders
 * outside the locale layout and so without the header and footer. Routing an
 * unmatched path through a catch-all that throws is what puts `/vi/anything` back
 * inside the locale segment, where `[locale]/not-found.tsx` can answer it in the
 * shopper's language with the storefront still around them.
 *
 * It only ever matches what nothing else does: Next prefers static and dynamic
 * segments over a catch-all, so every real route still wins, and a bad slug on a
 * real route keeps throwing its own `notFound()`.
 *
 * This is the stable-API alternative to experimental `global-not-found`, which the
 * Next docs suggest for a `[locale]` root layout but which bypasses the layout
 * entirely — the opposite of what this ticket wants (#73).
 */
export default function CatchAllNotFound(): never {
  notFound();
}
