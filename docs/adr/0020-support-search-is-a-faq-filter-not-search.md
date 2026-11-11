# The Support search box filters FAQ Entries; it is not storefront search

**Status:** accepted — settled during the Support-section grill. Not yet implemented.

This storefront has no search. The header draws a search affordance that opens an input with, in its own words, "no form and no submit handler, deliberately: there is no search" (`components/layout/header.tsx`). The Support design puts a second search box on the hub — "Tìm: cách tháo lens, đổi trả, chọn DIA…" — and a third on the FAQ page.

Shipping two more inert boxes was rejected: one dead search affordance is a known gap, three is a pattern, and a shopper who types into the hub's hero and gets nothing has been actively misled at the moment they asked for help. Building real search was also rejected — an index over products, articles, guides and FAQ entries is a feature with its own spec, and this one is about a help section.

So the box is real but narrow. It submits to `/support/faq?q=…`, and the FAQ page filters its entries server-side on the query, matching question text and short answer. This reuses the URL-as-state pattern `CollectionFilters` already established, needs no index and no client state, works without JavaScript, and makes the hub's "Hay được hỏi" chips ordinary links carrying a `?q=`. A query replaces the active Topic rather than narrowing within it: searching and browsing are different modes, and a sidebar reporting counts under an active query reads as broken.

Matching stops at the short answer and does not reach the full answer body. A result whose match is invisible until the reader expands the row looks like a wrong result.

## Consequences

A reader can search the FAQ and nothing else. Typing a product name into the Support hero returns nothing, which is correct for what this box is and surprising for what it looks like — the placeholder copy does the work of setting that expectation, and it is the first thing to revisit if the gap bites. When storefront-wide search is eventually built, this box should be absorbed into it rather than kept alongside; the `?q=` route is a filter on one page, not an API anyone should build on.
