# Vivimoon

A contact-lens and eyewear e-commerce storefront for the Vietnamese market, built as a frontend against a mocked API that mirrors Vivimoon's real backend contract.

## Language

**Voucher**:
A discount currently valid for an account to apply at checkout. Every logged-in member sees the same currently-valid list, filtered by status and expiry — not a personally issued or claimed subset.
_Avoid_: Coupon, promo code, claimed voucher

**Favorites**:
A shopper's saved list of Product references. A favorite whose Product has since left the catalog is silently omitted from the list rather than shown as unavailable.
_Avoid_: Wishlist, saved items

**Address**:
A shopper's saved Vietnamese shipping address (province/district/ward). Exactly one saved Address is the account's default; deleting the default automatically promotes the next most-recently-added remaining Address, so an account with saved Addresses is never left without one.
_Avoid_: Shipping address, delivery address (same concept — Address)

**Rx**:
A shopper's per-eye contact-lens prescription, captured at add-to-cart as line metadata rather than a purchasable product variant. `sph` is always present; `cyl`/`axis` apply only to toric lenses (deferred past M2 — no selector collects them yet, see ADR-0004) and `add` (banded low/mid/high, not a numeric power) only to multifocal lenses. Rx is fully decoupled from the product taxonomy (ADR-0010): the Rx rules branch on their own `rxLensTypeSchema`, and every call site passes the fixed `RX_LENS_TYPE`, so no Product can reach the toric/multifocal branches until a real line for them exists.
_Avoid_: Prescription, power

**Product Line**:
Vivimoon's own lens technology/marketing category for a Product — trong suốt (clear), có màu (colored), or vân nhũ (glitter-textured colored) — matching the real storefront's own 3-way split. The `productLine` field, which replaced the old `type` field (`clear/colored/toric/multifocal`). Orthogonal to Rx: a Product Line never implies anything about prescription complexity (ADR-0010).
_Avoid_: Lens type, category

**Cart Line**:
A single entry in the cart, identified by its variant plus its Rx — not by variant alone. The same lens variant at two different prescriptions is two distinct Cart Lines, each surviving a reload separately.
_Avoid_: Line item, SKU line

**Buy Now**:
A PDP action that takes the shopper's current Rx selection straight to checkout as a single-line cart, leaving their existing Cart untouched.

**Loyalty**:
A per-account points balance and history, credited per placed order. Earn and burn rules are provisional pending Vivimoon's real program design.
_Avoid_: Rewards, points program

**Comparison Tray**:
The persistent, always-visible strip that accumulates a shopper's product selections (up to 4) for comparison as they browse across pages. Distinct from the Comparison Matrix — the tray is the accumulator; the matrix is the side-by-side view it opens.
_Avoid_: Compare list (ambiguous with the matrix)

**Comparison Matrix**:
The side-by-side comparison view (color, diameter, eye-enlargement band, lifespan, price) for up to 4 products, opened from the Comparison Tray.
_Avoid_: Compare page (it's a modal, not a route)

**Eye Enlargement**:
A banded visual-effect rating (natural / subtle / noticeable / dramatic) derived from a lens's graphic diameter — the colored/graphic-zone diameter, distinct from its total diameter — shown only as a Comparison Matrix column — never a stored product attribute (see ADR-0011).
_Avoid_: Enlargement factor, magnification

**Lens Viewer**:
The tabbed product-gallery view showing a product across contexts (eye / face / with makeup / without makeup / by natural eye color). Falls back to the standard product gallery for any product lacking gallery entries.
_Avoid_: Gallery alone (ambiguous with the standard gallery it falls back to), Multi-Context Viewer (same concept — Lens Viewer is the shorter canonical form used in §10 of the client-scope spec)

**Quiz**:
The step-by-step questionnaire that scores a shopper's tag-weighted answers into product recommendations. Content (6 questions, tag weights) is provisional pending Vivimoon's real question set.
_Avoid_: Lens-Matching Quiz (same concept — Quiz is the canonical short form)

**Trust Badge**:
One of the four promises the homepage states beneath VIVIMOON TV — authenticity, free consultation, 30-day returns, express delivery. A Trust Badge is a claim Vivimoon stands behind rather than a feature of the storefront, so its wording comes from Vivimoon and the evidence for it is theirs; the same is true of the regulatory line in the announcement bar.
_Avoid_: USP strip, trust signals, guarantees

**Article**:
One editorial piece behind the homepage's Kiến thức section, with a title, excerpt and body in every supported locale. Unlike UI copy, an Article's translations live with the content in the fixtures rather than in the dictionary — an article is authored as a whole in each language, and a dictionary key per paragraph would not scale. Its body is plain paragraphs, not markup, so rendering needs no parser. Articles reference no Product, which is why `editorial` is its own resource key rather than part of `discovery`.
_Avoid_: Post, blog entry, news item

**Color Family**:
A named group of catalog colors used as a merchandising entry point on the homepage — Nâu, Đen, Xám, and Màu sắc nổi bật ("standout colors", which gathers every vivid color rather than naming one). A Color Family is a browsing concept only: it has no field on a Product or Variant, which each still carry one `color`. Its homepage tile shows up to three swatches and links into the colored-lens collection filtered to that family's colors. The swatches illustrate the family rather than define it: the `colors` are the filter, and while the catalog is provisional the swatches may name shades Vivimoon intends to carry but does not yet stock.
_Avoid_: Color group, swatch group, palette

**Không màu**:
The fifth tile in the homepage's Color Family row, and deliberately not a Color Family: it selects the trong suốt Product Line by the _absence_ of color rather than by a set of colors, so it has no swatches and opens the clear lenses rather than a filtered colored-lens collection. It shares the row because a shopper choosing how their eyes should look is equally choosing not to change them.
_Avoid_: Clear family, colorless family (it is a Product Line, not a Color Family)
