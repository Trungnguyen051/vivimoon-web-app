# Cart Lines carry a Purchase Unit; a lens is priced per single lens

**Status:** accepted. Settled during the buying-flow grill (Figma "Luồng mua hàng", node 29:32, designer note "Rule 'Mua theo'").

Until now a lens Cart Line always carried a two-eye Rx and cost `variant.price × quantity`, so "one" of something silently meant a pair. The wireframe prices every lens per single lens ("95.000₫ / chiếc") and lets the shopper buy **1 chiếc** (one `sph`, no eye) or **1 đôi** (left and right `sph`, priced ×2). Shoppers do buy single lenses, for example when only one eye needs correcting or one lens is lost.

We considered:
- Keeping one line per pair and only relabelling it. That makes a single lens impossible to buy.
- Splitting a pair into two single-lens lines. The cart, orders and the "1 đôi · L/R" summary would then have to re-pair them.

We chose to put a **Purchase Unit** (`single` | `pair`) on the Cart Line:
- It is part of the line's identity, alongside the variant and the Rx.
- Quantity counts units, not lenses.
- The server prices a pair at twice the per-lens price. The client never computes this (ADR-0003).
- A `single` line's Rx holds one `sph` with no eye attached.

## Consequences

- Lines already persisted on devices predate this decision. They have a two-eye Rx, so they are read as `pair`, which is what they always meant.
- Accessories have no Purchase Unit.
- Changing a line's unit or power in the cart re-keys it. If an identical line already exists, the two merge.
- `lineKey`, the price request, the order line and every line summary ("1 chiếc · −2.50" / "1 đôi · L −2.50 · R −3.00") all change shape together.
