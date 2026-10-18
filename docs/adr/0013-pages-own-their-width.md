# Pages own their own width; the locale layout stops wrapping them in a container

**Status:** accepted — not yet implemented. Spec'd during the homepage/wireframe alignment grilling (Q9).

`app/[locale]/layout.tsx` wrapped every route in `<main className="mx-auto w-full max-w-7xl px-4 py-10 md:py-14">`, so no page could render anything edge-to-edge. The homepage wireframe needs a full-bleed hero flush under the header, with the sections below it still guttered — a shape the shared container makes impossible from `page.tsx`.

We considered a `full-bleed` escape hatch instead: `margin-inline: calc(50% - 50vw)` on the hero, leaving the layout untouched. It is one line and changes no other route. We rejected it because `100vw` includes the scrollbar width, so on any desktop browser with a classic scrollbar the hero overflows the viewport and the page scrolls horizontally — a bug that reproduces on Windows far more often than on the machines this is developed on, and whose workarounds (`overflow-x: clip` on an ancestor) break `position: sticky` elsewhere.

Instead `<main>` keeps only its semantics, and a `PageContainer` component carries the width and padding. Every existing route opts in by wrapping its own content; the homepage opts in per-section, leaving the hero outside. The cost is a mechanical edit across ~8 route files and the standing risk that a future page forgets to wrap and renders full-bleed by accident — accepted because the alternative hides a viewport bug behind a utility class, and because page width is genuinely a page's concern once any page needs to break out of it.
