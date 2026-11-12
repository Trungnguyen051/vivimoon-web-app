# Order lookup is by order code alone, shown inline

**Status:** accepted — supersedes ADR-0006. Settled during the Track Order redesign grill (Figma "Tra cứu đơn hàng", node 29:28).

ADR-0006 made guest tracking an emailed link: `POST /api/orders/track` took a code plus phone/email, always answered with the same acknowledgement, and the order itself was only ever shown behind a signed, expiring token. That closed the enumeration oracle, at the cost of a lookup page that could never say "not found" and never showed the order itself.

The wireframe asks for the opposite: one order-code field, the order rendered inline under it — recipient, phone and address included — and an explicit "Không tìm thấy đơn hàng" state naming the code typed. Three alternatives were weighed and rejected: keeping ADR-0006 and only restyling (loses the inline result and the not-found state the design is built around), code plus phone/email (one extra field the design does not have), and a member-only code lookup with guests kept on the emailed link (two flows for one page).

So anyone holding an order code can read that order — a member's order as much as a guest's, signed in or not. The lookup answers with the order minus its owner, email and payment. What keeps this tolerable is that order codes stay random rather than sequential (`VVM-` + 16 CSPRNG base32 characters — 80 bits, typeable yet unguessable; spec §10): a code is a bearer secret, not a counter. **Never make order codes sequential or guessable** — with this ADR in place, that change alone would turn the lookup into an address-harvesting oracle.

## Consequences

The emailed tracking link, its token route and its token page are removed; checkout still collects an email (order confirmation needs it). A not-found answer now distinguishes "no such code" from "found", which is accepted. The result lives at `?code=` (shareable, refreshable), so the code also lands in browser history and server logs — accepted; the page sets `referrer: no-referrer` so it never leaks through a Referer header. Rate limiting the lookup is the first mitigation to add once anything is upstream.
