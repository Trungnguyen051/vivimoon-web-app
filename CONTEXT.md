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

**Comparison Tray**:
The persistent, always-visible strip that accumulates a shopper's product selections (up to 4) for comparison as they browse across pages. Distinct from the Comparison Matrix — the tray is the accumulator; the matrix is the side-by-side view it opens.
_Avoid_: Compare list (ambiguous with the matrix)

**Comparison Matrix**:
The side-by-side comparison view (color, diameter, eye-enlargement band, lifespan, price) for up to 4 products, opened from the Comparison Tray.
_Avoid_: Compare page (it's a modal, not a route)

**Lens Viewer**:
The tabbed product-gallery view showing a product across contexts (eye / face / with makeup / without makeup / by natural eye color). Falls back to the standard product gallery for any product lacking gallery entries.
_Avoid_: Gallery alone (ambiguous with the standard gallery it falls back to), Multi-Context Viewer (same concept — Lens Viewer is the shorter canonical form used in §10 of the client-scope spec)

**Quiz**:
The step-by-step questionnaire that scores a shopper's tag-weighted answers into product recommendations. Content (6 questions, tag weights) is provisional pending Vivimoon's real question set.
_Avoid_: Lens-Matching Quiz (same concept — Quiz is the canonical short form)
