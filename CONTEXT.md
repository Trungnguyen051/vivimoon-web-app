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
A shopper's per-eye contact-lens prescription, captured at add-to-cart as line metadata rather than a purchasable product variant. `sph` is always present; `cyl`/`axis` apply only to toric lenses and `add` (banded low/mid/high, not a numeric power) only to multifocal lenses.
_Avoid_: Prescription, power

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
A banded visual-effect rating (natural / subtle / noticeable / dramatic) derived from a lens's diameter, shown only as a Comparison Matrix column — never a stored product attribute.
_Avoid_: Enlargement factor, magnification

**Lens Viewer**:
The tabbed product-gallery view showing a product across contexts (eye / face / with makeup / without makeup / by natural eye color). Falls back to the standard product gallery for any product lacking gallery entries.
_Avoid_: Gallery alone (ambiguous with the standard gallery it falls back to), Multi-Context Viewer (same concept — Lens Viewer is the shorter canonical form used in §10 of the client-scope spec)

**Quiz**:
The step-by-step questionnaire that scores a shopper's tag-weighted answers into product recommendations. Content (6 questions, tag weights) is provisional pending Vivimoon's real question set.
_Avoid_: Lens-Matching Quiz (same concept — Quiz is the canonical short form)
