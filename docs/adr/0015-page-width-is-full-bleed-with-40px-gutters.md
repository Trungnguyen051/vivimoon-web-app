# Pages run full-bleed with 40px gutters; `PageContainer` no longer caps at `max-w-7xl`

**Status:** accepted — not yet implemented; lands with the header redesign (#69).

ADR-0013 moved width ownership out of the locale layout and into a `PageContainer` every route opts into. It settled *who* owns the width; it did not settle *what* the width is, and `PageContainer` has carried `max-w-7xl px-4` (1280px cap, 16px gutters) ever since.

The Figma design (file `9bTKBHv3tf3aJy1EhnJc4i`, frame `38:1484` "Sản phẩm Tổng quan") draws every band of the page — header, announcement bar, sections, footer — edge-to-edge at 1440 with content inset 40px. Nothing in it caps. Matching the header alone would have put a full-bleed bar above a 1280px-capped body and footer, which is a visible seam at any viewport above 1280px, so the four move together: `Header`, `AnnouncementBar`, `Footer` and `PageContainer`.

We considered holding `PageContainer` at `max-w-7xl` and changing only the chrome. We rejected it because the seam it leaves is exactly the mismatch this work exists to remove, and because `PageContainer` is a single component — the change is one line, not an edit across the 21 routes that consume it.

## Consequences

Every route widens with the viewport. On a 2560px monitor the body becomes 2480px wide, which is fine for product grids and poor for the text-heavy routes — checkout, account, article bodies — where line length runs well past comfortable reading width. That is accepted here rather than solved: a measure cap on those specific routes is follow-up work, and belongs to them rather than to the shared container. A future reader who finds `PageContainer` uncapped and assumes it is an oversight should read this first.

The design is a wireframe, not a finished visual spec. Its gutter value is adopted; its typography deliberately is not (see #69) — so the 40px here is expected to survive the final design in a way that the type metrics are not.
